/** 정적 내보내기: `npm run build` 결과(out/)를 com/ 에 복사해 올립니다. (dealerne.com 첫 화면) */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
