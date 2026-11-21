'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import { KAKAO, TG, SPRING, SOFT, Up } from './kit';
import { VizJargon, VizLot, VizNoStop } from './Viz';

/* ---------- 모의거래: 막히는 세 곳 + 미션 네 개 ---------- */
const MISSIONS = [
  ['첫 주문 넣기', '종목 검색부터 0.01랏 주문까지', '골드 XAUUSD', '매수 0.01랏'],
  ['손절과 익절 함께 설정', '주문 창에서 한 번에 입력하기', '손절가 · 익절가', '설정됨'],
  ['시그널대로 주문해 보기', '받은 시그널을 모의 계좌에서 실행', '시그널 주문', '실행됨'],
  ['매매 일지 남기기', '진입 이유와 결과를 기록', '매매 일지', '기록됨'],
];

export function Demo() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const [done, setDone] = useState(0);
  // 화면에 들어오면 미션이 하나씩 체크됨
  useEffect(() => {
    if (!inView || done >= 4) return;
    const t = setTimeout(() => setDone((d) => d + 1), done ? 1000 : 500);
    return () => clearTimeout(t);
  }, [inView, done]);
  return (
    <>
      <section className="sec stuck-sec" id="demo" data-tone="dark" data-ch="5">
        <div className="wrap">
          <Up as="p" className="eyebrow">처음이라면</Up>
          <Up as="h2" className="big">처음엔 누구나<br />같은 곳에서 막힙니다</Up>
          <div className="three stuck">
            <Up as="article" className="card vcard" i={0}><div className="vbox"><VizJargon /></div><span className="num">01</span><h3>용어부터 낯설다</h3><p>랏, 핍, 증거금, 스왑. 뜻을 모른 채 주문 창을 엽니다.</p></Up>
            <Up as="article" className="card vcard" i={1}>
              <div className="vbox"><VizLot /></div>
              <span className="num">02</span><h3>랏 한 자리가 100배</h3>
              <p>골드 1랏은 100온스입니다. 0.01 대신 1.00을 넣으면 100배 크기로 주문됩니다.</p>
            </Up>
            <Up as="article" className="card vcard" i={2}><div className="vbox"><VizNoStop /></div><span className="num">03</span><h3>손절 없이 들어간다</h3><p>손절가를 비워 두면 손실이 어디서 멈출지 정해지지 않습니다.</p></Up>
          </div>
        </div>
      </section>

      <section ref={ref} className="sec demo-sec" data-tone="dark" data-ch="5">
          <div className="wrap demo-in">
            <div className="demo-copy">
              <h2 className="big">그래서 데스크는 <br />모의거래부터 시작합니다</h2>
              <p className="sub">실제 돈 대신 가상 자금으로, 실제와 같은 MT5 화면에서 주문해 봅니다. 네 가지 미션을 마치면 실전으로 넘어갑니다.</p>
              <ol className="missions">
                {MISSIONS.map(([t, d], k) => (
                  <motion.li key={k} className={k < done ? 'done' : k === done ? 'now' : ''} initial={false} animate={{ opacity: k <= done ? 1 : 0.35, x: k === done ? 8 : 0 }} transition={SPRING}>
                    <span className="check" aria-hidden="true"><svg viewBox="0 0 16 16"><motion.path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" initial={false} animate={{ pathLength: k < done ? 1 : 0 }} transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }} /></svg></span>
                    <b>{t}</b><span>{d}</span>
                  </motion.li>
                ))}
              </ol>
            </div>
            <div className="acct dark-scope" aria-hidden="true">
              <p className="acct-hd"><b>DEMO</b> 모의 계좌<em>예시 화면</em></p>
              <p className="acct-bal"><span>가상 자금</span><strong>$10,000.00</strong></p>
              <ul>
                {MISSIONS.map(([, , a, b], k) => (
                  <motion.li key={k} initial={false} animate={{ opacity: k < done ? 1 : 0, y: k < done ? 0 : 18, scale: k < done ? 1 : 0.96 }} transition={SPRING}><span>{a}</span><b>{b}</b></motion.li>
                ))}
              </ul>
              <div className="acct-prog">
                <svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="4" /><motion.circle cx="22" cy="22" r="18" fill="none" stroke="#FFC247" strokeWidth="4" strokeLinecap="round" transform="rotate(-90 22 22)" initial={false} animate={{ pathLength: done / 4 }} transition={SPRING} /></svg>
                <p><span>미션 진행</span><strong>{done} / 4</strong></p>
              </div>
            </div>
          </div>
      </section>
    </>
  );
}

