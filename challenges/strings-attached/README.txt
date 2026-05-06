===========================
  CHALLENGE: strings_attached
  Difficulty: Easy | 60 pts
===========================

A firmware image was recovered from a compromised device.
A secret was compiled into the binary by mistake.

Your tasks:
  1. Extract readable strings from firmware.bin
  2. Find the hidden encoded secret
  3. Decode it to get the flag

TOOLS:
  strings firmware.bin
  strings firmware.bin | grep =
  echo '...' | base64 -d
