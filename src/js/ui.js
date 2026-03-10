/**
 * ui.js
 * Handles all general UI interactions:
 *  - Scroll-reveal (IntersectionObserver)
 *  - Card mouse-glow effect
 *  - Nav scroll-progress fill
 *  - Custom floating scrollbar sync
 */

// ── SCROLL REVEAL ─────────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── CARD MOUSE GLOW ───────────────────────────────────────
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    card.style.setProperty('--mx', x + '%');
    card.style.setProperty('--my', y + '%');
  });
});

// ── NAV SCROLL PROGRESS ───────────────────────────────────
const navFill = document.querySelector('.nav-fill');

function updateNavProgress() {
  if (!navFill) return;
  const scrollTop    = window.scrollY;
  const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  navFill.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
}

// ── CUSTOM SCROLLBAR SYNC ─────────────────────────────────
const scrollTrack = document.getElementById('custom-scrollbar');
const scrollThumb = document.getElementById('custom-scroll-thumb');

function updateCustomScroll() {
  if (!scrollTrack || !scrollThumb) return;

  const winScroll  = window.scrollY;
  const docHeight  = document.documentElement.scrollHeight;
  const winHeight  = window.innerHeight;
  const scrollable = docHeight - winHeight;

  const scrollPercent = scrollable > 0 ? winScroll / scrollable : 0;
  const trackHeight   = scrollTrack.clientHeight;

  let thumbHeight = (winHeight / docHeight) * trackHeight;
  thumbHeight     = Math.max(20, thumbHeight); // enforce minimum

  const maxTop   = trackHeight - thumbHeight;
  const thumbTop = scrollPercent * maxTop;

  scrollThumb.style.height = `${thumbHeight}px`;
  scrollThumb.style.top    = `${thumbTop}px`;
}

// ── EVENT BINDINGS ────────────────────────────────────────
window.addEventListener('scroll', () => {
  updateNavProgress();
  updateCustomScroll();
});

window.addEventListener('resize', () => {
  updateNavProgress();
  updateCustomScroll();
});

// Initial calls
updateNavProgress();
updateCustomScroll();
