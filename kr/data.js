/* 딜러네 E타입 수치·후기 데이터 — 이 파일만 고치면 화면에 반영돼요.
   - 값이 비어 있으면('' 또는 빈 배열) 그 칸은 화면에서 숨겨져요.
   - placeholders: true 이면 비어 있는 칸도 "예시 자리" 점선 틀로 보여 줘요(시안 확인용). 실제 배포 때는 false.
   - 수익·수익률 수치, 확인되지 않은 후기는 넣지 마세요. (금융 광고 심의·허위 광고 위험) */
window.DEALERNE_E = {
  kakaoUrl: 'https://open.kakao.com/o/gZ4c0RWi',   // 모든 버튼이 여는 카카오톡 상담방 (비우면 '준비 중' 안내가 떠요)
  placeholders: true,
  proof: {
    title: '함께하는 분들의 이야기',
    rating: { value: '', label: '평점' },            // 예: '4.6' — 실제 조사 결과가 있을 때만
    members: { value: '', label: '함께하는 회원' },   // 예: '1,200+' — 실제 확인된 수만
    // 실제로 동의받은 후기만. 형식: { text:'후기 내용', name:'김OO', date:'2026-11-01' }
    reviews: []
  }
};
