/**
 * Full-viewport WebGL2 Painterly Pixel-Art + 4x4 Ordered Bayer Dither Landscape Engine
 *
 * Composition & depth-ordered parallax layers:
 *   1. Deep twilight sky with fine Bayer dither gradient, 1px & '+' cross stars,
 *      and sculpted 3-tone cumulus cloud banks framing upper-left & upper-right (0.12x)
 *   2. Refined Moon (night) & Sun (day) with 900ms parabolic orbital arc (0.22x)
 *   3. Deep slate-indigo calm horizon sea with razor-thin horizontal shimmer streaks,
 *      interactive click ripples, and jumping pixel fish + splash droplets (0.40x)
 *   4. U-shaped foreground coastal meadow of 3 overlapping tiers of gracefully arching
 *      curved grass fronds with 1px rim highlights, wind waves & cursor repulsion (0.65x–1.0x)
 */

export type PaletteId = 'nile-silt' | 'deep-moss' | 'basalt' | 'nocturne';

type RGB = [number, number, number];

interface WorldPalette {
  skyTop: RGB;
  skyMid: RGB;
  skyLow: RGB;
  cloudHi: RGB;
  cloudLit: RGB;
  cloudShad: RGB;
  moon: RGB;
  sun: RGB;
  seaTop: RGB;
  seaMid: RGB;
  seaDeep: RGB;
  seaGlint: RGB;
  grassBack: RGB;
  grassMid: RGB;
  grassFront: RGB;
  grassTip: RGB;
  wildlife: RGB;
}

