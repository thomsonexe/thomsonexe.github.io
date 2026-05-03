// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
});

function updateThemeIcon(theme) {
    themeToggle.innerHTML = theme === 'dark'
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
}


// Particle background
function initParticles() {
    const canvas = document.getElementById('particles-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const COUNT    = window.innerWidth < 768 ? 35 : 65;
    const MAX_DIST = 130;

    let W, H, particles, rafId;

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        W = canvas.width  = rect.width;
        H = canvas.height = rect.height;
    }

    function rgb() {
        return document.documentElement.getAttribute('data-theme') === 'light'
            ? '9,105,218'
            : '0,255,136';
    }

    function makeParticle() {
        return {
            x:  Math.random() * W,
            y:  Math.random() * H,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            r:  Math.random() * 1.2 + 0.5,
            op: Math.random() * 0.35 + 0.1,
        };
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        const c = rgb();

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < MAX_DIST) {
                    ctx.strokeStyle = `rgba(${c},${(1 - d / MAX_DIST) * 0.12})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${c},${p.op})`;
            ctx.fill();

            p.x += p.vx;
            p.y += p.vy;
            if (p.x < -10) p.x = W + 10;
            if (p.x > W + 10) p.x = -10;
            if (p.y < -10) p.y = H + 10;
            if (p.y > H + 10) p.y = -10;
        });

        rafId = requestAnimationFrame(draw);
    }

    resize();
    particles = Array.from({ length: COUNT }, makeParticle);
    draw();

    window.addEventListener('resize', () => {
        resize();
        particles.forEach(p => {
            if (p.x > W) p.x = Math.random() * W;
            if (p.y > H) p.y = Math.random() * H;
        });
    });
}

initParticles();

