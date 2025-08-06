import React, { useState, useEffect, useRef, useCallback, lazy, Suspense, memo } from 'react';
import { flushSync } from 'react-dom';

// 지연 로딩을 위한 동적 임포트
const GoogleTranslateAPI = lazy(() => import('./components/OptimizedGoogleTranslate'));
const LazyImage = lazy(() => import('./components/LazyImage'));

// === Icon Components (Memoized) ===
const ChevronLeft = memo((props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6" /></svg> ));
const Sparkles = memo((props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9 1.9 5.8 1.9-5.8 5.8-1.9-5.8-1.9Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg> ));
const Sun = memo((props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg> ));
const Moon = memo((props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg> ));
const PlusCircle = memo((props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>));
const QrCode = memo((props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16h.01"/><path d="M16 12h.01"/><path d="M21 12h.01"/></svg>));
const X = memo((props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>));


// === Landmark Data ===
const getImageUrl = (path) => {
  if (path.startsWith('http')) {
    return path; // 외부 URL은 그대로 반환
  }
  // Vite 환경에서는 항상 BASE_URL 사용
  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}${cleanPath}`;
};

const landmarks = [
  { 
    id: 'seoul-ring', 
    title: '미래 서울<br/>서울링', 
    editorTitle: '서울링',
    description: '하늘공원에 조성될 세계 최대 규모의 대관람차입니다. 서울의 전경을 한눈에 담습니다.', 
    imageUrl: 'image/page1/seoul-ring.png',
    editorImageUrl: 'image/page2/seoul-ring.jpg'
  },
  { 
    id: 'nodeul-island', 
    title: '미래 서울<br/>노들 글로벌 예술섬', 
    editorTitle: '노들 글로벌 예술섬',
    description: '노들섬을 자연과 예술, 독특한 경험이 가득한 공간으로 재탄생시키는 프로젝트입니다.', 
    imageUrl: 'image/page1/nodeul-arts-island.png',
    editorImageUrl: 'image/page2/nodeul-island.jpg'
  },
  { 
    id: 'yongsan-ibd', 
    title: '미래 서울<br/>용산국제업무지구', 
    editorTitle: '용산국제업무지구',
    description: '용산역 일대를 국제적 비즈니스 허브로 조성하는 대규모 복합개발 프로젝트입니다.', 
    imageUrl: 'image/page1/yongsan-business-district.png',
    editorImageUrl: 'image/page2/yongsan-ibd2.png'
  },
  { 
    id: 'ddp', 
    title: '서울 랜드마크<br/>동대문디자인플라자', 
    editorTitle: '동대문디자인플라자',
    description: '동대문의 랜드마크로, 독특한 곡선 디자인이 돋보이는 복합문화공간입니다.', 
    imageUrl: 'image/page1/dongdaemun-design-plaza.png',
    editorImageUrl: 'image/page2/ddp.jpg'
  },
  { 
    id: 'namsan-tower', 
    title: '서울 랜드마크<br/>남산서울타워', 
    editorTitle: '남산서울타워',
    description: '남산 정상에 위치한 서울의 상징적 랜드마크로, 서울 전경을 한눈에 볼 수 있습니다.', 
    imageUrl: 'image/page1/namsan-tower.png',
    editorImageUrl: 'image/page2/namsan-tower.jpg'
  },
  { 
    id: 'bukchon-hanok', 
    title: '서울 랜드마크<br/>북촌한옥마을', 
    editorTitle: '북촌한옥마을',
    description: '조선시대 전통 가옥들이 보존된 역사적 문화지구로, 한국의 전통미를 간직하고 있습니다.', 
    imageUrl: 'image/page1/bukchon-hanok.png',
    editorImageUrl: 'image/page2/bukchon-hanok.jpg'
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
    prompt: 'A masterpiece of **Picasso\'s Cubism**, fragmented geometric planes, showing multiple viewpoints simultaneously within a limited color palette, **by Pablo Picasso**. Highly detailed.'
  },
  'chagall': {
    name: '마르크 샤갈',
    movement: '초현실주의 / 상징주의 (Surrealism / Symbolism)',
    prompt: 'A masterpiece in the **style of Marc Chagall**, depicting this architectural landmark with Chagall\'s dreamlike surrealism. The building appears to float whimsically in a deep blue night sky among stars and symbolic figures, while its windows glow with rich, luminous colors. The scene creates a poetic and magical atmosphere with Chagall\'s characteristic floating elements and symbolic imagery. CRITICAL: The landmark\'s architectural structure and proportions remain completely unchanged - only the artistic style creates the dreamlike, floating effect. Hyper-detailed, rich symbolic colors.'
  },
  'monet': {
    name: '클로드 모네',
    movement: '인상주의 (Impressionism)',
    prompt: 'A masterpiece of **Impressionism**, capturing the fleeting effects of light and atmosphere on water and landscapes with soft focus and short, visible brushstrokes, **by Claude Monet**. Highly detailed.'
  },
  'schiele': {
    name: '에곤 쉴레',
    movement: '표현주의 (Expressionism)',
    prompt: 'A masterpiece of **Expressionism**, depicting the landmark itself with raw, angular lines and bold, dramatic contrasts that capture the distinctive tension and dynamic energy of urban architecture, **in the style of Egon Schiele**. Highly detailed.'
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
  'korean-landscape': {
    name: '한국 전통 산수화',
    movement: '진경산수화 / 수묵화 (Jingyeong Sansuhwa / Ink Wash Painting)',
    prompt: 'A masterpiece of **Korean True-view Landscape Painting (Jingyeong Sansu-hwa)**, depicting the architectural structure in the reference image while maintaining its original form and proportions, capturing the grand and rugged beauty with energetic, bold brushstrokes, contrasting wet ink washes with sharp, dry lines, **by Jeong Seon**. Highly detailed.'
  },
  'korean-screen': {
    name: '한국 전통 병풍',
    movement: '민화 / 장식화 (Minhwa / Decorative Painting)',
    prompt: 'A masterpiece designed as a **traditional Korean folding screen (Byeongpung)**, depicting the architectural structure in the reference image while maintaining its original form and proportions. The style is characterized by flattened perspectives, vibrant mineral pigments, and bold, decorative outlines. Hyper-detailed, rich colors.'
  },
  'korean-genre': {
    name: '한국 전통 풍속화',
    movement: '풍속화 (Pungsok-hwa)',
    prompt: 'A masterpiece in the **style of traditional Korean genre painting (Pungsok-hwa)**, depicting the architectural structure in the reference image while maintaining its original form and proportions. The composition is dynamic and full of life, captured with fluid, humorous brushstrokes and a light, earthy color palette against a simple background. Hyper-detailed.'
  },
  'lee-jung-seob': {
    name: '이중섭',
    movement: '한국 근대미술 / 표현주의 (Korean Modern Art / Expressionism)',
    prompt: 'A masterpiece of **Korean modern art**, depicting the architectural structure in the reference image while maintaining its original form and proportions, characterized by bold, raw, and energetic lines that appear carved into a thick, textured surface, creating a powerful sense of raw vitality, **by Lee Jung-seob**. Highly detailed.'
  }
};

// === Photorealistic Prompts ===
const photorealisticPrompts = {
  'heavy-snow': {
    name: '함박눈',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece of **photorealistic** style, depicting the architectural structure in the reference image while maintaining its original form and proportions, capturing a heavy snowstorm. Thick, fluffy snowflakes are falling, creating soft textures on surfaces. Shot with a high-end DSLR, capturing the crisp details of the individual snowflakes against a cinematic background. Hyper-detailed, cinematic lighting.'
  },
  'full-bloom': {
    name: '만개한 꽃',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a **photorealistic** style, depicting the architectural structure in the reference image while maintaining its original form and proportions, capturing a stunning scene of cherry blossom trees in full bloom. The bright spring sunlight filters through the pink petals, casting soft, dappled shadows on the ground. A gentle breeze scatters a few petals in the air. Shot with a shallow depth of field, focusing on the delicate flowers. Hyper-detailed, vibrant colors, soft lighting.'
  },
  'thunder-lightning': {
    name: '천둥번개',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a **photorealistic** style, depicting the architectural structure in the reference image while maintaining its original form and proportions, capturing a dramatic moment as a massive fork of lightning illuminates the night sky. The structure below is slick with rain, reflecting the intense flash of light and the dark, turbulent storm clouds above. A long-exposure shot capturing the raw power and electrifying beauty of the storm. Hyper-detailed, dramatic contrast, high dynamic range (HDR).'
  },
  'sunset': {
    name: '노을',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a **photorealistic** style, depicting the architectural structure in the reference image while maintaining its original form and proportions during a spectacular sunset. The sky is ablaze with fiery oranges, deep purples, and soft pinks. The warm, golden light of the setting sun bathes the entire scene in a serene and magical glow. Hyper-detailed, golden hour lighting, breathtaking view.'
  },
  'strong-sunlight': {
    name: '강한 햇빛',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a **photorealistic** style, depicting the architectural structure in the reference image while maintaining its original form and proportions under the harsh midday sun. The strong sunlight creates sharp, defined shadows and intense highlights on various surfaces and textures. The scene is full of life, with the heat haze slightly visible in the distance. Hyper-detailed, high contrast, sharp focus.'
  },
  'autumn-leaves': {
    name: '단풍·은행나무',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a **photorealistic** style, depicting the architectural structure in the reference image while maintaining its original form and proportions, featuring brilliant red maple and golden ginkgo trees in peak autumn foliage. The soft, warm autumn light filters through the canopy, enhancing the rich colors and creating a peaceful and picturesque scene. Hyper-detailed, vibrant autumn colors, serene atmosphere.'
  },
  'lights-window': {
    name: '창밖의 불빛',
    style: '실사풍 (Photorealistic)',
    prompt: 'Lights Beyond the Window, A masterpiece in a photorealistic style, depicting the architectural structure in the reference image while maintaining its original form and proportions, capturing a glittering nightscape as seen from inside a dark space, looking through a window covered with condensation. The lights are beautifully distorted into soft, glowing bokeh circles by the water droplets on the glass. The focus is on the shallow depth of field and the dreamy, abstract quality of the out-of-focus lights. Hyper-detailed, bokeh effects, shallow depth of field.'
  },
  'night-view': {
    name: '멋진 야경',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a photorealistic style, depicting the architectural structure in the reference image while maintaining its original form and proportions, beautifully illuminated at night. The warm, carefully placed floodlights accentuate the intricate details and textures of the structure, creating a dramatic and elegant contrast with the dark surrounding sky. The atmosphere is timeless and majestic. Hyper-detailed, architectural lighting, high contrast.'
  },
  'starry-sky': {
    name: '별빛 가득한 하늘',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a **photorealistic** style, depicting the architectural structure in the reference image while maintaining its original form and proportions, capturing a breathtaking view of the Milky Way galaxy stretching across the night sky. The sky is incredibly clear, revealing countless glittering stars, constellations, and faint nebulae. A long-exposure shot capturing the vastness and awe-inspiring beauty of the cosmos. Hyper-detailed, astrophotography, crystal clear.'
  },
  'black-white': {
    name: '흑백사진',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a **black and white photorealistic** style, depicting the architectural structure in the reference image while maintaining its original form and proportions, using high contrast to emphasize the dramatic interplay of light and shadow across various surfaces. The image highlights intricate details and textures through a full tonal range from deep blacks to pure whites. The composition is powerful and timeless, focusing on abstract form and texture. Hyper-detailed, high contrast, fine art photography.'
  },
  'fireworks': {
    name: '밤하늘의 불꽃놀이',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a **photorealistic** style, depicting the architectural structure in the reference image while maintaining its original form and proportions, Fireworks in the Night Sky, capturing a spectacular fireworks display exploding. trailing paths of the fireworks against the deep black sky. Hyper-detailed, vibrant colors, festive atmosphere.'
  }
};

// === Animation Prompts ===
const animationPrompts = {
  'ghibli': {
    name: '스튜디오 지브리',
    style: '감성적 2D 애니메이션 (Emotional 2D Animation)',
    prompt: 'A masterpiece in the **Studio Ghibli style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, featuring beautifully detailed scapes and a warm, nostalgic watercolor aesthetic that evokes a sense of wonder and harmony with nature, **by Hayao Miyazaki**. Highly detailed.'
  },
  'pixar': {
    name: '픽사',
    style: '3D 디지털 애니메이션 (3D Digital Animation)',
    prompt: 'A masterpiece in the **Pixar animation style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, featuring a strong emphasis on realistic material textures and cinematic, narrative-driven lighting, **by Pixar Animation Studios**. Highly detailed.'
  },
  'disney': {
    name: '디즈니',
    style: '클래식 2D 애니메이션 (Classic 2D Animation)',
    prompt: 'A masterpiece in the **classic Disney animation style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, rendered with smooth lines, a vibrant and magical color palette, and a sense of wonder and romance, **by Walt Disney Animation Studios**. Highly detailed.'
  },
  'dreamworks': {
    name: '드림웍스',
    style: '3D 어드벤처 애니메이션 (3D Adventure Animation)',
    prompt: 'A masterpiece in the **DreamWorks animation style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, a fantastical scene that blends realistic textures with a playful, storybook quality. The image is characterized by dynamic, cinematic lighting that creates an adventurous and slightly mischievous atmosphere, **by DreamWorks Animation**. Highly detailed.'
  },
  'japanese-anime': {
    name: '일본 애니메이션',
    style: '일본 애니메이션 (Japanese Animation)',
    prompt: 'A masterpiece in the **Japanese animation style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, featuring a highly detailed and beautifully painted background of a quiet urban street corner, contrasted with clean, cel-shaded foreground objects, creating a distinctive blend of realism and stylization. Highly detailed.'
  },
  'webtoon': {
    name: '웹툰',
    style: '디지털 코믹 (Digital Comic)',
    prompt: 'A masterpiece in the **digital comic (webtoon) style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, an atmospheric interior scene, characterized by clean, sharp digital linework, simple cel-shading or soft gradient coloring, and dramatic use of lighting effects and focus to create a specific mood. Highly detailed.'
  },
  'simpsons': {
    name: '심슨',
    style: '미국 카툰/시트콤 애니메이션 (American Cartoon/Sitcom Animation)',
    prompt: "A masterpiece in **The Simpsons' animation style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, characterized by bold, simple outlines, flat color application, and a distinctive, satirical cartoon aesthetic, **by Matt Groening**. Highly detailed."
  },
  'pokemon': {
    name: '포켓몬스터',
    style: '일본 어드벤처 애니메이션 (Japanese Adventure Animation)',
    prompt: 'A masterpiece in the **classic Pokémon anime style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, in a lush, natural landscape. The scene is characterized by clean, bold outlines, bright cel-shaded colors, and dynamic action lines that convey a sense of a friendly but exciting battle, **by OLM, Inc**. Highly detailed.'
  },
  'makoto-shinkai': {
    name: '신카이 마코토',
    style: '감성적 애니메이션 (Emotional Animation)',
    prompt: 'A masterpiece in the **Makoto Shinkai style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, featuring breathtaking, photorealistic backgrounds with dramatic lighting, lens flares, and atmospheric effects that create an emotionally evocative scene, **by Makoto Shinkai**. Highly detailed.'
  },
  'kpop-demon-hunters': {
    name: 'K-pop 데몬 헌터스',
    style: 'K-pop 어반 판타지 (K-pop Urban Fantasy)',
    prompt: 'A masterpiece in the **K-pop urban fantasy style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, a dynamic clash of vibrant, modern city at night. The scene is characterized by sharp, stylish digital art, dramatic cinematic lighting with neon highlights, and a powerful sense of high-stakes supernatural action. Hyper-detailed.'
  }
};

// === Future City Prompts ===
const futureCityPrompts = {
  'robots-drones': {
    name: '로봇과 드론이 활보하는 거리',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a **photorealistic** style, depicting the architectural structure in the reference image while maintaining its original form and proportions, a bustling future Seoul street where advanced, sleek robots walk alongside pedestrians and delivery drones zip through the air between futuristic skyscrapers. The scene is captured in clean, bright daylight, highlighting the seamless integration of technology into daily urban life. Hyper-detailed, cinematic, 4K.'
  },
  'flying-cars': {
    name: 'UAM을 타고 다니는 사람들',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a photorealistic style, depicting the architectural structure in the reference image while maintaining its original form and proportions, capturing a multi-layered traffic system in future Seoul, with various designs of flying cars, UAM moving along designated aerial pathways. The late afternoon sun creates a golden hour glow, Hyper-detailed, dynamic motion, golden hour lighting.'
  },
  'hologram-city': {
    name: '빛으로 이루어진 홀로그램 도시',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a **photorealistic** style, depicting the architectural structure in the reference image while maintaining its original form and proportions, the Han River at night in a future Seoul, where giant, translucent hologram advertisements float and shimmer above the water. The surrounding buildings and bridges are adorned with dynamic, colorful light displays, creating a vibrant, dreamlike cityscape. Long exposure, hyper-detailed, neon-drenched, bokeh effects.'
  },
  'green-streets': {
    name: '녹음이 가득한 거리',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a **photorealistic** style, depicting the architectural structure in the reference image while maintaining its original form and proportions, integrated with abundant plant life, creating a harmonious blend of nature and eco-friendly architecture under bright, natural sunlight. Hyper-detailed, lush greenery, solarpunk aesthetic.'
  },
  'cyberpunk': {
    name: '사이버펑크 도시',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a **photorealistic** style, depicting the architectural structure in the reference image while maintaining its original form and proportions, future cyberpunk Seoul at night. The scene is drenched in the vibrant, chaotic glow of holographic Korean neon signs. The high contrast between deep shadows and bright, colorful lights creates a moody and atmospheric, dystopian setting. Hyper-detailed, neon-drenched, cinematic atmosphere.'
  },
  'urban-uam-adventure': {
    name: 'UAM 모험',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a photorealistic style, depicting the architectural structure in the reference image while maintaining its original form and proportions, first-person view from the cockpit of a sleek, futuristic UAM vehicle as it banks gracefully through the skies of a future Seoul. The viewer\'s hands are lightly reflected on the panoramic canopy, where a translucent holographic dashboard displays flight data. Far below, other UAMs and drones navigate between buildings. The sky is filled with dramatic, late-afternoon clouds after a recent rain, and sunlight breaks through to glint off the wet surfaces of the UAM. Slight motion blur on the cityscape below emphasizes the speed and altitude. Cinematic aerial perspective, ultra-realistic textures, futuristic design, 8K clarity.'
  }
};

// === Illustration Prompts ===
const illustrationPrompts = {
  'watercolor': {
    name: '수채화',
    style: '수채화 페인팅 (Watercolor Painting)',
    prompt: 'A masterpiece in the **watercolor painting style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, featuring soft, transparent color washes that bleed and blend into each other, creating delicate layered effects and a luminous quality that reveals the texture of the paper below. Highly detailed.'
  },
  'pencil': {
    name: '연필',
    style: '연필 드로잉 (Pencil Drawing)',
    prompt: 'A masterpiece of **pencil drawing**, depicting the architectural structure in the reference image while maintaining its original form and proportions, showcasing a full range of tones, from delicate highlights to deep shadows, with visible cross-hatching and smudging for texture. Highly detailed.'
  },
  'crayon-colored-pencil': {
    name: '크레파스/색연필',
    style: '크레파스 및 색연필 스타일 (Crayon and Colored Pencil Style)',
    prompt: 'A masterpiece in the **crayon and colored pencil style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, characterized by rich, waxy textures created by layering vibrant colors, with visible, deliberate strokes that build up a sense of warmth and handmade charm. Highly detailed.'
  },
  'neon-art': {
    name: '네온 아트',
    style: '네온 아트 (Neon Art)',
    prompt: 'A masterpiece of **neon art**, depicting the architectural structure in the reference image while maintaining its original form and proportions, featuring a glowing, stylized **city**scape made of luminous glass tubes, radiating vibrant pink and cyan light against a dark, reflective background, creating a cyberpunk and retro atmosphere. Highly detailed.'
  },
  'paper-folding': {
    name: '종이 접기',
    style: '종이 공예 아트 (Papercraft Art)',
    prompt: 'A masterpiece of **papercraft art**, depicting the architectural structure in the reference image while maintaining its original form and proportions, a complex architectural structure or abstract geometric form, all constructed from meticulously folded, cut, and layered colored paper, showcasing sharp creases and a tangible sense of depth. Highly detailed.'
  },
  'lego': {
    name: '레고',
    style: '레고 브릭 스타일 (Lego Brick Style)',
    prompt: 'A masterpiece constructed in the **Lego brick style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, built entirely from colorful Lego bricks, showcasing the iconic studded texture and clever use of various block shapes to create curves and intricate details. Highly detailed.'
  },
  'pixel-art': {
    name: '픽셀 아트',
    style: '픽셀 아트 (Pixel Art)',
    prompt: 'A masterpiece in the **pixel art style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, a vibrant fantasy landscape. The image is constructed from a limited color palette and a low-resolution grid, where individual pixels are intentionally visible, creating a clean, sharp, and nostalgic retro aesthetic. Hyper-detailed, 16-bit, 8-bit, vibrant colors.'
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
      { label: '마르크 샤갈', value: 'chagall' },
      { label: '클로드 모네', value: 'monet' },
      { label: '에곤 쉴레', value: 'schiele' },
      { label: '앤디 워홀', value: 'warhol' },
      { label: '쿠사마 야요이', value: 'kusama' },
      { label: '한국 전통 산수화', value: 'korean-landscape' },
      { label: '한국 전통 병풍', value: 'korean-screen' },
      { label: '한국 전통 풍속화', value: 'korean-genre' },
      { label: '이중섭', value: 'lee-jung-seob' },
    ]
  },
  {
    id: 'animation',
    name: '애니메이션 스타일',
    description: '상상 속 애니메이션의 한 장면처럼 연출해보세요.',
    options: [
      { label: '스튜디오 지브리', value: 'ghibli' },
      { label: '픽사', value: 'pixar' },
      { label: '디즈니', value: 'disney' },
      { label: '드림웍스', value: 'dreamworks' },
      { label: '일본 애니메이션', value: 'japanese-anime' },
      { label: '웹툰', value: 'webtoon' },
      { label: '심슨', value: 'simpsons' },
      { label: '포켓몬스터', value: 'pokemon' },
      { label: 'K-pop 데몬 헌터스', value: 'kpop-demon-hunters' },
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
      { label: '픽셀 아트', value: 'pixel-art' },
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
      { label: '창밖의 불빛', value: 'lights-window' },
      { label: '멋진 야경', value: 'night-view' },
      { label: '별빛 가득한 하늘', value: 'starry-sky' },
      { label: '흑백사진', value: 'black-white' },
      { label: '밤하늘의 불꽃놀이', value: 'fireworks' },
    ]
  },
  {
    id: 'futureCity',
    name: '미래도시 스타일',
    description: '미래 서울의 모습을 상상해보세요.',
    options: [
      { label: '로봇과 드론이 활보하는 거리', value: 'robots-drones' },
      { label: 'UAM을 타고 다니는 사람들', value: 'flying-cars' },
      { label: '빛으로 이루어진 홀로그램 도시', value: 'hologram-city' },
      { label: '녹음이 가득한 거리', value: 'green-streets' },
      { label: '사이버펑크 도시', value: 'cyberpunk' },
      { label: 'UAM 모험', value: 'urban-uam-adventure' },
    ]
  }
];

// === Helper Functions ===
async function toBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      try {
        // Canvas를 이용해 이미지 크기 조정 및 JPEG 변환
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 최대 크기 제한 (Gemini API 권장)
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        
        let width = img.width;
        let height = img.height;
        
        // 비율 유지하면서 크기 조정
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 흰색 배경 그리기 (투명 배경 제거)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        // 이미지 그리기
        ctx.drawImage(img, 0, 0, width, height);
        
        // JPEG로 변환 (품질 0.85)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      } catch (err) {
        reject(new Error(`이미지 변환 오류: ${err.message}`));
      }
    };
    
    img.onerror = () => {
      reject(new Error(`이미지 로드 실패: ${url}`));
    };
    
    // 이미지 URL 설정
    if (url.startsWith('data:')) {
      img.src = url;
    } else if (url.startsWith('http')) {
      // 외부 URL인 경우 Weserv 프록시 사용 (크기 제한 포함)
      img.src = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=1024&h=1024&fit=inside&output=jpg`;
    } else {
      // 로컬 이미지인 경우
      img.src = url;
    }
  });
}

