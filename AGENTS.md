# 딜러네 홈페이지 작업 규칙 (AI 도구와 사람 모두 이 문서를 먼저 읽습니다)

이 저장소는 공개 저장소입니다. 비밀번호, 토큰, 개인정보, 내부 자료를 넣지 않습니다.

## 이 저장소가 하는 일
딜러네(선물 트레이딩 교육, 강사 박호두, 유튜브 @딜러네)의 홈페이지 두 개를 담고 있습니다.
빌드 과정이 없는 정적 사이트입니다. 폴더 안의 파일이 그대로 사이트에 올라갑니다.

| 폴더 | 실제 주소 | 내용 |
|---|---|---|
| `com/` | https://dealerne.com | 딜러네 아카데미 (어두운 테마, 로드맵, 레벨 진단, 상담 폼) |
| `kr/` | https://dealerne.co.kr | 딜러네 커뮤니티형 랜딩 (밝은 테마, 카톡 무료 상담 유도) |

## 배포 방식
- `main` 브랜치에 들어간 변경은 Netlify가 자동으로 실제 사이트에 올립니다.
- 그래서 **`main`에 직접 올리지 않습니다.** 새 브랜치에서 고치고 Pull Request(PR)를 엽니다.
- PR을 열면 미리보기 주소가 PR 댓글로 달립니다. (`https://deploy-preview-PR번호--dealerne-academy-draft-6406.netlify.app`, `https://deploy-preview-PR번호--dealerne-community.netlify.app`) 미리보기를 확인한 뒤 PR을 병합(Merge)하면 실제 사이트에 반영됩니다.
- 잘못 올라갔으면 해당 PR을 되돌리면(Revert) 이전 상태로 돌아갑니다.

## 파일 안내
### `com/` (dealerne.com)
- `index.html`: 화면의 글과 구조. 문구 수정은 대부분 여기서 합니다.
- `style.css`: 색, 글자 크기, 간격. 파일 끝에 덧붙인 보정 규칙들이 있으니 지우지 않습니다.
- `script.js`: 시뮬레이션 차트, 레벨 진단(문항은 `Q`, 결과는 `RES`), 영상 재생, 상담 폼.
- 상담 폼(`form[name="apply"]`)은 Netlify Forms로 접수됩니다. `name="apply"`, `data-netlify="true"`, 숨은 `form-name` 입력, `bot-field`는 지우거나 이름을 바꾸지 않습니다. 입력 칸 이름(`nickname`, `phone`, `level`, `consent`)을 바꾸면 접수 항목이 달라집니다.
- 영상 목록은 `index.html`의 `#lib` 안에 있습니다. 영상을 바꿀 때는 `data-video="영상ID"`와 썸네일 주소 `i.ytimg.com/vi/영상ID/`를 함께 바꿉니다. 분류는 `data-cat`(brief / us / edu).

### `kr/` (dealerne.co.kr)
- `index.html`, `e.css`, `e.js`: 화면, 디자인, 동작.
- `data.js`: 카카오톡 상담방 주소(`kakaoUrl`), 평점·회원 수·후기 데이터. 값이 비어 있으면 그 칸은 숨겨집니다. `placeholders: true`이면 빈 칸이 점선 "예시 자리" 틀로 보입니다.
- `config.js`: 증권사 이름, LIVE·브리핑 시간 등 운영 정보(현재 샘플 값).

### 공통
- 카카오톡 오픈채팅 주소는 `https://open.kakao.com/o/gZ4c0RWi` 입니다. `com/index.html`, `com/script.js`, `kr/data.js`에 있습니다.
- 로고는 `logo.webp`, 공유 미리보기 이미지는 `og.png`(1200x630)입니다.

## 반드시 지킬 것
1. **수익·수익률을 약속하거나 암시하는 표현을 넣지 않습니다.** ("수익 보장", "월 OO% 수익", "금방 수익" 등)
2. **확인되지 않은 숫자와 후기를 만들어 넣지 않습니다.** 회원 수, 평점, 후기는 실제 자료가 있을 때만 넣습니다.
3. **투자위험 고지 문구를 지우거나 줄이지 않습니다.** (두 사이트 모두 하단에 있습니다.)
4. `SAMPLE DRAFT` 배지와 `<meta name="robots" content="noindex">`는 정식 오픈을 결정하기 전까지 그대로 둡니다.
5. 다른 사이트의 문구, 이미지, 로고를 복사해 넣지 않습니다.
6. 휴대폰 번호 등 개인정보를 받는 칸을 늘릴 때는 동의 문구도 함께 고칩니다.
7. 요청받은 부분만 고칩니다. 파일 전체를 새로 쓰거나 관계없는 부분을 정리하지 않습니다.

## 확인 방법
- 폴더에서 간단한 서버를 띄워 확인합니다: `python3 -m http.server 8000 --directory com` (또는 `kr`), 브라우저에서 `http://localhost:8000`.
- 모바일 폭(360~430px)과 데스크톱 폭에서 모두 봅니다. 가로로 밀리는 화면이 없어야 합니다.
- 브라우저 콘솔에 오류가 없어야 합니다.
- 외부 라이브러리(글꼴 Pretendard, GSAP, TradingView Lightweight Charts)는 CDN에서 불러옵니다. 주소와 버전을 바꾸지 않습니다. TradingView 출처 표기는 지우지 않습니다.

## 글 쓰는 말투
- `com/`: "~합니다" 체. 차분하고 단정한 말투.
- `kr/`: "~해요" 체. 짧고 쉬운 말.
- 한 문장에 한 가지 내용. 과장된 표현과 느낌표 남발을 피합니다.
