#!/usr/bin/env python3
"""
AryaSaarthi — Ask Arya Live Judge Demonstration (Backend Wrapper)
"""
import os
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SCRIPT_PATH = os.path.join(ROOT_DIR, "scripts", "judge_demo.py")

if __name__ == "__main__":
    if os.path.exists(SCRIPT_PATH):
        with open(SCRIPT_PATH, "r", encoding="utf-8") as f:
            code = compile(f.read(), SCRIPT_PATH, 'exec')
            exec(code, globals())
    else:
        print("Script not found at", SCRIPT_PATH)
        sys.exit(1)
