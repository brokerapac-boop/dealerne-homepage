'use client';
import { useEffect, useRef } from 'react';

/* TradingView Lightweight Charts™ 로 그리는 300틱 시뮬레이션 차트. 실제 시세가 아닙니다.
   - 캔들 하나 = 300틱. 60ms마다 3~12틱이 들어와 마지막 캔들이 자라고, 300틱이 차면 새 캔들이 열립니다.
   - 가격은 변동성이 몰렸다 풀리는 랜덤워크(로그 수익률)이며, base 근처로 아주 약하게 되돌아옵니다.
   - signals: 종가가 이동평균(9)을 넘나들 때 기계적으로 매수·매도 표시를 붙입니다. 결과와 무관하게 붙습니다. */
const UP = '#F0556B', DOWN = '#4B8BFF';
const TPC = 300, STEP = 60;

export default function TVChart({ className, base = 21640, vol = 0.0011, seed = 7, lines, signals, scale: wantScale = true, scaleMin = 0, spacing = 10, offset = 6, lineLabels = true }) {
  const ref = useRef(null);
  useEffect(() => {
    let dead = false, chart = null, timer = null, io = null, onVis = null;
    const host = ref.current;
    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    const scale = wantScale && window.innerWidth >= scaleMin;   // 좁은 화면에서는 가격 눈금을 숨김

    import('lightweight-charts').then((LW) => {
      if (dead) return;
      // 난수 (seed 고정: 새로 고쳐도 같은 모양으로 시작)
      let s = seed * 48271 + 11;
      const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      const gauss = () => { let u = 0; while (u === 0) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };
      const r1 = (v) => Math.round(v * 10) / 10;

      let price = base, heat = 1, t = 1700000000, bar = null, ticks = 0;
      let ema = null, above = null, since = 99;
      const markers = [];
      let lastSig = null, sigSeq = 0;   // 가장 최근 표시의 위치(파동 효과용)
      const tick = () => {
        // 변동성은 캔들 단위로 천천히 커졌다 작아짐, 가끔 한 번씩 크게 움직임
        const jump = rnd() < 0.0015 ? gauss() * vol * 1.6 : 0;
        price *= Math.exp((vol * heat / Math.sqrt(TPC)) * gauss() + jump - (0.012 * Math.log(price / base)) / TPC);
        const p = r1(price);
        if (!bar) bar = { time: t, open: p, high: p, low: p, close: p };
        bar.close = p; if (p > bar.high) bar.high = p; if (p < bar.low) bar.low = p;
        ticks++;
      };
      const closeBar = () => {
        if (signals) {
          ema = ema === null ? bar.close : ema + (bar.close - ema) * 0.2;
          const up = bar.close > ema; since++;
          if (above !== null && up !== above && since >= 7) {
            markers.push(up
              ? { time: bar.time, position: 'belowBar', color: '#FF5C74', shape: 'arrowUp', text: '매수' }
              : { time: bar.time, position: 'aboveBar', color: '#5B97FF', shape: 'arrowDown', text: '매도' });
            if (markers.length > 14) markers.shift();
            lastSig = { time: bar.time, price: up ? bar.low : bar.high, buy: up }; sigSeq++;
            since = 0;
          }
          above = up;
        }
        heat = Math.min(2.4, Math.max(0.55, heat * Math.exp(0.22 * gauss()) * (heat > 1 ? 0.97 : 1.03)));
        t += STEP; bar = null; ticks = 0;
      };

      chart = LW.createChart(host, {
        autoSize: true,
        layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#8E96A8', fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontSize: 11 },
        grid: { vertLines: { color: 'rgba(255,255,255,0.035)' }, horzLines: { color: 'rgba(255,255,255,0.05)' } },
        rightPriceScale: { visible: scale, borderVisible: false, scaleMargins: { top: 0.16, bottom: 0.16 } },
        timeScale: { visible: false, borderVisible: false, rightOffset: offset, barSpacing: spacing, fixLeftEdge: false },
        crosshair: { mode: LW.CrosshairMode.Hidden, vertLine: { visible: false, labelVisible: false }, horzLine: { visible: false, labelVisible: false } },
        handleScroll: false, handleScale: false,   // 페이지 스크롤을 가로채지 않게
      });
      const series = chart.addCandlestickSeries({
        upColor: UP, downColor: DOWN, borderUpColor: UP, borderDownColor: DOWN, wickUpColor: UP, wickDownColor: DOWN,
        priceLineVisible: scale, priceLineColor: 'rgba(255,255,255,0.35)', lastValueVisible: scale,
        priceFormat: { type: 'price', precision: 1, minMove: 0.1 },
      });

      // 지나간 캔들 채우기
      const hist = [];
      for (let i = 0; i < 150; i++) { while (ticks < TPC) tick(); hist.push(bar); closeBar(); }
      for (let k = 0; k < 120; k++) tick();
      series.setData(hist.concat([{ ...bar }]));
      if (signals) series.setMarkers(markers.slice());
      (lines || []).forEach((l) => series.createPriceLine({ price: l.v, color: l.c, lineWidth: 1, lineStyle: 2, axisLabelVisible: scale && lineLabels, title: lineLabels ? l.t : '' }));
      chart.timeScale().scrollToRealTime();

      // 가장 최근 표시 위에 노란 구슬과 퍼지는 파동을 올림. 새 표시가 생기면 한 번 크게 터짐
      let orb = null, shown = 0;
      if (signals) {
        orb = document.createElement('div'); orb.className = 'sig-orb';
        orb.innerHTML = '<i class="flash"></i><i class="ring"></i><i class="ring"></i><i class="ring"></i><i class="core"></i>';
        host.appendChild(orb); host._orb = orb;
      }
      const place = () => {
        if (!orb) return;
        const x = lastSig ? chart.timeScale().timeToCoordinate(lastSig.time) : null;
        const y = lastSig ? series.priceToCoordinate(lastSig.price) : null;
        if (x === null || y === null || x < 0) { orb.style.opacity = '0'; return; }
        orb.style.opacity = '1';
        orb.style.transform = `translate(${Math.round(x)}px,${Math.round(y + (lastSig.buy ? 13 : -13))}px)`;
        if (shown !== sigSeq) { shown = sigSeq; orb.classList.remove('burst'); void orb.offsetWidth; orb.classList.add('burst'); }
      };
      requestAnimationFrame(place);

      const loop = () => {
        const n = 3 + Math.floor(rnd() * 10);
        for (let k = 0; k < n; k++) {
          tick();
          if (ticks >= TPC) { series.update({ ...bar }); const before = markers.length, last = markers[markers.length - 1]; closeBar(); if (signals && (markers.length !== before || markers[markers.length - 1] !== last)) series.setMarkers(markers.slice()); }
        }
        if (bar) series.update({ ...bar });
        place();
      };
      let visible = false;
      const run = () => { if (!timer && visible && !reduce && !document.hidden) timer = setInterval(loop, 60); };
      const halt = () => { clearInterval(timer); timer = null; };
      io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) { chart.timeScale().scrollToRealTime(); run(); } else halt(); });
      io.observe(host);
      onVis = () => (document.hidden ? halt() : run());
      document.addEventListener('visibilitychange', onVis);
      host._halt = halt;
    });

    return () => {
      dead = true;
      if (host._halt) host._halt();
      if (io) io.disconnect();
      if (onVis) document.removeEventListener('visibilitychange', onVis);
      if (host._orb) { host._orb.remove(); host._orb = null; }
      if (chart) chart.remove();
    };
  }, [base, vol, seed, lines, signals, wantScale, scaleMin, spacing, offset, lineLabels]);
  return <div ref={ref} className={className} aria-hidden="true" />;
}
