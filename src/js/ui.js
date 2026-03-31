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
  }, { passive: true });
});

// ── SCROLL DIMENSION CACHE ────────────────────────────────
let winHeight = 0;
let docHeight = 0;
let scrollable = 0;
let trackHeight = 0;

const scrollTrack = document.getElementById('custom-scrollbar');
const scrollThumb = document.getElementById('custom-scroll-thumb');
const navFill     = document.querySelector('.nav-fill');

function cacheDimensions() {
  winHeight  = window.innerHeight;
  docHeight  = document.documentElement.scrollHeight;
  scrollable = Math.max(0, docHeight - winHeight);
  if (scrollTrack) trackHeight = scrollTrack.clientHeight;
}

// Use ResizeObserver so we only recalculate page height when it actually changes
const resizeObserver = new ResizeObserver(() => cacheDimensions());
resizeObserver.observe(document.body);
window.addEventListener('resize', cacheDimensions, { passive: true });
cacheDimensions();

// ── SMOOTH SCROLL UI RENDERER ─────────────────────────────
let currentScroll = window.scrollY || 0;

function renderSmoothUI() {
  const targetScroll = window.scrollY;
  
  // Smoothly interpolate towards actual scroll position
  if (Math.abs(targetScroll - currentScroll) > 0.5) {
    currentScroll += (targetScroll - currentScroll) * 0.08; // Adjust 0.08 for more/less smoothing
  } else {
    currentScroll = targetScroll;
  }

  // Update Nav Loading Bar
  if (navFill && scrollable > 0) {
    const navProgress = currentScroll / scrollable;
    navFill.style.transform = `scaleX(${Math.min(1, Math.max(0, navProgress))})`;
  }

  // Update Custom Scrollbar Position (GPU accelerated)
  if (scrollThumb && trackHeight > 0 && docHeight > 0) {
    let thumbHeight = (winHeight / docHeight) * trackHeight;
    thumbHeight = Math.max(20, thumbHeight); 
    
    const scrollPercent = scrollable > 0 ? currentScroll / scrollable : 0;
    const maxTop = trackHeight - thumbHeight;
    const thumbTop = scrollPercent * maxTop;
    
    scrollThumb.style.height = `${thumbHeight}px`;
    scrollThumb.style.transform = `translateY(${thumbTop}px)`; 
  }

  requestAnimationFrame(renderSmoothUI);
}

requestAnimationFrame(renderSmoothUI);
