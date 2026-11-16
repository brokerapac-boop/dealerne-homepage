(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KAKAO = 'https://open.kakao.com/o/gZ4c0RWi';

  /* ---------- 측정 ---------- */
  window.dataLayer = window.dataLayer || []; window.__events = [];
  function track(name, params) { var ev = { event: name }; for (var k in params) ev[k] = params[k]; window.dataLayer.push(ev); window.__events.push(ev); }
  [].forEach.call(document.querySelectorAll('[data-tg]'), function (a) { a.addEventListener('click', function () { track('telegram_click', { location: a.getAttribute('data-tg') }); }); });
  [].forEach.call(document.querySelectorAll('[data-track]'), function (a) { a.addEventListener('click', function () { track(a.getAttribute('data-track') + '_click', {}); }); });

  /* ---------- 시그널 보드: 300틱 시뮬레이션 (실제 시세와 시그널이 아님) ---------- */
  (function () {
    var box = document.getElementById('tgChart'), LW = window.LightweightCharts; if (!box || !LW) return;
    var INST = {
      nas:  { name: '나스닥100', sym: 'USA100 · US100Cash', side: 'buy',  base: 21480,  dec: 1, vol: 0.0011, seed: 11 },
      gold: { name: '골드',      sym: 'XAUUSD · GOLD',      side: 'sell', base: 2652,   dec: 1, vol: 0.0008, seed: 23 },
      wti:  { name: 'WTI 오일',  sym: 'USOIL · OILCash',    side: 'wait', base: 71.4,   dec: 2, vol: 0.0016, seed: 37 },
      spx:  { name: 'S&P500',    sym: 'USA500 · US500Cash', side: 'wait', base: 5920,   dec: 1, vol: 0.0008, seed: 41 },
      eur:  { name: 'EUR/USD',   sym: 'EURUSD',             side: 'wait', base: 1.0842, dec: 4, vol: 0.0005, seed: 53 },
      btc:  { name: '비트코인',   sym: 'BTCUSD',             side: 'wait', base: 96200,  dec: 0, vol: 0.0019, seed: 67 }
    };
    var SIDE = { buy: '매수', sell: '매도', wait: '대기' }, N = 64, STEP = 60, TPC = 300;
    function rng(seed) { var s = seed * 2654435761 % 4294967296; return function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
    function fmt(v, dec) { return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
    function build(cfg) {
      var r = rng(cfg.seed), g = function () { return Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r()); };
      var t0 = Math.floor(Date.now() / 1000 / STEP) * STEP - N * STEP, px = cfg.base, data = [], sum = 0;
      for (var i = 0; i < N; i++) {
        var o = px, h = o, l = o, c = o;
        for (var k = 0; k < 60; k++) { c = c * (1 + cfg.vol / Math.sqrt(60) * g() - 0.02 * Math.log(c / cfg.base) / 60); if (c > h) h = c; if (c < l) l = c; }
        px = c; sum += h - l; data.push({ time: t0 + i * STEP, open: o, high: h, low: l, close: c });
      }
      var atr = sum / N, entry = data[N - 12].close, lv = null;
      if (cfg.side === 'buy') lv = { entry: entry, stop: entry - atr * 3.2, target: entry + atr * 6.4 };
      if (cfg.side === 'sell') lv = { entry: entry, stop: entry + atr * 3.2, target: entry - atr * 6.4 };
      return { data: data, lv: lv, g: g, last: data[N - 1], ticks: 0 };
    }
    var chart;
    try {
      chart = LW.createChart(box, {
        autoSize: true,
        layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#8B93A3', fontSize: 11 },
        grid: { vertLines: { visible: false }, horzLines: { color: 'rgba(255,255,255,0.06)' } },
        crosshair: { vertLine: { visible: false, labelVisible: false }, horzLine: { visible: false, labelVisible: false } },
        rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.14, bottom: 0.14 } },
        timeScale: { visible: false, borderVisible: false, rightOffset: 5, barSpacing: 8 },
        handleScroll: false, handleScale: false
      });
    } catch (e) { return; }
    var series = chart.addCandlestickSeries({ upColor: '#F0556B', downColor: '#4B8BFF', borderUpColor: '#F0556B', borderDownColor: '#4B8BFF', wickUpColor: '#F0556B', wickDownColor: '#4B8BFF', priceLineColor: 'rgba(255,255,255,.35)' });
    var state = {}, cur = 'nas', lines = [], tabs = [].slice.call(document.querySelectorAll('.board .tab'));
    var el = function (id) { return document.getElementById(id); };
    function show(key) {
      var cfg = INST[key]; if (!cfg) return;
      cur = key; if (!state[key]) state[key] = build(cfg);
      var st = state[key];
      lines.forEach(function (l) { series.removePriceLine(l); }); lines = [];
      series.applyOptions({
        priceFormat: { type: 'price', precision: cfg.dec, minMove: 1 / Math.pow(10, cfg.dec) },
        autoscaleInfoProvider: function (orig) {
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
      el('bName').textContent = cfg.name; el('bSym').textContent = cfg.sym;
      el('bSide').textContent = SIDE[cfg.side]; el('bSide').className = 'sg ' + cfg.side;
      el('bEntry').textContent = st.lv ? fmt(st.lv.entry, cfg.dec) : '—';
      el('bStop').textContent = st.lv ? fmt(st.lv.stop, cfg.dec) : '—';
      el('bTarget').textContent = st.lv ? fmt(st.lv.target, cfg.dec) : '—';
      tabs.forEach(function (t) { var on = t.getAttribute('data-inst') === key; t.classList.toggle('on', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); if (on && t.parentNode.scrollWidth > t.parentNode.clientWidth) t.parentNode.scrollLeft = t.offsetLeft - t.parentNode.offsetLeft - 12; });
    }
    tabs.forEach(function (t) { t.addEventListener('click', function () { show(t.getAttribute('data-inst')); }); });
    [].forEach.call(document.querySelectorAll('[data-card]'), function (c) {       // 종목 카드를 누르면 보드에서 그 종목을 보여 줍니다
      c.addEventListener('click', function () { show(c.getAttribute('data-card')); document.querySelector('.board').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); });
    });
    show('nas');
    if (reduce) return;
    var visible = false, timer = null;
    function tick() {
      var cfg = INST[cur], st = state[cur], b = st.last, n = 3 + Math.floor(Math.random() * 10);
      for (var k = 0; k < n; k++) {
        var c = b.close * (1 + cfg.vol / Math.sqrt(TPC) * st.g() - 0.02 * Math.log(b.close / cfg.base) / TPC);
        st.ticks++;
        if (st.ticks >= TPC) {
          b.close = c; if (c > b.high) b.high = c; if (c < b.low) b.low = c; series.update(b);
          b = { time: b.time + STEP, open: c, high: c, low: c, close: c };
          st.data.push(b); if (st.data.length > 160) st.data.shift(); st.ticks = 0;
        } else { b.close = c; if (c > b.high) b.high = c; if (c < b.low) b.low = c; }
      }
      st.last = b; series.update(b);
    }
    function run() { if (!timer && visible && !document.hidden) timer = setInterval(tick, 60); }
    function halt() { clearInterval(timer); timer = null; }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[e.length - 1].isIntersecting; visible ? run() : halt(); }).observe(box);
    else { visible = true; run(); }
    document.addEventListener('visibilitychange', function () { document.hidden ? halt() : run(); });
  })();

  /* ---------- 상담 폼 2개: 접수한 뒤 카카오톡 상담방을 엽니다 (실제 사이트와 같은 동작) ---------- */
  [].forEach.call(document.querySelectorAll('form[data-kakao-form]'), function (form) {
    var phone = form.elements.phone, msg = form.querySelector('[data-form-msg]');
    phone.addEventListener('input', function () {
      var d = phone.value.replace(/\D/g, '').slice(0, 11);
      phone.value = d.length < 4 ? d : d.length < 8 ? d.slice(0, 3) + '-' + d.slice(3) : d.slice(0, 3) + '-' + d.slice(3, d.length - 4) + '-' + d.slice(d.length - 4);
      phone.setCustomValidity('');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.value)) { phone.setCustomValidity('휴대폰 번호를 확인해 주세요. 예: 010-1234-5678'); phone.reportValidity(); return; }
      window.open(KAKAO, '_blank', 'noopener');
      track('form_submit', { form: form.getAttribute('name') });
      var body = new URLSearchParams(new FormData(form)).toString(), btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      function done(ok) {
        btn.disabled = false; msg.hidden = false;
        msg.innerHTML = (ok ? '신청이 접수됐어요. ' : '') + '카카오톡 상담방이 열리지 않았다면 <a href="' + KAKAO + '" target="_blank" rel="noopener">여기를 눌러 주세요</a>.';
        if (ok) form.reset();
      }
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body }).then(function (r) { done(r.ok); }).catch(function () { done(false); });
    });
  });

  /* ---------- 폰 하단 고정 버튼: 첫 화면을 지나면 보이고, 상담 폼이 보이면 숨습니다 ---------- */
  (function () {
    var bar = document.getElementById('bar'), apply = document.getElementById('apply'), heroBtn = document.querySelector('.hero .btn-main'), tick = false;
    function update() {
      tick = false;
      var a = apply.getBoundingClientRect(), inForm = a.top < window.innerHeight * 0.85 && a.bottom > 80;
      bar.classList.toggle('show', heroBtn.getBoundingClientRect().bottom < 0 && !inForm);
    }
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update); update();
  })();

  /* ---------- 스크롤 등장 ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    var els = [].slice.call(document.querySelectorAll('.sec h2, .sec .eyebrow, .sec-lead, .insts li, .gets li, .acct, .missions li, .plats > li, .hts, .fcard, .final h2'));
    els.forEach(function (e2) { e2.classList.add('rv'); });
    document.documentElement.classList.add('rv-on');
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    els.forEach(function (e2) { io.observe(e2); });
  }
})();
