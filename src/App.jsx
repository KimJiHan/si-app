import React, { useState, useEffect, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';

// === Icon Components ===
const ChevronLeft = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6" /></svg> );
const Sparkles = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9 1.9 5.8 1.9-5.8 5.8-1.9-5.8-1.9Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg> );
const Sun = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg> );
const Moon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg> );
const PlusCircle = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>);
const QrCode = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16h.01"/><path d="M16 12h.01"/><path d="M21 12h.01"/></svg>);
const X = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const ChevronRight = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>);


// === Landmark Data ===
const getImageUrl = (path) => {
  if (path.startsWith('http')) {
    return path; // 외부 URL은 그대로 반환
  }
  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}${cleanPath}`;
};

const landmarks = [
  { 
    id: 'nodeul-island', 
    title: '노들 글로벌 예술섬', 
    description: '한강의 중심 노들섬을 자연과 예술, 독특한 경험이 가득한 공간으로 재탄생시키는 프로젝트입니다.', 
    imageUrl: 'image/noddle global art island/noddle global art island2.jpg',
    editorImageUrl: 'https://raw.githubusercontent.com/KimJiHan/test_workbench/main/%E1%84%89%E1%85%A5%E1%86%AF%E1%84%80%E1%85%A8%E1%84%89%E1%85%A5%E1%86%AF%E1%84%86%E1%85%A7%E1%86%BC%E1%84%89%E1%85%A5_%E1%84%80%E1%85%A9%E1%86%BC%E1%84%8C%E1%85%AE%E1%86%BC%E1%84%87%E1%85%AE(%E1%84%83%E1%85%A9%E1%86%BC%E1%84%8E%E1%85%B3%E1%86%A8).jpg'
  },
  { 
    id: 'ddp-seoul-light', 
    title: 'DDP 서울라이트', 
    description: '동대문디자인플라자(DDP)의 외벽을 거대한 캔버스 삼아 펼쳐지는 화려한 빛의 축제입니다.', 
    imageUrl: 'image/Dongdaemun DDP/Dongdaemun DDP2.jpg',
    editorImageUrl: 'https://raw.githubusercontent.com/KimJiHan/test_workbench/main/ebdb20d8eea4d.jpg'
  },
  { 
    id: 'seoul-ring', 
    title: '서울링', 
    description: '상암동 하늘공원에 조성될 세계 최대 규모의 대관람차입니다. 서울의 전경을 한눈에 담습니다.', 
    imageUrl: 'image/seoulring/soeulring1.jpg',
    editorImageUrl: 'https://raw.githubusercontent.com/KimJiHan/test_workbench/main/%E1%84%90%E1%85%AE%E1%84%89%E1%85%B5%E1%84%83%E1%85%A9(1).jpg'
  },
  { 
    id: 'seoul-arena', 
    title: '서울 아레나', 
    description: '창동역 인근에 건립되는 국내 최초의 아레나급 음악 전문 공연장입니다. K-POP의 중심지입니다.', 
    imageUrl: 'image/seoul arena/seoul arena2.jpg',
    editorImageUrl: 'https://raw.githubusercontent.com/KimJiHan/test_workbench/main/%E1%84%89%E1%85%A5%E1%84%8B%E1%85%AE%E1%86%AF%E1%84%8B%E1%85%A1%E1%84%85%E1%85%A6%E1%84%82%E1%85%A12.jpg'
  },
  { 
    id: 'digital-bio-city', 
    title: '창동상계 디지털 바이오 시티', 
    description: '창동·상계 일대를 바이오·의료 및 디지털 산업의 중심으로 육성하는 프로젝트입니다.', 
    imageUrl: 'https://news.seoul.go.kr/citybuild/files/2024/03/65f10f43813c97.66981881.jpg',
    editorImageUrl: 'https://news.seoul.go.kr/citybuild/files/2024/03/65f10f43813c97.66981881.jpg'
  },
  { 
    id: 'han-river-bus', 
    title: '한강 리버버스', 
    description: '친환경 대중교통 수단으로 한강을 가로지르는 수상버스입니다. 주요 거점을 연결합니다.', 
    imageUrl: 'image/hanriverbus/hanriverbus1.jpg',
    editorImageUrl: 'image/hanriverbus/hanriverbus5.png'
  }
];

// === AI Prompt Options (New Structure) ===
const styleCategories = [
  {
    id: 'artist',
    name: '예술가 스타일',
    description: '유명 예술가의 화풍으로 서울의 미래를 그려보세요.',
    options: [
      { label: '빈센트 반 고흐', value: 'in the style of Vincent van Gogh' },
      { label: '파블로 피카소', value: 'in the style of Pablo Picasso' },
      { label: '구스타프 클림트', value: 'in the style of Gustav Klimt' },
      { label: '클로드 모네', value: 'in the style of Claude Monet' },
      { label: '에곤 쉴레', value: 'in the style of Egon Schiele' },
      { label: '앤디 워홀', value: 'in the style of Pop Art like Andy Warhol' },
      { label: '쿠사마 야요이', value: 'in the style of Yayoi Kusama' },
      { label: '한국민화(김홍도)', value: 'in the style of Korean folk painting (Minhwa) like Kim Hong-do' },
    ]
  },
  {
    id: 'animation',
    name: '애니메이션 스타일',
    description: '상상 속 애니메이션의 한 장면처럼 연출해보세요.',
    options: [
      { label: '지브리', value: 'in the style of Studio Ghibli animation' },
      { label: '픽사', value: 'in the style of Pixar animation' },
      { label: '디즈니(인어공주)', value: 'in the style of classic Disney animation like The Little Mermaid' },
      { label: <>일본 애니<br/>(귀멸의 칼날)</>, value: 'in the style of modern Japanese anime like Demon Slayer' },
      { label: '웹툰 스타일', value: 'in the style of a Korean webtoon' },
    ]
  },
  {
    id: 'illust',
    name: '일러스트 및 기타 스타일',
    description: '다양한 재료와 기법으로 독특한 질감을 표현해보세요.',
    options: [
      { label: '수채화', value: 'in a watercolor painting style' },
      { label: '연필 스케치', value: 'in a detailed pencil sketch style' },
      { label: '크레파스/색연필', value: 'in a crayon and colored pencil drawing style' },
      { label: '네온 아트', value: 'in a vibrant neon art style' },
      { label: '종이 접기', value: 'in a paper origami (papercraft) style' },
      { label: '레고', value: 'built with LEGO bricks, lego-style' },
      { label: '뜨개인형', value: 'in a knitted doll (amigurumi) style' },
    ]
  },
  {
    id: 'photorealistic',
    name: '실사풍 스타일',
    description: '실제 사진처럼 생생한 분위기를 연출해보세요.',
    options: [
      { label: '함박눈', value: 'on a heavy snowy day' },
      { label: '만개한 꽃', value: 'with flowers in full bloom' },
      { label: '천둥번개', value: 'with dramatic stormy weather and lightning' },
      { label: '노을', value: 'during a beautiful sunset with golden hour light' },
      { label: '강한 햇빛', value: 'on a bright summer day with strong sunlight' },
      { label: '단풍·은행나무', value: 'on an autumn day with colorful maple and ginkgo trees' },
      { label: '멋진 야경', value: 'with a stunning night view and city lights' },
    ]
  }
];

// === Helper Functions ===
async function toBase64(url) {
  let fetchUrl;
  if (url.startsWith('/')) {
    fetchUrl = url;
  } else {
    fetchUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
  }
  const response = await fetch(fetchUrl);
  if (!response.ok) {
    throw new Error(`이미지 로드 오류: ${response.status} ${response.statusText} (URL: ${fetchUrl})`);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// === Main Application Component ===
export default function App() {
  const [selectedLandmark, setSelectedLandmark] = useState(null);
  const [view, setView] = useState('gallery');
  const [theme, setTheme] = useState('light'); // 기본 테마를 light로 설정

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/qrcode@1/build/qrcode.min.js";
    script.async = true;
    document.body.appendChild(script);

    const style = document.createElement('style');
    style.textContent = `
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    document.head.appendChild(style);

    return () => {
      document.body.removeChild(script);
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  const handleSelectLandmark = (landmark) => { setSelectedLandmark(landmark); flushSync(() => setView('editor')); };
  const handleBackToGallery = () => { setSelectedLandmark(null); flushSync(() => setView('gallery')); };

  return (
    <div className="bg-white dark:bg-black text-gray-900 dark:text-gray-100 h-screen font-sans transition-colors duration-500 flex flex-col overflow-hidden pt-12 sm:pt-16">
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col">
        {view === 'gallery' ? <LandmarkGallery onSelect={handleSelectLandmark} /> : <Editor landmark={selectedLandmark} onBack={handleBackToGallery} />}
      </div>
      <footer className="text-center py-4 text-gray-500 dark:text-gray-400 text-xs flex-shrink-0"><p>Copyright 2025 The Seoul Institute. All Rights Reserved.</p></footer>
      <ThemeToggler theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}

function ThemeToggler({ theme, toggleTheme }) {
  return (
    <button onClick={toggleTheme} className="fixed top-16 sm:top-20 right-5 bg-gray-100 dark:bg-gray-800 p-3 rounded-full text-gray-800 dark:text-gray-200 shadow-lg transition-transform transform hover:scale-110 z-50" aria-label="Toggle theme">
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}

function LandmarkGallery({ onSelect }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  const autoPlayRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cards = container.children;
      if (cards.length === 0) return;
      const scrollLeft = container.scrollLeft;
      const cardWidth = cards[0].offsetWidth;
      const gap = 24; // space-x-6
      const newIndex = Math.round(scrollLeft / (cardWidth + gap));
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    }
  }, [currentIndex]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const scrollToIndex = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cards = container.children;
      if (cards[index]) {
        const cardLeft = cards[index].offsetLeft;
        const containerWidth = container.clientWidth;
        const cardWidth = cards[index].offsetWidth;
        container.scrollTo({
          left: cardLeft - (containerWidth - cardWidth) / 2,
          behavior: 'smooth'
        });
        setCurrentIndex(index);
      }
    }
  };

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % landmarks.length;
        scrollToIndex(nextIndex);
        return nextIndex;
      });
    }, 5000);
  }, []);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [startAutoPlay, stopAutoPlay]);

  const nextSlide = () => {
    const nextIndex = (currentIndex + 1) % landmarks.length;
    scrollToIndex(nextIndex);
    stopAutoPlay();
    setTimeout(startAutoPlay, 5000);
  };

  const prevSlide = () => {
    const prevIndex = currentIndex === 0 ? landmarks.length - 1 : currentIndex - 1;
    scrollToIndex(prevIndex);
    stopAutoPlay();
    setTimeout(startAutoPlay, 5000);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="py-4 md:py-6 text-center flex-shrink-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">서울의 미래를 그리다</h1>
        <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">
          서울의 미래공간을 나만의 스타일로 그려보세요. 서울 미래 공간을 선택 후, 날씨, 도시배경, 그림 스타일을 나의 취향에 맞게 선택하면 AI가 당신만의 서울을 창조합니다.<br/>
          완성된 그림은 QR로 소장 가능합니다.
        </p>
      </header>
      
      <div className="flex-1 relative flex flex-col min-h-0">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto space-x-6 pb-4 hide-scrollbar flex-1"
          style={{ scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }}
          onMouseEnter={stopAutoPlay}
          onMouseLeave={startAutoPlay}
        >
          {landmarks.map((landmark) => (
            <div key={landmark.id} className="flex-shrink-0 w-[80vw] sm:w-[65vw] max-w-sm h-full" style={{ scrollSnapAlign: 'center' }}>
              <MediaCard landmark={landmark} onSelect={onSelect} />
            </div>
          ))}
        </div>
        
        <div className="flex justify-center py-4 flex-shrink-0">
          <div className="flex space-x-3">
            <button onClick={prevSlide} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 hover:scale-110 transform transition-all duration-300 ease-in-out" aria-label="이전 슬라이드">
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <button onClick={nextSlide} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 hover:scale-110 transform transition-all duration-300 ease-in-out" aria-label="다음 슬라이드">
              <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaCard({ landmark, onSelect }) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // 이미지 URL 결정 로직
  let optimizedImageUrl;
  if (landmark.imageUrl.startsWith('http')) {
    // 외부 이미지는 Weserv를 통해 최적화
    optimizedImageUrl = `https://images.weserv.nl/?url=${encodeURIComponent(landmark.imageUrl)}&w=600&h=800&fit=cover&q=90&output=webp`;
  } else {
    // 로컬 이미지는 직접 경로 사용
    optimizedImageUrl = getImageUrl(landmark.imageUrl);
  }

  return (
    <div 
      className="h-full rounded-3xl overflow-hidden cursor-pointer group relative flex flex-col justify-between p-6 md:p-8"
      onClick={() => onSelect(landmark)}
    >
      {!isLoaded && <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>}
      <img
        src={optimizedImageUrl}
        alt={landmark.title}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      
      <div className="relative text-white">
        <h2 className="text-xl md:text-2xl font-bold drop-shadow-lg">{landmark.title}</h2>
      </div>
      
      <div className="relative flex items-end justify-between text-white">
        <p className="text-sm opacity-90 w-4/5 drop-shadow-md">{landmark.description}</p>
        <PlusCircle className="w-8 h-8 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 flex-shrink-0 drop-shadow-lg" />
      </div>
    </div>
  );
}


