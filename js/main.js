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

// ── CUSTOM SCROLLBAR SYNC ────────────────────────────────
const scrollTrack = document.getElementById('custom-scrollbar');
const scrollThumb = document.getElementById('custom-scroll-thumb');

function updateCustomScroll() {
  if (!scrollTrack || !scrollThumb) return;

  const winScroll = window.scrollY;
  const docHeight = document.documentElement.scrollHeight;
  const winHeight = window.innerHeight;
  const scrollable = docHeight - winHeight;

  // Calculate scroll percentage
  const scrollPercent = scrollable > 0 ? winScroll / scrollable : 0;

  // Calculate thumb height relative to viewport/content ratio
  const trackHeight = scrollTrack.clientHeight;
  let thumbHeight = (winHeight / docHeight) * trackHeight;
  thumbHeight = Math.max(20, thumbHeight); // Ensure min height of 20px

  // Calculate thumb position
  const maxTop = trackHeight - thumbHeight;
  const thumbTop = scrollPercent * maxTop;

  scrollThumb.style.height = `${thumbHeight}px`;
  scrollThumb.style.top = `${thumbTop}px`;
}

window.addEventListener('scroll', updateCustomScroll);
window.addEventListener('resize', updateCustomScroll);
updateCustomScroll(); // Initial call

// ── PROJECT STICKY SCROLL ────────────────────────────────
const projectsSection = document.getElementById('projects');
const projectCards = document.querySelectorAll('.projects-grid .card');

function updateProjectScroll() {
  if (!projectsSection || projectCards.length === 0) return;

  const rect = projectsSection.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  
  // Calculate how far we've scrolled into the section
  // The section is "active" when its top is at or above 0
  const scrollableDistance = rect.height - viewportHeight;
  const scrolled = -rect.top;

  if (scrolled < 0) {
    // Before section: Show first card
    projectCards.forEach((c, i) => c.classList.toggle('active', i === 0));
  } else if (scrolled > scrollableDistance) {
    // After section: Show last card
    projectCards.forEach((c, i) => c.classList.toggle('active', i === projectCards.length - 1));
  } else {
    // Inside section: Map progress to card index
    const progress = scrolled / scrollableDistance;
    const activeIndex = Math.floor(progress * projectCards.length);
    const safeIndex = Math.min(projectCards.length - 1, Math.max(0, activeIndex));
    
    projectCards.forEach((c, i) => {
      c.classList.toggle('active', i === safeIndex);
    });
  }
}

window.addEventListener('scroll', updateProjectScroll);
window.addEventListener('resize', updateProjectScroll);
