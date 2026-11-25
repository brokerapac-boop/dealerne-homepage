// 상담 신청이 접수될 때마다 Netlify가 자동으로 실행합니다. (파일 이름 submission-created 를 바꾸면 실행되지 않습니다.)
// 접수 내용을 텔레그램 비공개 방으로 보냅니다.
//
// 봇 토큰과 방 번호는 이 파일에 적지 않습니다. 이 저장소는 공개 저장소입니다.
// Netlify 사이트 설정 → Environment variables 에 아래 두 값을 넣어야 동작합니다.
//   TELEGRAM_BOT_TOKEN : BotFather 가 준 토큰
//   TELEGRAM_CHAT_ID   : 알림을 받을 방 번호
// 두 값이 없으면 아무 일도 하지 않습니다. (메일 알림은 이 파일과 관계없이 그대로 갑니다.)

const FORM = { 'desk-demo': '모의투자 상담', 'desk-live': '실전 매매 상담', apply: '아카데미 상담' };
const FIELD = [
  ['fullname', '이름'], ['phone', '연락처'],
  ['instrument', '관심 종목'], ['mt5', 'MT5 사용 경험'],
  ['platform', '희망 플랫폼'], ['experience', '매매 경험'],
  ['level', '관심 레벨'],
];

exports.handler = async (event) => {
  const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim(), chat = (process.env.TELEGRAM_CHAT_ID || '').trim();
  // 원인 추적용 기록: 값 자체는 남기지 않고, 있는지 없는지와 길이만 남깁니다.
  console.log('submission-created: start', JSON.stringify({ hasToken: !!token, tokenLength: token.length, hasChat: !!chat, chatLooksRight: /^-?\d+$/.test(chat), node: process.version }));
  if (!token || !chat) { console.log('submission-created: skipped, settings missing'); return { statusCode: 200, body: 'telegram not configured' }; }

  let p;
  try { p = (JSON.parse(event.body || '{}') || {}).payload; } catch (e) { p = null; }
  if (!p || !p.data) { console.log('submission-created: skipped, no form data in the event'); return { statusCode: 200, body: 'no payload' }; }

  const d = p.data, name = p.form_name || d['form-name'] || '';
  const lines = [`[${FORM[name] || name || '상담'}] 새 신청`];
  for (const [key, label] of FIELD) {
    const v = d[key];
    if (v !== undefined && v !== null && String(v).trim() !== '') lines.push(`${label}: ${String(v).trim().slice(0, 200)}`);
  }
  const when = new Date(p.created_at || Date.now()).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'medium', timeStyle: 'short' });
  lines.push(`접수: ${when}`);

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text: lines.join('\n'), disable_web_page_preview: true }),
    });
    // 토큰이 기록에 남지 않도록 텔레그램의 응답 상태와 설명만 남깁니다.
    let why = '';
    if (!r.ok) { try { why = ((await r.json()) || {}).description || ''; } catch (e) { why = ''; } }
    console.log('submission-created: telegram', r.status, r.ok ? 'sent' : why, 'form', name);
    return { statusCode: 200, body: r.ok ? 'sent' : 'telegram error' };
  } catch (e) {
    console.log('submission-created: telegram request failed', e && e.name, e && String(e.message).slice(0, 80));
    return { statusCode: 200, body: 'telegram error' };
  }
};
