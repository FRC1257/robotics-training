#!/usr/bin/env python3
"""Extract a sparse, long-form sample from the pinned 2024 robot log.

Usage: python extract_log.py downloaded.wpilog > excerpt.csv
Requires robotpy-wpiutil==2026.2.2. Times are native log timestamps in microseconds.
"""
import csv
import hashlib
import sys
from pathlib import Path
from wpiutil.log import DataLogReader

EXPECTED = "c7f2dc5800d92954f97868c248aca14ee95c2969064c2c38b8ade6a7717b7d9e"
FIELDS = {"/SystemStats/BatteryVoltage": "double", "/Drive/Module0/DriveVelocityRadPerSec": "double", "/DriverStation/Enabled": "boolean"}
path = Path(sys.argv[1])
if hashlib.sha256(path.read_bytes()).hexdigest() != EXPECTED:
    raise SystemExit("Input hash differs from pinned source; extraction stopped")
reader = DataLogReader(str(path))
if not reader.isValid():
    raise SystemExit("Invalid WPILOG")
entries = {}
last = {}
out = csv.writer(sys.stdout, lineterminator="\n")
out.writerow(["timestamp_us", "signal", "value", "type"])
for record in reader:
    if record.isStart():
        data = record.getStartData()
        if data.name in FIELDS and data.type == FIELDS[data.name]:
            entries[data.entry] = (data.name, data.type)
    elif not record.isControl() and record.getEntry() in entries:
        name, kind = entries[record.getEntry()]
        timestamp = record.getTimestamp()
        # Preserve every enabled transition; sample each numeric stream at most once per second.
        if kind == "boolean" or timestamp - last.get(name, -1_000_000) >= 1_000_000:
            value = record.getBoolean() if kind == "boolean" else record.getDouble()
            out.writerow([timestamp, name, value, kind])
            last[name] = timestamp
