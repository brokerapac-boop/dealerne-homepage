/* 딜러네 C타입 설정 파일 — 값만 바꾸면 화면에 반영됩니다.
   지금 들어 있는 값은 샘플입니다(isSample: true). 실제 값으로 바꾼 뒤 isSample을 false로 바꾸세요.
   비워 두면('') 해당 요소는 화면에서 숨겨져요. ([확인 필요] 문구는 화면에 나오지 않아요) */
window.DEALERNE_C = {
  isSample: true,

  ga4Id: '',                       // [확인 필요] GA4 측정 ID (예: G-XXXXXXXXXX). 비어 있으면 이벤트는 콘솔과 window.__events에만 기록돼요.

  broker: {
    name: '샘플증권',               // 샘플 — 제휴 증권사 공식 명칭으로 교체 (비우면 마무리 화면의 증권사 줄이 숨겨져요)
    logo: '',                      // [확인 필요] 로고 이미지 경로 (사용 가능 확인 후)
    url: 'https://open.kakao.com/o/gsSH41Xi',   // 지금은 카카오톡 오픈채팅으로 연결(상담에서 계좌 개설 안내). 제휴 전용 계좌 개설 URL이 생기면 교체
    accountType: '국내선물'          // 샘플 — '국내선물' 또는 '해외선물'
  },

  // 계좌 개설 링크에 붙는 UTM (값을 비우면 붙지 않아요. utm_content에는 첫 화면 문장 안(h_a/h_b/h_c)이 자동으로 들어가요)
  utm: {
    utm_source: 'dealerne',
    utm_medium: 'landing_c',
    utm_campaign: 'account_open'
  },

  // 운영 정보 — 샘플. 비우면 그 연출(시계 알림, LIVE 카운트다운 등)이 숨겨져요.
  schedule: {
    briefingTime: '08:30',         // 브리핑이 올라오는 시각(한국시간, HH:MM). 알림이 오는 시계 연출에 써요.
    liveTime: '21:00',             // LIVE 시작 시각(한국시간, HH:MM). "다음 LIVE까지" 카운트다운에 써요.
    liveDays: [1, 2, 3, 4, 5],     // LIVE 요일 (0=일, 1=월 … 6=토)
    community: '카카오톡 오픈채팅',  // 커뮤니티 운영 채널
    care: '평일 오전 9시~오후 6시'   // 1:1 케어 운영 시간
  },

  // FAQ 항목 — 비워 두면 그 질문은 화면에서 숨겨져요. (확정 전에는 비워 두세요)
  faq: {
    conditions: '',                // 이용 조건
    existingAccount: '',           // 이미 다른 증권사 계좌가 있을 때
    freeWithoutAccount: ''         // 계좌 없이도 볼 수 있는 범위
  },
  riskExtra: '',                   // 투자위험 고지에 덧붙일 승인 문구 (비우면 기본 문구만)

  kakao: {
    url: 'https://open.kakao.com/o/gsSH41Xi'   // 카카오톡 오픈채팅 (E타입 e/data.js의 kakaoUrl과 같은 방)
  },

  // 가이드 스크롤: [계좌 개설하기]를 누르면 화면이 아래로 흘러가고, 맨 아래에서만 계좌 개설 링크가 열려요.
  guidedScroll: {
    enabled: true,                 // false로 바꾸면 처음부터 바로 계좌 개설 링크가 열려요
    dwellStory: 1800,              // 이야기 화면에서 멈추는 기본 시간(ms). 화면마다 HTML의 data-dwell이 우선해요.
    dwellBlock: 1200,              // 아래 정보 영역에서 멈추는 시간(ms)
    unlockAfterBottom: false       // true면 한 번 맨 아래까지 본 뒤에는 어디서든 바로 열려요
  },

  contact: {
    email: ''            // 샘플 — 딜러네 문의 이메일로 교체
  },

  paidCourseUrl: '../#roadmap'     // 유료 강의 안내 링크 (FAQ·푸터에서만 노출)
};
