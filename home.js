// ===== PARTICLE CANVAS =====
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, pts;

  function resize() {
    W = canvas.width  = window.innerWidth;
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
    // draw connections
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,200,240,${0.07 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }
    // draw dots
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,200,240,${0.35 * p.a})`;
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

// ===== SCROLL REVEAL =====
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in-view'); observer.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ===== "WHAT WE BUILD" SCROLL SPY =====
const tabNodes = document.querySelectorAll('.tab-trigger-node');
const showcaseCards = document.querySelectorAll('.premium-asymmetric-card');
if (tabNodes.length && showcaseCards.length) {
  const showcaseObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      tabNodes.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.target === e.target.id);
      });
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
  showcaseCards.forEach(card => showcaseObs.observe(card));
}

// ===== COUNTER ANIMATION =====
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCount(e.target); counterObs.unobserve(e.target); }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.m-num').forEach(c => counterObs.observe(c));

function animateCount(el) {
  const target = parseFloat(el.dataset.target);
  const dec = target % 1 !== 0;
  const start = performance.now();
  const dur = 1400;
  (function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = dec ? (target * e).toFixed(1) : Math.round(target * e);
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}

// ===== DEMO CHAT REVEAL =====
const demoMsgs = document.querySelectorAll('.dc-msg');
const demoObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      demoMsgs.forEach((m, i) => setTimeout(() => m.classList.add('vis'), i * 340));
      demoObs.disconnect();
    }
  });
}, { threshold: 0.3 });
const demoShell = document.querySelector('.demo-shell');
if (demoShell) demoObs.observe(demoShell);

// ===== SECURITY HORIZONTAL CAROUSEL (CENTERING LOGIC) =====
document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('securityTrack');
  const prevBtn = document.getElementById('secPrevBtn');
  const nextBtn = document.getElementById('secNextBtn');
  const cards = document.querySelectorAll('.security-slider-card');
  const dotsContainer = document.getElementById('secDotsRow');
  
  if (!track || !cards.length) return; // Guard clause if elements don't exist

  // Clear existing dots to prevent duplicates on soft reloads
  dotsContainer.innerHTML = '';
  
  let currentIndex = 0;

  // 1. Generate the indicator dots
  cards.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.classList.add('sec-dot');
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    if (index === 0) dot.classList.add('active');
    
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.sec-dot');

  // 2. The Master Centering Logic
  function goToSlide(index) {
    // Loop around
    if (index < 0) index = cards.length - 1;
    if (index >= cards.length) index = 0;
    currentIndex = index;

    // Measure viewport and card
    const viewportCenter = track.parentElement.offsetWidth / 2;
    const activeCard = cards[currentIndex];
    
    // Ensure activeCard actually has geometry before calculating
    if (!activeCard) return;
    
    const cardCenter = activeCard.offsetLeft + (activeCard.offsetWidth / 2);
    
    // Calculate and apply offset
    const translation = viewportCenter - cardCenter;
    track.style.transform = `translateX(${translation}px)`;

    // Update UI
    dots.forEach(d => d.classList.remove('active'));
    dots[currentIndex].classList.add('active');
  }

  // 3. Attach Nav Listeners (Remove old ones to prevent double firing)
  const newPrev = prevBtn.cloneNode(true);
  const newNext = nextBtn.cloneNode(true);
  prevBtn.parentNode.replaceChild(newPrev, prevBtn);
  nextBtn.parentNode.replaceChild(newNext, nextBtn);
  
  newPrev.addEventListener('click', () => goToSlide(currentIndex - 1));
  newNext.addEventListener('click', () => goToSlide(currentIndex + 1));
  
  // 4. Handle resize
  window.addEventListener('resize', () => goToSlide(currentIndex));
  
  // 5. Initial paint
  setTimeout(() => goToSlide(0), 100); 
});