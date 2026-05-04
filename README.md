<div align="center">
  <img src="mouse_t.png" width="80" alt="Logo">
  <h1>thomson.cx</h1>
  <p>Personal cybersecurity portfolio — built from scratch in vanilla HTML, CSS & JavaScript.</p>

  <a href="https://thomson.cx/home">🌐 Live Site</a> &nbsp;·&nbsp;
  <a href="https://thomson.cx/threats">🛡️ CVE Tracker</a> &nbsp;·&nbsp;
  <a href="https://thomson.cx/map">🗺️ Threat Map</a> &nbsp;·&nbsp;
  <a href="https://thomson.cx/intel">📡 Threat Intel</a>

  <br><br>

  ![GitHub deployments](https://img.shields.io/github/deployments/thomsonexe/thomsonexe.github.io/github-pages?label=GitHub%20Pages&style=flat-square)
  ![GitHub last commit](https://img.shields.io/github/last-commit/thomsonexe/thomsonexe.github.io?style=flat-square)
  ![Website](https://img.shields.io/website?url=https%3A%2F%2Fthomson.cx&style=flat-square)

</div>

---

## Overview

A fully hand-coded cybersecurity portfolio with live threat intelligence integrations. No frameworks, no build tools — just HTML, CSS, and JavaScript, deployed via GitHub Pages with a custom domain.

The site blends personal portfolio content (certs, labs, writeups) with real security tooling: a live CVE feed from the NVD, an RSS aggregator pulling from top threat intel sources, and an interactive 3D globe visualising real-world attack traffic sourced from AbuseIPDB and abuse.ch.

---

## Pages

| Route | Description |
|---|---|
| [`/home`](https://thomson.cx/home) | Landing page with hero, social links, and site overview |
| [`/about`](https://thomson.cx/about) | Background, experience, and tools |
| [`/certs`](https://thomson.cx/certs) | Certifications with progress and detail cards |
| [`/labs`](https://thomson.cx/labs) | Writeups, CTF walkthroughs, and learning resources |
| [`/threats`](https://thomson.cx/threats) | Live CVE feed from the National Vulnerability Database |
| [`/map`](https://thomson.cx/map) | Interactive 3D globe with real-time threat data |
| [`/intel`](https://thomson.cx/intel) | Threat intelligence RSS aggregator |
| [`/guestbook`](https://thomson.cx/guestbook) | Visitor guestbook powered by Supabase |

---

## Features

### 🌍 Interactive Threat Map
- 3D canvas globe rendered entirely with the Canvas 2D API — no WebGL, no libraries
- Smooth 60fps animation with delta-time rendering and drag-to-rotate
- Real source country data pulled from **AbuseIPDB** (reported attacker IPs)
- Botnet C2 infrastructure data from **abuse.ch Feodo Tracker**
- Animated attack arcs with glow effects and a live sidebar feed
- Proxied through a **Cloudflare Worker** to handle CORS and cache responses

### 🛡️ CVE Tracker
- Pulls the last 30 days of vulnerabilities directly from the **NVD API v2**
- Filter by severity (Critical / High / Medium / Low), sort by date or CVSS score
- Full-detail modal with description, CVSS metrics, CWE, and remediation references
- Educational explainer section on CVEs, CVSS scoring, and the NVD

### 📡 Threat Intelligence Feed
- Aggregates RSS feeds from **The Hacker News**, **Krebs on Security**, and **SANS ISC**
- Filter by source, refresh on demand
- Proxied through a dedicated **Cloudflare Worker** to bypass CORS with browser XML parsing

### 📝 Labs & Writeups
- Technical writeups on tools and topics: Autopsy, Wireshark, Volatility, KQL, Active Directory, and more
- Phishing analysis and prompt injection research
- BTL1 exam writeup

### 🎨 Design
- Dark cyberpunk aesthetic with glitch text effects and scanline overlays
- Full light/dark theme toggle with localStorage persistence
- Responsive layout — works on mobile and desktop
- Orbitron + JetBrains Mono + Inter typefaces
- Hidden easter egg terminal (try the Konami code)

---

## Tech Stack

**Frontend**
- Vanilla HTML5, CSS3, JavaScript (ES2020+)
- Canvas 2D API (globe renderer)
- No frameworks, no bundlers

**Backend / APIs**
| Service | Usage |
|---|---|
| [GitHub Pages](https://pages.github.com) | Hosting + CI/CD |
| [Cloudflare Workers](https://workers.cloudflare.com) | CORS proxy for AbuseIPDB, Feodo Tracker, RSS feeds |
| [AbuseIPDB](https://www.abuseipdb.com) | Real attacker IP data for threat map |
| [abuse.ch Feodo Tracker](https://feodotracker.abuse.ch) | Botnet C2 infrastructure data |
| [NVD API v2](https://nvd.nist.gov/developers/vulnerabilities) | CVE vulnerability feed |
| [Supabase](https://supabase.com) | Guestbook database |

**Fonts & Icons**
- [Google Fonts](https://fonts.google.com) — Orbitron, JetBrains Mono, Inter
- [Font Awesome 6](https://fontawesome.com)
- [flag-icons](https://github.com/lipis/flag-icons)

---

## Architecture

```
thomson.cx (GitHub Pages)
│
├── Cloudflare Worker: threat-proxy    ← AbuseIPDB + Feodo Tracker
├── Cloudflare Worker: rss-proxy       ← RSS feed aggregator
├── NVD API                            ← CVE data (direct, public)
└── Supabase                           ← Guestbook (REST API)
```

All external API calls that require CORS handling or API keys go through Cloudflare Workers, which cache responses (30 min for threat data, 15 min for RSS) to stay within free tier limits.

---

## Certifications

- CompTIA Security+
- CompTIA Network+
- CompTIA SecurityX (CAS-005)
- Blue Team Labs Level 1 (BTL1)
- Rapid7 InsightVM Certified Administrator

---

## Local Development

No build step required — just open the files directly or serve with any static server:

```bash
# Python
python -m http.server 3000

# Node
npx serve .
```

Then visit `http://localhost:3000`.

> **Note:** Some features (threat map, CVE feed, Intel feed) require internet access to reach the external APIs.

---

## Deployment

Pushed to the `main` branch → GitHub Actions deploys automatically to GitHub Pages → served at `thomson.cx` via Cloudflare DNS.

```bash
git add .
git commit -m "your message"
git push
```

---

<div align="center">
  <sub>Built by <a href="https://thomson.cx/about">Ben Thomson</a> · <a href="mailto:ben@thomson.cx">ben@thomson.cx</a></sub>
</div>