/* ---------- 플랫폼: 카드가 한 장씩 겹쳐 쌓임 ---------- */
const PLATS = [
  ['HFM', '계좌 유형 다양', [['+', '센트, 프리미엄, 제로, 프로 계좌 중 선택'], ['+', '프로 외 계좌는 최소 입금 $0'], ['−', '센트 계좌는 외환과 골드만 거래 가능']]],
  ['XM', '소액 시작', [['+', '최소 입금 $5부터 시작'], ['+', '마이크로 계좌: 1랏 = 1,000 통화 단위'], ['−', '가입 법인에 따라 계좌 유형이 다름']]],
  ['이지스퀘어', '조건 확인 중', [['·', '세부 조건은 확인을 마친 뒤 안내합니다. 먼저 상담으로 문의해 주세요.']]],
  ['국내 증권사 HTS', '상담 시 안내', [['·', '해외선물 정식 계약을 증권사 HTS로 거래하려면, 제휴 증권사 계좌 개설과 HTS 화면 세팅을 안내합니다.'], ['·', '제휴 증권사와 수수료는 상담 시 안내합니다']]],
];
function PlatCard({ i, n, p, data }) {
  const last = i === n - 1;
  const scale = useTransform(p, [i / n, (i + 1) / n], [1, last ? 1 : 0.94]);
  const [name, tag, rows] = data;
  return (
    <div className="plat-slot" style={{ top: `calc(var(--hd) + 28px + ${i * 80}px)` }}>
      <motion.article className={`plat p-${i}`} style={{ scale }}>
        <header><h3>{name}</h3><span>{tag}</span></header>
        <ul>{rows.map(([s, t], k) => <li key={k} className={s === '−' ? 'minus' : s === '·' ? 'dot' : ''}><i aria-hidden="true">{s}</i><span>{t}</span></li>)}</ul>
      </motion.article>
    </div>
  );
}
export function Platforms() {
  const stack = useRef(null);
  const { scrollYProgress } = useScroll({ target: stack, offset: ['start 0.25', 'end 0.75'] });
  return (
    <section className="sec plat-sec" id="platforms" data-tone="light" data-ch="6">
      <div className="wrap plat-in">
        <div className="plat-copy">
          <Up as="p" className="eyebrow">실전 플랫폼</Up>
          <Up as="h2" className="big">실전은<br />MT5 플랫폼에서</Up>
          <Up as="p" className="sub">모의거래를 마치면 조건을 비교해 맞는 플랫폼을 연결합니다. 세팅은 데스크가 함께합니다.</Up>
          <Up as="p" className="note">브로커는 가입 법인마다 규제 기관과 계좌 조건이 다릅니다. 최신 조건은 상담에서 함께 확인합니다.</Up>
        </div>
        <div className="plat-stack" ref={stack}>{PLATS.map((d, i) => <PlatCard key={d[0]} i={i} n={PLATS.length} p={scrollYProgress} data={d} />)}</div>
      </div>
    </section>
  );
}

