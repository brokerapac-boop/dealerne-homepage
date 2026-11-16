'use client';
import { useEffect, useRef, useState } from 'react';
import { ReactLenis } from 'lenis/react';
import { MotionConfig, motion, useInView } from 'motion/react';
import Chart from './Chart';
import { TG, SPRING, SOFT, Up, Roll } from './kit';
import { Demo, Platforms, Forms } from './More';
import { VizRule, VizSteps, VizJournal, Spark } from './Viz';

/* 예시 기준가 (실제 시그널이 아님) */
const LV = { entry: 21621.3, stop: 21505.2, target: 21853.6 };
const LINES = [
  { v: LV.target, c: '#C5CBD8', t: '목표' },
  { v: LV.entry, c: '#FFC247', t: '진입' },
  { v: LV.stop, c: '#8FB4FF', t: '손절' },
];
const RISK = LV.entry - LV.stop, REWARD = LV.target - LV.entry;
const f1 = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const INSTS = [
  ['nas', '나스닥100', '기술주 중심의 미국 대표 지수', 'USA100', '1계약 (HFM 기준)'],
  ['gold', '골드', '금리와 달러에 민감한 대표 안전자산', 'XAUUSD', '100온스'],
  ['wti', 'WTI 오일', '변동성이 큰 대표 원자재', 'USOIL', '100배럴 (HFM 기준)'],
  ['spx', 'S&P500', '', 'USA500', '상담 시 안내'],
  ['eur', 'FX 통화쌍', '', 'EUR/USD', '100,000 통화 단위'],
  ['btc', '비트코인', '', 'BTCUSD', '상담 시 안내'],
];
const LIST = [
  ['nas', '나스닥100', 'buy', '매수'], ['gold', '골드', 'sell', '매도'], ['wti', 'WTI 오일', '', '대기'],
  ['spx', 'S&P500', '', '대기'], ['eur', 'EUR/USD', '', '대기'], ['btc', '비트코인', '', '대기'],
];
const STEPS = [
  ['종목 고르기', '나스닥, 골드, 오일부터 통화와 비트코인까지 여섯 종목을 봅니다.'],
  ['기준가 확인하기', '진입, 손절, 목표를 주문하기 전에 정해 둡니다.'],
  ['MT5 환경 연결하기', 'HFM, XM, 이지스퀘어, 증권사 HTS 가운데 맞는 곳을 함께 고릅니다.'],
  ['텔레그램으로 받기', '채널에서 같은 기준을 확인하고, 주문은 직접 합니다.'],
];
/* 예전 주소: 아카데미에 있는 구간은 /academy 로, 데스크 구간은 새 위치로 */
const ACADEMY_HASH = ['#academy', '#hero', '#principles', '#roadmap', '#after', '#videos', '#instructor', '#daily', '#faq'];
const DESK_HASH = { '#desk-instruments': '#instruments', '#desk-demo': '#demo', '#desk-platforms': '#platforms', '#desk-apply': '#apply', '#desk-apply-demo': '#apply-demo', '#desk-apply-live': '#apply-live' };
const CHAPTERS = ['데스크', '기준', '순서', '차트', '종목', '모의거래', '플랫폼', '시그널', '상담'];
const STEP_MS = 3800;

/* 첫 화면 문구: 시간차로 떠오르기 */
const rise = (d) => ({ initial: { opacity: 0, y: 44 }, animate: { opacity: 1, y: 0 }, transition: { ...SPRING, delay: 0.15 + d * 0.2 } });

