'use client';
import { useEffect, useRef, useState } from 'react';
import { ReactLenis } from 'lenis/react';
import { MotionConfig, motion, useTransform, useMotionTemplate, useMotionValueEvent } from 'motion/react';
import Chart from './Chart';
import { TG, SPRING, SOFT, usePin, Up, Roll } from './kit';
import { Demo, Platforms, Instructor, Videos, Forms } from './More';

/* 예시 기준가 (실제 시그널이 아님) */
const LV = { entry: 21621.3, stop: 21505.2, target: 21853.6 };
const LINES = [
  { v: LV.target, c: '#C5CBD8', t: '목표' },
  { v: LV.entry, c: '#FFC247', t: '진입' },
  { v: LV.stop, c: '#8FB4FF', t: '손절' },
];
const RISK = LV.entry - LV.stop, REWARD = LV.target - LV.entry;
const f1 = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/* 더미 수급 (실제 자료가 아님) */
const FLOW = [{ who: '외국인', v: 4820 }, { who: '기관', v: -3150 }, { who: '개인', v: -1670 }];

const INSTS = [
  ['nas', '나스닥100', '기술주 중심의 미국 대표 지수', 'USA100'],
  ['gold', '골드', '금리와 달러에 민감한 대표 안전자산', 'XAUUSD'],
  ['wti', 'WTI 오일', '변동성이 큰 대표 원자재', 'USOIL'],
  ['spx', 'S&P500', '', 'USA500'],
  ['eur', 'FX 통화쌍', '', 'EUR/USD'],
  ['btc', '비트코인', '', 'BTCUSD'],
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
const ROAD = [
  ['Lv1', '입문', '선물이 움직이는 방식을 이해합니다'],
  ['Lv2', '차트', '차트를 같은 순서로 읽습니다'],
  ['Lv3', '진입 기준', '들어가는 조건을 글로 적습니다'],
  ['Lv4', '리스크', '잃을 수 있는 크기를 먼저 정합니다'],
  ['Lv5', '실전', '계획대로 실행하고 복기합니다'],
];
const SAY = ['같은', '실수를', '반복하는', '이유는', '매매에', '*기준이', '*없기', '때문입니다.'];
/* 낯선 용어들: [글자, 가로 vw, 세로 vh, 크기] */
const CLOUD = [
  ['증거금', -34, -26, 1.5], ['레버리지', 28, -30, 1.9], ['랏', -12, -34, 1.2], ['틱', 40, -6, 1.3],
  ['스프레드', -40, 4, 1.7], ['롤오버', 34, 22, 1.4], ['마진콜', -26, 28, 1.8], ['슬리피지', 8, 34, 1.3],
  ['헤지', -6, 16, 1.1], ['포지션', 16, -14, 1.4], ['익절', -18, -8, 1.2], ['스왑', 44, -24, 1.1],
];
const ACADEMY_HASH = ['#academy', '#hero', '#principles', '#roadmap', '#after', '#daily', '#faq'];
const DESK_HASH = { '#desk-instruments': '#instruments', '#desk-demo': '#demo', '#desk-platforms': '#platforms', '#desk-apply': '#apply', '#desk-apply-demo': '#apply-demo', '#desk-apply-live': '#apply-live' };
const CHAPTERS = ['데스크', '기준', '순서', '차트', '수급', '종목', '모의거래', '플랫폼', '아카데미', '강사', '영상', '시그널', '상담'];

const rise = (d) => ({ initial: { opacity: 0, y: 44 }, animate: { opacity: 1, y: 0 }, transition: { ...SPRING, delay: 0.15 + d * 0.2 } });

/* 1. 첫 화면: 전체 화면 차트가 스크롤에 따라 둥근 카드로 줄어듦 */
function Hero() {
  const [ref, p] = usePin();
  const scale = useTransform(p, [0.18, 0.8], [1, 0.82]);
  const radius = useTransform(p, [0.18, 0.8], [0, 48]);
  const textY = useTransform(p, [0, 0.8], [0, -36]);
  const cap = useTransform(p, [0.55, 0.85], [0, 1]);
  const capY = useTransform(p, [0.55, 0.85], [24, 0]);
  return (
    <section ref={ref} className="pin hero" id="top" data-ch="0" style={{ height: '230svh' }}>
      <i className="tone-mark" data-tone="dark" style={{ top: 0, height: '36%' }} />
      <i className="tone-mark" data-tone="light" style={{ top: '36%', height: '64%' }} />
      <div className="pin-stage">
        <motion.div className="frame dark-scope" style={{ scale, borderRadius: radius }}>
          <Chart className="hero-cv" start={100} seed={11} cw={14} />
          <motion.div className="wrap hero-in" style={{ y: textY }}>
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
        </motion.div>
        <motion.p className="hero-cap" style={{ opacity: cap, y: capY }}>차트를 열기 전에, 기준부터 봅니다.</motion.p>
      </div>
    </section>
  );
}

/* 2. 문장이 스크롤에 맞춰 한 단어씩 켜짐 */
function Word({ p, i, n, children, strong }) {
  const a = 0.08 + (i / n) * 0.7;
  const o = useTransform(p, [a, a + 0.7 / n + 0.05], [0.13, 1]);
  return <motion.span className={strong ? 'w strong' : 'w'} style={{ opacity: o }}>{children} </motion.span>;
}
function Statement() {
  const [ref, p] = usePin();
  return (
    <section ref={ref} className="pin say" data-tone="light" data-ch="1" style={{ height: '220svh' }}>
      <div className="pin-stage"><h2 className="wrap say-t">{SAY.map((w, i) => <Word key={i} p={p} i={i} n={SAY.length} strong={w[0] === '*'}>{w.replace('*', '')}</Word>)}</h2></div>
    </section>
  );
}

/* 3. 고정된 폰(입체) + 목록이 스크롤에 따라 넘어감 */
function Story() {
  const [ref, p] = usePin();
  const [active, setActive] = useState(0);
  useMotionValueEvent(p, 'change', (v) => setActive(Math.min(3, Math.floor(v * 4.2))));
  const ry = useTransform(p, [0, 1], [-24, -8]);
  const rx = useTransform(p, [0, 1], [10, 3]);
  const rz = useTransform(p, [0, 1], [4, 0]);
  const bar = useTransform(p, (v) => Math.min(1, (v * 4.2) % 1.0001));
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
    <section ref={ref} className="pin story" id="story" data-tone="light" data-ch="2" style={{ height: '520svh' }}>
      <div className="pin-stage">
        <div className="wrap story-in">
          <div className="acc">
            <h2 className="acc-t">시그널을 받기까지,<br />네 단계면 됩니다</h2>
            <ol>
              {STEPS.map(([t, d], k) => (
                <li key={k} className={k === active ? 'on' : ''} data-step={k}>
                  <h3><span className="num">0{k + 1}</span>{t}</h3>
                  <motion.div className="acc-body" initial={false} animate={{ height: k === active ? 'auto' : 0, opacity: k === active ? 1 : 0 }} transition={SPRING}><p>{d}</p></motion.div>
                  <span className="acc-bar">{k === active && <motion.i style={{ scaleX: bar }} />}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="phone-col">
            <motion.div className="phone-3d" style={{ rotateY: ry, rotateX: rx, rotateZ: rz }}>
              <div className="phone" aria-hidden="true">
                <div className="phone-top"><span>딜러네 데스크</span><em>예시 화면</em></div>
                <div className="screens">
                  {screens.map((el, k) => (
                    <motion.div key={k} className="screen" data-on={k === active} initial={false} animate={{ opacity: k === active ? 1 : 0, y: k === active ? 0 : k < active ? -30 : 30, scale: k === active ? 1 : 0.96 }} transition={SPRING}>{el}</motion.div>
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
      </div>
    </section>
  );
}

/* 4. 흩어진 용어가 모이며 한 문장으로 */
function CloudWord({ p, w }) {
  const [t, ox, oy, s] = w;
  const x = useTransform(p, [0, 0.62], [`${ox}vw`, '0vw']);
  const y = useTransform(p, [0, 0.62], [`${oy}vh`, '0vh']);
  const o = useTransform(p, [0, 0.35, 0.62], [0.75, 0.5, 0]);
  const sc = useTransform(p, [0, 0.62], [1, 0.4]);
  return <motion.span style={{ x, y, opacity: o, scale: sc, fontSize: `${s}em` }}>{t}</motion.span>;
}
function Cloud() {
  const [ref, p] = usePin();
  const o = useTransform(p, [0.45, 0.72], [0, 1]);
  const sc = useTransform(p, [0.45, 0.8], [0.86, 1]);
  return (
    <section ref={ref} className="pin cloud" data-tone="dark" data-ch="3" style={{ height: '240svh' }}>
      <div className="pin-stage">
        <div className="cloud-words" aria-hidden="true">{CLOUD.map((w) => <CloudWord key={w[0]} p={p} w={w} />)}</div>
        <motion.h2 className="big cloud-t" style={{ opacity: o, scale: sc }}>낯선 용어가 많아도<br />볼 것은 <b>가격 세 개</b>입니다.</motion.h2>
      </div>
    </section>
  );
}

/* 6. 종목: 세로 스크롤이 가로 이동으로 바뀜 (넓은 화면) */
function Insts({ mobile }) {
  const [ref, p] = usePin();
  const track = useRef(null), max = useRef(0);
  useEffect(() => {
    const m = () => { if (track.current) max.current = Math.max(0, track.current.scrollWidth - window.innerWidth); };
    m(); window.addEventListener('resize', m); return () => window.removeEventListener('resize', m);
  }, [mobile]);
  const x = useTransform(p, (v) => -Math.min(1, Math.max(0, (v - 0.08) / 0.84)) * max.current);
  return (
    <section ref={ref} id="instruments" className={mobile ? 'sec insts-sec' : 'pin insts-sec'} data-tone="dark" data-ch="5" style={mobile ? undefined : { height: '320svh' }}>
      <div className={mobile ? '' : 'pin-stage col'}>
        <div className="wrap">
          <Up as="p" className="eyebrow">거래 종목</Up>
          <Up as="h2" className="big">여섯 종목,<br />데스크가 함께 봅니다</Up>
        </div>
        <motion.ul ref={track} className="insts" style={mobile ? undefined : { x }}>
          {INSTS.map(([id, name, desc, sym], k) => (
            <li key={id}><span className="sym">{sym}</span><motion.img src={`/icons/${id}.webp`} alt="" width="120" height="120" loading="lazy" animate={{ y: [0, -8, 0] }} transition={{ duration: 4 + k * 0.4, repeat: Infinity, ease: 'easeInOut' }} /><h3>{name}</h3>{desc && <p>{desc}</p>}</li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

/* 7. 로드맵: 스크롤만큼 선이 차오름 */
function Road() {
  const [ref, p] = usePin();
  const [lit, setLit] = useState(0);
  useMotionValueEvent(p, 'change', (v) => setLit(Math.min(ROAD.length, Math.floor(v * 5.6) + 1)));
  const fill = useTransform(p, [0, 0.9], [0.08, 1]);
  return (
    <section ref={ref} className="pin road-sec" id="road" data-tone="light" data-ch="8" style={{ height: '300svh' }}>
      <div className="pin-stage">
        <div className="wrap">
          <p className="eyebrow">딜러네 아카데미</p>
          <h2 className="big">다섯 단계를<br />차례로 채웁니다</h2>
          <div className="road-wrap">
            <span className="road-line"><motion.i style={{ '--p': fill }} /></span>
            <ol className="road">
              {ROAD.map(([lv, name, desc], k) => (
                <motion.li key={lv} className={k < lit ? 'lit' : ''} initial={false} animate={{ opacity: k < lit ? 1 : 0.3, y: k === lit - 1 ? -10 : 0 }} transition={SPRING}><i className="dot" /><span>{lv}</span><b>{name}</b><p>{desc}</p></motion.li>
              ))}
            </ol>
          </div>
          <p><a className="link" href="/academy">아카데미에서 3분 레벨 진단하기 →</a></p>
        </div>
      </div>
    </section>
  );
}

/* 8. 마무리: 노란 원이 화면 전체로 퍼짐 */
function Finale() {
  const [ref, p] = usePin();
  const r = useTransform(p, [0.12, 0.82], [0, 130]);
  const clip = useMotionTemplate`circle(${r}% at 50% 64%)`;
  return (
    <section ref={ref} className="pin end-sec" data-tone="dark" data-ch="11" style={{ height: '230svh' }}>
      <div className="pin-stage">
        <div className="end-layer"><h2 className="big">기준은 차트로,</h2><span className="btn ghost" aria-hidden="true">텔레그램에서 시그널 받기</span></div>
        <motion.div className="end-layer accent" style={{ clipPath: clip }}><h2 className="big">시그널은 텔레그램으로.</h2><a className="btn dark" href={TG} target="_blank" rel="noopener">텔레그램에서 시그널 받기</a></motion.div>
      </div>
    </section>
  );
}

export default function Page() {
  const [smooth, setSmooth] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [ch, setCh] = useState(0);

  useEffect(() => {
    // 예전 주소로 들어온 경우: 아카데미 구역은 /academy 로, 데스크 구역은 새 위치로 보냄
    const route = (wait) => {
      const h = location.hash;
      if (ACADEMY_HASH.includes(h)) { location.replace('/academy' + h); return true; }
      const target = DESK_HASH[h] || (wait && /^#[a-z-]+$/.test(h) ? h : null);
      // 화면 폭에 따라 구간 높이가 정해진 뒤에 이동해야 위치가 맞음
      if (target) setTimeout(() => document.querySelector(target)?.scrollIntoView(), wait);
      return false;
    };
    if (route(700)) return;
    const onHash = () => route(0);
    window.addEventListener('hashchange', onHash);
    setSmooth(!window.matchMedia('(prefers-reduced-motion:reduce)').matches);
    const mq = window.matchMedia('(max-width:820px)');
    const onMq = () => setMobile(mq.matches); onMq(); mq.addEventListener('change', onMq);
    let tick = false;
    const update = () => {
      tick = false;
      const mid = window.innerHeight * 0.5;
      // 화면 가운데에 있는 구역의 톤으로 전체 배경을 바꿈
      for (const el of document.querySelectorAll('main [data-tone]')) {
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) { if (document.body.dataset.tone !== el.dataset.tone) document.body.dataset.tone = el.dataset.tone; break; }
      }
      for (const el of document.querySelectorAll('main [data-ch]')) {
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) { setCh(+el.dataset.ch); break; }
      }
    };
    const req = () => { if (!tick) { tick = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    update();
    return () => { window.removeEventListener('hashchange', onHash); mq.removeEventListener('change', onMq); window.removeEventListener('scroll', req); window.removeEventListener('resize', req); };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {smooth && <ReactLenis root options={{ lerp: 0.09, anchors: true }} />}
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
        <Hero />
        <Statement />

        <section className="sec principles" data-tone="light" data-ch="1">
          <div className="wrap three">
            <Up as="article" className="card" i={0}><span className="num">01</span><h3>먼저 기준을 세웁니다</h3><p>방향을 맞히려 하기보다 어디서 들어가고, 어디서 틀렸다고 인정할지 먼저 적어 둡니다.</p></Up>
            <Up as="article" className="card" i={1}><span className="num">02</span><h3>순서를 지켜 배웁니다</h3><p>한 번에 하나의 레벨만 봅니다. 앞 단계가 몸에 붙어야 다음 단계로 올라갑니다.</p></Up>
            <Up as="article" className="card" i={2}><span className="num">03</span><h3>기록으로 확인합니다</h3><p>결과가 아니라 정한 대로 했는지를 일지에 남기고, 복기해서 기준을 고칩니다.</p></Up>
          </div>
        </section>

        <Story />
        <Cloud />

        {/* 4-2. 차트 + 가격 세 개 */}
        <section className="sec board-sec" id="board" data-tone="dark" data-ch="3">
          <div className="wrap">
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

        {/* 5. 수급 (더미) */}
        <section className="sec flow-sec" id="flow" data-tone="dark" data-ch="4">
          <div className="wrap">
            <Up as="p" className="eyebrow">오늘의 브리핑</Up>
            <Up as="h2" className="big">수급은<br /><b>숫자로</b> 확인합니다.</Up>
            <Up className="flow">
              <p className="flow-hd"><strong>선물 순매수</strong><span>단위: 계약</span><em>더미 데이터</em></p>
              <ul>
                {FLOW.map(({ who, v }, k) => (
                  <li key={who}>
                    <span className="who">{who}</span>
                    <span className="bar"><motion.i className={v > 0 ? 'pos' : 'neg'} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, amount: 0.8 }} transition={{ ...SOFT, delay: 0.15 + k * 0.14 }} style={{ width: `${(Math.abs(v) / 5000) * 50}%` }} /></span>
                    <span className={`val ${v > 0 ? 'pos' : 'neg'}`}><Roll value={(v > 0 ? '+' : '−') + Math.abs(v).toLocaleString('en-US')} /></span>
                  </li>
                ))}
              </ul>
            </Up>
            <p className="note">자리 확인용 더미 숫자입니다 · 실제 수급 자료가 아닙니다</p>
          </div>
        </section>

        <Insts mobile={mobile} />
        <Demo />
        <Platforms />
        <Road />
        <Instructor />
        <Videos />
        <Finale />
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
