(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile menu ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  function closeNav() { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });

  /* ---------- hero candle chart (canvas) ---------- */
  var canvas = document.getElementById('heroChart');
  var ctx = canvas.getContext('2d');
  var N = 64, ENTRY = 40;
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var rand = rng(20261105);
  var candles = [], price = 100;
  for (var i = 0; i < N; i++) {
    var drift = i < 24 ? 0.5 : i < 38 ? -0.9 : 1.15;          // 상승 → 눌림 → 재상승
    var o = price, c = o + drift + (rand() - 0.5) * 4.2;
    var hi = Math.max(o, c) + rand() * 2.2, lo = Math.min(o, c) - rand() * 2.2;
    candles.push({ o: o, c: c, h: hi, l: lo });
    price = c;
  }
  var entryPx = candles[ENTRY].c;
  var stopPx = Math.min.apply(null, candles.slice(30, ENTRY + 1).map(function (d) { return d.l; })) - 1.2;
  var targetPx = entryPx + (entryPx - stopPx) * 2;
  var allMax = Math.max(targetPx + 2, Math.max.apply(null, candles.map(function (d) { return d.h; })));
  var allMin = Math.min(stopPx - 3, Math.min.apply(null, candles.map(function (d) { return d.l; })));
  var W = 0, H = 0, dpr = 1;
  var UP = '#F0556B', DOWN = '#4B8BFF', ACC = '#FFC247';
  var start = null, finished = false, rafId = null;

  function size() {
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function ease(t) { return t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3); }
  function draw(t) {
    // timeline (sec): candles 0..ENTRY 0-1.5 / rules 1.5-2.4 / remaining candles 2.4-4.0
    ctx.clearRect(0, 0, W, H);
    var wide = W > 700; var padL = W * (wide ? 0.33 : 0.05), padR = W * (wide ? 0.14 : 0.2), padT = H * 0.14, padB = H * 0.2;
    var cw = (W - padL - padR) / N;
    function X(i) { return padL + cw * (i + 0.5); }
    function Y(p) { return padT + (allMax - p) / (allMax - allMin) * (H - padT - padB); }

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
    for (var g = 1; g < 6; g++) { var gy = padT + (H - padT - padB) * g / 6; ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

    var shown;
    if (t < 1.5) shown = ENTRY * ease(t / 1.5);
    else if (t < 2.4) shown = ENTRY;
    else shown = ENTRY + (N - 1 - ENTRY) * ease((t - 2.4) / 1.6);
    var lastFull = Math.floor(shown);

    // rules (entry / stop / target) appear after the pullback is drawn
    var ra = ease((t - 1.5) / 0.9);
    if (ra > 0) {
      var x0 = X(ENTRY), x1 = W - padR * 0.1;
      var xe = x0 + (x1 - x0) * ra;
      function rule(px, color, label, dash) {
        var y = Y(px);
        ctx.save(); ctx.globalAlpha = Math.min(1, ra * 1.2);
        ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash(dash || []);
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(xe, y); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = color; ctx.font = '600 13px "Pretendard Variable",Pretendard,sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(label, x1 - 64, y - 8);
        ctx.restore();
      }
      rule(targetPx, 'rgba(255,255,255,0.55)', '목표', [2, 6]);
      rule(entryPx, ACC, '진입 기준', [7, 6]);
      rule(stopPx, DOWN, '손절 기준', [7, 6]);
    }

    // candles
    for (var i = 0; i <= lastFull && i < N; i++) {
      var d = candles[i], up = d.c >= d.o, col = up ? UP : DOWN;
      var a = i === lastFull ? (shown - lastFull) : 1;
      ctx.globalAlpha = Math.max(0.25, a);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X(i), Y(d.h)); ctx.lineTo(X(i), Y(d.l)); ctx.stroke();
      var by = Y(Math.max(d.o, d.c)), bh = Math.max(Math.abs(Y(d.o) - Y(d.c)), 2);
      ctx.fillRect(X(i) - cw * 0.32, by, cw * 0.64, bh);
    }
    ctx.globalAlpha = 1;

    // entry marker
    if (ra > 0.4) {
      var mx = X(ENTRY), my = Y(entryPx);
      ctx.save(); ctx.globalAlpha = Math.min(1, (ra - 0.4) / 0.6);
      ctx.fillStyle = '#07090F'; ctx.strokeStyle = ACC; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(mx, my, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
    }
  }
  function frame(ts) {
    if (start === null) start = ts;
    var t = (ts - start) / 1000;
    draw(t);
    if (t < 4.2) rafId = requestAnimationFrame(frame); else { finished = true; draw(99); }
  }
  function boot() {
    size();
    if (reduce) { finished = true; draw(99); return; }
    start = null; finished = false; rafId = requestAnimationFrame(frame);
  }
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); if (finished || reduce) draw(99); }, 120); });

  /* ---------- 300틱 캔들 시뮬레이션 (TradingView Lightweight Charts) ----------
     실제 시세가 아닙니다. 체결(틱) 300번이 모이면 캔들 하나가 완성되는 틱차트 방식입니다.
     틱은 변동성이 뭉치는 로그수익률로 만들고, 거래가 몰릴 때는 캔들이 더 빨리 찹니다. */
  function startLive() {
    var LW = window.LightweightCharts;
    var host = document.getElementById('lwc');
    if (!LW || !host) return false;
    var wrap = host.parentNode;
    var chart;
    wrap.classList.add('live');               // container must be visible before measuring
    try {
      chart = LW.createChart(host, {
        autoSize: true,
        layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#8B93A3', fontFamily: '"Pretendard Variable",Pretendard,sans-serif', fontSize: 12 },
        grid: { vertLines: { visible: false }, horzLines: { color: 'rgba(255,255,255,0.05)' } },
        crosshair: { vertLine: { visible: false, labelVisible: false }, horzLine: { visible: false, labelVisible: false } },
        rightPriceScale: { mode: LW.PriceScaleMode.Logarithmic, borderVisible: false, scaleMargins: { top: 0.14, bottom: 0.14 } },
        timeScale: { visible: false, borderVisible: false, rightOffset: 10, barSpacing: 9 },
        handleScroll: false, handleScale: false, kineticScroll: { touch: false, mouse: false }
      });
    } catch (e) { wrap.classList.remove('live'); return false; }
    var entryL, stopL, targetL, entry, stop, target;
    var series = chart.addCandlestickSeries({ upColor: UP, downColor: DOWN, borderUpColor: UP, borderDownColor: DOWN, wickUpColor: UP, wickDownColor: DOWN, priceLineVisible: false, lastValueVisible: true,
      autoscaleInfoProvider: function (orig) {            // keep stop/target lines inside the visible range
        var res = orig(); if (!res || !stop) return res;
        res.priceRange.minValue = Math.min(res.priceRange.minValue, stop * 0.9994);
        res.priceRange.maxValue = Math.max(res.priceRange.maxValue, target * 1.0006);
        return res;
      } });

    function gauss(r) { var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
    var R = rng(20261105), price = 100, h = 0;
    var TPC = 300, SIG = 0.0005, KAPPA = 0.025;  // 캔들당 틱 수, 캔들 하나의 변동성(log), 평균 회귀
    function volNow() { return SIG * Math.exp(h); }
    function step(r, p) {                       // one sub-step of the log-return walk (mean-reverting around 100)
      var z = gauss(r);
      return Math.exp((0.00002 - KAPPA * Math.log(p / 100)) / TPC + volNow() / Math.sqrt(TPC) * z);
    }
    function bumpVol(r) { h = 0.93 * h + 0.32 * gauss(r); if (h > 1.0) h = 1.0; if (h < -0.8) h = -0.8; }
    function buildCandle(time, r) {
      var o = price, hi = o, lo = o, c = o;
      for (var k = 0; k < TPC; k++) { c = c * step(r, c); if (c > hi) hi = c; if (c < lo) lo = c; }
      price = c; bumpVol(r);
      return { time: time, open: o, high: hi, low: lo, close: c };
    }
    var HIST = 160, now = Math.floor(Date.now() / 60000) * 60, t0 = now - HIST * 60, data = [];
    for (var i = 0; i < HIST; i++) data.push(buildCandle(t0 + i * 60, R));
    series.setData(data);

    function setLines() {
      [entryL, stopL, targetL].forEach(function (l) { if (l) series.removePriceLine(l); });
      entry = price; stop = entry * (1 - 0.0034); target = entry * (1 + 0.0068);
      entryL = series.createPriceLine({ price: entry, color: ACC, lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: '진입' });
      stopL = series.createPriceLine({ price: stop, color: DOWN, lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: '손절' });
      targetL = series.createPriceLine({ price: target, color: 'rgba(255,255,255,0.6)', lineWidth: 1, lineStyle: 1, axisLabelVisible: true, title: '목표' });
    }
    setLines();
    chart.timeScale().scrollToPosition(10, false);

    // 진행 중인 캔들: 한 번에 틱 여러 개를 받아 그립니다. 300틱이 차면 다음 캔들로 넘어갑니다.
    var cur = { time: t0 + HIST * 60, open: price, high: price, low: price, close: price }, ticks = 0, lastRebase = 0;
    var Rl = Math.random;
    function tick() {
      var n = Math.max(2, Math.round((3 + 9 * Math.random()) * Math.exp(h * 0.9)));   // 거래가 몰리면 틱이 한꺼번에 들어옵니다
      for (var k = 0; k < n; k++) {
        cur.close = cur.close * step(Rl, cur.close);
        if (cur.close > cur.high) cur.high = cur.close;
        if (cur.close < cur.low) cur.low = cur.close;
        price = cur.close; ticks++;
        if (ticks >= TPC) {
          series.update(cur);
          bumpVol(Rl); ticks = 0;
          cur = { time: cur.time + 60, open: cur.close, high: cur.close, low: cur.close, close: cur.close };
          if (price <= stop || price >= target) setLines();   // stop/target reached: set the next plan
        }
      }
      series.update(cur);
    }
    // 데스크 화면에서 넘어오면 숨겨져 있던 차트의 위치를 다시 잡습니다
    window.addEventListener('dn:view', function (e) { if (e.detail === 'academy') requestAnimationFrame(function () { chart.timeScale().scrollToPosition(10, false); }); });
    if (reduce) return true;                    // static snapshot for reduced-motion
    var timer = null, visible = true;
    function run() { if (!timer && visible && !document.hidden) timer = setInterval(tick, 60); }
    function halt() { clearInterval(timer); timer = null; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[e.length - 1].isIntersecting; visible ? run() : halt(); }).observe(wrap);
    }
    document.addEventListener('visibilitychange', function () { document.hidden ? halt() : run(); });
    // 화면 전환(데스크 <-> 아카데미) 때는 보이는지 직접 확인해서 다시 움직이게 합니다
    window.addEventListener('dn:view', function (e) { if (e.detail === 'academy') { visible = true; run(); } else { visible = false; halt(); } });
    if (document.body.getAttribute('data-view') === 'desk') visible = false;
    run();
    return true;
  }
  if (!startLive()) boot();

  /* ---------- roadmap fill (GSAP ScrollTrigger) ---------- */
  var items = document.querySelectorAll('.rm-i');
  if (window.gsap && window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to('.rm-fill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#rm', start: 'top 62%', end: 'bottom 58%', scrub: 0.4 } });
    items.forEach(function (li) {
      ScrollTrigger.create({ trigger: li, start: 'top 64%', onEnter: function () { li.classList.add('on'); }, onLeaveBack: function () { li.classList.remove('on'); } });
    });
  } else {
    items.forEach(function (li) { li.classList.add('on'); });
    var f = document.querySelector('.rm-fill'); if (f) f.style.transform = 'scaleY(1)';
  }

  /* ---------- library filter ---------- */
  var chips = document.querySelectorAll('.chip');
  var cards = document.querySelectorAll('#lib .lc');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      chips.forEach(function (x) { x.classList.remove('on'); x.setAttribute('aria-selected', 'false'); });
      c.classList.add('on'); c.setAttribute('aria-selected', 'true');
      var f = c.dataset.f;
      cards.forEach(function (card) { card.hidden = !(f === 'all' || card.dataset.cat === f); });
    });
  });

  /* ---------- video modal (YouTube loads only on click) ---------- */
  var vm = document.getElementById('vmodal'), vf = document.getElementById('vframe');
  document.querySelectorAll('[data-video]').forEach(function (b) {
    b.addEventListener('click', function () {
      vf.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + b.dataset.video + '?autoplay=1&rel=0&playsinline=1" title="' + (b.getAttribute('aria-label') || '영상') + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      if (vm.showModal) vm.showModal(); else vm.setAttribute('open', '');
    });
  });
  function closeVideo() { vf.innerHTML = ''; if (vm.close) vm.close(); else vm.removeAttribute('open'); }
  vm.querySelector('[data-close-video]').addEventListener('click', closeVideo);
  vm.addEventListener('close', function () { vf.innerHTML = ''; });
  vm.addEventListener('click', function (e) { if (e.target === vm) closeVideo(); });

  /* ---------- level quiz (SAMPLE questions) ---------- */
  var Q = [
    { q: '선물 거래 경험이 어느 정도인가요?', o: ['처음이에요', '모의 거래만 해봤어요', '실계좌로 6개월 미만', '실계좌로 6개월 이상'] },
    { q: '증거금과 레버리지를 설명할 수 있나요?', o: ['잘 모르겠어요', '들어본 정도예요', '대략 설명할 수 있어요', '계산까지 할 수 있어요'] },
    { q: '차트(캔들, 추세선)를 얼마나 보나요?', o: ['캔들부터 모르겠어요', '캔들은 읽어요', '추세·지지저항을 써요', '나만의 차트 세팅이 있어요'] },
    { q: '진입 전에 손절 기준을 정하나요?', o: ['아니요', '가끔요', '대부분 정해요', '항상 정하고 지켜요'] },
    { q: '매매일지를 쓰나요?', o: ['안 써요', '가끔 메모해요', '꾸준히 써요', '쓰고 통계로 복기해요'] },
    { q: '하루 손실 한도가 있나요?', o: ['없어요', '생각은 해봤어요', '정해 두었어요', '정해 두고 지킨 기록이 있어요'] },
    { q: '주로 어떤 매매를 하나요?', o: ['아직 없어요', '감으로 해요', '정해진 기법이 있어요', '초단타·스캘핑까지 해요'] },
    { q: '지금 가장 필요한 것은?', o: ['기초 개념', '차트 보는 법', '실전 기준과 리스크', '나만의 규칙 검증'] }
  ];
  var RES = [
    { lv: 'Lv1 입문', t: '선물이 움직이는 방식부터 시작하세요. 증거금, 레버리지, 계약 단위를 먼저 정리합니다.' },
    { lv: 'Lv2 차트', t: '캔들과 추세, 지지·저항을 같은 순서로 읽는 단계입니다.' },
    { lv: 'Lv3 진입 기준', t: '진입 조건과 무효 지점을 글로 적어 두는 단계입니다.' },
    { lv: 'Lv4 리스크', t: '손절 폭과 포지션 크기, 하루 손실 한도를 정하는 단계입니다.' },
    { lv: 'Lv5 실전', t: '계획대로 실행하고 복기하는 단계입니다. 1:1 레벨 상담도 함께 받아 보세요.' }
  ];
  var quiz = document.getElementById('quiz');
  var qi = 0, score = 0;
  var qEl = document.getElementById('quizQ'), oEl = document.getElementById('quizOpts'),
      stepEl = document.getElementById('quizStep'), barEl = document.getElementById('quizBar'),
      resEl = document.getElementById('quizResult');
  function render() {
    resEl.hidden = true; oEl.hidden = false; qEl.hidden = false; stepEl.hidden = false;
    qEl.textContent = Q[qi].q;
    stepEl.textContent = (qi + 1) + ' / ' + Q.length;
    barEl.style.width = ((qi + 1) / Q.length * 100) + '%';
    oEl.innerHTML = '';
    Q[qi].o.forEach(function (label, idx) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'opt'; b.textContent = label;
      b.addEventListener('click', function () { score += idx; next(); });
      oEl.appendChild(b);
    });
  }
  function next() {
    qi++;
    if (qi < Q.length) return render();
    var r = RES[Math.min(4, Math.round(score / (Q.length * 3) * 4))];
    qEl.hidden = true; oEl.hidden = true; stepEl.hidden = true;
    barEl.style.width = '100%';
    document.getElementById('resLv').textContent = r.lv;
    var sel = document.querySelector('select[name=level]'); if (sel) sel.value = r.lv;
    document.getElementById('resText').textContent = r.t;
    resEl.hidden = false;
  }
  function openQuiz() { qi = 0; score = 0; render(); if (quiz.showModal) quiz.showModal(); else quiz.setAttribute('open', ''); closeNav(); }
  function closeQuiz() { if (quiz.close) quiz.close(); else quiz.removeAttribute('open'); }
  document.querySelectorAll('[data-open-quiz]').forEach(function (b) { b.addEventListener('click', openQuiz); });
  document.querySelectorAll('[data-close-quiz]').forEach(function (b) { b.addEventListener('click', closeQuiz); });
  quiz.addEventListener('click', function (e) { if (e.target === quiz) closeQuiz(); });
  document.getElementById('quizReset').addEventListener('click', function () { qi = 0; score = 0; render(); });
})();

