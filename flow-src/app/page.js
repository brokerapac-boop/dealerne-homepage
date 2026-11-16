'use client';
import { useEffect, useRef, useState } from 'react';
import { ReactLenis } from 'lenis/react';
import { MotionConfig, motion, useScroll, useTransform, useInView, animate } from 'motion/react';
import Chart from './Chart';

const TG = 'https://t.me/dealerne';
const SPRING = { type: 'spring', stiffness: 110, damping: 20, mass: 0.9 };

/* 예시 기준가 (실제 시그널이 아님) */
const LV = { entry: 21621.3, stop: 21505.2, target: 21853.6 };
const LINES = [
  { v: LV.target, c: '#C5CBD8', t: '목표' },
  { v: LV.entry, c: '#FFC247', t: '진입' },
  { v: LV.stop, c: '#8FB4FF', t: '손절' },
];
const RISK = LV.entry - LV.stop, REWARD = LV.target - LV.entry;

/* 더미 수급 (실제 자료가 아님) */
const FLOW = [
  { who: '외국인', v: 4820 },
  { who: '기관', v: -3150 },
  { who: '개인', v: -1670 },
];

const INSTS = [
  ['nas', '나스닥100', '기술주 중심의 미국 대표 지수'],
  ['gold', '골드', '금리와 달러에 민감한 대표 안전자산'],
  ['wti', 'WTI 오일', '변동성이 큰 대표 원자재'],
  ['spx', 'S&P500'],
  ['eur', 'FX 통화쌍'],
  ['btc', '비트코인'],
];
const LIST = [
  ['nas', '나스닥100', 'buy', '매수'], ['gold', '골드', 'sell', '매도'], ['wti', 'WTI 오일', '', '대기'],
  ['spx', 'S&P500', '', '대기'], ['eur', 'EUR/USD', '', '대기'], ['btc', '비트코인', '', '대기'],
];
const STEPS = [
  ['종목을', '고릅니다', '나스닥, 골드, 오일부터 통화와 비트코인까지 여섯 종목을 봅니다.'],
  ['기준가를', '먼저 확인합니다', '진입, 손절, 목표를 주문하기 전에 정해 둡니다.'],
  ['MT5 환경을', '연결합니다', 'HFM, XM, 이지스퀘어, 증권사 HTS 가운데 맞는 곳을 함께 고릅니다.'],
  ['시그널은', '텔레그램으로 받습니다', '채널에서 같은 기준을 확인하고, 주문은 직접 합니다.'],
];
const ROAD = [
  ['Lv1', '입문', '선물이 움직이는 방식을 이해합니다'],
  ['Lv2', '차트', '차트를 같은 순서로 읽습니다'],
  ['Lv3', '진입 기준', '들어가는 조건을 글로 적습니다'],
  ['Lv4', '리스크', '잃을 수 있는 크기를 먼저 정합니다'],
  ['Lv5', '실전', '계획대로 실행하고 복기합니다'],
];

/* 첫 화면 문구: 시간차로 떠오르기 */
const rise = (d) => ({ initial: { opacity: 0, y: 44 }, animate: { opacity: 1, y: 0 }, transition: { ...SPRING, delay: 0.15 + d * 0.2 } });

/* 아래에서 위로 떠오르기 */
function Up({ as = 'div', i = 0, children, ...rest }) {
  const M = motion[as];
  return (
    <M initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -12% 0px' }} transition={{ ...SPRING, delay: i * 0.09 }} {...rest}>
      {children}
    </M>
  );
}

/* 숫자 올라가기 */
function Count({ to, from = 0, digits = 0, signed = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const fmt = (v) => (signed ? (v > 0 ? '+' : v < 0 ? '−' : '') : '') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    const c = animate(from, to, { duration: 1.5, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => { if (ref.current) ref.current.textContent = fmt(v); } });
    return () => c.stop();
  }, [inView]);
  return <span ref={ref}>{fmt(to)}</span>;
}

