===========================
  CHALLENGE: time_line
  Difficulty: Medium | 125 pts
===========================

An attacker accessed a Linux server overnight.
The logs directory contains files from that evening.
One file was modified at a suspicious hour -- 03:47 AM.

Your tasks:
  1. Find the file modified at 03:47
  2. Read its contents to get the flag

TOOLS:
  ls -la --time-style=full-iso logs/
  stat logs/<filename>
