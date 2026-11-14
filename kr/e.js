(function () {
  var C = window.DEALERNE_C || {};
  var $ = function (id) { return document.getElementById(id); };
  var html = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lowEnd = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || (navigator.deviceMemory && navigator.deviceMemory <= 2);
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var animate = hasGsap && !reduce;
  if (animate) { gsap.registerPlugin(ScrollTrigger); html.classList.add('html-anim'); }

  /* ---------- 추적 ---------- */
  window.dataLayer = window.dataLayer || []; window.__events = [];
  function gtag() { window.dataLayer.push(arguments); }
  if (C.ga4Id) { var gs = document.createElement('script'); gs.async = true; gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(C.ga4Id); document.head.appendChild(gs); gtag('js', new Date()); gtag('config', C.ga4Id, { send_page_view: false }); }
  function track(name, params) { params = params || {}; window.__events.push({ name: name, params: params }); if (C.ga4Id) gtag('event', name, params); else if (window.console && console.debug) console.debug('[track]', name, params); }
  track('page_view', { page_path: location.pathname, page: 'e' });

  /* ---------- 설정값 → 화면 ---------- */
  var S = C.schedule || {}, F = C.faq || {};
  var cBase = new URL('./', location.href);
  var brokerName = (C.broker && C.broker.name) || '', acctType = (C.broker && C.broker.accountType) || '';
  var line = brokerName ? brokerName + (acctType ? ' (' + acctType + ')' : '') : '';
  function show(boxId, textId, text) { if (text) { $(textId).textContent = text; $(boxId).hidden = false; } else $(boxId).hidden = true; }
  show('fBrokerBox', 'fBroker', line ? line + '와 제휴하고 있어요.' : '');
  show('fFreeBox', 'fFree', F.freeWithoutAccount); show('fCondBox', 'fCond', F.conditions);
  $('riskExtra').textContent = C.riskExtra || '';
  var mail = (C.contact && C.contact.email) || '';
  if (mail) { var me = $('footMail'); me.textContent = mail; me.href = 'mailto:' + mail; me.hidden = false; }
  var paid = C.paidCourseUrl || 'https://dealerne.com/#roadmap'; $('footPaid').href = paid;
  if (S.briefingTime) $('tBrief').textContent = '매일 ' + S.briefingTime + '에 올라와요. 장이 열리기 전에 오늘 볼 지표와 일정을 같이 봐요.';
  if (S.liveTime) $('tLive').textContent = '평일 ' + S.liveTime + ' 시작. 강사와 같이 차트를 보고, 채팅으로 바로 물어봐요.';
  if (S.community) $('tComm').textContent = '운영 채널 ' + S.community + '. 기준을 적고, 지킨 날을 같이 기록해요.';
  if (S.care) $('tCare').textContent = '운영 시간 ' + S.care + '. 막힐 때 카톡으로 편하게 물어봐요.';

  /* ---------- 다이얼로그 · 계좌 개설 · 카톡 ---------- */
  var notice = $('notice');
  function openDialog(d) { if (d.showModal) d.showModal(); else d.setAttribute('open', ''); }
  function closeDialog(d) { if (d.close) d.close(); else d.removeAttribute('open'); }
  function showNotice(t, b) { $('noticeTitle').textContent = t; $('noticeBody').textContent = b; openDialog(notice); }
  document.querySelectorAll('dialog [data-close]').forEach(function (b) { b.addEventListener('click', function () { closeDialog(b.closest('dialog')); }); });
  notice.addEventListener('click', function (e) { if (e.target === notice) closeDialog(notice); });
  function withUtm(url) {
    try { var u = new URL(url, cBase), utm = Object.assign({}, C.utm || {}, { utm_medium: 'landing_e' });
      Object.keys(utm).forEach(function (k) { if (utm[k]) u.searchParams.set(k, utm[k]); });
      if (!u.searchParams.has('utm_content')) u.searchParams.set('utm_content', 'e_page'); return u.toString(); } catch (e) { return url; }
  }
  var KAKAO = (window.DEALERNE_E && window.DEALERNE_E.kakaoUrl) || '';
  function openKakao(where) {
    track('consult_click', { location: where, has_url: !!KAKAO });
    if (KAKAO) window.open(KAKAO, '_blank', 'noopener');
    else showNotice('카카오톡 상담방을 준비하고 있어요', '상담방이 정해지면 이 버튼으로 바로 문의할 수 있어요.');
  }
  document.querySelectorAll('[data-open]').forEach(function (b) { b.addEventListener('click', function () { openKakao(b.getAttribute('data-open')); }); });
  $('askKakao').addEventListener('click', function (e) { e.preventDefault(); openKakao('faq_link'); });

  /* ---------- 함께하는 분들: data.js의 값으로 그려요 (비어 있으면 숨김, placeholders면 점선 틀) ---------- */
  (function () {
    var D = window.DEALERNE_E || {}, P = D.proof || {}, ph = !!D.placeholders, sec = $('proof');
    var rate = P.rating && P.rating.value, mem = P.members && P.members.value, revs = (P.reviews || []).filter(function (r) { return r && r.text; });
    if (!rate && !mem && !revs.length && !ph) return;
    sec.hidden = false; $('navProof').hidden = false; $('h-proof').textContent = P.title || '함께하는 분들의 이야기';
    function esc(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
    var chips = '';
    if (rate) chips += '<span class="chip a"><span aria-hidden="true">★</span> ' + esc(rate) + ' <small>' + esc(P.rating.label || '평점') + '</small></span>';
    else if (ph) chips += '<span class="chip ph">★ — <small>' + esc((P.rating && P.rating.label) || '평점') + ' 자리</small></span>';
    if (mem) chips += '<span class="chip b">' + esc(mem) + ' <small>' + esc(P.members.label || '함께하는 회원') + '</small></span>';
    else if (ph) chips += '<span class="chip ph">— <small>' + esc((P.members && P.members.label) || '함께하는 회원') + ' 자리</small></span>';
    $('proofChips').innerHTML = chips;
    var cards = revs.map(function (r) { return '<article class="rv-card"><p>' + esc(r.text) + '</p><footer>' + esc(r.name || '') + (r.date ? ' · ' + esc(r.date) : '') + '</footer></article>'; });
    if (!cards.length && ph) for (var i = 0; i < 6; i++) cards.push('<article class="rv-card ph"><p>여기에 실제로 동의받은 후기가 들어가요.</p><footer>회원명 · 작성일</footer></article>');
    if (!cards.length) { $('rvw').hidden = true; }
    var track = $('rvwTrack'); track.innerHTML = cards.join('');
    $('proofNote').textContent = revs.length ? '' : (ph ? '시안용 빈 틀이에요. 실제 평점·회원 수·후기는 확인된 자료로만 채워요. (data.js)' : '');
    if (cards.length && !reduce) {
      var set = track.innerHTML, w = track.scrollWidth + 14;
      track.innerHTML = set + set; $('rvw').classList.add('on');
      $('rvw').style.setProperty('--rv-w', w + 'px'); $('rvw').style.setProperty('--rv-dur', (w / 45).toFixed(1) + 's');
      [].slice.call(track.children).forEach(function (el, i) { if (i >= cards.length) el.setAttribute('aria-hidden', 'true'); });
    }
  })();
  $('chatBtn').addEventListener('click', function () { openKakao('chat_float'); });

  /* ---------- #079 진행 바 ---------- */
  var fill = document.querySelector('#pbar i'), pt = false;
  function prog() { pt = false; var m = Math.max(1, html.scrollHeight - innerHeight); fill.style.transform = 'scaleX(' + Math.min(1, Math.max(0, scrollY / m)) + ')'; }
  addEventListener('scroll', function () { if (!pt) { pt = true; requestAnimationFrame(prog); } }, { passive: true }); prog();

  /* ---------- #094 마퀴 ---------- */
  (function () {
    var mq = $('mq'), track_ = $('mqTrack'); if (!mq || reduce) return;
    var set = track_.querySelector('.mq-set'), tm;
    function build() {
      [].slice.call(track_.querySelectorAll('[data-clone]')).forEach(function (n) { n.remove(); });
      mq.classList.add('on'); var w = set.offsetWidth; if (!w) return;
      for (var i = 1; i < Math.ceil(innerWidth / w) + 1; i++) { var c = set.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.setAttribute('data-clone', ''); track_.appendChild(c); }
      mq.style.setProperty('--mq-w', w + 'px'); mq.style.setProperty('--mq-dur', (w / 70).toFixed(2) + 's');
    }
    build(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
    addEventListener('resize', function () { clearTimeout(tm); tm = setTimeout(build, 200); });
  })();

  /* ---------- 히어로 폰: 시뮬레이션 캔들 ---------- */
  var chartBuilt = false;
  function buildChart() {
    if (chartBuilt) return; chartBuilt = true;
    var LW = window.LightweightCharts, box = $('heroChart'); if (!LW || !box) return;
    var chart; try { chart = LW.createChart(box, { autoSize: true, layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#8B93A3', fontSize: 10 }, grid: { vertLines: { visible: false }, horzLines: { color: 'rgba(255,255,255,0.06)' } }, crosshair: { vertLine: { visible: false, labelVisible: false }, horzLine: { visible: false, labelVisible: false } }, rightPriceScale: { visible: false }, leftPriceScale: { visible: false }, timeScale: { visible: false, borderVisible: false, rightOffset: 4, barSpacing: 7 }, handleScroll: false, handleScale: false }); } catch (e) { return; }
    var series = chart.addCandlestickSeries({ upColor: '#F04452', downColor: '#3182F6', borderUpColor: '#F04452', borderDownColor: '#3182F6', wickUpColor: '#F04452', wickDownColor: '#3182F6', priceLineVisible: false, lastValueVisible: false });
    var seed = 20261113, price = 100, data = [], t0 = Math.floor(Date.now() / 60000) * 60 - 3600;
    function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
    function gauss() { return Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd()); }
    for (var i = 0; i < 60; i++) { var o = price, hi = o, lo = o, c = o; for (var k = 0; k < 12; k++) { c = c * Math.exp((0.00008 - 0.02 * Math.log(c / 100)) / 12 + 0.0006 / Math.sqrt(12) * gauss()); if (c > hi) hi = c; if (c < lo) lo = c; } price = c; data.push({ time: t0 + i * 60, open: o, high: hi, low: lo, close: c }); }
    if (!animate || lowEnd) { series.setData(data); return; }
    var n = 0, iv = setInterval(function () { series.update(data[n++]); if (n >= data.length) clearInterval(iv); }, 70);
  }
  buildChart();

  /* ---------- 스크롤 연출 ---------- */
  if (animate) {
    /* 섹션 등장 */
    [].slice.call(document.querySelectorAll('.rv')).forEach(function (el) {
      ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: function () { gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }); } });
    });
    /* 단계 막대: 차례로 채워져요 */
    var bars = [].slice.call(document.querySelectorAll('#lv u'));
    gsap.set(bars, { scaleX: 0 });
    ScrollTrigger.create({ trigger: $('lv'), start: 'top 80%', once: true, onEnter: function () { gsap.to(bars, { scaleX: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' }); } });
    /* #080 마커 */
    [].slice.call(document.querySelectorAll('mark.mk')).forEach(function (m) {
      var o = { v: 0 }; m.style.setProperty('--mk', '0%');
      ScrollTrigger.create({ trigger: m, start: 'top 82%', once: true, onEnter: function () { gsap.to(o, { v: 100, duration: 0.8, delay: 0.3, ease: 'power3.out', onUpdate: function () { m.style.setProperty('--mk', o.v + '%'); } }); } });
    });
    /* #146 한마디: 글자가 스크롤에 맞춰 진해져요 */
    (function () {
      var p = $('qt'), txt = p.textContent, frag = document.createDocumentFragment(), chars = [];
      txt.split('').forEach(function (ch) { var s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; frag.appendChild(s); chars.push(s); });
      p.setAttribute('aria-label', txt); p.textContent = ''; p.appendChild(frag); p.classList.add('rv-chars');
      gsap.fromTo(chars, { opacity: 0.18 }, { opacity: 1, ease: 'none', stagger: 0.05, scrollTrigger: { trigger: p, start: 'top 85%', end: 'bottom 45%', scrub: 0.4 } });
    })();
    /* #147 스택 카드 */
    (function () {
      var slots = [].slice.call(document.querySelectorAll('#stack .slot')), cards = slots.map(function (s) { return s.firstElementChild; }), pr = slots.map(function () { return 0; });
      function apply(i) { var sum = 0; for (var j = i + 1; j < pr.length; j++) sum += pr[j]; cards[i].style.transform = 'scale(' + (1 - 0.045 * sum).toFixed(4) + ')'; cards[i].style.setProperty('--cov', (Math.min(1, sum) * 0.18).toFixed(3)); }
      slots.forEach(function (s, j) {
        if (!j) return;
        var up = function (self) { pr[j] = self.progress; for (var i = 0; i < j; i++) apply(i); };
        ScrollTrigger.create({ trigger: s, start: 'top 92%', invalidateOnRefresh: true, end: function () { return 'top ' + parseFloat(getComputedStyle(cards[j]).top) + 'px'; }, onUpdate: up, onRefresh: up });
      });
    })();
  }

  /* ---------- #085 물결 ---------- */
  if (!reduce) document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('.btn'); if (!b) return;
    var r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2, s = document.createElement('span');
    s.className = 'ripple'; s.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
    b.appendChild(s); setTimeout(function () { s.remove(); }, 700);
  });

  /* ---------- 섹션 노출 추적 ---------- */
  if ('IntersectionObserver' in window) {
    var seen = {}, io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting && !seen[en.target.id]) { seen[en.target.id] = 1; track('section_view', { section: en.target.id }); } }); }, { threshold: 0.4 });
    ['why', 'steps', 'care', 'videos', 'faq'].forEach(function (id) { var el = $(id); if (el) io.observe(el); });
  }

  /* ---------- 영상 ---------- */
  var vm = $('vmodal'), vf = $('vframe');
  document.querySelectorAll('[data-video]').forEach(function (b) {
    b.addEventListener('click', function () {
      track('video_open', { video: b.getAttribute('data-video') });
      vf.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + b.getAttribute('data-video') + '?autoplay=1&rel=0&playsinline=1" title="' + (b.getAttribute('aria-label') || '영상') + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>'; openDialog(vm);
    });
  });
  function closeVideo() { vf.innerHTML = ''; closeDialog(vm); }
  vm.querySelector('[data-close-video]').addEventListener('click', closeVideo);
  vm.addEventListener('close', function () { vf.innerHTML = ''; });
  vm.addEventListener('click', function (e) { if (e.target === vm) closeVideo(); });
})();
