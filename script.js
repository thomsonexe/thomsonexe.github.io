// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
    });
}

function updateThemeIcon(theme) {
    if (!themeToggle) return;
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
            '<span class="t-key">uid=</span><span class="t-val">1337</span><span class="t-dim">(ben)</span> ' +
            '<span class="t-key">gid=</span><span class="t-val">1337</span><span class="t-dim">(ben)</span> ' +
            '<span class="t-key">groups=</span><span class="t-val">4</span><span class="t-dim">(adm)</span>,' +
            '<span class="t-val">27</span><span class="t-dim">(sudo)</span>,' +
            '<span class="t-val">1337</span><span class="t-dim">(blueteam)</span>',
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
        { type: 'cmd', text: 'cat site.txt' },
        { type: 'out', text: '' },
        { type: 'out-html', html: '  <span class="t-key">/notes</span>    writeups and security notes' },
        { type: 'out-html', html: '  <span class="t-key">/ctf</span>      ctf lab with challenges and leaderboard' },
        { type: 'out-html', html: '  <span class="t-key">/tools</span>    small tools and utilities' },
        { type: 'out-html', html: '  <span class="t-key">/cves</span>     cve research and advisories' },
        { type: 'out-html', html: '  <span class="t-key">/intel</span>    threat intel and ioc tracking' },
        { type: 'out', text: '' },
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

    const clockEl = document.getElementById('termClock');
    if (clockEl) {
        function tickClock() {
            const now = new Date();
            const hh = String(now.getHours()).padStart(2,'0');
            const mm = String(now.getMinutes()).padStart(2,'0');
            const ss = String(now.getSeconds()).padStart(2,'0');
            clockEl.textContent = `${hh}:${mm}:${ss}`;
        }
        tickClock();
        setInterval(tickClock, 1000);
    }
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

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        if (navLinksList) navLinksList.classList.toggle('open');
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navToggle) navToggle.classList.remove('active');
        if (navLinksList) navLinksList.classList.remove('open');
    });
});

// Back to top
const backToTop = document.getElementById('backToTop');
if (backToTop) {
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 400);
    });
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

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

