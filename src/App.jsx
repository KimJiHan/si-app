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

// === Art Movement-Based Artist Prompts ===
const artistPrompts = {
  'van-gogh': {
    name: '빈센트 반 고흐',
    movement: '후기 인상주의 (Post-Impressionism)',
    prompt: 'A masterpiece of **Post-Impressionism**, capturing a landscape scene with thick, swirling impasto and expressive, visible brushstrokes, using a vibrant and emotional color palette, **by Vincent van Gogh**. Highly detailed.'
  },
  'picasso': {
    name: '파블로 피카소',
    movement: '입체주의 (Cubism)',
    prompt: 'A masterpiece of **Picasso\'s Cubism**, deconstructing a still life object into fragmented geometric planes, showing multiple viewpoints simultaneously within a limited color palette, **by Pablo Picasso**. Highly detailed.'
  },
  'klimt': {
    name: '구스타프 클림트',
    movement: '상징주의 / 빈 분리파 (Symbolism / Vienna Secession)',
    prompt: 'A masterpiece of the **Vienna Secession**, creating a decorative and symbolic composition with intricate, mosaic-like patterns, shimmering gold leaf, and swirling organic forms, **in the style of Gustav Klimt**. Highly detailed.'
  },
  'monet': {
    name: '클로드 모네',
    movement: '인상주의 (Impressionism)',
    prompt: 'A masterpiece of **Impressionism**, capturing the fleeting effects of light and atmosphere on water and landscapes with soft focus and short, visible brushstrokes, **by Claude Monet**. Highly detailed.'
  },
  'schiele': {
    name: '에곤 쉴레',
    movement: '표현주의 (Expressionism)',
    prompt: 'A masterpiece of **Expressionism**, depicting a twisted, gnarled tree or a stark cityscape with raw, angular lines and an intense, nervous energy that conveys a deep psychological mood, **in the style of Egon Schiele**. Highly detailed.'
  },
  'warhol': {
    name: '앤디 워홀',
    movement: '팝 아트 (Pop Art)',
    prompt: 'A masterpiece of **Pop Art**, using a flat, commercial, screen-printing aesthetic with bold, saturated colors and serial repetition of a mass-produced object, **by Andy Warhol**. Highly detailed.'
  },
  'kusama': {
    name: '쿠사마 야요이',
    movement: '강박 예술 / 미니멀리즘 (Obsessional Art / Minimalism)',
    prompt: 'A masterpiece of **Obsessional Art**, creating a hallucinatory visual field through the infinite repetition of polka dots and net patterns over a high-contrast surface, **by Yayoi Kusama**. Highly detailed.'
  },
  'kim-hong-do': {
    name: '김홍도',
    movement: '풍속화 (Pungsok-hwa / Korean Genre Painting)',
    prompt: 'A masterpiece of **Korean Genre Painting (Pungsok-hwa)**, **by Kim Hong-do**. Highly detailed.'
  },
  'jeong-seon': {
    name: '정선',
    movement: '진경산수화 (Jingyeong Sansu-hwa / True-view Landscape Painting)',
    prompt: 'A masterpiece of **Korean True-view Landscape Painting (Jingyeong Sansu-hwa)**, capturing the grand and rugged beauty of Korean mountains with energetic, bold brushstrokes, contrasting wet ink washes with sharp, dry lines, **by Jeong Seon**. Highly detailed.'
  },
  'shin-yun-bok': {
    name: '신윤복',
    movement: '풍속화 (Pungsok-hwa / Korean Genre Painting)',
    prompt: 'A masterpiece of **Korean Genre Painting (Pungsok-hwa)**, rendered with delicate, fine linework and a vibrant, rich color palette, **by Shin Yun-bok**. Highly detailed.'
  }
};

