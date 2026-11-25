/**
 * Full-viewport WebGL2 Painterly Pixel-Art + 4x4 Ordered Bayer Dither Landscape Engine
 *
 * Composition & depth-ordered parallax layers:
 *   1. Deep twilight sky with fine Bayer dither gradient, 1px & '+' cross stars,
 *      and volumetric 2-tap self-shadowed cumulus banks + traveling cumulus clouds (0.12x–0.18x)
 *   2. Refined Moon (night) & Sun (day) with 900ms parabolic orbital arc (0.22x)
 *   3. Physically inspired calm horizon sea with true sky & cloud mirror reflections,
 *      Schlick Fresnel, dispersive 4-octave wave normals, interactive click ripples,
 *      slope-aligned specular shimmer glints, and 8 gravity splash droplets (0.40x)
 *   4. U-shaped foreground coastal meadow of 3 overlapping tiers of gracefully arching
 *      curved grass fronds with root ambient occlusion, backlit subsurface translucency,
 *      coherent 2D traveling wind waves, per-tier springs & cursor repulsion (0.65x–1.0x)
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
      grassTip: hex('#c4985a')
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
      grassTip: hex('#e0b363')
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
      grassTip: hex('#cbb894')
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
      grassTip: hex('#cfb882')
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
      grassTip: hex('#e08a6c')
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
      grassTip: hex('#e08666')
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
      grassTip: hex('#96c2a8')
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
      grassTip: hex('#96c2a8')
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
uniform float uIntroProgress;
uniform vec3 uIntroDrop;
uniform float uCloudOffset;
uniform vec4 uWavePhases;
uniform float uGrassBend[3];

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

// Celestial coordinates (GL UV space, matched 1:1 with CPU hitboxes)
uniform vec2 uMoonPos;
uniform vec2 uSunPos;

// Up to 3 water splashes: (x_uv, y_uv, age_sec, strength)
uniform vec4 uSplashes[3];

// 8 splash droplets: (x_uv, y_uv, alpha, 0)
uniform vec4 uDrops[8];

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
vec3 evalCumulus(vec2 p) {
  // Subtle bounded sway keeps the iconic corner framing intact while internal
  // cloud wisps and ridges advect smoothly with uCloudOffset.
  float gentleSway = sin(uCloudOffset * 2.1) * 0.012;
  vec2 pl = p - vec2(gentleSway, 0.0);
  vec2 pr = p - vec2(gentleSway * 0.85, 0.0);

  float nFine = fbm(vec2(p.x * 14.5 - uCloudOffset * 2.15, p.y * 16.5)) - 0.5;
  float nMed  = fbm(vec2(p.x * 6.5 - uCloudOffset * 0.96, p.y * 8.2)) - 0.5;
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

  float isLeft = step(p.x, 0.5);
  float baseY = mix(0.70, 0.73, isLeft);
  float hNorm = clamp((p.y - baseY) / 0.21, 0.0, 1.0);
  float ridgeNoise = fbm(vec2(p.x * 18.0 - uCloudOffset * 2.55, p.y * 22.0 + 3.1));
  float wispRidge = smoothstep(0.46, 0.78, ridgeNoise);
  float lit = clamp(hNorm * 0.32 + wispRidge * 0.62 + (1.0 - smoothstep(0.04, 0.42, density)) * 0.10 - (1.0 - hNorm) * 0.22, 0.0, 1.0);

  return vec3(density, hNorm, lit);
}

// Delicate traveling cumulus formations advected smoothly across the mid-sky
vec2 evalTravelingClouds(vec2 p) {
  float bestDensity = -1.0;
  float bestLight = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float x = fract(0.14 + fi * 0.37 + uCloudOffset * (0.92 + fi * 0.12)) * 1.38 - 0.19;
    float y = 0.57 + fi * 0.073;
    if (abs(p.x - x) > 0.14 || abs(p.y - y) > 0.075) continue;
    float density = -1.0;
    density = max(density, puff(p, vec2(x - 0.035, y - 0.003), vec2(0.052, 0.014)));
    density = max(density, puff(p, vec2(x, y + 0.010), vec2(0.044, 0.025)));
    density = max(density, puff(p, vec2(x + 0.035, y), vec2(0.048, 0.018)));
    density = max(density, puff(p, vec2(x + 0.010, y - 0.008), vec2(0.074, 0.012)));
    density += (fbm(vec2((p.x - x) * 19.0, (p.y - y) * 27.0 + fi * 3.7)) - 0.5) * 0.16;
    if (density > bestDensity) {
      bestDensity = density;
      bestLight = clamp(0.48 + (p.y - y) * 13.0 + fi * 0.06, 0.0, 1.0);
    }
  }
  return vec2(bestDensity, bestLight);
}

// Bayer-stepped twilight sky gradient (shared by Sky and Water Reflection)
vec3 evalSkyGradient(vec2 uv, float horizonY, float thresh) {
  float skyH = clamp((uv.y - horizonY) / max(0.01, 1.0 - horizonY), 0.0, 1.0);
  float centerGlow = exp(-pow((uv.x - 0.5) * 1.45, 2.0)) * 0.14;
  float lowCurve = pow(max(0.0, 1.0 - skyH), 1.65) + centerGlow * (1.0 - skyH);

  vec3 col;
  if (skyH < 0.44) {
    float m = clamp(skyH / 0.44, 0.0, 1.0);
    col = ditherMix(uSkyLow, uSkyMid, m, thresh, 7.0);
  } else {
    float m = clamp((skyH - 0.44) / 0.56, 0.0, 1.0);
    col = ditherMix(uSkyMid, uSkyTop, m, thresh, 6.0);
  }

  if (lowCurve * 0.32 > thresh && skyH < 0.35) {
    col = mix(col, uSkyLow, 0.22);
  }

  float horizonHaze = exp(-skyH * 13.0) * (0.055 + centerGlow * 0.12);
  return mix(col, mix(uSkyLow, uCloudLit, 0.24), horizonHaze);
}

// Celestial Moon (night) & Sun (day) shared by Sky and Water Reflection
vec3 applyCelestials(
  vec3 col,
  vec2 uv,
  vec2 celOff,
  float horizonY,
  float aspect,
  float t,
  float thresh,
  bool isReflection
) {
  vec2 mPos = uMoonPos - celOff;
  if (mPos.y > horizonY - 0.06) {
    vec2 md = (uv - mPos) * vec2(aspect, 1.0);
    float mDist = length(md);
    float mRad = 0.027;
    float mVis = smoothstep(horizonY - 0.04, horizonY + 0.04, mPos.y)
               * (1.0 - smoothstep(0.52, 0.92, uDayProgress));
    float halo = (exp(-mDist * 19.0) * 0.19 + exp(-mDist * 6.5) * 0.022) * mVis;
    col = mix(col, uMoonCol, halo * (0.82 + thresh * 0.18));
    if (mDist < mRad && mVis > 0.05) {
      vec2 cut = md - vec2(0.011, 0.007);
      float discAlpha = isReflection ? 0.58 : 0.96;
      if (length(cut) > mRad * 0.84) {
        col = mix(col, uMoonCol, clamp(mVis * discAlpha, 0.0, 1.0));
      } else if (0.16 * mVis > thresh) {
        col = mix(col, uMoonCol, isReflection ? 0.09 : 0.14);
      }
    }
  }

  vec2 sPos = uSunPos - celOff;
  if (sPos.y > horizonY - 0.06) {
    vec2 sd = (uv - sPos) * vec2(aspect, 1.0);
    float sDist = length(sd);
    float sRad = 0.036;
    float sVis = smoothstep(horizonY - 0.04, horizonY + 0.04, sPos.y)
               * smoothstep(0.08, 0.48, uDayProgress);
    float ang = (abs(sd.x) + abs(sd.y) > 0.0001) ? atan(sd.y, sd.x) : 0.0;
    float rays = 0.5 + 0.5 * sin(ang * 8.0 + t * 0.3);
    float sunHalo = (exp(-sDist * 15.0) * (0.25 + 0.035 * rays) + exp(-sDist * 5.5) * 0.03) * sVis;
    col = mix(col, uSunCol, sunHalo * (0.80 + thresh * 0.20));
    if (sDist < sRad && sVis > 0.05) {
      vec3 core = mix(uSunCol, vec3(1.0, 0.98, 0.92), smoothstep(sRad, 0.0, sDist) * 0.55);
      col = mix(col, core, clamp(sVis * (isReflection ? 0.65 : 1.0), 0.0, 1.0));
    }
  }
  return col;
}

// Volumetric 2-tap Beer-Lambert self-shadowed cumulus + traveling clouds
vec3 applyCloudLayers(
  vec3 col,
  vec2 uv,
  vec2 par,
  vec2 activeCelPos,
  float thresh,
  float opacityScale
) {
  // 1. Framing cumulus cloud banks (upper-left & upper-right)
  vec2 cloudUv = uv + par * 0.12;
  vec3 cl = evalCumulus(cloudUv);
  float cDens = cl.x;
  if (cDens > 0.02) {
    float edgeSoft = smoothstep(0.02, 0.22, cDens);
    if (edgeSoft > thresh * 0.82) {
      vec2 toLight = activeCelPos - cloudUv;
      vec2 lightDir = toLight / max(0.001, length(toLight));

      // Directional 2-tap optical thickness toward active Moon/Sun
      float tap1 = max(0.0, evalCumulus(cloudUv + lightDir * 0.018).x);
      float tap2 = max(0.0, evalCumulus(cloudUv + lightDir * 0.044).x);
      float opticalDepth = tap1 * 0.65 + tap2 * 0.95;
      float beer = exp(-opticalDepth * 2.4);

      float edgeBand = 1.0 - smoothstep(0.02, 0.24, cDens);
      float rimSilver = edgeBand * smoothstep(0.30, 0.84, beer);
      float lit = clamp(beer * 0.54 + cl.z * 0.44 + rimSilver * 0.22 - (1.0 - cl.y) * 0.14, 0.0, 1.0);

      vec3 cCol;
      if (lit < 0.56) {
        cCol = ditherMix(uCloudShad, uCloudLit, lit / 0.56, thresh, 4.0);
      } else {
        cCol = ditherMix(uCloudLit, uCloudHi, (lit - 0.56) / 0.44, thresh, 3.0);
      }
      if (rimSilver > 0.34 && edgeSoft > 0.26) {
        cCol = mix(cCol, uCloudHi, clamp(rimSilver * 0.68, 0.0, 0.76));
      }
      col = mix(col, cCol, 0.96 * opacityScale);
    }
  }

  // 2. Traveling mid-sky cumulus formations
  vec2 travelUv = uv + par * 0.18;
  vec2 driftingCloud = evalTravelingClouds(travelUv);
  if (driftingCloud.x > -0.02) {
    float cloudEdge = smoothstep(-0.02, 0.20, driftingCloud.x);
    if (cloudEdge > thresh * 0.72) {
      vec2 tToLight = activeCelPos - travelUv;
      vec2 tLightDir = tToLight / max(0.001, length(tToLight));
      float tTap1 = max(0.0, evalTravelingClouds(travelUv + tLightDir * 0.014).x);
      float tTap2 = max(0.0, evalTravelingClouds(travelUv + tLightDir * 0.032).x);
      float tOpt = tTap1 * 0.65 + tTap2 * 0.95;
      float tBeer = exp(-tOpt * 2.4);
      float tRim = (1.0 - smoothstep(-0.02, 0.18, driftingCloud.x)) * smoothstep(0.32, 0.85, tBeer);
      float tLit = clamp(tBeer * 0.50 + driftingCloud.y * 0.48 + tRim * 0.20, 0.0, 1.0);

      vec3 driftingCol = tLit < 0.58
        ? ditherMix(uCloudShad, uCloudLit, tLit / 0.58, thresh, 4.0)
        : ditherMix(uCloudLit, uCloudHi, (tLit - 0.58) / 0.42, thresh, 3.0);
      driftingCol = mix(driftingCol, uCloudHi, tRim * 0.45);
      col = mix(col, driftingCol, cloudEdge * 0.62 * opacityScale);
    }
  }

  return col;
}

// Cinematic outer-world water-drop reveal intro (replaces slanted rain)
vec3 applyWorldEntrance(
  vec3 col,
  vec2 uv,
  float horizonY,
  float aspect,
  float thresh
) {
  float p = clamp(uIntroProgress, 0.0, 1.0);
  if (p >= 0.999 && uIntroDrop.z <= 0.001) return col;

  // Phase 0.00..0.24: Gentle horizon emergence from deep sea below and twilight sky above
  float baseEmerge = smoothstep(0.0, 0.24, p);
  vec3 dormantSky = mix(uSkyTop * 0.35, mix(uSkyMid, uSkyLow, exp(-max(0.0, uv.y - horizonY) * 5.0)), 0.35 + 0.45 * baseEmerge);
  vec3 dormantSea = mix(uSeaDeep * 0.42, mix(uSeaDeep, uSeaMid, 0.55), 0.30 + 0.50 * baseEmerge);
  float skyBlend = smoothstep(horizonY - 0.045, horizonY + 0.045, uv.y);
  vec3 dormant = mix(dormantSea, dormantSky, skyBlend);
  float horGlow = exp(-abs(uv.y - horizonY) * 14.0) * baseEmerge * 0.28;
  dormant = mix(dormant, uSkyLow, horGlow);

  if (p >= 0.24) {
    // Phase 0.24..1.00: Organic expanding liquid reveal wave from impact point (0.48, 0.27)
    float q = clamp((p - 0.24) / 0.76, 0.0, 1.0);
    float qEased = 1.0 - pow(max(0.0, 1.0 - q), 2.35);
    vec2 origin = vec2(0.48, 0.27);
    vec2 diff = (uv - origin) * vec2(aspect * 0.85, 1.0);
    float dist = length(diff);
    float maxDist = length(vec2(aspect * 0.85 * 0.62, 0.80)) + 0.14;
    float angle = (abs(diff.x) + abs(diff.y) > 0.0001) ? atan(diff.y, diff.x) : 0.0;
    float organic = sin(angle * 5.0 + q * 3.5) * 0.018
                  + sin(angle * 11.0 - q * 6.0) * 0.009
                  + (valueNoise(uv * 16.0) - 0.5) * 0.042
                  + (thresh - 0.5) * 0.024;
    float waveFront = 0.035 + qEased * maxDist;
    float edgeDist = dist + organic;
    float revealBand = 1.0 - smoothstep(waveFront - 0.045, waveFront + 0.025, edgeDist);
    float reveal = mix(revealBand > thresh * 0.85 ? 1.0 : 0.0, 1.0, smoothstep(0.88, 1.0, q));

    col = mix(dormant, col, reveal);

    // Crisp Bayer-dithered liquid ripple crest & trailing inner wave
    float crestBand = exp(-pow((edgeDist - waveFront) * 34.0, 2.0)) * (1.0 - smoothstep(0.68, 1.0, q));
    if (crestBand > thresh * 0.72) {
      col = mix(col, uSeaGlint, 0.56);
    }
  } else {
    col = dormant;
  }

  // Luminous falling pixel water drop with delicate tapering tail
  if (uIntroDrop.z > 0.01) {
    vec2 dPx = (uv - uIntroDrop.xy) * uResolution;
    float headDist = length(vec2(dPx.x / 2.2, dPx.y / 2.6));
    float headMask = 1.0 - smoothstep(0.65, 1.15, headDist);
    float tailMask = 0.0;
    if (dPx.y > 0.0 && dPx.y < 18.0) {
      float tTail = dPx.y / 18.0;
      float tailHalfW = mix(1.75, 0.22, pow(max(0.0, tTail), 0.72));
      if (abs(dPx.x) <= tailHalfW) {
        tailMask = (1.0 - tTail) * 0.85;
      }
    }
    float dropGlow = exp(-length(dPx) * 0.20) * 0.48;
    if (dropGlow > thresh * 0.18) {
      col = mix(col, mix(uSeaTop, uSeaGlint, 0.65), dropGlow * uIntroDrop.z);
    }
    float dropVis = max(headMask, tailMask) * uIntroDrop.z;
    if (dropVis > thresh * 0.22) {
      vec3 dropCol = mix(uSeaGlint, vec3(1.0, 0.98, 0.94), headMask * 0.68);
      col = mix(col, dropCol, clamp(dropVis, 0.0, 1.0));
    }
  }

  return col;
}

void main() {
  vec2 px = floor(gl_FragCoord.xy);
  vec2 uv = (px + 0.5) / uResolution;
  float aspect = uResolution.x / max(1.0, uResolution.y);
  float thresh = bayer4(px);
  float t = uReducedMotion > 0.5 ? 0.0 : uTime;

  // Subtle smoothed mouse parallax
  vec2 par = (uReducedMotion > 0.5) ? vec2(0.0) : (uMouse - 0.5) * vec2(0.018, 0.011);

  // Horizon sits at ~36.5% from bottom
  float horizonY = 0.365 + par.y * 0.22;
  vec2 celOff = par * 0.22;
  vec2 activeCelPos = mix(uMoonPos, uSunPos, uDayProgress) - celOff;

  vec3 col = uSkyTop;

  // =========================================================================
  // LAYER 1 & 2 — BAYER TWILIGHT SKY, STARS, MOON/SUN & VOLUMETRIC CLOUDS
  // =========================================================================
  if (uv.y >= horizonY) {
    float skyH = clamp((uv.y - horizonY) / max(0.01, 1.0 - horizonY), 0.0, 1.0);
    col = evalSkyGradient(uv, horizonY, thresh);

    float skyGrain = (hash12(px + vec2(17.0, 41.0)) - 0.5) * 0.012;
    col += skyGrain * mix(vec3(0.35), uCloudLit, 0.28);

    // Sparse crisp 1px stars + delicate 3x3 '+' cross sparkles in open night sky
    float nightVis = smoothstep(0.55, 0.05, uDayProgress);
    if (nightVis > 0.01 && skyH > 0.32) {
      vec2 starGrid = floor((uv + par * 0.08) * uResolution);
      float h = hash12(starGrid);
      float fadeY = smoothstep(0.32, 0.72, skyH);
      if (h > 0.9974) {
        float tw = 0.5 + 0.5 * sin(t * (1.5 + fract(h * 73.0) * 2.5) + h * 110.0);
        col = mix(col, uMoonCol, clamp(tw * nightVis * fadeY * 0.92, 0.18, 0.92));
      } else {
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

    col = applyCelestials(col, uv, celOff, horizonY, aspect, t, thresh, false);
    col = applyCloudLayers(col, uv, par, activeCelPos, thresh, 1.0);
  } else {
    // =======================================================================
    // LAYER 3 — REALISTIC PIXEL-ART WATER (SKY & CLOUD REFLECTION + FRESNEL)
    // =======================================================================
    float depth = clamp((horizonY - uv.y) / max(0.01, horizonY), 0.0, 1.0);
    vec2 seaUv = uv + par * 0.40;
    float rowY = px.y;

    // Base deep slate-indigo water body (Bayer-dithered smoothly)
    vec3 waterBody;
    if (depth < 0.42) {
      waterBody = ditherMix(uSeaTop, uSeaMid, depth / 0.42, thresh, 5.0);
    } else {
      waterBody = ditherMix(uSeaMid, uSeaDeep, (depth - 0.42) / 0.58, thresh, 5.0);
    }

    // Dispersive 4-octave perspective wave slopes driven by uWavePhases
    float perspY = 1.0 / (0.048 + depth);
    float nearMask = smoothstep(0.0, 0.11, depth);
    float chopBoost = 1.0 + uWindGust * 0.35 + uMicroRipple * 0.45;

    float ph0 = seaUv.x * 8.5 + perspY * 1.45 - uWavePhases.x;
    float ph1 = -seaUv.x * 16.0 + perspY * 2.95 - uWavePhases.y;
    float ph2 = seaUv.x * 28.0 + perspY * 5.60 - uWavePhases.z;
    float ph3 = -seaUv.x * 46.0 + perspY * 10.20 - uWavePhases.w;

    float c0 = cos(ph0);
    float c1 = cos(ph1);
    float c2 = cos(ph2);
    float c3 = cos(ph3);

    float dWaveX = (c0 * 0.24 - c1 * 0.28 + c2 * 0.24 * chopBoost - c3 * 0.16 * chopBoost) * (0.35 + 0.65 * nearMask);
    float dWaveY = (c0 * 0.34 + c1 * 0.36 + c2 * 0.28 * chopBoost + c3 * 0.18 * chopBoost) * (0.28 + 0.72 * nearMask);

    // Analytical radial height gradients from active splashes
    float splashRingVis = 0.0;
    for (int i = 0; i < 3; i++) {
      vec4 sp = uSplashes[i];
      if (sp.w <= 0.001 || sp.z > 1.85) continue;
      float age = sp.z;
      float rad = age * 0.125;
      vec2 scaled = (uv - sp.xy) * vec2(aspect * 0.48, 2.55);
      float dist = length(scaled);
      if (dist > 0.0005 && dist < rad + 0.065) {
        vec2 dir = scaled / dist;
        float decay = max(0.0, 1.0 - age / 1.85) * sp.w;
        float d1 = dist - rad;
        float d2 = dist - rad * 0.58;
        float g1 = -d1 * exp(-(d1 * d1) / 0.00018) * 120.0;
        float g2 = -d2 * exp(-(d2 * d2) / 0.00010) * 90.0 * 0.65;
        float radialSlope = (g1 + g2) * decay;
        dWaveX += dir.x * radialSlope * 0.42;
        dWaveY += dir.y * radialSlope * 0.72;

        float ring1 = smoothstep(0.015, 0.0, abs(d1)) * decay;
        float ring2 = smoothstep(0.010, 0.0, abs(d2)) * decay * 0.65;
        splashRingVis = max(splashRingVis, max(ring1, ring2));
      }
    }

    // Mirror-sample sky gradient, moon/sun glow column & volumetric clouds
    vec2 reflUv = vec2(
      seaUv.x + dWaveX * 0.032,
      horizonY + (horizonY - uv.y) * 1.12 + dWaveY * 0.025
    );
    reflUv.y = clamp(reflUv.y, horizonY + 0.001, 0.999);

    vec3 reflCol = evalSkyGradient(reflUv, horizonY, thresh);
    reflCol = applyCelestials(reflCol, reflUv, celOff, horizonY, aspect, t, thresh, true);
    reflCol = applyCloudLayers(reflCol, reflUv, par, activeCelPos, thresh, 0.92);

    // Schlick Fresnel reflection blend
    float fresnel = 0.06 + 0.84 * pow(max(0.0, 1.0 - clamp(depth * 1.35, 0.0, 1.0)), 3.6);
    fresnel = clamp(fresnel + dWaveY * 0.045 * (1.0 - depth * 0.45), 0.04, 0.94);
    col = mix(waterBody, reflCol, fresnel);

    // Subtle horizon atmospheric haze + crisp twilight horizon hairline
    float marineHaze = exp(-depth * 9.0) * 0.12;
    col = mix(col, mix(uSkyLow, uSeaTop, 0.36), marineHaze);

    float fromHor = (horizonY - uv.y) * uResolution.y;
    if (fromHor < 1.35) {
      col = mix(col, mix(uSeaTop, uSeaGlint, 0.35), 0.58);
    } else if (fromHor < 6.0) {
      float hReflect = (1.0 - fromHor / 6.0) * 0.18;
      if (hReflect > thresh * 0.85) {
        col = mix(col, uSkyLow, 0.36);
      }
    }

    // Slope-aligned horizontal specular moonlight/sunlight glints
    float activeRefX = mix(mix(0.45, activeCelPos.x, 0.42), activeCelPos.x, uDayProgress);
    float coneHalfW = 0.046 + depth * 0.095;
    float distFromCenter = abs((uv.x + dWaveX * 0.015) - activeRefX);
    float envelope = exp(-(distFromCenter * distFromCenter) / (2.0 * coneHalfW * coneHalfW));

    float slopeAlign = smoothstep(0.08, 0.74, dWaveY * 0.82 + 0.36 - abs(dWaveX) * 0.22);
    float rowHash = hash11(rowY * 1.37);
    float rowActive = step(0.56 - uMicroRipple * 0.16 - uWindGust * 0.12, rowHash);
    float dashFreq = mix(64.0, 28.0, depth);
    float dashShift = t * (0.48 + rowHash * 0.55 + uWindGust * 1.15) * (rowHash > 0.5 ? 1.0 : -1.0);
    float dashVal = valueNoise(vec2(seaUv.x * dashFreq + dashShift, rowY * 0.92));
    float shimmer = envelope * rowActive * slopeAlign * smoothstep(0.52 - envelope * 0.14, 0.78, dashVal);
    shimmer *= (1.0 - depth * 0.35) * (1.0 + uWindGust * 0.30 + uMicroRipple * 0.55);

    if (shimmer > 0.24) {
      float bright = smoothstep(0.24, 0.70, shimmer);
      vec3 gCol = mix(uSeaGlint, vec3(1.0, 0.96, 0.86), bright * 0.44);
      col = mix(col, gCol, clamp(0.44 + bright * 0.48, 0.0, 0.92));
    }

    // Scattered micro ambient glints on aligned wave crests near horizon
    float ambGlint = valueNoise(vec2(seaUv.x * 46.0 - t * 0.35, rowY * 0.9));
    if (ambGlint > 0.85 && slopeAlign > 0.52 && depth < 0.58 && rowHash > 0.60) {
      col = mix(col, uSeaGlint, 0.28 * (1.0 - depth));
    }

    // Pixel ripple crest glints from active splashes
    if (splashRingVis > thresh * 0.60) {
      col = mix(col, uSeaGlint, clamp(splashRingVis * 0.85, 0.30, 0.88));
    }
  }

  // =========================================================================
  // 8 GRAVITY WATER DROPLETS (Impact arcs from sea clicks & intro drop)
  // =========================================================================
  for (int i = 0; i < 8; i++) {
    vec4 dr = uDrops[i];
    if (dr.z <= 0.01) continue;
    vec2 dPos = dr.xy - par * 0.40;
    vec2 dPx = abs(floor((uv - dPos) * uResolution));
    if (dPx.x < 1.1 && dPx.y < 1.1 && dr.z > thresh * 0.45) {
      col = mix(col, uSeaGlint, 0.92);
    }
  }

  // =========================================================================
  // LAYER 4 — U-SHAPED FOREGROUND MEADOW OF WIND-DRIVEN ARCHING GRASS
  // =========================================================================
  if (uv.y < 0.37) {
    float edgeDist = abs(uv.x - 0.5) * 2.0;

    // Rich dark vegetated shoreline bank right along bottom edge
    float bankH = (0.048 + 0.068 * pow(max(0.0, edgeDist), 1.4))
                * (0.86 + 0.24 * sin(uv.x * 16.0) + 0.12 * sin(uv.x * 39.0));
    if (uv.y < bankH) {
      float soilGrain = fbm(vec2(uv.x * 92.0, uv.y * 58.0));
      float bankTone = clamp(uv.y / max(0.001, bankH) * 0.66 + soilGrain * 0.34, 0.0, 1.0);
      col = ditherMix(uGrassFront, uGrassMid, bankTone, thresh, 5.0);
      if (soilGrain > 0.79 && uv.y > bankH * 0.45 && thresh > 0.42) {
        col = mix(col, uGrassBack, 0.24);
      }
    }

    // 3 overlapping lush tiers: 0 = tall backlit reeds, 1 = dense mid meadow, 2 = bold foreground fronds
    for (int layer = 0; layer < 3; layer++) {
      float lf = float(layer);
      float layerParallax = 0.65 + lf * 0.175;
      float layerBend = (layer == 0) ? uGrassBend[0] : (layer == 1) ? uGrassBend[1] : uGrassBend[2];
      float gxPx = px.x + par.x * uResolution.x * layerParallax;

      float spacing = (layer == 0) ? 3.2 : (layer == 1) ? 3.8 : 4.6;
      float baseCell = floor(gxPx / spacing);

      bool hitBlade = false;
      bool hitRim = false;
      bool hitSeedHead = false;
      float bestTY = 0.0;
      float bestSeed = 0.0;
      float bestLightCatch = 0.5;

      for (int dc = -6; dc <= 6; dc++) {
        float cellId = baseCell + float(dc);
        float seed  = hash11(cellId * 1.17 + lf * 97.3);
        float seed2 = hash11(cellId * 2.71 + lf * 53.7);
        float seed3 = hash11(cellId * 4.13 + lf * 31.1);
        float cellCenter = (cellId + 0.12 + seed2 * 0.76) * spacing;

        float rootU = clamp((cellCenter - par.x * uResolution.x * layerParallax) / max(1.0, uResolution.x), 0.0, 1.0);
        float rootEdge = abs(rootU - 0.5) * 2.0;
        float rootBowl = 0.44 + 0.56 * pow(max(0.0, rootEdge), 1.42);
        float clump = 0.80 + 0.24 * sin(cellId * 0.27 + lf * 2.1) + 0.14 * sin(cellId * 0.71 - lf * 1.3);

        float maxFrac = (layer == 0) ? 0.265 : (layer == 1) ? 0.215 : 0.175;
        float bladeH = uResolution.y * (0.085 + seed * maxFrac) * rootBowl * clump;

        float tY = px.y / max(1.0, bladeH);
        if (tY < 0.0 || tY > 1.0) continue;

        float sideBias = (rootU < 0.5) ? 0.22 : -0.22;
        float dirSign = (seed3 + sideBias > 0.5) ? 1.0 : -1.0;
        float archStrength = (11.0 + seed2 * 22.0) * (0.68 + 0.42 * rootBowl);
        float baseArch = dirSign * archStrength;

        // Coherent 2D travelling wind field + per-tier spring uGrassBend + tab gust
        float gustFront = pow(max(0.0, 0.5 + 0.5 * sin(rootU * 5.2 - t * 0.95)), 3.0);
        float rollingWave = sin(rootU * 11.5 - t * 2.25 + lf * 0.45 + seed * 0.32) * (4.4 + seed * 3.2);
        float crossRipple = sin(rootU * 19.0 - t * 3.6 + cellId * 0.11) * 1.85;
        float tipFlutter = sin(t * (4.2 + seed * 1.8) + cellId * 0.83) * 1.2;
        float springSway = layerBend * (26.0 + lf * 6.0);
        float interactiveGust = uWindGust * (7.5 + 11.5 * sin(rootU * 8.2 - t * 5.9));
        float windSway = (2.2 + gustFront * 8.5 + rollingWave + crossRipple + springSway + interactiveGust)
                       * (0.76 + rootBowl * 0.30);

        // Smooth cursor repulsion physics
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
        float bladeCurve = baseArch * pow(max(0.0, tY), 1.72)
                         + windSway * pow(max(0.0, tY), 1.30)
                         + tipFlutter * (tY * tY)
                         + cursorBend * pow(max(0.0, tY), 1.42);
        bladeCurve += sin(tY * 3.4 + seed * 6.2831) * 1.25 * tY;
        float bladeX = cellCenter + bladeCurve;

        float baseW = (layer == 0) ? 1.45 : (layer == 1) ? 1.90 : 2.55;
        float halfW = mix(baseW, 0.38, pow(max(0.0, tY), 0.72));

        float dxBlade = gxPx - bladeX;
        if (abs(dxBlade) <= halfW) {
          hitBlade = true;
          bestTY = tY;
          bestSeed = seed;
          float toLight = (activeCelPos.x >= rootU) ? 1.0 : -1.0;
          float leanDir = (totalLean >= 0.0) ? -1.0 : 1.0;
          float litSide = mix(leanDir, toLight, 0.45) >= 0.0 ? 1.0 : -1.0;
          hitRim = (dxBlade * litSide > halfW - 1.15) && (tY > 0.28);
          hitSeedHead = (layer == 0 && tY > 0.80 && seed2 > 0.56);
          float towardLight = clamp((totalLean * toLight) / 26.0, -0.35, 1.0);
          float sunProx = exp(-pow((rootU - activeCelPos.x) * 1.85, 2.0));
          bestLightCatch = clamp(0.42 + towardLight * 0.42 + sunProx * 0.22, 0.18, 1.0);
        }
      }

      if (hitBlade) {
        vec3 gCol = (layer == 0) ? uGrassBack : (layer == 1) ? uGrassMid : uGrassFront;

        // Root ambient occlusion near tY = 0 keeps all 3 meadow tiers grounded
        float rootAO = smoothstep(0.0, 0.38, bestTY);
        gCol = mix(uGrassFront * 0.65, gCol, 0.32 + 0.68 * rootAO);

        // Warm backlit subsurface translucency & curved-tip highlights
        float tipCurveGlow = smoothstep(0.26, 0.97, bestTY) * bestLightCatch;

        if (layer == 0) {
          gCol = mix(uGrassMid, uGrassBack, 0.28 + 0.72 * tipCurveGlow);
          gCol = mix(uGrassFront * 0.70, gCol, 0.34 + rootAO * 0.66);
          if (hitRim || hitSeedHead || (tipCurveGlow * (0.48 + 0.52 * bestSeed) > thresh)) {
            gCol = mix(gCol, uGrassTip, hitSeedHead ? 0.92 : clamp(0.55 + bestLightCatch * 0.32, 0.0, 0.90));
          }
        } else if (layer == 1) {
          if (hitRim && bestTY > 0.32) {
            gCol = mix(gCol, mix(uGrassBack, uGrassTip, bestLightCatch * 0.42), 0.74);
          } else if (bestTY > 0.64 && (tipCurveGlow - 0.36) > thresh * 0.85) {
            gCol = mix(gCol, uGrassTip, 0.38 * bestLightCatch);
          }
        } else {
          gCol = mix(gCol, uGrassMid, bestTY * 0.20 * bestLightCatch);
          if (hitRim && bestTY > 0.42 && bestSeed > 0.30) {
            gCol = mix(gCol, mix(uGrassBack, uGrassTip, bestLightCatch * 0.32), 0.68);
          } else if (bestTY > 0.80 && bestSeed > 0.58) {
            gCol = mix(gCol, uGrassTip, 0.42 * bestLightCatch);
          }
        }
        col = gCol;
      }
    }
  }

  col = applyWorldEntrance(col, uv, horizonY, aspect, thresh);
  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
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
  grassTip: lerpRGB(a.grassTip, b.grassTip, t)
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
    uIntroProgress: U('uIntroProgress'),
    uIntroDrop: U('uIntroDrop'),
    uCloudOffset: U('uCloudOffset'),
    uWavePhases: U('uWavePhases'),
    uGrassBend: U('uGrassBend[0]'),
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
    uMoonPos: U('uMoonPos'),
    uSunPos: U('uSunPos'),
    uSplashes: U('uSplashes[0]'),
    uDrops: U('uDrops[0]')
  };

  let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onMqChange = (e: MediaQueryListEvent) => {
    reducedMotion = e.matches;
    if (reducedMotion) renderSingleFrame(performance.now());
  };
  mq.addEventListener?.('change', onMqChange);

  // Crisp painterly virtual pixel resolution
  let vw = 640;
  let vh = 360;
  const resize = () => {
    const cw = Math.max(1, window.innerWidth);
    const ch = Math.max(1, window.innerHeight);
    vw = Math.max(360, Math.min(720, Math.round(cw / 2.1)));
    vh = Math.max(210, Math.round(vw * (ch / cw)));
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

  // Interactive pointer + gust + ripples + atmospheric phases
  const mouse = { tx: 0.5, ty: 0.5, x: 0.5, y: 0.5, active: 0, targetActive: 0 };
  let windGust = 0;
  let microRipple = 0;
  let cloudOffset = 0;
  let simulationTime = 0;
  const wavePhases = new Float32Array(4);
  const waveLengths = [6.0, 2.7, 1.1, 0.43];
  const grassBendBuf = new Float32Array(3);
  const grassMotion = [0.55, 0.8, 1.1].map((frequency, i) => ({
    angle: 0.035,
    velocity: 0,
    omega: Math.PI * 2 * frequency,
    damping: 0.42 + i * 0.04
  }));
  grassMotion.forEach((blade, i) => { grassBendBuf[i] = blade.angle; });

  const scalarHash = (n: number) => {
    const x = Math.sin(n * 127.1 + 31.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const sampleGust = (x: number) => {
    const i = Math.floor(x);
    const f = x - i;
    const s = f * f * (3 - 2 * f);
    return lerp(scalarHash(i), scalarHash(i + 1), s);
  };

  // Splashes (up to 3)
  interface Splash { x: number; y: number; born: number; strength: number; }
  const splashes: Splash[] = [];
  const pushSplash = (x: number, y: number, strength = 1.0) => {
    splashes.push({ x, y, born: performance.now(), strength });
    if (splashes.length > 3) splashes.shift();
  };

  // 8 gravity droplets
  interface Droplet { x: number; y: number; vx: number; vy: number; alpha: number; }
  const drops: Droplet[] = Array.from({ length: 8 }, () => ({ x: -1, y: -1, vx: 0, vy: 0, alpha: 0 }));

  const spawnDroplets = (x: number, y: number) => {
    for (let i = 0; i < drops.length; i++) {
      const spread = (i / (drops.length - 1) - 0.5) * 0.11 + (Math.random() - 0.5) * 0.018;
      drops[i].x = x;
      drops[i].y = y + 0.005;
      drops[i].vx = spread;
      drops[i].vy = 0.085 + Math.random() * 0.07;
      drops[i].alpha = 1.0;
    }
  };

  const getCelestialCoords = (dp: number): { moon: [number, number]; sun: [number, number] } => {
    const mt = dp;
    const moonX = 0.37 - mt * 0.14;
    const moonY = 0.87 - mt * mt * 0.56 - mt * 0.05;

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
  const dropBuf = new Float32Array(8 * 4);

  const startTime = performance.now();
  let lastTime = startTime;
  let rafId = 0;
  const INTRO_DURATION = 1850;
  let introImpactTriggered = reducedMotion;

  const renderSingleFrame = (now: number) => {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) * 0.001));
    lastTime = now;
    if (!reducedMotion) simulationTime += dt;
    const elapsed = simulationTime;

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

    // 4. Intro drop + one-shot impact into open sea
    const introProgress = reducedMotion ? 1.0 : Math.min(1, (now - startTime) / INTRO_DURATION);
    const introDropX = 0.48;
    let introDropY = 0.27;
    let introDropVis = 0.0;

    if (!reducedMotion && introProgress < 0.24) {
      const tDrop = introProgress / 0.24;
      introDropY = 0.96 - (0.96 - 0.27) * (tDrop * tDrop);
      introDropVis = Math.min(1.0, tDrop * 4.5);
    } else if (!reducedMotion && !introImpactTriggered) {
      introImpactTriggered = true;
      pushSplash(0.48, 0.27, 1.45);
      spawnDroplets(0.48, 0.27);
      windGust = Math.max(windGust, 0.95);
    }

    // 5. Update atmospheric cloud drift, dispersive wave phases, grass springs & droplets
    if (!reducedMotion) {
      cloudOffset += dt * 0.0035 * (1 + windGust * 0.22);
      for (let i = 0; i < waveLengths.length; i++) {
        const k = (Math.PI * 2) / waveLengths[i];
        const omega = Math.sqrt(9.81 * k * Math.tanh(k * 3.2));
        wavePhases[i] += omega * dt;
      }
      for (let i = 0; i < grassMotion.length; i++) {
        const blade = grassMotion[i];
        const gust = sampleGust(elapsed * 0.48 - i * 0.41);
        const target = 0.025 + gust * gust * 0.19 + windGust * 0.045;
        const acceleration = blade.omega * blade.omega * (target - blade.angle)
          - 2 * blade.damping * blade.omega * blade.velocity;
        blade.velocity += acceleration * dt;
        blade.angle += blade.velocity * dt;
        grassBendBuf[i] = blade.angle;
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
    gl.uniform1f(loc.uIntroProgress, introProgress);
    gl.uniform3f(loc.uIntroDrop, introDropX, introDropY, introDropVis);
    gl.uniform1f(loc.uCloudOffset, cloudOffset);
    gl.uniform4fv(loc.uWavePhases, wavePhases);
    gl.uniform1fv(loc.uGrassBend, grassBendBuf);

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

    gl.uniform2f(loc.uMoonPos, cel.moon[0], cel.moon[1]);
    gl.uniform2f(loc.uSunPos, cel.sun[0], cel.sun[1]);
    gl.uniform4fv(loc.uSplashes, splashBuf);
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
        const wy = Math.min(0.35, Math.max(0.18, uy));
        pushSplash(ux, wy, 1.25);
        if (!reducedMotion) {
          spawnDroplets(ux, wy);
          microRipple = Math.min(1.4, microRipple + 0.5);
        }
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
