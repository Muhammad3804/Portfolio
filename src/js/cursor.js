/**
 * cursor.js
 * Drives the custom two-part cursor (dot + trailing ring).
 */

const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');

cursor.style.top = '0';
cursor.style.left = '0';
cursorRing.style.top = '0';
cursorRing.style.left = '0';

// We'll have three sets of coordinates:
// 1. mouseX/Y: The raw, immediate mouse position.
// 2. dotX/Y: The smoothed position of the inner dot.
// 3. ringX/Y: The smoothed position of the outer ring, which follows the dot.
let mouseX = 0, mouseY = 0;
let dotX   = 0, dotY   = 0;
let ringX  = 0, ringY  = 0;

let hasMoved = false;

// Update raw mouse position
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  // On the very first mouse move, snap all positions to the cursor
  // to avoid the elements flying in from (0,0).
  if (!hasMoved) {
    dotX = mouseX;
    dotY = mouseY;
    ringX = mouseX;
    ringY = mouseY;
    hasMoved = true;
  }
}, { passive: true });

// Animate both cursor parts with smooth lerp
function animateCursor() {
  // The dot lags behind the mouse with a high lerp factor for responsiveness
  dotX += (mouseX - dotX) * 0.6;
  dotY += (mouseY - dotY) * 0.6;
  cursor.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;

  // The ring lags behind the dot
  ringX += (dotX - ringX) * 0.12;
  ringY += (dotY - ringY) * 0.12;
  cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
  requestAnimationFrame(animateCursor);
}

animateCursor();