// === Photorealistic Prompts ===
const photorealisticPrompts = {
  'heavy-snow': {
    name: '함박눈',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece of **photorealistic** style, capturing a heavy snowstorm. Thick, fluffy snowflakes are falling, creating soft textures on surfaces. Shot with a high-end DSLR, capturing the crisp details of the individual snowflakes against a cinematic background. Hyper-detailed, cinematic lighting.'
  },
  'full-bloom': {
    name: '만개한 꽃',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a **photorealistic** style, capturing a stunning scene of cherry blossom trees in full bloom. The bright spring sunlight filters through the pink petals, casting soft, dappled shadows on the ground. A gentle breeze scatters a few petals in the air. Shot with a shallow depth of field, focusing on the delicate flowers. Hyper-detailed, vibrant colors, soft lighting.'
  },
  'thunder-lightning': {
    name: '천둥번개',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a **photorealistic** style, capturing a dramatic moment as a massive fork of lightning illuminates the night sky over a city skyline. reflecting the intense flash of light and the dark, turbulent storm clouds above. A long-exposure shot capturing the raw power and electrifying beauty of the storm. Hyper-detailed, dramatic contrast, high dynamic range (HDR).'
  },
  'sunset': {
    name: '노을',
    style: '실사풍 (Photorealistic)', 
    prompt: 'A masterpiece in a **photorealistic** style, depicting a spectacular sunset. The sky is ablaze with fiery oranges, deep purples, and soft pinks. The warm, golden light of the setting sun bathes the entire scene in a serene and magical glow. Hyper-detailed, golden hour lighting, breathtaking view.'
  },
  'strong-sunlight': {
    name: '강한 햇빛',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a **photorealistic** style, under the harsh midday sun. The strong sunlight creates sharp, defined shadows and intense highlights on various surfaces and textures. The scene is full of life, with the heat haze slightly visible in the distance. Hyper-detailed, high contrast, sharp focus.'
  },
  'autumn-leaves': {
    name: '단풍·은행나무',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a **photorealistic** style, featuring brilliant red maple and golden ginkgo trees in peak autumn foliage. The soft, warm autumn light filters through the canopy, enhancing the rich colors and creating a peaceful and picturesque scene. Hyper-detailed, vibrant autumn colors, serene atmosphere.'
  },
  'night-view': {
    name: '멋진 야경',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a **photorealistic** style, capturing a stunning panoramic night view of a sprawling metropolis from a high vantage point. The city is a sea of glittering lights, with streaks of car headlights creating dynamic light trails on the highways below. The clear night sky reveals a few stars, contrasting with the vibrant city lights. Long exposure, hyper-detailed, bokeh effects.'
  }
};

// === Animation Prompts ===
const animationPrompts = {
  'ghibli': {
    name: '스튜디오 지브리',
    style: '감성적 2D 애니메이션 (Emotional 2D Animation)',
    prompt: 'A masterpiece in the **Studio Ghibli style**, charming cottage, featuring beautifully detailed cloudscapes and a warm, nostalgic watercolor aesthetic, **by Hayao Miyazaki**. Highly detailed.'
  },
  'pixar': {
    name: '픽사',
    style: '3D 디지털 애니메이션 (3D Digital Animation)',
    prompt: 'A masterpiece in the **Pixar animation style**, featuring a strong emphasis on realistic material textures and cinematic, narrative-driven lighting, **by Pixar Animation Studios**. Highly detailed.'
  },
  'disney': {
    name: '디즈니',
    style: '클래식 2D 애니메이션 (Classic 2D Animation)',
    prompt: 'A masterpiece in the **classic Disney animation style**, rendered with smooth lines, a vibrant and magical color palette, and a sense of wonder and romance, **by Walt Disney Animation Studios**. Highly detailed.'
  },
  'japanese-anime': {
    name: '일본 애니메이션',
    style: '일본 애니메이션 (Japanese Animation)',
    prompt: 'A masterpiece in the **Japanese animation style**, featuring a highly detailed and beautifully painted background of a quiet urban street corner, contrasted with clean, cel-shaded foreground objects, creating a distinctive blend of realism and stylization. Highly detailed.'
  },
  'webtoon': {
    name: '웹툰',
    style: '디지털 코믹 (Digital Comic)',
    prompt: 'A masterpiece in the **digital comic (webtoon) style**, depicting an atmospheric interior scene, characterized by clean, sharp digital linework, simple cel-shading or soft gradient coloring, and dramatic use of lighting effects and focus to create a specific mood. Highly detailed.'
  }
};

