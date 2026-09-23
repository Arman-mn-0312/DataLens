import os
import sys
import time

sys.path.insert(0, os.path.abspath('.'))

from flask import Flask
from auth.repository import UserRepository
from auth.service import AuthService
from database.mongodb import MongoDB

def benchmark():
    os.environ["JWT_SECRET_KEY"] = "benchmark-secret-key"
    app = Flask(__name__)
    app.config["TESTING"] = True
    
    t0 = time.perf_counter()
    repo = UserRepository(allow_fallback=True)
    t1 = time.perf_counter()
    print(f"UserRepository init time: {(t1 - t0)*1000:.2f} ms")

    service = AuthService(repository=repo)
    
    email = f"test_{int(time.time())}@example.com"
    t0 = time.perf_counter()
    res, status = service.register_user("Test User", email, "Password123!")
    t1 = time.perf_counter()
    print(f"Register user time: {(t1 - t0)*1000:.2f} ms (Status: {status})")

    t0 = time.perf_counter()
    res2, status2 = service.login_user(email, "Password123!")
    t1 = time.perf_counter()
    print(f"Login user time: {(t1 - t0)*1000:.2f} ms (Status: {status2})")

if __name__ == "__main__":
    benchmark()
