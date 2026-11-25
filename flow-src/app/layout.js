import 'lenis/dist/lenis.css';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://dealerne.com'),
  title: '딜러네 데스크 | 나스닥·골드·오일 매매 데스크',
  description: '거래 종목과 모의거래, MT5 플랫폼 연결을 안내하는 딜러네 데스크. 입문부터 실전까지 다섯 단계로 배우는 딜러네 아카데미.',
  alternates: { canonical: '/' },
  openGraph: {
    title: '딜러네 데스크 · 아카데미',
    description: '매매 전에 먼저 여는 트레이딩 데스크, 기준부터 세우는 아카데미',
    type: 'website',
    url: 'https://dealerne.com/',
    siteName: '딜러네 아카데미 · 데스크',
    locale: 'ko_KR',
    images: [{ url: 'https://dealerne.com/og.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', images: ['https://dealerne.com/og.png'] },
};
export const viewport = { themeColor: '#07090F', viewportFit: 'cover' };

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body data-tone="dark">{children}</body>
    </html>
  );
}