// Terminal — interactive
function initTerminal() {
    const body = document.querySelector('.terminal-body');
    if (!body) return;

    const PROMPT = 'ben@thomson.cx:~$';
    let cmdHistory = [];
    let histIdx = -1;
    let activeInput = null;

    // --- Commands ---
    const CMDS = {
        help: () => [
            '<span class="t-accent">commands</span>',
            '',
            '  <span class="t-key">whoami</span>              who is ben',
            '  <span class="t-key">id</span>                  uid / groups',
            '  <span class="t-key">ls</span> / <span class="t-key">ls -la</span>         list home directory',
            '  <span class="t-key">cat</span> <em>&lt;file&gt;</em>          about.txt  skills.txt  certs.txt  contact.txt',
            '  <span class="t-key">sudo -l</span>             sudo permissions',
            '  <span class="t-key">neofetch</span>            system info',
            '  <span class="t-key">nmap localhost</span>      port scan',
            '  <span class="t-key">date</span>                current date/time',
            '  <span class="t-key">history</span>             command history',
            '  <span class="t-key">clear</span>               clear terminal',
        ],
        whoami: () => ['ben'],
        id: () => [
            '<span class="t-key">uid=</span><span class="t-val">1000</span><span class="t-dim">(ben)</span> ' +
            '<span class="t-key">gid=</span><span class="t-val">1000</span><span class="t-dim">(ben)</span> ' +
            '<span class="t-key">groups=</span><span class="t-val">27</span><span class="t-dim">(sudo)</span>,' +
            '<span class="t-val">1001</span><span class="t-dim">(soc-team)</span>',
        ],
        ls: (args) => {
            if (args.some(a => a.includes('l'))) {
                return [
                    '<span class="t-dim">total 32</span>',
                    '<span class="t-dim">-rw-r--r--  ben ben  2.0K</span>  <span class="t-accent">about.txt</span>',
                    '<span class="t-dim">-rw-r--r--  ben ben  4.1K</span>  <span class="t-accent">skills.txt</span>',
                    '<span class="t-dim">-rw-r--r--  ben ben  1.0K</span>  <span class="t-accent">certs.txt</span>',
                    '<span class="t-dim">-rw-r--r--  ben ben   512</span>  <span class="t-accent">contact.txt</span>',
                    '<span class="t-dim">-rwxr-xr-x  ben ben  8.0K</span>  <span style="color:#ff9940">portfolio.sh</span>',
                ];
            }
            return ['<span class="t-accent">about.txt</span>  <span class="t-accent">skills.txt</span>  <span class="t-accent">certs.txt</span>  <span class="t-accent">contact.txt</span>  <span style="color:#ff9940">portfolio.sh</span>'];
        },
        cat: (args) => {
            const file = (args[0] || '').toLowerCase();
            if (file === 'about.txt') return [
                '<span class="t-accent">## Ben Thomson</span>', '',
                'Junior Security Analyst — Computer Forensics & Security.',
                'Blue team focus: threat detection, incident response,',
                'log analysis, and vulnerability management.',
                '', 'Building skills one lab at a time.',
            ];
            if (file === 'skills.txt') return [
                '<span class="t-accent">## Skills</span>', '',
                '<span class="t-key">SIEM      </span>  Microsoft Sentinel · Splunk · Elastic',
                '<span class="t-key">Endpoint  </span>  Defender for Endpoint · Cortex XDR · XSOAR',
                '<span class="t-key">Forensics </span>  Wireshark · Volatility · Autopsy · FTK Imager',
                '<span class="t-key">Languages </span>  KQL · Python · PowerShell · Bash',
                '<span class="t-key">Platforms </span>  Azure · Active Directory · Entra ID',
            ];
            if (file === 'certs.txt') return [
                '<span class="t-accent">## Certifications</span>', '',
                '<span class="t-val">[✓]</span>  CompTIA Network+',
                '<span class="t-val">[✓]</span>  CompTIA Security+',
                '<span class="t-val">[✓]</span>  BTL1 — Blue Team Level 1',
                '<span class="t-dim">[ ]  CompTIA SecurityX — in progress</span>',
            ];
            if (file === 'contact.txt') return [
                '<span class="t-accent">## Contact</span>', '',
                '<span class="t-key">GitHub </span>  github.com/thomsonexe',
                '<span class="t-key">Email  </span>  benthomsonwork@gmail.com',
                '<span class="t-key">Site   </span>  thomson.cx',
            ];
            return [`<span style="color:#ff5f56">cat: ${args[0] || ''}: No such file or directory</span>`];
        },
        sudo: (args) => {
            if (args[0] === '-l') return CMDS['sudo -l']();
            if (args.join(' ').includes('rm')) return ['<span style="color:#ff5f56">nice try.</span>'];
            return [
                '<span style="color:#ffbd2e">[sudo] password for ben: </span>',
                '<span style="color:#ff5f56">sudo: permission denied.</span>',
            ];
        },
        'sudo -l': () => [
            '<span class="t-dim">Matching Defaults entries for ben on thomson.cx:</span>',
            '<span class="t-dim">    env_reset, mail_badpass</span>',
            '<span class="t-dim">User ben may run the following commands on thomson.cx:</span>',
            '    <span class="t-dim">(ALL)</span> <span style="color:#ff9940">NOPASSWD:</span> <span class="t-key">/usr/bin/tcpdump</span>, <span class="t-key">/usr/bin/nmap</span>, <span class="t-key">/usr/bin/wireshark</span>',
        ],
        neofetch: () => [
            '      <span class="t-accent">██████╗ ███████╗███╗  ██╗</span>   <span class="t-key">ben</span>@<span class="t-key">thomson.cx</span>',
            '      <span class="t-accent">██╔══██╗██╔════╝████╗ ██║</span>   ─────────────────────',
            '      <span class="t-accent">██████╔╝█████╗  ██╔██╗██║</span>   <span class="t-key">OS</span>      Kali Linux x86_64',
            '      <span class="t-accent">██╔══██╗██╔══╝  ██║╚████║</span>   <span class="t-key">Shell</span>   zsh 5.9',
            '      <span class="t-accent">██████╔╝███████╗██║  ╚███║</span>   <span class="t-key">DE</span>      i3wm',
            '      <span class="t-accent">╚═════╝ ╚══════╝╚═╝   ╚══╝</span>   <span class="t-key">CPU</span>     Threat Analyst v2.0',
            '                                  <span class="t-key">RAM</span>     too much caffeine',
        ],
        nmap: () => [
            'Starting Nmap 7.94 ( https://nmap.org )',
            'Nmap scan report for localhost (127.0.0.1)',
            'Host is up (0.0000090s latency).',
            '',
            '<span class="t-dim">PORT     STATE  SERVICE</span>',
            '<span class="t-accent">22/tcp   open   ssh</span>',
            '<span class="t-accent">80/tcp   open   http</span>',
            '<span class="t-accent">443/tcp  open   https</span>',
            '<span class="t-dim">1337/tcp open   ???</span>',
            '',
            'Nmap done: 1 IP address (1 host up) scanned in 0.09s',
        ],
        date:     () => [new Date().toString()],
        pwd:      () => ['/home/ben'],
        hostname: () => ['thomson.cx'],
        uname:    (args) => args.includes('-a')
            ? ['Linux thomson.cx 6.1.0-kali9-amd64 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux']
            : ['Linux'],
        history: () => cmdHistory.length
            ? cmdHistory.map((c, i) => `  ${String(i + 1).padStart(3)}  ${c}`)
            : ['<span class="t-dim">(no history yet)</span>'],
        exit: () => ['<span class="t-dim">there is no escape.</span>'],
    };

    // --- DOM helpers ---
    function addLine(cls, html) {
        const el = document.createElement('p');
        el.className = cls;
        el.innerHTML = html;
        body.appendChild(el);
        return el;
    }
    function addOutput(lines) { lines.forEach(l => addLine('terminal-output', l)); }
    function scrollBottom() { body.scrollTop = body.scrollHeight; }

    function loginStamp() {
        const d = new Date(Date.now() - ((Math.floor(Math.random() * 9) + 4) * 3600000));
        const days  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const mons  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const hh = String(d.getHours()).padStart(2,'0');
        const mm = String(d.getMinutes()).padStart(2,'0');
        const ss = String(d.getSeconds()).padStart(2,'0');
        return `Last login: ${days[d.getDay()]} ${mons[d.getMonth()]} ${d.getDate()} ${hh}:${mm}:${ss} ${d.getFullYear()} from 192.168.1.1`;
    }

    // --- Command runner ---
    function runCmd(raw) {
        const parts = raw.trim().split(/\s+/);
        const cmd  = parts[0].toLowerCase();
        const args = parts.slice(1);
        const full = raw.toLowerCase().trim();

        if (cmd === 'clear')  { body.innerHTML = ''; return; }
        if (cmd === 'echo')   { addOutput([args.join(' ')]); scrollBottom(); return; }

        const handler = CMDS[full] || CMDS[cmd];
        if (!handler) {
            addOutput([
                `<span style="color:#ff5f56">bash: ${cmd}: command not found</span>`,
                `<span class="t-dim">type <span class="t-key">help</span> to see available commands</span>`,
            ]);
            scrollBottom();
            return;
        }
        const needsArgs = ['ls','cat','sudo','uname'].includes(cmd);
        const out = needsArgs ? handler(args) : handler();
        if (out) { addOutput(out); scrollBottom(); }
    }

    // --- Interactive input ---
    function attachInput() {
        const row = document.createElement('p');
        row.className = 'terminal-line input-line';
        row.innerHTML = `<span class="prompt">${PROMPT}</span>`;
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.className = 'term-input';
        inp.setAttribute('autocomplete', 'off');
        inp.setAttribute('spellcheck', 'false');
        inp.setAttribute('autocorrect', 'off');
        row.appendChild(inp);
        body.appendChild(row);
        scrollBottom();
        inp.focus();
        activeInput = inp;

        inp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const raw = inp.value.trim();
                row.className = 'terminal-line';
                row.innerHTML = `<span class="prompt">${PROMPT}</span> <span class="cmd">${raw}</span>`;
                activeInput = null;
                if (raw) { cmdHistory.push(raw); histIdx = -1; runCmd(raw); }
                attachInput();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (!cmdHistory.length) return;
                histIdx = histIdx === -1 ? cmdHistory.length - 1 : Math.max(0, histIdx - 1);
                inp.value = cmdHistory[histIdx];
                requestAnimationFrame(() => inp.setSelectionRange(inp.value.length, inp.value.length));
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (histIdx === -1) return;
                histIdx++;
                inp.value = histIdx < cmdHistory.length ? cmdHistory[histIdx] : (histIdx = -1, '');
            } else if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                body.innerHTML = '';
                attachInput();
            } else if (e.key === 'c' && e.ctrlKey) {
                e.preventDefault();
                row.className = 'terminal-line';
                row.innerHTML = `<span class="prompt">${PROMPT}</span> <span class="cmd">${inp.value}^C</span>`;
                activeInput = null;
                attachInput();
            }
        });
    }

    // --- Intro animation ---
    const ID_HTML =
        '<span class="t-key">uid=</span><span class="t-val">1000</span><span class="t-dim">(ben)</span> ' +
        '<span class="t-key">gid=</span><span class="t-val">1000</span><span class="t-dim">(ben)</span> ' +
        '<span class="t-key">groups=</span><span class="t-val">27</span><span class="t-dim">(sudo)</span>,' +
        '<span class="t-val">1001</span><span class="t-dim">(soc-team)</span>';

    const introSteps = [
        { type: 'login' },
        { type: 'cmd', text: 'whoami' },
        { type: 'out', text: 'ben' },
        { type: 'cmd', text: 'id' },
        { type: 'out-html', html: ID_HTML },
        { type: 'done' },
    ];

    function typeText(el, text, cb) {
        let j = 0;
        (function tick() {
            if (j < text.length) { el.textContent += text[j++]; setTimeout(tick, 65 + Math.random() * 25 - 12); }
            else if (cb) cb();
        })();
    }

    function runIntro(steps, i) {
        if (i >= steps.length) return;
        const step = steps[i];
        const next = () => setTimeout(() => runIntro(steps, i + 1), 380);

        if (step.type === 'login') {
            addLine('terminal-login', loginStamp());
            setTimeout(() => runIntro(steps, i + 1), 850);
        } else if (step.type === 'cmd') {
            const el = addLine('terminal-line', `<span class="prompt">${PROMPT}</span> <span class="cmd"></span>`);
            scrollBottom();
            typeText(el.querySelector('.cmd'), step.text, next);
        } else if (step.type === 'out') {
            addLine('terminal-output', step.text);
            scrollBottom();
            next();
        } else if (step.type === 'out-html') {
            addLine('terminal-output', step.html);
            scrollBottom();
            next();
        } else if (step.type === 'done') {
            setTimeout(attachInput, 500);
        }
    }

    body.addEventListener('click', () => activeInput && activeInput.focus());
    runIntro(introSteps, 0);
}

