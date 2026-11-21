'use client';
import { useEffect, useRef } from 'react';

/* 300틱 시뮬레이션 캔들 차트. 실제 시세가 아닙니다. */
/* signals: 이동평균을 가격이 넘나들 때 기계적으로 매수·매도 표시를 붙입니다 (예시 표시, 결과와 무관하게 붙음) */
export default function Chart({ className, start, seed = 7, cw = 10, pad = 0, lo, hi, lines, labels, signals }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    const TPC = 300, vol = start * 0.00018;
    let W = 0, H = 0, s = seed, price = start, drift = 0, ticks = 0, cur = null, timer = null, raf = 0, visible = false;
    let ema = null, above = null, since = 99;
    const candles = [];
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const step = (n) => {
      for (let i = 0; i < n; i++) {
        if (rnd() < 0.004) drift = (rnd() - 0.5) * vol * 0.5;
        const pull = lo && hi ? ((lo + hi) / 2 - price) * 0.0009 : 0;
        price += (rnd() - 0.5) * vol * 2 + drift + pull;
        if (!cur) cur = { o: price, h: price, l: price, c: price };
        cur.c = price; if (price > cur.h) cur.h = price; if (price < cur.l) cur.l = price;
        if (++ticks >= TPC) {
          if (signals) {
            // 종가가 이동평균(9)을 위로 넘으면 매수, 아래로 넘으면 매도. 표시 사이는 최소 7개 캔들
            ema = ema === null ? cur.c : ema + (cur.c - ema) * 0.2;
            const up = cur.c > ema; since++;
            if (above !== null && up !== above && since >= 7) { cur.sig = up ? 'buy' : 'sell'; since = 0; }
            above = up;
          }
          candles.push(cur); cur = null; ticks = 0; if (candles.length > 140) candles.shift();
        }
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
      ctx.globalAlpha = signals ? 0.6 : 1;   // 표시가 있을 때는 캔들을 조금 흐리게, 표시는 또렷하게
      view.forEach((c, i) => {
        const x = Math.round(x0 + i * cw + cw / 2) + 0.5;
        ctx.strokeStyle = ctx.fillStyle = c.c >= c.o ? '#F0556B' : '#4B8BFF';
        ctx.beginPath(); ctx.moveTo(x, y(c.h)); ctx.lineTo(x, y(c.l)); ctx.stroke();
        ctx.fillRect(Math.round(x - cw * 0.32), y(Math.max(c.o, c.c)), Math.max(2, Math.round(cw * 0.64)), Math.max(1, Math.abs(y(c.o) - y(c.c))));
      });
      ctx.globalAlpha = 1;
      if (signals) {
        // 표시: 캔들 끝의 작은 점 + 가는 연결선 + 테두리만 있는 라벨. 가장 최근 표시는 점 주위가 퍼져 나감
        const now = performance.now(), sigs = [];
        view.forEach((c, i) => { if (c.sig) sigs.push([c, i]); });
        ctx.font = '700 11px Pretendard Variable, sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
        sigs.forEach(([c, i], k) => {
          const buy = c.sig === 'buy', col = buy ? '#FF5C74' : '#5B97FF', rgb = buy ? '255,92,116' : '91,151,255';
          const x = Math.round(x0 + i * cw + cw / 2) + 0.5, dir = buy ? 1 : -1;      // 매수는 캔들 아래, 매도는 캔들 위
          const ay = (buy ? y(c.l) : y(c.h)) + dir * 9, ly = ay + dir * 26;
          if (k === sigs.length - 1) {
            const t = (now % 1800) / 1800;
            ctx.beginPath(); ctx.arc(x, ay, 4 + t * 14, 0, Math.PI * 2); ctx.strokeStyle = `rgba(${rgb},${0.55 * (1 - t)})`; ctx.lineWidth = 1.5; ctx.stroke();
          }
          ctx.beginPath(); ctx.arc(x, ay, 7, 0, Math.PI * 2); ctx.fillStyle = `rgba(${rgb},.18)`; ctx.fill();
          ctx.beginPath(); ctx.arc(x, ay, 3.2, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
          ctx.beginPath(); ctx.moveTo(x, ay + dir * 7); ctx.lineTo(x, ly - dir * 10); ctx.strokeStyle = `rgba(${rgb},.55)`; ctx.lineWidth = 1; ctx.stroke();
          const tw = 46, th = 20, bx = Math.round(x - tw / 2), by = Math.round(ly - th / 2);
          ctx.beginPath(); ctx.roundRect(bx, by, tw, th, 6); ctx.fillStyle = 'rgba(9,12,19,.88)'; ctx.fill();
          ctx.strokeStyle = `rgba(${rgb},.7)`; ctx.lineWidth = 1; ctx.stroke();
          const tx = bx + 9, ty = by + th / 2;                                           // 작은 방향 화살표
          ctx.beginPath(); ctx.moveTo(tx, ty - dir * 3.5); ctx.lineTo(tx - 3.5, ty + dir * 2.5); ctx.lineTo(tx + 3.5, ty + dir * 2.5); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
          ctx.fillStyle = '#F3F4F7'; ctx.fillText(buy ? '매수' : '매도', bx + 17, ty + 1);
        });
        ctx.textAlign = 'start';
      }
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
  }, [start, seed, cw, pad, lo, hi, lines, labels, signals]);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
