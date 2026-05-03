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


// Terminal sequence animation
function initTerminal() {
    const body = document.querySelector('.terminal-body');
    if (!body) return;

    const PROMPT = 'ben@thomson.cx:~$';
    const ID_HTML =
        '<span class="t-key">uid=</span><span class="t-val">1000</span><span class="t-dim">(ben)</span> ' +
        '<span class="t-key">gid=</span><span class="t-val">1000</span><span class="t-dim">(ben)</span> ' +
        '<span class="t-key">groups=</span><span class="t-val">27</span><span class="t-dim">(sudo)</span>' +
        ',<span class="t-val">1001</span><span class="t-dim">(soc-team)</span>';
    const SUDO_HTML =
        '<span class="t-dim">Matching Defaults entries for ben on thomson.cx:</span><br>' +
        '<span class="t-dim">    env_reset, mail_badpass</span><br>' +
        '<span class="t-dim">User ben may run the following commands on thomson.cx:</span><br>' +
        '    <span class="t-dim">(ALL)</span> <span class="t-accent">NOPASSWD:</span> <span class="t-key">/usr/bin/tcpdump</span>, <span class="t-key">/usr/bin/nmap</span>, <span class="t-key">/usr/bin/wireshark</span>';

    const steps = [
        { type: 'login' },
        { type: 'cmd',      text: 'whoami' },
        { type: 'out',      text: 'ben' },
        { type: 'cmd',      text: 'id' },
        { type: 'out-html', html: ID_HTML },
        { type: 'cmd',      text: 'sudo -l' },
        { type: 'out-html', html: SUDO_HTML },
        { type: 'final' },
    ];

    function loginTimestamp() {
        const offset = (Math.floor(Math.random() * 9) + 4) * 60 * 60 * 1000;
        const past = new Date(Date.now() - offset);
        const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const hh = String(past.getHours()).padStart(2, '0');
        const mm = String(past.getMinutes()).padStart(2, '0');
        const ss = String(past.getSeconds()).padStart(2, '0');
        return `Last login: ${days[past.getDay()]} ${months[past.getMonth()]} ${past.getDate()} ${hh}:${mm}:${ss} ${past.getFullYear()} from 192.168.1.1`;
    }

    function makeEl(step) {
        switch (step.type) {
            case 'login': {
                const el = document.createElement('p');
                el.className = 'terminal-login';
                el.textContent = loginTimestamp();
                return el;
            }
            case 'cmd': {
                const el = document.createElement('p');
                el.className = 'terminal-line';
                el.innerHTML = `<span class="prompt">${PROMPT}</span> <span class="cmd">${step.text}</span>`;
                return el;
            }
            case 'out': {
                const el = document.createElement('p');
                el.className = 'terminal-output';
                el.textContent = step.text;
                return el;
            }
            case 'out-html': {
                const el = document.createElement('p');
                el.className = 'terminal-output';
                el.innerHTML = step.html;
                return el;
            }
            case 'final': {
                const el = document.createElement('p');
                el.className = 'terminal-line mt';
                el.innerHTML = `<span class="prompt">${PROMPT}</span> <span class="cursor-blink">&#9608;</span>`;
                return el;
            }
        }
    }

    // Pre-render invisibly to lock in the final height
    body.innerHTML = '';
    body.style.visibility = 'hidden';
    steps.forEach(s => body.appendChild(makeEl(s)));
    const lockedHeight = body.scrollHeight;
    body.style.height = lockedHeight + 'px';
    body.style.overflow = 'hidden';
    body.style.visibility = 'visible';
    body.innerHTML = '';

    // Now animate into the fixed-size box
    let i = 0;

    function next() {
        if (i >= steps.length) return;
        const step = steps[i++];

        switch (step.type) {
            case 'login': {
                body.appendChild(makeEl(step));
                setTimeout(next, 900);
                break;
            }
            case 'cmd': {
                const el = document.createElement('p');
                el.className = 'terminal-line';
                el.innerHTML = `<span class="prompt">${PROMPT}</span> <span class="cmd"></span>`;
                body.appendChild(el);
                typeText(el.querySelector('.cmd'), step.text, 72, () => setTimeout(next, 400));
                break;
            }
            case 'out':
            case 'out-html': {
                body.appendChild(makeEl(step));
                setTimeout(next, 550);
                break;
            }
            case 'final': {
                body.appendChild(makeEl(step));
                break;
            }
        }
    }

    function typeText(el, text, speed, cb) {
        let j = 0;
        function tick() {
            if (j < text.length) {
                el.textContent += text[j++];
                setTimeout(tick, speed + Math.random() * 30 - 15);
            } else if (cb) cb();
        }
        tick();
    }

    setTimeout(next, 700);
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

// CISA KEV Feed
async function initKEVFeed() {
    const grid = document.getElementById('cveGrid');
    if (!grid) return;

    try {
        const target = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
        const res = await fetch('https://corsproxy.io/?' + encodeURIComponent(target));
        if (!res.ok) throw new Error();
        const data = await res.json();

        const vulns = (data.vulnerabilities || [])
            .slice()
            .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
            .slice(0, 6);

        grid.innerHTML = '';

        vulns.forEach(v => {
            const id          = v.cveID;
            const vendor      = v.vendorProject;
            const product     = v.product;
            const name        = v.vulnerabilityName;
            const desc        = v.shortDescription || '';
            const dateAdded   = new Date(v.dateAdded).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            const dueDate     = new Date(v.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            const ransomware  = v.knownRansomwareCampaignUse === 'Known';
            const shortDesc   = desc.length > 140 ? desc.substring(0, 140).trimEnd() + '…' : desc;

            const card = document.createElement('div');
            card.className = 'cve-card';
            card.innerHTML = `
                <div class="cve-header">
                    <a href="https://nvd.nist.gov/vuln/detail/${id}" target="_blank" rel="noopener" class="cve-id">${id}</a>
                    ${ransomware ? '<span class="cve-badge kev-ransomware"><i class="fas fa-skull-crossbones"></i> Ransomware</span>' : '<span class="cve-badge kev-exploited">Exploited</span>'}
                </div>
                <div class="cve-tags">
                    <span class="cve-vendor">${vendor}</span>
                    <span class="cve-cwe">${product}</span>
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

// Globe
function initGlobe() {
    const canvas = document.getElementById('globeCanvas');
    if (!canvas) return;

    const dpr  = Math.min(window.devicePixelRatio || 1, 3);
    const SIZE = 200;
    canvas.width  = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width  = SIZE + 'px';
    canvas.style.height = SIZE + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const cx = SIZE / 2, cy = SIZE / 2;
    const R  = SIZE / 2 - 8;
    let angle  = 0;
    let pulseT = 0;
    let dots   = [];

    // Fixed red target locations (major cities / threat-intel hotspots)
    const targets = [
        [ 51.5,  -0.1],  // London
        [ 40.7, -74.0],  // New York
        [ 35.7, 139.7],  // Tokyo
        [ 55.7,  37.6],  // Moscow
        [ 28.6,  77.2],  // Delhi
        [ 39.9, 116.4],  // Beijing
        [-23.5, -46.6],  // São Paulo
        [  1.3, 103.8],  // Singapore
        [ 48.9,   2.3],  // Paris
        [-33.9,  18.4],  // Cape Town
    ].map(([la, lo]) => [la * Math.PI / 180, lo * Math.PI / 180]);

    async function loadDots() {
        const OW = 1440, OH = 720;
        const oc = document.createElement('canvas');
        oc.width = OW; oc.height = OH;
        const ox = oc.getContext('2d');
        ox.fillStyle = '#fff';

        try {
            const res = await fetch(
                'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_land.geojson'
            );
            if (!res.ok) throw new Error();
            const geo = await res.json();

            function drawRing(coords) {
                if (!coords || coords.length < 3) return;
                ox.beginPath();
                ox.moveTo((coords[0][0] + 180) * 4, (90 - coords[0][1]) * 4);
                for (let i = 1; i < coords.length; i++)
                    ox.lineTo((coords[i][0] + 180) * 4, (90 - coords[i][1]) * 4);
                ox.closePath();
                ox.fill();
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
                ox.moveTo((pts[0][0] + 180) * 4, (90 - pts[0][1]) * 4);
                for (let i = 1; i < pts.length; i++)
                    ox.lineTo((pts[i][0] + 180) * 4, (90 - pts[i][1]) * 4);
                ox.closePath();
                ox.fill();
            });
        }

        const img = ox.getImageData(0, 0, OW, OH).data;
        const result = [];
        for (let py = 0; py < OH; py += 3) {
            for (let px = 0; px < OW; px += 3) {
                if (img[(py * OW + px) * 4] > 128) {
                    result.push([
                        (90  - py / 4) * Math.PI / 180,
                        (px / 4 - 180) * Math.PI / 180,
                    ]);
                }
            }
        }
        return result;
    }

    function draw() {
        ctx.clearRect(0, 0, SIZE, SIZE);
        pulseT += 0.04;

        // White glossy sphere
        const grad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.32, R * 0.02, cx, cy, R);
        grad.addColorStop(0,    '#ffffff');
        grad.addColorStop(0.45, '#f0f3f7');
        grad.addColorStop(0.82, '#d6dce7');
        grad.addColorStop(1,    '#b8c2d4');
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Bright atmosphere rim (the white glow ring from the image)
        const rim = ctx.createRadialGradient(cx, cy, R * 0.72, cx, cy, R);
        rim.addColorStop(0,   'rgba(255,255,255,0)');
        rim.addColorStop(0.7, 'rgba(255,255,255,0)');
        rim.addColorStop(1,   'rgba(255,255,255,0.55)');
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = rim;
        ctx.fill();

        // Subtle grid lines
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.clip();
        ctx.strokeStyle = 'rgba(100,120,160,0.18)';
        ctx.lineWidth   = 0.4;
        for (let i = 1; i < 7; i++) {
            const phi = (i / 7) * Math.PI;
            const gy  = cy - R * Math.cos(phi);
            const rx  = R * Math.sin(phi);
            ctx.beginPath();
            ctx.ellipse(cx, gy, rx, rx * 0.27, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();

        // Dark land dots
        dots.forEach(([lat, lon]) => {
            const rotLon = lon + angle;
            const x3 = Math.cos(lat) * Math.sin(rotLon);
            const y3 = Math.sin(lat);
            const z3 = Math.cos(lat) * Math.cos(rotLon);
            if (z3 < 0) return;
            const sz = (z3 + 1) / 2;
            ctx.globalAlpha = 0.22 + sz * 0.55;
            ctx.beginPath();
            ctx.arc(cx + R * x3, cy - R * y3, 0.8 + sz * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = '#1a2235';
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Red pulsing target markers
        targets.forEach(([lat, lon], i) => {
            const rotLon = lon + angle;
            const x3 = Math.cos(lat) * Math.sin(rotLon);
            const y3 = Math.sin(lat);
            const z3 = Math.cos(lat) * Math.cos(rotLon);
            if (z3 < 0) return;
            const sz = (z3 + 1) / 2;
            const sx = cx + R * x3;
            const sy = cy - R * y3;

            // Stagger each target's pulse phase
            const p = (Math.sin(pulseT + i * 0.9) + 1) / 2;

            // Outer pulse ring
            ctx.beginPath();
            ctx.arc(sx, sy, 2.5 + p * 5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,40,40,${0.08 + p * 0.14})`;
            ctx.fill();

            // Mid glow ring
            ctx.beginPath();
            ctx.arc(sx, sy, 2 + p * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,60,60,${0.15 + p * 0.1})`;
            ctx.fill();

            // Core red dot
            ctx.shadowColor = '#ff2020';
            ctx.shadowBlur  = 8 * dpr;
            ctx.globalAlpha = 0.75 + sz * 0.25;
            ctx.beginPath();
            ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
            ctx.fillStyle = '#ff3333';
            ctx.fill();

            // Bright white centre
            ctx.shadowBlur  = 0;
            ctx.globalAlpha = 0.95;
            ctx.beginPath();
            ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        });
        ctx.shadowBlur  = 0;
        ctx.globalAlpha = 1;

        // Outer stroke ring
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(160,175,200,0.5)';
        ctx.lineWidth   = 1;
        ctx.stroke();

        angle  += 0.005;
        requestAnimationFrame(draw);
    }

    draw();
    loadDots().then(d => { dots = d; });
}

initGlobe();

// Discord copy
function copyDiscord() {
    navigator.clipboard.writeText('thomsonexe').then(() => {
        const confirm = document.getElementById('copyConfirm');
        confirm.classList.add('visible');
        setTimeout(() => confirm.classList.remove('visible'), 2000);
    });
}