/* 폰 화면 네 단계: 자동으로 넘어가고, 눌러서 고를 수도 있음 */
function Story() {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.35 });
  const [active, setActive] = useState(0);
  const [turn, setTurn] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => { setAuto(!window.matchMedia('(prefers-reduced-motion:reduce)').matches); }, []);
  useEffect(() => {
    if (!inView || !auto) return;
    const t = setTimeout(() => { setActive((a) => (a + 1) % STEPS.length); setTurn((n) => n + 1); }, STEP_MS);
    return () => clearTimeout(t);
  }, [inView, auto, active, turn]);
  const pick = (k) => { setActive(k); setTurn((n) => n + 1); };
  const pops = [
    <><b>나스닥100</b><i className="tag buy">매수</i></>,
    <><span className="c-e">진입</span><b>21,621.3</b></>,
    <><b>HFM</b><span>MT5 연결</span></>,
    <><b>시그널 채널</b><span>@dealerne</span></>,
  ];
  const screens = [
    <><p className="s-title">종목</p><ul className="s-list">{LIST.map(([id, name, cls, tag]) => <li key={id}><img src={`/icons/${id}.webp`} alt="" width="36" height="36" /><span>{name}</span><i className={`tag ${cls}`}>{tag}</i></li>)}</ul></>,
    <><p className="s-title">나스닥100 <i className="tag buy">매수</i></p><Chart className="s-chart" start={21640} lo={LV.stop} hi={LV.target} seed={23} cw={7} lines={LINES} /><dl className="s-lv"><div><dt className="c-t">목표</dt><dd>21,853.6</dd></div><div><dt className="c-e">진입</dt><dd>21,621.3</dd></div><div><dt className="c-s">손절</dt><dd>21,505.2</dd></div></dl></>,
    <><p className="s-title">플랫폼 연결</p><ul className="s-plat"><li><b>HFM</b><span>MT5</span></li><li><b>XM</b><span>MT5</span></li><li><b>이지스퀘어</b><span>조건 확인 중</span></li><li className="dash"><b>증권사 HTS</b><span>상담 시 안내</span></li></ul></>,
    <><p className="s-title">시그널 채널</p><div className="s-chat"><p className="bubble"><b>나스닥100 · 매수</b>진입 21,621.3<br />손절 21,505.2<br />목표 21,853.6</p><p className="bubble sm">기준에 닿지 않으면 주문하지 않습니다.</p><p className="s-fine">예시 메시지 · 실제 시그널이 아닙니다</p></div></>,
  ];
  return (
    <section ref={ref} className="sec story" id="story" data-tone="light" data-ch="2">
      <div className="wrap story-in">
        <div className="acc">
          <Up as="h2" className="acc-t">시그널을 받기까지, <br />네 단계면 됩니다</Up>
          <ol>
            {STEPS.map(([t, d], k) => (
              <li key={k} className={k === active ? 'on' : ''}>
                <h3><button type="button" onClick={() => pick(k)} aria-expanded={k === active}><span className="num">0{k + 1}</span>{t}</button></h3>
                <motion.div className="acc-body" initial={false} animate={{ height: k === active ? 'auto' : 0, opacity: k === active ? 1 : 0 }} transition={SPRING}><p>{d}</p></motion.div>
                <span className="acc-bar">{k === active && auto && <motion.i key={turn} initial={{ scaleX: 0 }} animate={{ scaleX: inView ? 1 : 0 }} transition={{ duration: STEP_MS / 1000, ease: 'linear' }} />}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="phone-col">
          <motion.div className="phone-3d" style={{ rotateY: -16, rotateX: 6, rotateZ: 2 }} animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
            <div className="phone" aria-hidden="true">
              <div className="phone-top"><span>딜러네 데스크</span><em>예시 화면</em></div>
              <div className="screens">
                {screens.map((el, k) => (
                  <motion.div key={k} className="screen" initial={false} animate={{ opacity: k === active ? 1 : 0, y: k === active ? 0 : k < active ? -30 : 30, scale: k === active ? 1 : 0.96 }} transition={SPRING}>{el}</motion.div>
                ))}
              </div>
              <div className="phone-dots">{STEPS.map((_, k) => <i key={k} className={k === active ? 'on' : ''} />)}</div>
            </div>
            {pops.map((el, k) => (
              <motion.div key={k} className={`pop pop-${k}`} aria-hidden="true" initial={false} animate={{ opacity: k === active ? 1 : 0, x: k === active ? 0 : 40, z: k === active ? 90 : 0, scale: k === active ? 1 : 0.8 }} transition={{ ...SOFT, delay: k === active ? 0.12 : 0 }}>{el}</motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  const [smooth, setSmooth] = useState(false);
  const [ch, setCh] = useState(0);

  useEffect(() => {
    const route = (wait) => {
      const h = location.hash;
      if (ACADEMY_HASH.includes(h)) { location.replace('/academy' + h); return true; }
      const target = DESK_HASH[h] || (wait && /^#[a-z-]+$/.test(h) ? h : null);
      if (target) setTimeout(() => document.querySelector(target)?.scrollIntoView(), wait);
      return false;
    };
    if (route(500)) return;
    const onHash = () => route(0);
    window.addEventListener('hashchange', onHash);
    setSmooth(!window.matchMedia('(prefers-reduced-motion:reduce)').matches);
    let tick = false;
    const update = () => {
      tick = false;
      const mid = window.innerHeight * 0.5;
      // 화면 가운데에 있는 구역의 톤으로 전체 배경을 바꿈
      for (const el of document.querySelectorAll('main [data-tone]')) {
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) {
          if (document.body.dataset.tone !== el.dataset.tone) document.body.dataset.tone = el.dataset.tone;
          setCh(+el.dataset.ch);
          break;
        }
      }
    };
    const req = () => { if (!tick) { tick = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    update();
    return () => { window.removeEventListener('hashchange', onHash); window.removeEventListener('scroll', req); window.removeEventListener('resize', req); };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {smooth && <ReactLenis root options={{ lerp: 0.1, anchors: true }} />}
      <header className="hd">
        <div className="wrap hd-in">
          <a className="brand" href="#top" aria-label="딜러네 홈"><img src="/logo.webp" alt="" width="34" height="34" /><span>딜러네</span></a>
          <nav className="vswitch" aria-label="서비스 선택">
            <a href="#top" aria-current="page"><span className="vs-dot" aria-hidden="true" />데스크</a>
            <a href="/academy"><span className="vs-dot" aria-hidden="true" />아카데미</a>
          </nav>
          <a className="btn btn-sm" href={TG} target="_blank" rel="noopener">시그널 받기</a>
        </div>
      </header>

      {/* 왼쪽 진행 표시 */}
      <nav className="ticks" aria-label="구간">
        {CHAPTERS.map((c, k) => <a key={c} href={`#ch${k}`} className={k === ch ? 'on' : ''} aria-label={c} onClick={(e) => { e.preventDefault(); document.querySelector(`[data-ch="${k}"]`).scrollIntoView({ behavior: 'smooth' }); }}><span>{c}</span></a>)}
      </nav>

      <main>
        {/* 1. 첫 화면 */}
        <section className="hero" id="top" data-tone="dark" data-ch="0">
          <div className="frame dark-scope">
            <Chart className="hero-cv" start={100} seed={11} cw={14} />
            <div className="wrap hero-in">
              <motion.p className="eyebrow" {...rise(0)}>해외선물 매매 어드바이저 · 나스닥 골드 오일</motion.p>
              <h1>
                <motion.span {...rise(1)}>매매 전에</motion.span>
                <motion.span {...rise(2)}>먼저 여는</motion.span>
                <motion.span className="hi" {...rise(3)}>나의 트레이딩 데스크</motion.span>
              </h1>
              <motion.p className="lede" {...rise(4)}>종목별 시그널을 확인하고,<br />연결된 MT5 플랫폼으로 바로 넘어갑니다.</motion.p>
              <motion.div {...rise(5)}><a className="btn" href={TG} target="_blank" rel="noopener">텔레그램에서 시그널 받기</a></motion.div>
            </div>
            <p className="note hero-note">시뮬레이션 차트(300틱) · 실제 시세가 아닙니다</p>
          </div>
        </section>

        {/* 2. 기준 */}
        <section className="sec principles" data-tone="light" data-ch="1">
          <div className="wrap">
            <Up as="h2" className="big say-h">같은 실수를 반복하는 이유는<br />매매에 <b>기준이 없기</b> 때문입니다</Up>
            <div className="three">
              <Up as="article" className="card vcard" i={0}><div className="vbox"><VizRule /></div><span className="num">01</span><h3>먼저 기준을 세웁니다</h3><p>방향을 맞히려 하기보다 어디서 들어가고, 어디서 틀렸다고 인정할지 먼저 적어 둡니다.</p></Up>
              <Up as="article" className="card vcard" i={1}><div className="vbox"><VizSteps /></div><span className="num">02</span><h3>순서를 지켜 배웁니다</h3><p>한 번에 하나의 레벨만 봅니다. 앞 단계가 몸에 붙어야 다음 단계로 올라갑니다.</p></Up>
              <Up as="article" className="card vcard" i={2}><div className="vbox"><VizJournal /></div><span className="num">03</span><h3>기록으로 확인합니다</h3><p>결과가 아니라 정한 대로 했는지를 일지에 남기고, 복기해서 기준을 고칩니다.</p></Up>
            </div>
          </div>
        </section>

        {/* 3. 네 단계 */}
        <Story />

        {/* 4. 가격 세 개 + 차트 */}
        <section className="sec board-sec" id="board" data-tone="dark" data-ch="3">
          <div className="wrap">
            <Up as="h2" className="big">낯선 용어가 많아도<br />볼 것은 <b>가격 세 개</b>입니다</Up>
            <Up className="board">
              <div className="board-hd"><strong>나스닥100</strong><span>USA100 · US100Cash</span><i className="tag buy">매수</i></div>
              <Chart className="board-cv" start={21640} lo={LV.stop} hi={LV.target} seed={5} cw={11} pad={56} lines={LINES} labels />
              <dl className="lv" id="lv">
                <div><dt className="c-e">진입</dt><dd><Roll value={f1(LV.entry)} /></dd></div>
                <div><dt className="c-s">손절</dt><dd><Roll value={f1(LV.stop)} /></dd></div>
                <div><dt className="c-t">목표</dt><dd><Roll value={f1(LV.target)} /></dd></div>
              </dl>
              <dl className="ratio">
                <div><dt>손절 폭</dt><dd><Roll value={f1(RISK)} /> <small>pt</small></dd></div>
                <div><dt>목표 폭</dt><dd><Roll value={f1(REWARD)} /> <small>pt</small></dd></div>
                <div><dt>손익비</dt><dd>1 : <Roll value={f1(REWARD / RISK)} /></dd></div>
              </dl>
            </Up>
            <p className="note">예시 화면 · 300틱 시뮬레이션 차트 · 실제 시세와 시그널이 아닙니다</p>
          </div>
        </section>

        {/* 5. 거래 종목 */}
        <section className="sec insts-sec" id="instruments" data-tone="dark" data-ch="4">
          <div className="wrap">
            <Up as="p" className="eyebrow">거래 종목</Up>
            <Up as="h2" className="big">여섯 종목,<br />데스크가 함께 봅니다</Up>
          </div>
          <motion.ul className="insts" initial="hide" whileInView="show" viewport={{ once: true, amount: 0.12 }} variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
            {INSTS.map(([id, name, desc, sym, lot], k) => (
              <motion.li key={id} variants={{ hide: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: SPRING } }} style={{ transformPerspective: 900 }} whileHover={{ y: -8, rotateX: 4, rotateY: -4 }}>
                <span className="sym">{sym}</span>
                <div className="ivis"><motion.img src={`/icons/${id}.webp`} alt="" width="120" height="120" loading="lazy" animate={{ y: [0, -8, 0] }} transition={{ duration: 4 + k * 0.4, repeat: Infinity, ease: 'easeInOut' }} /><Spark seed={k + 1} /></div>
                <h3>{name}</h3><p>{desc || ' '}</p>
                <p className="lot"><span>1랏</span><b>{lot}</b></p>
              </motion.li>
            ))}
          </motion.ul>
        </section>

        {/* 6. 모의거래, 7. 플랫폼 */}
        <Demo />
        <Platforms />

        {/* 8. 시그널 */}
        <section className="sec end-sec" data-tone="dark" data-ch="7">
          <div className="wrap">
            <Up as="h2" className="big">기준은 차트로,<br />시그널은 텔레그램으로</Up>
            <Up as="p"><a className="btn" href={TG} target="_blank" rel="noopener">텔레그램에서 시그널 받기</a></Up>
          </div>
        </section>

        {/* 9. 상담 */}
        <Forms />
      </main>

      <section className="risk">
        <div className="wrap">
          <b>투자위험 고지</b>
          <p>이 사이트의 영상, 시그널과 자료는 교육용 정보이며, 특정 상품의 매매 권유나 투자자문이 아닙니다. 수익을 보장하지 않습니다. 선물, CFD, FX 같은 레버리지 상품은 투자 원금을 넘는 손실이 날 수 있고, 과거 사례가 앞으로의 결과를 뜻하지 않습니다. 투자 판단과 그 결과는 본인의 책임입니다.</p>
          <p className="foot">© 2026 딜러네 아카데미 · 딜러네 데스크 · (주)맨큐</p>
        </div>
      </section>

      <div className="sample-flag">SAMPLE DRAFT</div>
    </MotionConfig>
  );
}
