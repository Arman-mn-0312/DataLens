#!/usr/bin/env python3
"""
DataLens Enterprise Launcher
============================
One-command startup launcher for DataLens project.
Performs pre-flight environment verification, starts backend & frontend,
waits for service readiness, and opens the application in the web browser.
"""

import sys
import os
import time
import shutil
import socket
import signal
import importlib.util
import subprocess
import webbrowser
from typing import List, Optional
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "frontend"
VENV_DIR = BASE_DIR / ".venv"

# Subprocesses list for clean teardown
processes: List[subprocess.Popen[bytes]] = []


# Reconfigure stdout to UTF-8 on Windows terminals if necessary
reconfig = getattr(sys.stdout, "reconfigure", None)
if callable(reconfig):
    try:
        reconfig(encoding="utf-8")
    except Exception:
        pass


# Safe symbols for cross-platform console output
def get_check_symbol() -> str:
    try:
        encoding = getattr(sys.stdout, "encoding", None) or "utf-8"
        "✓".encode(encoding)
        return "✓"
    except (UnicodeEncodeError, AttributeError):
        return "[OK]"


def get_error_symbol() -> str:
    try:
        encoding = getattr(sys.stdout, "encoding", None) or "utf-8"
        "❌".encode(encoding)
        return "❌"
    except (UnicodeEncodeError, AttributeError):
        return "[ERROR]"


def print_banner() -> None:
    print("-" * 40)
    print("Starting DataLens...")
    print("-" * 40)
    print()


def print_success_footer() -> None:
    print()
    print("-" * 40)
    print("DataLens Started Successfully")
    print("-" * 40)
    print()
    print("Backend:")
    print("http://127.0.0.1:5000")
    print()
    print("Frontend:")
    print("http://localhost:3000")
    print()


def cleanup(signum: Optional[int] = None, frame: Optional[object] = None, exit_code: int = 0) -> None:
    for proc in processes:
        if proc and proc.poll() is None:
            try:
                if sys.platform == "win32":
                    subprocess.call(
                        ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL
                    )
                else:
                    proc.terminate()
            except Exception:
                pass
    sys.exit(exit_code)


def error_exit(message: str, hint: Optional[str] = None) -> None:
    print(f"\n{get_error_symbol()} {message}")
    if hint:
        print(f"   💡 {hint}\n")
    cleanup(exit_code=1)


def get_python_executable() -> str:
    # 1. If currently executing inside an active virtual environment, use sys.executable
    if getattr(sys, "base_prefix", sys.prefix) != sys.prefix or "VIRTUAL_ENV" in os.environ:
        return sys.executable

    # 2. Check for .venv in workspace root
    win_venv_python = VENV_DIR / "Scripts" / "python.exe"
    unix_venv_python = VENV_DIR / "bin" / "python"

    if win_venv_python.exists():
        return str(win_venv_python)
    elif unix_venv_python.exists():
        return str(unix_venv_python)

    return sys.executable


def check_python_environment() -> None:
    if sys.version_info < (3, 8):
        error_exit(
            "Python 3.8 or higher is required.",
            f"Current version: {sys.version.split()[0]}"
        )
    print(f"{get_check_symbol()} Checking Python Environment")


def check_virtual_environment() -> None:
    win_venv_python = VENV_DIR / "Scripts" / "python.exe"
    unix_venv_python = VENV_DIR / "bin" / "python"

    in_venv = (
        getattr(sys, "base_prefix", sys.prefix) != sys.prefix
        or "VIRTUAL_ENV" in os.environ
        or win_venv_python.exists()
        or unix_venv_python.exists()
    )
    if not in_venv:
        error_exit(
            "Virtual environment not found",
            "Please create a virtual environment at '.venv' or activate your venv."
        )
    print(f"{get_check_symbol()} Checking Virtual Environment")


