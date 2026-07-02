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

// ===== SCROLL REVEAL =====
document.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.2 });

    document.querySelectorAll('.scroll-fade').forEach(el => observer.observe(el));
});

// ===== CONTACT FORM -> SUPABASE =====
document.addEventListener("DOMContentLoaded", () => {
    // Same project used by publications.html
    const SUPABASE_URL = 'https://zbhuljurcvwrhaorxusc.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_Usk6ADOtzJNAnbDkiPll8w_pzknKhj_';
    const { createClient } = supabase;
    const db = createClient(SUPABASE_URL, SUPABASE_KEY);

    const form = document.getElementById('contact-form');
    if (!form) return;

    const statusEl = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const countryCode = document.getElementById('country-code').value;
        const phone = document.getElementById('phone').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!firstName || !lastName || !email) {
            statusEl.textContent = 'Please fill in your name and email.';
            statusEl.className = 'form-status error';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        statusEl.textContent = '';
        statusEl.className = 'form-status';

        const { error } = await db.from('contact_submissions').insert([{
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone ? `${countryCode} ${phone}` : null,
            message: message
        }]);

        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';

        if (error) {
            console.error('Contact form submit failed:', error);
            statusEl.textContent = "Something went wrong on our end. Please email info@rakasolutions.io directly.";
            statusEl.className = 'form-status error';
        } else {
            form.reset();
            statusEl.textContent = "Thanks — we'll get back to you within one business day.";
            statusEl.className = 'form-status success';
        }
    });
});
