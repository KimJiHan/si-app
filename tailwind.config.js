/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 'class'를 이용한 다크 모드 활성화
  theme: {
    extend: {
       // 여기에 커스텀 디자인 테마를 추가할 수 있습니다.
    },
  },
  plugins: [],
}