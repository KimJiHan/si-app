import React, { useState, useEffect, useRef, useCallback, lazy, Suspense, memo } from 'react';
import { flushSync } from 'react-dom';

// 지연 로딩을 위한 동적 임포트
const PersistentGoogleTranslate = lazy(() => import('./components/PersistentGoogleTranslate'));
const LazyImage = lazy(() => import('./components/LazyImage'));

// === Icon Components (Memoized) ===
const ChevronLeft = memo((props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6" /></svg> ));
const Sparkles = memo((props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9 1.9 5.8 1.9-5.8 5.8-1.9-5.8-1.9Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg> ));
const Sun = memo((props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg> ));
const Moon = memo((props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg> ));
const PlusCircle = memo((props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>));
const X = memo((props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>));
const RefreshCw = memo((props) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>));


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
    videoUrl: 'image/page1/seoul-ring2.mp4',
    editorImageUrl: 'image/page2/seoul-ring.jpg'
  },
  { 
    id: 'nodeul-island', 
    title: '미래 서울<br/>노들 글로벌 예술섬', 
    editorTitle: '노들 글로벌 예술섬',
    description: '노들섬을 자연과 예술, 독특한 경험이 가득한 공간으로 재탄생시키는 프로젝트입니다.', 
    imageUrl: 'image/page1/nodeul-arts-island.png',
    videoUrl: 'image/page1/nodeul-arts-island2.mp4',
    editorImageUrl: 'image/page2/nodeul-island.jpg'
  },
  { 
    id: 'yongsan-ibd', 
    title: '미래 서울<br/>용산국제업무지구', 
    editorTitle: '용산국제업무지구',
    description: '용산역 일대를 국제적 비즈니스 허브로 조성하는 대규모 복합개발 프로젝트입니다.', 
    imageUrl: 'image/page1/yongsan-business-district.png',
    videoUrl: 'image/page1/yongsan-business-district2.mp4',
    editorImageUrl: 'image/page2/yongsan-ibd2.png'
  },
  { 
    id: 'ddp', 
    title: '서울 랜드마크<br/>동대문디자인플라자', 
    editorTitle: '동대문디자인플라자',
    description: '동대문의 랜드마크로, 독특한 곡선 디자인이 돋보이는 복합문화공간입니다.', 
    imageUrl: 'image/page1/dongdaemun-design-plaza.png',
    videoUrl: 'image/page1/dongdaemun-design-plaza2.mp4',
    editorImageUrl: 'image/page2/ddp.jpg'
  },
  { 
    id: 'namsan-tower', 
    title: '서울 랜드마크<br/>남산서울타워', 
    editorTitle: '남산서울타워',
    description: '남산 정상에 위치한 서울의 상징적 랜드마크로, 서울 전경을 한눈에 볼 수 있습니다.', 
    imageUrl: 'image/page1/namsan-tower.png',
    videoUrl: 'image/page1/namsan-tower2.mp4',
    editorImageUrl: 'image/page2/namsan-tower.jpg'
  },
  { 
    id: 'bukchon-hanok', 
    title: '서울 랜드마크<br/>북촌한옥마을', 
    editorTitle: '북촌한옥마을',
    description: '조선시대 전통 가옥들이 보존된 역사적 문화지구로, 한국의 전통미를 간직하고 있습니다.', 
    imageUrl: 'image/page1/bukchon-hanok.png',
    videoUrl: 'image/page1/bukchon-hanok2.mp4',
    editorImageUrl: 'image/page2/bukchon-hanok.jpg'
  }
];

