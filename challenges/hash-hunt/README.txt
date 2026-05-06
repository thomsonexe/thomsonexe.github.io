===========================
  CHALLENGE: hash_hunt
  Difficulty: Medium | 100 pts
===========================

A password database was exfiltrated. All passwords are hashed.

Your tasks:
  1. Identify the hash algorithm used
  2. Crack alice's password hash
  3. Find which other user reuses alice's password

The flag is: flag{alice_PASSWORD_username_reuse}
Replace PASSWORD with alice's cracked password.
Replace username with the account that reuses it.

Example: flag{alice_letmein_bob_reuse}

TOOLS:
  hashid             - identify hash type
  john               - crack hashes
  wordlist.txt       - wordlist included in this directory