def check_flask() -> None:
    py_exec = get_python_executable()
    res = subprocess.run(
        [py_exec, "-c", "import flask; import flask_cors"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    if res.returncode != 0:
        error_exit(
            "Flask not installed",
            "Please install backend dependencies: pip install -r requirements.txt"
        )
    print(f"{get_check_symbol()} Checking Flask")


def check_node() -> None:
    node_path = shutil.which("node")
    if not node_path:
        error_exit(
            "Node.js not installed",
            "Please install Node.js (https://nodejs.org/) to run the frontend."
        )
    print(f"{get_check_symbol()} Checking Node.js")


def check_npm_packages() -> None:
    npm_path = shutil.which("npm") or shutil.which("npm.cmd")
    if not npm_path:
        error_exit(
            "npm not installed",
            "npm binary was not found in PATH."
        )
    
    node_modules_dir = FRONTEND_DIR / "node_modules"
    if not node_modules_dir.exists():
        error_exit(
            "frontend/node_modules missing",
            "Please run 'npm install' inside the 'frontend' directory."
        )
    print(f"{get_check_symbol()} Checking npm Packages")


def is_port_open(host: str, port: int) -> bool:
    hosts_to_try = [host]
    if host == "localhost":
        hosts_to_try.append("127.0.0.1")
    elif host in ("127.0.0.1", "0.0.0.0"):
        hosts_to_try.append("localhost")

    for h in hosts_to_try:
        try:
            with socket.create_connection((h, port), timeout=1):
                return True
        except (OSError, ConnectionRefusedError):
            pass
    return False


def wait_for_service(host: str, port: int, service_name: str, timeout: int = 30) -> None:
    start_time = time.time()
    while time.time() - start_time < timeout:
        if is_port_open(host, port):
            return
        time.sleep(0.5)
    error_exit(
        f"{service_name} failed to start on {host}:{port} within {timeout} seconds."
    )


def start_flask_backend() -> None:
    app_py = BASE_DIR / "app.py"
    if not app_py.exists():
        error_exit("app.py not found in project root directory.")
    
    py_exec = get_python_executable()

    # Launch Flask backend
    backend_proc = subprocess.Popen(
        [py_exec, str(app_py)],
        cwd=str(BASE_DIR),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE
    )
    processes.append(backend_proc)

    # Check if process died immediately
    time.sleep(0.5)
    if backend_proc.poll() is not None:
        stderr_output = backend_proc.stderr.read().decode("utf-8", errors="replace") if backend_proc.stderr is not None else ""
        error_exit(
            "Flask backend failed to start immediately.",
            stderr_output.strip()
        )
    
    wait_for_service("127.0.0.1", 5000, "Flask Backend")
    print(f"{get_check_symbol()} Starting Flask Backend")


def start_react_frontend() -> None:
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=str(FRONTEND_DIR),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE
    )
    processes.append(frontend_proc)

    # Check if process died immediately
    time.sleep(0.5)
    if frontend_proc.poll() is not None:
        stderr_output = frontend_proc.stderr.read().decode("utf-8", errors="replace") if frontend_proc.stderr is not None else ""
        error_exit(
            "React frontend failed to start immediately.",
            stderr_output.strip()
        )

    wait_for_service("localhost", 3000, "React Frontend")
    print(f"{get_check_symbol()} Starting React Frontend")


def open_browser() -> None:
    try:
        webbrowser.open("http://localhost:3000")
        print(f"{get_check_symbol()} Opening Browser")
    except Exception as e:
        print(f"⚠️  Could not launch web browser automatically: {e}")


def main() -> None:
    # Register signal handlers for clean teardown
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    print_banner()

    # Pre-flight environment verifications
    check_python_environment()
    check_virtual_environment()
    check_flask()
    check_node()
    check_npm_packages()

    # Service startup
    start_flask_backend()
    start_react_frontend()
    open_browser()

    print_success_footer()

    # Keep script running to maintain child processes until interrupted
    try:
        while True:
            time.sleep(1)
            # Monitor if child processes crash unexpectedly
            for proc in processes:
                if proc.poll() is not None:
                    err_msg = proc.stderr.read().decode("utf-8", errors="replace") if proc.stderr is not None else ""
                    error_exit("A DataLens service stopped unexpectedly.", err_msg)
    except KeyboardInterrupt:
        print("\nStopping DataLens services...")
        cleanup()


if __name__ == "__main__":
    main()
