import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { loadFonts, checkFontCache } from './utils/fontDetector'

// 폰트 최적화 초기화
if (!checkFontCache()) {
  loadFonts();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)