export default function Page() {
  const [active, setActive] = useState(0);
  const [lit, setLit] = useState(0);
  const [smooth, setSmooth] = useState(false);
  const stepRefs = useRef([]);
  const roadRef = useRef(null);

  /* 첫 화면: 내려가면 글이 살짝 올라가며 흐려짐 */
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 700], [0, -70]);
  const heroO = useTransform(scrollY, [0, 620], [1, 0]);
  const heroS = useTransform(scrollY, [0, 700], [1, 0.94]);

  useEffect(() => {
    setSmooth(!window.matchMedia('(prefers-reduced-motion:reduce)').matches);
    const mq = window.matchMedia('(max-width:820px)');
    const tones = [...document.querySelectorAll('main [data-tone]')];
    let tick = false;
    const update = () => {
      tick = false;
      const vh = window.innerHeight, mid = vh * 0.5;
      // 화면 가운데에 있는 구역의 톤으로 전체 배경을 바꿈
      for (const el of tones) {
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) { if (document.body.dataset.tone !== el.dataset.tone) document.body.dataset.tone = el.dataset.tone; break; }
      }
      // 고정 화면: 기준선에 가장 가까운 설명 단계
      const line = mq.matches ? vh * 0.74 : mid; let best = 0, bd = Infinity;
      stepRefs.current.forEach((s, k) => {
        if (!s) return; const b = s.getBoundingClientRect(), c = mq.matches ? b.top + 70 : b.top + b.height / 2, d = Math.abs(c - line);
        if (d < bd) { bd = d; best = k; }
      });
      setActive(best);
      // 로드맵: 지나간 만큼 켜짐
      if (roadRef.current) {
        const rr = roadRef.current.getBoundingClientRect(), p = (vh * 0.8 - rr.top) / (rr.height + vh * 0.3);
        setLit(Math.max(0, Math.min(ROAD.length, Math.round(p * ROAD.length))));
      }
    };
    const req = () => { if (!tick) { tick = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    update();
    return () => { window.removeEventListener('scroll', req); window.removeEventListener('resize', req); };
  }, []);

  const body = (
    <MotionConfig reducedMotion="user">
      <header className="hd">
        <div className="wrap hd-in">
          <a className="brand" href="#top" aria-label="딜러네 홈"><img src="/logo.webp" alt="" width="34" height="34" /><span>딜러네</span></a>
          <nav className="vswitch" aria-label="서비스 선택">
            <a href="#top" aria-current="page"><span className="vs-dot" aria-hidden="true" />데스크</a>
            <a href="/#academy"><span className="vs-dot" aria-hidden="true" />아카데미</a>
          </nav>
          <a className="btn btn-sm" href={TG} target="_blank" rel="noopener">시그널 받기</a>
        </div>
      </header>

      <main id="top">
        {/* 1. 첫 화면 */}
        <section className="hero" data-tone="dark">
          <Chart className="hero-cv" start={100} seed={11} cw={14} />
          <motion.div className="wrap hero-in" style={{ y: heroY, opacity: heroO, scale: heroS }}>
            <motion.p className="eyebrow" {...rise(0)}>해외선물 매매 어드바이저 · 나스닥 골드 오일</motion.p>
            <h1>
              <motion.span {...rise(1)}>매매 전에</motion.span>
              <motion.span {...rise(2)}>먼저 여는</motion.span>
              <motion.span className="hi" {...rise(3)}>나의 트레이딩 데스크</motion.span>
            </h1>
            <motion.p className="lede" {...rise(4)}>종목별 시그널을 확인하고,<br />연결된 MT5 플랫폼으로 바로 넘어갑니다.</motion.p>
            <motion.div {...rise(5)}><a className="btn" href={TG} target="_blank" rel="noopener">텔레그램에서 시그널 받기</a></motion.div>
          </motion.div>
          <p className="note hero-note">시뮬레이션 차트(300틱) · 실제 시세가 아닙니다</p>
          <span className="scroll-cue" aria-hidden="true" />
        </section>

        {/* 2. 원칙 (밝은 화면) */}
        <section className="sec principles" data-tone="light">
          <div className="wrap">
            <Up as="h2" className="big">같은 실수를 반복하는 이유는<br />매매에 <b>기준이 없기</b> 때문입니다.</Up>
            <div className="three">
              <Up as="article" className="card" i={0}><span className="num">01</span><h3>먼저 기준을 세웁니다</h3><p>방향을 맞히려 하기보다 어디서 들어가고, 어디서 틀렸다고 인정할지 먼저 적어 둡니다.</p></Up>
              <Up as="article" className="card" i={1}><span className="num">02</span><h3>순서를 지켜 배웁니다</h3><p>한 번에 하나의 레벨만 봅니다. 앞 단계가 몸에 붙어야 다음 단계로 올라갑니다.</p></Up>
              <Up as="article" className="card" i={2}><span className="num">03</span><h3>기록으로 확인합니다</h3><p>결과가 아니라 정한 대로 했는지를 일지에 남기고, 복기해서 기준을 고칩니다.</p></Up>
            </div>
          </div>
        </section>

        {/* 3. 고정 화면 + 단계 전환 */}
        <section className="story" id="story" data-tone="light">
          <div className="wrap story-in">
            <div className="phone-col">
              <div className="phone" aria-hidden="true">
                <div className="phone-top"><span>딜러네 데스크</span><em>예시 화면</em></div>
                <div className="screens">
                  {[
                    <><p className="s-title">종목</p><ul className="s-list">{LIST.map(([id, name, cls, tag]) => <li key={id}><img src={`/icons/${id}.webp`} alt="" width="36" height="36" /><span>{name}</span><i className={`tag ${cls}`}>{tag}</i></li>)}</ul></>,
                    <><p className="s-title">나스닥100 <i className="tag buy">매수</i></p><Chart className="s-chart" start={21640} lo={LV.stop} hi={LV.target} seed={23} cw={7} lines={LINES} /><dl className="s-lv"><div><dt className="c-t">목표</dt><dd>21,853.6</dd></div><div><dt className="c-e">진입</dt><dd>21,621.3</dd></div><div><dt className="c-s">손절</dt><dd>21,505.2</dd></div></dl></>,
                    <><p className="s-title">플랫폼 연결</p><ul className="s-plat"><li><b>HFM</b><span>MT5</span></li><li><b>XM</b><span>MT5</span></li><li><b>이지스퀘어</b><span>조건 확인 중</span></li><li className="dash"><b>증권사 HTS</b><span>상담 시 안내</span></li></ul></>,
                    <><p className="s-title">시그널 채널</p><div className="s-chat"><p className="bubble"><b>나스닥100 · 매수</b>진입 21,621.3<br />손절 21,505.2<br />목표 21,853.6</p><p className="bubble sm">기준에 닿지 않으면 주문하지 않습니다.</p><p className="s-fine">예시 메시지 · 실제 시그널이 아닙니다</p></div></>,
                  ].map((el, k) => (
                    <motion.div key={k} className="screen" initial={false} animate={{ opacity: k === active ? 1 : 0, y: k === active ? 0 : k < active ? -30 : 30, scale: k === active ? 1 : 0.96 }} transition={SPRING}>{el}</motion.div>
                  ))}
                </div>
                <div className="phone-dots">{STEPS.map((_, k) => <i key={k} className={k === active ? 'on' : ''} />)}</div>
              </div>
            </div>
            <ol className="steps">
              {STEPS.map(([a, b, p], k) => (
                <motion.li key={k} ref={(el) => { stepRefs.current[k] = el; }} className={`step${k === active ? ' on' : ''}`} initial={false} animate={{ opacity: k === active ? 1 : 0.22, y: k === active ? 0 : 12 }} transition={SPRING}>
                  <span className="num">0{k + 1}</span><h2>{a} <br />{b}</h2><p>{p}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* 4. 어두운 화면으로 전환: 차트 */}
        <section className="sec board-sec" id="board" data-tone="dark">
          <div className="wrap">
            <Up as="p" className="eyebrow">시그널 보드</Up>
            <Up as="h2" className="big">주문 전에,<br /><b>세 개의 가격</b>부터 봅니다.</Up>
            <Up className="board">
              <div className="board-hd"><strong>나스닥100</strong><span>USA100 · US100Cash</span><i className="tag buy">매수</i></div>
              <Chart className="board-cv" start={21640} lo={LV.stop} hi={LV.target} seed={5} cw={11} pad={56} lines={LINES} labels />
              <dl className="lv" id="lv">
                <div><dt className="c-e">진입</dt><dd><Count to={LV.entry} from={LV.entry * 0.985} digits={1} /></dd></div>
                <div><dt className="c-s">손절</dt><dd><Count to={LV.stop} from={LV.stop * 0.985} digits={1} /></dd></div>
                <div><dt className="c-t">목표</dt><dd><Count to={LV.target} from={LV.target * 0.985} digits={1} /></dd></div>
              </dl>
              <dl className="ratio">
                <div><dt>손절 폭</dt><dd><Count to={RISK} digits={1} /> <small>pt</small></dd></div>
                <div><dt>목표 폭</dt><dd><Count to={REWARD} digits={1} /> <small>pt</small></dd></div>
                <div><dt>손익비</dt><dd>1 : <Count to={REWARD / RISK} digits={1} /></dd></div>
              </dl>
            </Up>
            <p className="note">예시 화면 · 300틱 시뮬레이션 차트 · 실제 시세와 시그널이 아닙니다</p>
          </div>
        </section>

        {/* 5. 수급 (더미) */}
        <section className="sec flow-sec" id="flow" data-tone="dark">
          <div className="wrap">
            <Up as="p" className="eyebrow">오늘의 브리핑</Up>
            <Up as="h2" className="big">수급은<br /><b>숫자로</b> 확인합니다.</Up>
            <Up className="flow">
              <p className="flow-hd"><strong>선물 순매수</strong><span>단위: 계약</span><em>더미 데이터</em></p>
              <ul>
                {FLOW.map(({ who, v }, k) => (
                  <li key={who}>
                    <span className="who">{who}</span>
                    <span className="bar"><motion.i className={v > 0 ? 'pos' : 'neg'} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, amount: 0.8 }} transition={{ ...SPRING, delay: 0.15 + k * 0.12 }} style={{ width: `${(Math.abs(v) / 5000) * 50}%` }} /></span>
                    <span className={`val ${v > 0 ? 'pos' : 'neg'}`}><Count to={v} signed /></span>
                  </li>
                ))}
              </ul>
            </Up>
            <p className="note">자리 확인용 더미 숫자입니다 · 실제 수급 자료가 아닙니다</p>
          </div>
        </section>

        {/* 6. 거래 종목 */}
        <section className="sec insts-sec" data-tone="dark">
          <div className="wrap">
            <Up as="p" className="eyebrow">거래 종목</Up>
            <Up as="h2" className="big">여섯 종목,<br />데스크가 함께 봅니다</Up>
          </div>
          <motion.ul className="insts" initial="hide" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
            {INSTS.map(([id, name, desc]) => (
              <motion.li key={id} variants={{ hide: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: SPRING } }}>
                <img src={`/icons/${id}.webp`} alt="" width="96" height="96" loading="lazy" /><h3>{name}</h3>{desc && <p>{desc}</p>}
              </motion.li>
            ))}
          </motion.ul>
        </section>

        {/* 7. 로드맵 (다시 밝은 화면) */}
        <section className="sec road-sec" id="road" data-tone="light">
          <div className="wrap">
            <Up as="p" className="eyebrow">딜러네 아카데미</Up>
            <Up as="h2" className="big">다섯 단계를<br />차례로 채웁니다</Up>
            <ol className="road" ref={roadRef}>
              {ROAD.map(([lv, name, desc], k) => (
                <Up as="li" key={lv} i={k} className={k < lit ? 'lit' : ''}><span>{lv}</span><b>{name}</b><p>{desc}</p></Up>
              ))}
            </ol>
            <Up as="p"><a className="link" href="/#academy">아카데미에서 3분 레벨 진단하기 →</a></Up>
          </div>
        </section>

        {/* 8. 마무리 */}
        <section className="sec end-sec" data-tone="dark">
          <div className="wrap">
            <Up as="h2" className="big">기준은 차트로,<br />시그널은 텔레그램으로.</Up>
            <Up as="p"><a className="btn" href={TG} target="_blank" rel="noopener">텔레그램에서 시그널 받기</a></Up>
            <div className="doors">
              <Up as="a" className="door" i={0} href="/#desk-apply-demo" whileHover={{ y: -4 }}><span>처음이라면</span><b>모의투자 상담 신청</b><i aria-hidden="true">→</i></Up>
              <Up as="a" className="door" i={1} href="/#desk-apply-live" whileHover={{ y: -4 }}><span>바로 매매하려면</span><b>실전 매매 상담 신청</b><i aria-hidden="true">→</i></Up>
            </div>
          </div>
        </section>
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

  /* Lenis: 부드러운 스크롤 (움직임 줄이기 설정이면 끔) */
  return <>{smooth && <ReactLenis root options={{ lerp: 0.1, anchors: true }} />}{body}</>;
}
