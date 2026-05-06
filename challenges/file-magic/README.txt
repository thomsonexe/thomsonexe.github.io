===========================
  CHALLENGE: file_magic
  Difficulty: Easy | 50 pts
===========================

A file was uploaded to the server with the wrong extension.
The analyst labelled it 'suspicious.doc' -- but something is off.

Your tasks:
  1. Identify the real file type of suspicious.doc
  2. Handle it correctly to reveal its contents
  3. Find the flag inside

TOOLS:
  file suspicious.doc
  xxd suspicious.doc | head
  unzip
