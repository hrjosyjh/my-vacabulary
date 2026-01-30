# 수능 영어 단어장 프로젝트 (My Vocabulary)

수능 필수 영단어 학습 및 암기 상태 관리를 위한 React 기반 웹 애플리케이션입니다.

## 🚀 주요 기능
- **단어 학습 카드**: 단어, 발음기호, 뜻, 예문(영/한) 제공
- **암기 체크리스트**: 클릭을 통한 암기 완료 상태 토글 및 시각적 피드백
- **진행도 대시보드**: 전체 단어 중 암기 완료된 단어 비율 실시간 표시
- **학습 필터링**: 전체/학습 중/암기 완료 상태별 단어 모아보기
- **데이터 보존**: LocalStorage를 활용하여 브라우저 재접속 시에도 학습 내역 유지

## 🛠 기술 스택
- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Icons**: Lucide React
- **Deployment**: Vite Build 최적화 지원

## 📂 프로젝트 구조
- `src/App.jsx`: 메인 로직, 상태 관리 및 UI 컴포넌트
- `src/data/words.js`: 수능 영단어 데이터 (30개 기본 탑재)
- `src/index.css`: Tailwind CSS 설정 및 글로벌 스타일

## 📝 추후 확장 아이디어
1.  **단어 추가 기능**: 사용자가 직접 새로운 단어를 입력하고 관리하는 기능
2.  **음성 합성 (TTS)**: 단어 및 예문을 클릭 시 원어민 발음으로 들려주는 기능
3.  **퀴즈 모드**: 플래시 카드나 4지선다형 퀴즈를 통한 자가 진단 기능
4.  **카테고리 분류**: 난이도별 또는 테마별(명사, 동사, 숙어 등) 단어 분류
5.  **다크 모드**: 사용자 눈의 피로도를 고려한 테마 전환 기능



## 💻 개발 가이드 (Developer Guide)



### 단어 데이터 추가 방법

`src/data/words.js` 파일에서 `vocabulary` 배열에 객체를 추가하면 자동으로 화면에 반영됩니다.



```javascript

// src/data/words.js 예시

export const vocabulary = [

  // ... 기존 단어들

  { 

    id: 31, // 고유한 숫자 ID (순차적으로 증가)

    word: 'new word', // 영어 단어

    pronunciation: '/pronunciation/', // 발음기호

    meaning: '새로운 단어', // 한글 뜻

    exampleEn: 'This is a new word example.', // 영어 예문

    exampleKo: '이것은 새로운 단어 예문입니다.' // 예문 해석

  }

];

```



### 스타일 수정 (Tailwind CSS)

- 전체 테마 색상은 `src/index.css` 또는 `tailwind.config.js`에서 관리하지 않고, Tailwind 유틸리티 클래스(예: `bg-blue-600`)를 `src/App.jsx`에서 직접 사용했습니다.

- 주요 색상 변경을 원하시면 `App.jsx` 내의 `bg-blue-*`, `text-blue-*` 등의 클래스를 일괄 변경하세요.



### 프로젝트 초기화

프로젝트 학습 기록을 완전히 삭제하고 싶다면 브라우저 콘솔에서 다음을 실행하거나, 화면 상단의 '초기화' 버튼을 사용하세요.

```javascript

localStorage.clear();

```