/* ---------- 상담 신청 (아카데미·데스크 공통): 접수한 뒤 카카오톡 상담방을 열어요 ---------- */
(function () {
  var KAKAO = 'https://open.kakao.com/o/gZ4c0RWi';
  document.querySelectorAll('form[data-kakao-form]').forEach(function (form) {
    var phone = form.elements.phone, msg = form.querySelector('[data-form-msg]');
    if (!phone) return;
    phone.addEventListener('input', function () {           // 숫자만 받고 010-1234-5678 모양으로 맞춰요
      var d = phone.value.replace(/\D/g, '').slice(0, 11);
      phone.value = d.length < 4 ? d : d.length < 8 ? d.slice(0, 3) + '-' + d.slice(3) : d.slice(0, 3) + '-' + d.slice(3, d.length - 4) + '-' + d.slice(d.length - 4);
      phone.setCustomValidity('');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.value)) { phone.setCustomValidity('휴대폰 번호를 확인해 주세요. 예: 010-1234-5678'); phone.reportValidity(); return; }
      var win = window.open(KAKAO, '_blank', 'noopener');   // 누른 순간에 열어야 팝업 차단에 안 걸려요
      var body = new URLSearchParams(new FormData(form)).toString(), btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      function done(ok) {
        btn.disabled = false;
        if (msg) {
          msg.hidden = false;
          msg.innerHTML = (ok ? '신청이 접수됐어요. ' : '') + '카카오톡 상담방이 열리지 않았다면 <a href="' + KAKAO + '" target="_blank" rel="noopener" style="font-weight:700;text-decoration:underline">여기를 눌러 주세요</a>.';
        }
        if (ok) form.reset();
      }
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
        .then(function (r) { done(r.ok); }).catch(function () { done(false); });
    });
  });
})();

