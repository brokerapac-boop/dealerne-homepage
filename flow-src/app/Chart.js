'use client';
import { useEffect, useRef } from 'react';

/* 300틱 시뮬레이션 캔들 차트. 실제 시세가 아닙니다. */
export default function Chart({ className, start, seed = 7, cw = 10, pad = 0, lo, hi, lines, labels }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    const TPC = 300, vol = start * 0.00018;
    let W = 0, H = 0, s = seed, price = start, drift = 0, ticks = 0, cur = null, timer = null, raf = 0, visible = false;
    const candles = [];
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const step = (n) => {
      for (let i = 0; i < n; i++) {
        if (rnd() < 0.004) drift = (rnd() - 0.5) * vol * 0.5;
        const pull = lo && hi ? ((lo + hi) / 2 - price) * 0.0009 : 0;
        price += (rnd() - 0.5) * vol * 2 + drift + pull;
        if (!cur) cur = { o: price, h: price, l: price, c: price };
        cur.c = price; if (price > cur.h) cur.h = price; if (price < cur.l) cur.l = price;
        if (++ticks >= TPC) { candles.push(cur); cur = null; ticks = 0; if (candles.length > 140) candles.shift(); }
      }
    };
    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1), r = cv.getBoundingClientRect();
      W = Math.round(r.width); H = Math.round(r.height); if (!W || !H) return;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = () => {
      raf = 0; if (!W || !H) return;
      ctx.clearRect(0, 0, W, H);
      const all = cur ? candles.concat([cur]) : candles, n = Math.min(all.length, Math.floor((W - pad) / cw));
      const view = all.slice(all.length - n); let mn = Infinity, mx = -Infinity;
      view.forEach((c) => { if (c.l < mn) mn = c.l; if (c.h > mx) mx = c.h; });
      (lines || []).forEach((l) => { if (l.v < mn) mn = l.v; if (l.v > mx) mx = l.v; });
      const py = (mx - mn) * 0.12 || 1; mn -= py; mx += py;
      const y = (v) => H - ((v - mn) / (mx - mn)) * H;
      (lines || []).forEach((l) => {
        const ly = Math.round(y(l.v)) + 0.5;
        ctx.strokeStyle = l.c; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(W, ly); ctx.stroke(); ctx.setLineDash([]);
        if (labels) {
          ctx.font = '700 11px Pretendard Variable, sans-serif'; const tw = ctx.measureText(l.t).width + 14;
          ctx.fillStyle = l.c; ctx.fillRect(W - tw, ly - 9, tw, 18);
          ctx.fillStyle = '#0B0E15'; ctx.textBaseline = 'middle'; ctx.fillText(l.t, W - tw + 7, ly + 1);
        }
      });
      const x0 = W - pad - n * cw;
      view.forEach((c, i) => {
        const x = Math.round(x0 + i * cw + cw / 2) + 0.5;
        ctx.strokeStyle = ctx.fillStyle = c.c >= c.o ? '#F0556B' : '#4B8BFF';
        ctx.beginPath(); ctx.moveTo(x, y(c.h)); ctx.lineTo(x, y(c.l)); ctx.stroke();
        ctx.fillRect(Math.round(x - cw * 0.32), y(Math.max(c.o, c.c)), Math.max(2, Math.round(cw * 0.64)), Math.max(1, Math.abs(y(c.o) - y(c.c))));
      });
    };
    const loop = () => { step(3 + Math.floor(rnd() * 10)); if (!raf) raf = requestAnimationFrame(draw); };
    const run = () => { if (!timer && visible && !reduce && !document.hidden) timer = setInterval(loop, 60); };
    const halt = () => { clearInterval(timer); timer = null; };
    const onVis = () => (document.hidden ? halt() : run());
    let rt; const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { size(); draw(); }, 150); };

    step(TPC * 90 + 120); size(); draw();
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) { size(); draw(); run(); } else halt(); });
    io.observe(cv);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('resize', onResize);
    return () => { halt(); cancelAnimationFrame(raf); clearTimeout(rt); io.disconnect(); document.removeEventListener('visibilitychange', onVis); window.removeEventListener('resize', onResize); };
  }, [start, seed, cw, pad, lo, hi, lines, labels]);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