const hex = (h: string): RGB => {
  const c = h.replace('#', '');
  const n = parseInt(c, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const PALETTES: Record<PaletteId, { night: WorldPalette; day: WorldPalette }> = {
  'nile-silt': {
    night: {
      skyTop: hex('#080707'),
      skyMid: hex('#130f0d'),
      skyLow: hex('#40291c'),
      cloudHi: hex('#dfa366'),
      cloudLit: hex('#6b3d25'),
      cloudShad: hex('#1f1310'),
      moon: hex('#f6e5c4'),
      sun: hex('#f7c779'),
      seaTop: hex('#1a2736'),
      seaMid: hex('#101924'),
      seaDeep: hex('#080d14'),
      seaGlint: hex('#e8c68e'),
      grassBack: hex('#6e5839'),
      grassMid: hex('#30281c'),
      grassFront: hex('#090808'),
      grassTip: hex('#c4985a'),
      wildlife: hex('#ebd09b')
    },
    day: {
      skyTop: hex('#96abbc'),
      skyMid: hex('#d7cab3'),
      skyLow: hex('#f7ebd4'),
      cloudHi: hex('#fffaf2'),
      cloudLit: hex('#ebd4b7'),
      cloudShad: hex('#b5977c'),
      moon: hex('#f7edd8'),
      sun: hex('#ffd478'),
      seaTop: hex('#4f7487'),
      seaMid: hex('#335263'),
      seaDeep: hex('#1e3442'),
      seaGlint: hex('#fff2cf'),
      grassBack: hex('#8c7a52'),
      grassMid: hex('#52482f'),
      grassFront: hex('#211e15'),
      grassTip: hex('#e0b363'),
      wildlife: hex('#2b241c')
    }
  },
  'deep-moss': {
    night: {
      skyTop: hex('#070b09'),
      skyMid: hex('#101915'),
      skyLow: hex('#2e4237'),
      cloudHi: hex('#dfd0af'),
      cloudLit: hex('#567363'),
      cloudShad: hex('#192620'),
      moon: hex('#ece6d2'),
      sun: hex('#ebd096'),
      seaTop: hex('#172c2a'),
      seaMid: hex('#0e1e1d'),
      seaDeep: hex('#081211'),
      seaGlint: hex('#e2d4b1'),
      grassBack: hex('#5d6e56'),
      grassMid: hex('#26362b'),
      grassFront: hex('#09100c'),
      grassTip: hex('#cbb894'),
      wildlife: hex('#e4d6b5')
    },
    day: {
      skyTop: hex('#80a69d'),
      skyMid: hex('#bcd4c9'),
      skyLow: hex('#ebf2eb'),
      cloudHi: hex('#fbfdfb'),
      cloudLit: hex('#d2e0d7'),
      cloudShad: hex('#92ad9f'),
      moon: hex('#eef5ef'),
      sun: hex('#f7da92'),
      seaTop: hex('#45736e'),
      seaMid: hex('#2c524e'),
      seaDeep: hex('#193330'),
      seaGlint: hex('#f8f1d8'),
      grassBack: hex('#5e7a5d'),
      grassMid: hex('#334d39'),
      grassFront: hex('#15241a'),
      grassTip: hex('#cfb882'),
      wildlife: hex('#1e3026')
    }
  },
  basalt: {
    night: {
      skyTop: hex('#090809'),
      skyMid: hex('#191213'),
      skyLow: hex('#5c3227'),
      cloudHi: hex('#f2b28d'),
      cloudLit: hex('#944b3a'),
      cloudShad: hex('#2e1918'),
      moon: hex('#f5e0d4'),
      sun: hex('#f7a97e'),
      seaTop: hex('#1b2633'),
      seaMid: hex('#111822'),
      seaDeep: hex('#0a0e14'),
      seaGlint: hex('#f2bc99'),
      grassBack: hex('#7d5e48'),
      grassMid: hex('#382822'),
      grassFront: hex('#0b0909'),
      grassTip: hex('#e08a6c'),
      wildlife: hex('#f5b99f')
    },
    day: {
      skyTop: hex('#9e8e94'),
      skyMid: hex('#dec0b4'),
      skyLow: hex('#f7e8df'),
      cloudHi: hex('#fff8f4'),
      cloudLit: hex('#ebd0c3'),
      cloudShad: hex('#b58f82'),
      moon: hex('#f7ebe4'),
      sun: hex('#ffb57d'),
      seaTop: hex('#536d7d'),
      seaMid: hex('#374d5c'),
      seaDeep: hex('#22313d'),
      seaGlint: hex('#ffe9d6'),
      grassBack: hex('#82634f'),
      grassMid: hex('#4c382d'),
      grassFront: hex('#211714'),
      grassTip: hex('#e08666'),
      wildlife: hex('#33201b')
    }
  },
  nocturne: {
    night: {
      skyTop: hex('#070a10'),
      skyMid: hex('#101724'),
      skyLow: hex('#293c54'),
      cloudHi: hex('#b9d4c4'),
      cloudLit: hex('#4f6a87'),
      cloudShad: hex('#162130'),
      moon: hex('#e6f0fc'),
      sun: hex('#ebd8a4'),
      seaTop: hex('#192c40'),
      seaMid: hex('#101d2c'),
      seaDeep: hex('#08101a'),
      seaGlint: hex('#cbe3d8'),
      grassBack: hex('#536b64'),
      grassMid: hex('#233333'),
      grassFront: hex('#080d12'),
      grassTip: hex('#96c2a8'),
      wildlife: hex('#c4e6d2')
    },
    day: {
      skyTop: hex('#749bc4'),
      skyMid: hex('#b0cae3'),
      skyLow: hex('#e7f0f8'),
      cloudHi: hex('#fafdff'),
      cloudLit: hex('#cfe0f0'),
      cloudShad: hex('#8ea8c2'),
      moon: hex('#edf4fc'),
      sun: hex('#ffe094'),
      seaTop: hex('#446f96'),
      seaMid: hex('#2c4f70'),
      seaDeep: hex('#19314a'),
      seaGlint: hex('#f5faff'),
      grassBack: hex('#56786b'),
      grassMid: hex('#2f4a41'),
      grassFront: hex('#142420'),
      grassTip: hex('#96c2a8'),
      wildlife: hex('#1b2b3d')
    }
  }
};

const VERT_SRC = `#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](
  vec2(-1.0, -1.0),
  vec2( 3.0, -1.0),
  vec2(-1.0,  3.0)
);
void main() {
  gl_Position = vec4(POS[gl_VertexID], 0.0, 1.0);
}
`;

const FRAG_SRC = `#version 300 es
precision highp float;

out vec4 fragColor;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uMouseActive;
uniform float uDayProgress;
uniform float uWindGust;
uniform float uMicroRipple;
uniform float uReducedMotion;

// Pre-blended palette uniforms
uniform vec3 uSkyTop;
uniform vec3 uSkyMid;
uniform vec3 uSkyLow;
uniform vec3 uCloudHi;
uniform vec3 uCloudLit;
uniform vec3 uCloudShad;
uniform vec3 uMoonCol;
uniform vec3 uSunCol;
uniform vec3 uSeaTop;
uniform vec3 uSeaMid;
uniform vec3 uSeaDeep;
uniform vec3 uSeaGlint;
uniform vec3 uGrassBack;
uniform vec3 uGrassMid;
uniform vec3 uGrassFront;
uniform vec3 uGrassTip;
uniform vec3 uWildlifeCol;

// Celestial coordinates (GL UV space, matched 1:1 with CPU hitboxes)
uniform vec2 uMoonPos;
uniform vec2 uSunPos;

// Up to 3 water splashes: (x_uv, y_uv, age_sec, strength)
uniform vec4 uSplashes[3];

// 5 Pixel birds: (x_uv, y_uv, flap_phase, size)
uniform vec4 uBirds[5];

// Jumping fish: (x_uv, y_uv, angle_rad, active)
uniform vec4 uFish;

// 6 splash droplets: (x_uv, y_uv, alpha, 0)
uniform vec4 uDrops[6];

// 4x4 Ordered Bayer matrix normalized to (0, 1)
float bayer4(vec2 p) {
  int x = int(mod(p.x, 4.0));
  int y = int(mod(p.y, 4.0));
  int idx = y * 4 + x;
  int m = 0;
  if (idx == 0) m = 0;
  else if (idx == 1) m = 8;
  else if (idx == 2) m = 2;
  else if (idx == 3) m = 10;
  else if (idx == 4) m = 12;
  else if (idx == 5) m = 4;
  else if (idx == 6) m = 14;
  else if (idx == 7) m = 6;
  else if (idx == 8) m = 3;
  else if (idx == 9) m = 11;
  else if (idx == 10) m = 1;
  else if (idx == 11) m = 9;
  else if (idx == 12) m = 15;
  else if (idx == 13) m = 7;
  else if (idx == 14) m = 13;
  else m = 5;
  return (float(m) + 0.5) / 16.0;
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash12(i + vec2(0.0, 0.0)), hash12(i + vec2(1.0, 0.0)), u.x),
    mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * valueNoise(p);
    p = p * 2.03 + vec2(11.3, 7.7);
    a *= 0.5;
  }
  return v;
}

// Smooth Bayer-stepped color mix for fine painterly pixel-art bands
vec3 ditherMix(vec3 c0, vec3 c1, float val, float thresh, float steps) {
  float s = clamp(val, 0.0, 1.0) * steps;
  float base = floor(s);
  float frac = s - base;
  float level = (base + (frac > thresh ? 1.0 : 0.0)) / steps;
  return mix(c0, c1, clamp(level, 0.0, 1.0));
}

// Signed puff helper for scalloped cumulus cloud banks (returns positive inside)
float puff(vec2 p, vec2 c, vec2 r) {
  vec2 d = (p - c) / r;
  return 1.0 - dot(d, d);
}

// Evaluates sculpted framing cumulus banks (left & right corners, open starry center)
// Returns vec3(density, heightInCloud, innerLight)
vec3 evalCumulus(vec2 p, float t) {
  // Subtle breathing drift so clouds feel alive while keeping the iconic corner framing
  float driftL = sin(t * 0.075) * 0.012;
  float driftR = cos(t * 0.068 + 0.8) * 0.012;
  vec2 pl = p - vec2(driftL, 0.0);
  vec2 pr = p - vec2(driftR, 0.0);

  // Fine cumulus contour ruffling (scalloped painterly ridges)
  float nFine = fbm(vec2(p.x * 14.5 - t * 0.014, p.y * 16.5)) - 0.5;
  float nMed  = fbm(vec2(p.x * 6.5 - t * 0.009, p.y * 8.2)) - 0.5;
  float ruffle = nFine * 0.30 + nMed * 0.24;

  // --- LEFT DRAMATIC CUMULUS BANK (upper-left cascade sloping down toward center) ---
  float leftMain = -1.0;
  leftMain = max(leftMain, puff(pl, vec2(0.025, 0.885), vec2(0.068, 0.088)));
  leftMain = max(leftMain, puff(pl, vec2(0.088, 0.875), vec2(0.058, 0.072)));
  leftMain = max(leftMain, puff(pl, vec2(0.128, 0.825), vec2(0.056, 0.058)));
  leftMain = max(leftMain, puff(pl, vec2(0.185, 0.815), vec2(0.048, 0.052)));
  leftMain = max(leftMain, puff(pl, vec2(0.232, 0.778), vec2(0.055, 0.036)));
  leftMain = max(leftMain, puff(pl, vec2(0.285, 0.752), vec2(0.055, 0.022)));
  leftMain = max(leftMain, puff(pl, vec2(0.06, 0.785), vec2(0.145, 0.046)));
  float leftBaseCut = smoothstep(0.735 + nMed * 0.022, 0.766, pl.y);
  leftMain = (leftMain + ruffle) * leftBaseCut;

  // Slender detached wispy cloud streaks beneath left bank
  float leftWisp = -1.0;
  leftWisp = max(leftWisp, puff(pl, vec2(0.04, 0.675), vec2(0.095, 0.017)));
  leftWisp = max(leftWisp, puff(pl, vec2(0.14, 0.722), vec2(0.055, 0.010)));
  leftWisp = max(leftWisp, puff(pl, vec2(0.095, 0.545), vec2(0.115, 0.022)));
  leftWisp = max(leftWisp, puff(pl, vec2(0.175, 0.528), vec2(0.072, 0.015)));
  leftWisp = (leftWisp + nFine * 0.32) * smoothstep(0.508, 0.528, pl.y);

  // --- RIGHT DRAMATIC CUMULUS BANK (upper-right cascade sloping down-left) ---
  float rightMain = -1.0;
  rightMain = max(rightMain, puff(pr, vec2(0.955, 0.835), vec2(0.075, 0.078)));
  rightMain = max(rightMain, puff(pr, vec2(0.895, 0.818), vec2(0.060, 0.065)));
  rightMain = max(rightMain, puff(pr, vec2(0.835, 0.788), vec2(0.055, 0.052)));
  rightMain = max(rightMain, puff(pr, vec2(0.775, 0.752), vec2(0.062, 0.036)));
  rightMain = max(rightMain, puff(pr, vec2(0.705, 0.726), vec2(0.068, 0.024)));
  rightMain = max(rightMain, puff(pr, vec2(0.645, 0.708), vec2(0.048, 0.016)));
  rightMain = max(rightMain, puff(pr, vec2(0.915, 0.746), vec2(0.145, 0.042)));
  float rightBaseCut = smoothstep(0.698 + nMed * 0.022, 0.728, pr.y);
  rightMain = (rightMain + ruffle) * rightBaseCut;

  // Slender detached wispy cloud streaks beneath right bank
  float rightWisp = -1.0;
  rightWisp = max(rightWisp, puff(pr, vec2(0.895, 0.682), vec2(0.088, 0.014)));
  rightWisp = max(rightWisp, puff(pr, vec2(0.785, 0.695), vec2(0.055, 0.010)));
  rightWisp = max(rightWisp, puff(pr, vec2(0.84, 0.555), vec2(0.115, 0.024)));
  rightWisp = max(rightWisp, puff(pr, vec2(0.76, 0.538), vec2(0.068, 0.016)));
  rightWisp = (rightWisp + nFine * 0.32) * smoothstep(0.518, 0.538, pr.y);

  float density = max(max(leftMain, rightMain), max(leftWisp, rightWisp));

  // Moody painterly lighting: deep shadow belly + warm midtone + narrow glowing inner wisps
  float isLeft = step(p.x, 0.5);
  float baseY = mix(0.70, 0.73, isLeft);
  float hNorm = clamp((p.y - baseY) / 0.21, 0.0, 1.0);
  float ridgeNoise = fbm(vec2(p.x * 18.0 - t * 0.016, p.y * 22.0 + 3.1));
  float wispRidge = smoothstep(0.46, 0.78, ridgeNoise);
  // Rim/inner luminous creases concentrated along turbulent mid-upper ridges
  float lit = clamp(hNorm * 0.32 + wispRidge * 0.62 + (1.0 - smoothstep(0.04, 0.42, density)) * 0.10 - (1.0 - hNorm) * 0.22, 0.0, 1.0);

  return vec3(density, hNorm, lit);
}

void main() {
  vec2 px = floor(gl_FragCoord.xy);
  vec2 uv = (px + 0.5) / uResolution;
  float aspect = uResolution.x / max(1.0, uResolution.y);
  float thresh = bayer4(px);
  float t = uReducedMotion > 0.5 ? 0.0 : uTime;

  // Subtle smoothed mouse parallax
  vec2 par = (uReducedMotion > 0.5) ? vec2(0.0) : (uMouse - 0.5) * vec2(0.018, 0.011);

  // Horizon sits at ~36.5% from bottom (63.5% from top), matching the cinematic reference
  float horizonY = 0.365 + par.y * 0.22;

  vec3 col = uSkyTop;

  // =========================================================================
  // LAYER 1 — BAYER TWILIGHT SKY, '+' CROSS STARS & FRAMING CUMULUS CLOUDS
  // =========================================================================
  if (uv.y >= horizonY) {
    float skyH = clamp((uv.y - horizonY) / max(0.01, 1.0 - horizonY), 0.0, 1.0);

    // Warm horizon twilight glow with subtle center radiance
    float centerGlow = exp(-pow((uv.x - 0.5) * 1.45, 2.0)) * 0.14;
    float lowCurve = pow(max(0.0, 1.0 - skyH), 1.65) + centerGlow * (1.0 - skyH);
    if (skyH < 0.44) {
      float m = clamp(skyH / 0.44, 0.0, 1.0);
      col = ditherMix(uSkyLow, uSkyMid, m, thresh, 7.0);
    } else {
      float m = clamp((skyH - 0.44) / 0.56, 0.0, 1.0);
      col = ditherMix(uSkyMid, uSkyTop, m, thresh, 6.0);
    }
    // Subtle extra warmth right along the central horizon
    if (lowCurve * 0.32 > thresh && skyH < 0.35) {
      col = mix(col, uSkyLow, 0.22);
    }

    // Sparse crisp stars + delicate 3x3 '+' cross sparkles in open night sky
    float nightVis = smoothstep(0.55, 0.05, uDayProgress);
    if (nightVis > 0.01 && skyH > 0.32) {
      vec2 starGrid = floor((uv + par * 0.08) * uResolution);
      float h = hash12(starGrid);
      float fadeY = smoothstep(0.32, 0.72, skyH);
      if (h > 0.9974) {
        float tw = 0.5 + 0.5 * sin(t * (1.5 + fract(h * 73.0) * 2.5) + h * 110.0);
        col = mix(col, uMoonCol, clamp(tw * nightVis * fadeY * 0.92, 0.18, 0.92));
      } else {
        // Check 4-neighbor '+' cross sparkle arms around extra-bright stars
        float hL = hash12(starGrid + vec2(-1.0, 0.0));
        float hR = hash12(starGrid + vec2( 1.0, 0.0));
        float hD = hash12(starGrid + vec2( 0.0,-1.0));
        float hU = hash12(starGrid + vec2( 0.0, 1.0));
        float hMax = max(max(hL, hR), max(hD, hU));
        if (hMax > 0.99945) {
          float tw = 0.45 + 0.55 * sin(t * 2.1 + hMax * 95.0);
          col = mix(col, uMoonCol, clamp(tw * nightVis * fadeY * 0.52, 0.1, 0.55));
        }
      }
    }

    // =======================================================================
    // LAYER 2 — REFINED INTERACTIVE MOON (NIGHT) & SUN (DAY) (0.22x)
    // =======================================================================
    vec2 celOff = par * 0.22;

    // Moon (refined crescent tucked in open starry upper sky)
    vec2 mPos = uMoonPos - celOff;
    if (mPos.y > horizonY - 0.06) {
      vec2 md = (uv - mPos) * vec2(aspect, 1.0);
      float mDist = length(md);
      float mRad = 0.027;
      float mVis = smoothstep(horizonY - 0.04, horizonY + 0.04, mPos.y) * (1.0 - smoothstep(0.52, 0.92, uDayProgress));

      float halo = exp(-mDist * 14.5) * 0.52 * mVis;
      if (halo > thresh * 0.88) {
        col = mix(col, uMoonCol, 0.24);
      }
      if (mDist < mRad && mVis > 0.05) {
        vec2 cut = md - vec2(0.011, 0.007);
        if (length(cut) > mRad * 0.84) {
          col = mix(col, uMoonCol, clamp(mVis * 0.96, 0.0, 1.0));
        } else if (0.16 * mVis > thresh) {
          col = mix(col, uMoonCol, 0.14);
        }
      }
    }

    // Sun (warm golden-hour disc in open upper-right sky in Light Mode)
    vec2 sPos = uSunPos - celOff;
    if (sPos.y > horizonY - 0.06) {
      vec2 sd = (uv - sPos) * vec2(aspect, 1.0);
      float sDist = length(sd);
      float sRad = 0.036;
      float sVis = smoothstep(horizonY - 0.04, horizonY + 0.04, sPos.y) * smoothstep(0.08, 0.48, uDayProgress);

      float ang = atan(sd.y, sd.x);
      float rays = 0.5 + 0.5 * sin(ang * 8.0 + t * 0.3);
      float sunHalo = exp(-sDist * 9.5) * (0.65 + 0.2 * rays) * sVis;
      if (sunHalo > thresh * 0.85) {
        col = mix(col, uSunCol, 0.34);
      }
      if (sDist < sRad && sVis > 0.05) {
        vec3 core = mix(uSunCol, vec3(1.0, 0.98, 0.92), smoothstep(sRad, 0.0, sDist) * 0.55);
        col = mix(col, core, clamp(sVis, 0.0, 1.0));
      }
    }

    // Sculpted 3-tone cumulus cloud banks framing upper-left & upper-right
    vec2 cloudUv = uv + par * 0.12;
    vec3 cl = evalCumulus(cloudUv, t);
    float cDens = cl.x;
    if (cDens > 0.02) {
      float edgeSoft = smoothstep(0.02, 0.22, cDens);
      // Crisp pixel-art cloud contour with slight Bayer feathering on outer edge
      if (edgeSoft > thresh * 0.82) {
        float lit = cl.z;
        vec3 cCol;
        if (lit < 0.60) {
          cCol = ditherMix(uCloudShad, uCloudLit, lit / 0.60, thresh, 4.0);
        } else {
          cCol = ditherMix(uCloudLit, uCloudHi, (lit - 0.60) / 0.40, thresh, 3.0);
        }
        if (lit > 0.88 && edgeSoft > 0.38) {
          cCol = mix(cCol, uCloudHi, 0.78);
        }
        col = mix(col, cCol, 0.96);
      }
    }

    // Gliding Pixel Birds (delicate 2-frame wing-flap silhouettes)
    for (int i = 0; i < 5; i++) {
      vec4 b = uBirds[i];
      if (b.w == 0.0) continue;
      vec2 bPos = b.xy - par * 0.20;
      vec2 dPx = floor((uv - bPos) * uResolution);
      if (abs(dPx.x) <= 4.0 && abs(dPx.y) <= 2.0) {
        float flap = sin(b.z);
        bool hit = false;
        int ix = int(dPx.x);
        int iy = int(dPx.y);
        if (abs(b.w) > 1.2) {
          if (ix == 0 && iy == 0) hit = true;
          if (flap > 0.0) {
            if ((abs(ix) == 1 && iy == 1) || (abs(ix) == 2 && iy == 2) || (abs(ix) == 3 && iy == 1)) hit = true;
          } else {
            if ((abs(ix) == 1 && iy == 0) || (abs(ix) == 2 && iy == -1) || (abs(ix) == 3 && iy == -1)) hit = true;
          }
        } else {
          if (ix == 0 && iy == 0) hit = true;
          if (flap > 0.0) {
            if ((abs(ix) == 1 && iy == 1) || (abs(ix) == 2 && iy == 1)) hit = true;
          } else {
            if ((abs(ix) == 1 && iy == 0) || (abs(ix) == 2 && iy == -1)) hit = true;
          }
        }
        if (hit) {
          col = mix(col, uWildlifeCol, 0.82);
        }
      }
    }
  } else {
    // =======================================================================
    // LAYER 3 — DEEP CALM HORIZON SEA WITH RAZOR-THIN HORIZONTAL SHIMMER STREAKS
    // =======================================================================
    float depth = clamp((horizonY - uv.y) / max(0.01, horizonY), 0.0, 1.0);
    vec2 seaUv = uv + par * 0.40;

    // Base deep slate-indigo water gradient (Bayer-dithered smoothly)
    if (depth < 0.42) {
      col = ditherMix(uSeaTop, uSeaMid, depth / 0.42, thresh, 5.0);
    } else {
      col = ditherMix(uSeaMid, uSeaDeep, (depth - 0.42) / 0.58, thresh, 5.0);
    }

    // Subtle wide flat horizontal perspective wave troughs across the whole sea
    float rowY = px.y;
    float perspScale = mix(38.0, 10.0, sqrt(depth));
    float waveBand = sin(seaUv.y * 190.0 * (1.2 - depth * 0.55) - t * (1.1 + uWindGust * 1.8) + sin(seaUv.x * 16.0 + t * 0.6) * 1.3);
    float horizStreak = valueNoise(vec2(seaUv.x * perspScale + t * 0.18 * (0.4 + depth), floor(rowY * 0.5)));
    if (horizStreak > 0.66 && waveBand > 0.15) {
      col = mix(col, uSeaTop, 0.38 * (1.0 - depth * 0.35));
    } else if (horizStreak < 0.30) {
      col = mix(col, uSeaDeep, 0.42);
    }

    // Crisp subtle warm twilight horizon hairline
    float fromHor = (horizonY - uv.y) * uResolution.y;
    if (fromHor < 1.5) {
      col = mix(col, mix(uSeaTop, uSeaGlint, 0.35), 0.65);
    } else if (fromHor < 7.0) {
      float hReflect = (1.0 - fromHor / 7.0) * 0.22;
      if (hReflect > thresh * 0.85) {
        col = mix(col, uSkyLow, 0.42);
      }
    }

    // Delicate sparse 1px horizontal specular shimmer dashes (matching reference reflection path)
    vec2 celOff = par * 0.22;
    float activeRefX = mix(mix(0.45, uMoonPos.x - celOff.x, 0.42), uSunPos.x - celOff.x, uDayProgress);
    float coneHalfW = 0.048 + depth * 0.095;
    float wobble = sin(rowY * 0.42 - t * (1.7 + uWindGust * 2.4 + uMicroRipple * 3.8)) * (0.007 + depth * 0.015);
    float distFromCenter = abs((uv.x + wobble) - activeRefX);
    float envelope = exp(-(distFromCenter * distFromCenter) / (2.0 * coneHalfW * coneHalfW));

    // Sparse crisp 1px-tall pixel-row dashes (serene dark water stays dominant)
    float rowHash = hash11(rowY * 1.37);
    float rowActive = step(0.56 - uMicroRipple * 0.16 - uWindGust * 0.12, rowHash);
    float dashFreq = mix(64.0, 28.0, depth);
    float dashShift = t * (0.5 + rowHash * 0.55 + uWindGust * 1.2) * (rowHash > 0.5 ? 1.0 : -1.0);
    float dashVal = valueNoise(vec2(seaUv.x * dashFreq + dashShift, rowY * 0.92));
    float shimmer = envelope * rowActive * smoothstep(0.60 - envelope * 0.14, 0.80, dashVal);
    shimmer *= (1.0 - depth * 0.38) * (1.0 + uWindGust * 0.30 + uMicroRipple * 0.55);

    if (shimmer > 0.28) {
      float bright = smoothstep(0.28, 0.72, shimmer);
      vec3 gCol = mix(uSeaGlint, vec3(1.0, 0.96, 0.86), bright * 0.42);
      col = mix(col, gCol, clamp(0.42 + bright * 0.50, 0.0, 0.90));
    }

    // Scattered micro ambient glints across the sea near horizon
    float ambGlint = valueNoise(vec2(seaUv.x * 46.0 - t * 0.35, rowY * 0.9));
    if (ambGlint > 0.87 && depth < 0.55 && rowHash > 0.62) {
      col = mix(col, uSeaGlint, 0.28 * (1.0 - depth));
    }

    // Interactive horizontal expanding pixel ripple rings (clicks + fish splashes)
    for (int i = 0; i < 3; i++) {
      vec4 sp = uSplashes[i];
      if (sp.w <= 0.001 || sp.z > 1.8) continue;
      float age = sp.z;
      float rad = age * 0.125;
      vec2 d = (uv - sp.xy) * vec2(aspect * 0.48, 2.55);
      float dist = length(d);
      float ring1 = abs(dist - rad);
      float ring2 = abs(dist - rad * 0.58);
      float decay = max(0.0, 1.0 - age / 1.8) * sp.w;
      float w = max(smoothstep(0.015, 0.0, ring1) * decay, smoothstep(0.010, 0.0, ring2) * decay * 0.65);
      if (w > thresh * 0.62) {
        col = mix(col, uSeaGlint, clamp(w * 0.85, 0.32, 0.88));
      }
    }
  }

  // =========================================================================
  // JUMPING PIXEL FISH & 1px WATER SPLASH DROPLETS (Sea-to-Sky breach)
  // =========================================================================
  if (uFish.w > 0.5) {
    vec2 fPos = uFish.xy - par * 0.40;
    vec2 diff = (uv - fPos) * uResolution;
    float ca = cos(-uFish.z);
    float sa = sin(-uFish.z);
    vec2 rot = vec2(diff.x * ca - diff.y * sa, diff.x * sa + diff.y * ca);
    if (abs(rot.x) < 7.0 && abs(rot.y) < 4.5) {
      bool inBody = (rot.x * rot.x) / 14.0 + (rot.y * rot.y) / 3.8 <= 1.0;
      bool inTail = (rot.x < -3.0 && rot.x > -6.2 && abs(rot.y) < (-rot.x - 2.4) * 0.88 && abs(rot.y) > (-rot.x - 5.0) * 0.34);
      if (inBody || inTail) {
        col = mix(uGrassBack, uSeaGlint, rot.y > 0.25 ? 0.85 : 0.32);
      }
    }
  }

  for (int i = 0; i < 6; i++) {
    vec4 dr = uDrops[i];
    if (dr.z <= 0.01) continue;
    vec2 dPos = dr.xy - par * 0.40;
    vec2 dPx = abs(floor((uv - dPos) * uResolution));
    if (dPx.x < 1.1 && dPx.y < 1.1 && dr.z > thresh * 0.45) {
      col = mix(col, uSeaGlint, 0.92);
    }
  }

  // =========================================================================
  // LAYER 4 — U-SHAPED FOREGROUND MEADOW OF ARCHING CURVED GRASS FRONDS
  // Multi-cell sweep (-5..5) so long curved blades arch gracefully without clipping
  // =========================================================================
  if (uv.y < 0.37) {
    // U-shaped meadow height envelope: lush tall framing hills on left/right, low dip in center
    float edgeDist = abs(uv.x - 0.5) * 2.0; // 0 at center, 1 at screen edges
    float uBowl = 0.46 + 0.54 * pow(edgeDist, 1.45);

    // Rich dark vegetated shoreline bank right along the bottom edge so roots blend organically
    float bankH = (0.048 + 0.068 * pow(edgeDist, 1.4)) * (0.86 + 0.24 * sin(uv.x * 16.0) + 0.12 * sin(uv.x * 39.0));
    if (uv.y < bankH) {
      col = ditherMix(uGrassFront, uGrassMid, uv.y / max(0.001, bankH), thresh, 3.0);
    }

    // 3 overlapping lush tiers: 0 = tall backlit golden reeds, 1 = dense mid olive meadow, 2 = bold obsidian foreground fronds
    for (int layer = 0; layer < 3; layer++) {
      float lf = float(layer);
      float layerParallax = 0.65 + lf * 0.175; // 0.65 -> 0.825 -> 1.0x
      float gxPx = px.x + par.x * uResolution.x * layerParallax;

      float spacing = (layer == 0) ? 3.2 : (layer == 1) ? 3.8 : 4.6;
      float baseCell = floor(gxPx / spacing);

      bool hitBlade = false;
      bool hitRim = false;
      bool hitSeedHead = false;
      float bestTY = 0.0;
      float bestSeed = 0.0;

      for (int dc = -6; dc <= 6; dc++) {
        float cellId = baseCell + float(dc);
        float seed  = hash11(cellId * 1.17 + lf * 97.3);
        float seed2 = hash11(cellId * 2.71 + lf * 53.7);
        float seed3 = hash11(cellId * 4.13 + lf * 31.1);
        float cellCenter = (cellId + 0.12 + seed2 * 0.76) * spacing;

        // Evaluate local U-bowl envelope at blade root X
        float rootU = clamp((cellCenter - par.x * uResolution.x * layerParallax) / max(1.0, uResolution.x), 0.0, 1.0);
        float rootEdge = abs(rootU - 0.5) * 2.0;
        float rootBowl = 0.44 + 0.56 * pow(rootEdge, 1.42);
        float clump = 0.80 + 0.24 * sin(cellId * 0.27 + lf * 2.1) + 0.14 * sin(cellId * 0.71 - lf * 1.3);

        // Tall sweeping meadow blades in pixels
        float maxFrac = (layer == 0) ? 0.265 : (layer == 1) ? 0.215 : 0.175;
        float bladeH = uResolution.y * (0.085 + seed * maxFrac) * rootBowl * clump;

        float tY = px.y / max(1.0, bladeH);
        if (tY < 0.0 || tY > 1.0) continue;

        // Natural wild-grass arch in both directions (sweeping left & right clusters)
        float sideBias = (rootU < 0.5) ? 0.22 : -0.22;
        float dirSign = (seed3 + sideBias > 0.5) ? 1.0 : -1.0;
        float archStrength = (11.0 + seed2 * 22.0) * (0.68 + 0.42 * rootBowl);
        float baseArch = dirSign * archStrength;

        // Continuous organic wind ripple + tab-switch gust sweep
        float gustWave = uWindGust * sin(rootU * 7.5 - t * 5.8) * 1.5;
        float windSway = sin(t * (1.35 + seed * 0.6) + cellId * 0.33 + lf * 1.9) * (3.2 + seed * 2.5)
                       + gustWave * 11.0;

        // Smooth cursor repulsion physics (parts arched blades cleanly away from mouse)
        float cursorBend = 0.0;
        if (uMouseActive > 0.01 && uReducedMotion < 0.5) {
          float mousePxX = uMouse.x * uResolution.x + par.x * uResolution.x * layerParallax;
          float mouseY = uMouse.y;
          float dx = cellCenter - mousePxX;
          float dy = max(0.0, mouseY - 0.24);
          float proxY = exp(-(dy * dy) / (2.0 * 0.18 * 0.18));
          float proxX = exp(-(dx * dx) / (2.0 * 44.0 * 44.0));
          float pushDir = dx >= 0.0 ? 1.0 : -1.0;
          cursorBend = pushDir * proxX * proxY * (1.0 - exp(-abs(dx) * 0.12)) * 28.0 * uMouseActive;
        }

        float totalLean = baseArch + windSway + cursorBend;
        float bladeX = cellCenter + totalLean * pow(tY, 1.78);

        float baseW = (layer == 0) ? 1.45 : (layer == 1) ? 1.90 : 2.55;
        float halfW = mix(baseW, 0.38, pow(tY, 0.72));

        float dxBlade = gxPx - bladeX;
        if (abs(dxBlade) <= halfW) {
          hitBlade = true;
          bestTY = tY;
          bestSeed = seed;
          float litSide = (totalLean >= 0.0) ? -1.0 : 1.0;
          hitRim = (dxBlade * litSide > halfW - 1.1) && (tY > 0.30);
          hitSeedHead = (layer == 0 && tY > 0.80 && seed2 > 0.56);
        }
      }

      if (hitBlade) {
        vec3 gCol = (layer == 0) ? uGrassBack : (layer == 1) ? uGrassMid : uGrassFront;

        if (layer == 0) {
          // Back sunlit/moonlit wheat-gold reeds catching twilight along upper half
          float tipGlow = smoothstep(0.28, 0.95, bestTY);
          gCol = mix(uGrassMid, uGrassBack, 0.45 + 0.55 * tipGlow);
          if (hitRim || hitSeedHead || (tipGlow * (0.55 + 0.45 * bestSeed) > thresh)) {
            gCol = mix(gCol, uGrassTip, hitSeedHead ? 0.92 : 0.78);
          }
        } else if (layer == 1) {
          // Mid olive-umber tufts with selective warm rim highlights on arched backs
          if (hitRim && bestTY > 0.42) {
            gCol = mix(gCol, uGrassBack, 0.82);
          } else if (bestTY > 0.72 && (bestTY - 0.55) > thresh) {
            gCol = mix(gCol, uGrassTip, 0.42);
          }
        } else {
          // Front crisp obsidian silhouettes with delicate 1px golden edge glints on upper curves
          if (hitRim && bestTY > 0.50 && bestSeed > 0.38) {
            gCol = mix(gCol, uGrassBack, 0.76);
          } else if (bestTY > 0.84 && bestSeed > 0.65) {
            gCol = mix(gCol, uGrassTip, 0.45);
          }
        }
        col = gCol;
      }
    }
  }

  fragColor = vec4(col, 1.0);
}
`;

export interface LandscapeController {
  setTheme: (isLight: boolean, instant?: boolean) => void;
  setPalette: (id: PaletteId, instant?: boolean) => void;
  triggerWindGust: () => void;
  triggerMicroRipple: () => void;
  handleBackgroundClick: (clientX: number, clientY: number) => 'toggle-theme' | 'sea-splash' | 'none';
  isOverCelestial: (clientX: number, clientY: number) => boolean;
  destroy: () => void;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpRGB = (a: RGB, b: RGB, t: number): RGB => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t)
];

const mixWorldPalette = (a: WorldPalette, b: WorldPalette, t: number): WorldPalette => ({
  skyTop: lerpRGB(a.skyTop, b.skyTop, t),
  skyMid: lerpRGB(a.skyMid, b.skyMid, t),
  skyLow: lerpRGB(a.skyLow, b.skyLow, t),
  cloudHi: lerpRGB(a.cloudHi, b.cloudHi, t),
  cloudLit: lerpRGB(a.cloudLit, b.cloudLit, t),
  cloudShad: lerpRGB(a.cloudShad, b.cloudShad, t),
  moon: lerpRGB(a.moon, b.moon, t),
  sun: lerpRGB(a.sun, b.sun, t),
  seaTop: lerpRGB(a.seaTop, b.seaTop, t),
  seaMid: lerpRGB(a.seaMid, b.seaMid, t),
  seaDeep: lerpRGB(a.seaDeep, b.seaDeep, t),
  seaGlint: lerpRGB(a.seaGlint, b.seaGlint, t),
  grassBack: lerpRGB(a.grassBack, b.grassBack, t),
  grassMid: lerpRGB(a.grassMid, b.grassMid, t),
  grassFront: lerpRGB(a.grassFront, b.grassFront, t),
  grassTip: lerpRGB(a.grassTip, b.grassTip, t),
  wildlife: lerpRGB(a.wildlife, b.wildlife, t)
});

function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('PixelLandscape shader compile error:', gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export function initPixelLandscape(
  canvas: HTMLCanvasElement,
  initialPalette: PaletteId,
  initialLight: boolean
): LandscapeController | null {
  const gl = canvas.getContext('webgl2', {
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    powerPreference: 'default',
    preserveDrawingBuffer: false
  });

  if (!gl) return null;

  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
  if (!vs || !fs) return null;

  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('PixelLandscape link error:', gl.getProgramInfoLog(prog));
    return null;
  }
  gl.useProgram(prog);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const U = (name: string) => gl.getUniformLocation(prog, name);
  const loc = {
    uTime: U('uTime'),
    uResolution: U('uResolution'),
    uMouse: U('uMouse'),
    uMouseActive: U('uMouseActive'),
    uDayProgress: U('uDayProgress'),
    uWindGust: U('uWindGust'),
    uMicroRipple: U('uMicroRipple'),
    uReducedMotion: U('uReducedMotion'),
    uSkyTop: U('uSkyTop'),
    uSkyMid: U('uSkyMid'),
    uSkyLow: U('uSkyLow'),
    uCloudHi: U('uCloudHi'),
    uCloudLit: U('uCloudLit'),
    uCloudShad: U('uCloudShad'),
    uMoonCol: U('uMoonCol'),
    uSunCol: U('uSunCol'),
    uSeaTop: U('uSeaTop'),
    uSeaMid: U('uSeaMid'),
    uSeaDeep: U('uSeaDeep'),
    uSeaGlint: U('uSeaGlint'),
    uGrassBack: U('uGrassBack'),
    uGrassMid: U('uGrassMid'),
    uGrassFront: U('uGrassFront'),
    uGrassTip: U('uGrassTip'),
    uWildlifeCol: U('uWildlifeCol'),
    uMoonPos: U('uMoonPos'),
    uSunPos: U('uSunPos'),
    uSplashes: U('uSplashes[0]'),
    uBirds: U('uBirds[0]'),
    uFish: U('uFish'),
    uDrops: U('uDrops[0]')
  };

  let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onMqChange = (e: MediaQueryListEvent) => {
    reducedMotion = e.matches;
    if (reducedMotion) renderSingleFrame(performance.now());
  };
  mq.addEventListener?.('change', onMqChange);

  // Fine painterly pixel-art virtual resolution (~640x400 at 1440x900)
  let vw = 640;
  let vh = 400;
  const resize = () => {
    const cw = Math.max(1, window.innerWidth);
    const ch = Math.max(1, window.innerHeight);
    vw = Math.max(360, Math.min(680, Math.round(cw / 2.25)));
    vh = Math.max(200, Math.round(vw * (ch / cw)));
    canvas.width = vw;
    canvas.height = vh;
    gl.viewport(0, 0, vw, vh);
  };
  resize();

  // Day/Night orbital transition (900ms cubic ease-in-out)
  let dayProgress = initialLight ? 1 : 0;
  let dayFrom = dayProgress;
  let dayTarget = dayProgress;
  let dayStart = 0;
  const DAY_DURATION = 900;

  // Palette smooth lerp (400ms)
  let currentPaletteId: PaletteId = PALETTES[initialPalette] ? initialPalette : 'nile-silt';
  let palFromNight: WorldPalette = PALETTES[currentPaletteId].night;
  let palFromDay: WorldPalette = PALETTES[currentPaletteId].day;
  let palToNight: WorldPalette = PALETTES[currentPaletteId].night;
  let palToDay: WorldPalette = PALETTES[currentPaletteId].day;
  let palStart = 0;
  let palLerp = 1;
  const PAL_DURATION = 400;

  // Interactive pointer + gust + ripples
  const mouse = { tx: 0.5, ty: 0.5, x: 0.5, y: 0.5, active: 0, targetActive: 0 };
  let windGust = 0;
  let microRipple = 0;

  // Splashes (up to 3)
  interface Splash { x: number; y: number; born: number; strength: number; }
  const splashes: Splash[] = [];
  const pushSplash = (x: number, y: number, strength = 1.0) => {
    splashes.push({ x, y, born: performance.now(), strength });
    if (splashes.length > 3) splashes.shift();
  };

  // Birds (4 gliding sky silhouettes cruising in the open upper sky)
  interface Bird {
    x: number;
    y: number;
    vx: number;
    vy: number;
    baseVx: number;
    homeY: number;
    flap: number;
    flapSpeed: number;
    size: number;
  }
  const birds: Bird[] = [
    { x: 0.34, y: 0.80, vx: 0.014, vy: 0, baseVx: 0.014, homeY: 0.80, flap: 0.0, flapSpeed: 4.2, size: 1.4 },
    { x: 0.39, y: 0.77, vx: 0.013, vy: 0, baseVx: 0.013, homeY: 0.77, flap: 1.5, flapSpeed: 4.5, size: 1.0 },
    { x: 0.58, y: 0.84, vx: -0.012, vy: 0, baseVx: -0.012, homeY: 0.84, flap: 2.4, flapSpeed: 4.0, size: 1.4 },
    { x: 0.63, y: 0.81, vx: -0.011, vy: 0, baseVx: -0.011, homeY: 0.81, flap: 0.8, flapSpeed: 4.3, size: 1.0 }
  ];

  // Jumping fish + 6 gravity droplets
  interface FishState {
    active: boolean;
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;
    waterY: number;
    nextJumpAt: number;
  }
  const fish: FishState = {
    active: false,
    x: 0.5,
    y: 0.28,
    vx: 0,
    vy: 0,
    angle: 0,
    waterY: 0.28,
    nextJumpAt: performance.now() + 3400
  };

  interface Droplet { x: number; y: number; vx: number; vy: number; alpha: number; }
  const drops: Droplet[] = Array.from({ length: 6 }, () => ({ x: -1, y: -1, vx: 0, vy: 0, alpha: 0 }));

  const spawnDroplets = (x: number, y: number) => {
    for (let i = 0; i < drops.length; i++) {
      const spread = (i / (drops.length - 1) - 0.5) * 0.08 + (Math.random() - 0.5) * 0.02;
      drops[i].x = x;
      drops[i].y = y + 0.005;
      drops[i].vx = spread;
      drops[i].vy = 0.08 + Math.random() * 0.065;
      drops[i].alpha = 1.0;
    }
  };

  const launchFish = (xUv?: number, yUv?: number) => {
    const sx = xUv !== undefined ? Math.max(0.16, Math.min(0.84, xUv)) : 0.28 + Math.random() * 0.44;
    const wy = yUv !== undefined ? Math.max(0.21, Math.min(0.35, yUv)) : 0.24 + Math.random() * 0.09;
    const dir = sx > 0.5 ? -1 : 1;
    fish.active = true;
    fish.x = sx;
    fish.y = wy;
    fish.waterY = wy;
    fish.vx = dir * (0.06 + Math.random() * 0.03);
    fish.vy = 0.22 + Math.random() * 0.045;
    fish.angle = Math.atan2(fish.vy, fish.vx);
    pushSplash(sx, wy, 0.95);
    spawnDroplets(sx, wy);
  };

  // Celestial parabolic arc coordinates in open starry sky pockets (clear of corner cumulus banks)
  const getCelestialCoords = (dp: number): { moon: [number, number]; sun: [number, number] } => {
    // Moon: at dp=0 sits gracefully in open upper-left-center sky (0.37, 0.87)
    const mt = dp;
    const moonX = 0.37 - mt * 0.14;
    const moonY = 0.87 - mt * mt * 0.56 - mt * 0.05;

    // Sun: at dp=1 sits gracefully in open upper-right-center sky (0.63, 0.86)
    const st = 1 - dp;
    const sunX = 0.63 + st * 0.14;
    const sunY = 0.86 - st * st * 0.56 - st * 0.05;

    return { moon: [moonX, moonY], sun: [sunX, sunY] };
  };

  const onPointerMove = (e: PointerEvent) => {
    mouse.tx = e.clientX / Math.max(1, window.innerWidth);
    mouse.ty = 1.0 - e.clientY / Math.max(1, window.innerHeight);
    mouse.targetActive = 1;
  };
  const onPointerLeave = () => {
    mouse.targetActive = 0;
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('resize', resize);

  const splashBuf = new Float32Array(3 * 4);
  const birdBuf = new Float32Array(5 * 4);
  const dropBuf = new Float32Array(6 * 4);

  let startTime = performance.now();
  let lastTime = startTime;
  let rafId = 0;

  const renderSingleFrame = (now: number) => {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) * 0.001));
    lastTime = now;
    const elapsed = (now - startTime) * 0.001;

    // 1. Day/Night cubic ease-in-out arc (900ms)
    if (dayProgress !== dayTarget) {
      const p = Math.min(1, (now - dayStart) / DAY_DURATION);
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      dayProgress = lerp(dayFrom, dayTarget, eased);
      if (p >= 1) dayProgress = dayTarget;
    }

    // 2. Palette smooth lerp (400ms)
    if (palLerp < 1) {
      const p = Math.min(1, (now - palStart) / PAL_DURATION);
      palLerp = 1 - Math.pow(1 - p, 3);
      if (p >= 1) palLerp = 1;
    }

    const nightPal = mixWorldPalette(palFromNight, palToNight, palLerp);
    const dayPal = mixWorldPalette(palFromDay, palToDay, palLerp);
    const activePal = mixWorldPalette(nightPal, dayPal, dayProgress);

    // 3. Pointer inertia + wind & micro-ripple decay
    mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 8.5);
    mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 8.5);
    mouse.active += (mouse.targetActive - mouse.active) * Math.min(1, dt * 6.0);
    windGust = Math.max(0, windGust * Math.pow(0.18, dt));
    microRipple = Math.max(0, microRipple * Math.pow(0.08, dt));

    // 4. Update Birds & Interactive Scatter
    if (!reducedMotion) {
      for (let i = 0; i < birds.length; i++) {
        const b = birds[i];
        if (mouse.active > 0.1) {
          const dx = b.x - mouse.x;
          const dy = b.y - mouse.y;
          if (dx * dx + dy * dy < 0.085 * 0.085) {
            b.vx = b.baseVx * 2.1;
            b.vy = Math.min(0.045, b.vy + 0.09 * dt);
            b.flapSpeed = 12.5;
          }
        }
        b.vx += (b.baseVx - b.vx) * Math.min(1, dt * 2.2);
        b.vy += ((b.homeY - b.y) * 0.45 - b.vy) * Math.min(1, dt * 2.5);
        b.flapSpeed += (4.3 - b.flapSpeed) * Math.min(1, dt * 3.0);
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.flap += b.flapSpeed * dt;
        if (b.baseVx > 0 && b.x > 1.06) b.x = -0.06;
        if (b.baseVx < 0 && b.x < -0.06) b.x = 1.06;
      }

      // 5. Update Jumping Fish & Droplets
      if (!fish.active && now >= fish.nextJumpAt) {
        launchFish();
      }
      if (fish.active) {
        fish.x += fish.vx * dt;
        fish.y += fish.vy * dt;
        fish.vy -= 0.56 * dt;
        fish.angle = Math.atan2(fish.vy, fish.vx);
        if (fish.vy < 0 && fish.y <= fish.waterY) {
          fish.active = false;
          pushSplash(fish.x, fish.waterY, 1.05);
          spawnDroplets(fish.x, fish.waterY);
          fish.nextJumpAt = now + 4500 + Math.random() * 4500;
        }
      }

      for (let i = 0; i < drops.length; i++) {
        const dr = drops[i];
        if (dr.alpha > 0.01) {
          dr.x += dr.vx * dt;
          dr.y += dr.vy * dt;
          dr.vy -= 0.42 * dt;
          dr.alpha = Math.max(0, dr.alpha - dt * 1.35);
        }
      }
    }

    while (splashes.length > 0 && (now - splashes[0].born) * 0.001 > 1.85) {
      splashes.shift();
    }

    splashBuf.fill(0);
    for (let i = 0; i < splashes.length; i++) {
      const sp = splashes[i];
      splashBuf[i * 4] = sp.x;
      splashBuf[i * 4 + 1] = sp.y;
      splashBuf[i * 4 + 2] = (now - sp.born) * 0.001;
      splashBuf[i * 4 + 3] = sp.strength;
    }

    birdBuf.fill(0);
    for (let i = 0; i < birds.length; i++) {
      const b = birds[i];
      birdBuf[i * 4] = b.x;
      birdBuf[i * 4 + 1] = b.y;
      birdBuf[i * 4 + 2] = b.flap;
      birdBuf[i * 4 + 3] = b.size;
    }

    dropBuf.fill(0);
    for (let i = 0; i < drops.length; i++) {
      const dr = drops[i];
      dropBuf[i * 4] = dr.x;
      dropBuf[i * 4 + 1] = dr.y;
      dropBuf[i * 4 + 2] = dr.alpha;
      dropBuf[i * 4 + 3] = 0;
    }

    const cel = getCelestialCoords(dayProgress);

    gl.uniform1f(loc.uTime, elapsed);
    gl.uniform2f(loc.uResolution, vw, vh);
    gl.uniform2f(loc.uMouse, mouse.x, mouse.y);
    gl.uniform1f(loc.uMouseActive, mouse.active);
    gl.uniform1f(loc.uDayProgress, dayProgress);
    gl.uniform1f(loc.uWindGust, windGust);
    gl.uniform1f(loc.uMicroRipple, microRipple);
    gl.uniform1f(loc.uReducedMotion, reducedMotion ? 1.0 : 0.0);

    gl.uniform3fv(loc.uSkyTop, activePal.skyTop);
    gl.uniform3fv(loc.uSkyMid, activePal.skyMid);
    gl.uniform3fv(loc.uSkyLow, activePal.skyLow);
    gl.uniform3fv(loc.uCloudHi, activePal.cloudHi);
    gl.uniform3fv(loc.uCloudLit, activePal.cloudLit);
    gl.uniform3fv(loc.uCloudShad, activePal.cloudShad);
    gl.uniform3fv(loc.uMoonCol, activePal.moon);
    gl.uniform3fv(loc.uSunCol, activePal.sun);
    gl.uniform3fv(loc.uSeaTop, activePal.seaTop);
    gl.uniform3fv(loc.uSeaMid, activePal.seaMid);
    gl.uniform3fv(loc.uSeaDeep, activePal.seaDeep);
    gl.uniform3fv(loc.uSeaGlint, activePal.seaGlint);
    gl.uniform3fv(loc.uGrassBack, activePal.grassBack);
    gl.uniform3fv(loc.uGrassMid, activePal.grassMid);
    gl.uniform3fv(loc.uGrassFront, activePal.grassFront);
    gl.uniform3fv(loc.uGrassTip, activePal.grassTip);
    gl.uniform3fv(loc.uWildlifeCol, activePal.wildlife);

    gl.uniform2f(loc.uMoonPos, cel.moon[0], cel.moon[1]);
    gl.uniform2f(loc.uSunPos, cel.sun[0], cel.sun[1]);
    gl.uniform4fv(loc.uSplashes, splashBuf);
    gl.uniform4fv(loc.uBirds, birdBuf);
    gl.uniform4f(loc.uFish, fish.x, fish.y, fish.angle, fish.active ? 1.0 : 0.0);
    gl.uniform4fv(loc.uDrops, dropBuf);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  let running = true;
  const loop = (now: number) => {
    if (!running || document.hidden) return;
    renderSingleFrame(now);
    if (!reducedMotion) {
      rafId = requestAnimationFrame(loop);
    }
  };

  const onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else if (running) {
      lastTime = performance.now();
      if (reducedMotion) renderSingleFrame(lastTime);
      else rafId = requestAnimationFrame(loop);
    }
  };
  document.addEventListener('visibilitychange', onVisibility);

  if (reducedMotion) {
    renderSingleFrame(performance.now());
  } else {
    rafId = requestAnimationFrame(loop);
  }

  const isOverCelestial = (clientX: number, clientY: number): boolean => {
    const ux = clientX / Math.max(1, window.innerWidth);
    const uy = 1.0 - clientY / Math.max(1, window.innerHeight);
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    const cel = getCelestialCoords(dayProgress);
    const target = dayProgress < 0.5 ? cel.moon : cel.sun;
    const dx = (ux - target[0]) * aspect;
    const dy = uy - target[1];
    return dx * dx + dy * dy <= 0.075 * 0.075;
  };

  return {
    setTheme(isLight: boolean, instant = false) {
      const next = isLight ? 1 : 0;
      if (instant || reducedMotion) {
        dayProgress = next;
        dayFrom = next;
        dayTarget = next;
        renderSingleFrame(performance.now());
      } else {
        dayFrom = dayProgress;
        dayTarget = next;
        dayStart = performance.now();
      }
    },
    setPalette(id: PaletteId, instant = false) {
      if (!PALETTES[id]) return;
      const now = performance.now();
      const curNight = mixWorldPalette(palFromNight, palToNight, palLerp);
      const curDay = mixWorldPalette(palFromDay, palToDay, palLerp);
      currentPaletteId = id;
      palFromNight = curNight;
      palFromDay = curDay;
      palToNight = PALETTES[id].night;
      palToDay = PALETTES[id].day;
      if (instant || reducedMotion) {
        palLerp = 1;
        renderSingleFrame(now);
      } else {
        palStart = now;
        palLerp = 0;
      }
    },
    triggerWindGust() {
      if (reducedMotion) return;
      windGust = Math.min(1.6, windGust + 1.05);
    },
    triggerMicroRipple() {
      if (reducedMotion) return;
      microRipple = Math.min(1.4, microRipple + 0.9);
    },
    handleBackgroundClick(clientX: number, clientY: number) {
      if (isOverCelestial(clientX, clientY)) {
        return 'toggle-theme';
      }
      const ux = clientX / Math.max(1, window.innerWidth);
      const uy = 1.0 - clientY / Math.max(1, window.innerHeight);
      // Open sea region (between foreground grass and horizon at 0.365)
      if (uy >= 0.14 && uy <= 0.37) {
        pushSplash(ux, Math.min(0.35, Math.max(0.18, uy)), 1.15);
        if (!reducedMotion) launchFish(ux, Math.min(0.34, Math.max(0.21, uy)));
        return 'sea-splash';
      }
      return 'none';
    },
    isOverCelestial,
    destroy() {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      mq.removeEventListener?.('change', onMqChange);
    }
  };
}
