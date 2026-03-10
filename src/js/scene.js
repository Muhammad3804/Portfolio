/**
 * scene.js
 * Three.js WebGL background scene.
 * Renders a procedural noise shader, floating wireframe objects,
 * a particle cloud, and responds to mouse and scroll input.
 */

// ── GLSL SHADERS ──────────────────────────────────────────

const VERT_SHADER = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG_SHADER = /* glsl */`
  uniform float uTime;
  uniform vec2  uMouse;
  uniform vec2  uResolution;
  varying vec2  vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),             hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value     = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      value     += amplitude * noise(p * frequency);
      frequency *= 2.1;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2  uv    = vUv;
    float t     = uTime * 0.15;

    // Layered domain-warped noise
    vec2 q = vec2(fbm(uv + t),              fbm(uv + vec2(1.0)));
    vec2 r = vec2(fbm(uv + q + vec2(1.7, 9.2) + 0.15  * t),
                  fbm(uv + q + vec2(8.3, 2.8) + 0.126 * t));
    float f = fbm(uv + r);

    // Mouse spotlight
    float dist = length(uv - uMouse);
    float glow = smoothstep(0.5, 0.0, dist) * 0.15;

    // Colour palette
    vec3 col1   = vec3(0.005, 0.015, 0.04);
    vec3 col2   = vec3(0.0,   0.08,  0.15);
    vec3 col3   = vec3(0.0,   0.2,   0.3);
    vec3 accent = vec3(0.0,   0.83,  1.0);

    vec3 color = mix(col1, col2, clamp(f * f * 4.0,       0.0, 1.0));
    color      = mix(color, col3,   clamp(f * f,           0.0, 1.0));
    color      = mix(color, accent, clamp(f * 1.5 - 0.8,  0.0, 1.0) * 0.15);
    color     += accent * glow;

    // Vignette
    float vig = 1.0 - smoothstep(0.4, 1.2, length(uv - 0.5) * 1.8);
    color *= vig;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ── SCENE INITIALISATION ──────────────────────────────────

function initScene() {
  const canvas = document.getElementById('glcanvas');
  if (!canvas) return;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x020408, 1);

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 5;

  // ── SHADER BACKGROUND ──────────────────────────────────
  const bgMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    vertexShader: VERT_SHADER,
    fragmentShader: FRAG_SHADER,
  });

  const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), bgMaterial);
  bgMesh.position.z = -2;
  scene.add(bgMesh);

  // ── FLOATING WIREFRAME OBJECTS ──────────────────────────
  const objects = [];

  function addWireframe(geometry, color, opacity, position) {
    const material = new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    scene.add(mesh);
    return mesh;
  }

  const ico = addWireframe(new THREE.IcosahedronGeometry(0.8, 1), 0x00d4ff, 0.15, [3, 1, -1]);
  const torus = addWireframe(new THREE.TorusGeometry(0.6, 0.15, 16, 60), 0xff6b35, 0.12, [-3.5, -1, -1.5]);
  const octa = addWireframe(new THREE.OctahedronGeometry(0.5), 0x00d4ff, 0.20, [-2, 2, -0.5]);

  objects.push(
    { mesh: ico, speed: 0.003, float: 0.40, phase: 0 },
    { mesh: torus, speed: 0.005, float: 0.30, phase: 1.5 },
    { mesh: octa, speed: 0.007, float: 0.25, phase: 3 },
  );

  // Small sphere cluster
  for (let i = 0; i < 5; i++) {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.5 })
    );
    sphere.position.set(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 2 - 1
    );
    scene.add(sphere);
    objects.push({
      mesh: sphere,
      speed: 0.001 + Math.random() * 0.003,
      float: 0.2,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // ── PARTICLE CLOUD ──────────────────────────────────────
  const PARTICLE_COUNT = 120;
  const pGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
  }

  pGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particles = new THREE.Points(
    pGeometry,
    new THREE.PointsMaterial({ color: 0x00d4ff, size: 0.025, transparent: true, opacity: 0.4 })
  );
  scene.add(particles);

  // ── INPUT TRACKING ───────────────────────────────────────
  let mouseX = 0, mouseY = 0;
  let scrollY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    bgMaterial.uniforms.uMouse.value.set(
      e.clientX / window.innerWidth,
      1 - e.clientY / window.innerHeight
    );
  });

  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  // ── RESIZE ───────────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    bgMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  });

  // ── RENDER LOOP ──────────────────────────────────────────
  const clock = new THREE.Clock();

  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    bgMaterial.uniforms.uTime.value = t;

    objects.forEach(obj => {
      obj.mesh.rotation.x += obj.speed;
      obj.mesh.rotation.y += obj.speed * 1.3;
      obj.mesh.position.y += Math.sin(t + obj.phase) * 0.001 * obj.float;
    });

    particles.rotation.y = t * 0.02;
    particles.rotation.x = t * 0.01;

    camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 0.2 - camera.position.y) * 0.05;
    camera.position.z = 5 - scrollY * 0.00155;

    renderer.render(scene, camera);
  })();
}

initScene();
