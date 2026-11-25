/**
 * Unified Hooke's Law Viscoelastic Jelly Physics Engine
 *
 * Implements damped spring integration (F = -k*(x - target) - c*v, dt <= 0.032s)
 * with volume-conserving squash-and-stretch (sx = 1 / sqrt(sy)) rendered via GPU
 * transforms. Tracks active per-element cleanups via WeakMap so mid-flight
 * retargeting never leaks RAF loops or creates conflicting inline transforms.
 */

export interface JellyEnterOptions {
  fromY: number;
  delayMs?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
  stretchFactor?: number;
  baseTransform?: string;
}

export interface JellyPulseOptions {
  vx?: number;
  vy?: number;
  intensity?: number;
  stiffness?: number;
  damping?: number;
  stretchFactor?: number;
  baseTransform?: string;
}

export interface SpringScalarOptions {
  initial?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
  epsilon?: number;
  onUpdate: (val: number, vel: number) => void;
  onRest?: () => void;
}

export interface SpringScalar {
  setTarget: (nextTarget: number, impulseVel?: number) => void;
  snap: (value: number) => void;
  getValue: () => number;
  getVelocity: () => number;
  destroy: () => void;
}

interface PulseState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  s: number;
  vs: number;
}

const activeCleanups = new WeakMap<HTMLElement, () => void>();
const activePulseStates = new WeakMap<HTMLElement, PulseState>();

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const cancelActive = (el: HTMLElement): void => {
  const prev = activeCleanups.get(el);
  if (prev) prev();
};

/**
 * Animates an element from `fromY` to 0 with Hooke's law spring overshoot,
 * smooth 0 -> 1 opacity ramp, and volume-conserving squash & stretch.
 * Sets `opacity: 0` synchronously before `delayMs` so removing initial
 * hiding classes never causes a premature flash.
 */