// === Main Application Component ===
export default function App() {
  const [selectedLandmark, setSelectedLandmark] = useState(null);
  const [view, setView] = useState('gallery');
  const [theme, setTheme] = useState('light'); // 기본 테마를 light로 설정
  
  // 세션 자동 초기화를 위한 상태
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [countdown, setCountdown] = useState(10); // 10초 카운트다운
  const activityTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  
  // 설정 값 (상수)
  const INACTIVITY_TIMEOUT = 30000; // 30초 - 유휴 시간 감지
  const COUNTDOWN_SECONDS = 10; // 10초 - 경고 후 카운트다운

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
  const handleSelectLandmark = (landmark) => { 
    setSelectedLandmark(landmark); 
    flushSync(() => setView('editor')); 
    // URL 파라미터 유지하여 언어 설정 유지
    const urlParams = new URLSearchParams(window.location.search);
    const currentLang = urlParams.get('lang');
    if (currentLang) {
      // 현재 URL에 언어 파라미터가 있다면 history API로 유지
      const newUrl = new URL(window.location.href);
      window.history.replaceState({}, '', newUrl.toString());
    }
  };
  const handleBackToGallery = () => { 
    setSelectedLandmark(null); 
    flushSync(() => setView('gallery')); 
    // URL 파라미터 유지
    const urlParams = new URLSearchParams(window.location.search);
    const currentLang = urlParams.get('lang');
    if (currentLang) {
      const newUrl = new URL(window.location.href);
      window.history.replaceState({}, '', newUrl.toString());
    }
  };
  
  // 활동 감지 함수
  const updateActivity = useCallback(() => {
    setLastActivityTime(Date.now());
    setShowInactivityModal(false);
    
    // 카운트다운 중이었다면 초기화
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
      setCountdown(COUNTDOWN_SECONDS);
    }
  }, [COUNTDOWN_SECONDS]);
  
  // 카운트다운 시작 함수
  const startCountdown = useCallback(() => {
    setCountdown(COUNTDOWN_SECONDS);
    
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // 시간 초과 - 타이머 정리만
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
          return 0; // 0으로 설정하여 아래 useEffect에서 처리
        }
        return prev - 1;
      });
    }, 1000);
  }, [COUNTDOWN_SECONDS]);
  
  // 갤러리로 리셋하는 함수
  const resetToGallery = useCallback(() => {
    // 모든 상태 초기화
    setView('gallery');
    setSelectedLandmark(null);
    setShowInactivityModal(false);
    setCountdown(COUNTDOWN_SECONDS);
    
    // 타이머 정리
    if (activityTimerRef.current) {
      clearInterval(activityTimerRef.current);
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
  }, [COUNTDOWN_SECONDS]);
  
  // 이벤트 리스너 설정 - 활동 감지
  useEffect(() => {
    // 에디터 화면에서만 작동
    if (view === 'editor') {
      // 터치 이벤트
      window.addEventListener('touchstart', updateActivity);
      window.addEventListener('touchmove', updateActivity);
      
      // 마우스 이벤트 (개발/테스트용)
      window.addEventListener('mousedown', updateActivity);
      window.addEventListener('mousemove', updateActivity);
      
      // 키보드 이벤트
      window.addEventListener('keydown', updateActivity);
      
      return () => {
        window.removeEventListener('touchstart', updateActivity);
        window.removeEventListener('touchmove', updateActivity);
        window.removeEventListener('mousedown', updateActivity);
        window.removeEventListener('mousemove', updateActivity);
        window.removeEventListener('keydown', updateActivity);
      };
    }
  }, [view, updateActivity]);
  
  // 유휴 시간 체크
  useEffect(() => {
    if (view === 'editor') {
      activityTimerRef.current = setInterval(() => {
        const inactiveTime = Date.now() - lastActivityTime;
        
        if (inactiveTime >= INACTIVITY_TIMEOUT && !showInactivityModal) {
          // 경고 모달 표시
          setShowInactivityModal(true);
          startCountdown();
        }
      }, 1000); // 1초마다 체크
      
      return () => {
        if (activityTimerRef.current) {
          clearInterval(activityTimerRef.current);
        }
      };
    }
  }, [view, lastActivityTime, showInactivityModal, INACTIVITY_TIMEOUT, startCountdown]);
  
  // 카운트다운이 0이 되면 리셋
  useEffect(() => {
    if (countdown === 0 && showInactivityModal) {
      resetToGallery();
    }
  }, [countdown, showInactivityModal, resetToGallery]);
  
  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (activityTimerRef.current) clearInterval(activityTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-black text-gray-900 dark:text-gray-100 h-screen font-sans transition-colors duration-500 flex flex-col overflow-hidden pt-4 sm:pt-6">
      <div className="flex-1 w-full flex flex-col px-1 sm:px-2">
        {view === 'gallery' ? <LandmarkGallery onSelect={handleSelectLandmark} /> : <Editor landmark={selectedLandmark} onBack={handleBackToGallery} />}
      </div>
      <footer className="text-center pt-2 pb-2 text-gray-500 dark:text-gray-400 text-xs flex-shrink-0"><p>Copyright 2025 The Seoul Institute. All Rights Reserved.</p></footer>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <ThemeToggler theme={theme} toggleTheme={toggleTheme} />
        <GoogleTranslateAPI currentView={view} />
      </div>
      {showInactivityModal && (
        <InactivityModal
          countdown={countdown}
          onContinue={updateActivity}
          onReset={resetToGallery}
        />
      )}
    </div>
  );
}

