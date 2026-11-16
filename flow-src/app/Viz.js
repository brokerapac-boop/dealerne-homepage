'use client';
import { useEffect, useRef } from 'react';

/* 카드 안에서 계속 움직이는 작은 그림들. 모두 예시이며 실제 시세·실적이 아닙니다.
   움직임은 globals.css 의 @keyframes (vz-*) 로 반복됩니다. */

/* 원칙 01: 가격 세 개(목표·진입·손절)를 먼저 긋고, 그 뒤에 가격이 움직임 */
export function VizRule() {
  return (
    <svg className="viz vz-rule" viewBox="0 0 320 190" aria-hidden="true">
      <g className="ln ln-t"><line x1="16" y1="42" x2="304" y2="42" /><text x="20" y="34">목표</text></g>
      <g className="ln ln-e"><line x1="16" y1="104" x2="304" y2="104" /><text x="20" y="96">진입</text></g>
      <g className="ln ln-s"><line x1="16" y1="146" x2="304" y2="146" /><text x="20" y="138">손절</text></g>
      <path className="price" pathLength="1" d="M16 122 L48 116 L70 128 L96 108 L118 114 L140 96 L166 104 L190 82 L214 90 L238 66 L262 72 L290 50" />
      <circle className="tip" r="5" cx="0" cy="0"><animateMotion dur="7s" repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;0.38;0.86;1" calcMode="linear" path="M16 122 L48 116 L70 128 L96 108 L118 114 L140 96 L166 104 L190 82 L214 90 L238 66 L262 72 L290 50" /></circle>
    </svg>
  );
}

/* 원칙 02: 다섯 단계가 아래에서부터 차례로 켜짐 */
export function VizSteps() {
  return (
    <svg className="viz vz-steps" viewBox="0 0 320 190" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k} className={`st st-${k}`}>
          <rect x={26 + k * 56} y={138 - k * 24} width="44" height={28 + k * 24} rx="10" />
          <text x={48 + k * 56} y="182" textAnchor="middle">Lv{k + 1}</text>
        </g>
      ))}
      <circle className="hop" r="7" cx="48" cy="124" />
    </svg>
  );
}

/* 원칙 03: 매매 일지가 한 줄씩 채워지고 체크됨 */
export function VizJournal() {
  const rows = ['진입 이유', '손절 지켰는지', '다음에 고칠 점'];
  return (
    <svg className="viz vz-journal" viewBox="0 0 320 190" aria-hidden="true">
      <rect className="paper" x="44" y="14" width="232" height="162" rx="16" />
      <text className="ttl" x="64" y="44">매매 일지</text>
      {rows.map((t, k) => (
        <g key={k} className={`jr jr-${k}`}>
          <rect className="box" x="64" y={62 + k * 36} width="20" height="20" rx="6" />
          <path className="tick" pathLength="1" d={`M69 ${72 + k * 36} l4 4 l8 -9`} />
          <text x="96" y={77 + k * 36}>{t}</text>
          <line className="ink" pathLength="1" x1="96" y1={88 + k * 36} x2={k === 1 ? 214 : 250} y2={88 + k * 36} />
        </g>
      ))}
    </svg>
  );
}

/* 막히는 곳 01: 낯선 용어들이 떠다님 */
export function VizJargon() {
  const chips = [['랏', 40, 44], ['핍', 232, 36], ['증거금', 124, 30], ['스왑', 250, 112], ['스프레드', 34, 122], ['레버리지', 150, 146]];
  return (
    <div className="viz vz-jargon" aria-hidden="true">
      {chips.map(([t, x, y], k) => <span key={t} style={{ left: `${(x / 320) * 100}%`, top: `${(y / 190) * 100}%`, animationDelay: `${-k * 0.9}s`, animationDuration: `${4.5 + k * 0.6}s` }}>{t}</span>)}
      <b>?</b>
    </div>
  );
}

/* 막히는 곳 02: 주문 창에서 0.01 이 1.00 으로 바뀌면 크기가 100배 */
export function VizLot() {
  return (
    <div className="viz vz-lot" aria-hidden="true">
      <div className="ticket">
        <p className="t-hd"><span>골드 XAUUSD</span><em>주문 창 예시</em></p>
        <p className="t-lb">수량 (랏)</p>
        <p className="t-field"><span className="ok">0.01</span><span className="bad">1.00</span><i className="x100">×100</i></p>
        <p className="t-bar"><i /></p>
        <p className="t-cap"><span className="ok">의도한 수량 0.01 = 1온스</span><span className="bad">입력한 수량 1.00 = 100온스</span></p>
      </div>
    </div>
  );
}