export function jellyEnter(el: HTMLElement, opts: JellyEnterOptions): () => void {
  cancelActive(el);

  const base = opts.baseTransform?.trim() ?? '';
  if (prefersReducedMotion() || opts.fromY === 0) {
    el.style.opacity = '';
    el.style.transform = base;
    el.style.willChange = '';
    return () => {};
  }

  const stiffness = opts.stiffness ?? 210;
  const damping = opts.damping ?? 16;
  const mass = opts.mass ?? 1;
  const stretchFactor = opts.stretchFactor ?? 0.00028;
  const delayMs = Math.max(0, opts.delayMs ?? 0);

  let x = opts.fromY;
  let v = 0;
  let rafId = 0;
  let timerId = 0;
  let cancelled = false;
  let startTime = 0;
  let lastTime = 0;

  el.style.opacity = '0';
  el.style.transform = base
    ? `${base} translateY(${x.toFixed(2)}px)`
    : `translateY(${x.toFixed(2)}px)`;
  el.style.willChange = 'transform, opacity';

  const finish = () => {
    if (cancelled) return;
    cancelled = true;
    activeCleanups.delete(el);
    el.style.transform = base;
    el.style.opacity = '';
    el.style.willChange = '';
  };

  const cleanup = () => {
    if (cancelled) return;
    cancelled = true;
    window.clearTimeout(timerId);
    cancelAnimationFrame(rafId);
    activeCleanups.delete(el);
    el.style.opacity = '';
    el.style.transform = base;
    el.style.willChange = '';
  };

  activeCleanups.set(el, cleanup);

  const step = (now: number) => {
    if (cancelled) return;
    const dt = clamp((now - lastTime) / 1000, 0.001, 0.032);
    lastTime = now;

    const force = -stiffness * x - damping * v;
    v += (force / mass) * dt;
    x += v * dt;

    const sy = clamp(1 - v * stretchFactor, 0.91, 1.11);
    const sx = 1 / Math.sqrt(sy);

    const fadeRaw = clamp((now - startTime) / 210, 0, 1);
    const opacity = 1 - (1 - fadeRaw) * (1 - fadeRaw);
    el.style.opacity = opacity.toFixed(3);

    const stepTransform = `translateY(${x.toFixed(2)}px) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
    el.style.transform = base ? `${base} ${stepTransform}` : stepTransform;

    if (Math.abs(x) < 0.15 && Math.abs(v) < 0.5) {
      finish();
      return;
    }

    rafId = requestAnimationFrame(step);
  };

  const begin = () => {
    if (cancelled) return;
    startTime = performance.now();
    lastTime = startTime;
    rafId = requestAnimationFrame(step);
  };

  if (delayMs > 0) {
    timerId = window.setTimeout(begin, delayMs);
  } else {
    rafId = requestAnimationFrame((now) => {
      startTime = now;
      lastTime = now;
      step(now);
    });
  }

  return cleanup;
}

/**
 * Injects an instantaneous viscoelastic velocity impulse onto an element,
 * smoothly retargeting if triggered mid-flight.
 */
export function jellyPulse(el: HTMLElement, opts: JellyPulseOptions = {}): () => void {
  if (prefersReducedMotion()) {
    return () => {};
  }

  const prevState = activePulseStates.get(el);
  const carry: PulseState = prevState
    ? { ...prevState }
    : { x: 0, y: 0, vx: 0, vy: 0, s: 0, vs: 0 };

  cancelActive(el);

  const intensity = opts.intensity ?? 1;
  const stiffness = opts.stiffness ?? 320;
  const damping = opts.damping ?? 14;
  const stretchFactor = opts.stretchFactor ?? 0.00035;
  const base = opts.baseTransform?.trim() ?? '';

  carry.vx = clamp(carry.vx + (opts.vx ?? 0) * intensity, -240, 240);
  carry.vy = clamp(carry.vy + (opts.vy ?? 0) * intensity, -240, 240);
  carry.vs = clamp(carry.vs - 1.35 * intensity, -3.2, 3.2);

  activePulseStates.set(el, carry);
  el.style.willChange = 'transform';

  let rafId = 0;
  let cancelled = false;
  let lastTime = performance.now();

  const cleanup = () => {
    if (cancelled) return;
    cancelled = true;
    cancelAnimationFrame(rafId);
    activeCleanups.delete(el);
    activePulseStates.delete(el);
    el.style.transform = base;
    el.style.willChange = '';
  };

  activeCleanups.set(el, cleanup);

  const step = (now: number) => {
    if (cancelled) return;
    const dt = clamp((now - lastTime) / 1000, 0.001, 0.032);
    lastTime = now;

    const ax = -stiffness * carry.x - damping * carry.vx;
    const ay = -stiffness * carry.y - damping * carry.vy;
    const as = -stiffness * carry.s - damping * carry.vs;

    carry.vx += ax * dt;
    carry.x += carry.vx * dt;
    carry.vy += ay * dt;
    carry.y += carry.vy * dt;
    carry.vs += as * dt;
    carry.s += carry.vs * dt;

    const sy = clamp(1 + carry.s - carry.vy * stretchFactor, 0.91, 1.11);
    const sx = 1 / Math.sqrt(sy);

    const parts: string[] = [];
    if (base) parts.push(base);
    if (Math.abs(carry.x) > 0.02 || Math.abs(carry.y) > 0.02) {
      parts.push(`translate(${carry.x.toFixed(2)}px, ${carry.y.toFixed(2)}px)`);
    }
    parts.push(`scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`);
    el.style.transform = parts.join(' ');

    if (
      Math.abs(carry.x) < 0.15 &&
      Math.abs(carry.y) < 0.15 &&
      Math.abs(carry.vx) < 0.5 &&
      Math.abs(carry.vy) < 0.5 &&
      Math.abs(carry.s) < 0.0015 &&
      Math.abs(carry.vs) < 0.01
    ) {
      cancelled = true;
      activeCleanups.delete(el);
      activePulseStates.delete(el);
      el.style.transform = base;
      el.style.willChange = '';
      return;
    }

    rafId = requestAnimationFrame(step);
  };

  rafId = requestAnimationFrame(step);
  return cleanup;
}

/**
 * Creates an underdamped Hooke's law scalar spring controller for SVG morph
 * progress, sliding bridges, and popovers.
 */
export function createSpringScalar(opts: SpringScalarOptions): SpringScalar {
  const stiffness = opts.stiffness ?? 260;
  const damping = opts.damping ?? 16;
  const mass = opts.mass ?? 1;
  const epsilon = opts.epsilon ?? 0.001;
  const velEpsilon = epsilon * 10;

  let val = opts.initial ?? 0;
  let target = val;
  let vel = 0;
  let rafId = 0;
  let running = false;
  let destroyed = false;
  let lastTime = 0;

  const stop = () => {
    running = false;
    cancelAnimationFrame(rafId);
  };

  const step = (now: number) => {
    if (destroyed || !running) return;
    const dt = clamp((now - lastTime) / 1000, 0.001, 0.032);
    lastTime = now;

    const force = -stiffness * (val - target) - damping * vel;
    vel += (force / mass) * dt;
    val += vel * dt;

    if (Math.abs(val - target) < epsilon && Math.abs(vel) < velEpsilon) {
      val = target;
      vel = 0;
      running = false;
      opts.onUpdate(val, vel);
      opts.onRest?.();
      return;
    }

    opts.onUpdate(val, vel);
    rafId = requestAnimationFrame(step);
  };

  return {
    setTarget(nextTarget: number, impulseVel = 0) {
      if (destroyed) return;
      if (prefersReducedMotion()) {
        stop();
        val = nextTarget;
        target = nextTarget;
        vel = 0;
        opts.onUpdate(val, 0);
        opts.onRest?.();
        return;
      }

      target = nextTarget;
      vel += impulseVel;

      if (Math.abs(val - target) < epsilon && Math.abs(vel) < velEpsilon) {
        stop();
        val = target;
        vel = 0;
        opts.onUpdate(val, 0);
        opts.onRest?.();
        return;
      }

      if (!running) {
        running = true;
        lastTime = performance.now();
        rafId = requestAnimationFrame(step);
      }
    },
    snap(value: number) {
      if (destroyed) return;
      stop();
      val = value;
      target = value;
      vel = 0;
      opts.onUpdate(val, 0);
    },
    getValue: () => val,
    getVelocity: () => vel,
    destroy() {
      destroyed = true;
      stop();
    }
  };
}
