/* ============================================================
   Global background — deep-space
   Fixed, full-viewport Three.js canvas behind the whole page.
   Stars + nebula glows + distant gas giant + shooting stars.
   Cursor parallax + gentle scroll drift. Performance mindful.
   ============================================================ */
import * as THREE from "three";

(async function initSpace() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 90);
  camera.position.set(0, 0, 7);

  const root = new THREE.Group();
  scene.add(root);

  /* ================= STAR POINTS ================= */
  const COUNT = 1500;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);
  const phases = new Float32Array(COUNT);

  const cWhite = new THREE.Color("#eaf6f0");
  const cGreen = new THREE.Color("#7affc4");
  const cBlue = new THREE.Color("#bcd9e8");

  /* layered orbital shells → a natural constellation web */
  const shells = [[1.9, 370], [2.5, 350], [3.4, 340], [5.2, 310], [7.6, 130]];

  let k = 0;
  for (const [r, count] of shells) {
    for (let i = 0; i < count && k < COUNT; i++, k++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const rr = r * (1 + (Math.random() - 0.5) * 0.2);
      positions[k * 3]     = rr * Math.sin(phi) * Math.cos(theta);
      positions[k * 3 + 1] = rr * Math.sin(phi) * Math.sin(theta);
      positions[k * 3 + 2] = rr * Math.cos(phi);

      phases[k] = Math.random() * Math.PI * 2;
      sizes[k] = 2.5 + Math.random() * 5.5;

      const tint = Math.random();
      const c = tint < 0.2 ? cGreen : tint < 0.5 ? cBlue : cWhite;
      const sparkle = 0.72 + Math.random() * 0.28;
      colors[k * 3]     = c.r * sparkle;
      colors[k * 3 + 1] = c.g * sparkle;
      colors[k * 3 + 2] = c.b * sparkle;
    }
  }

  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  starGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  starGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  starGeo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

  const starMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      uniform float uTime;
      uniform float uPixelRatio;
      attribute float aSize;
      attribute float aPhase;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float tw = 0.5 + 0.5 * sin(uTime * 1.8 + aPhase);
        vAlpha = tw;
        vColor = color;
        gl_PointSize = clamp(aSize * (9.0 / -mv.z) * uPixelRatio, 1.0, 42.0);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float dist = length(uv) * 2.0;
        float a = pow(1.0 - dist, 2.2);
        a *= vAlpha;
        if (a < 0.01) discard;
        gl_FragColor = vec4(vColor * a, a);
      }
    `,
  });

  const stars = new THREE.Points(starGeo, starMat);
  root.add(stars);

  /* ================= NEBULA GLOWS ================= */
  const NEB_COUNT = 26;
  const nebPos = new Float32Array(NEB_COUNT * 3);
  const nebCol = new Float32Array(NEB_COUNT * 3);
  const nebSize = new Float32Array(NEB_COUNT);

  const nebColors = ["#7affc4", "#8f7bff", "#5ec8ff"];
  const cA = new THREE.Color(), cB = new THREE.Color(), cC = new THREE.Color();
  cA.set(nebColors[0]); cB.set(nebColors[1]); cC.set(nebColors[2]);

  for (let i = 0; i < NEB_COUNT; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 3 + Math.random() * 4;
    nebPos[i * 3]     = r * Math.cos(a) * (0.7 + Math.random() * 0.6);
    nebPos[i * 3 + 1] = (Math.random() - 0.5) * 6;
    nebPos[i * 3 + 2] = r * Math.sin(a) - 2 - Math.random() * 2;

    const pick = Math.random();
    const c = pick < 0.4 ? cA : pick < 0.75 ? cB : cC;
    const dim = 0.05 + Math.random() * 0.07;
    nebCol[i * 3]     = c.r * dim;
    nebCol[i * 3 + 1] = c.g * dim;
    nebCol[i * 3 + 2] = c.b * dim;
    nebSize[i] = 34 + Math.random() * 40;
  }

  const nebGeo = new THREE.BufferGeometry();
  nebGeo.setAttribute("position", new THREE.BufferAttribute(nebPos, 3));
  nebGeo.setAttribute("color", new THREE.BufferAttribute(nebCol, 3));
  nebGeo.setAttribute("aSize", new THREE.BufferAttribute(nebSize, 1));

  const nebMat = new THREE.ShaderMaterial({
    uniforms: { uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      uniform float uPixelRatio;
      attribute float aSize;
      attribute vec3 color;
      varying vec3 vColor;
      void main() {
        vColor = color;
        gl_PointSize = aSize * uPixelRatio;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float dist = length(uv) * 2.0;
        float a = pow(1.0 - dist, 2.6);
        if (a < 0.01) discard;
        gl_FragColor = vec4(vColor * a, a);
      }
    `,
  });

  const nebula = new THREE.Points(nebGeo, nebMat);
  root.add(nebula);

  /* ================= DISTANT GAS GIANT ================= */
  scene.add(new THREE.AmbientLight(0x4a6359, 0.55));

  const planetGroup = new THREE.Group();
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, 40, 32),
    new THREE.MeshLambertMaterial({
      color: 0x1a3a2c,
      emissive: 0x0c241b,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.95,
    })
  );
  planetGroup.add(planet);

  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x2feb8f,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.06, 8, 72), ringMat);
  ring.rotation.x = Math.PI / 2.4;
  ring.rotation.z = 0.28;
  planetGroup.add(ring);

  const ring2 = ring.clone();
  ring2.scale.setScalar(1.3);
  ring2.material = ringMat.clone();
  ring2.material.opacity = 0.07;
  planetGroup.add(ring2);

  planetGroup.position.set(-4.6, 1.5, -7);
  scene.add(planetGroup);

  const planetLight = new THREE.PointLight(0x7affc4, 0.5, 22);
  planetLight.position.set(-3.1, 2.6, -3.5);
  scene.add(planetLight);

  /* ================= SHOOTING STARS ================= */
  const SHOOT = 3;
  const shooters = [];
  for (let i = 0; i < SHOOT; i++) {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(6);
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    const mat = new THREE.LineBasicMaterial({
      color: 0x9fffd2,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const line = new THREE.Line(g, mat);
    root.add(line);
    shooters.push({
      line,
      arr,
      life: -1,
      wait: 2.5 + i * 3.5,
      from: new THREE.Vector3(),
      to: new THREE.Vector3(),
    });
  }

  /* ================= CURSOR PARALLAX ================= */
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  const pointerFine = window.matchMedia("(pointer: fine)").matches;

  if (pointerFine && !prefersReduced) {
    window.addEventListener("pointermove", (e) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  const mouse = { x: 0, y: 0 };

  /* ================= SCROLL DRIFT ================= */
  function scrollProgress() {
    const el = document.documentElement;
    const max = el.scrollHeight - window.innerHeight;
    return max > 0 ? window.scrollY / max : 0;
  }

  /* ================= RESIZE ================= */
  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  /* ================= VISIBILITY PAUSE ================= */
  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    if (!running) return;
    const t = clock.getElapsedTime();
    const dt = clock.getDelta();

    current.x += (target.x - current.x) * 0.07;
    current.y += (target.y - current.y) * 0.07;

    /* slow travel forward + cursor + scroll drift (senior subtlety) */
    const targetY = current.x * 0.6 + scrollProgress() * 3.2 + t * 0.015;
    const targetX = -current.y * 0.4;

    root.rotation.y += (targetY - root.rotation.y) * (prefersReduced ? 0 : 0.05);
    root.rotation.x += (targetX - root.rotation.x) * (prefersReduced ? 0 : 0.05);
    root.rotation.z = Math.sin(t * 0.1) * 0.012;

    /* nebula slow breath */
    nebula.scale.setScalar(1 + Math.sin(t * 0.22) * 0.04);

    if (!prefersReduced) {
      starMat.uniforms.uTime.value = t;

      /* distant gas giant slowly turning */
      planetGroup.rotation.y += dt * 0.04;
      planetGroup.rotation.z = Math.sin(t * 0.08) * 0.03;

      /* shooting stars */
      const tmp = new THREE.Vector3();
      for (const s of shooters) {
        if (s.life < 0) {
          s.wait -= dt;
          if (s.wait <= 0) {
            s.life = 0;
            s.wait = 5 + Math.random() * 7;
            const ang = Math.random() * Math.PI * 2;
            const rad = 3.2 + Math.random() * 2;
            const y = 1.5 + Math.random() * 2.2;
            s.from.set(rad * Math.cos(ang), y, rad * Math.sin(ang) - 1);
            s.to.copy(s.from).add(tmp.set(-1.9 - Math.random() * 1.4, -1.7, 0.6));
            s.line.material.opacity = 0;
          }
        } else {
          s.life += dt;
          const p = Math.min(s.life / 1.1, 1);
          const px = s.from.x + (s.to.x - s.from.x) * p;
          const py = s.from.y + (s.to.y - s.from.y) * p;
          const pz = s.from.z + (s.to.z - s.from.z) * p;
          s.arr[0] = px; s.arr[1] = py; s.arr[2] = pz;
          s.arr[3] = s.to.x; s.arr[4] = s.to.y; s.arr[5] = s.to.z;
          s.line.geometry.attributes.position.needsUpdate = true;
          s.line.material.opacity = (1 - p) * 0.85;
          if (s.life >= 1.1) s.life = -1;
        }
      }
    }

    renderer.render(scene, camera);
  }
  animate();
})();