// CVE Feed
async function initKEVFeed() {
    const grid        = document.getElementById('cveGrid');
    if (!grid) return;

    const searchEl    = document.getElementById('cveSearch');
    const sortEl      = document.getElementById('cveSort');
    const rangeEl     = document.getElementById('cveRange');
    const infoEl      = document.getElementById('cveInfo');
    const subtitleEl  = document.getElementById('cveSubtitle');
    const loadMoreWrap = document.getElementById('cveLoadMore');
    const loadMoreBtn  = document.getElementById('cveLoadMoreBtn');
    const filterBtns  = document.querySelectorAll('.cve-filter-btn');

    const PER_PAGE = 2000;
    let activeSev    = 'all';
    let allVulns     = [];
    let totalResults = 0;
    let loadedCount  = 0;
    let activeDays   = 30;
    let isLoading    = false;

    const pad = n => String(n).padStart(2, '0');
    const fmt = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T00:00:00.000`;

    const RANGE_LABELS = { 7: '7 days', 30: '30 days', 90: '3 months', 180: '6 months', 365: '1 year' };

    async function fetchPage(days, startIndex) {
        const now = new Date();
        const ago = new Date(Date.now() - days * 86400000);
        const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${fmt(ago)}&pubEndDate=${fmt(now)}&resultsPerPage=${PER_PAGE}&startIndex=${startIndex}`;
        const ctrl = new AbortController();
        const tid  = setTimeout(() => ctrl.abort(), 30000);
        try {
            const res = await fetch(url, { signal: ctrl.signal });
            clearTimeout(tid);
            if (!res.ok) throw new Error(res.status);
            return await res.json();
        } catch (e) {
            clearTimeout(tid);
            throw e;
        }
    }

    function updateLoadMoreBtn() {
        if (!loadMoreWrap || !loadMoreBtn) return;
        const remaining = totalResults - loadedCount;
        if (remaining > 0) {
            const next = Math.min(PER_PAGE, remaining);
            loadMoreBtn.innerHTML = `<i class="fas fa-plus"></i> Load ${next.toLocaleString()} more <span class="cve-load-remaining">(${remaining.toLocaleString()} remaining)</span>`;
            loadMoreWrap.style.display = 'flex';
        } else {
            loadMoreWrap.style.display = 'none';
        }
    }

    async function loadRange(days) {
        if (isLoading) return;
        isLoading   = true;
        activeDays  = days;
        allVulns    = [];
        totalResults = 0;
        loadedCount  = 0;
        grid.innerHTML = `<p class="cve-loading"><i class="fas fa-circle-notch fa-spin"></i> Fetching CVEs from the last ${RANGE_LABELS[days]}&hellip;</p>`;
        if (loadMoreWrap) loadMoreWrap.style.display = 'none';
        if (infoEl) infoEl.textContent = '';
        if (subtitleEl) subtitleEl.textContent = `Showing CVEs from the last ${RANGE_LABELS[days]} — search by CVE ID or keyword, filter by severity, sort by date or score.`;

        try {
            const data   = await fetchPage(days, 0);
            totalResults = data.totalResults || 0;
            const vulns  = data.vulnerabilities || [];
            loadedCount  = vulns.length;
            allVulns     = vulns.sort((a, b) => new Date(b.cve.published) - new Date(a.cve.published));

            if (!allVulns.length) {
                grid.innerHTML = '<p class="cve-loading">No vulnerabilities found for this period.</p>';
                isLoading = false;
                return;
            }
            updateLoadMoreBtn();
            applyFilters();
        } catch (e) {
            grid.innerHTML = '<p class="cve-loading">Unable to load CVE feed. Try refreshing.</p>';
        }
        isLoading = false;
    }

    loadMoreBtn?.addEventListener('click', async () => {
        if (isLoading) return;
        isLoading = true;
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Loading&hellip;';
        try {
            const data  = await fetchPage(activeDays, loadedCount);
            const vulns = data.vulnerabilities || [];
            loadedCount += vulns.length;
            allVulns = [...allVulns, ...vulns]
                .sort((a, b) => new Date(b.cve.published) - new Date(a.cve.published));
            updateLoadMoreBtn();
            applyFilters();
        } catch (e) {
            loadMoreBtn.innerHTML = '<i class="fas fa-triangle-exclamation"></i> Failed — try again';
            loadMoreWrap.style.display = 'flex';
        }
        loadMoreBtn.disabled = false;
        isLoading = false;
    });

    rangeEl?.addEventListener('change', () => loadRange(parseInt(rangeEl.value)));

    // initial load
    loadRange(30);

    function getSev(cve) {
        return (cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity
             ?? cve.metrics?.cvssMetricV30?.[0]?.cvssData?.baseSeverity
             ?? 'unknown').toLowerCase();
    }
    function getScore(cve) {
        return cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore
            ?? cve.metrics?.cvssMetricV30?.[0]?.cvssData?.baseScore
            ?? null;
    }

    // Modal
    const cveMap    = new Map();
    const modal     = document.getElementById('cveModal');
    const modalClose = document.getElementById('cveModalClose');
    const modalBody  = document.getElementById('cveModalBody');
    const modalId    = document.getElementById('cveModalId');
    const modalBadge = document.getElementById('cveModalBadge');

    const fmtDate = iso => iso
        ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '—';

    function openModal(id) {
        const cve = cveMap.get(id);
        if (!cve || !modal) return;

        const score    = getScore(cve);
        const severity = getSev(cve).toUpperCase() || 'UNKNOWN';
        const desc     = (cve.descriptions || []).find(d => d.lang === 'en')?.value || 'No description available.';
        const cvss     = cve.metrics?.cvssMetricV31?.[0] ?? cve.metrics?.cvssMetricV30?.[0] ?? null;
        const cvssData = cvss?.cvssData ?? null;
        const weaknesses = cve.weaknesses || [];
        const refs     = (cve.references || []).slice(0, 10);

        modalId.textContent = id;
        modalBadge.className = `cve-badge sev-${severity.toLowerCase()}`;
        modalBadge.textContent = `${severity}${score !== null ? ' ' + score : ''}`;

        let html = `
            <div class="cve-modal-section">
                <div class="cve-modal-dates">
                    <span><i class="fas fa-calendar-plus"></i> Published: <strong>${fmtDate(cve.published)}</strong></span>
                    <span><i class="fas fa-sync-alt"></i> Modified: <strong>${fmtDate(cve.lastModified)}</strong></span>
                </div>
            </div>

            <div class="cve-modal-section">
                <p class="cve-modal-label">Description</p>
                <p class="cve-modal-desc">${desc}</p>
            </div>`;

        if (cvssData) {
            const metrics = [
                ['Attack Vector',        cvssData.attackVector],
                ['Attack Complexity',    cvssData.attackComplexity],
                ['Privileges Required',  cvssData.privilegesRequired],
                ['User Interaction',     cvssData.userInteraction],
                ['Scope',                cvssData.scope],
                ['Confidentiality',      cvssData.confidentialityImpact],
                ['Integrity',            cvssData.integrityImpact],
                ['Availability',         cvssData.availabilityImpact],
                ['Exploitability Score', cvss.exploitabilityScore],
                ['Impact Score',         cvss.impactScore],
            ].filter(([, v]) => v !== undefined && v !== null);

            html += `
            <div class="cve-modal-section">
                <p class="cve-modal-label">CVSS ${cvssData.version ?? 'Metrics'}</p>
                <div class="cve-metric-grid">
                    ${metrics.map(([k, v]) => `
                    <div class="cve-metric-item">
                        <div class="cve-metric-key">${k}</div>
                        <div class="cve-metric-val">${v}</div>
                    </div>`).join('')}
                </div>
                ${cvssData.vectorString ? `<div class="cve-vector-str">${cvssData.vectorString}</div>` : ''}
            </div>`;
        }

        if (weaknesses.length) {
            const items = weaknesses.flatMap(w => w.description || []).filter(d => d.lang === 'en');
            if (items.length) {
                html += `
            <div class="cve-modal-section">
                <p class="cve-modal-label">Weaknesses</p>
                <div class="cve-weakness-list">
                    ${items.map(d => `<div class="cve-weakness-item">
                        <a href="https://cwe.mitre.org/data/definitions/${d.value.replace('CWE-','')}.html" target="_blank" rel="noopener">${d.value}</a>
                    </div>`).join('')}
                </div>
            </div>`;
            }
        }

        if (refs.length) {
            html += `
            <div class="cve-modal-section">
                <p class="cve-modal-label">References</p>
                <div class="cve-refs-list">
                    ${refs.map(r => `<div class="cve-ref-item"><a href="${r.url}" target="_blank" rel="noopener">${r.url}</a></div>`).join('')}
                </div>
            </div>`;
        }

        html += `
            <div class="cve-modal-section cve-modal-footer">
                <a href="https://nvd.nist.gov/vuln/detail/${id}" target="_blank" rel="noopener" class="cve-modal-nvd-link">
                    <i class="fas fa-external-link-alt"></i> View on NVD
                </a>
            </div>`;

        modalBody.innerHTML = html;
        modalBody.scrollTop = 0;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal?.classList.remove('active');
        document.body.style.overflow = '';
    }

    modalClose?.addEventListener('click', closeModal);
    modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal?.classList.contains('active')) closeModal(); });

    const PAGE_SIZE = 25;
    let filteredVulns = [];
    let currentPage   = 1;
    const paginationEl = document.getElementById('cvePagination');

    function renderPagination(totalPages) {
        if (!paginationEl) return;
        if (totalPages <= 1) { paginationEl.innerHTML = ''; return; }

        const pages = new Set([1, totalPages]);
        for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) pages.add(i);
        const sorted = [...pages].sort((a, b) => a - b);

        let html = '<div class="cve-page-btns">';
        html += `<button class="cve-page-btn cve-page-arrow" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
        let prev = 0;
        for (const p of sorted) {
            if (p - prev > 1) html += '<span class="cve-page-ellipsis">&hellip;</span>';
            html += `<button class="cve-page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
            prev = p;
        }
        html += `<button class="cve-page-btn cve-page-arrow" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
        html += '</div>';
        paginationEl.innerHTML = html;

        paginationEl.querySelectorAll('.cve-page-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => {
                renderPage(parseInt(btn.dataset.page));
                grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    function renderPage(page) {
        currentPage = page;
        const totalPages = Math.ceil(filteredVulns.length / PAGE_SIZE);
        const start = (page - 1) * PAGE_SIZE;
        const slice = filteredVulns.slice(start, start + PAGE_SIZE);

        const from = filteredVulns.length ? start + 1 : 0;
        const to   = Math.min(start + PAGE_SIZE, filteredVulns.length);
        const loadedStr = loadedCount < totalResults
            ? ` — ${loadedCount.toLocaleString()} of ${totalResults.toLocaleString()} fetched from NVD`
            : ` — all ${totalResults.toLocaleString()} fetched`;
        if (infoEl) infoEl.textContent = `showing ${from}–${to} of ${filteredVulns.length.toLocaleString()} vulnerabilities${loadedStr}`;

        if (!slice.length) {
            grid.innerHTML = '<p class="cve-loading">No matches found.</p>';
            renderPagination(0);
            return;
        }

        grid.innerHTML = '';
        slice.forEach(({ cve }) => {
            cveMap.set(cve.id, cve);
            const id        = cve.id;
            const desc      = (cve.descriptions || []).find(d => d.lang === 'en')?.value || '';
            const shortDesc = desc.length > 140 ? desc.substring(0, 140).trimEnd() + '…' : desc;
            const published = cve.published
                ? new Date(cve.published).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—';
            const modified  = cve.lastModified
                ? new Date(cve.lastModified).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—';
            const score    = getScore(cve);
            const severity = getSev(cve).toUpperCase() || 'UNKNOWN';

            const card = document.createElement('div');
            card.className = 'cve-card';
            card.innerHTML = `
                <div class="cve-header">
                    <span class="cve-id">${id}</span>
                    <span class="cve-badge sev-${severity.toLowerCase()}">${severity}${score !== null ? ' ' + score : ''}</span>
                </div>
                <p class="cve-desc">${shortDesc}</p>
                <div class="cve-footer">
                    <span class="cve-score"><i class="fas fa-calendar-plus"></i> Published <strong>${published}</strong></span>
                    <span class="cve-date">Updated ${modified}</span>
                </div>`;
            card.addEventListener('click', () => openModal(id));
            grid.appendChild(card);
        });

        renderPagination(totalPages);
    }

    function applyFilters() {
        const query   = searchEl?.value.toLowerCase().trim() || '';
        const sortVal = sortEl?.value || 'newest';

        filteredVulns = allVulns.filter(({ cve }) => {
            if (activeSev !== 'all' && getSev(cve) !== activeSev) return false;
            if (query) {
                const desc = (cve.descriptions || []).find(d => d.lang === 'en')?.value || '';
                if (!cve.id.toLowerCase().includes(query) && !desc.toLowerCase().includes(query)) return false;
            }
            return true;
        });

        if (sortVal === 'score') {
            filteredVulns.sort((a, b) => (getScore(b.cve) ?? 0) - (getScore(a.cve) ?? 0));
        }

        currentPage = 1;
        renderPage(1);
    }

    let searchTimer;
    searchEl?.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(applyFilters, 250); });
    sortEl?.addEventListener('change', applyFilters);
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeSev = btn.dataset.sev;
            applyFilters();
        });
    });

    applyFilters();
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
    // Dark green fill
    const grad = ctx.createRadialGradient(cx - R*0.28, cy - R*0.28, R*0.04, cx + R*0.1, cy + R*0.1, R);
    grad.addColorStop(0,   '#1a3a1e');
    grad.addColorStop(0.4, '#0a1a0d');
    grad.addColorStop(0.8, '#050e07');
    grad.addColorStop(1,   '#020503');
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2);
    ctx.fillStyle = grad; ctx.fill();

    // Green grid lines
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.clip();
    ctx.strokeStyle = 'rgba(0,255,136,0.07)'; ctx.lineWidth = 0.5;
    for (let i = 1; i < 7; i++) {
        const phi = (i/7)*Math.PI, gy = cy - R*Math.cos(phi), rx = R*Math.sin(phi);
        ctx.beginPath(); ctx.ellipse(cx, gy, rx, rx*0.27, 0, 0, Math.PI*2); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(0,255,136,0.14)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.ellipse(cx, cy, R, R*0.27, 0, 0, Math.PI*2); ctx.stroke();
    ctx.restore();

    // Specular highlight
    const spec = ctx.createRadialGradient(cx - R*0.38, cy - R*0.38, 0, cx - R*0.38, cy - R*0.38, R*0.65);
    spec.addColorStop(0, 'rgba(0,255,136,0.07)');
    spec.addColorStop(1, 'rgba(0,255,136,0)');
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2);
    ctx.fillStyle = spec; ctx.fill();

    // Green rim glow
    const rim = ctx.createRadialGradient(cx, cy, R*0.72, cx, cy, R);
    rim.addColorStop(0,   'rgba(0,255,100,0)');
    rim.addColorStop(0.6, 'rgba(0,255,100,0)');
    rim.addColorStop(1,   'rgba(0,255,100,0.22)');
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2);
    ctx.fillStyle = rim; ctx.fill();
}


// Threat Map
function initThreatMap(injectedSources, injectedAttackTypes) {
    const canvas = document.getElementById('threatCanvas');
    const logEl  = document.getElementById('threatLog');
    const statEl = document.getElementById('statTotal');
    if (!canvas) return;

    const dpr  = Math.min(window.devicePixelRatio || 1, 2);
    const wrap = canvas.parentElement;
    const SIZE = Math.max(wrap.clientWidth || wrap.offsetWidth, 300);
    canvas.width  = SIZE * dpr; canvas.height = SIZE * dpr;
    canvas.style.width  = '100%';
    canvas.style.height = '100%';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const cx = SIZE/2, cy = SIZE/2, R = SIZE/2 - 16;
    let angle = 0, dots = [], arcs = [], totalAttacks = 0, frame = 0;

    // Drag-to-spin
    let dragActive = false, dragLastX = 0, dragVel = 0, autoSpin = true;
    function clientX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
    canvas.addEventListener('mousedown',  e => { dragActive = true; dragLastX = clientX(e); dragVel = 0; autoSpin = false; canvas.classList.add('dragging'); });
    canvas.addEventListener('touchstart', e => { dragActive = true; dragLastX = clientX(e); dragVel = 0; autoSpin = false; }, { passive: true });
    window.addEventListener('mousemove',  e => { if (!dragActive) return; const dx = clientX(e) - dragLastX; angle += dx * (Math.PI / SIZE); dragVel = dx; dragLastX = clientX(e); });
    window.addEventListener('touchmove',  e => { if (!dragActive) return; const dx = clientX(e) - dragLastX; angle += dx * (Math.PI / SIZE); dragVel = dx; dragLastX = clientX(e); }, { passive: true });
    window.addEventListener('mouseup',   () => { if (!dragActive) return; dragActive = false; canvas.classList.remove('dragging'); });
    window.addEventListener('touchend',  () => { dragActive = false; });

    const SOURCES = (injectedSources || [
        { name:'APT29',         code:'RU', lat: 55.7, lon:  37.6 },
        { name:'APT41',         code:'CN', lat: 39.9, lon: 116.4 },
        { name:'Lazarus Group', code:'KP', lat: 39.0, lon: 125.8 },
        { name:'APT35',         code:'IR', lat: 35.7, lon:  51.4 },
        { name:'APT32',         code:'VN', lat: 21.0, lon: 105.8 },
        { name:'APT28',         code:'RU', lat: 59.9, lon:  30.3 },
        { name:'Blind Eagle',   code:'BR', lat:-15.8, lon: -47.9 },
    ]).map(s => ({ ...s, lat: s.lat*Math.PI/180, lon: s.lon*Math.PI/180 }));

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

    const ATTACK_TYPES = injectedAttackTypes || [
        'T1190 · Exploit Public-Facing App',
        'T1110.001 · Password Spraying',
        'T1059.001 · PowerShell Execution',
        'T1566.001 · Spearphishing Attachment',
        'T1486 · Data Encrypted for Impact',
        'T1071.001 · Web Protocol C2',
        'T1003.001 · LSASS Memory Dump',
        'T1078 · Valid Account Abuse',
        'T1021.002 · SMB Lateral Movement',
        'T1505.003 · Web Shell Deployment',
        'T1595 · Active Reconnaissance',
        'T1588.002 · Offensive Tool Staging',
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
        const STEPS = 64;
        const pts = [];
        for (let i = 0; i <= STEPS; i++) pts.push(slerp(src.lat, src.lon, dst.lat, dst.lon, i / STEPS));
        arcs.push({ src, dst, type, progress: 0, speed: 0.005 + Math.random()*0.004, pts });
        totalAttacks++;
        if (statEl) statEl.textContent = totalAttacks;
        if (logEl) {
            const t = new Date().toLocaleTimeString('en-GB', { hour12: false });
            const el = document.createElement('div');
            el.className = 'threat-entry';
            el.innerHTML = `<span class="t-time">${t}</span><span class="t-route"><span class="t-src">${flag(src.code)} ${src.name}</span><span class="t-arrow">→</span><span class="t-dst">${flag(dst.code)} ${dst.name}</span></span><span class="t-type">${type}</span>`;
            if (logEl.firstChild?.classList?.contains('threat-placeholder')) logEl.innerHTML = '';
            logEl.prepend(el);
            while (logEl.children.length > 30) logEl.removeChild(logEl.lastChild);
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
        ox.strokeStyle = 'rgba(0,255,136,0.25)'; ox.lineWidth = 1; ox.stroke();
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
        dotCtx.beginPath();
        const r = 1.5;
        for (let i = 0; i < dots.length; i++) {
            const dx = dots[i][0], dy = dots[i][1], dz = dots[i][2];
            const x3 = dx*ca + dz*sa, z3 = dz*ca - dx*sa;
            if (z3 < 0.01) continue;
            const sx = cx + R*x3, sy = cy - R*dy;
            dotCtx.moveTo(sx + r, sy);
            dotCtx.arc(sx, sy, r, 0, Math.PI*2);
        }
        dotCtx.fillStyle = 'rgba(0,255,136,0.65)';
        dotCtx.fill();
        dotCtx.restore();
    }

    function drawAtmosphere() {
        const outer = Math.min(R * 1.14, SIZE * 0.49);
        const atmo = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, outer);
        atmo.addColorStop(0,   'rgba(0,255,136,0.15)');
        atmo.addColorStop(0.5, 'rgba(0,200,100,0.06)');
        atmo.addColorStop(1,   'rgba(0,100,50,0)');
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, outer, 0, Math.PI * 2);
        ctx.fillStyle = atmo; ctx.fill();
        ctx.restore();
    }

    let pulseFrame = 0;
    function drawMarkers() {
        const pf = pulseFrame;
        SOURCES.forEach((s, i) => {
            const p = proj(s.lat, s.lon);
            if (p.z < 0.05) return;
            const phase = ((pf * 0.035 + i * 0.3) % 1);
            ctx.beginPath(); ctx.arc(p.x, p.y, 4 + phase * 12, 0, Math.PI*2);
            ctx.strokeStyle = `rgba(0,255,136,${0.6 * (1 - phase)})`; ctx.lineWidth = 1.2; ctx.stroke();
            ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
            ctx.fillStyle = '#00ff88'; ctx.fill();
            ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI*2);
            ctx.fillStyle = '#fff'; ctx.fill();
        });
        TARGETS.forEach((t, i) => {
            const p = proj(t.lat, t.lon);
            if (p.z < 0.05) return;
            const phase = ((pf * 0.035 + i * 0.18) % 1);
            ctx.beginPath(); ctx.arc(p.x, p.y, 4 + phase * 12, 0, Math.PI*2);
            ctx.strokeStyle = `rgba(255,60,60,${0.6 * (1 - phase)})`; ctx.lineWidth = 1.2; ctx.stroke();
            ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
            ctx.fillStyle = '#ff3333'; ctx.fill();
            ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI*2);
            ctx.fillStyle = '#fff'; ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    function drawArc(arc) {
        const STEPS = arc.pts.length - 1;
        const maxIdx = Math.floor(Math.min(arc.progress, 1) * STEPS);
        if (maxIdx < 1) return;
        const fade = arc.progress > 1.3 ? Math.max(0, (2 - arc.progress) / 0.7) : 1;

        // Build screen-space segments, splitting at back-face gaps
        const segs = [];
        let seg = [];
        for (let i = 0; i <= maxIdx; i++) {
            const [lat, lon] = arc.pts[i];
            const p = proj(lat, lon);
            if (p.z < 0.02) { if (seg.length > 1) segs.push(seg); seg = []; }
            else seg.push(p);
        }
        if (seg.length > 1) segs.push(seg);
        if (!segs.length) return;

        const strokeSegs = (lw, style) => {
            ctx.lineWidth = lw; ctx.strokeStyle = style;
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            segs.forEach(s => {
                ctx.beginPath(); ctx.moveTo(s[0].x, s[0].y);
                for (let i = 1; i < s.length; i++) ctx.lineTo(s[i].x, s[i].y);
                ctx.stroke();
            });
        };

        strokeSegs(7,   `rgba(0,255,136,${fade * 0.12})`);   // outer glow
        strokeSegs(3,   `rgba(0,255,136,${fade * 0.35})`);   // mid glow
        strokeSegs(1.4, `rgba(180,255,210,${fade * 0.95})`); // core

        // Animated tip
        if (arc.progress < 1) {
            const tp = proj(arc.pts[maxIdx][0], arc.pts[maxIdx][1]);
            if (tp.z > 0.02) {
                ctx.beginPath(); ctx.arc(tp.x, tp.y, 8, 0, Math.PI*2);
                ctx.fillStyle = `rgba(0,255,136,${fade * 0.2})`; ctx.fill();
                ctx.beginPath(); ctx.arc(tp.x, tp.y, 3.5, 0, Math.PI*2);
                ctx.fillStyle = `rgba(100,255,180,${fade * 0.9})`; ctx.fill();
                ctx.beginPath(); ctx.arc(tp.x, tp.y, 1.5, 0, Math.PI*2);
                ctx.fillStyle = '#ffffff'; ctx.fill();
            }
        }
    }

    let lastFrame = 0;
    let visible = false;

    function draw(ts = 0) {
        if (!visible) return;
        const dt = Math.min((ts - lastFrame) / 1000, 0.05);
        lastFrame = ts;

        ca = Math.cos(angle); sa = Math.sin(angle);

        ctx.clearRect(0, 0, SIZE, SIZE);
        drawAtmosphere();

        if (!sphereCache) buildSphereCache();
        ctx.drawImage(sphereCache, 0, 0, SIZE, SIZE);

        if (dots.length && frame % 3 === 0) redrawDots();
        if (dots.length) ctx.drawImage(dotsOC, 0, 0, SIZE, SIZE);

        arcs.forEach(drawArc);
        arcs.forEach(a => { a.progress += a.speed; });
        arcs = arcs.filter(a => a.progress < 2);

        drawMarkers();
        pulseFrame++;

        frame++;
        if (frame % 240 === 0 && arcs.length < 8) spawnArc();
        if (!dragActive) {
            // Momentum decay after drag, then resume gentle auto-spin
            if (Math.abs(dragVel) > 0.1) {
                angle += dragVel * (Math.PI / SIZE);
                dragVel *= 0.92;
            } else {
                dragVel = 0;
                angle += 0.12 * dt;
            }
        }
        requestAnimationFrame(draw);
    }

    // Pause animation when section is off-screen
    const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible) requestAnimationFrame(draw);
    }, { threshold: 0.1 });
    observer.observe(canvas);

    // Pre-fill feed — staggered so it looks like live incoming traffic
    for (let i = 0; i < 28; i++) setTimeout(() => spawnArc(), i * 350);

    // Convert dots to pre-computed unit vectors [dx, dy, dz]
    getLandDots().then(raw => {
        dots = raw.map(([lat, lon]) => [
            Math.cos(lat)*Math.sin(lon),
            Math.sin(lat),
            Math.cos(lat)*Math.cos(lon),
        ]);
    });
}

const COUNTRY_COORDS = {
    'RU':{ name:'Russia',        lat: 55.75, lon:  37.62 },
    'CN':{ name:'China',         lat: 39.91, lon: 116.39 },
    'US':{ name:'United States', lat: 38.90, lon: -77.04 },
    'DE':{ name:'Germany',       lat: 52.52, lon:  13.40 },
    'NL':{ name:'Netherlands',   lat: 52.37, lon:   4.90 },
    'FR':{ name:'France',        lat: 48.86, lon:   2.35 },
    'GB':{ name:'UK',            lat: 51.51, lon:  -0.13 },
    'BR':{ name:'Brazil',        lat:-15.78, lon: -47.93 },
    'IN':{ name:'India',         lat: 28.61, lon:  77.23 },
    'KP':{ name:'N. Korea',      lat: 39.03, lon: 125.75 },
    'IR':{ name:'Iran',          lat: 35.69, lon:  51.42 },
    'UA':{ name:'Ukraine',       lat: 50.45, lon:  30.52 },
    'TR':{ name:'Turkey',        lat: 39.93, lon:  32.86 },
    'KR':{ name:'S. Korea',      lat: 37.57, lon: 126.98 },
    'VN':{ name:'Vietnam',       lat: 21.03, lon: 105.83 },
    'HK':{ name:'Hong Kong',     lat: 22.32, lon: 114.17 },
    'SG':{ name:'Singapore',     lat:  1.35, lon: 103.82 },
    'JP':{ name:'Japan',         lat: 35.69, lon: 139.69 },
    'CA':{ name:'Canada',        lat: 45.42, lon: -75.70 },
    'AU':{ name:'Australia',     lat:-33.87, lon: 151.21 },
    'RO':{ name:'Romania',       lat: 44.43, lon:  26.10 },
    'BG':{ name:'Bulgaria',      lat: 42.70, lon:  23.32 },
    'PL':{ name:'Poland',        lat: 52.23, lon:  21.01 },
    'MX':{ name:'Mexico',        lat: 19.43, lon: -99.13 },
    'AR':{ name:'Argentina',     lat:-34.61, lon: -58.39 },
    'ID':{ name:'Indonesia',     lat: -6.21, lon: 106.85 },
    'PK':{ name:'Pakistan',      lat: 33.72, lon:  73.06 },
    'TH':{ name:'Thailand',      lat: 13.76, lon: 100.50 },
    'NG':{ name:'Nigeria',       lat:  9.07, lon:   7.40 },
    'ZA':{ name:'South Africa',  lat:-25.74, lon:  28.19 },
    'IT':{ name:'Italy',         lat: 41.90, lon:  12.49 },
    'ES':{ name:'Spain',         lat: 40.42, lon:  -3.70 },
    'CZ':{ name:'Czechia',       lat: 50.08, lon:  14.44 },
    'HU':{ name:'Hungary',       lat: 47.50, lon:  19.04 },
    'SE':{ name:'Sweden',        lat: 59.33, lon:  18.07 },
    'CH':{ name:'Switzerland',   lat: 46.95, lon:   7.45 },
    'AT':{ name:'Austria',       lat: 48.21, lon:  16.37 },
    'BE':{ name:'Belgium',       lat: 50.85, lon:   4.35 },
    'LT':{ name:'Lithuania',     lat: 54.69, lon:  25.28 },
    'LV':{ name:'Latvia',        lat: 56.95, lon:  24.11 },
    'EE':{ name:'Estonia',       lat: 59.44, lon:  24.75 },
    'MD':{ name:'Moldova',       lat: 47.00, lon:  28.86 },
    'BY':{ name:'Belarus',       lat: 53.90, lon:  27.57 },
    'KZ':{ name:'Kazakhstan',    lat: 51.18, lon:  71.45 },
    'AZ':{ name:'Azerbaijan',    lat: 40.41, lon:  49.87 },
    'EG':{ name:'Egypt',         lat: 30.06, lon:  31.25 },
    'SA':{ name:'Saudi Arabia',  lat: 24.69, lon:  46.72 },
    'IL':{ name:'Israel',        lat: 31.77, lon:  35.22 },
    'MY':{ name:'Malaysia',      lat:  3.14, lon: 101.69 },
    'PH':{ name:'Philippines',   lat: 14.60, lon: 120.98 },
    'TW':{ name:'Taiwan',        lat: 25.03, lon: 121.57 },
    'CL':{ name:'Chile',         lat:-33.46, lon: -70.65 },
    'CO':{ name:'Colombia',      lat:  4.71, lon: -74.07 },
    'PT':{ name:'Portugal',      lat: 38.72, lon:  -9.14 },
    'GR':{ name:'Greece',        lat: 37.98, lon:  23.73 },
    'FI':{ name:'Finland',       lat: 60.17, lon:  24.94 },
    'NO':{ name:'Norway',        lat: 59.91, lon:  10.75 },
    'DK':{ name:'Denmark',       lat: 55.68, lon:  12.57 },
};

async function fetchThreatData() {
    const labelEl   = document.getElementById('tmDataLabel');
    const sourcesEl = document.getElementById('tmStatSources');
    const malwareEl = document.getElementById('tmStatMalware');
    if (!document.getElementById('threatCanvas')) return;

    async function tryFetch(url, opts = {}, ms = 12000) {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), ms);
        try { const r = await fetch(url, { ...opts, signal: ctrl.signal }); clearTimeout(tid); return r; }
        catch(e) { clearTimeout(tid); throw e; }
    }

    function buildResult(pairs) {
        const cm = new Map(), mf = new Set();
        pairs.forEach(([cc, mal]) => {
            const c = COUNTRY_COORDS[cc?.toUpperCase()];
            if (c) cm.set(cc.toUpperCase(), c);
            if (mal && mal !== 'unknown') mf.add(mal);
        });
        return {
            sources: Array.from(cm.entries()).map(([code, c]) => ({ name:c.name, code, lat:c.lat, lon:c.lon })),
            malware: Array.from(mf),
        };
    }

    // 1. Feodo Tracker (C2s) + URLhaus (malware delivery) combined
    try {
        const [workerRes, urlhausRes] = await Promise.allSettled([
            tryFetch('https://threat-proxy.zeusthegoat.workers.dev/'),
            tryFetch('https://urlhaus-api.abuse.ch/v1/urls/recent/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'limit=500',
            }),
        ]);

        const pairs = [];
        let feodoTotal = 0, urlhausTotal = 0;

        if (workerRes.status === 'fulfilled' && workerRes.value.ok) {
            const json = await workerRes.value.json();
            if (json.feodo?.length) {
                feodoTotal = json.feodo.length;
                json.feodo.forEach(e => pairs.push([e.country, e.malware || 'Botnet C2']));
            }
        }

        if (urlhausRes.status === 'fulfilled' && urlhausRes.value.ok) {
            const json = await urlhausRes.value.json();
            if (json.query_status === 'ok' && json.urls?.length) {
                urlhausTotal = json.urls.length;
                json.urls
                    .filter(u => u.country_code && u.country_code !== 'unknown')
                    .forEach(u => pairs.push([u.country_code, u.tags?.[0] || u.threat || 'Malware Delivery']));
            }
        }

        const { sources, malware } = buildResult(pairs);
        if (sources.length >= 2) {
            if (labelEl)   labelEl.textContent   = `Live data: Feodo Tracker (${feodoTotal} C2s) + URLhaus (${urlhausTotal} URLs)`;
            if (sourcesEl) sourcesEl.textContent = sources.length;
            if (malwareEl) malwareEl.textContent = malware.length || '—';
            initThreatMap(sources, malware.length ? malware : undefined);
            return;
        }
    } catch { /* fall through */ }

    if (labelEl) labelEl.textContent = 'Simulated data — live feed unavailable';
    initThreatMap();
}

if (document.getElementById('threatCanvas')) {
    fetchThreatData();
} else {
    initThreatMap();
}

// IP Lookup Page
(function initIpLookup() {
    const input     = document.getElementById('ipInput');
    const searchBtn = document.getElementById('ipSearchBtn');
    const myIpBtn   = document.getElementById('ipMyIpBtn');
    const results   = document.getElementById('ipResults');
    if (!input) return;

    const WORKER = 'https://ip-check.zeusthegoat.workers.dev/?ip=';

    function scoreClass(malicious, total) {
        const pct = total ? malicious / total : 0;
        if (malicious === 0) return 'score-low';
        if (pct < 0.15)      return 'score-medium';
        if (pct < 0.4)       return 'score-high';
        return 'score-critical';
    }
    function scoreLabel(malicious) {
        if (malicious === 0) return 'Clean';
        if (malicious <= 3)  return 'Suspicious';
        if (malicious <= 10) return 'Malicious';
        return 'Critical';
    }

    function render(data, ip) {
        const a     = data.data.attributes;
        const stats = a.last_analysis_stats || {};
        const mal   = stats.malicious  || 0;
        const sus   = stats.suspicious || 0;
        const har   = stats.harmless   || 0;
        const und   = stats.undetected || 0;
        const total = mal + sus + har + und + (stats.timeout || 0);
        const cls   = scoreClass(mal, total);
        const lbl   = scoreLabel(mal);
        const pct   = total ? Math.round((mal / total) * 100) : 0;
        const cc    = (a.country || '').toLowerCase();
        const flag  = cc ? `<span class="fi fi-${cc}"></span>` : '';

        results.innerHTML = `
        <div class="ip-result-card">
            <div class="ip-score-section ${cls}">
                <div class="ip-score-val">${mal}<span class="ip-score-denom"> / ${total}</span></div>
                <div class="ip-score-bar-wrap"><div class="ip-score-bar" style="width:${pct}%"></div></div>
                <div class="ip-score-label">${lbl} &mdash; vendors flagged this IP as malicious</div>
            </div>
            <div class="ip-address-display">${ip}</div>
            <div class="ip-info-grid">
                <div class="ip-info-card">
                    <span class="ip-info-label"><i class="fas fa-circle-xmark" style="color:#ff4d4d"></i> Malicious</span>
                    <span class="ip-info-val">${mal}</span>
                </div>
                <div class="ip-info-card">
                    <span class="ip-info-label"><i class="fas fa-circle-exclamation" style="color:#ffb400"></i> Suspicious</span>
                    <span class="ip-info-val">${sus}</span>
                </div>
                <div class="ip-info-card">
                    <span class="ip-info-label"><i class="fas fa-circle-check" style="color:#00c864"></i> Harmless</span>
                    <span class="ip-info-val">${har}</span>
                </div>
                <div class="ip-info-card">
                    <span class="ip-info-label"><i class="fas fa-circle" style="color:var(--text-muted)"></i> Undetected</span>
                    <span class="ip-info-val">${und}</span>
                </div>
                <div class="ip-info-card">
                    <span class="ip-info-label"><i class="fas fa-flag"></i> Country</span>
                    <span class="ip-info-val">${flag} ${a.country || '&mdash;'}</span>
                </div>
                <div class="ip-info-card">
                    <span class="ip-info-label"><i class="fas fa-building"></i> ASN Owner</span>
                    <span class="ip-info-val">${a.as_owner || '&mdash;'}</span>
                </div>
                <div class="ip-info-card">
                    <span class="ip-info-label"><i class="fas fa-network-wired"></i> ASN</span>
                    <span class="ip-info-val">${a.asn ? 'AS' + a.asn : '&mdash;'}</span>
                </div>
                <div class="ip-info-card">
                    <span class="ip-info-label"><i class="fas fa-server"></i> Network</span>
                    <span class="ip-info-val">${a.network || '&mdash;'}</span>
                </div>
                <div class="ip-info-card">
                    <span class="ip-info-label"><i class="fas fa-database"></i> Registry</span>
                    <span class="ip-info-val">${a.regional_internet_registry || '&mdash;'}</span>
                </div>
                <div class="ip-info-card">
                    <span class="ip-info-label"><i class="fas fa-star"></i> Reputation</span>
                    <span class="ip-info-val" style="color:${a.reputation < 0 ? '#ff4d4d' : '#00c864'}">${a.reputation ?? '&mdash;'}</span>
                </div>
            </div>
            <p class="ip-attribution">Data provided by <a href="https://www.virustotal.com" target="_blank" rel="noopener">VirusTotal</a></p>
        </div>`;
    }

    async function lookup(ip) {
        ip = ip.trim();
        if (!ip) return;
        results.innerHTML = '<div class="ip-loading"><i class="fas fa-circle-notch fa-spin"></i> Checking reputation&hellip;</div>';
        try {
            const r    = await fetch(WORKER + encodeURIComponent(ip));
            const data = await r.json();
            if (data.error) throw new Error(data.error.message || 'API error');
            if (!data.data) throw new Error('No data returned');
            render(data, ip);
        } catch (e) {
            results.innerHTML = `<div class="ip-error"><i class="fas fa-triangle-exclamation"></i> ${e.message || 'Lookup failed — check the IP and try again.'}</div>`;
        }
    }

    searchBtn.addEventListener('click', () => lookup(input.value));
    input.addEventListener('keydown', e => { if (e.key === 'Enter') lookup(input.value); });

    myIpBtn.addEventListener('click', async () => {
        myIpBtn.disabled = true;
        try {
            const { ip } = await fetch('https://api.ipify.org?format=json').then(r => r.json());
            input.value = ip;
            lookup(ip);
        } catch {
            input.placeholder = 'Could not detect your IP';
        } finally {
            myIpBtn.disabled = false;
        }
    });
})();

// Discord copy
// Threat Intel Page
(function initIntelPage() {
    const grid       = document.getElementById('intelGrid');
    const refreshBtn = document.getElementById('intelRefresh');
    const filterBtns = document.querySelectorAll('.intel-filter-btn');
    if (!grid) return;

    const WORKER = 'https://rss-proxy.zeusthegoat.workers.dev/?url=';

    const FEEDS = [
        { url: 'https://thehackernews.com/feeds/posts/default', label: 'THN',   badgeClass: 'badge-thn'   },
        { url: 'https://krebsonsecurity.com/feed/',              label: 'Krebs', badgeClass: 'badge-krebs' },
        { url: 'https://isc.sans.edu/rssfeed_full.xml',         label: 'SANS',  badgeClass: 'badge-sans'  },
    ];

    let allItems    = [];
    let loaded      = false;
    let activeFilter = 'all';

    function stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html || '';
        return tmp.textContent.trim();
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d)) return '';
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function renderCards() {
        if (!loaded) return;
        const items = activeFilter === 'all'
            ? allItems
            : allItems.filter(i => i.label === activeFilter);

        if (!items.length) {
            const src = activeFilter === 'all' ? 'any source' : activeFilter;
            grid.innerHTML = `<div class="intel-error"><i class="fas fa-triangle-exclamation"></i> No articles loaded from ${src}. Try refreshing.</div>`;
            return;
        }

        grid.innerHTML = items.map(item => `
            <a class="intel-card" href="${item.link}" target="_blank" rel="noopener noreferrer">
                <div class="intel-card-top">
                    <span class="intel-source-badge ${item.badgeClass}">${item.label}</span>
                    <span class="intel-date">${formatDate(item.date)}</span>
                </div>
                <div class="intel-title">${item.title}</div>
                ${item.desc ? `<div class="intel-desc">${item.desc}</div>` : ''}
                <span class="intel-read-more">Read more →</span>
            </a>
        `).join('');
    }

    /* Parse RSS/Atom XML string → array of plain objects.
       Uses getElementsByTagName (namespace-agnostic) instead of querySelector
       so feeds with xmlns declarations are handled correctly. */
    function parseXml(xmlStr) {
        const doc = new DOMParser().parseFromString(xmlStr, 'text/xml');
        if (doc.querySelector('parsererror')) return [];

        let els = [...doc.getElementsByTagName('entry')];  // Atom
        const isAtom = els.length > 0;
        if (!isAtom) els = [...doc.getElementsByTagName('item')];  // RSS

        return els.slice(0, 15).map(el => {
            const title = el.getElementsByTagName('title')[0]?.textContent?.trim() || 'Untitled';

            let link = '';
            if (isAtom) {
                const links = [...el.getElementsByTagName('link')];
                const best  = links.find(l => l.getAttribute('rel') === 'alternate') || links[0];
                link = best?.getAttribute('href') || '';
            } else {
                const linkEl = el.getElementsByTagName('link')[0];
                link = linkEl?.textContent?.trim() || linkEl?.nextSibling?.nodeValue?.trim() || '';
            }

            const dateEl  = el.getElementsByTagName(isAtom ? 'published' : 'pubDate')[0]
                         || el.getElementsByTagName('updated')[0];
            const descEl  = el.getElementsByTagName(isAtom ? 'summary' : 'description')[0]
                         || el.getElementsByTagName('content')[0];

            return {
                title,
                link,
                date: dateEl?.textContent?.trim() || '',
                desc: stripHtml(descEl?.textContent || '').slice(0, 200),
            };
        });
    }

    /* Fetch one feed via Cloudflare Worker RSS proxy */
    async function fetchOneFeed({ url, label, badgeClass }) {
        const r = await fetch(WORKER + encodeURIComponent(url));
        if (!r.ok) throw new Error(`Worker HTTP ${r.status}`);
        const xml    = await r.text();
        const parsed = parseXml(xml);
        if (!parsed.length) throw new Error('Feed parsed empty');
        return parsed.map(item => ({ label, badgeClass, ...item }));
    }

    async function loadFeeds() {
        grid.innerHTML = '<div class="intel-loading"><i class="fas fa-circle-notch fa-spin"></i> Fetching threat intelligence…</div>';
        if (refreshBtn) refreshBtn.classList.add('spinning');
        allItems = [];
        loaded   = false;

        const results = await Promise.allSettled(FEEDS.map(f => fetchOneFeed(f)));
        results.forEach((r, i) => {
            if (r.status === 'fulfilled' && r.value?.length) {
                allItems.push(...r.value);
            } else if (r.status === 'rejected') {
                console.warn(`Intel feed failed [${FEEDS[i].label}]:`, r.reason?.message);
            }
        });

        allItems.sort((a, b) => new Date(b.date) - new Date(a.date));
        loaded = true;
        if (refreshBtn) refreshBtn.classList.remove('spinning');

        if (!allItems.length) {
            grid.innerHTML = '<div class="intel-error"><i class="fas fa-triangle-exclamation"></i> Could not load any feeds — check console and try refreshing.</div>';
            return;
        }
        renderCards();
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.src;
            renderCards();
        });
    });

    if (refreshBtn) refreshBtn.addEventListener('click', loadFeeds);

    loadFeeds();
})();

function copyDiscord() {
    navigator.clipboard.writeText('thomsonexe').then(() => {
        const confirm = document.getElementById('copyConfirm');
        confirm.classList.add('visible');
        setTimeout(() => confirm.classList.remove('visible'), 2000);
    });
}

// Guestbook
const GB_URL  = 'https://nqrdljwhvjjoahpjfrlh.supabase.co/rest/v1/guestbook';
const GB_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xcmRsandodmpqb2FocGpmcmxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MzYzMzAsImV4cCI6MjA5MzQxMjMzMH0.YO_3Ul7BzuzG7zJahTf5aOQNslOItPqCRRGXwyRCdyI';
const GB_HDRS = { 'apikey': GB_KEY, 'Authorization': 'Bearer ' + GB_KEY, 'Content-Type': 'application/json' };

function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function fmtDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}

async function loadGuestbook() {
    const box = document.getElementById('gbEntries');
    if (!box) return;
    try {
        const res = await fetch(GB_URL + '?select=*&order=created_at.desc&limit=50', { headers: GB_HDRS });
        if (!res.ok) throw new Error('fetch failed');
        const rows = await res.json();
        if (!rows.length) {
            box.innerHTML = '<p class="gb-empty">No messages yet — be the first!</p>';
            return;
        }
        box.innerHTML = rows.map(r => `
            <div class="gb-entry">
                <div class="gb-entry-header">
                    <span class="gb-entry-name">${escHtml(r.name)}</span>
                    <span class="gb-entry-date">${fmtDate(r.created_at)}</span>
                </div>
                <p class="gb-entry-msg">${escHtml(r.message)}</p>
            </div>`).join('');
    } catch (e) {
        box.innerHTML = '<p class="gb-empty">Could not load messages.</p>';
    }
}

async function initGuestbook() {
    const nameEl   = document.getElementById('gbName');
    const msgEl    = document.getElementById('gbMsg');
    const countEl  = document.getElementById('gbCount');
    const submitEl = document.getElementById('gbSubmit');
    const statusEl = document.getElementById('gbStatus');
    if (!nameEl) return;

    await loadGuestbook();

    msgEl.addEventListener('input', () => {
        countEl.textContent = 300 - msgEl.value.length;
    });

    submitEl.addEventListener('click', async () => {
        const name = nameEl.value.trim();
        const msg  = msgEl.value.trim();
        if (!name || !msg) {
            statusEl.textContent = 'Name and message are required.';
            statusEl.className = 'gb-status err';
            return;
        }
        submitEl.disabled = true;
        submitEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> sending…';
        statusEl.textContent = '';
        statusEl.className = 'gb-status';
        try {
            const res = await fetch(GB_URL, {
                method: 'POST',
                headers: { ...GB_HDRS, 'Prefer': 'return=minimal' },
                body: JSON.stringify({ name, message: msg })
            });
            if (!res.ok) throw new Error('submit failed');
            nameEl.value = '';
            msgEl.value  = '';
            countEl.textContent = '300';
            statusEl.textContent = 'Message sent!';
            statusEl.className = 'gb-status ok';
            await loadGuestbook();
        } catch (e) {
            statusEl.textContent = 'Failed to send. Try again.';
            statusEl.className = 'gb-status err';
        } finally {
            submitEl.disabled = false;
            submitEl.innerHTML = '<i class="fas fa-paper-plane"></i> submit';
        }
    });
}

initGuestbook();

// Easter egg — Konami code
(function initEasterEgg() {
    const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let pos = 0;

    const overlay = document.getElementById('eggOverlay');
    const body    = document.getElementById('eggBody');
    if (!overlay || !body) return;

    const LINES = [
        { text: 'root@thomson.cx:~# ',   cls: '',        delay: 0   },
        { text: 'nmap -sV -p- thomson.cx', cls: 'egg-cmd', delay: 0, type: true },
        { text: '\nStarting Nmap 7.94 ( https://nmap.org )', cls: '', delay: 400 },
        { text: '\nScanning thomson.cx [65535 ports]', cls: '', delay: 200 },
        { text: '\n22/tcp   open  ssh      OpenSSH 9.6', cls: '', delay: 300 },
        { text: '\n80/tcp   open  http     nginx 1.26.1', cls: '', delay: 150 },
        { text: '\n443/tcp  open  ssl/http nginx 1.26.1', cls: '', delay: 150 },
        { text: '\n1337/tcp open  ???      unknown', cls: 'egg-warn', delay: 200 },
        { text: '\n\nroot@thomson.cx:~# ', cls: '', delay: 500 },
        { text: 'nc thomson.cx 1337', cls: 'egg-cmd', delay: 0, type: true },
        { text: '\nConnecting to thomson.cx:1337...', cls: '', delay: 350 },
        { text: '\nConnection established.', cls: '', delay: 400 },
        { text: '\n\n> nice moves. you found me.\n', cls: 'egg-warn', delay: 300 },
        { text: '\n[ ACCESS GRANTED ]\n', cls: 'egg-grant', delay: 500 },
        { text: '\nflag{k0nam1_h4x0r_1337}\n', cls: 'egg-flag', delay: 300 },
    ];

    function typeInto(el, text, done) {
        let i = 0;
        function tick() {
            if (i >= text.length) { done && done(); return; }
            el.appendChild(document.createTextNode(text[i++]));
            body.scrollTop = body.scrollHeight;
            setTimeout(tick, 38 + Math.random() * 30);
        }
        tick();
    }

    function runLines(idx) {
        if (idx >= LINES.length) {
            const cur = document.createElement('span');
            cur.className = 'egg-cursor';
            cur.innerHTML = '&nbsp;';
            body.appendChild(cur);
            return;
        }
        const l = LINES[idx];
        setTimeout(() => {
            const span = document.createElement('span');
            if (l.cls) span.className = l.cls;
            body.appendChild(span);
            if (l.type) {
                typeInto(span, l.text, () => runLines(idx + 1));
            } else {
                span.textContent = l.text;
                body.scrollTop = body.scrollHeight;
                runLines(idx + 1);
            }
        }, idx === 0 ? 0 : l.delay);
    }

    function open() {
        body.innerHTML = '';
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        runLines(0);
    }

    function close() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    document.addEventListener('keydown', e => {
        if (overlay.classList.contains('active')) {
            if (e.key === 'Escape') close();
            return;
        }
        if (e.key === KONAMI[pos]) {
            pos++;
            if (pos === KONAMI.length) { pos = 0; open(); }
        } else {
            pos = e.key === KONAMI[0] ? 1 : 0;
        }
    });

    overlay.addEventListener('click', e => {
        if (e.target === overlay) close();
    });
})();

// Hero typing effect
(function initHeroTyping() {
    const el = document.getElementById('heroTyped');
    if (!el) return;

    const PHRASES = [
        'blue teamer',
        'SOC analyst',
        'incident responder',
        'defender',
    ];

    const TYPE_SPEED   = 75;
    const DELETE_SPEED = 40;
    const PAUSE_AFTER  = 1800;
    const PAUSE_BEFORE = 400;

    let phraseIdx = 0;
    let charIdx   = 0;
    let deleting  = false;

    function tick() {
        const phrase = PHRASES[phraseIdx];

        if (!deleting) {
            el.textContent = phrase.slice(0, ++charIdx);
            if (charIdx === phrase.length) {
                deleting = true;
                setTimeout(tick, PAUSE_AFTER);
                return;
            }
            setTimeout(tick, TYPE_SPEED + Math.random() * 30);
        } else {
            el.textContent = phrase.slice(0, --charIdx);
            if (charIdx === 0) {
                deleting  = false;
                phraseIdx = (phraseIdx + 1) % PHRASES.length;
                setTimeout(tick, PAUSE_BEFORE);
                return;
            }
            setTimeout(tick, DELETE_SPEED);
        }
    }

    setTimeout(tick, 800);
})();

// Visitor counter
(async function initVisitorCounter() {
    const el = document.getElementById('visitorCount');
    if (!el) return;
    try {
        const res = await fetch('https://nqrdljwhvjjoahpjfrlh.supabase.co/rest/v1/rpc/increment_visitors', {
            method: 'POST',
            headers: GB_HDRS
        });
        if (!res.ok) throw new Error();
        const count = await res.json();
        el.textContent = Number(count).toLocaleString();
    } catch {
        el.closest('.footer-visitors').style.display = 'none';
    }
})();

// Scroll reveal
(function initReveal() {
    const targets = [
        '.section-title',
        '.cert-card',
        '.project-card',
        '.about-text',
        '.skill-category',
        '.gb-form-wrap',
        '.gb-entries',
        '.contact-grid',
        '.ctf-card',
        '.threat-log-wrap',
        '.threat-stats',
    ];

    const els = document.querySelectorAll(targets.join(','));
    els.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
            const idx = siblings.indexOf(el);
            el.style.transitionDelay = idx > 0 ? `${idx * 0.08}s` : '0s';
            el.classList.add('visible');
            observer.unobserve(el);
        });
    }, { threshold: 0.12 });

    els.forEach(el => observer.observe(el));
})();

// Tools Page — Hash / URL / Breach
(function initToolsPage() {
    const tabs = document.querySelectorAll('.tools-tab');
    if (!tabs.length) return;

    const WORKER = 'https://ip-check.zeusthegoat.workers.dev/';

    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tools-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('panel-' + btn.dataset.panel).classList.add('active');
        });
    });

    function scoreClass(mal, total) {
        const pct = total ? mal / total : 0;
        if (mal === 0)   return 'score-low';
        if (pct < 0.15)  return 'score-medium';
        if (pct < 0.4)   return 'score-high';
        return 'score-critical';
    }
    function scoreLabel(mal) {
        if (mal === 0)  return 'Clean';
        if (mal <= 3)   return 'Suspicious';
        if (mal <= 10)  return 'Malicious';
        return 'Critical';
    }

    function renderVt(data, displayLabel, extraRows) {
        const a     = data.data.attributes;
        const stats = a.last_analysis_stats || {};
        const mal   = stats.malicious  || 0;
        const sus   = stats.suspicious || 0;
        const har   = stats.harmless   || 0;
        const und   = stats.undetected || 0;
        const total = mal + sus + har + und + (stats.timeout || 0);
        const pct   = total ? Math.round((mal / total) * 100) : 0;
        const cls   = scoreClass(mal, total);
        const lbl   = scoreLabel(mal);

        const extraHtml = extraRows.map(({ icon, name, val }) =>
            val != null && val !== '' ? `
            <div class="ip-info-card">
                <span class="ip-info-label"><i class="${icon}"></i> ${name}</span>
                <span class="ip-info-val">${val}</span>
            </div>` : ''
        ).join('');

        return `
        <div class="ip-result-card">
            <div class="ip-score-section ${cls}">
                <div class="ip-score-val">${mal}<span class="ip-score-denom"> / ${total}</span></div>
                <div class="ip-score-bar-wrap"><div class="ip-score-bar" style="width:${pct}%"></div></div>
                <div class="ip-score-label">${lbl} &mdash; vendors flagged this as malicious</div>
            </div>
            <div class="ip-address-display">${displayLabel}</div>
            <div class="ip-info-grid">
                <div class="ip-info-card">
                    <span class="ip-info-label"><i class="fas fa-circle-xmark" style="color:#ff4d4d"></i> Malicious</span>
                    <span class="ip-info-val">${mal}</span>
                </div>
                <div class="ip-info-card">
                    <span class="ip-info-label"><i class="fas fa-circle-exclamation" style="color:#ffb400"></i> Suspicious</span>
                    <span class="ip-info-val">${sus}</span>
                </div>
                <div class="ip-info-card">
                    <span class="ip-info-label"><i class="fas fa-circle-check" style="color:#00c864"></i> Harmless</span>
                    <span class="ip-info-val">${har}</span>
                </div>
                <div class="ip-info-card">
                    <span class="ip-info-label"><i class="fas fa-circle" style="color:var(--text-muted)"></i> Undetected</span>
                    <span class="ip-info-val">${und}</span>
                </div>
                ${extraHtml}
            </div>
            <p class="ip-attribution">Data provided by <a href="https://www.virustotal.com" target="_blank" rel="noopener">VirusTotal</a></p>
        </div>`;
    }

    // Hash lookup
    (function() {
        const input = document.getElementById('hashInput');
        const btn   = document.getElementById('hashSearchBtn');
        const out   = document.getElementById('hashResults');
        if (!input) return;

        async function lookup(hash) {
            hash = hash.trim();
            if (!hash) return;
            out.innerHTML = '<div class="ip-loading"><i class="fas fa-circle-notch fa-spin"></i> Looking up hash&hellip;</div>';
            try {
                const r    = await fetch(WORKER + '?hash=' + encodeURIComponent(hash));
                const data = await r.json();
                if (data.error) throw new Error(data.error.message || 'Hash not found in VirusTotal');
                if (!data.data) throw new Error('No data returned');
                const a = data.data.attributes;
                const hashes = [
                    { label: 'MD5',     val: a.md5 },
                    { label: 'SHA-1',   val: a.sha1 },
                    { label: 'SHA-256', val: a.sha256 },
                ].filter(h => h.val);
                const hashSection = hashes.length ? `
                <div class="hash-details">
                    ${hashes.map(h => `
                    <div class="hash-row">
                        <span class="hash-label">${h.label}</span>
                        <span class="hash-val">${h.val}</span>
                    </div>`).join('')}
                </div>` : '';
                out.innerHTML = renderVt(data, a.meaningful_name || hash, [
                    { icon: 'fas fa-file',           name: 'Type', val: a.type_description || a.type_tag },
                    { icon: 'fas fa-weight-hanging', name: 'Size', val: a.size ? (a.size / 1024).toFixed(1) + ' KB' : null },
                    { icon: 'fas fa-tags',           name: 'Tags', val: (a.tags || []).slice(0, 5).join(', ') || null },
                ]) + hashSection;
            } catch (e) {
                out.innerHTML = `<div class="ip-error"><i class="fas fa-triangle-exclamation"></i> ${e.message || 'Lookup failed.'}</div>`;
            }
        }

        btn.addEventListener('click', () => lookup(input.value));
        input.addEventListener('keydown', e => { if (e.key === 'Enter') lookup(input.value); });
    })();

    // URL scan
    (function() {
        const input = document.getElementById('urlInput');
        const btn   = document.getElementById('urlSearchBtn');
        const out   = document.getElementById('urlResults');
        if (!input) return;

        async function scan(raw) {
            raw = raw.trim();
            if (!raw) return;
            const url = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
            out.innerHTML = '<div class="ip-loading"><i class="fas fa-circle-notch fa-spin"></i> Scanning URL&hellip;</div>';
            try {
                const r    = await fetch(WORKER + '?url=' + encodeURIComponent(url));
                const data = await r.json();
                if (data._submitted) {
                    out.innerHTML = '<div class="ip-error" style="color:var(--accent-cyan)"><i class="fas fa-circle-info"></i> URL submitted for scanning &mdash; check back in a moment.</div>';
                    return;
                }
                if (data.error) throw new Error(data.error.message || 'URL not found in VirusTotal');
                if (!data.data) throw new Error('No data returned');
                const a = data.data.attributes;
                const cats = a.categories ? Object.values(a.categories).slice(0, 2).join(', ') : null;
                out.innerHTML = renderVt(data, a.url || url, [
                    { icon: 'fas fa-globe',  name: 'Final URL',   val: a.final_url !== a.url ? a.final_url : null },
                    { icon: 'fas fa-heading',name: 'Page Title',  val: a.title },
                    { icon: 'fas fa-server', name: 'HTTP Status', val: a.last_http_response_code },
                    { icon: 'fas fa-star',   name: 'Reputation',  val: a.reputation != null ? a.reputation : null },
                    { icon: 'fas fa-tag',    name: 'Category',    val: cats },
                ]);
            } catch (e) {
                out.innerHTML = `<div class="ip-error"><i class="fas fa-triangle-exclamation"></i> ${e.message || 'Scan failed.'}</div>`;
            }
        }

        btn.addEventListener('click', () => scan(input.value));
        input.addEventListener('keydown', e => { if (e.key === 'Enter') scan(input.value); });
    })();

    // Password breach check — k-anonymity via HIBP free API (no key required)
    (function() {
        const input = document.getElementById('breachInput');
        const btn   = document.getElementById('breachSearchBtn');
        const out   = document.getElementById('breachResults');
        if (!input) return;

        async function sha1hex(str) {
            const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(str));
            return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
        }

        async function check(password) {
            if (!password) return;
            out.innerHTML = '<div class="ip-loading"><i class="fas fa-circle-notch fa-spin"></i> Checking&hellip;</div>';
            try {
                const hash   = await sha1hex(password);
                const prefix = hash.slice(0, 5);
                const suffix = hash.slice(5);
                const r      = await fetch('https://api.pwnedpasswords.com/range/' + prefix);
                if (!r.ok) throw new Error('API error ' + r.status);
                const lines = (await r.text()).split('\n');
                const match = lines.find(l => l.toUpperCase().startsWith(suffix));
                const count = match ? parseInt(match.split(':')[1], 10) : 0;

                if (count === 0) {
                    out.innerHTML = `
                    <div class="breach-result-card breach-clean">
                        <div class="breach-status-text">
                            <strong>Password not pwned.</strong>
                            <span>This password wasn't found in any known data breach — safe to use.</span>
                        </div>
                        <div class="breach-thumbs-up"><i class="fas fa-thumbs-up"></i></div>
                    </div>`;
                } else {
                    out.innerHTML = `
                    <div class="breach-result-card breach-pwned">
                        <div class="breach-status-text">
                            <strong>Password pwned.</strong>
                            <span>Found <strong>${count.toLocaleString()}</strong> time${count !== 1 ? 's' : ''} in known data breaches &mdash; do not use this password.</span>
                            <span style="font-size:0.82rem;color:var(--text-secondary);margin-top:0.2rem">Change it anywhere it's used.</span>
                        </div>
                        <div class="breach-thumbs-down"><i class="fas fa-thumbs-down"></i></div>
                    </div>`;
                }
            } catch (e) {
                out.innerHTML = `<div class="ip-error"><i class="fas fa-triangle-exclamation"></i> ${e.message || 'Check failed.'}</div>`;
            }
        }

        btn.addEventListener('click', () => check(input.value));
        input.addEventListener('keydown', e => { if (e.key === 'Enter') check(input.value); });
    })();

    // ── Subnet Calculator ────────────────────────────────────────────────
    (function() {
        const input = document.getElementById('subnetInput');
        const btn   = document.getElementById('subnetBtn');
        const out   = document.getElementById('subnetResults');
        if (!input) return;

        function ipToInt(ip) {
            return ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0) >>> 0;
        }
        function intToIp(n) {
            return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.');
        }

        function calculate(val) {
            val = val.trim();
            if (!val) return;
            if (!val.includes('/')) {
                out.innerHTML = `<div class="ip-error"><i class="fas fa-triangle-exclamation"></i> Enter an address in CIDR notation, e.g. 192.168.1.0/24</div>`;
                return;
            }
            const [ip, cidrStr] = val.split('/');
            const cidr = parseInt(cidrStr, 10);
            const parts = (ip || '').split('.');
            if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255) || isNaN(cidr) || cidr < 0 || cidr > 32) {
                out.innerHTML = `<div class="ip-error"><i class="fas fa-triangle-exclamation"></i> Invalid IP/CIDR — e.g. 10.0.0.0/8</div>`;
                return;
            }
            const mask      = cidr === 0 ? 0 : ((0xFFFFFFFF << (32 - cidr)) >>> 0);
            const wildcard  = (~mask) >>> 0;
            const network   = (ipToInt(ip) & mask) >>> 0;
            const broadcast = (network | wildcard) >>> 0;
            const usable    = Math.pow(2, 32 - cidr);
            const hosts     = cidr >= 31 ? usable : usable - 2;
            const rows = [
                ['Network Address',   intToIp(network)],
                ['Broadcast Address', cidr < 31 ? intToIp(broadcast) : 'N/A'],
                ['Subnet Mask',       intToIp(mask)],
                ['Wildcard Mask',     intToIp(wildcard)],
                ['First Usable Host', cidr < 31 ? intToIp(network + 1) : intToIp(network)],
                ['Last Usable Host',  cidr < 31 ? intToIp(broadcast - 1) : intToIp(broadcast)],
                ['Total Addresses',   usable.toLocaleString()],
                ['Usable Hosts',      cidr >= 31 ? usable.toLocaleString() : hosts.toLocaleString()],
                ['Host Bits',         (32 - cidr).toString()],
                ['CIDR Prefix',       '/' + cidr],
            ];
            out.innerHTML = `<div class="subnet-results">${rows.map(([label, val]) => `
                <div class="ip-info-card">
                    <span class="ip-info-label">${label}</span>
                    <span class="ip-info-val">${val}</span>
                </div>`).join('')}</div>`;
        }

        btn.addEventListener('click', () => calculate(input.value));
        input.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(input.value); });
    })();

    // ── CVSS v3.1 Calculator ─────────────────────────────────────────────
    (function() {
        if (!document.getElementById('cvssResult')) return;
        const AV = {N:0.85,A:0.62,L:0.55,P:0.2};
        const AC = {L:0.77,H:0.44};
        const PR = {N:0.85,L:0.62,H:0.27};
        const UI = {N:0.85,R:0.62};
        const CI = {N:0,L:0.22,H:0.56};
        const sel = {AV:null,AC:null,PR:null,UI:null,S:null,C:null,I:null,A:null};

        function roundup(n) { return Math.ceil(n * 10) / 10; }

        function recalc() {
            const out = document.getElementById('cvssResult');
            if (Object.values(sel).some(v => v === null)) { out.innerHTML = ''; return; }
            const sc = sel.S === 'C';
            const prVal = sc && sel.PR !== 'N' ? 0.50 : PR[sel.PR];
            const iscBase = 1 - (1 - CI[sel.C]) * (1 - CI[sel.I]) * (1 - CI[sel.A]);
            const isc = sc
                ? 7.52 * (iscBase - 0.029) - 3.25 * Math.pow(iscBase - 0.02, 15)
                : 6.42 * iscBase;
            const exp = 8.22 * AV[sel.AV] * AC[sel.AC] * prVal * UI[sel.UI];
            let score = 0;
            if (isc > 0) score = roundup(Math.min(sc ? 1.08*(isc+exp) : isc+exp, 10));
            const [sev, cls] = score === 0 ? ['None','score-low']
                : score < 4 ? ['Low','score-low']
                : score < 7 ? ['Medium','score-medium']
                : score < 9 ? ['High','score-high']
                : ['Critical','score-critical'];
            const vec = `CVSS:3.1/AV:${sel.AV}/AC:${sel.AC}/PR:${sel.PR}/UI:${sel.UI}/S:${sel.S}/C:${sel.C}/I:${sel.I}/A:${sel.A}`;
            out.innerHTML = `
            <div class="ip-result-card" style="margin-top:1.5rem">
                <div class="ip-score-section ${cls}">
                    <div class="ip-score-val">${score.toFixed(1)}<span class="ip-score-denom"> / 10</span></div>
                    <div class="ip-score-bar-wrap"><div class="ip-score-bar" style="width:${score*10}%"></div></div>
                    <div class="ip-score-label">${sev}</div>
                </div>
                <div class="ip-address-display" style="font-size:0.72rem;word-break:break-all;padding:1rem 1.5rem;letter-spacing:0">${vec}</div>
            </div>`;
        }

        document.querySelectorAll('.cvss-btns').forEach(group => {
            group.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                    group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    sel[group.dataset.metric] = btn.dataset.val;
                    recalc();
                });
            });
        });
    })();

    // ── Codec — Base64 / Hex / URL ───────────────────────────────────────
    (function() {
        const inp = document.getElementById('codecInput');
        const out = document.getElementById('codecOutput');
        if (!inp) return;
        function set(v) { out.value = v; }
        function err(m) { out.value = 'Error: ' + m; }
        document.getElementById('b64EncBtn').addEventListener('click', () => {
            try { set(btoa(unescape(encodeURIComponent(inp.value)))); } catch(e) { err(e.message); }
        });
        document.getElementById('b64DecBtn').addEventListener('click', () => {
            try { set(decodeURIComponent(escape(atob(inp.value.trim())))); } catch { err('Invalid Base64'); }
        });
        document.getElementById('hexEncBtn').addEventListener('click', () => {
            set(Array.from(new TextEncoder().encode(inp.value)).map(b=>b.toString(16).padStart(2,'0')).join(''));
        });
        document.getElementById('hexDecBtn').addEventListener('click', () => {
            try {
                const h = inp.value.trim().replace(/\s/g,'');
                if (h.length % 2) throw 0;
                set(new TextDecoder().decode(new Uint8Array(h.match(/.{2}/g).map(x=>parseInt(x,16)))));
            } catch { err('Invalid hex string'); }
        });
        document.getElementById('urlEncBtn').addEventListener('click', () => {
            set(encodeURIComponent(inp.value));
        });
        document.getElementById('urlDecBtn').addEventListener('click', () => {
            try { set(decodeURIComponent(inp.value)); } catch { err('Invalid URL-encoded string'); }
        });
    })();

    // ── JWT Decoder ──────────────────────────────────────────────────────
    (function() {
        const input = document.getElementById('jwtInput');
        const btn   = document.getElementById('jwtBtn');
        const out   = document.getElementById('jwtResults');
        if (!input) return;

        function b64url(s) {
            s = s.replace(/-/g,'+').replace(/_/g,'/');
            while (s.length % 4) s += '=';
            return decodeURIComponent(atob(s).split('').map(c=>'%'+c.charCodeAt(0).toString(16).padStart(2,'0')).join(''));
        }

        function decode(token) {
            token = token.trim();
            if (!token) return;
            const parts = token.split('.');
            if (parts.length !== 3) {
                out.innerHTML = `<div class="ip-error"><i class="fas fa-triangle-exclamation"></i> Not a valid JWT — must have 3 dot-separated parts.</div>`;
                return;
            }
            try {
                const header  = JSON.parse(b64url(parts[0]));
                const payload = JSON.parse(b64url(parts[1]));
                let expHtml = '';
                if (payload.exp) {
                    const d = new Date(payload.exp * 1000);
                    const expired = d < new Date();
                    expHtml = `<div class="jwt-exp ${expired?'jwt-expired':'jwt-valid'}">
                        <i class="fas fa-${expired?'circle-xmark':'circle-check'}"></i>
                        Token ${expired?'expired':'valid'} &mdash; exp: ${d.toUTCString()}
                    </div>`;
                }
                out.innerHTML = `${expHtml}
                <div class="jwt-parts">
                    <div class="jwt-part"><div class="jwt-part-label">Header</div><pre class="jwt-code">${JSON.stringify(header,null,2)}</pre></div>
                    <div class="jwt-part"><div class="jwt-part-label">Payload</div><pre class="jwt-code">${JSON.stringify(payload,null,2)}</pre></div>
                </div>
                <p class="ip-attribution"><i class="fas fa-info-circle"></i> Signature not verified &mdash; decoded client-side only.</p>`;
            } catch(e) {
                out.innerHTML = `<div class="ip-error"><i class="fas fa-triangle-exclamation"></i> Failed to decode: ${e.message}</div>`;
            }
        }

        btn.addEventListener('click', () => decode(input.value));
        input.addEventListener('keydown', e => { if (e.key === 'Enter') decode(input.value); });
    })();

    // ── Regex Tester ─────────────────────────────────────────────────────
    (function() {
        const patInp   = document.getElementById('regexPattern');
        const flagsInp = document.getElementById('regexFlags');
        const testInp  = document.getElementById('regexTest');
        const out      = document.getElementById('regexResults');
        if (!patInp) return;

        function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

        function run() {
            const pattern = patInp.value;
            const testStr = testInp.value;
            out.innerHTML = '';
            if (!pattern || !testStr) return;
            let regex;
            try {
                const flags = new Set((flagsInp.value || '').replace(/[^gimsuy]/g,'').split(''));
                flags.add('g');
                regex = new RegExp(pattern, [...flags].join(''));
            } catch(e) {
                out.innerHTML = `<div class="ip-error"><i class="fas fa-triangle-exclamation"></i> Invalid regex: ${e.message}</div>`;
                return;
            }
            const matches = [...testStr.matchAll(regex)];
            if (!matches.length) {
                out.innerHTML = `<div class="regex-no-match"><i class="fas fa-times-circle"></i> No matches found.</div>`;
                return;
            }
            let highlighted = '', last = 0;
            for (const m of matches) {
                highlighted += esc(testStr.slice(last, m.index));
                highlighted += `<mark class="regex-match">${esc(m[0] || '')}</mark>`;
                last = m.index + (m[0].length || 1);
            }
            highlighted += esc(testStr.slice(last));

            const hasGroups = matches[0].length > 1;
            const groupHeaders = hasGroups ? matches[0].slice(1).map((_,i)=>`<th>Group ${i+1}</th>`).join('') : '';
            const rows = matches.slice(0,50).map((m,i) => {
                const gs = hasGroups ? m.slice(1).map(g=>`<td><code>${g!==undefined?esc(g):'—'}</code></td>`).join('') : '';
                return `<tr><td>${i+1}</td><td><code>${esc(m[0]||'')}</code></td><td>${m.index}</td>${gs}</tr>`;
            }).join('');

            out.innerHTML = `
            <div class="regex-summary"><i class="fas fa-check-circle" style="color:#00c864"></i> <strong>${matches.length}</strong> match${matches.length!==1?'es':''} found</div>
            <div class="regex-highlighted">${highlighted}</div>
            <div class="kql-table-wrap" style="margin-top:1rem">
                <table class="kql-table">
                    <thead><tr><th>#</th><th>Match</th><th>Index</th>${groupHeaders}</tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
        }

        [patInp, flagsInp, testInp].forEach(el => el.addEventListener('input', run));
    })();
})();

