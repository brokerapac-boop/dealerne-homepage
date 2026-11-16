/* 딜러네 스크롤 시안
   - 화면 가운데에 있는 구역의 톤(밝음/어두움)으로 전체 배경을 바꿉니다
   - 고정된 폰 화면은 옆(아래) 설명 단계에 맞춰 바뀝니다
   - 차트는 모두 시뮬레이션이며 실제 시세가 아닙니다 */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 떠오르기 ---------- */
  var ups = $$('.up');
  if (reduce || !('IntersectionObserver' in window)) ups.forEach(function (e) { e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    ups.forEach(function (e) { if (!e.closest('.insts')) io.observe(e); });
    // 가로로 넘기는 종목 카드는 목록이 보이면 한꺼번에 나타남
    var il = $('.insts');
    if (il) {
      var io2 = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { $$('.up', il).forEach(function (e) { e.classList.add('in'); }); io2.disconnect(); }
      }, { threshold: 0.15 });
      io2.observe(il);
    }
  }

  /* ---------- 스크롤에 따른 상태 ---------- */
  var tones = $$('[data-tone]').filter(function (e) { return e !== document.body; });
  var steps = $$('.step'), screens = $$('.screen'), dots = $$('.phone-dots i');
  var heroIn = $('#heroIn'), hero = $('.hero'), road = $$('#roadList li');
  var active = -1, tick = false, mq = window.matchMedia('(max-width:820px)');

  function setStep(i) {
    if (i === active) return; active = i;
    steps.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    screens.forEach(function (s, k) { s.classList.toggle('on', k === i); s.classList.toggle('past', k < i); });
    dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
  }

  function update() {
    tick = false;
    var vh = window.innerHeight, mid = vh * 0.5;

    // 배경 톤
    var tone = null;
    for (var i = 0; i < tones.length; i++) {
      var r = tones[i].getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) { tone = tones[i].getAttribute('data-tone'); break; }
    }
    if (tone && document.body.getAttribute('data-tone') !== tone) document.body.setAttribute('data-tone', tone);

    // 첫 화면: 내려가면 글이 살짝 올라가며 흐려짐
    if (!reduce && heroIn) {
      var p = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * 0.8)));
      heroIn.style.transform = 'translate3d(0,' + (-p * 60) + 'px,0) scale(' + (1 - p * 0.06) + ')';
      heroIn.style.opacity = String(1 - p);
    }

    // 고정 화면 단계: 기준선에 가장 가까운 설명
    var line = mq.matches ? vh * 0.74 : mid, best = 0, bd = Infinity;
    steps.forEach(function (s, k) {
      var b = s.getBoundingClientRect(), c = mq.matches ? b.top + 70 : b.top + b.height / 2, d = Math.abs(c - line);
      if (d < bd) { bd = d; best = k; }
    });
    setStep(best);

    // 로드맵: 지나간 만큼 위 선이 켜짐
    if (road.length) {
      var rr = road[0].parentNode.getBoundingClientRect(), prog = (vh * 0.8 - rr.top) / (rr.height + vh * 0.3);
      road.forEach(function (li, k) { li.classList.toggle('lit', prog > (k + 0.5) / road.length); });
    }
  }
  function req() { if (!tick) { tick = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  update();

  /* ---------- 숫자 올라가기 (예시 가격) ---------- */
  var lv = $('#lv');
  function fmt(n) { return n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
  if (lv && !reduce && 'IntersectionObserver' in window) {
    var cells = $$('[data-count]', lv);
    cells.forEach(function (c) { c.textContent = fmt(+c.getAttribute('data-count') * 0.985); });
    var co = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; co.disconnect();
      var t0 = performance.now(), D = 1400;
      (function run(t) {
        var k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 4);
        cells.forEach(function (c) { var v = +c.getAttribute('data-count'); c.textContent = fmt(v * (0.985 + 0.015 * e)); });
        if (k < 1) requestAnimationFrame(run);
      })(t0);
    }, { threshold: 0.3 });
    co.observe(lv);
  }

  /* ---------- 300틱 시뮬레이션 캔들 차트 ---------- */
  function Chart(cv, opt) {
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1;
    var candles = [], cur = null, price = opt.start, ticks = 0, TPC = 300, seed = opt.seed || 7;
    var vol = opt.start * 0.00018, drift = 0, visible = false, timer = null, raf = 0;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    function step(n) {
      for (var i = 0; i < n; i++) {
        if (rnd() < 0.004) drift = (rnd() - 0.5) * vol * 0.5;
        // 가격이 예시 범위(손절~목표 근처)를 벗어나면 안쪽으로 당김
        var pull = opt.lo && opt.hi ? ((opt.lo + opt.hi) / 2 - price) * 0.0009 : 0;
        price += (rnd() - 0.5) * vol * 2 + drift + pull;
        if (!cur) cur = { o: price, h: price, l: price, c: price };
        cur.c = price; if (price > cur.h) cur.h = price; if (price < cur.l) cur.l = price;
        if (++ticks >= TPC) { candles.push(cur); cur = null; ticks = 0; if (candles.length > 140) candles.shift(); }
      }
    }
    function size() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      var r = cv.getBoundingClientRect(); W = Math.round(r.width); H = Math.round(r.height);
      if (!W || !H) return;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw() {
      raf = 0; if (!W || !H) return;
      ctx.clearRect(0, 0, W, H);
      var all = cur ? candles.concat([cur]) : candles, cw = opt.cw || 10, n = Math.min(all.length, Math.floor((W - (opt.pad || 0)) / cw));
      var view = all.slice(all.length - n), lo = Infinity, hi = -Infinity;
      view.forEach(function (c) { if (c.l < lo) lo = c.l; if (c.h > hi) hi = c.h; });
      (opt.lines || []).forEach(function (l) { if (l.v < lo) lo = l.v; if (l.v > hi) hi = l.v; });
      var padY = (hi - lo) * 0.12 || 1; lo -= padY; hi += padY;
      var y = function (v) { return H - (v - lo) / (hi - lo) * H; };
      (opt.lines || []).forEach(function (l) {
        ctx.strokeStyle = l.c; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(0, Math.round(y(l.v)) + .5); ctx.lineTo(W, Math.round(y(l.v)) + .5); ctx.stroke(); ctx.setLineDash([]);
        if (opt.labels) {
          ctx.font = '700 11px Pretendard Variable, sans-serif'; var tw = ctx.measureText(l.t).width + 14;
          ctx.fillStyle = l.c; ctx.fillRect(W - tw, y(l.v) - 9, tw, 18);
          ctx.fillStyle = '#0B0E15'; ctx.textBaseline = 'middle'; ctx.fillText(l.t, W - tw + 7, y(l.v) + 1);
        }
      });
      var x0 = W - (opt.pad || 0) - n * cw;
      view.forEach(function (c, i) {
        var up = c.c >= c.o, x = x0 + i * cw + cw / 2;
        ctx.strokeStyle = ctx.fillStyle = up ? '#F0556B' : '#4B8BFF';
        ctx.beginPath(); ctx.moveTo(Math.round(x) + .5, y(c.h)); ctx.lineTo(Math.round(x) + .5, y(c.l)); ctx.stroke();
        var top = y(Math.max(c.o, c.c)), h = Math.max(1, Math.abs(y(c.o) - y(c.c)));
        ctx.fillRect(Math.round(x - cw * 0.32), top, Math.max(2, Math.round(cw * 0.64)), h);
      });
    }
    function loop() { step(3 + Math.floor(rnd() * 10)); if (!raf) raf = requestAnimationFrame(draw); }
    function start() { if (!timer && visible && !reduce && !document.hidden) timer = setInterval(loop, 60); }
    function stop() { clearInterval(timer); timer = null; }
    step(TPC * 90 + 120); size(); draw();
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) { size(); draw(); start(); } else stop(); }).observe(cv);
    else { visible = true; start(); }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); draw(); }, 150); });
  }

  var LINES = [{ v: 21853.6, c: '#C5CBD8', t: '목표' }, { v: 21621.3, c: '#FFC247', t: '진입' }, { v: 21505.2, c: '#8FB4FF', t: '손절' }];
  var R = { start: 21640, lo: 21505.2, hi: 21853.6 };
  if ($('#heroCv')) Chart($('#heroCv'), { start: 100, seed: 11, cw: 14 });
  if ($('#phoneCv')) Chart($('#phoneCv'), { start: R.start, lo: R.lo, hi: R.hi, seed: 23, cw: 7, lines: LINES });
  if ($('#boardCv')) Chart($('#boardCv'), { start: R.start, lo: R.lo, hi: R.hi, seed: 5, cw: 11, pad: 56, lines: LINES, labels: true });
})();