// === Art Movement-Based Artist Prompts ===
const artistPrompts = {
  'van-gogh': {
    name: '빈센트 반 고흐',
    movement: '후기 인상주의 (Post-Impressionism)',
    prompt: () => {
      // 반 고흐의 다양한 시각과 기법을 랜덤하게 선택
      const vanGoghModes = [
        'A masterpiece of **Vincent van Gogh\'s EXPRESSIVE EMOTIONAL VISION**. The architecture BLOOMS with thick impasto brushstrokes that spiral and dance. Paint is applied so heavily it creates three-dimensional texture. Colors VIBRATE with emotional intensity - yellows glow like sunshine, blues swirl like flowing waters. The building pulsates with the artist\'s creative energy.',
        'A masterpiece in **Van Gogh\'s STARRY NIGHT STYLE**. The entire architectural structure is caught in a cosmic whirlwind. The sky above swirls in massive spirals, pulling the building into its vortex. Windows glow like stars, walls ripple like waves of energy. Everything moves in rhythmic, hypnotic patterns.',
        'A masterpiece of **Van Gogh\'s SUNFLOWER INTENSITY**. The building blooms like a giant architectural flower. Every surface radiates with golden yellows and burning oranges. Thick paint strokes grow outward from the structure like petals. The architecture becomes organic, alive, breathing.',
        'A masterpiece in **Van Gogh\'s CYPRESSES STYLE**. The building reaches upward like a towering tree. Vertical brushstrokes surge skyward with powerful force. The structure appears to be caught in gentle wind, bending and swaying with rhythmic movement.',
        'A masterpiece of **Van Gogh\'s WHEAT FIELD PERSPECTIVE**. View the building from ground level through waves of golden wheat. The architecture rises like a ship on an ocean of grain. Brushstrokes create movement in every direction - horizontal fields, vertical building, swirling sky.',
        'A masterpiece in **Van Gogh\'s VIBRANT CAFÉ STYLE**. The building transforms with expressive energy. Perspective dances, walls lean at dynamic angles. Colors contrast brilliantly - vivid greens against passionate reds. The architecture sings with the artist\'s creative passion.',
        'A masterpiece of **Van Gogh\'s BEDROOM INTIMACY**. Extreme close-up view that makes the building feel like an interior space. We\'re so close we can see individual bricks transformed into swirling paint. The massive becomes intimate, the public becomes personal.',
        'A masterpiece in **Van Gogh\'s OLIVE TREES RHYTHM**. The building sways and dances like a living tree. Every line curves and flows. The rigid architecture becomes fluid, organic. Brushstrokes create a visual rhythm that makes the structure appear to breathe.'
      ];
      
      return vanGoghModes[Math.floor(Math.random() * vanGoghModes.length)] + ' Hyper-detailed, EXTREME emotional intensity, visible three-dimensional paint texture.';
    }
  },
  'picasso': {
    name: '파블로 피카소',
    movement: '입체주의 (Cubism)',
    prompt: () => {
      // 피카소의 다양한 시기와 기법을 랜덤하게 선택
      const variations = [
        // 분석적 큐비즘 - 극단적 해체
        'A masterpiece of **Extreme Analytical Cubism**. The building TRANSFORMS into thousands of crystalline geometric facets, each reflecting a different moment in time. View from INSIDE the transformation - fragments float around the viewer. Monochromatic palette of steel grays and warm umbers. The architecture exists in a state of perpetual deconstruction and reconstruction.',
        
        // 종합적 큐비즘 - 콜라주 구성
        'A masterpiece of **Dynamic Synthetic Cubism**. The building is a COLLAGE BURST - abstract patterns, wood textures, metal sheets, and glass fragments BLOOM from the core. EXTREME CLOSE-UP view - we are INSIDE a wall looking out. Vibrant contrasting colors - electric orange against emerald green. Geometric patterns become architecture, shapes ARE walls.',
        
        // 청색 시대 - 서정적 변형
        'A masterpiece of **Picasso\'s Blue Period Poetic Vision**. The building transforms in deep contemplation, its geometric planes flowing gracefully. UNDERWATER PERSPECTIVE - viewing the building from below as it floats in serene ocean blues. Each fragment is a meditation, each angle a reflection. The architecture floats in tranquil geometric harmony.',
        
        // 새로운 시대 - 동적 변환
        'A masterpiece of **Picasso\'s Dynamic Cubist Transformation**. The building is in PERPETUAL MOTION. MULTIPLE SIMULTANEOUS VIEWPOINTS - see the structure from above, below, inside, outside AT ONCE. Monochrome with energetic geometric fragmentation. Each fragment dances. Architecture as kinetic sculpture. The building\'s movement captured in cubic harmony.',
        
        // 미노타우로스 - 신화적 미궁
        'A masterpiece of **Picasso\'s Mythological Labyrinth**. The building becomes a MAGICAL MAZE - corridors lead to wonder, exteriors blend with interiors. EXPLORER\'S VIEW - we navigate through the building\'s cubic pathways. Classical motifs emerge from corners, mythical symbols appear in windows. Architecture as legendary wonder.',
        
        // 초현실주의 - 꿈의 왕국
        'A masterpiece of **Picasso\'s Surrealist Architecture Dream**. The building EXISTS IN MULTIPLE DIMENSIONS simultaneously. FISH-EYE LENS DISTORTION - the entire building curves into a sphere. Soft biomorphic forms melt through hard geometric planes. Eyes grow from walls, hands reach from windows. Reality has no rules here.'
      ];
      
      return variations[Math.floor(Math.random() * variations.length)] + ' Ultra high detail, EXTREME perspective, revolutionary cubist vision.';
    }
  },
  'chagall': {
    name: '마르크 샤갈',
    movement: '초현실주의 / 상징주의 (Surrealism / Symbolism)',
    prompt: 'A masterpiece in the **style of Marc Chagall**, reimagining this architectural landmark through Chagall\'s dreamlike surrealist vision. The building floats freely in a deep blue night sky, maintaining its upright orientation while surrounded by flying lovers, musical instruments, and symbolic animals. The architecture may be stretched, curved, or fragmented according to Chagall\'s emotional narrative. Windows transform into eyes or stars, walls become transparent revealing inner dreams. The entire scene defies gravity and logic in Chagall\'s characteristic poetic style. Hyper-detailed, rich symbolic colors, dreamlike transformation.'
  },
  'monet': {
    name: '클로드 모네',
    movement: '인상주의 (Impressionism)',
    prompt: 'A masterpiece of **Impressionism**, capturing the fleeting effects of light and atmosphere on water and landscapes with soft focus and short, visible brushstrokes. Highly detailed.'
  },
  'schiele': {
    name: '에곤 쉴레',
    movement: '표현주의 (Expressionism)',
    prompt: 'A masterpiece of **Expressionism**, depicting the landmark itself with raw, angular lines and bold, dramatic contrasts that capture the distinctive tension and dynamic energy of urban architecture, **in the style of Egon Schiele**. Highly detailed.'
  },
  'warhol': {
    name: '앤디 워홀',
    movement: '팝 아트 (Pop Art)',
    prompt: 'A masterpiece of **Pop Art**, using a flat, commercial, screen-printing aesthetic with bold, saturated colors and serial repetition of a mass-produced object. Highly detailed.'
  },
  'kusama': {
    name: '쿠사마 야요이',
    movement: '강박 예술 / 미니멀리즘 (Obsessional Art / Minimalism)',
    prompt: 'A masterpiece of **Obsessional Art**, creating a hallucinatory visual field through the infinite repetition of polka dots and net patterns over a high-contrast surface. Highly detailed.'
  },
  'korean-landscape': {
    name: '한국 전통 산수화',
    movement: '진경산수화 / 수묵화 (Jingyeong Sansuhwa / Ink Wash Painting)',
    prompt: 'A masterpiece of **Korean True-view Landscape Painting (Jingyeong Sansu-hwa)**, embodying the profound beauty of negative space (여백의 미) and contemplative stillness. The architectural landmark appears as a distant element within vast expanses of mist and emptiness. Following the principle of "less is more," only essential strokes define the building, while 70% of the composition remains as breathing space. Subtle ink gradations from deep black to pale gray create atmospheric depth. The building may be partially hidden by clouds or suggested through minimal brushwork. Pine trees and rocks are sparse, each carefully placed for maximum impact. The overall mood is serene, meditative, with generous empty spaces inviting contemplation. Traditional Korean aesthetic of restraint, where emptiness speaks louder than form.'
  },
  'korean-screen': {
    name: '한국 전통 병풍',
    movement: '민화 / 장식화 (Minhwa / Decorative Painting)',
    prompt: 'Reinterpret the provided image into a masterpiece designed as a **traditional Korean folding screen (Byeongpung)**, with a strong emphasis on **Yeobaek (the beauty of empty space)**. Maintain the core subject matter, but simplify the composition, leaving generous empty spaces to create a sense of tranquility, contemplation, and profound depth. Render the main subjects with clean, understated outlines and a harmonious, slightly muted color palette using traditional mineral pigments. The final image should feel like a multi-paneled, serene traditional Korean screen, where the empty space is as important as the painted subjects themselves. **Hyper-detailed, subdued traditional colors, minimalist composition**.'
  },
  'korean-genre': {
    name: '한국 전통 풍속화',
    movement: '풍속화 (Pungsok-hwa)',
    prompt: 'A masterpiece in the **style of traditional Korean genre painting (Pungsok-hwa)**, balancing human activity with serene negative space. While depicting daily life around the architectural landmark, the composition maintains the Korean aesthetic of restraint - human figures are small and delicate, occupying minimal space. Large areas of empty background allow the scene to breathe. Soft, earthy colors - ochre, sienna, muted blues - create a calm atmosphere. The building serves as a quiet backdrop rather than dominating the scene. Activities are suggested through minimal gestures rather than detailed depiction. Following the principle of 여백의 미, empty spaces between figures are as important as the figures themselves. **in the style of Kim Hong-do**. Gentle humor, subtle emotion, vast quietness.'
  },
  'lee-jung-seob': {
    name: '이중섭',
    movement: '한국 근대미술 / 표현주의 (Korean Modern Art / Expressionism)',
    prompt: 'A masterpiece of **Korean modern expressionism**, dynamically reinterpreting the architectural landmark through Lee Jung-seob\'s passionate vision. The building\'s forms are energized with powerful, expressive lines that convey deep emotion and hope. Architectural elements may morph into bulls, children, or birds - Lee\'s signature symbols. The structure itself becomes a canvas for authentic emotional expression, with walls showing rich textures and dynamic marks. Perspective and proportion serve artistic truth rather than physical accuracy. Bold, confident mark-making transforms architecture into a celebration of the human spirit. Highly detailed, powerful emotional expression.'
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
    prompt: 'A masterpiece in the **Studio Ghibli style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, featuring beautifully detailed scapes and a warm, nostalgic watercolor aesthetic that evokes a sense of wonder and harmony with nature. Highly detailed.'
  },
  'pixar': {
    name: '픽사',
    style: '3D 디지털 애니메이션 (3D Digital Animation)',
    prompt: 'A masterpiece rendered in **authentic Pixar Animation Studios style**, specifically evoking the RenderMan rendering engine\'s signature creamy-soft appearance seen in films like Toy Story, Finding Nemo, and Soul. The architectural structure is bathed in Pixar\'s characteristic warm, golden-hour lighting with subtle ambient occlusion creating soft shadows in corners and crevices. The scene features Pixar\'s signature color theory - complementary color pairs (blue-orange or purple-yellow) creating visual harmony. Materials exhibit that distinctive Pixar quality: slightly stylized yet believable, with subtle subsurface scattering giving everything a gentle inner glow - from concrete that looks almost toy-like to glass with rainbow-tinted fresnel effects. Environmental storytelling fills the frame with tiny narrative details - a forgotten toy on a windowsill, a child\'s drawing taped to a door, balloons caught on a rooftop (like in Up) - each telling a small story. The atmosphere captures that quintessential "Pixar moment" feeling - nostalgic, heartwarming, and subtly magical. Technical rendering includes ray-traced reflections with a soft, dreamy quality, volumetric light rays filtering through windows creating god rays, and that characteristic Pixar depth-of-field where the background melts into painterly bokeh. The entire image has that unmistakable RenderMan polish - simultaneously photorealistic and pleasantly stylized, with every surface having a subtle, appealing tactility. Hidden Easter eggs like the Luxo Jr. ball or "A113" subtly integrated into architectural details. The overall mood is optimistic and inviting, with that special Pixar ability to make even inanimate objects feel alive and full of personality. Hyper-detailed yet maintaining visual clarity and emotional warmth.'
  },
  'disney': {
    name: '디즈니',
    style: '클래식 2D 애니메이션 (Classic 2D Animation)',
    prompt: 'A masterpiece in the **classic Disney animation style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, rendered with smooth lines, a vibrant and magical color palette, and a sense of wonder and romance. Highly detailed.'
  },
  'dreamworks': {
    name: '드림웍스',
    style: '3D 어드벤처 애니메이션 (3D Adventure Animation)',
    prompt: 'A masterpiece in the **DreamWorks 3D animation style**, depicting the architectural structure with DreamWorks\' signature bold and adventurous visual language. The scene features vibrant, highly saturated colors with dramatic contrast between lights and darks. Dynamic camera angle suggesting movement and energy, as if captured during an exciting action sequence. Slightly exaggerated architectural proportions for enhanced visual impact and comedic charm. Theatrical, dramatic lighting with bold rim lights and strong directional shadows that create a sense of adventure. Stylized textures with a slight cartoon quality that \'pop\' off the screen. The atmosphere is energetic and playful, with that distinctive DreamWorks \'smirk\' - a blend of sophistication and mischief. Environmental effects like dramatic clouds, dynamic weather, or magical particles enhance the adventurous mood. The rendering style balances realistic detail with artistic stylization, creating that unmistakable DreamWorks look seen in Shrek, How to Train Your Dragon, and Kung Fu Panda. Hyper-detailed with emphasis on bold visual storytelling and cinematic excitement.'
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
    prompt: "A masterpiece in **The Simpsons' animation style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, characterized by bold, simple outlines, flat color application, and a distinctive, satirical cartoon aesthetic. Highly detailed."
  },
  'pokemon': {
    name: '포켓몬스터',
    style: '일본 어드벤처 애니메이션 (Japanese Adventure Animation)',
    prompt: 'A masterpiece in the **classic Pokémon anime style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, in a lush, natural landscape. The scene is characterized by clean, bold outlines, bright cel-shaded colors, and dynamic action lines that convey a sense of a friendly but exciting battle. Highly detailed.'
  },
  'makoto-shinkai': {
    name: '신카이 마코토',
    style: '감성적 애니메이션 (Emotional Animation)',
    prompt: 'A masterpiece in the **Makoto Shinkai style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, featuring breathtaking, photorealistic backgrounds with dramatic lighting, lens flares, and atmospheric effects that create an emotionally evocative scene. Highly detailed.'
  },
  'kpop-demon-hunters': {
    name: 'K-pop 데몬 헌터스',
    style: 'K-pop 어반 판타지 (K-pop Urban Fantasy)',
    prompt: 'A masterpiece in the **Netflix K-pop Demon Hunters animated series style**, depicting the architectural structure as a supernatural battleground where K-pop idols fight demons. The scene features vibrant neon-lit Seoul at night, with the landmark transformed into a mystical arena glowing with magical energy. Style combines Korean webtoon aesthetics with high-quality anime production values, featuring dynamic action poses, glowing rune patterns, supernatural auras in purple and cyan, and dramatic particle effects. The architecture pulses with otherworldly power while maintaining its recognizable form. Hyper-detailed with cinematic lighting and explosive magical effects.'
  },
  'vintage-poster': {
    name: '빈티지 포스터',
    style: '빈티지 포스터 (Vintage Poster)',
    prompt: 'A masterpiece in the **Art Deco vintage poster style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, rendered as a stylized 1920s-1930s travel poster. Features bold geometric shapes, flat color planes, limited color palette with strong contrasts, and decorative typography elements. CRITICAL: Do NOT include any radial sunburst patterns or rays emanating from a center point. Use horizontal bands, zigzag patterns, or geometric frames instead. Highly stylized, graphic design aesthetic.'
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
  },
  'robots-daily': {
    name: '로봇과 함께하는 일상',
    style: '실사풍 (Photorealistic)',
    prompt: 'A masterpiece in a **photorealistic** style, depicting the architectural structure in the reference image while maintaining its original form and proportions, showing the warm daily life of future Seoul where humans and robots coexist naturally. Friendly service robots assist people at cafes and shops, companion robots walk alongside families in parks, and educational robots play with children. The scene captures intimate moments of human-robot interaction with soft, natural lighting that emphasizes the harmonious and heartwarming atmosphere. Hyper-detailed, warm color palette, slice of life aesthetic.'
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
  'lego': {
    name: '레고',
    style: '레고 브릭 스타일 (Lego Brick Style)',
    prompt: 'A masterpiece constructed in the **authentic LEGO brick toy style**, depicting the architectural structure as if it were an actual LEGO Creator Expert set. Built entirely from genuine LEGO bricks with visible studs on top of each brick, showing realistic LEGO piece connections, seams between blocks, and the characteristic glossy plastic texture. Features authentic LEGO colors (bright red, yellow, blue, green, white, black), minifigure scale proportions, and modular building techniques. The image should look like a professional LEGO set product photo with clean studio lighting that emphasizes the toy-like plastic sheen and individual brick details. Include LEGO baseplates, transparent pieces for windows, and specialty pieces like slopes and arches. Hyper-realistic toy photography style, shallow depth of field for that miniature effect.'
  },
  'pixel-art': {
    name: '픽셀 아트',
    style: '픽셀 아트 (Pixel Art)',
    prompt: 'A masterpiece in the **pixel art style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, a vibrant fantasy landscape. The image is constructed from a limited color palette and a low-resolution grid, where individual pixels are intentionally visible, creating a clean, sharp, and nostalgic retro aesthetic. Hyper-detailed, 16-bit, 8-bit, vibrant colors.'
  },
  'tilt-shift': {
    name: '틸트 시프트 미니어처',
    style: '틸트 시프트 미니어처 (Tilt-Shift Miniature)',
    prompt: 'A masterpiece in the **tilt-shift miniature style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, transformed into a charming miniature diorama. The image features selective focus with blur at the top and bottom, creating a shallow depth of field effect that makes the real world appear as a tiny model. Bright, saturated colors enhance the toy-like quality. Hyper-detailed center focus, miniature world effect.'
  },
  'isometric': {
    name: '아이소메트릭 일러스트',
    style: '아이소메트릭 일러스트 (Isometric Illustration)',
    prompt: 'A masterpiece in the **isometric illustration style**, depicting the architectural structure in the reference image while maintaining its original form and proportions, rendered in a precise 30-degree angle view from above. The image features clean geometric shapes, flat colors, and no perspective distortion, similar to Monument Valley or Minecraft aesthetics. Perfect parallel lines, vector graphics quality, vibrant colors with subtle gradients. Hyper-detailed, architectural precision.'
  },
  'figure': {
    name: '피규어',
    style: '피규어 스타일 (Figure Style)',
    prompt: 'A masterpiece in the **collectible figure style**, depicting the architectural landmark itself transformed into a detailed miniature figure while maintaining its recognizable form and characteristics. The landmark becomes a high-quality collectible figure with precise details, as if it were a premium scale model or architectural miniature. The rendering should be photorealistic, showing the landmark as a tangible figure with realistic materials and textures - concrete, glass, metal - all rendered at miniature scale. Clean studio product photography with professional lighting that emphasizes the figure\'s craftsmanship and detail. The landmark appears as a meticulously crafted collectible piece. Hyper-detailed, museum-quality miniature presentation.'
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
      { label: '빈티지 포스터', value: 'vintage-poster' },
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
      { label: '레고', value: 'lego' },
      { label: '픽셀 아트', value: 'pixel-art' },
      { label: '틸트 시프트 미니어처', value: 'tilt-shift' },
      { label: '아이소메트릭 일러스트', value: 'isometric' },
      { label: '피규어', value: 'figure' },
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
      { label: '로봇과 함께하는 일상', value: 'robots-daily' },
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
        
        // 최대 크기 제한 (더 큰 이미지 생성을 위해 증가)
        const MAX_WIDTH = 2048;
        const MAX_HEIGHT = 2048;
        
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
      img.src = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=2048&h=2048&fit=inside&output=jpg`;
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
  const [triggerTranslation, setTriggerTranslation] = useState(0); // 동적 콘텐츠 번역 트리거
  
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
    // QR code library removed - feature deprecated
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
        {view === 'gallery' ? <LandmarkGallery onSelect={handleSelectLandmark} /> : <Editor landmark={selectedLandmark} onBack={handleBackToGallery} setTriggerTranslation={setTriggerTranslation} />}
      </div>
      <footer className="text-center pt-2 pb-2 text-gray-500 dark:text-gray-400 text-xs flex-shrink-0"><p>Copyright 2025 The Seoul Institute. All Rights Reserved.</p></footer>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <ThemeToggler theme={theme} toggleTheme={toggleTheme} />
        <Suspense fallback={<div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>}>
          <PersistentGoogleTranslate currentView={view} triggerTranslation={triggerTranslation} />
        </Suspense>
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
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  
  // 이미지 URL 결정 로직
  let optimizedImageUrl;
  if (landmark.imageUrl.startsWith('http')) {
    // 외부 이미지는 Weserv를 통해 최적화
    optimizedImageUrl = `https://images.weserv.nl/?url=${encodeURIComponent(landmark.imageUrl)}&w=600&h=800&fit=cover&q=90&output=webp`;
  } else {
    // 로컬 이미지는 직접 경로 사용 (캐시 버스팅용 timestamp 추가)
    optimizedImageUrl = getImageUrl(landmark.imageUrl) + `?t=${Date.now()}`;
  }

  // 비디오 URL 처리
  const videoUrl = landmark.videoUrl ? getImageUrl(landmark.videoUrl) : null;

  // 비디오 자동 재생
  useEffect(() => {
    if (videoRef.current && isVideoLoaded) {
      // 자동 재생 시작
      videoRef.current.play().catch(() => {
        // 자동 재생 실패 시 무시
      });
    }
  }, [isVideoLoaded]);

  return (
    <div 
      className="h-full rounded-2xl overflow-hidden cursor-pointer group relative flex flex-col justify-between p-3 sm:p-4"
      onClick={() => onSelect(landmark)}
    >
      {!isLoaded && <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>}
      
      {/* 배경 이미지 */}
      <img
        src={optimizedImageUrl}
        alt={landmark.title}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
      />
      
      {/* 비디오 오버레이 (있는 경우) */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoadedData={() => setIsVideoLoaded(true)}
          autoPlay
          muted
          loop
          playsInline
        />
      )}
      
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


function Editor({ landmark, onBack, setTriggerTranslation }) {
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
  const [showRegenerateMessage, setShowRegenerateMessage] = useState(false);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedStyle(null); // 카테고리 변경 시 스타일 선택 초기화
    setShowRegenerateMessage(false); // 카테고리 변경 시 재생성 메시지 숨기기
    if (setTriggerTranslation) {
      setTriggerTranslation(prev => prev + 1); // 새로운 스타일 옵션 번역 트리거
    }
  };

  const handleStyleSelect = (style) => {
    setSelectedStyle(style);
    setShowRegenerateMessage(false); // 스타일 변경 시 재생성 메시지 숨기기
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
    setShowRegenerateMessage(false); // 새 이미지 생성 시 메시지 숨기기

    try {
      setLoadingStep('AI가 이미지를 편집하고 있습니다...');
      const base64Image = await toBase64(editorReferenceImage);
      
      const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } };
      
      let textPrompt = `MANDATORY FORMAT: Generate a VERTICAL image with 3:4 aspect ratio (portrait orientation, taller than wide). 

CRITICAL ORIENTATION RULES: 
- The image must be ABSOLUTELY UPRIGHT and properly oriented
- NEVER inverted, flipped, rotated, or upside down
- Buildings must stand on their foundations, not on their roofs
- Sky must be above, ground must be below
- Maintain correct gravitational orientation at all times

NO TEXT WHATSOEVER:
- Absolutely NO text, words, letters, numbers, or characters
- NO signs, labels, captions, or watermarks
- NO typography or written language in any script
- Pure visual art only - no textual elements of any kind

QUALITY REQUIREMENTS: Create an ultra high quality, professional masterpiece image. Resolution: 8K quality (minimum 2048x2732 pixels). Detail level: Hyper-detailed with sharp focus and crystal clear rendering. Professional studio-quality output.

ARTISTIC INTERPRETATION: Reimagine this landmark, '${landmark.editorTitle || landmark.title}', in VERTICAL 3:4 portrait format. The building must remain RECOGNIZABLE and UPRIGHT while allowing maximum artistic freedom. `;
      
      if (selectedCategory.id === 'photorealistic' && photorealisticPrompts[selectedStyle.value]) {
        const photoData = photorealisticPrompts[selectedStyle.value];
        textPrompt += `\nApply the photorealistic visual treatment described: ${photoData.prompt} IMPORTANT: While maintaining photorealistic quality, embrace creative camera angles and compositional techniques used in architectural photography - dramatic perspectives, interesting framing, and dynamic viewpoints are encouraged. CRITICAL: Ensure realistic and authentic depiction (사실적인 묘사) - all visual elements must appear natural, physically accurate, and true to real-world conditions.`;
        
        // 실사풍 스타일별 구도 가이드
        if (selectedStyle.value === 'spring-cherry-blossoms') {
          textPrompt += ` COMPOSITION GUIDE: Use cherry blossom framing techniques, petal-filled foreground perspectives, and soft spring light angles.`;
        } else if (selectedStyle.value === 'autumn-leaves') {
          textPrompt += ` COMPOSITION GUIDE: Apply autumn foliage canopy views, golden hour side-lighting, and leaf-scattered ground perspectives.`;
        } else if (selectedStyle.value === 'night-lights') {
          textPrompt += ` COMPOSITION GUIDE: Use night cityscape elevations, light trail compositions, and reflective surface perspectives.`;
        } else if (selectedStyle.value === 'sunrise-hope') {
          textPrompt += ` COMPOSITION GUIDE: Apply dawn silhouette compositions, sun ray perspectives, and hopeful upward angles.`;
        } else if (selectedStyle.value === 'sunset-emotional') {
          textPrompt += ` COMPOSITION GUIDE: Use golden hour backlighting, emotional silhouette framing, and warm color gradient perspectives.`;
        } else if (selectedStyle.value === 'fog-mystery') {
          textPrompt += ` COMPOSITION GUIDE: Apply mysterious depth layering, partial visibility compositions, and atmospheric fade perspectives.`;
        }
      } else if (selectedCategory.id === 'artist' && artistPrompts[selectedStyle.value]) {
        // 예술가 스타일의 경우 단일 예술 운동 기반 프롬프트 사용
        const artistData = artistPrompts[selectedStyle.value];
        
        // 추가 창의성 변수 - 매 생성마다 다른 예술적 접근
        const creativeModifiers = [
          "The building is melting like a Salvador Dali clock. ",
          "The architecture explodes into a thousand fragments. ",
          "Reality is breaking - multiple dimensions overlap. ",
          "The building exists in a dream state - logic doesn't apply. ",
          "Time is visible - past, present, future merge in one image. ",
          "The building is alive and breathing. ",
          "Gravity has reversed - everything floats. ",
          "The structure exists only as pure emotion and color. "
        ];
        const randomModifier = creativeModifiers[Math.floor(Math.random() * creativeModifiers.length)];
        
        // 예술가의 고유한 시각적 언어로 자유로운 재해석
        const artistPrompt = typeof artistData.prompt === 'function' ? artistData.prompt() : artistData.prompt;
        textPrompt += `\n${randomModifier}Transform the landmark through the artist's unique vision. Apply: ${artistPrompt} ARTISTIC INTERPRETATION: While the landmark must remain recognizable, apply bold artistic transformations - distortion, stylization, emotional coloring, and compositional freedom. The artist's style should dramatically alter the viewing experience while preserving the building's identity. CRITICAL FOR VAN GOGH: DO NOT maintain the original photograph's composition. Create a completely NEW and DYNAMIC viewing angle that best expresses Van Gogh's emotional intensity.`;
        
        // 스타일별 동적 구도 가이드
        if (selectedStyle.value === 'van-gogh') {
          const vanGoghCompositions = [
            `EXTREME ANGLE: WORM'S EYE VIEW - Looking straight up from the base, the building towers into a swirling vortex sky. The structure appears to spiral into infinity. We see the underside of every architectural element.`,
            `EXTREME ANGLE: DIAGONAL DUTCH TILT - The entire frame is rotated 45 degrees. The building leans dramatically while maintaining upright orientation. Creates dynamic tension and emotional instability.`,
            `EXTREME ANGLE: THROUGH THE WHEAT - View the building from ground level through tall grass or wheat in extreme foreground. The vegetation takes up 70% of the frame, building emerges like a distant dream.`,
            `EXTREME ANGLE: FISH-EYE DISTORTION - The building curves in a 180-degree view. Edges bend dramatically inward. The center bulges forward. Reality warps but maintains orientation.`,
            `EXTREME ANGLE: SPLIT-SCREEN DUALITY - The building is shown from two angles simultaneously in one frame. Left side shows close-up detail, right side shows distant full view. Two realities coexist.`,
            `EXTREME ANGLE: REFLECTION FOCUS - The building is small in the background. A puddle or window in extreme foreground shows a distorted reflection that dominates the frame. The reflection is more real than reality.`,
            `EXTREME ANGLE: CORNER EMPHASIS - Extreme close-up on one corner of the building. This single corner fills the entire frame. We see texture, detail, emotional weight in one architectural joint.`,
            `EXTREME ANGLE: ATMOSPHERIC LAYERS - Multiple transparent layers of the building at different distances. Near, middle, far all overlap in one frame. Creates depth through emotional atmosphere.`,
            `EXTREME ANGLE: MOTION BLUR SWEEP - The building appears to be photographed while the viewer is in motion. Horizontal streaks of paint create speed. The structure remains sharp in the center while edges blur into emotion.`,
            `EXTREME ANGLE: FRAGMENTED VISION - The building is seen through a shattered window or broken fence. The foreground obstruction creates a fragmented, prison-like view. We see the building in pieces.`
          ];
          textPrompt += ` ${vanGoghCompositions[Math.floor(Math.random() * vanGoghCompositions.length)]}`;
          
          // 랜드마크별 반 고흐 특화 구도
          if (landmark.id === 'seoul-ring') {
            textPrompt += ` LANDMARK-SPECIFIC: The ring structure becomes a cosmic portal. Swirling brushstrokes spiral through the center void. The ring rotates with Van Gogh's characteristic circular energy patterns.`;
          } else if (landmark.id === 'nodeul-arts-island') {
            textPrompt += ` LANDMARK-SPECIFIC: The island floats on waves of thick paint. Water becomes dynamic movement. The building reflects in impressionistic ripples that dominate the composition.`;
          } else if (landmark.id === 'yongsan-business-district') {
            textPrompt += ` LANDMARK-SPECIFIC: Multiple towers spiral upward like cypress trees. Each building is a beacon reaching toward an energetic sky. Urban density becomes organic growth.`;
          } else if (landmark.id === 'dongdaemun-design-plaza') {
            textPrompt += ` LANDMARK-SPECIFIC: The curved structure flows like liquid metal. Van Gogh's swirls follow the building's organic form. Architecture and brushstrokes become one flowing entity.`;
          } else if (landmark.id === 'namsan-tower') {
            textPrompt += ` LANDMARK-SPECIFIC: The tower rises through swirling clouds like a spire through silk. Vertical brushstrokes emphasize its height. The city below becomes a sea of paint.`;
          } else if (landmark.id === 'bukchon-hanok') {
            textPrompt += ` LANDMARK-SPECIFIC: Traditional rooflines dance like waves. Each tile is a brushstroke. The village becomes a rhythmic pattern of repeating emotional gestures.`;
          }
        } else if (selectedStyle.value === 'picasso') {
          // 피카소는 이미 랜덤화되어 있으므로 추가 극단적 화각 변형 적용
          const picassoCompositions = [
            `EXTREME ANGLE: View from INSIDE a shattered window - glass fragments frame the building in prismatic distortion. We see through the break.`,
            `EXTREME ANGLE: VERTICAL SLICE VIEW - the building is cut in half lengthwise, showing impossible interior/exterior fusion. Like looking at a dissected body.`,
            `EXTREME ANGLE: SPIRAL PERSPECTIVE - the building twists around itself like a DNA helix. Top becomes bottom, inside becomes outside.`,
            `EXTREME ANGLE: MICROSCOPIC ZOOM - dive into a single brick that contains the entire building in miniature. Infinite recursive zoom.`,
            `EXTREME ANGLE: X-RAY VISION - see through all walls simultaneously. Every room, every floor visible at once in transparent layers.`,
            `EXTREME ANGLE: KALEIDOSCOPE EYE - the building reflected in a shattered mirror, creating infinite fractured repetitions.`,
            `EXTREME ANGLE: DYNAMIC TENSION - view the building as if energy radiates from its core. Walls stretch dynamically, floors show movement and life.`,
            `EXTREME ANGLE: TIME-LAPSE TRANSFORMATION - see the building's construction and evolution happening simultaneously in one frozen moment.`
          ];
          textPrompt += ` ${picassoCompositions[Math.floor(Math.random() * picassoCompositions.length)]}`;
        } else if (selectedStyle.value === 'monet') {
          const monetCompositions = [
            `RADICAL COMPOSITION: The building nearly disappears in morning mist. Only hints of form emerge from pure color and light.`,
            `RADICAL COMPOSITION: Extreme backlighting - the building becomes a dark silhouette drowning in explosive sunset colors.`,
            `RADICAL COMPOSITION: Reflected in water - the building exists only as rippling impressions. Reality dissolves into liquid light.`,
            `RADICAL COMPOSITION: Through heavy rain - architecture breaks into thousands of colored dots. Form surrenders to atmosphere.`,
            `RADICAL COMPOSITION: Multiple overlapping moments - the same building at different times bleeding into one image.`
          ];
          textPrompt += ` ${monetCompositions[Math.floor(Math.random() * monetCompositions.length)]}`;
        } else if (selectedStyle.value === 'chagall') {
          const chagallCompositions = [
            `RADICAL COMPOSITION: The building floats upside-down while people walk on clouds. Gravity is optional. Logic is banned.`,
            `RADICAL COMPOSITION: The building transforms into a giant musical instrument. Windows become notes, doors become melodies.`,
            `RADICAL COMPOSITION: Split the building in half - one side in day, one in night. Time itself is broken.`,
            `RADICAL COMPOSITION: The building grows wings and flies among constellation animals. Architecture becomes mythology.`,
            `RADICAL COMPOSITION: Miniaturize the building inside a flower held by floating lovers. Scale has no meaning.`
          ];
          textPrompt += ` ${chagallCompositions[Math.floor(Math.random() * chagallCompositions.length)]}`;
        } else if (selectedStyle.value === 'schiele') {
          const schieleCompositions = [
            `RADICAL COMPOSITION: Extreme angular expression - the building twists with psychological intensity. Walls express through sharp angles.`,
            `RADICAL COMPOSITION: Crop 90% of the building. Show only an expressive corner that contains all emotional weight.`,
            `RADICAL COMPOSITION: The building shows dramatic diagonal composition, expressing internal tension through sharp angular forms.`,
            `RADICAL COMPOSITION: X-ray view - see through walls to reveal the building's emotional skeleton. Structure as raw nerve.`,
            `RADICAL COMPOSITION: Fragment the building into sharp shards. Each piece cuts the viewer's eye.`
          ];
          textPrompt += ` ${schieleCompositions[Math.floor(Math.random() * schieleCompositions.length)]}`;
        } else if (selectedStyle.value === 'warhol') {
          const warholCompositions = [
            `RADICAL COMPOSITION: Repeat the building 16 times in a grid, each in different neon colors. Mass production aesthetic.`,
            `RADICAL COMPOSITION: Extreme color inversion - make the building fluorescent pink and green. Reality is synthetic.`,
            `RADICAL COMPOSITION: Crop to just the building's logo/sign, enlarged 1000%. Architecture as brand.`,
            `RADICAL COMPOSITION: Silkscreen error aesthetic - misaligned color layers create ghosting effects.`,
            `RADICAL COMPOSITION: The building as product packaging. Architecture becomes consumer goods.`
          ];
          textPrompt += ` ${warholCompositions[Math.floor(Math.random() * warholCompositions.length)]}`;
        } else if (selectedStyle.value === 'kusama') {
          const kusamaCompositions = [
            `RADICAL COMPOSITION: The building EXPLODES into infinite dots expanding to cosmos. Architecture becomes universe.`,
            `RADICAL COMPOSITION: Mirror recursion - the building reflects into infinite copies receding to vanishing point.`,
            `RADICAL COMPOSITION: Dots consume everything - the building fights to exist against obliteration.`,
            `RADICAL COMPOSITION: The building becomes a single giant dot containing smaller dots containing buildings.`,
            `RADICAL COMPOSITION: Hallucination view - multiple overlapping buildings phase in and out of existence.`
          ];
          textPrompt += ` ${kusamaCompositions[Math.floor(Math.random() * kusamaCompositions.length)]}`;
        } else if (selectedStyle.value === 'korean-landscape') {
          const koreanLandscapeCompositions = [
            `SERENE COMPOSITION: The building occupies only 10% of the image, appearing as a distant element. 90% is mist, empty sky, and void. The architecture barely whispers its presence.`,
            `SERENE COMPOSITION: Three-distance perspective - the building small in middle distance, mountains fade to nothing, foreground is empty space. Vast breathing room dominates.`,
            `SERENE COMPOSITION: The building suggested through three minimal brushstrokes. Everything else is gradations of empty mist and silent space.`,
            `SERENE COMPOSITION: Only the building’s roofline visible above clouds. The rest dissolves into infinite white emptiness. Form emerges from void.`,
            `SERENE COMPOSITION: Asymmetrical placement - building tucked in lower corner, massive empty sky above. The void has more presence than the structure.`
          ];
          textPrompt += ` ${koreanLandscapeCompositions[Math.floor(Math.random() * koreanLandscapeCompositions.length)]}`;
        } else if (selectedStyle.value === 'korean-screen') {
          const koreanScreenCompositions = [
            `SERENE MULTI-PANEL COMPOSITION: The building gracefully spans across 6-8 panels, with each panel containing only essential elements - most space remains empty. The architectural details appear with ultra-precision in select areas while vast negative spaces create breathing room between panels.`,
            `SERENE MULTI-PANEL COMPOSITION: Asymmetrical placement across multiple panels - the building occupies the lower third of some panels while others remain nearly empty, creating a dynamic rhythm of presence and absence across the folding screen.`,
            `SERENE MULTI-PANEL COMPOSITION: The building's different architectural elements distributed sparsely across panels - a roofline here, a column there - with generous empty spaces between, allowing each element to be contemplated individually.`,
            `SERENE MULTI-PANEL COMPOSITION: Central panels feature the main structure in hyper-detail, while outer panels fade to near emptiness with only subtle hints of the building's edges, creating a gentle emergence from and return to void.`,
            `SERENE MULTI-PANEL COMPOSITION: Each panel shows a different time of day with the building rendered in increasingly subtle tones - from soft morning light to barely visible evening silhouettes, emphasizing the beauty of restraint and emptiness.`
          ];
          textPrompt += ` ${koreanScreenCompositions[Math.floor(Math.random() * koreanScreenCompositions.length)]}`;
        } else if (selectedStyle.value === 'korean-genre') {
          const koreanGenreCompositions = [
            `GENTLE COMPOSITION: Tiny figures in vast empty courtyard. The building is backdrop, human activity is subtle dots. 80% empty space creates tranquility.`,
            `GENTLE COMPOSITION: Single figure contemplating the building from afar. Massive negative space between viewer and architecture. Solitude emphasized through emptiness.`,
            `GENTLE COMPOSITION: Daily activities suggested through minimal gestures. Figures occupy corners, center is vast emptiness. Space breathes between every element.`,
            `GENTLE COMPOSITION: The building fades into soft background. Few delicate human figures in foreground. Middle ground is pure empty space.`,
            `GENTLE COMPOSITION: Activities happen at edges of frame. Center is peaceful void. Architecture and humans frame the emptiness, not fill it.`
          ];
          textPrompt += ` ${koreanGenreCompositions[Math.floor(Math.random() * koreanGenreCompositions.length)]}`;
        } else if (selectedStyle.value === 'lee-jung-seob') {
          const leeJungSeopCompositions = [
            `RADICAL COMPOSITION: The building writhes in pain - walls crack with emotional wounds. Architecture bleeds.`,
            `RADICAL COMPOSITION: Savage scratches tear through the building. Each line is a scream.`,
            `RADICAL COMPOSITION: The building transforms into a wounded bull. Architecture becomes animal rage.`,
            `RADICAL COMPOSITION: Children's drawings overlay adult architecture - innocence battles structure.`,
            `RADICAL COMPOSITION: The building explodes from internal pressure. Emotion destroys form.`
          ];
          textPrompt += ` ${leeJungSeopCompositions[Math.floor(Math.random() * leeJungSeopCompositions.length)]}`;
        }
      } else if (selectedCategory.id === 'animation' && animationPrompts[selectedStyle.value]) {
        const animationData = animationPrompts[selectedStyle.value];
        textPrompt += `\nApply the animation visual treatment described: ${animationData.prompt} IMPORTANT: While maintaining the landmark's recognizable features, embrace the animation style's characteristic perspectives and dynamic compositions to create an engaging scene.`;
        
        // 애니메이션 스타일별 구도 가이드
        if (selectedStyle.value === 'ghibli') {
          textPrompt += ` COMPOSITION GUIDE: Use Ghibli's signature wide establishing shots with detailed foreground elements, low-angle hero perspectives, and dramatic sky compositions.`;
        } else if (selectedStyle.value === 'pixar') {
          textPrompt += ` COMPOSITION GUIDE: Apply Pixar's dynamic camera angles, cinematic depth of field, and emotionally expressive viewpoints.`;
        } else if (selectedStyle.value === 'disney') {
          textPrompt += ` COMPOSITION GUIDE: Use Disney's magical castle framing, fairy-tale perspectives, and romantic golden hour lighting angles.`;
        } else if (selectedStyle.value === 'dreamworks') {
          textPrompt += ` COMPOSITION GUIDE: Apply DreamWorks' adventurous action angles, dynamic motion perspectives, and epic landscape framing.`;
        } else if (selectedStyle.value === 'japanese-anime') {
          textPrompt += ` COMPOSITION GUIDE: Use anime's dramatic low angles, speed lines perspective, and atmospheric depth with detailed backgrounds.`;
        } else if (selectedStyle.value === 'webtoon') {
          textPrompt += ` COMPOSITION GUIDE: Apply vertical scrolling composition, cinematic panel transitions, and dramatic close-up to wide-shot contrasts.`;
        } else if (selectedStyle.value === 'simpsons') {
          textPrompt += ` COMPOSITION GUIDE: Use Springfield's flat staging, three-quarter view angles, and sitcom-style establishing shots.`;
        } else if (selectedStyle.value === 'pokemon') {
          textPrompt += ` COMPOSITION GUIDE: Apply battle arena perspectives, trainer's eye view, and dynamic action compositions.`;
        } else if (selectedStyle.value === 'makoto-shinkai') {
          textPrompt += ` COMPOSITION GUIDE: Use Shinkai's signature train crossing angles, dramatic sky reflections, and emotionally distant perspectives.`;
        } else if (selectedStyle.value === 'kpop-demon-hunters') {
          textPrompt += ` COMPOSITION GUIDE: Apply Netflix animation cinematic framing, webtoon-style dramatic angles, supernatural battle choreography with idol poses, glowing magical effects around the landmark, and dynamic action camera movements typical of K-pop performance videos mixed with anime fight scenes.`;
        } else if (selectedStyle.value === 'vintage-poster') {
          textPrompt += ` COMPOSITION GUIDE: Use Art Deco vertical compositions, symmetrical arrangements, and bold geometric framing without radial patterns.`;
        }
      } else if (selectedCategory.id === 'illust' && illustrationPrompts[selectedStyle.value]) {
        const illustData = illustrationPrompts[selectedStyle.value];
        textPrompt += `\nApply the illustration visual treatment described: ${illustData.prompt} IMPORTANT: While keeping the landmark identifiable, feel free to use creative artistic interpretation and compositional freedom characteristic of the chosen illustration style.`;
        
        // 일러스트 스타일별 구도 가이드
        if (selectedStyle.value === 'pixel-art') {
          textPrompt += ` COMPOSITION GUIDE: Use isometric or platform game perspective, 45-degree angles, and clear pixel grid alignment.`;
        } else if (selectedStyle.value === 'isometric') {
          textPrompt += ` COMPOSITION GUIDE: Maintain precise 30-degree isometric angle, use elevated viewpoint, and create depth through layered elements.`;
        } else if (selectedStyle.value === 'tilt-shift') {
          textPrompt += ` COMPOSITION GUIDE: Apply miniature effect with selective focus, elevated viewpoint looking down, and strong depth of field blur.`;
        } else if (selectedStyle.value === 'watercolor') {
          textPrompt += ` COMPOSITION GUIDE: Use soft atmospheric perspectives, bleeding color transitions, and impressionistic light compositions.`;
        } else if (selectedStyle.value === 'pencil') {
          textPrompt += ` COMPOSITION GUIDE: Apply architectural sketch perspectives, construction line dynamics, and dramatic shadow compositions.`;
        } else if (selectedStyle.value === 'crayon-colored-pencil') {
          textPrompt += ` COMPOSITION GUIDE: Use childlike whimsical perspectives, layered texture building, and vibrant color blocking compositions.`;
        } else if (selectedStyle.value === 'neon-art') {
          textPrompt += ` COMPOSITION GUIDE: Apply neon sign framing, reflective surface perspectives, and electric glow compositions against dark backgrounds.`;
        } else if (selectedStyle.value === 'lego') {
          textPrompt += ` COMPOSITION GUIDE: Apply authentic LEGO set photography angles - 3/4 view display perspective like official LEGO box art, slightly elevated viewpoint to show brick studs clearly, clean white background studio setup, depth of field blur for miniature toy effect. Show the building as if it's sitting on LEGO baseplates with visible brick connections and modular sections. Use dramatic product photography lighting to emphasize the plastic toy texture and individual brick details.`;
        } else if (selectedStyle.value === 'figure') {
          textPrompt += ` COMPOSITION GUIDE: Use architectural model photography angles - elevated 3/4 view showing the landmark as a premium miniature figure. Display on a clean base or pedestal like a museum piece. Professional product lighting with multiple light sources to highlight architectural details. Show scale reference subtly. The landmark itself IS the figure, not stylized but accurately miniaturized.`;
        }
      } else if (selectedCategory.id === 'futureCity' && futureCityPrompts[selectedStyle.value]) {
        const futureCityData = futureCityPrompts[selectedStyle.value];
        textPrompt += `\nApply the future city visual treatment described: ${futureCityData.prompt} IMPORTANT: While maintaining the landmark's recognizable identity, integrate it creatively into the futuristic scene with dynamic angles and compelling compositions. Ensure realistic and plausible depiction (사실적인 묘사) of all futuristic elements - they should look technically feasible and grounded in reality. Ultra high resolution 8K quality.`;
        
        // 미래도시 스타일별 구도 가이드
        if (selectedStyle.value === 'cyberpunk') {
          textPrompt += ` COMPOSITION GUIDE: Use extreme vertical compositions looking up from street level, neon-lit bottom-up views, and Blade Runner-style towering perspectives.`;
        } else if (selectedStyle.value === 'urban-uam-adventure') {
          textPrompt += ` COMPOSITION GUIDE: Apply dynamic aerial perspectives, banking angles, and first-person cockpit views with motion blur.`;
        } else if (selectedStyle.value === 'robots-drones') {
          textPrompt += ` COMPOSITION GUIDE: Use street-level perspectives with robots in foreground, drone traffic layers in sky, and human-robot interaction focus.`;
        } else if (selectedStyle.value === 'flying-cars') {
          textPrompt += ` COMPOSITION GUIDE: Apply multi-layered traffic perspectives, aerial highway viewpoints, and dynamic vehicle movement angles.`;
        } else if (selectedStyle.value === 'hologram-city') {
          textPrompt += ` COMPOSITION GUIDE: Use translucent hologram overlays, night cityscape with light projections, and layered reality perspectives.`;
        } else if (selectedStyle.value === 'green-streets') {
          textPrompt += ` COMPOSITION GUIDE: Apply nature-integrated architecture views, vertical garden perspectives, and eco-friendly urban canopy angles.`;
        } else if (selectedStyle.value === 'robots-daily') {
          textPrompt += ` COMPOSITION GUIDE: Use intimate human-robot interaction angles, warm daily life perspectives, and coexistence-focused compositions.`;
        }
      } else {
        textPrompt += `\nApply the artistic style of ${selectedStyle.value}. IMPORTANT: While maintaining the landmark's recognizable identity, feel free to use creative compositional choices and artistic interpretation to create a visually compelling image.`;
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

      // FINAL MANDATORY REQUIREMENTS 추가
      textPrompt += `\n\nFINAL REQUIREMENTS:
1. [CRITICAL] QUALITY: Ultra high quality 8K resolution masterpiece with hyper-detailed rendering (minimum 2048x2732 pixels)
2. [CRITICAL] FORMAT: VERTICAL 3:4 aspect ratio (portrait orientation) - MUST be upright, never inverted or rotated
3. [CRITICAL] ORIENTATION: The building and all elements MUST be properly oriented - no upside-down, flipped, or 180-degree rotated images
4. [CRITICAL] LANDMARK RECOGNITION: The building MUST remain recognizable as '${landmark.editorTitle || landmark.title}'
5. [HIGH] ARTISTIC FREEDOM: Apply dramatic artistic interpretation while keeping the landmark identifiable and ABSOLUTELY UPRIGHT
6. [ENCOURAGED] CREATIVE COMPOSITION: Use dynamic angles and artistic styles while maintaining CORRECT GRAVITATIONAL ORIENTATION

BALANCE: The landmark's identity must be preserved, but artistic style should powerfully transform the viewing experience.
CREATIVITY WITHIN BOUNDS: Be bold and innovative while ensuring viewers can still identify the landmark.

FINAL CRITICAL REMINDERS:
- ORIENTATION: No upside-down, inverted, flipped, or rotated images - EVER
- TEXT PROHIBITION: Zero tolerance for any text, letters, numbers, signs, or written elements
- NO radial sunburst patterns, rising sun imagery, or light rays emanating from center
- Buildings MUST stand upright on their foundations with sky above and ground below`;
      
      // 최종 프롬프트 확인용 로그
      // Final prompt ready for generation
      
      let geminiPayload = { 
        contents: [{ 
          parts:[
            { text: textPrompt },
            imagePart
          ]
        }],
        generationConfig: { 
          "responseModalities": ["TEXT", "IMAGE"]
        }
      };

      const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;
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
        
        // 이미지 생성 후 1.5초 후에 재생성 메시지 표시 및 번역 트리거
        setShowRegenerateMessage(false);
        setTimeout(() => {
          setShowRegenerateMessage(true);
          // 번역 다시 트리거
          if (setTriggerTranslation) {
            setTriggerTranslation(prev => prev + 1);
          }
        }, 1500);
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
                      <>
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
                      </>
                    ) : (
                        <div className="text-center">
                          <p className="text-gray-500 text-lg">이미지를 불러올 수 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <div className="flex flex-col h-full pt-8">
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="mt-[5vh]"></div>
            <div className="space-y-6">
              {/* 1단계: 카테고리 선택 (탭) */}
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 translate">1단계: 스타일 카테고리 선택</h3>
                <p className="text-xl text-blue-600 dark:text-blue-400 mb-4 translate">내가 그리고 싶은 서울의 모습을 선택해주세요.</p>
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
                      <span className="translate">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2단계: 스타일 선택 (버튼) */}
              {selectedCategory && (
                <div className="mt-16">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    <span className="translate">2단계: 세부 스타일 선택</span>
                  </h3>
                  <p className="text-xl text-blue-600 dark:text-blue-400 mb-4 translate">{selectedCategory.description}</p>
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
                        <span className="font-medium text-gray-900 dark:text-white text-lg translate">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="h-4"></div>
          </div>

          {/* AI 생성 후 재생성 안내 메시지 */}
          {!isBaseImage && showRegenerateMessage && (
            <div className="flex justify-start px-4 mb-4">
              <div className="group relative inline-flex items-center gap-3 px-6 py-3 
                        bg-gradient-to-r from-blue-600 to-purple-600 
                        text-white font-medium rounded-full 
                        shadow-lg shadow-blue-500/25 
                        transition-all duration-300 
                        animate-fadeInUp animate-customPulse">
                {/* 글로우 효과 */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-75 blur-md animate-glow"></div>
                
                {/* 콘텐츠 */}
                <div className="relative flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 animate-slowSpin" />
                  <span className="text-base translate">결과가 마음에 들지 않으시면 생성하기를 다시 눌러주세요</span>
                </div>
              </div>
            </div>
          )}

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
                <span className="text-2xl translate">{isLoading ? '생성 중...' : '나만의 서울 미래상 생성하기'}</span>
              </button>
              
              {/* 처음으로 버튼 - 더 작게, 오른쪽 배치 */}
              <button 
                onClick={onBack}
                className="flex-1 bg-white dark:bg-gray-800 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl hover:bg-blue-50 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-2xl translate">처음으로</span>
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
      
    </div>
  );
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