function ThemeToggler({ theme, toggleTheme }) {
  return (
    <button onClick={toggleTheme} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full text-gray-800 dark:text-gray-200 shadow-lg transition-transform transform hover:scale-110" aria-label="Toggle theme">
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}

function LandmarkGallery({ onSelect }) {

  return (
    <div className="flex flex-col h-full">
      <header className="py-1 md:py-2 text-center flex-shrink-0">
        <div className="h-8 sm:h-12 md:h-16"></div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">나만의 스타일로 서울을 그려보세요!</h1>
        <br/>
        <p className="text-sm sm:text-base md:text-xl text-gray-600 dark:text-gray-400 leading-tight">
          미래 서울의 모습과 현재 서울의 명소를 나만의 스타일로 그려보세요.<br/>
          원하는 장소를 선택 후 그림 스타일을 선택하면 AI가 당신만의 서울을 창조합니다.<br/>
          완성된 그림은 QR로 소장 가능합니다.<br/><br/>
          <strong className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">내가 그리고 싶은 서울의 모습을 선택해주세요.</strong>
        </p>
      </header>
      
      <div className="flex-1 flex flex-col py-6 sm:py-8">
        <div className="h-[10%]"></div>
        <div className="w-full h-[90%] grid grid-cols-6 gap-2 sm:gap-3 md:gap-4">
          {landmarks.map((landmark) => (
            <div key={landmark.id} className="w-full h-full">
              <MediaCard landmark={landmark} onSelect={onSelect} />
            </div>
          ))}
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
    // 로컬 이미지는 직접 경로 사용 (캐시 버스팅용 timestamp 추가)
    optimizedImageUrl = getImageUrl(landmark.imageUrl) + `?t=${Date.now()}`;
  }

  return (
    <div 
      className="h-full rounded-2xl overflow-hidden cursor-pointer group relative flex flex-col justify-between p-3 sm:p-4"
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
        <h2 className="text-base md:text-xl font-bold drop-shadow-lg leading-tight" dangerouslySetInnerHTML={{__html: landmark.title}}></h2>
      </div>
      
      <div className="relative flex items-end justify-between text-white">
        <p className="text-sm sm:text-base md:text-lg opacity-95 w-4/5 drop-shadow-lg line-clamp-3 leading-snug">{landmark.description}</p>
        <PlusCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 flex-shrink-0 drop-shadow-lg" />
      </div>
    </div>
  );
}


function Editor({ landmark, onBack }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  
  // 에디터용 이미지 URL 결정
  const getEditorImageUrl = () => {
    const imageUrl = landmark.editorImageUrl || landmark.imageUrl;
    if (!imageUrl) return '';
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // 로컬 이미지는 BASE_URL 포함하여 처리
    return getImageUrl(imageUrl);
  };
  
  const editorReferenceImage = getEditorImageUrl();
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
        setQrError("QR 코드 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
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

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      setError("AI 서비스가 설정되지 않았습니다. 관리자에게 문의해주세요.");
      setGeneratedImage(editorReferenceImage);
      setIsBaseImage(true);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setIsBaseImage(false);

    try {
      setLoadingStep('AI가 이미지를 편집하고 있습니다...');
      const base64Image = await toBase64(editorReferenceImage);
      
      const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } };
      
      let textPrompt = `CRITICAL: Reimagine this landmark, '${landmark.editorTitle || landmark.title}', in a 3:4 portrait aspect ratio. MANDATORY ARCHITECTURAL PRESERVATION: The building's exact architectural shape, structure, size, proportions, and all distinctive structural features MUST remain completely identical to the original. The landmark's original form is absolutely non-negotiable and must be 100% recognizable.`;
      
      if (selectedCategory.id === 'photorealistic' && photorealisticPrompts[selectedStyle.value]) {
        const photoData = photorealisticPrompts[selectedStyle.value];
        textPrompt += `\nApply the photorealistic visual treatment described: ${photoData.prompt} IMPORTANT: Only change lighting, weather, and atmospheric conditions. The building structure remains completely unchanged. CRITICAL: Ensure realistic and authentic depiction (사실적인 묘사) - all visual elements must appear natural, physically accurate, and true to real-world conditions.`;
      } else if (selectedCategory.id === 'artist' && artistPrompts[selectedStyle.value]) {
        // 예술가 스타일의 경우 단일 예술 운동 기반 프롬프트 사용
        const artistData = artistPrompts[selectedStyle.value];
        // 모든 아티스트 스타일에 건축물 구조 보존 제약 적용
        textPrompt += `\nApply the artistic visual treatment described: ${artistData.prompt} CRITICAL CONSTRAINT: Only modify colors, textures, brushwork patterns, and surface visual effects. The building's physical form, dimensions, and architectural structure remain completely unchanged and identical to the original.`;
      } else if (selectedCategory.id === 'animation' && animationPrompts[selectedStyle.value]) {
        const animationData = animationPrompts[selectedStyle.value];
        textPrompt += `\nApply the animation visual treatment described: ${animationData.prompt} CRITICAL CONSTRAINT: Only modify colors, textures, animation style, and surface visual effects. The building's physical form, dimensions, and architectural structure remain completely unchanged and identical to the original.`;
      } else if (selectedCategory.id === 'illust' && illustrationPrompts[selectedStyle.value]) {
        const illustData = illustrationPrompts[selectedStyle.value];
        textPrompt += `\nApply the illustration visual treatment described: ${illustData.prompt} CRITICAL CONSTRAINT: Only modify colors, textures, artistic medium effects, and surface visual effects. The building's physical form, dimensions, and architectural structure remain completely unchanged and identical to the original.`;
      } else if (selectedCategory.id === 'futureCity' && futureCityPrompts[selectedStyle.value]) {
        const futureCityData = futureCityPrompts[selectedStyle.value];
        textPrompt += `\nApply the future city visual treatment described: ${futureCityData.prompt} CRITICAL CONSTRAINT: While adding futuristic elements to the scene, the main landmark building's core architectural structure must remain recognizable and unchanged. IMPORTANT: Ensure realistic and plausible depiction (사실적인 묘사) of all futuristic elements - they should look technically feasible and grounded in reality, not fantasy or sci-fi. Ultra high resolution 8K quality.`;
      } else {
        textPrompt += `\nApply the artistic style of ${selectedStyle.value}. MANDATORY: Only change visual surface treatment (colors, textures, artistic effects) while keeping the exact same architectural form and structure as the original building.`;
      }

      if (landmark.id === 'seoul-ring') {
        textPrompt += `\nEnsure the spokeless, vertically-oriented ring structure is clearly depicted.`;
      }
      
      // 노들섬 + 미래도시 스타일인 경우 강(river) 배경 및 수상버스 추가
      const futureCityStyles = ['robots-drones', 'flying-cars', 'hologram-city', 'green-streets', 'cyberpunk', 'urban-uam-adventure'];
      if (landmark.id === 'nodeul-island' && futureCityStyles.includes(selectedStyle.value)) {
        // 노들섬 + 미래도시 스타일 조건
        
        // 로봇과 드론 스타일인 경우 특별 처리
        if (selectedStyle.value === 'robots-drones') {
          textPrompt += `\nThe background of this scene MUST be a river (강). Instead of a street scene, this must be a riverside (강변) scene where robots walk along the riverside path and drones fly over the river. Water buses (수상버스) must be visible moving on the river. The building must be positioned with the river clearly visible as the background.`;
        } else {
          textPrompt += `\nThe background of this scene MUST be a river (강). The building must be positioned with the river clearly visible as the background behind it. Water buses (수상버스) must be visible moving on the river. Include one or more water buses navigating the river as part of the scene composition. The river should be a prominent feature in the composition.`;
        }
      }
      
      // 노들섬 + 실사풍 스타일인 경우 강 배경 및 수상버스 추가
      const photorealisticStyles = ['heavy-snow', 'full-bloom', 'thunder-lightning', 'sunset', 'strong-sunlight', 'autumn-leaves', 'lights-window', 'night-view', 'starry-sky', 'black-white', 'fireworks'];
      if (landmark.id === 'nodeul-island' && photorealisticStyles.includes(selectedStyle.value)) {
        // 노들섬 + 실사풍 스타일 조건
        textPrompt += `\nThe background of this scene MUST be a river (강). The building must be positioned with the river clearly visible as the background. Water buses (수상버스) must be visible moving on the river. Include one or more water buses navigating the river as part of the scene composition. The river should be a prominent feature in the composition.`;
      }
      
      // 서울링 + 미래도시 스타일인 경우 공원 배경 추가
      if (landmark.id === 'seoul-ring' && futureCityStyles.includes(selectedStyle.value)) {
        // 서울링 + 미래도시 스타일 조건
        textPrompt += `\nThe background of this scene MUST be a park (공원). The Seoul Ring structure must be positioned with the park clearly visible as the background. The park setting should include green spaces, trees, and pathways. The park should be a prominent feature in the composition.`;
      }
      
      // 남산 서울타워 + 미래도시 스타일인 경우 남산 배경 추가
      if (landmark.id === 'namsan-tower' && futureCityStyles.includes(selectedStyle.value)) {
        // 남산 서울타워 + 미래도시 스타일 조건
        textPrompt += `\nThe background of this scene MUST be Mount Namsan (남산). The Seoul Tower must be positioned on top of Mount Namsan with the mountain's forested slopes clearly visible as the background. The mountain landscape with its trees and natural terrain should be a prominent feature in the composition. The futuristic elements should blend harmoniously with the natural mountain setting.`;
      }
      
      // 용산국제업무지구 + 실사풍 + 멋진 야경인 경우 건물 불빛 추가
      if (landmark.id === 'yongsan-business-district' && selectedCategory.id === 'photorealistic' && selectedStyle.value === 'night-view') {
        // 용산국제업무지구 + 실사풍 + 멋진 야경 조건
        textPrompt += `\nThis is a business district scene at night. The buildings MUST have illuminated windows creating a beautiful night cityscape (건물들의 불빛/야경). Multiple office buildings should show patterns of lit windows against the dark night sky. The building lights should create a sophisticated urban night atmosphere with various lighting levels across different floors and buildings.`;
      }

      // 최종 프롬프트 확인용 로그
      // Final prompt ready for generation
      
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
        // Gemini API Error
        
        // 더 구체적인 에러 메시지 처리
        if (errorData.error?.message?.includes('Unable to process input image')) {
          throw new Error('이미지 처리 실패: 이미지 형식이나 크기를 확인해주세요.');
        } else if (errorData.error?.message?.includes('API key')) {
          throw new Error('API 키가 유효하지 않습니다.');
        } else {
          throw new Error(`Gemini API Error: ${errorData.error?.message || '알 수 없는 오류'}`);
        }
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
      // Image generation error
      if (err.message.includes("overloaded")) {
         setError("AI 모델이 현재 과부하 상태입니다. 잠시 후 다시 시도해주세요.");
      } else if (err.message.includes("이미지 처리 실패")) {
         setError("이미지 처리에 실패했습니다. 다른 이미지를 선택하거나 잠시 후 다시 시도해주세요.");
      } else if (err.message.includes("이미지 로드 실패") || err.message.includes("이미지 변환 오류")) {
         setError("참조 이미지를 불러올 수 없습니다. 페이지를 새로고침하고 다시 시도해주세요.");
      } else if (err.message.includes("API 키가 유효하지 않습니다")) {
         setError("AI 서비스 인증에 실패했습니다. 관리자에게 문의해주세요.");
      } else if (err.message.includes("API")) {
         setError("AI 서비스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
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
    <div className="h-full flex flex-col overflow-hidden relative">
      <div className="flex-1 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-[0.4fr,0.6fr] gap-4 lg:gap-14 px-4 py-4 h-full">
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 mb-4">
                <h2 className="text-3xl md:text-4xl font-bold mb-1">{landmark.editorTitle || landmark.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-base md:text-xl line-clamp-2">{landmark.description}</p>
            </div>
            <div className="relative flex-1">
                <div className="absolute inset-0 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                    {isLoading ? (
                        <div className="text-center"><Sparkles className="animate-spin h-12 w-12 text-gray-500 mx-auto" /><p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">{loadingStep}</p></div>
                    ) : error ? (
                        <div className="p-4 text-center"><p className="text-red-500 dark:text-red-400 text-lg">오류 발생:</p><p className="text-base text-red-600 dark:text-red-500 mt-2">{error}</p></div>
                    ) : generatedImage ? (
                        <img 
                          src={generatedImage.startsWith('data:') ? generatedImage : 
                               generatedImage.startsWith('http') ? 
                                 (isBaseImage ? `https://images.weserv.nl/?url=${encodeURIComponent(generatedImage)}` : generatedImage) :
                                 generatedImage
                          } 
                          alt="Generated Landmark" 
                          className={`transition-opacity duration-500 ${
                            isBaseImage 
                              ? 'w-full h-full object-cover' // 원본 이미지: 컨테이너에 맞게 확대
                              : 'max-w-full max-h-full w-auto h-auto object-contain' // AI 생성 이미지: 화면 영역 내 제한
                          }`}
                          style={isBaseImage ? {} : { maxHeight: '100%', maxWidth: '100%' }}
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src='https://placehold.co/900x1200/000000/FFFFFF?text=Error+Loading+Image'; 
                          }}
                        />
                    ) : (
                        <div className="text-center">
                          <p className="text-gray-500 text-lg">이미지를 불러올 수 없습니다.</p>
                        </div>
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
        <div className="flex flex-col h-full pt-8">
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="mt-[5vh]"></div>
            <div className="space-y-6">
              {/* 1단계: 카테고리 선택 (탭) */}
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">1단계: 스타일 카테고리 선택</h3>
                <p className="text-xl text-blue-600 dark:text-blue-400 mb-4">내가 그리고 싶은 서울의 모습을 선택해주세요.</p>
                <div className="flex flex-wrap gap-2">
                  {styleCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                      className={`px-5 py-3 rounded-full text-2xl font-semibold leading-5 transition-colors focus:outline-none ${
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
                <div className="mt-16">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">2단계: 세부 스타일 선택</h3>
                  <p className="text-xl text-blue-600 dark:text-blue-400 mb-4">{selectedCategory.description}</p>
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
                        <span className="font-medium text-gray-900 dark:text-white text-lg">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="h-4"></div>
          </div>

          {/* 하단 고정 버튼 영역 - 스크롤 영역 내부 */}
          <div className="flex-shrink-0 py-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-4">
              {/* 생성하기 버튼 - 더 크게, 왼쪽 배치 */}
              <button 
                onClick={handleGenerate} 
                disabled={isLoading || !selectedStyle} 
                className="flex-[2] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-2xl">{isLoading ? '생성 중...' : '나만의 서울 미래상 생성하기'}</span>
              </button>
              
              {/* 처음으로 버튼 - 더 작게, 오른쪽 배치 */}
              <button 
                onClick={onBack}
                className="flex-1 bg-white dark:bg-gray-800 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl hover:bg-blue-50 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-2xl">처음으로</span>
              </button>
            </div>
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
        <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">QR 코드로 이미지 소장하기</h3>
        {qrCodeUrl && (
          <div>
            <img src={qrCodeUrl} alt="Generated QR Code" className="mx-auto rounded-lg" />
            <p className="text-base text-gray-600 dark:text-gray-400 mt-4">스마트폰 카메라로 QR 코드를 스캔하여 이미지를 확인하고 저장하세요.</p>
          </div>
        )}
        {qrError && (
          <div>
            <p className="text-red-500 dark:text-red-400 text-lg">{qrError}</p>
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

// InactivityModal 컴포넌트
function InactivityModal({ countdown, onContinue, onReset }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div className="text-center">
          {/* 경고 아이콘 */}
          <div className="mx-auto w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold mb-4 dark:text-white">
            잠시 사용하지 않으셨네요
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            계속 사용하시려면 화면을 터치해주세요
          </p>
          
          {/* 카운트다운 표시 */}
          <div className="mb-8">
            <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {countdown}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              초 후에 처음 화면으로 돌아갑니다
            </p>
          </div>
          
          {/* 프로그레스 바 */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(countdown / 10) * 100}%` }}
            />
          </div>
          
          {/* 버튼 */}
          <div className="flex gap-4">
            <button
              onClick={onReset}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              처음으로
            </button>
            <button
              onClick={onContinue}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              계속하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
