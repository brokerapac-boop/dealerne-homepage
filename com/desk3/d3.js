(function () {
  'use strict';
  var KAKAO = 'https://open.kakao.com/o/gZ4c0RWi';
  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 기록 (5장): 단계별로 남깁니다. 측정 도구가 연결되면 dataLayer 를 읽어 갑니다 ---------- */
  window.dataLayer = window.dataLayer || [];
  function setUnits(el, parts) { el.textContent = ''; parts.forEach(function (x, i) { if (i) el.appendChild(document.createTextNode(' ')); var sp = document.createElement('span'); sp.className = 's'; sp.textContent = x; el.appendChild(sp); }); }
  function track(name, data) { window.dataLayer.push(Object.assign({ event: name, page: 'desk3' }, data || {})); }
  /* 들어온 길(3-8): 링크에 붙은 출처 표시를 기록하고, 상담 신청에도 함께 남깁니다 */
  var SRC = '';
  try {
    var q = new URLSearchParams(location.search);
    SRC = (q.get('utm_source') || q.get('src') || '').slice(0, 40).replace(/[^\w\-.가-힣]/g, '');
    if (!SRC && document.referrer) { var h = new URL(document.referrer).hostname; SRC = /youtube|youtu\.be/.test(h) ? 'youtube' : /t\.me|telegram/.test(h) ? 'telegram' : /kakao/.test(h) ? 'kakao' : /dealerne/.test(h) ? '' : h.slice(0, 40); }
    if (SRC) sessionStorage.setItem('dn_desk3_src', SRC); else SRC = sessionStorage.getItem('dn_desk3_src') || '';
  } catch (e) {}
  track('page_view', { source: SRC || 'direct' });

  /* ---------- 기준값은 한곳에 (5장) ----------
     계약 크기는 기존 데스크 페이지에 적힌 값입니다. 브로커와 계좌 유형에 따라 다를 수 있습니다. */
  var INST = {
    gold: { name: '골드',      unit: '온스',      size: 100,    move: 1,      moveLabel: '$1',          stop: 5,      stopLabel: '$5',     tgtLabel: '$10',    sizeText: function (q) { return fmtNum(q) + '온스'; } },
    nas:  { name: '나스닥100', unit: '계약',      size: 1,      move: 1,      moveLabel: '1포인트',     stop: 50,     stopLabel: '50포인트', tgtLabel: '100포인트', sizeText: function (q) { return fmtNum(q) + '계약'; } },
    wti:  { name: 'WTI 오일',  unit: '배럴',      size: 100,    move: 1,      moveLabel: '$1',          stop: 0.5,    stopLabel: '$0.5',   tgtLabel: '$1',     sizeText: function (q) { return fmtNum(q) + '배럴'; } },
    eur:  { name: 'EUR/USD',   unit: '통화 단위', size: 100000, move: 0.0001, moveLabel: '1핍(0.0001)', stop: 0.0020, stopLabel: '20핍',   tgtLabel: '40핍',   sizeText: function (q) { return fmtNum(q) + ' 통화 단위'; } }
  };
  var TARGET_RATIO = 2;   // 목표 폭 = 손절 폭의 2배

  function fmtNum(v) { return (Math.round(v * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 }); }
  function money(v) { return '$' + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  /* ---------- 2. 계산기: 값을 고르는 즉시 결과가 바뀝니다 ---------- */
  var calc = { k: 'gold', lot: 0.01 };
  function renderCalc() {
    var c = INST[calc.k], qty = c.size * calc.lot, perMove = qty * c.move, stop = qty * c.stop, tgt = stop * TARGET_RATIO;
    $('rLot').textContent = calc.lot.toFixed(2) + '랏';
    $('rSize').textContent = c.sizeText(qty);
    $('rMoveL').textContent = '가격이 ' + c.moveLabel + ' 움직이면';
    $('rMove').textContent = money(perMove);
    $('rStopL').textContent = '손절 (−' + c.stopLabel + ')에 닿으면';
    $('rStop').textContent = '−' + money(stop);
    $('rTgtL').textContent = '목표 (+' + c.tgtLabel + ')에 닿으면';
    $('rTgt').textContent = '+' + money(tgt);
    setUnits($('rNote'), ['가정: ' + c.name + ' 1랏 = ' + c.sizeText(c.size) + ' ·', '손절 ' + c.stopLabel + ' · 목표 ' + c.tgtLabel + ' · 수수료 제외.', '계약 크기는 브로커마다 다릅니다.']);
    var carry = c.name + ' ' + calc.lot.toFixed(2) + '랏';                 // 계산해 본 내용을 상담으로 이어 줍니다
    $('calcField').value = calc.touched ? carry : '';
    $('calcCarry').hidden = !calc.touched;
    $('calcCarry').textContent = '계산해 보신 ' + carry + '도 함께 전달합니다.';
  }
  function radioGroup(root, onPick) {
    var btns = [].slice.call(root.querySelectorAll('[role=radio],[role=tab]'));
    var attr = btns[0].getAttribute('role') === 'tab' ? 'aria-selected' : 'aria-checked';
    function pick(b, focus) {
      btns.forEach(function (x) { var on = x === b; x.setAttribute(attr, on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1; });
      if (focus) b.focus(); onPick(b);
    }
    btns.forEach(function (b, i) {
      b.tabIndex = b.getAttribute(attr) === 'true' ? 0 : -1;
      b.addEventListener('click', function () { pick(b, false); });
      b.addEventListener('keydown', function (e) {             // 화살표 키로 옮겨 갑니다
        var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (!d) return; e.preventDefault(); pick(btns[(i + d + btns.length) % btns.length], true);
      });
    });
  }
  radioGroup($('calcInst'), function (b) { calc.k = b.getAttribute('data-k'); calc.touched = true; renderCalc(); track('calc_change', { inst: calc.k, lot: calc.lot }); });
  radioGroup($('calcLot'), function (b) { calc.lot = parseFloat(b.getAttribute('data-v')); calc.touched = true; renderCalc(); track('calc_change', { inst: calc.k, lot: calc.lot }); });
  renderCalc();

  /* ---------- 3. 예시 보드: 300틱 시뮬레이션 차트 (실제 시세 아님) ---------- */
  (function () {
    var box = $('bdChart'), LW = window.LightweightCharts;
    var BD = {
      nas:  { side: 'buy',  base: 21480, dec: 1, vol: 0.0011, seed: 11 },
      gold: { side: 'sell', base: 2652,  dec: 1, vol: 0.0008, seed: 23 },
      wti:  { side: 'wait', base: 71.4,  dec: 2, vol: 0.0016, seed: 37 }
    };
    function show0(text) { box.textContent = text; box.style.display = 'grid'; box.style.placeItems = 'center'; box.style.color = '#9BA1AF'; box.style.fontSize = '15px'; }
    if (!LW) { show0('차트를 불러오지 못했습니다. 새로고침해 주세요.'); return; }   // 오류 상태: 다음에 할 일을 알려 줍니다
    var N = 60, TPC = 300, state = {}, cur = 'nas', lines = [];
    function rng(seed) { var s = seed * 2654435761 % 4294967296; return function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
    function build(c) {
      var r = rng(c.seed), g = function () { return Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r()); };
      var px = c.base, data = [], sum = 0;
      for (var i = 0; i < N; i++) {
        var o = px, h = o, l = o, cl = o;
        for (var k = 0; k < 60; k++) { cl = cl * (1 + c.vol / Math.sqrt(60) * g() - 0.02 * Math.log(cl / c.base) / 60); if (cl > h) h = cl; if (cl < l) l = cl; }
        px = cl; sum += h - l; data.push({ time: i + 1, open: o, high: h, low: l, close: cl });
      }
      var atr = sum / N, e = data[N - 12].close, lv = null;
      if (c.side === 'buy') lv = { entry: e, stop: e - atr * 3.2, target: e + atr * 6.4 };
      if (c.side === 'sell') lv = { entry: e, stop: e + atr * 3.2, target: e - atr * 6.4 };
      return { data: data, lv: lv, g: g, last: data[N - 1], ticks: 0 };
    }
    var chart, series;
    try {
      chart = LW.createChart(box, {
        autoSize: true,
        layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#9BA1AF', fontFamily: 'Pretendard, sans-serif', fontSize: 11 },
        grid: { vertLines: { visible: false }, horzLines: { color: 'rgba(255,255,255,0.06)' } },
        crosshair: { vertLine: { visible: false, labelVisible: false }, horzLine: { visible: false, labelVisible: false } },
        rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.12, bottom: 0.12 } },
        timeScale: { visible: false, borderVisible: false, rightOffset: 5, barSpacing: 8 },
        handleScroll: false, handleScale: false
      });
      series = chart.addCandlestickSeries({ upColor: '#F0556B', downColor: '#4B8BFF', borderUpColor: '#F0556B', borderDownColor: '#4B8BFF', wickUpColor: '#F0556B', wickDownColor: '#4B8BFF', priceLineColor: 'rgba(255,255,255,.35)' });
    } catch (e) { show0('차트를 그리지 못했습니다. 새로고침해 주세요.'); return; }
    function fmt(v, d) { return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }
    function show(k) {
      cur = k; var c = BD[k]; if (!state[k]) state[k] = build(c); var st = state[k];
      lines.forEach(function (l) { series.removePriceLine(l); }); lines = [];
      series.applyOptions({ priceFormat: { type: 'price', precision: c.dec, minMove: 1 / Math.pow(10, c.dec) },
        autoscaleInfoProvider: function (orig) { var r = orig(); if (!r || !r.priceRange || !st.lv) return r; r.priceRange.minValue = Math.min(r.priceRange.minValue, st.lv.stop, st.lv.target); r.priceRange.maxValue = Math.max(r.priceRange.maxValue, st.lv.stop, st.lv.target); return r; } });
      series.setData(st.data);
      if (st.lv) [['target', '#C5CBD8', '목표'], ['entry', '#FFC247', '진입'], ['stop', '#8FB4FF', '손절']].forEach(function (a) { lines.push(series.createPriceLine({ price: st.lv[a[0]], color: a[1], lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: a[2] })); });
      chart.timeScale().scrollToRealTime();
      $('bdEntry').textContent = st.lv ? fmt(st.lv.entry, c.dec) : '—';
      $('bdStop').textContent = st.lv ? fmt(st.lv.stop, c.dec) : '—';
      $('bdTarget').textContent = st.lv ? fmt(st.lv.target, c.dec) : '—';
    }
    radioGroup($('bdTabs'), function (b) { show(b.getAttribute('data-k')); track('board_tab', { inst: cur }); });
    show('nas');
    if (reduce) return;
    var visible = false, timer = null;
    function tick() {
      var c = BD[cur], st = state[cur], b = st.last, n = 3 + Math.floor(Math.random() * 10);
      for (var k = 0; k < n; k++) {
        var v = b.close * (1 + c.vol / Math.sqrt(TPC) * st.g() - 0.02 * Math.log(b.close / c.base) / TPC);
        st.ticks++;
        if (st.ticks >= TPC) { b.close = v; if (v > b.high) b.high = v; if (v < b.low) b.low = v; series.update(b); b = { time: b.time + 1, open: v, high: v, low: v, close: v }; st.data.push(b); if (st.data.length > 140) st.data.shift(); st.ticks = 0; }
        else { b.close = v; if (v > b.high) b.high = v; if (v < b.low) b.low = v; }
      }
      st.last = b; series.update(b);
    }
    function run() { if (!timer && visible && !document.hidden) timer = setInterval(tick, 60); }
    function halt() { clearInterval(timer); timer = null; }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[e.length - 1].isIntersecting; visible ? run() : halt(); }).observe(box);
    else { visible = true; run(); }
    document.addEventListener('visibilitychange', function () { document.hidden ? halt() : run(); });
  })();

  /* ---------- 8. 상담 신청 ---------- */
  $('srcField').value = SRC;
  var form = $('form'), err = $('formErr'), btn = $('submitBtn'), phone = form.elements.phone, nameEl = form.elements.fullname;
  var KEY = 'dn_desk3_form';
  try {                                                         // 뒤로 가거나 새로고침해도 적은 것이 남습니다
    var saved = JSON.parse(sessionStorage.getItem(KEY) || '{}');
    if (saved.fullname) nameEl.value = saved.fullname;
    if (saved.phone) phone.value = saved.phone;
    if (saved.kind) [].forEach.call(form.elements.kind, function (r) { r.checked = r.value === saved.kind; });
  } catch (e) {}
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify({ fullname: nameEl.value, phone: phone.value, kind: form.elements.kind.value })); } catch (e) {} }
  form.addEventListener('input', save); form.addEventListener('change', save);
  phone.addEventListener('input', function () {
    var d = phone.value.replace(/\D/g, '').slice(0, 11);
    phone.value = d.length < 4 ? d : d.length < 8 ? d.slice(0, 3) + '-' + d.slice(3) : d.slice(0, 3) + '-' + d.slice(3, d.length - 4) + '-' + d.slice(d.length - 4);
  });
  function fail(el, msg) { err.textContent = msg; err.hidden = false; [nameEl, phone].forEach(function (x) { x.removeAttribute('aria-invalid'); }); if (el) { if (el.type !== 'checkbox') el.setAttribute('aria-invalid', 'true'); el.focus(); } track('form_error', { field: el ? el.name : 'send' }); }
  var started = false;
  form.addEventListener('focusin', function () { if (!started) { started = true; track('form_start'); } });
  form.addEventListener('submit', function (e) {
    e.preventDefault(); err.hidden = true;
    if (!nameEl.value.trim()) return fail(nameEl, '이름을 적어 주세요.');
    if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.value)) return fail(phone, '휴대폰 번호를 010-1234-5678 형식으로 적어 주세요.');
    if (!form.elements.consent.checked) return fail(form.elements.consent, '개인정보 수집·이용에 동의해 주세요.');
    [nameEl, phone].forEach(function (x) { x.removeAttribute('aria-invalid'); });
    window.open(KAKAO, '_blank', 'noopener');                    // 누른 순간에 열어야 팝업 차단에 걸리지 않습니다
    var body = new URLSearchParams(new FormData(form)).toString();
    btn.disabled = true; btn.textContent = '접수하는 중입니다';   // 불러오는 중 상태
    function finish(ok) {
      btn.disabled = false; btn.textContent = '신청하고 카카오톡 열기';
      track(ok ? 'form_done' : 'form_send_failed', { kind: form.elements.kind.value });
      if (!ok) return fail(null, '접수가 저장되지 않았습니다. 열린 카카오톡 상담방에 이름과 연락처를 남겨 주시면 바로 이어서 도와드립니다.');
      $('doneName').textContent = nameEl.value.trim();
      form.hidden = true; $('done').hidden = false; $('done').focus && $('done').setAttribute('tabindex', '-1'); $('done').focus();
      try { sessionStorage.removeItem(KEY); } catch (e) {}
    }
    fetch(form.getAttribute('action') || location.pathname, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
      .then(function (r) { finish(r.ok); }).catch(function () { finish(false); });
  });

  /* ---------- 하단 주 버튼: 신청 구역이 보이면 숨습니다 (그 화면의 주 버튼은 폼의 버튼 하나) ---------- */
  var bar = $('bar'), apply = $('apply');
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { bar.classList.toggle('off', e[e.length - 1].isIntersecting); }, { rootMargin: '0px 0px -25% 0px' }).observe(apply);
  $('barBtn').addEventListener('click', function () { track('cta_click', { from: 'bar' }); });
  $('doneKakao').addEventListener('click', function () { track('kakao_open', { from: 'done' }); });

  /* 단계별 보기 기록 */
  if ('IntersectionObserver' in window) {
    var seen = {}, io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting && !seen[en.target.id]) { seen[en.target.id] = 1; track('section_view', { section: en.target.id }); } }); }, { threshold: 0.35 });
    ['calc', 'board', 'how', 'platforms', 'faq', 'apply'].forEach(function (id) { if ($(id)) io.observe($(id)); });
  }
  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href^="http"]'); if (a) track('outbound_click', { to: a.hostname }); });
  [].forEach.call(document.querySelectorAll('.faq details'), function (d) { d.addEventListener('toggle', function () { if (d.open) track('faq_open', { q: d.getAttribute('data-q') || '' }); }); });
})();
