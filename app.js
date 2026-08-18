// --- Video Scroll Scrubbing Engine (Canvas + Video Dual Render) ---
function initScrollVideo() {
    const video = document.getElementById('encosta-video');
    const section = document.getElementById('como-funciona');
    const canvas = document.getElementById('video-canvas-display');

    if (!video || !section) return;

    const ctx = canvas ? canvas.getContext('2d') : null;

    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    let targetTime = 0;
    let isSeeking = false;
    let pendingTime = null;

    function getProgress() {
        const rect = section.getBoundingClientRect();
        const totalScrollable = section.offsetHeight - window.innerHeight;
        if (totalScrollable <= 0) return 0;
        const scrollOffset = -rect.top;
        return Math.max(0, Math.min(1, scrollOffset / totalScrollable));
    }

    function drawFrame() {
        if (ctx && canvas && video.videoWidth && video.videoHeight) {
            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }
            try {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            } catch (e) {}
        }
    }

    function applySeek(time) {
        if (!video.duration || isNaN(video.duration)) return;
        const safeTime = Math.max(0, Math.min(video.duration - 0.03, time));
        
        if (Math.abs(video.currentTime - safeTime) < 0.01) {
            drawFrame();
            return;
        }

        if (isSeeking) {
            pendingTime = safeTime;
            return;
        }

        isSeeking = true;
        try {
            if ('fastSeek' in video) {
                video.fastSeek(safeTime);
            } else {
                video.currentTime = safeTime;
            }
        } catch (e) {
            video.currentTime = safeTime;
        }
    }

    function onScroll() {
        if (!video.duration || isNaN(video.duration)) return;
        const progress = getProgress();
        targetTime = progress * video.duration;
        applySeek(targetTime);
    }

    video.addEventListener('seeking', () => {
        isSeeking = true;
    });

    video.addEventListener('seeked', () => {
        isSeeking = false;
        drawFrame();
        if (pendingTime !== null) {
            const nextTime = pendingTime;
            pendingTime = null;
            applySeek(nextTime);
        }
    });

    video.addEventListener('timeupdate', () => {
        drawFrame();
    });

    function setupVideo() {
        video.pause();
        drawFrame();
        onScroll();
    }

    video.addEventListener('loadedmetadata', setupVideo);
    video.addEventListener('loadeddata', setupVideo);
    video.addEventListener('canplay', setupVideo);

    if (video.readyState >= 1) {
        setupVideo();
    } else {
        try { video.load(); } catch (e) {}
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    const checkInterval = setInterval(() => {
        if (video.duration && !isNaN(video.duration)) {
            clearInterval(checkInterval);
            setupVideo();
        }
    }, 200);
}

// --- SpecularButton (Reflexos din?micos nos bot?es) ---
function initSpecularButtons() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        if (btn.dataset.specularInitialized) return;
        btn.dataset.specularInitialized = 'true';

        btn.addEventListener('pointermove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            btn.style.setProperty('--x', `${x.toFixed(1)}px`);
            btn.style.setProperty('--y', `${y.toFixed(1)}px`);
            btn.style.setProperty('--specular-opacity', '1');
        });

        btn.addEventListener('pointerleave', () => {
            btn.style.setProperty('--specular-opacity', '0');
        });
    });
}

// --- Floating Navbar, Mobile Menu & Scrollspy ---
function initFloatingNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinksContainer = document.getElementById('nav-links');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    if (mobileToggle && navLinksContainer) {
        const handleToggle = (e) => {
            if (e) e.stopPropagation();
            mobileToggle.classList.toggle('open');
            navLinksContainer.classList.toggle('active');
        };

        mobileToggle.addEventListener('click', handleToggle);

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('open');
                navLinksContainer.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (navLinksContainer.classList.contains('active') && !navbar.contains(e.target)) {
                mobileToggle.classList.remove('open');
                navLinksContainer.classList.remove('active');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const targetSec = document.querySelector(href);
                if (targetSec) {
                    e.preventDefault();
                    targetSec.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -50% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

function initApp() {
    initScrollVideo();
    initSpecularButtons();
    initFloatingNavbar();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
window.addEventListener('load', initApp);
