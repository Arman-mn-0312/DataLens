import time
import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from reports.datatype import generate_datatype_report

frame = pd.read_csv(Path(__file__).parent / "datasets" / "clean_1k_20c.csv")
started = time.perf_counter()
generate_datatype_report(frame)
print(f"seconds={time.perf_counter() - started:.6f}")
