===========================
  CHALLENGE: log_trace
  Difficulty: Medium | 75 pts
===========================

A web server was compromised. You have the Apache access logs.
Analyse them to answer the following:

  Q1. What is the attacker's IP address?
  Q2. Which CVE was exploited? (format: CVE-YYYY-NNNNN)
  Q3. What was the first sensitive file accessed post-exploitation?
  Q4. What exfiltration method was used?

The flag is constructed from your answers:
  flag{ATTACKER_IP_CVE-YYYY-NNNNN_EXFIL-METHOD}

Example: flag{1.2.3.4_CVE-0000-00000_dns}

TOOLS: grep, awk, cut, sort, uniq, sed