initTerminal();

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(l => l.classList.remove('active'));
            const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
            if (active) active.classList.add('active');
        }
    });
}, { rootMargin: '-50% 0px -50% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinksList = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinksList.classList.toggle('open');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinksList.classList.remove('open');
    });
});

// Back to top
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
});
backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Fade-in cards on scroll
const fadeEls = document.querySelectorAll(
    '.cert-card, .project-card, .ctf-card, .blog-card, .social-card'
);

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

fadeEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    fadeObserver.observe(el);
});

// CISA KEV Feed via NVD API (native CORS support — no proxy needed)
async function initKEVFeed() {
    const grid = document.getElementById('cveGrid');
    if (!grid) return;

    try {
        const res = await fetch(
            'https://services.nvd.nist.gov/rest/json/cves/2.0?isKevExploited=true&resultsPerPage=20',
            { headers: { 'Accept': 'application/json' } }
        );
        if (!res.ok) throw new Error();
        const data = await res.json();

        const vulns = (data.vulnerabilities || [])
            .filter(v => v.cve.cisaExploitAdd)
            .sort((a, b) => new Date(b.cve.cisaExploitAdd) - new Date(a.cve.cisaExploitAdd))
            .slice(0, 6);

        if (!vulns.length) throw new Error();
        grid.innerHTML = '';

        vulns.forEach(({ cve }) => {
            const id        = cve.id;
            const name      = cve.cisaVulnerabilityName || id;
            const desc      = (cve.descriptions || []).find(d => d.lang === 'en')?.value || '';
            const shortDesc = desc.length > 140 ? desc.substring(0, 140).trimEnd() + '…' : desc;
            const dateAdded = cve.cisaExploitAdd
                ? new Date(cve.cisaExploitAdd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—';
            const dueDate = cve.cisaActionDue
                ? new Date(cve.cisaActionDue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—';

            const cvss    = cve.metrics?.cvssMetricV31?.[0]?.cvssData
                         ?? cve.metrics?.cvssMetricV30?.[0]?.cvssData
                         ?? null;
            const score    = cvss?.baseScore ?? null;
            const severity = cvss?.baseSeverity ?? 'UNKNOWN';
            const sevClass = severity.toLowerCase();

            const card = document.createElement('div');
            card.className = 'cve-card';
            card.innerHTML = `
                <div class="cve-header">
                    <a href="https://nvd.nist.gov/vuln/detail/${id}" target="_blank" rel="noopener" class="cve-id">${id}</a>
                    <span class="cve-badge sev-${sevClass}">${severity}${score !== null ? ' ' + score : ''}</span>
                </div>
                <p class="cve-vuln-name">${name}</p>
                <p class="cve-desc">${shortDesc}</p>
                <div class="cve-footer">
                    <span class="cve-score"><i class="fas fa-calendar-plus"></i> Added <strong>${dateAdded}</strong></span>
                    <span class="cve-date">Due ${dueDate}</span>
                </div>`;
            grid.appendChild(card);
        });
    } catch {
        grid.innerHTML = '<p class="cve-loading">Unable to load KEV feed. Try refreshing.</p>';
    }
}

initKEVFeed();

// Shared land-dot loader (cached so both globes fetch once)
let _landDotsCache = null;
function getLandDots() {
    if (_landDotsCache) return _landDotsCache;
    _landDotsCache = (async () => {
        const OW = 1440, OH = 720;
        const oc = document.createElement('canvas');
        oc.width = OW; oc.height = OH;
        const ox = oc.getContext('2d');
        ox.fillStyle = '#fff';
        try {
            const res = await fetch('https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_land.geojson');
            if (!res.ok) throw new Error();
            const geo = await res.json();
            function drawRing(coords) {
                if (!coords || coords.length < 3) return;
                ox.beginPath();
                ox.moveTo((coords[0][0] + 180) * 4, (90 - coords[0][1]) * 4);
                for (let i = 1; i < coords.length; i++)
                    ox.lineTo((coords[i][0] + 180) * 4, (90 - coords[i][1]) * 4);
                ox.closePath(); ox.fill();
            }
            geo.features.forEach(({ geometry: g }) => {
                if (!g) return;
                if (g.type === 'Polygon') drawRing(g.coordinates[0]);
                else if (g.type === 'MultiPolygon') g.coordinates.forEach(p => drawRing(p[0]));
            });
        } catch {
            const LAND = [
                [[-168,66],[-140,70],[-100,73],[-78,73],[-65,62],[-53,55],[-56,48],[-67,47],[-62,44],[-75,44],[-80,25],[-82,29],[-88,30],[-90,29],[-97,26],[-87,16],[-85,10],[-77,8],[-105,19],[-117,33],[-124,48],[-130,54],[-168,66]],
                [[-44,60],[-22,65],[-14,76],[-18,83],[-43,83],[-54,76],[-50,68],[-44,60]],
                [[-80,12],[-62,12],[-50,5],[-35,-3],[-34,-8],[-40,-22],[-50,-28],[-68,-55],[-75,-55],[-72,-30],[-70,-18],[-80,-2],[-80,12]],
                [[-9,36],[5,36],[15,38],[28,36],[32,44],[24,46],[18,55],[8,55],[4,52],[-5,44],[-9,36]],
                [[5,58],[10,55],[18,56],[28,56],[28,70],[18,72],[10,70],[5,62],[5,58]],
                [[-5,36],[12,36],[32,30],[38,18],[44,12],[50,12],[46,5],[40,-2],[36,-18],[28,-35],[17,-34],[8,-18],[5,-5],[0,5],[-10,5],[-17,20],[-5,36]],
                [[28,42],[55,50],[82,72],[140,72],[168,68],[168,50],[140,40],[130,32],[110,20],[100,5],[100,-5],[115,-8],[88,22],[68,22],[58,36],[38,36],[28,42]],
                [[66,24],[72,20],[76,8],[80,8],[86,20],[88,22],[82,28],[76,28],[68,24],[66,24]],
                [[114,-22],[130,-14],[140,-18],[152,-24],[152,-30],[148,-38],[130,-32],[114,-26],[114,-22]],
                [[-180,-70],[180,-70],[180,-90],[-180,-90],[-180,-70]],
            ];
            LAND.forEach(pts => {
                ox.beginPath();
                ox.moveTo((pts[0][0]+180)*4,(90-pts[0][1])*4);
                for(let i=1;i<pts.length;i++) ox.lineTo((pts[i][0]+180)*4,(90-pts[i][1])*4);
                ox.closePath(); ox.fill();
            });
        }
        const img = ox.getImageData(0, 0, OW, OH).data;
        const result = [];
        for (let py = 0; py < OH; py += 5)
            for (let px = 0; px < OW; px += 5)
                if (img[(py * OW + px) * 4] > 128)
                    result.push([(90 - py/4) * Math.PI/180, (px/4 - 180) * Math.PI/180]);
        return result;
    })();
    return _landDotsCache;
}

// Shared globe sphere renderer
function drawSphere(ctx, cx, cy, R) {
    const grad = ctx.createRadialGradient(cx - R*0.3, cy - R*0.32, R*0.02, cx, cy, R);
    grad.addColorStop(0,    '#ffffff');
    grad.addColorStop(0.45, '#f0f3f7');
    grad.addColorStop(0.82, '#d6dce7');
    grad.addColorStop(1,    '#b8c2d4');
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2);
    ctx.fillStyle = grad; ctx.fill();

    const rim = ctx.createRadialGradient(cx, cy, R*0.72, cx, cy, R);
    rim.addColorStop(0,   'rgba(255,255,255,0)');
    rim.addColorStop(0.7, 'rgba(255,255,255,0)');
    rim.addColorStop(1,   'rgba(255,255,255,0.55)');
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2);
    ctx.fillStyle = rim; ctx.fill();

    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.clip();
    ctx.strokeStyle = 'rgba(100,120,160,0.18)'; ctx.lineWidth = 0.4;
    for (let i = 1; i < 7; i++) {
        const phi = (i/7)*Math.PI, gy = cy - R*Math.cos(phi), rx = R*Math.sin(phi);
        ctx.beginPath(); ctx.ellipse(cx, gy, rx, rx*0.27, 0, 0, Math.PI*2); ctx.stroke();
    }
    ctx.restore();
}


