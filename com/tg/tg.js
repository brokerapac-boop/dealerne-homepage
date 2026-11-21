(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 측정: 어떤 버튼이 눌렸는지 기록합니다 (GA4를 연결하면 그대로 전송됩니다) ---------- */
  window.dataLayer = window.dataLayer || [];
  window.__events = [];
  function track(name, params) {
    var ev = { event: name }; for (var k in params) ev[k] = params[k];
    window.dataLayer.push(ev); window.__events.push(ev);
  }
  [].forEach.call(document.querySelectorAll('[data-tg]'), function (a) {
    a.addEventListener('click', function () { track('telegram_click', { location: a.getAttribute('data-tg') }); });
  });
  [].forEach.call(document.querySelectorAll('[data-track]'), function (a) {
    a.addEventListener('click', function () { track(a.getAttribute('data-track') + '_click', {}); });
  });

  /* ---------- 예시 차트: 300틱 시뮬레이션 (실제 시세 아님, 매수·매도 표시 없음) ---------- */
  (function () {
    var box = document.getElementById('tgChart'), LW = window.LightweightCharts; if (!box || !LW) return;
    var INST = {
      nas:  { base: 21480, dec: 1, vol: 0.0011, seed: 11 },
      gold: { base: 2652,  dec: 1, vol: 0.0008, seed: 23 },
      wti:  { base: 71.4,  dec: 2, vol: 0.0016, seed: 37 }
    };
    var N = 64, STEP = 60, TPC = 300;
    function rng(seed) { var s = seed * 2654435761 % 4294967296; return function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
    function build(cfg) {
      var r = rng(cfg.seed), g = function () { return Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r()); };
      var t0 = Math.floor(Date.now() / 1000 / STEP) * STEP - N * STEP, px = cfg.base, data = [];
      for (var i = 0; i < N; i++) {
        var o = px, h = o, l = o, c = o;
        for (var k = 0; k < 60; k++) { c = c * (1 + cfg.vol / Math.sqrt(60) * g() - 0.02 * Math.log(c / cfg.base) / 60); if (c > h) h = c; if (c < l) l = c; }
        px = c; data.push({ time: t0 + i * STEP, open: o, high: h, low: l, close: c });
      }
      return { data: data, g: g, last: data[N - 1], ticks: 0 };
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
    var state = {}, cur = 'nas', tabs = [].slice.call(document.querySelectorAll('.tab'));
    function show(key) {
      cur = key; if (!state[key]) state[key] = build(INST[key]);
      var cfg = INST[key];
      series.applyOptions({ priceFormat: { type: 'price', precision: cfg.dec, minMove: 1 / Math.pow(10, cfg.dec) } });
      series.setData(state[key].data); chart.timeScale().scrollToRealTime();
      tabs.forEach(function (t) { var on = t.getAttribute('data-inst') === key; t.classList.toggle('on', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); });
    }
    tabs.forEach(function (t) { t.addEventListener('click', function () { show(t.getAttribute('data-inst')); track('chart_tab', { inst: t.getAttribute('data-inst') }); }); });
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

  /* ---------- 영상: 눌렀을 때만 유튜브를 불러옵니다 ---------- */
  var vm = document.getElementById('vmodal'), vf = document.getElementById('vframe');
  [].forEach.call(document.querySelectorAll('[data-video]'), function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-video'); track('video_open', { video: id });
      vf.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1" title="' + (b.getAttribute('aria-label') || '영상') + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      if (vm.showModal) vm.showModal(); else vm.setAttribute('open', '');
    });
  });
  function closeVideo() { vf.innerHTML = ''; if (vm.close) vm.close(); else vm.removeAttribute('open'); }
  vm.querySelector('[data-close]').addEventListener('click', closeVideo);
  vm.addEventListener('close', function () { vf.innerHTML = ''; });
  vm.addEventListener('click', function (e) { if (e.target === vm) closeVideo(); });

  /* ---------- 폰 하단 고정 버튼 ---------- */
  (function () {
    var bar = document.getElementById('bar'), fin = document.getElementById('final'), heroBtn = document.querySelector('.hero .btn-main'); if (!bar) return;
    var tick = false;
    function update() {
      tick = false;
      var past = heroBtn.getBoundingClientRect().bottom < 0, f = fin.getBoundingClientRect(), atEnd = f.top < window.innerHeight * 0.7;
      bar.classList.toggle('show', past && !atEnd && !vm.open);
    }
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* ---------- 스크롤 등장 ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    var els = [].slice.call(document.querySelectorAll('.sec h2, .sec .eyebrow, .gets li, .vid, .nots li, .steps li, .lot, .faq, .final h2'));
    els.forEach(function (el) { el.classList.add('rv'); });
    document.documentElement.classList.add('rv-on');
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    els.forEach(function (el) { io.observe(el); });
  }
})();