function Editor({ landmark, onBack }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  
  const editorReferenceImage = landmark.editorImageUrl || (
    landmark.imageUrl.startsWith('http') ? landmark.imageUrl : getImageUrl(landmark.imageUrl)
  );
  const [generatedImage, setGeneratedImage] = useState(editorReferenceImage);
  const [isBaseImage, setIsBaseImage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrError, setQrError] = useState('');


  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedStyle(null); // 카테고리 변경 시 스타일 선택 초기화
  };

  const handleStyleSelect = (style) => {
    setSelectedStyle(style);
  };

  const handleQrCode = () => {
    if (isBaseImage || !generatedImage) return;
    setQrError('');
    setQrCodeUrl('');
    setShowQrModal(true);

    if (typeof window.QRCode === 'undefined') {
      setQrError('QR 코드 라이브러리를 로드하지 못했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = async () => {
      const MAX_DIMENSION = 300;
      const QUALITY = 0.6;
      let { width, height } = img;

      if (width > height) {
        if (width > MAX_DIMENSION) { height *= MAX_DIMENSION / width; width = MAX_DIMENSION; }
      } else {
        if (height > MAX_DIMENSION) { width *= MAX_DIMENSION / height; height = MAX_DIMENSION; }
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', QUALITY);

      try {
        const dataUrl = await window.QRCode.toDataURL(compressedDataUrl, { errorCorrectionLevel: 'L', width: 256 });
        setQrCodeUrl(dataUrl);
      } catch (err) {
        console.error("QR Code generation error after compression:", err);
        setQrError('이미지 압축 후에도 QR 코드를 생성할 수 없습니다. 이미지를 다운로드하여 이용해주세요.');
      }
    };

    img.onerror = () => {
      setQrError('QR 코드 생성을 위해 이미지를 처리하는 중 오류가 발생했습니다.');
    };
    
    img.src = isBaseImage ? `https://images.weserv.nl/?url=${encodeURIComponent(generatedImage)}` : generatedImage;
  };


  const handleGenerate = async () => {
    if (!selectedStyle) {
      setError("2단계 스타일을 선택해주세요.");
      return;
    }

    const apiKey = "AIzaSyB6bBtaaopSbL5lf0gi8zSnKx2vzQlVMP8";
    
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setIsBaseImage(false);

    try {
      setLoadingStep('AI가 이미지를 편집하고 있습니다...');
      const base64Image = await toBase64(editorReferenceImage);
      
      const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } };
      
      let textPrompt = `Reimagine this landmark, '${landmark.title}', in a 3:4 portrait aspect ratio, strictly preserving its original architectural shape and structure.`;
      
      if (selectedCategory.id === 'photorealistic') {
        textPrompt += `\nThe new image should be photorealistic, with the atmosphere of ${selectedStyle.value}.`;
      } else {
        textPrompt += `\nThe new image should be in the art style of ${selectedStyle.value}.`;
      }

      if (landmark.id === 'seoul-ring') {
        textPrompt += `\nEnsure the spokeless, vertically-oriented ring structure is clearly depicted.`;
      }

      let geminiPayload = { 
        contents: [{ 
          parts:[
            { text: textPrompt },
            imagePart
          ]
        }],
        generationConfig: { "responseModalities": ["TEXT", "IMAGE"] }
      };

      const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`;
      const geminiRes = await fetch(geminiApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(geminiPayload) });
      
      if (!geminiRes.ok) {
        const errorData = await geminiRes.json();
        throw new Error(`Gemini API Error: ${errorData.error.message}`);
      }
      
      const geminiResult = await geminiRes.json();
      
      const imageResponsePart = geminiResult.candidates[0].content.parts.find(part => part.inlineData && part.inlineData.mimeType.startsWith('image/'));

      if (imageResponsePart) {
        const imageUrl = `data:${imageResponsePart.inlineData.mimeType};base64,${imageResponsePart.inlineData.data}`;
        setGeneratedImage(imageUrl);
      } else {
        throw new Error("AI did not return an image.");
      }

    } catch (err) {
      console.error("Image generation error:", err);
      if (err.message.includes("overloaded")) {
         setError("AI 모델이 현재 과부하 상태입니다. 잠시 후 다시 시도해주세요.");
      }
      else if (err.message.includes("프록시") || err.message.includes("이미지 로드 오류")) {
         setError(`이미지 처리 중 오류가 발생했습니다: ${err.message}`);
      } else if (err.message.includes("API")) {
         setError(`AI 모델 호출 중 오류가 발생했습니다. API 키를 확인해주세요: ${err.message}`);
      } else {
         setError(`오류가 발생했습니다: ${err.message}`);
      }
      setGeneratedImage(editorReferenceImage);
      setIsBaseImage(true);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="h-full flex flex-col py-1">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors mb-4 flex-shrink-0"><ChevronLeft />뒤로가기</button>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 min-h-0">
        <div className="flex flex-col min-h-0">
            <h2 className="text-xl md:text-2xl font-bold mb-1 flex-shrink-0">{landmark.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-3 text-xs md:text-sm flex-shrink-0 max-h-10 overflow-hidden">{landmark.description}</p>
            <div className="relative flex-1 min-h-0">
                <div className="h-full rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                    {isLoading ? (
                        <div className="text-center"><Sparkles className="animate-spin h-12 w-12 text-gray-500 mx-auto" /><p className="mt-4 text-gray-600 dark:text-gray-400">{loadingStep}</p></div>
                    ) : error ? (
                        <div className="p-4 text-center"><p className="text-red-500 dark:text-red-400">오류 발생:</p><p className="text-sm text-red-600 dark:text-red-500 mt-2">{error}</p></div>
                    ) : (
                        <img 
                          src={(() => {
                            if (generatedImage.startsWith('data:')) {
                              return generatedImage; // Base64 이미지는 그대로
                            } else if (generatedImage.startsWith('http')) {
                              return isBaseImage ? `https://images.weserv.nl/?url=${encodeURIComponent(generatedImage)}` : generatedImage;
                            } else {
                              return getImageUrl(generatedImage); // 로컬 이미지
                            }
                          })()} 
                          alt="Generated Landmark" 
                          className="w-full h-full object-cover transition-opacity duration-500" 
                          onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/900x1200/000000/FFFFFF?text=Error+Loading+Image`; }}
                        />
                    )}
                </div>
                {!isBaseImage && !isLoading && !error && (
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <button onClick={handleQrCode} className="bg-black/50 text-white p-3 rounded-full hover:bg-black/75 transition-colors" title="QR 코드로 저장">
                            <QrCode className="w-6 h-6" />
                        </button>
                    </div>
                )}
            </div>
        </div>
        <div className="flex flex-col min-h-0">
          <div className="flex-shrink-0" style={{ height: '60px' }}></div>
          <div className="flex-1 space-y-6 overflow-y-auto">
            {/* 1단계: 카테고리 선택 (탭) */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">1단계: 스타일 카테고리 선택</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">내가 그리고 싶은 서울의 모습을 선택해주세요.</p>
              <div className="flex flex-wrap gap-2">
                {styleCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className={`px-5 py-3 rounded-full text-base font-semibold leading-5 transition-colors focus:outline-none ${
                      selectedCategory?.id === category.id
                        ? 'bg-black text-white dark:bg-blue-600 dark:text-white'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 2단계: 스타일 선택 (버튼) */}
            {selectedCategory && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">2단계: 세부 스타일 선택</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">{selectedCategory.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedCategory.options.map(style => (
                    <button
                      key={style.value}
                      onClick={() => handleStyleSelect(style)}
                      className={`p-4 rounded-lg text-center transition-all duration-200 border-2 ${
                        selectedStyle?.value === style.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50'
                          : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
                      }`}
                    >
                      <span className="font-medium text-gray-900 dark:text-white">{style.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="py-4 flex-shrink-0">
            <button onClick={handleGenerate} disabled={isLoading || !selectedStyle} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"><Sparkles />{isLoading ? '생성 중...' : '나만의 서울 미래상 생성하기'}</button>
          </div>
        </div>
      </div>
      {showQrModal && <QrModal qrCodeUrl={qrCodeUrl} qrError={qrError} onClose={() => setShowQrModal(false)} />}
    </div>
  );
}

function QrModal({ qrCodeUrl, qrError, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full text-center relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white">
          <X />
        </button>
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">QR 코드로 이미지 소장하기</h3>
        {qrCodeUrl && (
          <div>
            <img src={qrCodeUrl} alt="Generated QR Code" className="mx-auto rounded-lg" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">스마트폰 카메라로 QR 코드를 스캔하여 이미지를 확인하고 저장하세요.</p>
          </div>
        )}
        {qrError && (
          <div>
            <p className="text-red-500 dark:text-red-400">{qrError}</p>
          </div>
        )}
         {!qrCodeUrl && !qrError && (
          <div className="flex justify-center items-center h-48">
            <Sparkles className="w-12 h-12 text-gray-500 animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}