/* 막히는 곳 03: 손절가가 비어 있으면 가격이 어디서 멈출지 정해지지 않음 */
export function VizNoStop() {
  return (
    <svg className="viz vz-nostop" viewBox="0 0 320 190" aria-hidden="true">
      <g className="field"><rect x="188" y="18" width="116" height="40" rx="10" /><text className="lb" x="200" y="43">손절가</text><text className="val" x="290" y="44" textAnchor="end">—</text></g>
      <line className="entry" x1="16" y1="62" x2="170" y2="62" /><text className="lb" x="20" y="54">진입</text>
      <path className="fall" pathLength="1" d="M16 70 L44 62 L66 78 L90 72 L112 96 L134 88 L158 118 L180 110 L204 142 L228 136 L252 166 L276 160 L304 190" />
      <circle className="tip" r="5"><animateMotion dur="6s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.8;1" calcMode="linear" path="M16 70 L44 62 L66 78 L90 72 L112 96 L134 88 L158 118 L180 110 L204 142 L228 136 L252 166 L276 160 L304 190" /></circle>
    </svg>
  );
}

/* 종목 카드의 흐르는 미니 차트 (시뮬레이션). 틱처럼 빠르게 움직이고, 보이는 구간에 맞춰 위아래를 꽉 채움 */
export function Spark({ seed = 1 }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    let s = seed * 9973 + 17, W = 0, H = 0, raf = 0, visible = false, t0 = 0, lo = 0, hi = 1;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const N = 30, STEP = 260 + (seed % 3) * 40, pts = [];
    let v = 50, d = 0, trend = 0;
    const next = () => {
      trend *= 0.86;
      if (rnd() < 0.12) trend = (rnd() - 0.5) * 6;              // 가끔 방향이 바뀌고 곧 잦아듦
      const jump = rnd() < 0.1 ? (rnd() - 0.5) * 22 : 0;         // 가끔 크게 튐
      d = d * 0.2 + (rnd() - 0.5) * 10 + trend + jump;
      v += d; return v;
    };
    for (let i = 0; i < N + 2; i++) pts.push(next());
    const size = () => { const dpr = Math.min(2, window.devicePixelRatio || 1), r = cv.getBoundingClientRect(); W = Math.round(r.width); H = Math.round(r.height); if (!W || !H) return; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const range = () => { let a = Infinity, b = -Infinity; for (const p of pts) { if (p < a) a = p; if (p > b) b = p; } const pad = Math.max(2, (b - a) * 0.12); return [a - pad, b + pad]; };
    [lo, hi] = range();
    const draw = (now) => {
      raf = 0; if (!W) return;
      if (!t0) t0 = now;
      let f = (now - t0) / STEP;
      while (f >= 1) { pts.shift(); pts.push(next()); t0 += STEP; f -= 1; }
      const [a, b] = range(); lo += (a - lo) * 0.08; hi += (b - hi) * 0.08;   // 세로 범위는 부드럽게 따라감
      const R = 8, dx = (W - R) / (N - 1), x = (i) => (i - f) * dx, y = (p) => 5 + (1 - (p - lo) / (hi - lo)) * (H - 10);
      const tipV = pts[N - 1] + (pts[N] - pts[N - 1]) * f, tx = W - R, ty = y(tipV);
      ctx.clearRect(0, 0, W, H);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, tx, H); ctx.clip();
      ctx.beginPath(); ctx.moveTo(x(0), y(pts[0]));
      for (let i = 1; i < N; i++) ctx.lineTo(x(i), y(pts[i]));
      ctx.lineTo(tx, ty);
      ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.strokeStyle = '#FFC247'; ctx.stroke();
      ctx.lineTo(tx, H); ctx.lineTo(x(0), H); ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,194,71,.26)'); g.addColorStop(1, 'rgba(255,194,71,0)'); ctx.fillStyle = g; ctx.fill();
      ctx.restore();
      const pulse = 7 + 3 * Math.sin(now / 180);
      ctx.beginPath(); ctx.arc(tx, ty, pulse, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,194,71,.2)'; ctx.fill();
      ctx.beginPath(); ctx.arc(tx, ty, 3.5, 0, Math.PI * 2); ctx.fillStyle = '#FFC247'; ctx.fill();
      if (visible && !reduce) raf = requestAnimationFrame(draw);
    };
    size(); draw(performance.now());
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible && !raf) { size(); t0 = 0; raf = requestAnimationFrame(draw); } });
    io.observe(cv);
    const onR = () => { size(); if (!raf) draw(performance.now()); };
    window.addEventListener('resize', onR);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', onR); };
  }, [seed]);
  return <canvas ref={ref} className="spark" aria-hidden="true" />;
}