// Threat Map
function initThreatMap() {
    const canvas = document.getElementById('threatCanvas');
    const logEl  = document.getElementById('threatLog');
    const statEl = document.getElementById('statTotal');
    if (!canvas) return;

    const dpr  = Math.min(window.devicePixelRatio || 1, 2);
    const SIZE = canvas.parentElement.clientWidth || 460;
    canvas.width  = SIZE * dpr; canvas.height = SIZE * dpr;
    canvas.style.width = SIZE + 'px'; canvas.style.height = SIZE + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const cx = SIZE/2, cy = SIZE/2, R = SIZE/2 - 16;
    let angle = 0, dots = [], arcs = [], totalAttacks = 0, frame = 0;

    const SOURCES = [
        { name:'Russia',    code:'RU', lat: 55.7, lon:  37.6 },
        { name:'China',     code:'CN', lat: 39.9, lon: 116.4 },
        { name:'N. Korea',  code:'KP', lat: 39.0, lon: 125.8 },
        { name:'Iran',      code:'IR', lat: 35.7, lon:  51.4 },
        { name:'Vietnam',   code:'VN', lat: 21.0, lon: 105.8 },
        { name:'Romania',   code:'RO', lat: 44.4, lon:  26.1 },
        { name:'Brazil',    code:'BR', lat:-15.8, lon: -47.9 },
    ].map(s => ({ ...s, lat: s.lat*Math.PI/180, lon: s.lon*Math.PI/180 }));

    const TARGETS = [
        { name:'London',    code:'GB', lat: 51.5, lon:  -0.1 },
        { name:'New York',  code:'US', lat: 40.7, lon: -74.0 },
        { name:'Tokyo',     code:'JP', lat: 35.7, lon: 139.7 },
        { name:'Delhi',     code:'IN', lat: 28.6, lon:  77.2 },
        { name:'Berlin',    code:'DE', lat: 52.5, lon:  13.4 },
        { name:'Paris',     code:'FR', lat: 48.9, lon:   2.3 },
        { name:'Singapore', code:'SG', lat:  1.3, lon: 103.8 },
        { name:'Sydney',    code:'AU', lat:-33.9, lon: 151.2 },
        { name:'Toronto',   code:'CA', lat: 43.7, lon: -79.4 },
        { name:'Cape Town', code:'ZA', lat:-33.9, lon:  18.4 },
    ].map(t => ({ ...t, lat: t.lat*Math.PI/180, lon: t.lon*Math.PI/180 }));

    const ATTACK_TYPES = [
        'SSH Brute Force','SQL Injection','Log4Shell (CVE-2021-44228)',
        'RDP Exploit','Ransomware Deployment','Zero-Day Exploit',
        'DDoS Flood','Credential Stuffing','CVE-2024-3400 (PAN-OS)',
        'CVE-2024-21762 (FortiOS)','Phishing Campaign','Supply Chain Attack',
    ];

    function flag(code) {
        return `<span class="fi fi-${code.toLowerCase()}" style="font-size:0.9em;border-radius:2px;"></span>`;
    }

    function slerp(lat1, lon1, lat2, lon2, t) {
        const v1 = [Math.cos(lat1)*Math.cos(lon1), Math.cos(lat1)*Math.sin(lon1), Math.sin(lat1)];
        const v2 = [Math.cos(lat2)*Math.cos(lon2), Math.cos(lat2)*Math.sin(lon2), Math.sin(lat2)];
        const dot = Math.max(-1, Math.min(1, v1[0]*v2[0]+v1[1]*v2[1]+v1[2]*v2[2]));
        const omega = Math.acos(dot);
        if (omega < 0.001) return [lat2, lon2];
        const s = Math.sin(omega);
        const a = Math.sin((1-t)*omega)/s, b = Math.sin(t*omega)/s;
        return [Math.asin(Math.max(-1,Math.min(1, a*v1[2]+b*v2[2]))),
                Math.atan2(a*v1[1]+b*v2[1], a*v1[0]+b*v2[0])];
    }

    // Project a pre-computed unit vector [dx,dy,dz] with current rotation
    function projVec(dx, dy, dz) {
        const x3 = dx*ca + dz*sa, z3 = dz*ca - dx*sa;
        return { x: cx+R*x3, y: cy-R*dy, z: z3 };
    }
    function proj(lat, lon) {
        const dx = Math.cos(lat)*Math.sin(lon), dy = Math.sin(lat), dz = Math.cos(lat)*Math.cos(lon);
        return projVec(dx, dy, dz);
    }

    function spawnArc() {
        const src = SOURCES[Math.floor(Math.random()*SOURCES.length)];
        let dst;
        do { dst = TARGETS[Math.floor(Math.random()*TARGETS.length)]; } while (dst.code === src.code);
        const type = ATTACK_TYPES[Math.floor(Math.random()*ATTACK_TYPES.length)];
        arcs.push({ src, dst, type, progress: 0, speed: 0.004 + Math.random()*0.004 });
        totalAttacks++;
        if (statEl) statEl.textContent = totalAttacks;
        if (logEl) {
            const t = new Date().toLocaleTimeString('en-GB', { hour12: false });
            const el = document.createElement('div');
            el.className = 'threat-entry';
            el.innerHTML = `<span class="t-time">${t}</span><span class="t-route"><span class="t-src">${flag(src.code)} ${src.code}</span><span class="t-arrow">→</span><span class="t-dst">${flag(dst.code)} ${dst.code}</span></span><span class="t-type">${type}</span>`;
            if (logEl.firstChild?.classList?.contains('threat-placeholder')) logEl.innerHTML = '';
            logEl.prepend(el);
            while (logEl.children.length > 14) logEl.removeChild(logEl.lastChild);
        }
    }

    // Pre-render static sphere to offscreen canvas — only rebuilt on resize
    let sphereCache = null;
    function buildSphereCache() {
        const oc = document.createElement('canvas');
        oc.width = SIZE * dpr; oc.height = SIZE * dpr;
        const ox = oc.getContext('2d');
        ox.scale(dpr, dpr);
        drawSphere(ox, cx, cy, R);
        ox.beginPath(); ox.arc(cx, cy, R, 0, Math.PI*2);
        ox.strokeStyle = 'rgba(160,175,200,0.5)'; ox.lineWidth = 1; ox.stroke();
        sphereCache = oc;
    }

    // ca/sa updated once per frame — shared by proj, projVec, and dot loop
    let ca = 1, sa = 0;

    // Offscreen canvas for land dots — only redrawn every 2nd frame
    const dotsOC = document.createElement('canvas');
    dotsOC.width = SIZE * dpr; dotsOC.height = SIZE * dpr;
    const dotCtx = dotsOC.getContext('2d');
    dotCtx.scale(dpr, dpr);

    function redrawDots() {
        dotCtx.clearRect(0, 0, SIZE, SIZE);
        dotCtx.save();
        dotCtx.beginPath(); dotCtx.arc(cx, cy, R - 1, 0, Math.PI*2); dotCtx.clip();
        // Batch ALL dots into one path — single fill() call instead of thousands
        dotCtx.beginPath();
        const r = 1.3;
        for (let i = 0; i < dots.length; i++) {
            const dx = dots[i][0], dy = dots[i][1], dz = dots[i][2];
            const x3 = dx*ca + dz*sa, z3 = dz*ca - dx*sa;
            if (z3 < 0.08) continue;
            const sx = cx + R*x3, sy = cy - R*dy;
            dotCtx.moveTo(sx + r, sy);
            dotCtx.arc(sx, sy, r, 0, Math.PI*2);
        }
        dotCtx.fillStyle = '#1a2235';
        dotCtx.globalAlpha = 0.72;
        dotCtx.fill();
        dotCtx.restore();
        dotCtx.globalAlpha = 1;
    }

    function drawArc(arc) {
        const steps = 40;
        const maxT  = Math.min(arc.progress, 1);
        const fade  = arc.progress > 1.3 ? Math.max(0, (2 - arc.progress) / 0.7) : 1;
        ctx.strokeStyle = `rgba(255,60,60,${fade*0.85})`; ctx.lineWidth = 1.5;
        let started = false;
        ctx.beginPath();
        for (let i = 0; i <= steps*maxT; i++) {
            const [lat, lon] = slerp(arc.src.lat, arc.src.lon, arc.dst.lat, arc.dst.lon, i/steps);
            const p = proj(lat, lon);
            if (p.z < 0.05) { started = false; continue; }
            if (!started) { ctx.moveTo(p.x, p.y); started = true; } else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
        if (arc.progress < 1) {
            const [tl, tn] = slerp(arc.src.lat, arc.src.lon, arc.dst.lat, arc.dst.lon, arc.progress);
            const tp = proj(tl, tn);
            if (tp.z > 0.05) {
                ctx.beginPath(); ctx.arc(tp.x, tp.y, 3.5, 0, Math.PI*2);
                ctx.fillStyle = `rgba(255,160,80,${fade})`; ctx.fill();
                ctx.beginPath(); ctx.arc(tp.x, tp.y, 1.5, 0, Math.PI*2);
                ctx.fillStyle = '#fff'; ctx.fill();
            }
        }
    }

    let lastFrame = 0;
    let visible = false;

    function draw(ts = 0) {
        if (!visible) return;
        // Throttle to ~30fps
        if (ts - lastFrame < 32) { requestAnimationFrame(draw); return; }
        lastFrame = ts;

        // Update rotation trig once per frame
        ca = Math.cos(angle); sa = Math.sin(angle);

        if (!sphereCache) buildSphereCache();
        ctx.drawImage(sphereCache, 0, 0, SIZE, SIZE);

        // Dots: redraw offscreen every 2nd frame, then blit — one drawImage vs thousands of fill() calls
        if (dots.length && frame % 2 === 0) redrawDots();
        if (dots.length) ctx.drawImage(dotsOC, 0, 0, SIZE, SIZE);

        // Arcs — no shadowBlur (too expensive), rely on colour contrast
        arcs.forEach(drawArc);
        arcs.forEach(a => { a.progress += a.speed; });
        arcs = arcs.filter(a => a.progress < 2);

        // Source markers
        SOURCES.forEach(s => {
            const p = proj(s.lat, s.lon);
            if (p.z < 0.05) return;
            ctx.globalAlpha = 0.9;
            ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
            ctx.fillStyle = '#ff9f43'; ctx.fill();
            ctx.globalAlpha = 1;
            ctx.beginPath(); ctx.arc(p.x, p.y, 1, 0, Math.PI*2);
            ctx.fillStyle = '#fff'; ctx.fill();
        });

        // Target markers
        TARGETS.forEach(t => {
            const p = proj(t.lat, t.lon);
            if (p.z < 0.05) return;
            ctx.globalAlpha = 0.9;
            ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI*2);
            ctx.fillStyle = '#ff3333'; ctx.fill();
            ctx.globalAlpha = 1;
            ctx.beginPath(); ctx.arc(p.x, p.y, 1.2, 0, Math.PI*2);
            ctx.fillStyle = '#fff'; ctx.fill();
        });
        ctx.globalAlpha = 1;

        frame++;
        if (frame % 90 === 0) spawnArc();
        angle += 0.003;
        requestAnimationFrame(draw);
    }

    // Pause animation when section is off-screen
    const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible) requestAnimationFrame(draw);
    }, { threshold: 0.1 });
    observer.observe(canvas);

    setTimeout(() => { spawnArc(); }, 600);
    setTimeout(() => { spawnArc(); }, 1500);
    setTimeout(() => { spawnArc(); }, 2500);

    // Convert dots to pre-computed unit vectors [dx, dy, dz]
    getLandDots().then(raw => {
        dots = raw.map(([lat, lon]) => [
            Math.cos(lat)*Math.sin(lon),
            Math.sin(lat),
            Math.cos(lat)*Math.cos(lon),
        ]);
    });
}

initThreatMap();

// Discord copy
function copyDiscord() {
    navigator.clipboard.writeText('thomsonexe').then(() => {
        const confirm = document.getElementById('copyConfirm');
        confirm.classList.add('visible');
        setTimeout(() => confirm.classList.remove('visible'), 2000);
    });
}
