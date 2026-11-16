/** 정적 내보내기: `npm run build` 결과(out/)를 com/flow/ 에 복사해 올립니다. */
const nextConfig = {
  output: 'export',
  basePath: '/flow',
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
