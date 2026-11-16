'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

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

/* 종목 카드의 흐르는 미니 차트 (시뮬레이션) */
export function Spark({ seed = 1 }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    let s = seed * 9973 + 17, W = 0, H = 0, raf = 0, visible = false, t0 = 0;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const N = 34, STEP = 900, pts = [];
    let v = 0.5, d = 0;
    const next = () => { d = d * 0.7 + (rnd() - 0.5) * 0.16 + (0.5 - v) * 0.06; v = Math.min(0.92, Math.max(0.08, v + d)); return v; };
    for (let i = 0; i < N + 2; i++) pts.push(next());
    const size = () => { const dpr = Math.min(2, window.devicePixelRatio || 1), r = cv.getBoundingClientRect(); W = Math.round(r.width); H = Math.round(r.height); if (!W || !H) return; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const draw = (now) => {
      raf = 0; if (!W) return;
      if (!t0) t0 = now;
      let f = (now - t0) / STEP;
      while (f >= 1) { pts.shift(); pts.push(next()); t0 += STEP; f -= 1; }
      const dx = W / (N - 1), x = (i) => (i - f) * dx, y = (p) => 6 + (1 - p) * (H - 12);
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) { const px = x(i), py = y(pts[i]); if (!i) ctx.moveTo(px, py); else { const qx = x(i - 1), qy = y(pts[i - 1]); ctx.bezierCurveTo((qx + px) / 2, qy, (qx + px) / 2, py, px, py); } }
      // 마지막 점은 화면 오른쪽 끝에 머물도록 보간
      const lastI = N - 1 + f, a = pts[N - 1], b = pts[N], ty = y(a + (b - a) * f), tx = W - 6;
      ctx.lineWidth = 2; ctx.strokeStyle = '#FFC247'; ctx.stroke();
      ctx.lineTo(x(pts.length - 1), H); ctx.lineTo(x(0), H); ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,194,71,.22)'); g.addColorStop(1, 'rgba(255,194,71,0)'); ctx.fillStyle = g; ctx.fill();
      ctx.clearRect(tx, 0, W - tx, H);
      ctx.beginPath(); ctx.arc(tx, ty, 4, 0, Math.PI * 2); ctx.fillStyle = '#FFC247'; ctx.fill();
      ctx.beginPath(); ctx.arc(tx, ty, 9, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,194,71,.18)'; ctx.fill();
      void lastI;
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

/* 수급 줄마다 그려지는 선 (더미) */
export function FlowLine({ up, seed }) {
  let s = seed * 7919 + 3; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  let y = up ? 30 : 10; const p = [];
  for (let i = 0; i <= 12; i++) { y += (up ? -1.5 : 1.5) + (rnd() - 0.5) * 7; y = Math.min(36, Math.max(4, y)); p.push(`${i ? 'L' : 'M'}${i * 10} ${y.toFixed(1)}`); }
  return <svg className={`fline ${up ? 'pos' : 'neg'}`} viewBox="0 0 120 40" preserveAspectRatio="none" aria-hidden="true"><motion.path d={p.join(' ')} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, amount: 0.8 }} transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1], delay: 0.15 + seed * 0.14 }} /></svg>;
}

/* 수급: 장중 누적 흐름이 그려지는 차트 (더미) */
export function FlowChart() {
  const mk = (seed, end) => {
    let s = seed * 7919 + 3; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const p = []; let y = 100;
    for (let i = 0; i <= 26; i++) { const t = i / 26; y = 100 + (end - 100) * (t * t * (3 - 2 * t)) + (rnd() - 0.5) * 16 * Math.sin(Math.PI * t); p.push(`${i ? 'L' : 'M'}${(40 + t * 500).toFixed(1)} ${y.toFixed(1)}`); }
    return p.join(' ');
  };
  const rows = [['외국인', 'pos', mk(1, 34), 34], ['기관', 'neg', mk(2, 164), 164], ['개인', 'neg2', mk(3, 134), 134]];
  return (
    <svg className="viz fchart" viewBox="0 0 600 200" aria-hidden="true">
      <line className="zero" x1="40" y1="100" x2="540" y2="100" /><text x="34" y="104" textAnchor="end">0</text>
      {['09:00', '11:00', '13:00', '15:30'].map((t, k) => <text key={t} x={40 + k * 166.6} y="194" textAnchor="middle">{t}</text>)}
      {rows.map(([name, cls, d, end]) => (
        <g key={name} className={cls}>
          <path pathLength="1" d={d} />
          <g className="end"><circle cx="540" cy={end} r="5" /><text x="552" y={end + 4}>{name}</text></g>
        </g>
      ))}
      <line className="scan" x1="40" y1="14" x2="40" y2="180" />
    </svg>
  );
}
