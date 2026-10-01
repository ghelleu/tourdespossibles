(() => {
  'use strict';
  const cv = document.getElementById('sky');
  const ctx = cv.getContext('2d', { alpha: false });
  if (!ctx) return;

  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)').matches;
  const DEBUG = /[?&]debug=1(&|$)/.test(location.search);

  const MAX = 420, TAU = Math.PI * 2;
  const LIT_R = 170, LINK = 110, LINK2 = LINK * LINK, PTR_LINK = 90, PTR_LINK2 = PTR_LINK * PTR_LINK;
  const X = new Float32Array(MAX), Y = new Float32Array(MAX), R = new Float32Array(MAX),
        A = new Float32Array(MAX), PH = new Float32Array(MAX), OM = new Float32Array(MAX);
  const D = new Uint8Array(MAX);
  const litI = new Int16Array(MAX), litF = new Float32Array(MAX);
  const COLORS = ['#DCE6FF', '#E8EEFF', '#FFFFFF'];

  let W = 0, H = 0, dpr = 1, n = 0, starScale = 1, segCap = 220;
  let raf = 0, last = 0, reduced = reduceMQ.matches;

  // pointeur
  let tx = 0, ty = 0, lx = 0, ly = 0, pe = 0, de = 0;
  let lastMove = -1e9, lastActivity = -1e9, left = false, touching = false, touchUp = -1;
  let havePos = false;

  // halo précalculé
  const halo = document.createElement('canvas');
  const HALO = 220;
  halo.width = halo.height = HALO * 2;
  {
    const h = halo.getContext('2d');
    const g = h.createRadialGradient(HALO, HALO, 0, HALO, HALO, HALO);
    g.addColorStop(0, 'rgba(255,246,232,1)');
    g.addColorStop(0.35, 'rgba(255,246,232,.35)');
    g.addColorStop(1, 'rgba(255,246,232,0)');
    h.fillStyle = g;
    h.fillRect(0, 0, HALO * 2, HALO * 2);
  }

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function seed() {
    let count = Math.round((W * H) / 9000);
    count = Math.max(120, Math.min(420, count));
    if (coarse || W < 768) count = Math.round(count * 0.6);
    count = Math.max(1, Math.round(count * starScale));
    const tmp = [];
    for (let i = 0; i < count; i++) {
      const u = Math.random(), d = u < 0.55 ? 0 : u < 0.85 ? 1 : 2;
      const r = d === 0 ? rnd(0.4, 0.75) : d === 1 ? rnd(0.7, 1.1) : rnd(1.1, 1.6);
      const a = d === 0 ? rnd(0.25, 0.5) : d === 1 ? rnd(0.4, 0.7) : rnd(0.6, 0.9);
      tmp.push([Math.random() * W, Math.random() * H, r, a, Math.random() * TAU, TAU / rnd(3, 8), d]);
    }
    tmp.sort((p, q) => p[0] - q[0]); // trié en x : sortie anticipée des boucles de liaison
    for (let i = 0; i < count; i++) {
      const s = tmp[i];
      X[i] = s[0]; Y[i] = s[1]; R[i] = s[2]; A[i] = s[3]; PH[i] = s[4]; OM[i] = s[5]; D[i] = s[6];
    }
    n = count;
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    if (!havePos) { lx = tx = W / 2; ly = ty = H / 2; }
    if (reduced) draw(performance.now() / 1000, 0, 0, 0);
  }

  function draw(t, I, cx, cy) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#07080A';
    ctx.fillRect(0, 0, W, H);

    const live = I > 0.003;
    let lit = 0;
    for (let i = 0; i < n; i++) {
      let a = A[i], r = R[i];
      if (!reduced) a *= 0.72 + 0.28 * Math.sin(t * OM[i] + PH[i]);
      if (live) {
        const dx = X[i] - cx, dy = Y[i] - cy, d2 = dx * dx + dy * dy;
        if (d2 < LIT_R * LIT_R) {
          const k = 1 - Math.sqrt(d2) / LIT_R, f = k * Math.sqrt(k) * I; // (1 - d/170)^1.5
          a += (1 - a) * f;
          r *= 1 + 0.9 * f;
          litI[lit] = i; litF[lit] = f; lit++;
        }
      }
      ctx.globalAlpha = a;
      ctx.fillStyle = COLORS[D[i]];
      ctx.beginPath();
      ctx.arc(X[i], Y[i], r, 0, TAU);
      ctx.fill();
    }
    if (!live) return;

    // liaisons entre étoiles réveillées
    ctx.strokeStyle = '#DCE6FF';
    ctx.lineWidth = 0.8;
    let segs = 0;
    outer: for (let p = 0; p < lit; p++) {
      const i = litI[p], xi = X[i], yi = Y[i], fi = litF[p];
      for (let q = p + 1; q < lit; q++) {
        const j = litI[q], dx = X[j] - xi;
        if (dx * dx > LINK2) break;
        const dy = Y[j] - yi, d2 = dx * dx + dy * dy;
        if (d2 >= LINK2) continue;
        const a = (1 - Math.sqrt(d2) / LINK) * Math.min(fi, litF[q]) * 0.55;
        if (a < 0.01) continue;
        ctx.globalAlpha = a;
        ctx.beginPath(); ctx.moveTo(xi, yi); ctx.lineTo(X[j], Y[j]); ctx.stroke();
        if (++segs >= segCap) break outer;
      }
    }

    // le pointeur est une étoile
    ctx.strokeStyle = '#FFF6E8';
    ctx.lineWidth = 0.5;
    for (let p = 0; p < lit; p++) {
      const i = litI[p], dx = X[i] - cx, dy = Y[i] - cy, d2 = dx * dx + dy * dy;
      if (d2 >= PTR_LINK2) continue;
      ctx.globalAlpha = (1 - Math.sqrt(d2) / PTR_LINK) * I * 0.3;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(X[i], Y[i]); ctx.stroke();
    }

    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.11 * I;
    ctx.drawImage(halo, cx - HALO, cy - HALO);
    ctx.globalAlpha = 0.85 * I;
    ctx.fillStyle = '#FFF6E8';
    ctx.beginPath(); ctx.arc(cx, cy, 1.3, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  // qualité adaptative et diagnostic
  let costSum = 0, costN = 0, fpsFrames = 0, fpsT = 0, dbg = null;
  if (DEBUG) { dbg = document.createElement('div'); dbg.className = 'debug'; document.body.appendChild(dbg); }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    const t = now / 1000;

    // énergie du pointeur
    if (left) pe -= dt / 1.0;
    else if (touchUp >= 0) { if (now - touchUp > 400) pe -= dt / 0.75; }
    else if (now - lastMove < 90) pe += (1 - pe) * Math.min(1, dt * 9);
    else pe -= dt / 0.75;
    if (pe < 0) pe = 0;

    // dérive autonome : sans pointeur ou au repos depuis 4 s
    const idle = pe === 0 && now - lastActivity > 4000;
    de += ((idle ? 0.5 : 0) - de) * Math.min(1, dt / 1.5);
    if (de < 0.002 && !idle) de = 0;
    if (pe === 0 && de > 0) {
      const w = TAU * t / 25;
      tx = W * (0.5 + 0.34 * Math.sin(w));
      ty = H * (0.5 + 0.3 * Math.sin(2 * w + 0.7));
    }

    const k = 1 - Math.pow(0.88, dt * 60); // facteur 0,12 à 60 i/s
    lx += (tx - lx) * k; ly += (ty - ly) * k;

    const e = pe * pe * (3 - 2 * pe);
    const I = Math.max(e, de);

    const t0 = performance.now();
    draw(t, I, lx, ly);
    const cost = performance.now() - t0;

    costSum += cost; costN++;
    if (costN === 30) {
      if (costSum / 30 > 12) {
        if (segCap > 60) segCap = Math.round(segCap * 0.6);
        else if (starScale > 0.4) { starScale *= 0.8; seed(); }
      }
      costSum = 0; costN = 0;
    }
    if (dbg) {
      fpsFrames++;
      if (now - fpsT > 500) {
        dbg.textContent = Math.round(fpsFrames * 1000 / (now - fpsT)) + ' i/s\n' + n + ' étoiles\n' + cost.toFixed(2) + ' ms';
        fpsFrames = 0; fpsT = now;
      }
    }
  }

  function start() { if (!raf && !reduced && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  function moveTo(x, y) {
    const now = performance.now();
    if (pe === 0 && de > 0.05) { /* reprise : la lumière part de la dérive */ }
    else if (pe === 0) { lx = x; ly = y; }
    tx = x; ty = y; havePos = true;
    lastMove = lastActivity = now; left = false;
  }

  window.addEventListener('pointermove', e => { if (e.pointerType !== 'touch') { touchUp = -1; moveTo(e.clientX, e.clientY); } }, { passive: true });
  document.documentElement.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') left = true; });
  document.addEventListener('mouseout', e => { if (!e.relatedTarget) left = true; });
  window.addEventListener('blur', () => { left = true; });
  const onTouch = e => { const p = e.touches[0]; if (p) { touching = true; touchUp = -1; moveTo(p.clientX, p.clientY); } };
  window.addEventListener('touchstart', onTouch, { passive: true });
  window.addEventListener('touchmove', onTouch, { passive: true });
  const onTouchEnd = e => { if (!e.touches.length) { touching = false; touchUp = performance.now(); lastActivity = touchUp; } };
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('touchcancel', onTouchEnd, { passive: true });

  let rt = 0;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  window.addEventListener('orientationchange', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
  reduceMQ.addEventListener && reduceMQ.addEventListener('change', e => {
    reduced = e.matches; pe = de = 0;
    if (reduced) { stop(); draw(0, 0, 0, 0); } else start();
  });

  resize();
  start();
})();