// === Illustration Prompts ===
const illustrationPrompts = {
  'watercolor': {
    name: '수채화',
    style: '수채화 페인팅 (Watercolor Painting)',
    prompt: 'A masterpiece in the **watercolor painting style**, featuring soft, transparent color washes that bleed and blend into each other, creating delicate layered effects and a luminous quality that reveals the texture of the paper below. Highly detailed.'
  },
  'pencil': {
    name: '연필',
    style: '연필 드로잉 (Pencil Drawing)',
    prompt: 'A masterpiece of **pencil drawing**, depicting an old, weathered leather-bound book and a pair of spectacles resting on a wooden table, showcasing a full range of tones, from delicate highlights to deep shadows, with visible cross-hatching and smudging for texture. Highly detailed.'
  },
  'crayon-colored-pencil': {
    name: '크레파스/색연필',
    style: '크레파스 및 색연필 스타일 (Crayon and Colored Pencil Style)',
    prompt: 'A masterpiece in the **crayon and colored pencil style**, characterized by rich, waxy textures created by layering vibrant colors, with visible, deliberate strokes that build up a sense of warmth and handmade charm. Highly detailed.'
  },
  'neon-art': {
    name: '네온 아트',
    style: '네온 아트 (Neon Art)',
    prompt: 'A masterpiece of **neon art**, featuring a glowing, stylized cityscape made of luminous glass tubes, radiating vibrant pink and cyan light against a dark, reflective background, creating a cyberpunk and retro atmosphere. Highly detailed.'
  },
  'paper-folding': {
    name: '종이 접기',
    style: '종이 공예 아트 (Papercraft Art)',
    prompt: 'A masterpiece of **papercraft art**, depicting a complex architectural structure or abstract geometric form, all constructed from meticulously folded, cut, and layered colored paper, showcasing sharp creases and a tangible sense of depth. Highly detailed.'
  },
  'lego': {
    name: '레고',
    style: '레고 브릭 스타일 (Lego Brick Style)',
    prompt: 'A masterpiece constructed in the **Lego brick style**, built entirely from colorful Lego bricks, showcasing the iconic studded texture and clever use of various block shapes to create curves and intricate details. Highly detailed.'
  },
  'knit-doll': {
    name: '뜨개인형',
    style: '아미구루미 / 뜨개인형 스타일 (Amigurumi / Knitted Doll Style)',
    prompt: 'A masterpiece in the **amigurumi (knitted doll) style**, depicting a charming, small creature or object made of colorful yarn, featuring visible, tight crochet stitches, a soft and rounded form, and a cozy, handmade aesthetic. Highly detailed.'
  }
};