/* ---------- 아카데미 / 데스크 화면 전환 ---------- */
(function () {
  var TITLES = { academy: '딜러네 아카데미 | 기준부터 세우는 선물 트레이딩', desk: '딜러네 데스크 | 나스닥·골드·오일 매매 데스크' };
  var nav = document.getElementById('nav'), burger = document.querySelector('.burger');
  function closeMenu() { if (nav && nav.classList.contains('open')) { nav.classList.remove('open'); if (burger) burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; } }
  function viewOf(el) { var v = el && el.closest ? el.closest('.view') : null; return v ? v.getAttribute('data-view') : null; }
  function fromURL() {
    var q = new URLSearchParams(location.search).get('view');
    if (q === 'desk' || q === 'academy') return q;
    var h = location.hash.slice(1);
    if (h === 'desk' || h === 'academy') return h;
    if (h) { var v = viewOf(document.getElementById(h)); if (v) return v; }
    return 'desk';   // 첫 화면은 데스크
  }
  function apply(v) {
    document.body.setAttribute('data-view', v);
    document.title = TITLES[v];
    document.querySelectorAll('.vswitch [data-view-link]').forEach(function (a) {
      if (a.getAttribute('data-view-link') === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    requestAnimationFrame(function () {
      window.dispatchEvent(new Event('resize'));
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      try { window.dispatchEvent(new CustomEvent('dn:view', { detail: v })); } catch (e) {}
    });
  }
  function go(v, h) {
    apply(v);
    try { history.pushState({ view: v }, '', '#' + (h || v)); } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a') : null; if (!a) return;
    var vl = a.getAttribute('data-view-link');
    if (vl) {
      e.preventDefault(); closeMenu();
      var same = document.body.getAttribute('data-view') === vl;
      if (!same) go(vl);
      window.scrollTo({ top: 0, behavior: same ? 'smooth' : 'instant' });
      // 화면을 바꿀 때는 항상 맨 위에서 시작합니다 (CSS의 부드러운 스크롤이 중간에 끊겨 엉뚱한 위치에 멈추던 문제)
      if (!same) requestAnimationFrame(function () { requestAnimationFrame(function () { window.scrollTo({ top: 0, behavior: 'instant' }); }); });
      return;
    }
    var href = a.getAttribute('href') || '';
    if (href.charAt(0) !== '#' || href.length < 2) return;
    var el = document.getElementById(href.slice(1)), v = viewOf(el);
    if (v && v !== document.body.getAttribute('data-view')) {
      e.preventDefault(); closeMenu(); go(v, href.slice(1));
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.scrollIntoView({ behavior: 'auto', block: 'start' }); }); });
    }
  });
  function toHash() {
    var h = location.hash.slice(1), el = h && h !== 'desk' && h !== 'academy' ? document.getElementById(h) : null;
    if (el) requestAnimationFrame(function () { requestAnimationFrame(function () { el.scrollIntoView({ behavior: 'auto', block: 'start' }); }); });
  }
  function sync() { var v = fromURL(); if (v !== document.body.getAttribute('data-view')) { apply(v); toHash(); } }
  window.addEventListener('popstate', sync);
  window.addEventListener('hashchange', sync);
  apply(fromURL());
  window.addEventListener('load', toHash);   // #desk-platforms 같은 주소로 들어오면 그 섹션까지 내려가요
})();


