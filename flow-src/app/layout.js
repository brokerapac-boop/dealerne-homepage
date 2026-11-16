import 'lenis/dist/lenis.css';
import './globals.css';

export const metadata = {
  title: '딜러네 | 스크롤 시안',
  description: '딜러네 메인 페이지 스크롤 시안입니다.',
  robots: { index: false, follow: false },
};
export const viewport = { themeColor: '#07090F', viewportFit: 'cover' };

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
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
