(function () {
  'use strict';
  var KAKAO = 'https://open.kakao.com/o/gZ4c0RWi';
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- 기록: 단계별로 남깁니다. 측정 도구가 연결되면 dataLayer 를 읽어 갑니다 ---------- */
  window.dataLayer = window.dataLayer || [];
  function track(name, data) { window.dataLayer.push(Object.assign({ event: name, page: 'academy3' }, data || {})); }
  var SRC = '';
  try {
    var q = new URLSearchParams(location.search);
    SRC = (q.get('utm_source') || q.get('src') || '').slice(0, 40).replace(/[^\w\-.가-힣]/g, '');
    if (!SRC && document.referrer) { var h = new URL(document.referrer).hostname; SRC = /youtube|youtu\.be/.test(h) ? 'youtube' : /t\.me|telegram/.test(h) ? 'telegram' : /kakao/.test(h) ? 'kakao' : /dealerne|netlify\.app|localhost/.test(h) ? '' : h.slice(0, 40); }
    if (SRC) sessionStorage.setItem('dn_academy3_src', SRC); else SRC = sessionStorage.getItem('dn_academy3_src') || '';
  } catch (e) {}
  track('page_view', { source: SRC || 'direct' });

  /* ---------- 2. 레벨 진단: 문항과 결과는 한곳에 ---------- */
  var Q = [
    { q: '선물 거래 경험이 어느 정도 있으신가요?', o: ['완전 처음이에요', '모의투자만 해봤어요', '실전 6개월 미만', '실전 6개월 이상'] },
    { q: '증거금과 레버리지 개념을 알고 계신가요?', o: ['아직 잘 몰라요', '용어만 들어봤어요', '개념은 이해하고 있어요', '주문 수량·증거금 계산까지 가능해요'] },
    { q: '차트(캔들·지지저항) 분석은 어느 정도 가능하신가요?', o: ['캔들 보는 법도 낯설어요', '기본 캔들은 볼 줄 알아요', '추세선과 지지·저항을 그을 수 있어요', '나만의 차트 분석 기준이 있어요'] },
    { q: '주문하기 전에 손절가부터 미리 정하시나요?', o: ['아니요, 안 정해요', '생각날 때만 가끔 정해요', '대체로 정하는 편이에요', '매번 정하고 원칙대로 지켜요'] },
    { q: '매매 후 매매일지를 기록하시나요?', o: ['전혀 안 써요', '가끔 메모만 해요', '꾸준히 기록하고 있어요', '기록 후 승률·손익비까지 복기해요'] },
    { q: "계좌 기준 '일일 최대 손실 한도'가 정해져 있나요?", o: ['따로 없어요', '생각만 해봤어요', '기준은 정해 두었어요', '정해 두고 실제로 지켜오고 있어요'] },
    { q: '평소 주로 어떤 방식으로 진입하시나요?', o: ['아직 매매 경험이 없어요', '뉴스나 감에 의존해 진입해요', '주로 쓰는 패턴·기법이 있어요', '시나리오별로 일관된 원칙에 따라 매매해요'] },
    { q: '지금 가장 배우고 싶은 영역은 무엇인가요?', o: ['선물 기초 개념·용어', '차트·추세 읽는 법', '명확한 진입·손절 기준 설정', '매매 원칙 검증 및 습관 교정'] }
  ];
  var RES = [
    { lv: 'Lv1 입문', t: '선물 시장의 기본 원리부터 차근차근 시작해 보세요. 증거금·레버리지·계약 단위 등 필수 기초부터 정리합니다.' },
    { lv: 'Lv2 차트', t: '캔들과 추세, 지지·저항을 같은 순서로 읽는 단계입니다.' },
    { lv: 'Lv3 진입 기준', t: '진입 근거와 시나리오가 깨지는 손절 구간을 글로 적어 두는 단계입니다.' },
    { lv: 'Lv4 리스크', t: '손절 폭과 주문 수량, 일일 손실 한도를 정하는 단계입니다.' },
    { lv: 'Lv5 실전', t: '원칙대로 실행하고 복기하는 단계입니다. 1:1 레벨 상담도 함께 받아 보세요.' }
  ];
  var qi = 0, score = 0, started = false, sel = $('levelSel');
  function renderQ(focus) {
    $('quizAsk').hidden = false; $('quizResult').hidden = true;
    $('quizStep').textContent = (qi + 1) + ' / ' + Q.length;
    $('quizBar').style.width = ((qi + 1) / Q.length * 100) + '%';
    $('quizQ').textContent = Q[qi].q;
    var box = $('quizOpts'); box.textContent = '';
    Q[qi].o.forEach(function (text, idx) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = text;
      b.addEventListener('click', function () {
        if (!started) { started = true; track('quiz_start'); }
        score += idx; qi++;
        if (qi < Q.length) renderQ(true); else showResult();
      });
      box.appendChild(b);
    });
    if (focus) $('quizQ').focus({ preventScroll: true });
  }
  function mark(lv) {
    [].forEach.call(document.querySelectorAll('#lvList li'), function (li) { li.classList.toggle('on', !!lv && li.getAttribute('data-lv') === lv); });
    $('quizField').value = lv || '';
    $('quizCarry').hidden = !lv;
    $('quizCarry').textContent = lv ? '진단 결과 [' + lv + ']도 상담방에 함께 전달됩니다.' : '';
  }
  function showResult() {
    var r = RES[Math.min(4, Math.round(score / (Q.length * 3) * 4))];
    $('resLv').textContent = r.lv; $('resText').textContent = r.t;
    $('quizAsk').hidden = true; $('quizResult').hidden = false;
    sel.value = r.lv; mark(r.lv); saveForm();
    try { sessionStorage.setItem('dn_academy3_quiz', r.lv); } catch (e) {}
    track('quiz_done', { level: r.lv });
    $('resLv').setAttribute('tabindex', '-1'); $('resLv').focus({ preventScroll: true });
  }
  $('quizReset').addEventListener('click', function () { qi = 0; score = 0; mark(''); try { sessionStorage.removeItem('dn_academy3_quiz'); } catch (e) {} track('quiz_reset'); renderQ(true); });
  $('resApply').addEventListener('click', function () { track('cta_click', { from: 'quiz_result' }); });
  renderQ(false);

  /* ---------- 7. 상담 신청 ---------- */
  $('srcField').value = SRC;
  var form = $('form'), err = $('formErr'), btn = $('submitBtn'), phone = form.elements.phone, nameEl = form.elements.fullname;
  var KEY = 'dn_academy3_form';
  function saveForm() { try { sessionStorage.setItem(KEY, JSON.stringify({ fullname: nameEl.value, phone: phone.value, level: sel.value })); } catch (e) {} }
  try {                                                         // 뒤로 가거나 새로고침해도 적은 것이 남습니다
    var saved = JSON.parse(sessionStorage.getItem(KEY) || '{}');
    if (saved.fullname) nameEl.value = saved.fullname;
    if (saved.phone) phone.value = saved.phone;
    if (saved.level) sel.value = saved.level;
    var doneLv = sessionStorage.getItem('dn_academy3_quiz');
    if (doneLv) { var rr = RES.filter(function (x) { return x.lv === doneLv; })[0]; if (rr) { $('resLv').textContent = rr.lv; $('resText').textContent = rr.t; $('quizAsk').hidden = true; $('quizResult').hidden = false; mark(rr.lv); } }
  } catch (e) {}
  form.addEventListener('input', saveForm); form.addEventListener('change', saveForm);
  phone.addEventListener('input', function () {
    var d = phone.value.replace(/\D/g, '').slice(0, 11);
    phone.value = d.length < 4 ? d : d.length < 8 ? d.slice(0, 3) + '-' + d.slice(3) : d.slice(0, 3) + '-' + d.slice(3, d.length - 4) + '-' + d.slice(d.length - 4);
  });
  function fail(el, msg) { err.textContent = msg; err.hidden = false; [nameEl, phone].forEach(function (x) { x.removeAttribute('aria-invalid'); }); if (el) { if (el.type !== 'checkbox') el.setAttribute('aria-invalid', 'true'); el.focus(); } track('form_error', { field: el ? el.name : 'send' }); }
  var fstart = false;
  form.addEventListener('focusin', function () { if (!fstart) { fstart = true; track('form_start'); } });
  form.addEventListener('submit', function (e) {
    e.preventDefault(); err.hidden = true;
    if (!nameEl.value.trim()) return fail(nameEl, '이름이나 닉네임을 적어 주세요.');
    if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.value)) return fail(phone, '휴대폰 번호를 010-1234-5678 형식으로 적어 주세요.');
    if (!form.elements.consent.checked) return fail(form.elements.consent, '개인정보 수집·이용에 동의해 주세요.');
    [nameEl, phone].forEach(function (x) { x.removeAttribute('aria-invalid'); });
    window.open(KAKAO, '_blank', 'noopener');                    // 누른 순간에 열어야 팝업 차단에 걸리지 않습니다
    var body = new URLSearchParams(new FormData(form)).toString();
    btn.disabled = true; btn.textContent = '접수하는 중입니다';
    function finish(ok) {
      btn.disabled = false; btn.textContent = '무료 레벨 상담 신청하고 카톡방 열기';
      track(ok ? 'form_done' : 'form_send_failed', { level: sel.value });
      if (!ok) return fail(null, '접수가 저장되지 않았습니다. 열린 카카오톡 상담방에 이름과 연락처를 남겨 주시면 바로 이어서 도와드립니다.');
      $('doneName').textContent = nameEl.value.trim();
      form.hidden = true; $('done').hidden = false; $('done').setAttribute('tabindex', '-1'); $('done').focus();
      try { sessionStorage.removeItem(KEY); } catch (e) {}
    }
    fetch(form.getAttribute('action') || location.pathname, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
      .then(function (r) { finish(r.ok); }).catch(function () { finish(false); });
  });

  /* ---------- 하단 주 버튼: 신청 구역이 보이면 숨습니다 ---------- */
  var bar = $('bar');
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { bar.classList.toggle('off', e[e.length - 1].isIntersecting); }, { rootMargin: '0px 0px -25% 0px' }).observe($('apply'));
  $('barBtn').addEventListener('click', function () { track('cta_click', { from: 'bar' }); });
  $('doneKakao').addEventListener('click', function () { track('kakao_open', { from: 'done' }); });

  if ('IntersectionObserver' in window) {
    var seen = {}, io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting && !seen[en.target.id]) { seen[en.target.id] = 1; track('section_view', { section: en.target.id }); } }); }, { threshold: 0.35 });
    ['quiz', 'roadmap', 'videos', 'instructor', 'faq', 'apply'].forEach(function (id) { if ($(id)) io.observe($(id)); });
  }
  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href^="http"]'); if (a) track('outbound_click', { to: a.hostname }); });
  [].forEach.call(document.querySelectorAll('.faq details'), function (d) { d.addEventListener('toggle', function () { if (d.open) track('faq_open', { q: d.getAttribute('data-q') || '' }); }); });
})();