/* ---------- 데스크: 스크롤하면 제목과 카드가 차례로 나타나요 ---------- */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  var els = [];
  document.querySelectorAll('.view-desk section').forEach(function (sec) {
    var wrap = sec.querySelector(':scope > div:not([aria-hidden])'); if (!wrap) return;
    [].slice.call(wrap.children).forEach(function (block) {
      var cards = block.querySelectorAll(':scope > article, :scope > form, :scope > div > article');
      if (cards.length > 1) [].forEach.call(cards, function (c, i) { c.style.setProperty('--rv-d', Math.min(i, 5) * 70 + 'ms'); els.push(c); });
      else els.push(block);
    });
  });
  if (!els.length) return;
  els.forEach(function (el) { el.setAttribute('data-rv', ''); });
  document.body.classList.add('rv-ready');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach(function (el) { io.observe(el); });
})();

/* ---------- 데스크 시그널 보드: 예시 차트 엔진 (TradingView Lightweight Charts) ----------
   실제 시세가 아닙니다. 종목마다 정해진 씨앗값으로 만든 300틱 시뮬레이션 캔들이 움직입니다.
   매수/매도 종목은 진입·손절·목표 선을 긋고, 대기 종목은 선 없이 차트만 보여 줍니다. */
(function () {
  var box = document.getElementById('deskChart'), LW = window.LightweightCharts;
  if (!box || !LW) return;                                   // 라이브러리를 못 불러오면 원래 그림(SVG)을 그대로 둡니다
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var INST = {
    nas:  { name: '나스닥100', sym: 'USA100 · US100Cash', side: 'buy',  base: 21480,  dec: 1, vol: 0.0011, seed: 11 },
    gold: { name: '골드',      sym: 'XAUUSD · GOLD',      side: 'sell', base: 2652,   dec: 1, vol: 0.0008, seed: 23 },
    wti:  { name: 'WTI 오일',  sym: 'USOIL · OILCash',    side: 'wait', base: 71.4,   dec: 2, vol: 0.0016, seed: 37 },
    spx:  { name: 'S&P500',    sym: 'USA500 · US500Cash', side: 'wait', base: 5920,   dec: 1, vol: 0.0008, seed: 41 },
    eur:  { name: 'EUR/USD',   sym: 'EURUSD',             side: 'wait', base: 1.0842, dec: 4, vol: 0.0005, seed: 53 },
    btc:  { name: '비트코인',   sym: 'BTCUSD',             side: 'wait', base: 96200,  dec: 0, vol: 0.0019, seed: 67 }
  };
  var SIDE = { buy: '매수', sell: '매도', wait: '대기' };
  var N = 70, STEP = 60, TPC = 300;                          // 캔들 수, 시간축 간격(표시 안 함), 캔들당 틱 수

  function rng(seed) { var s = seed * 2654435761 % 4294967296; return function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
  function fmt(v, dec) { return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }

  function build(cfg) {                                       // 종목별 캔들과 진입·손절·목표 값을 만듭니다
    var r = rng(cfg.seed), g = function () { return Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r()); };
    var t0 = Math.floor(Date.now() / 1000 / STEP) * STEP - N * STEP, px = cfg.base, data = [], rangeSum = 0;
    for (var i = 0; i < N; i++) {
      var o = px, h = o, l = o, c = o;
      for (var k = 0; k < 60; k++) { c = c * (1 + cfg.vol / Math.sqrt(60) * g() - 0.02 * Math.log(c / cfg.base) / 60); if (c > h) h = c; if (c < l) l = c; }
      px = c; rangeSum += h - l; data.push({ time: t0 + i * STEP, open: o, high: h, low: l, close: c });
    }
    var atr = rangeSum / N, entry = data[N - 12].close, lv = null;
    if (cfg.side === 'buy')  lv = { entry: entry, stop: entry - atr * 3.2, target: entry + atr * 6.4 };
    if (cfg.side === 'sell') lv = { entry: entry, stop: entry + atr * 3.2, target: entry - atr * 6.4 };
    return { data: data, lv: lv, r: r, g: g, last: data[N - 1], ticks: 0 };
  }

  box.innerHTML = '';
  var chart;
  try {
    chart = LW.createChart(box, {
      autoSize: true,
      layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#8B93A3', fontFamily: 'var(--font), sans-serif', fontSize: 11 },
      grid: { vertLines: { visible: false }, horzLines: { color: 'rgba(255,255,255,0.06)' } },
      crosshair: { vertLine: { visible: false, labelVisible: false }, horzLine: { visible: false, labelVisible: false } },
      rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.12, bottom: 0.12 } },
      timeScale: { visible: false, borderVisible: false, rightOffset: 6, barSpacing: 9 },
      handleScroll: false, handleScale: false
    });
  } catch (e) { return; }
  var series = chart.addCandlestickSeries({ upColor: '#F0556B', downColor: '#4B8BFF', borderUpColor: '#F0556B', borderDownColor: '#4B8BFF', wickUpColor: '#F0556B', wickDownColor: '#4B8BFF', priceLineVisible: true, priceLineColor: 'rgba(255,255,255,.35)', lastValueVisible: true });

  var state = {}, cur = null, lines = [];
  var el = { name: document.getElementById('dkName'), sym: document.getElementById('dkSym'), side: document.getElementById('dkSide'), entry: document.getElementById('dkEntry'), stop: document.getElementById('dkStop'), target: document.getElementById('dkTarget') };
  var btns = [].slice.call(document.querySelectorAll('.dk-inst'));

  function show(key) {
    var cfg = INST[key]; if (!cfg) return;
    cur = key; if (!state[key]) state[key] = build(cfg);
    var st = state[key];
    lines.forEach(function (l) { series.removePriceLine(l); }); lines = [];
    series.applyOptions({
      priceFormat: { type: 'price', precision: cfg.dec, minMove: 1 / Math.pow(10, cfg.dec) },
      autoscaleInfoProvider: function (orig) {              // 진입·손절·목표 선이 항상 화면 안에 들어오게 합니다
        var res = orig(); if (!res || !res.priceRange || !st.lv) return res;
        res.priceRange.minValue = Math.min(res.priceRange.minValue, st.lv.stop, st.lv.target);
        res.priceRange.maxValue = Math.max(res.priceRange.maxValue, st.lv.stop, st.lv.target);
        return res;
      }
    });
    series.setData(st.data);
    if (st.lv) {
      lines.push(series.createPriceLine({ price: st.lv.target, color: '#C5CBD8', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: '목표' }));
      lines.push(series.createPriceLine({ price: st.lv.entry, color: '#FFC247', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: '진입' }));
      lines.push(series.createPriceLine({ price: st.lv.stop, color: '#8FB4FF', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: '손절' }));
    }
    chart.timeScale().scrollToRealTime();
    if (el.name) el.name.textContent = cfg.name;
    if (el.sym) el.sym.textContent = cfg.sym;
    if (el.side) { el.side.textContent = SIDE[cfg.side]; el.side.className = 'dk-side ' + cfg.side; }
    if (el.entry) el.entry.textContent = st.lv ? fmt(st.lv.entry, cfg.dec) : '—';
    if (el.stop) el.stop.textContent = st.lv ? fmt(st.lv.stop, cfg.dec) : '—';
    if (el.target) el.target.textContent = st.lv ? fmt(st.lv.target, cfg.dec) : '—';
    btns.forEach(function (b) { var on = b.getAttribute('data-inst') === key; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  }
  btns.forEach(function (b) { b.addEventListener('click', function () { show(b.getAttribute('data-inst')); }); });
  show('nas');
  window.addEventListener('dn:inst', function (e) {            // 아래 종목 카드에서 보낸 요청
    show(e.detail);
    var on = document.querySelector('.dk-inst.on'); if (on && on.scrollIntoView && window.matchMedia('(max-width:760px)').matches) { var l = on.parentNode; l.scrollLeft = on.offsetLeft - l.offsetLeft - 12; }
  });

  /* 화면에 보일 때만 한 봉씩 움직입니다 */
  if (reduce) return;
  var visible = false, timer = null;
  function tick() {
    var cfg = INST[cur], st = state[cur]; if (!st) return;
    var b = st.last, n = 3 + Math.floor(Math.random() * 10);   // 한 번에 틱 3~12개
    for (var k = 0; k < n; k++) {
      var c = b.close * (1 + cfg.vol / Math.sqrt(TPC) * st.g() - 0.02 * Math.log(b.close / cfg.base) / TPC);
      st.ticks++;
      if (st.ticks >= TPC) {                                   // 300틱이 차면 새 캔들을 엽니다
        b.close = c; if (c > b.high) b.high = c; if (c < b.low) b.low = c; series.update(b);
        b = { time: b.time + STEP, open: c, high: c, low: c, close: c };
        st.data.push(b); if (st.data.length > 160) st.data.shift();
        st.ticks = 0;
      } else { b.close = c; if (c > b.high) b.high = c; if (c < b.low) b.low = c; }
    }
    st.last = b; series.update(b);
  }
  function run() { if (!timer && visible) timer = setInterval(tick, 60); }
  function halt() { clearInterval(timer); timer = null; }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[e.length - 1].isIntersecting; visible ? run() : halt(); }).observe(box);
  else { visible = true; run(); }
  window.addEventListener('dn:view', function (e) {
    if (e.detail === 'desk') { requestAnimationFrame(function () { chart.timeScale().scrollToRealTime(); var r = box.getBoundingClientRect(); visible = r.bottom > 0 && r.top < window.innerHeight; run(); }); }
    else { visible = false; halt(); }
  });
  document.addEventListener('visibilitychange', function () { document.hidden ? halt() : run(); });
})();

