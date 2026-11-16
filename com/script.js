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

  /* ---------- live 1-minute candle simulation (TradingView Lightweight Charts) ----------
     Data is generated from log returns with volatility clustering. To use a real feed,
     replace nextSub()/history() with an adapter (see README note) - the chart code stays the same. */
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
    var SUB = 16, SIG = 0.0005, KAPPA = 0.025;  // per-candle sigma (log), sub-steps, mean reversion
    function volNow() { return SIG * Math.exp(h); }
    function step(r, p) {                       // one sub-step of the log-return walk (mean-reverting around 100)
      var z = gauss(r);
      return Math.exp((0.00002 - KAPPA * Math.log(p / 100)) / SUB + volNow() / Math.sqrt(SUB) * z);
    }
    function bumpVol(r) { h = 0.93 * h + 0.32 * gauss(r); if (h > 1.0) h = 1.0; if (h < -0.8) h = -0.8; }
    function buildCandle(time, r) {
      var o = price, hi = o, lo = o, c = o;
      for (var k = 0; k < SUB; k++) { c = c * step(r, c); if (c > hi) hi = c; if (c < lo) lo = c; }
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

    // live candle (a "minute" is accelerated to ~6s of real time)
    var cur = { time: t0 + HIST * 60, open: price, high: price, low: price, close: price }, ticks = 0, lastRebase = 0;
    var Rl = Math.random;
    function tick() {
      cur.close = cur.close * step(Rl, cur.close);
      if (cur.close > cur.high) cur.high = cur.close;
      if (cur.close < cur.low) cur.low = cur.close;
      series.update(cur);
      price = cur.close; ticks++;
      if (ticks >= SUB) {
        bumpVol(Rl); ticks = 0;
        cur = { time: cur.time + 60, open: cur.close, high: cur.close, low: cur.close, close: cur.close };
        if (price <= stop || price >= target) setLines();   // stop/target reached: set the next plan
      }
    }
    if (reduce) return true;                    // static snapshot for reduced-motion
    var timer = null, visible = true;
    function run() { if (!timer && visible && !document.hidden) timer = setInterval(tick, 380); }
    function halt() { clearInterval(timer); timer = null; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; visible ? run() : halt(); }).observe(wrap);
    }
    document.addEventListener('visibilitychange', function () { document.hidden ? halt() : run(); });
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
    return 'academy';
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
      window.scrollTo({ top: 0, behavior: same ? 'smooth' : 'auto' });
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

