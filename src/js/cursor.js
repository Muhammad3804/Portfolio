/**
 * cursor.js
 * Drives the custom two-part cursor (dot + trailing ring).
 */

const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');

let mouseX = 0, mouseY = 0; // Exact mouse position (dot snaps here)
let ringX  = 0, ringY  = 0; // Lagged ring position

// Snap the dot cursor to mouse immediately
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

// Animate the ring with smooth lerp
function animateCursor() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  requestAnimationFrame(animateCursor);
}

animateCursor();