/* ---------- 폰 하단 고정 버튼: 첫 화면을 지나면 보이고, 상담 폼이 화면에 있으면 숨깁니다 ---------- */
(function () {
  var dock = document.getElementById('dock'); if (!dock) return;
  var mq = window.matchMedia('(max-width:760px)'), tick = false;
  function formInView() {
    var v = document.body.getAttribute('data-view'), f = document.getElementById(v === 'desk' ? 'desk-apply' : 'apply'); if (!f) return false;
    var r = f.getBoundingClientRect(); return r.top < window.innerHeight * 0.85 && r.bottom > 80;
  }
  function update() {
    tick = false;
    var on = mq.matches && window.scrollY > window.innerHeight * 0.6 && !formInView();
    dock.classList.toggle('show', on);
    document.body.classList.toggle('dock-on', mq.matches);
  }
  function req() { if (!tick) { tick = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  window.addEventListener('dn:view', req);
  update();
})();

/* ---------- 거래 종목 카드: 미니 차트(예시)와 '보드에서 보기' ----------
   미니 차트는 실제 시세가 아닙니다. 카드마다 정해진 씨앗값으로 만든 선이 왼쪽으로 부드럽게 흘러갑니다.
   오르내림을 색으로 구분하지 않고 한 가지 색으로만 그립니다(성과처럼 보이지 않게). */
(function () {
  var canvases = [].slice.call(document.querySelectorAll('canvas.dk-spark')); if (!canvases.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SEED = { nas: 11, gold: 23, wti: 37, spx: 41, eur: 53, btc: 67 }, N = 44, STEP_MS = 900;   // 점 하나가 지나가는 시간
  function rng(seed) { var s = seed * 2654435761 % 4294967296; return function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
  var items = canvases.map(function (cv, idx) {
    var r = rng(SEED[cv.getAttribute('data-spark')] || 7), pts = [], v = 0;
    function next() { v += (r() + r() + r() - 1.5) * 0.9 - v * 0.06; return v; }
    for (var i = 0; i < N + 2; i++) pts.push(next());          // 화면 밖에 한 점을 더 두고 흘려보냅니다
    return { cv: cv, ctx: cv.getContext('2d'), pts: pts, next: next, w: 0, h: 0, lo: null, hi: null, phase: idx * 0.17 };
  });
  function size(it) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2), b = it.cv.getBoundingClientRect();
    if (!b.width || !b.height) return false;
    it.w = b.width; it.h = b.height; it.cv.width = Math.round(b.width * dpr); it.cv.height = Math.round(b.height * dpr);
    it.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); return true;
  }
  /* f: 0~1, 다음 점으로 넘어가는 진행도. 선 전체가 f만큼 왼쪽으로 밀리고, 세로 범위도 천천히 따라갑니다. */
  function draw(it, f, ease) {
    if (!it.w && !size(it)) return;
    var c = it.ctx, w = it.w, h = it.h, p = it.pts, pad = 7, n = N;
    var vis = p.slice(0, n + 1), tLo = Math.min.apply(null, vis), tHi = Math.max.apply(null, vis);
    if (it.lo === null || !ease) { it.lo = tLo; it.hi = tHi; } else { it.lo += (tLo - it.lo) * 0.06; it.hi += (tHi - it.hi) * 0.06; }
    var span = (it.hi - it.lo) || 1, dx = (w - pad * 2 - 5) / (n - 1);
    function X(i) { return pad + (i - f) * dx; }
    function Y(v) { return pad + (h - pad * 2) * (1 - (v - it.lo) / span); }
    var headV = p[n - 1] + (p[n] - p[n - 1]) * f, headX = pad + (n - 1) * dx, headY = Y(headV);   // 오른쪽 끝 점은 제자리에서 위아래로만 움직입니다
    c.clearRect(0, 0, w, h);
    c.save(); c.beginPath(); c.rect(pad - 1, 0, headX - pad + 1.5, h); c.clip();
    c.beginPath(); c.moveTo(X(0), Y(p[0]));
    for (var i = 1; i < n; i++) { var mx = (X(i - 1) + X(i)) / 2, my = (Y(p[i - 1]) + Y(p[i])) / 2; c.quadraticCurveTo(X(i - 1), Y(p[i - 1]), mx, my); }   // 꺾이지 않게 곡선으로 잇습니다
    c.quadraticCurveTo(X(n - 1), Y(p[n - 1]), headX, headY);
    c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = 2; c.strokeStyle = '#FFC247'; c.stroke();
    var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,194,71,.24)'); g.addColorStop(1, 'rgba(255,194,71,0)');
    c.lineTo(headX, h); c.lineTo(X(0), h); c.closePath(); c.fillStyle = g; c.fill();
    c.restore();
    c.beginPath(); c.arc(headX, headY, 6, 0, Math.PI * 2); c.fillStyle = 'rgba(255,194,71,.22)'; c.fill();
    c.beginPath(); c.arc(headX, headY, 3, 0, Math.PI * 2); c.fillStyle = '#FFC247'; c.fill();
  }
  function drawAll() { items.forEach(function (it) { it.w = 0; it.lo = null; draw(it, 0, false); }); }
  drawAll();
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(drawAll, 150); });
  window.addEventListener('dn:view', function (e) { if (e.detail === 'desk') requestAnimationFrame(drawAll); });

  if (!reduce) {
    var sec = document.getElementById('desk-instruments'), visible = false, raf = null, last = 0;
    function frame(ts) {
      raf = null; if (!visible || document.hidden) return;
      var dt = last ? Math.min(ts - last, 100) : 16; last = ts;   // 탭을 떠났다 돌아와도 튀지 않게 한 번에 0.1초까지만
      items.forEach(function (it) {
        it.phase += dt / STEP_MS;
        while (it.phase >= 1) { it.phase -= 1; it.pts.push(it.next()); it.pts.shift(); }
        draw(it, it.phase, true);
      });
      raf = requestAnimationFrame(frame);
    }
    function run() { if (!raf && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
    function halt() { if (raf) cancelAnimationFrame(raf); raf = null; }
    if ('IntersectionObserver' in window && sec) new IntersectionObserver(function (e) { visible = e[e.length - 1].isIntersecting; visible ? run() : halt(); }).observe(sec);
    else { visible = true; run(); }
    document.addEventListener('visibilitychange', function () { document.hidden ? halt() : run(); });
    window.addEventListener('dn:view', function (e) { if (e.detail !== 'desk') { visible = false; halt(); } });
  }

  /* 카드를 누르면 위 시그널 보드에서 그 종목을 크게 보여 줍니다 */
  function open(card) {
    var key = card.getAttribute('data-inst-card'), board = document.querySelector('.dk-board');
    try { window.dispatchEvent(new CustomEvent('dn:inst', { detail: key })); } catch (e) {}
    if (board) board.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }
  [].forEach.call(document.querySelectorAll('[data-inst-card]'), function (card) {
    card.addEventListener('click', function () { open(card); });
    card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card); } });
  });
})();

