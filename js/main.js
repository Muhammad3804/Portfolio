// ── SCROLL REVEAL ────────────────────────────────────────
const reveals  = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.15 });

reveals.forEach(el => observer.observe(el));

// ── CARD MOUSE GLOW ──────────────────────────────────────
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    card.style.setProperty('--mx', x + '%');
    card.style.setProperty('--my', y + '%');
  });
});

// ── NAV SCROLL PROGRESS ──────────────────────────────────
const navFill = document.querySelector('.nav-fill');

function updateNavProgress() {
  if (!navFill) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  navFill.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
}

window.addEventListener('scroll', updateNavProgress);
window.addEventListener('resize', updateNavProgress);