// === AI Prompt Options (New Structure) ===
const styleCategories = [
  {
    id: 'artist',
    name: '예술가 스타일',
    description: '유명 예술가의 화풍으로 서울의 미래를 그려보세요.',
    options: [
      { label: '빈센트 반 고흐', value: 'van-gogh' },
      { label: '파블로 피카소', value: 'picasso' },
      { label: '구스타프 클림트', value: 'klimt' },
      { label: '클로드 모네', value: 'monet' },
      { label: '에곤 쉴레', value: 'schiele' },
      { label: '앤디 워홀', value: 'warhol' },
      { label: '쿠사마 야요이', value: 'kusama' },
      { label: '김홍도', value: 'kim-hong-do' },
      { label: '정선', value: 'jeong-seon' },
      { label: '신윤복', value: 'shin-yun-bok' },
    ]
  },
  {
    id: 'animation',
    name: '애니메이션 스타일',
    description: '상상 속 애니메이션의 한 장면처럼 연출해보세요.',
    options: [
      { label: '지브리', value: 'ghibli' },
      { label: '픽사', value: 'pixar' },
      { label: '디즈니', value: 'disney' },
      { label: '일본 애니메이션', value: 'japanese-anime' },
      { label: '웹툰 스타일', value: 'webtoon' },
    ]
  },
  {
    id: 'illust',
    name: '일러스트 및 기타 스타일',
    description: '다양한 재료와 기법으로 독특한 질감을 표현해보세요.',
    options: [
      { label: '수채화', value: 'watercolor' },
      { label: '연필 스케치', value: 'pencil' },
      { label: '크레파스/색연필', value: 'crayon-colored-pencil' },
      { label: '네온 아트', value: 'neon-art' },
      { label: '종이 접기', value: 'paper-folding' },
      { label: '레고', value: 'lego' },
      { label: '뜨개인형', value: 'knit-doll' },
    ]
  },
  {
    id: 'photorealistic',
    name: '실사풍 스타일',
    description: '실제 사진처럼 생생한 분위기를 연출해보세요.',
    options: [
      { label: '함박눈', value: 'heavy-snow' },
      { label: '만개한 꽃', value: 'full-bloom' },
      { label: '천둥번개', value: 'thunder-lightning' },
      { label: '노을', value: 'sunset' },
      { label: '강한 햇빛', value: 'strong-sunlight' },
      { label: '단풍·은행나무', value: 'autumn-leaves' },
      { label: '멋진 야경', value: 'night-view' },
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
      <footer className="text-center pt-8 pb-4 text-gray-500 dark:text-gray-400 text-xs flex-shrink-0"><p>Copyright 2025 The Seoul Institute. All Rights Reserved.</p></footer>
      <ThemeToggler theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}

function ThemeToggler({ theme, toggleTheme }) {
  return (
    <button onClick={toggleTheme} className="fixed top-[70px] right-8 bg-gray-100 dark:bg-gray-800 p-3 rounded-full text-gray-800 dark:text-gray-200 shadow-lg transition-transform transform hover:scale-110 z-50" aria-label="Toggle theme">
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

  const nextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextIndex = (currentIndex + 1) % landmarks.length;
    scrollToIndex(nextIndex);
    stopAutoPlay();
    setTimeout(startAutoPlay, 5000);
  };

  const prevSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
        
        <button 
          onMouseDown={prevSlide} 
          className="absolute left-2 sm:left-4 md:left-6 lg:left-8 xl:left-12 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 hover:scale-110 transform transition-all duration-300 ease-in-out z-20" 
          aria-label="이전 슬라이드"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
        </button>
        <button 
          onMouseDown={nextSlide} 
          className="absolute right-2 sm:right-4 md:right-6 lg:right-8 xl:right-12 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 hover:scale-110 transform transition-all duration-300 ease-in-out z-20" 
          aria-label="다음 슬라이드"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
        </button>
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

    const apiKey = "AIzaSyDtcPmRhxJplpOGYRLEH0sBgKcBkWFBhzs";
    
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setIsBaseImage(false);

    try {
      setLoadingStep('AI가 이미지를 편집하고 있습니다...');
      const base64Image = await toBase64(editorReferenceImage);
      
      const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } };
      
      let textPrompt = `CRITICAL: Reimagine this landmark, '${landmark.title}', in a 3:4 portrait aspect ratio. MANDATORY ARCHITECTURAL PRESERVATION: The building's exact architectural shape, structure, size, proportions, and all distinctive structural features MUST remain completely identical to the original. The landmark's original form is absolutely non-negotiable and must be 100% recognizable.`;
      
      if (selectedCategory.id === 'photorealistic' && photorealisticPrompts[selectedStyle.value]) {
        const photoData = photorealisticPrompts[selectedStyle.value];
        textPrompt += `\nApply the photorealistic visual treatment described: ${photoData.prompt} IMPORTANT: Only change lighting, weather, and atmospheric conditions. The building structure remains completely unchanged.`;
      } else if (selectedCategory.id === 'artist' && artistPrompts[selectedStyle.value]) {
        // 예술가 스타일의 경우 단일 예술 운동 기반 프롬프트 사용
        const artistData = artistPrompts[selectedStyle.value];
        textPrompt += `\nApply the artistic visual treatment described: ${artistData.prompt} CRITICAL CONSTRAINT: Only modify colors, textures, brushwork patterns, and surface visual effects. The building's physical form, dimensions, and architectural structure remain completely unchanged and identical to the original.`;
      } else if (selectedCategory.id === 'animation' && animationPrompts[selectedStyle.value]) {
        const animationData = animationPrompts[selectedStyle.value];
        textPrompt += `\nApply the animation visual treatment described: ${animationData.prompt} CRITICAL CONSTRAINT: Only modify colors, textures, animation style, and surface visual effects. The building's physical form, dimensions, and architectural structure remain completely unchanged and identical to the original.`;
      } else if (selectedCategory.id === 'illust' && illustrationPrompts[selectedStyle.value]) {
        const illustData = illustrationPrompts[selectedStyle.value];
        textPrompt += `\nApply the illustration visual treatment described: ${illustData.prompt} CRITICAL CONSTRAINT: Only modify colors, textures, artistic medium effects, and surface visual effects. The building's physical form, dimensions, and architectural structure remain completely unchanged and identical to the original.`;
      } else {
        textPrompt += `\nApply the artistic style of ${selectedStyle.value}. MANDATORY: Only change visual surface treatment (colors, textures, artistic effects) while keeping the exact same architectural form and structure as the original building.`;
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
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-4 pt-2">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors mb-4 flex-shrink-0 font-bold">
          <ChevronLeft />뒤로가기
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[0.4fr,0.6fr] gap-4 lg:gap-14 px-4 pb-4 h-full">
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 mb-4">
                <h2 className="text-xl md:text-2xl font-bold mb-1">{landmark.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm line-clamp-2">{landmark.description}</p>
            </div>
            <div className="relative flex-1">
                <div className="absolute inset-0 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
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
                          className={`transition-opacity duration-500 ${
                            isBaseImage 
                              ? 'w-full h-full object-cover' // 원본 이미지: 컨테이너에 맞게 확대
                              : 'max-w-full max-h-full w-auto h-auto object-contain' // AI 생성 이미지: 화면 영역 내 제한
                          }`}
                          style={isBaseImage ? {} : { maxHeight: '100%', maxWidth: '100%' }}
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
        <div className="flex flex-col">
          <div className="space-y-6">
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

          <div className="py-4 mt-auto">
            <button 
              onClick={handleGenerate} 
              disabled={isLoading || !selectedStyle} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-lg">{isLoading ? '생성 중...' : '나만의 서울 미래상 생성하기'}</span>
            </button>
          </div>
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
