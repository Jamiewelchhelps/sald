// Hero: diagonal beam shader (Three.js)
// Loads Three from CDN; falls back silently to the CSS beam layer if WebGL is unavailable.

(function () {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas || !window.THREE) return;

  const THREE = window.THREE;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const vertexShader = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  const fragmentShader = /* glsl */ `
    precision highp float;
    uniform vec2  u_resolution;
    uniform float u_time;
    varying vec2  vUv;

    // 1D smooth band centred at \`c\` with given falloff width
    float band(float p, float c, float w, float intensity) {
      float d = abs(p - c);
      return intensity * smoothstep(w, w * 0.15, d);
    }

    // Cheap value noise for subtle internal texture
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    void main() {
      vec2 uv = vUv - 0.5;
      uv.x *= u_resolution.x / u_resolution.y;

      // Rotate by -65deg so beams sweep from upper-left to lower-right
      float angle = radians(-65.0);
      float ca = cos(angle), sa = sin(angle);
      vec2 r = vec2(ca * uv.x - sa * uv.y, sa * uv.x + ca * uv.y);

      float t = u_time * 0.04;
      float p = r.x;

      // Five drifting beams, weighted toward the left half of the screen
      float i = 0.0;
      i += band(p, -0.95 + 0.04 * sin(t * 1.3),  0.04, 0.35);
      i += band(p, -0.65 + 0.05 * sin(t * 0.7),  0.10, 0.85);
      i += band(p, -0.30 + 0.04 * sin(t * 0.5),  0.16, 1.10);
      i += band(p,  0.05 + 0.03 * sin(t * 0.9),  0.07, 0.45);
      i += band(p,  0.40 + 0.04 * sin(t * 0.6),  0.10, 0.55);
      i += band(p,  0.85 + 0.05 * sin(t * 0.4),  0.06, 0.30);

      // Soft vertical falloff so beams fade out at the very top/bottom
      float falloff = smoothstep(1.05, 0.0, abs(r.y));
      i *= mix(0.65, 1.0, falloff);

      // Subtle internal texture inside the bright bands
      float n = noise(r * vec2(40.0, 6.0) + vec2(t * 2.0, 0.0));
      i *= mix(0.85, 1.05, n);

      // Radial vignette
      float vig = smoothstep(1.25, 0.25, length(uv));
      i *= mix(0.55, 1.0, vig);

      // Compose: cool near-white with a faint blue lift
      vec3 col = vec3(i);
      col += vec3(0.005, 0.012, 0.025) * smoothstep(0.0, 1.0, i) * 8.0;

      // Floor: deep black background
      col = max(col, vec3(0.012));

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const uniforms = {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(1, 1) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(mesh);

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    uniforms.u_resolution.value.set(w, h);
  }
  resize();
  window.addEventListener("resize", resize);

  const clock = new THREE.Clock();
  let running = true;
  function tick() {
    if (!running) return;
    uniforms.u_time.value = clock.getElapsedTime();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  // Pause when off-screen to save battery
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) {
      clock.start();
      tick();
    }
  });
})();