/* ---------- 상담 폼 두 개 (기존 사이트와 같은 접수처) ---------- */
function ApplyForm({ name, children, label, dark }) {
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const onPhone = (e) => {
    const d = e.target.value.replace(/\D/g, '').slice(0, 11);
    e.target.value = d.length < 4 ? d : d.length < 8 ? `${d.slice(0, 3)}-${d.slice(3)}` : `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(d.length - 4)}`;
    e.target.setCustomValidity('');
  };
  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget, phone = form.elements.phone;
    if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.value)) { phone.setCustomValidity('휴대폰 번호를 확인해 주세요. 예: 010-1234-5678'); phone.reportValidity(); return; }
    window.open(TG, '_blank', 'noopener'); // 신청하면 텔레그램 시그널방을 엶 (누른 순간에 열어야 팝업 차단에 걸리지 않음)
    const body = new URLSearchParams(new FormData(form)).toString();
    setBusy(true);
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
      .then((r) => { setMsg(r.ok ? 'ok' : 'fail'); if (r.ok) form.reset(); })
      .catch(() => setMsg('fail'))
      .finally(() => setBusy(false));
  };
  return (
    <form name={name} method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={onSubmit} className={dark ? 'form dark-scope' : 'form'}>
      <input type="hidden" name="form-name" value={name} />
      <p hidden><label>Skip <input name="bot-field" /></label></p>
      <div className="f-grid">
        <label>이름<input name="fullname" required maxLength={20} autoComplete="name" placeholder="성명" /></label>
        <label>휴대폰 번호<input name="phone" type="tel" inputMode="numeric" required autoComplete="tel" maxLength={13} placeholder="010-0000-0000" onInput={onPhone} /></label>
        {children}
      </div>
      <label className="f-check"><input type="checkbox" name="consent" required />상담 목적의 개인정보(이름, 휴대폰 번호) 수집·이용에 동의합니다.</label>
      <motion.button type="submit" disabled={busy} whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }}>{label}</motion.button>
      {msg && (
        <div className="f-done" role="status">
          <p>{msg === 'ok' ? '신청이 접수됐습니다. ' : ''}텔레그램 시그널방이 열리지 않았다면 아래 버튼을 눌러 주세요.</p>
          <a className="tg-btn" href={TG} target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.7 4.2 2.9 11.100c-1 .4-1 1 .2 1.300l4.400 1.400 1.700 5.200c.200.600.400.800.900.800.400 0 .600-.200.900-.400l2.200-2.100 4.500 3.300c.800.500 1.400.200 1.600-.800l2.900-13.800c.300-1.200-.500-1.700-1.500-1.300zM8.200 13.500l9-5.700c.400-.300.800-.100.500.200l-7.400 6.700-.300 3.100z" /></svg>텔레그램 시그널방 입장</a>
        </div>
      )}
    </form>
  );
}
const Tick = () => <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
export function Forms() {
  return (
    <section className="sec forms-sec" id="apply" data-tone="dark" data-ch="8">
      <div className="wrap forms">
        <motion.div className="apply demo" id="apply-demo" initial={{ opacity: 0, x: -60, rotate: -2 }} whileInView={{ opacity: 1, x: 0, rotate: 0 }} viewport={{ once: true, amount: 0.25 }} transition={SOFT}>
          <p className="kicker">처음이라면</p>
          <h2>모의투자 상담부터<br />신청하세요</h2>
          <p className="sub">MT5 설치부터 첫 모의 주문까지 1:1로 안내합니다. 실제 돈은 들어가지 않습니다.</p>
          <ul className="ticks-l"><li><Tick />MT5 설치와 데모 계좌 개설</li><li><Tick />종목별 랏 계산 연습</li><li><Tick />네 가지 미션 1:1 점검</li></ul>
          <ApplyForm name="desk-demo" label="모의투자 상담 신청">
            <label>관심 종목<select name="instrument"><option>나스닥100</option><option>골드</option><option>WTI 오일</option><option>S&amp;P500</option><option>FX 통화쌍</option><option>비트코인</option><option>잘 모르겠어요</option></select></label>
            <label>MT5 사용 경험<select name="mt5"><option>처음이에요</option><option>설치만 해봤어요</option><option>모의거래 해봤어요</option></select></label>
          </ApplyForm>
        </motion.div>
        <motion.div className="apply live dark-scope" id="apply-live" initial={{ opacity: 0, x: 60, rotate: 2 }} whileInView={{ opacity: 1, x: 0, rotate: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ ...SOFT, delay: 0.1 }}>
          <p className="kicker">바로 매매하려면</p>
          <h2>실전 매매 상담으로<br />바로 연결하세요</h2>
          <p className="sub">플랫폼 선택부터 계좌 연결, 시그널 수신 세팅까지 한 번에 맞춥니다.</p>
          <ul className="ticks-l"><li><Tick />HFM · XM · 이지스퀘어 · 증권사 HTS 조건 비교</li><li><Tick />MT5 세팅과 주문 화면 점검</li><li><Tick />텔레그램 시그널 수신 세팅</li></ul>
          <ApplyForm name="desk-live" label="실전 매매 상담 신청" dark>
            <label>희망 플랫폼<select name="platform"><option>HFM</option><option>XM</option><option>이지스퀘어</option><option>증권사 HTS</option><option>상담 후 결정</option></select></label>
            <label>매매 경험<select name="experience"><option>1년 미만</option><option>1~3년</option><option>3년 이상</option></select></label>
          </ApplyForm>
        </motion.div>
      </div>
      <Up as="p" className="wrap alt"><span>연락처를 남기기 전에 먼저 물어보실 수 있습니다.</span><a className="kakao" href={KAKAO} target="_blank" rel="noopener">카카오톡 오픈채팅으로 문의하기</a></Up>
    </section>
  );
}
