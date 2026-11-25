// 상담 신청 내용을 텔레그램 비공개 방으로 보냅니다.
// Netlify 의 "접수 알림 웹훅"(Forms → Form notifications → Outgoing webhook)이 접수될 때마다 이 주소를 호출합니다.
//   주소: https://dealerne.com/.netlify/functions/form-to-telegram
//
// 봇 토큰, 방 번호, 암호 문구는 이 파일에 적지 않습니다. 이 저장소는 공개 저장소입니다.
// Netlify 사이트 설정 → Environment variables 에 아래 세 값을 넣어야 동작합니다.
//   TELEGRAM_BOT_TOKEN  : BotFather 가 준 토큰
//   TELEGRAM_CHAT_ID    : 알림을 받을 방 번호
//   FORM_WEBHOOK_SECRET : 웹훅을 만들 때 "JWS secret token" 칸에 넣은 것과 같은 암호 문구
// 암호 문구가 맞지 않는 호출은 거절합니다. (아무나 이 주소로 가짜 신청을 보내지 못하게 합니다.)
// 메일 알림은 이 파일과 관계없이 그대로 갑니다.

const crypto = require('crypto');

const FORM = { 'desk-demo': '모의투자 상담', 'desk-live': '실전 매매 상담', apply: '아카데미 상담' };
const FIELD = [
  ['fullname', '이름'], ['phone', '연락처'],
  ['instrument', '관심 종목'], ['mt5', 'MT5 사용 경험'],
  ['platform', '희망 플랫폼'], ['experience', '매매 경험'],
  ['level', '관심 레벨'],
];

const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

// Netlify 가 붙여 보내는 서명(X-Webhook-Signature)이 암호 문구와 본문에 맞는지 확인합니다.
// 어디서 어긋났는지 알 수 있게 단계별 결과를 돌려줍니다. (암호 문구와 서명 값은 담지 않습니다.)
function checkSignature(signature, secret, rawBody) {
  const out = { hasHeader: !!signature, parts: 0, alg: '', keyMatches: false, bodyMatches: false };
  const parts = String(signature || '').trim().split('.');
  out.parts = parts.length;
  if (parts.length !== 3) return out;
  try {
    const head = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    out.alg = String((head && head.alg) || '');
    if (out.alg !== 'HS256') return out;
    const want = Buffer.from(b64url(crypto.createHmac('sha256', secret).update(parts[0] + '.' + parts[1]).digest()));
    const got = Buffer.from(parts[2].replace(/=+$/, ''));
    out.keyMatches = want.length === got.length && crypto.timingSafeEqual(want, got);
    const claim = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    const hash = crypto.createHash('sha256').update(rawBody).digest('hex');
    out.bodyMatches = !!claim && String(claim.sha256 || '').toLowerCase() === hash;
  } catch (e) { out.error = e && e.name; }
  return out;
}

exports.handler = async (event) => {
  const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim(), chat = (process.env.TELEGRAM_CHAT_ID || '').trim();
  const secret = (process.env.FORM_WEBHOOK_SECRET || '').trim();
  // 원인 추적용 기록: 값 자체는 남기지 않고, 있는지 없는지만 남깁니다.
  console.log('form-to-telegram: start', JSON.stringify({ method: event.httpMethod, hasToken: !!token, hasChat: !!chat, hasSecret: !!secret }));
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'method not allowed' };
  if (!token || !chat || !secret) { console.log('form-to-telegram: skipped, settings missing'); return { statusCode: 503, body: 'not configured' }; }

  const raw = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64') : Buffer.from(event.body || '', 'utf8');
  const h = event.headers || {};
  const sig = checkSignature(h['x-webhook-signature'] || h['X-Webhook-Signature'], secret, raw);
  if (!sig.keyMatches || !sig.bodyMatches) {
    // 암호 문구의 글자 수만 남깁니다. 웹훅 칸에 넣은 문구의 글자 수와 같은지 비교하는 용도입니다.
    console.log('form-to-telegram: rejected, signature does not match', JSON.stringify({ ...sig, secretLength: secret.length, bodyBytes: raw.length, base64: !!event.isBase64Encoded }));
    return { statusCode: 401, body: 'unauthorized' };
  }

  let p;
  try { p = JSON.parse(raw.toString('utf8')); if (p && p.payload) p = p.payload; } catch (e) { p = null; }
  if (!p || !p.data) { console.log('form-to-telegram: skipped, no form data'); return { statusCode: 200, body: 'no payload' }; }

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
    console.log('form-to-telegram: telegram', r.status, r.ok ? 'sent' : why, 'form', name);
    return { statusCode: 200, body: r.ok ? 'sent' : 'telegram error' };
  } catch (e) {
    console.log('form-to-telegram: telegram request failed', e && e.name, e && String(e.message).slice(0, 80));
    return { statusCode: 200, body: 'telegram error' };
  }
};
