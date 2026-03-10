/**
 * projects.js
 * Controls the sticky-scroll project card showcase.
 * Maps scroll progress through #projects to activate cards one by one.
 */

const projectsSection = document.getElementById('projects');
const projectCards    = document.querySelectorAll('.projects-grid .card');

function updateProjectScroll() {
  if (!projectsSection || projectCards.length === 0) return;

  const rect             = projectsSection.getBoundingClientRect();
  const viewportHeight   = window.innerHeight;
  const scrollableDistance = rect.height - viewportHeight;
  const scrolled           = -rect.top;

  let activeIndex;

  if (scrolled < 0) {
    // Before the section — show the first card
    activeIndex = 0;
  } else if (scrolled > scrollableDistance) {
    // Past the section — hold on last card
    activeIndex = projectCards.length - 1;
  } else {
    // Inside the section — map progress to card index
    const progress  = scrolled / scrollableDistance;
    activeIndex = Math.min(
      projectCards.length - 1,
      Math.floor(progress * projectCards.length)
    );
  }

  projectCards.forEach((card, i) => {
    card.classList.toggle('active', i === activeIndex);
  });
}

window.addEventListener('scroll', updateProjectScroll);
window.addEventListener('resize', updateProjectScroll);

// Activate the first card on load
updateProjectScroll();