// ── Global auth nav button + modal ───────────────────────────────────────────
(function initGlobalAuth() {
    const SB_URL = 'https://nqrdljwhvjjoahpjfrlh.supabase.co';
    const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xcmRsandodmpqb2FocGpmcmxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MzYzMzAsImV4cCI6MjA5MzQxMjMzMH0.YO_3Ul7BzuzG7zJahTf5aOQNslOItPqCRRGXwyRCdyI';
    const inputStyle = 'width:100%;background:var(--bg-primary,#060d14);border:1px solid var(--border,#1e2d3d);border-radius:8px;padding:0.65rem 0.9rem;color:var(--text-primary,#e2e8f0);font-family:var(--font-mono,monospace);font-size:0.85rem;margin-bottom:0.75rem;box-sizing:border-box;';
    const btnStyle  = 'width:100%;background:var(--accent,#00ff88);color:var(--bg-primary,#060d14);border:none;border-radius:8px;padding:0.72rem;font-family:var(--font-mono,monospace);font-size:0.85rem;font-weight:600;cursor:pointer;';
    const tabStyle  = (active) => 'font-family:var(--font-mono,monospace);font-size:0.82rem;background:none;border:none;border-bottom:2px solid '+(active?'var(--accent,#00ff88)':'transparent')+';padding:0.6rem 1.1rem;margin-bottom:-1px;cursor:pointer;color:'+(active?'var(--accent,#00ff88)':'var(--text-secondary,#8b9ab1)')+';';

    document.body.insertAdjacentHTML('beforeend', `
    <div id="gaOverlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.82);z-index:9999;align-items:center;justify-content:center;padding:1rem;">
      <div style="background:var(--bg-secondary,#0d1117);border:1px solid var(--border-accent,#00ff88);border-radius:12px;padding:2rem;max-width:400px;width:100%;position:relative;box-shadow:0 0 40px rgba(0,255,136,0.12);">
        <button onclick="document.getElementById('gaOverlay').style.display='none'" style="position:absolute;top:0.75rem;right:0.75rem;background:none;border:none;color:var(--text-secondary,#8b9ab1);font-size:1rem;cursor:pointer;"><i class="fas fa-times"></i></button>
        <div id="gaOut">
          <div style="display:flex;margin-bottom:1.5rem;border-bottom:1px solid var(--border,#1e2d3d);">
            <button id="gaTabIn"  onclick="gaTab('in')"  style="${tabStyle(true)}">Sign In</button>
            <button id="gaTabUp"  onclick="gaTab('up')"  style="${tabStyle(false)}">Sign Up</button>
          </div>
          <div id="gaFormIn">
            <input type="email"    id="gaEmail"    placeholder="email"    autocomplete="email"            style="${inputStyle}">
            <input type="password" id="gaPass"     placeholder="password" autocomplete="current-password" style="${inputStyle}">
            <button onclick="gaSignIn()" style="${btnStyle}">Sign In</button>
            <p id="gaInMsg" style="font-family:var(--font-mono,monospace);font-size:0.8rem;margin-top:0.75rem;min-height:1.2em;"></p>
          </div>
          <div id="gaFormUp" style="display:none;">
            <input type="text"     id="gaUser"     placeholder="username (3-20 chars, a-z 0-9 _-)" autocomplete="off"          style="${inputStyle}">
            <input type="email"    id="gaEmailUp"  placeholder="email"                             autocomplete="email"         style="${inputStyle}">
            <input type="password" id="gaPassUp"   placeholder="password (min 6 chars)"            autocomplete="new-password"  style="${inputStyle}">
            <button onclick="gaSignUp()" style="${btnStyle}">Create Account</button>
            <p id="gaUpMsg" style="font-family:var(--font-mono,monospace);font-size:0.8rem;margin-top:0.75rem;min-height:1.2em;"></p>
          </div>
        </div>
        <div id="gaIn" style="display:none;">
          <p style="font-family:var(--font-mono,monospace);font-size:0.9rem;color:var(--text-primary,#e2e8f0);margin-bottom:1rem;">Signed in as <span id="gaName" style="color:var(--accent,#00ff88);"></span></p>
          <div style="display:flex;gap:0.6rem;flex-wrap:wrap;">
            <a href="/profile" style="font-family:var(--font-mono,monospace);font-size:0.78rem;padding:0.4rem 0.9rem;background:var(--accent,#00ff88);color:var(--bg-primary,#060d14);border-radius:6px;text-decoration:none;display:inline-flex;align-items:center;gap:0.4rem;"><i class="fas fa-id-card"></i> Profile</a>
            <button onclick="gaSignOut()" style="font-family:var(--font-mono,monospace);font-size:0.78rem;color:var(--text-secondary,#8b9ab1);background:none;border:1px solid var(--border,#1e2d3d);border-radius:6px;padding:0.35rem 0.85rem;cursor:pointer;">Sign Out</button>
          </div>
        </div>
      </div>
    </div>`);

    document.getElementById('gaOverlay').addEventListener('click', function(e) {
        if (e.target === this) this.style.display = 'none';
    });

    // ── Profile dropdown ──
    document.body.insertAdjacentHTML('beforeend', `
    <div id="gaDropdown" style="display:none;position:fixed;z-index:9998;min-width:160px;background:var(--bg-secondary,#0d1117);border:1px solid var(--border-accent,rgba(0,255,136,0.35));border-radius:8px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.5);">
      <a href="/profile" id="gaDropProfile" style="display:flex;align-items:center;gap:0.6rem;padding:0.65rem 1rem;font-family:var(--font-mono,monospace);font-size:0.8rem;color:var(--text-primary,#e2e8f0);text-decoration:none;transition:background 0.15s;">
        <i class="fas fa-id-card" style="color:var(--accent,#00ff88);width:14px;"></i> Edit Profile
      </a>
      <button onclick="gaSignOut()" style="display:flex;align-items:center;gap:0.6rem;width:100%;padding:0.65rem 1rem;font-family:var(--font-mono,monospace);font-size:0.8rem;color:#ff5f57;background:none;border:none;border-top:1px solid var(--border,#1e2d3d);cursor:pointer;transition:background 0.15s;">
        <i class="fas fa-sign-out-alt" style="width:14px;"></i> Sign Out
      </button>
    </div>`);

    const gaDrop = document.getElementById('gaDropdown');
    document.getElementById('gaDropProfile').addEventListener('mouseenter', function() { this.style.background='rgba(255,255,255,0.04)'; });
    document.getElementById('gaDropProfile').addEventListener('mouseleave', function() { this.style.background=''; });

    function positionDropdown(btn) {
        const r = btn.getBoundingClientRect();
        gaDrop.style.top  = (r.bottom + 8) + 'px';
        gaDrop.style.right = (window.innerWidth - r.right) + 'px';
        gaDrop.style.left  = 'auto';
    }

    function closeDropdown() { gaDrop.style.display = 'none'; }

    document.addEventListener('click', function(e) {
        if (!gaDrop.contains(e.target) && e.target !== document.getElementById('authNavBtn')) {
            closeDropdown();
        }
    });

    let _sb = null;
    function getSb(cb) {
        if (_sb) { cb(_sb); return; }
        if (window.supabase) { _sb = window.supabase.createClient(SB_URL, SB_KEY); cb(_sb); return; }
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        s.onload = () => { _sb = window.supabase.createClient(SB_URL, SB_KEY); cb(_sb); };
        document.head.appendChild(s);
    }

    function setNavBtn(username) {
        const btn = document.getElementById('authNavBtn');
        if (!btn) return;
        if (username) {
            btn.innerHTML = '<i class="fas fa-user"></i> ' + username.replace(/</g,'&lt;').replace(/>/g,'&gt;') + ' <i class="fas fa-caret-down" style="font-size:0.65rem;opacity:0.7;margin-left:2px;"></i>';
            btn.classList.add('active');
            btn.onclick = function(e) {
                e.stopPropagation();
                if (gaDrop.style.display === 'none' || !gaDrop.style.display) {
                    positionDropdown(btn);
                    gaDrop.style.display = 'block';
                } else {
                    closeDropdown();
                }
            };
        } else {
            btn.innerHTML = '<i class="fas fa-user"></i> sign in';
            btn.classList.remove('active');
            btn.onclick = function() { location.href = '/auth'; };
        }
    }

    function showGaSignedIn(uname) {
        document.getElementById('gaName').textContent = uname;
        document.getElementById('gaOut').style.display = 'none';
        document.getElementById('gaIn').style.display = '';
    }

    window.gaTab = function(t) {
        const isIn = t === 'in';
        document.getElementById('gaFormIn').style.display = isIn ? '' : 'none';
        document.getElementById('gaFormUp').style.display = isIn ? 'none' : '';
        document.getElementById('gaTabIn').style.cssText = tabStyle(isIn);
        document.getElementById('gaTabUp').style.cssText = tabStyle(!isIn);
    };

    window.openGaModal = function(tab) {
        const overlay = document.getElementById('gaOverlay');
        overlay.style.display = 'flex';
        const uname = localStorage.getItem('ctf_username');
        if (uname) { showGaSignedIn(uname); return; }
        document.getElementById('gaOut').style.display = '';
        document.getElementById('gaIn').style.display = 'none';
        gaTab(tab || 'in');
    };

    window.gaSignIn = function() {
        const msg = document.getElementById('gaInMsg');
        const email = document.getElementById('gaEmail').value.trim();
        const pass  = document.getElementById('gaPass').value;
        msg.style.color = 'var(--text-secondary,#8b9ab1)'; msg.textContent = 'Signing in…';
        getSb(async function(sb) {
            const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
            if (error) { msg.style.color = '#ff5f57'; msg.textContent = error.message; return; }
            let { data: profile } = await sb.from('profiles').select('username').eq('id', data.user.id).single();
            if (!profile) {
                const u = data.user.email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,20);
                await sb.from('profiles').insert({ id: data.user.id, username: u });
                profile = { username: u };
            }
            localStorage.setItem('ctf_username', profile.username);
            setNavBtn(profile.username);
            showGaSignedIn(profile.username);
            msg.style.color = 'var(--accent,#00ff88)'; msg.textContent = 'Signed in!';
        });
    };

    window.gaSignUp = function() {
        const msg  = document.getElementById('gaUpMsg');
        const user = document.getElementById('gaUser').value.trim();
        const email= document.getElementById('gaEmailUp').value.trim();
        const pass = document.getElementById('gaPassUp').value;
        if (!/^[a-zA-Z0-9_-]{3,20}$/.test(user)) {
            msg.style.color = '#ff5f57'; msg.textContent = 'Username: 3-20 chars, letters/numbers/_-'; return;
        }
        msg.style.color = 'var(--text-secondary,#8b9ab1)'; msg.textContent = 'Creating account…';
        getSb(async function(sb) {
            const { data, error } = await sb.auth.signUp({ email, password: pass, options: { data: { username: user } } });
            if (error) { msg.style.color = '#ff5f57'; msg.textContent = error.message; return; }
            if (data.user) {
                await sb.from('profiles').insert({ id: data.user.id, username: user });
                localStorage.setItem('ctf_username', user);
                setNavBtn(user);
                showGaSignedIn(user);
                msg.style.color = 'var(--accent,#00ff88)'; msg.textContent = 'Account created!';
            }
        });
    };

    window.gaSignOut = function() {
        getSb(async function(sb) { await sb.auth.signOut(); });
        localStorage.removeItem('ctf_username');
        localStorage.removeItem('ctf_avatar');
        setNavBtn(null);
        document.getElementById('gaOverlay').style.display = 'none';
    };

    // Init nav button on page load
    setNavBtn(localStorage.getItem('ctf_username'));
})();

