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
    mix(hash(i),                  hash(i + vec2(1.0, 0.0)), u.x),
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
  vec2  uv = vUv;
  float t  = uTime * 0.15;

  vec2 q = vec2(fbm(uv + t),              fbm(uv + vec2(1.0)));
  vec2 r = vec2(
    fbm(uv + q + vec2(1.7, 9.2) + 0.15  * t),
    fbm(uv + q + vec2(8.3, 2.8) + 0.126 * t)
  );
  float f = fbm(uv + r);

  float dist = length(uv - uMouse);
  float glow = smoothstep(0.5, 0.0, dist) * 0.15;

  vec3 col1   = vec3(0.005, 0.015, 0.04);
  vec3 col2   = vec3(0.0,   0.08,  0.15);
  vec3 col3   = vec3(0.0,   0.2,   0.3);
  vec3 accent = vec3(0.0,   0.83,  1.0);

  vec3 color = mix(col1, col2, clamp(f * f * 4.0,      0.0, 1.0));
  color      = mix(color, col3,   clamp(f * f,          0.0, 1.0));
  color      = mix(color, accent, clamp(f * 1.5 - 0.8, 0.0, 1.0) * 0.15);
  color     += accent * glow;

  float vig = 1.0 - smoothstep(0.4, 1.2, length(uv - 0.5) * 1.8);
  color *= vig;

  gl_FragColor = vec4(color, 1.0);
}
