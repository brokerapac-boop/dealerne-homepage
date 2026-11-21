'use client';
import { useRef } from 'react';
import { motion, useScroll, useInView } from 'motion/react';

export const TG = 'https://t.me/dealerne';
export const KAKAO = 'https://open.kakao.com/o/gsSH41Xi';
export const YOUTUBE = 'https://www.youtube.com/@%EB%94%9C%EB%9F%AC%EB%84%A4';
export const SPRING = { type: 'spring', stiffness: 110, damping: 20, mass: 0.9 };
export const SOFT = { type: 'spring', stiffness: 70, damping: 18 };

/* 구역이 화면에 고정돼 있는 동안의 진행도(0~1) */
export function usePin() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  return [ref, scrollYProgress];
}

/* 아래에서 위로 떠오르기 */
export function Up({ as = 'div', i = 0, children, ...rest }) {
  const M = motion[as];
  return <M initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -12% 0px' }} transition={{ ...SPRING, delay: i * 0.09 }} {...rest}>{children}</M>;
}

/* 숫자가 자리마다 굴러서 멈춤 */
export function Roll({ value, on }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const go = on === undefined ? seen : on;
  return (
    <span className="roll" ref={ref} role="text" aria-label={value}>
      {[...value].map((ch, i) => /\d/.test(ch)
        ? <span className="roll-col" key={i} aria-hidden="true"><motion.span className="roll-strip" initial={false} animate={{ y: go ? `-${+ch * 1.15}em` : '0em' }} transition={{ type: 'spring', stiffness: 55, damping: 15, delay: i * 0.06 }}>{'0123456789'.split('').map((d) => <span key={d}>{d}</span>)}</motion.span></span>
        : <span key={i} aria-hidden="true">{ch}</span>)}
    </span>
  );
}