// ── Global site search ───────────────────────────────────────────────────────
(function initSiteSearch() {
    var PAGES = [
        { title: 'Home',                   url: '/',                          cat: 'page', icon: 'fa-house' },
        { title: 'About',                  url: '/about',                     cat: 'page', icon: 'fa-user' },
        { title: 'Notes',                  url: '/labs',                      cat: 'page', icon: 'fa-book-open' },
        { title: 'Tools',                  url: '/tools',                     cat: 'page', icon: 'fa-wrench' },
        { title: 'CTF Lab',                url: '/vm',                        cat: 'page', icon: 'fa-flag' },
        { title: 'CVEs',                   url: '/cves',                      cat: 'page', icon: 'fa-bug' },
        { title: 'News',                   url: '/intel',                     cat: 'page', icon: 'fa-newspaper' },
        { title: 'Links',                  url: '/links',                     cat: 'page', icon: 'fa-link' },
        { title: 'Guestbook',              url: '/guestbook',                 cat: 'page', icon: 'fa-comments' },
        { title: 'Profile',                url: '/profile',                   cat: 'page', icon: 'fa-id-card' },
        { title: 'Leaderboard',            url: '/leaderboard',               cat: 'page', icon: 'fa-trophy' },
        { title: 'init.flag',          url: '/vm#init-flag',        cat: 'lab', icon: 'fa-terminal', diff: 'easy',   pts: 25,  cat2: 'Linux Basics / File System' },
        { title: 'file_magic',         url: '/vm#file-magic',       cat: 'lab', icon: 'fa-terminal', diff: 'easy',   pts: 50,  cat2: 'Forensics / File Analysis' },
        { title: 'strings_attached',   url: '/vm#strings-attached', cat: 'lab', icon: 'fa-terminal', diff: 'easy',   pts: 60,  cat2: 'Forensics / Binary Analysis' },
        { title: 'log_trace',          url: '/vm#log-trace',        cat: 'lab', icon: 'fa-terminal', diff: 'medium', pts: 75,  cat2: 'Log Analysis / DFIR' },
        { title: 'hash_hunt',          url: '/vm#hash-hunt',        cat: 'lab', icon: 'fa-terminal', diff: 'medium', pts: 100, cat2: 'Cryptography / Password Cracking' },
        { title: 'time_line',          url: '/vm#time-line',        cat: 'lab', icon: 'fa-terminal', diff: 'medium', pts: 125, cat2: 'Forensics / Incident Response' },
        { title: 'cron_job',           url: '/vm#cron-job',         cat: 'lab', icon: 'fa-terminal', diff: 'medium', pts: 150, cat2: 'Persistence / Privilege Escalation' },
        { title: 'shadow_walk',        url: '/vm#shadow-walk',      cat: 'lab', icon: 'fa-terminal', diff: 'medium', pts: 175, cat2: 'Linux / SUID Abuse' },
        { title: 'env_harvest',        url: '/vm#env-harvest',      cat: 'lab', icon: 'fa-terminal', diff: 'medium', pts: 175, cat2: 'DFIR / Secrets Management' },
        { title: 'pivot_chain',        url: '/vm#pivot-chain',      cat: 'lab', icon: 'fa-terminal', diff: 'medium', pts: 200, cat2: 'Lateral Movement / SSH' },
        { title: 'blind_sqli',         url: '/vm#blind-sqli',       cat: 'lab', icon: 'fa-terminal', diff: 'hard',   pts: 250, cat2: 'Web Security / SQL Injection' },
        { title: 'kernel_rx',          url: '/vm#kernel-rx',        cat: 'lab', icon: 'fa-terminal', diff: 'hard',   pts: 300, cat2: 'Memory Forensics / Rootkit Analysis' },
        { title: 'Active Directory',       url: '/writeup-active-directory',  cat: 'note', icon: 'fa-file-lines' },
        { title: 'ANY.RUN Sandbox',        url: '/writeup-anyrun',            cat: 'note', icon: 'fa-file-lines' },
        { title: 'Autopsy Forensics',      url: '/writeup-autopsy',           cat: 'note', icon: 'fa-file-lines' },
        { title: 'AWS CloudTrail',         url: '/writeup-aws',               cat: 'note', icon: 'fa-file-lines' },
        { title: 'BTL1',                   url: '/writeup-btl1',              cat: 'note', icon: 'fa-file-lines' },
        { title: 'Cortex XDR',            url: '/writeup-cortex-xdr',        cat: 'note', icon: 'fa-file-lines' },
        { title: 'DNS Threat Hunting',     url: '/writeup-dns',               cat: 'note', icon: 'fa-file-lines' },
        { title: 'Email Header Analysis',  url: '/writeup-email-headers',     cat: 'note', icon: 'fa-file-lines' },
        { title: 'Microsoft Entra ID',     url: '/writeup-entra-id',          cat: 'note', icon: 'fa-file-lines' },
        { title: 'FTK Imager',            url: '/writeup-ftk-imager',        cat: 'note', icon: 'fa-file-lines' },
        { title: 'Incident Response',      url: '/writeup-incident-response', cat: 'note', icon: 'fa-file-lines' },
        { title: 'KQL & Log Analytics',    url: '/writeup-kql',               cat: 'note', icon: 'fa-file-lines' },
        { title: 'Linux Commands',         url: '/writeup-linux-commands',    cat: 'note', icon: 'fa-file-lines' },
        { title: 'Linux Log Analysis',     url: '/writeup-linux-logs',        cat: 'note', icon: 'fa-file-lines' },
        { title: 'Microsoft Defender MDE', url: '/writeup-mde',               cat: 'note', icon: 'fa-file-lines' },
        { title: 'Network+ N10-009',       url: '/writeup-netplus',           cat: 'note', icon: 'fa-file-lines' },
        { title: 'Nmap Scanning',          url: '/writeup-nmap',              cat: 'note', icon: 'fa-file-lines' },
        { title: 'PowerShell Blue Team',   url: '/writeup-powershell',        cat: 'note', icon: 'fa-file-lines' },
        { title: 'Windows Registry',       url: '/writeup-registry',          cat: 'note', icon: 'fa-file-lines' },
        { title: 'Security+ SY0-701',      url: '/writeup-secplus',           cat: 'note', icon: 'fa-file-lines' },
        { title: 'SecurityX CAS-005',      url: '/writeup-securityx',         cat: 'note', icon: 'fa-file-lines' },
        { title: 'Splunk SPL',             url: '/writeup-splunk',            cat: 'note', icon: 'fa-file-lines' },
        { title: 'Suricata IDS',           url: '/writeup-suricata',          cat: 'note', icon: 'fa-file-lines' },
        { title: 'Sysmon Telemetry',       url: '/writeup-sysmon',            cat: 'note', icon: 'fa-file-lines' },
        { title: 'Threat Intelligence',    url: '/writeup-threat-intel',      cat: 'note', icon: 'fa-file-lines' },
        { title: 'Volatility Memory',      url: '/writeup-volatility',        cat: 'note', icon: 'fa-file-lines' },
        { title: 'Wireshark',              url: '/writeup-wireshark',         cat: 'note', icon: 'fa-file-lines' },
        { title: 'Cortex XSOAR',          url: '/writeup-xsoar',             cat: 'note', icon: 'fa-file-lines' },
        { title: 'YARA Rules',             url: '/writeup-yara',              cat: 'note', icon: 'fa-file-lines' },
    ];

    document.body.insertAdjacentHTML('beforeend', [
        '<div class="ss-overlay" id="ssOverlay">',
        '  <div class="ss-panel" id="ssPanel">',
        '    <div class="ss-input-row">',
        '      <i class="fas fa-magnifying-glass"></i>',
        '      <input class="ss-input" id="ssInput" type="text" placeholder="Search pages and notes..." autocomplete="off" spellcheck="false">',
        '      <span class="ss-kbd">esc</span>',
        '    </div>',
        '    <div class="ss-body" id="ssBody">',
        '      <div id="ssDefault">',
        '        <div class="ss-section-label">Pages</div>',
        '        <div class="ss-results" id="ssDefaultList"></div>',
        '        <div class="ss-section-label" style="margin-top:0.75rem;">Recently Added Labs</div>',
        '        <div class="ss-results" id="ssRecentLabs"></div>',
        '      </div>',
        '      <div id="ssFiltered" style="display:none;">',
        '        <div class="ss-section-label" id="ssFilteredLabel">Results</div>',
        '        <div class="ss-results" id="ssFilteredList"></div>',
        '      </div>',
        '      <div class="ss-empty" id="ssEmpty">No results found</div>',
        '    </div>',
        '  </div>',
        '</div>'
    ].join(''));

    var overlay      = document.getElementById('ssOverlay');
    var input        = document.getElementById('ssInput');
    var defaultEl    = document.getElementById('ssDefault');
    var filteredEl   = document.getElementById('ssFiltered');
    var filteredList = document.getElementById('ssFilteredList');
    var labelEl      = document.getElementById('ssFilteredLabel');
    var emptyEl      = document.getElementById('ssEmpty');

    var DIFF_COLOURS = { easy: '#27c93f', medium: '#febc2e', hard: '#ff5f56' };
    function itemHTML(p) {
        var right = p.cat === 'lab'
            ? '<span class="ss-result-diff ss-diff-' + p.diff + '">' + p.diff + '</span><span class="ss-result-pts">' + p.pts + ' pts</span>'
            : '<span class="ss-result-cat">' + p.cat + '</span>';
        var sub = p.cat === 'lab' ? '<div class="ss-result-sub">' + p.cat2 + '</div>' : '';
        return '<a class="ss-result" href="' + p.url + '">' +
            '<span class="ss-icon ' + p.cat + '"><i class="fas ' + p.icon + '"></i></span>' +
            '<span style="flex:1;min-width:0;"><div class="ss-result-title">' + p.title + '</div>' + sub + '</span>' +
            right +
            '</a>';
    }

    document.getElementById('ssDefaultList').innerHTML =
        PAGES.filter(function(p) { return p.cat === 'page'; }).map(itemHTML).join('');
    // Recent labs section (last 3 added = highest pts)
    var recentLabs = PAGES.filter(function(p) { return p.cat === 'lab'; }).slice(-3).reverse();
    document.getElementById('ssRecentLabs').innerHTML = recentLabs.map(itemHTML).join('');

    function doSearch(q) {
        q = q.trim().toLowerCase();
        if (!q) {
            defaultEl.style.display = '';
            filteredEl.style.display = 'none';
            emptyEl.style.display = 'none';
            return;
        }
        defaultEl.style.display = 'none';
        var hits = PAGES.filter(function(p) {
            return p.title.toLowerCase().indexOf(q) !== -1 ||
                   p.cat.toLowerCase().indexOf(q) !== -1 ||
                   p.url.indexOf(q) !== -1;
        });
        if (hits.length === 0) {
            filteredEl.style.display = 'none';
            emptyEl.style.display = '';
        } else {
            filteredList.innerHTML = hits.map(itemHTML).join('');
            labelEl.textContent = hits.length + ' result' + (hits.length === 1 ? '' : 's');
            filteredEl.style.display = '';
            emptyEl.style.display = 'none';
        }
    }

    function openSearch() {
        overlay.classList.add('active');
        setTimeout(function() { input.focus(); }, 60);
    }

    function closeSearch() {
        overlay.classList.remove('active');
        input.value = '';
        doSearch('');
    }

    var btn = document.getElementById('siteSearchBtn');
    if (btn) { btn.addEventListener('click', openSearch); }

    input.addEventListener('input', function() { doSearch(this.value); });

    overlay.addEventListener('click', function(e) {
        if (!document.getElementById('ssPanel').contains(e.target)) { closeSearch(); }
    });

    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            overlay.classList.contains('active') ? closeSearch() : openSearch();
        }
        if (e.key === 'Escape' && overlay.classList.contains('active')) { closeSearch(); }
    });
})();
