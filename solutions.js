// ===== PARTICLE CANVAS BACKGROUND =====
(function () {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, pts;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function init() {
        resize();
        pts = Array.from({ length: 55 }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.28,
            vy: (Math.random() - 0.5) * 0.28,
            r: Math.random() * 1.4 + 0.4,
            a: Math.random()
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(59,130,246,${0.09 * (1 - dist / 130)})`;
                    ctx.lineWidth = 0.6;
                    ctx.moveTo(pts[i].x, pts[i].y);
                    ctx.lineTo(pts[j].x, pts[j].y);
                    ctx.stroke();
                }
            }
        }
        pts.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(96,165,250,${0.4 * p.a})`;
            ctx.fill();
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
        });
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => { resize(); });
    init(); draw();
})();

// ===== NAVBAR SCROLL STYLE =====
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
}

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Setup Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2 // Triggers when 20% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the visible class to trigger CSS animation
                entry.target.classList.add('is-visible');

                // The chart line's dash-offset is set via inline style below
                // (needed to know the exact path length), and inline styles
                // always beat stylesheet rules — so the reveal has to be
                // done here in JS too, not through a CSS class selector.
                const line = entry.target.querySelector('#markov-line');
                if (line) {
                    line.style.strokeDashoffset = '0';
                }
            }
        });
    }, observerOptions);

    // 2. Select all elements we want to animate
    const fadeElements = document.querySelectorAll('.scroll-fade');
    fadeElements.forEach(el => {
        observer.observe(el);
    });

    // 3. Dynamic setup for the SVG chart line
    // Getting the exact length of the path dynamically ensures the draw animation is perfect
    const markovLine = document.getElementById('markov-line');
    if (markovLine) {
        const pathLength = markovLine.getTotalLength();
        
        // Set the dash array and offset to the exact length of the path
        markovLine.style.strokeDasharray = pathLength;
        markovLine.style.strokeDashoffset = pathLength;
    }
});