/* ---------- 줄바꿈 다듬기: 쉼표·마침표 단위로 문장을 묶습니다 ----------
   묶음(.ph)은 한 줄에 들어가면 쪼개지지 않기 때문에, 줄이 바뀔 때 구절 중간이 아니라 구절 사이에서 바뀝니다.
   숫자 안의 쉼표·마침표(10,000.00)는 뒤에 띄어쓰기가 없어서 건드리지 않습니다. */
(function () {
  var SKIP = '#lib, .risk, .fine, .foot, footer, form, dialog, [aria-hidden="true"], .chart-note, .dk-board, .tbl, svg';
  var els = document.querySelectorAll('.view p, .view h3, .view li, .view dd, .view summary, .bridge p');
  [].forEach.call(els, function (el) {
    if (el.closest(SKIP) || el.querySelector('p, li, div, article, .ph')) return;
    var disp = getComputedStyle(el).display;
    if (disp.indexOf('flex') > -1 || disp.indexOf('grid') > -1) return;   // 플렉스 안에서는 묶음이 따로 놀아서 제외
    [].slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType !== 3) return;
      var text = node.textContent; if (text.trim().length < 12) return;
      var parts = text.replace(/([,.!?])\s+(?=\S)/g, '$1\u0000').split('\u0000');
      for (var i = 0; i < parts.length - 1; i++) {                       // 너무 짧은 조각은 다음 조각에 붙입니다
        if (parts[i].trim().length < 5) { parts[i + 1] = parts[i] + ' ' + parts[i + 1]; parts.splice(i, 1); i--; }
      }
      if (parts.length < 2) return;
      var frag = document.createDocumentFragment();
      parts.forEach(function (part, i) {
        var lead = /^\s/.test(part) && i === 0 ? ' ' : '', tail = i === parts.length - 1 && /\s$/.test(part) ? ' ' : '';
        if (lead) frag.appendChild(document.createTextNode(' '));
        var s = document.createElement('span'); s.className = 'ph'; s.textContent = part.trim(); frag.appendChild(s);
        frag.appendChild(document.createTextNode(i < parts.length - 1 ? ' ' : tail));
      });
      el.replaceChild(frag, node);
    });
  });
})();
