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

    function makeEl(step) {
        switch (step.type) {
            case 'login': {
                const el = document.createElement('p');
                el.className = 'terminal-login';
                el.textContent = 'Last login: Mon May 2 09:14:22 2026 from 192.168.1.1';
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

// Discord copy
function copyDiscord() {
    navigator.clipboard.writeText('thomsoncx').then(() => {
        const confirm = document.getElementById('copyConfirm');
        confirm.classList.add('visible');
        setTimeout(() => confirm.classList.remove('visible'), 2000);
    });
}
