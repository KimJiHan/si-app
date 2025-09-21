// Gemini API 프롬프트 빌더 유틸리티
// 프롬프트 생성 로직을 모듈화하여 코드 중복 제거 및 유지보수성 향상

// 기본 프롬프트 템플릿
const BASE_PROMPT = {
  format: `MANDATORY FORMAT: Generate a VERTICAL image with 3:4 aspect ratio (portrait orientation, taller than wide).`,

  orientation: `CRITICAL ORIENTATION RULES:
- The image must be ABSOLUTELY UPRIGHT and properly oriented
- NEVER inverted, flipped, rotated, or upside down
- Buildings must stand on their foundations, not on their roofs
- Sky must be above, ground must be below
- Maintain correct gravitational orientation at all times`,

  noText: `NO TEXT WHATSOEVER:
- Absolutely NO text, words, letters, numbers, or characters
- NO signs, labels, captions, or watermarks
- NO typography or written language in any script
- Pure visual art only - no textual elements of any kind`,

  quality: `QUALITY REQUIREMENTS: Create an ultra high quality, professional masterpiece image. Resolution: 8K quality (minimum 2048x2732 pixels). Detail level: Hyper-detailed with sharp focus and crystal clear rendering. Professional studio-quality output.`,

  finalRequirements: `FINAL REQUIREMENTS:
1. [CRITICAL] QUALITY: Ultra high quality 8K resolution masterpiece with hyper-detailed rendering (minimum 2048x2732 pixels)
2. [CRITICAL] FORMAT: VERTICAL 3:4 aspect ratio (portrait orientation) - MUST be upright, never inverted or rotated
3. [CRITICAL] ORIENTATION: The building and all elements MUST be properly oriented - no upside-down, flipped, or 180-degree rotated images
4. [CRITICAL] LANDMARK RECOGNITION: The building MUST remain recognizable as '{landmarkName}'
5. [HIGH] ARTISTIC FREEDOM: Apply dramatic artistic interpretation while keeping the landmark identifiable and ABSOLUTELY UPRIGHT
6. [ENCOURAGED] CREATIVE COMPOSITION: Use dynamic angles and artistic styles while maintaining CORRECT GRAVITATIONAL ORIENTATION

BALANCE: The landmark's identity must be preserved, but artistic style should powerfully transform the viewing experience.
CREATIVITY WITHIN BOUNDS: Be bold and innovative while ensuring viewers can still identify the landmark.

FINAL CRITICAL REMINDERS:
- ORIENTATION: No upside-down, inverted, flipped, or rotated images - EVER
- TEXT PROHIBITION: Zero tolerance for any text, letters, numbers, signs, or written elements
- NO radial sunburst patterns, rising sun imagery, or light rays emanating from center
- Buildings MUST stand upright on their foundations with sky above and ground below`
};

// 구도 가이드 템플릿
const COMPOSITION_GUIDES = {
  photorealistic: {
    'spring-cherry-blossoms': 'COMPOSITION GUIDE: Use cherry blossom framing techniques, petal-filled foreground perspectives, and soft spring light angles.',
    'autumn-leaves': 'COMPOSITION GUIDE: Apply autumn foliage canopy views, golden hour side-lighting, and leaf-scattered ground perspectives.',
    'night-lights': 'COMPOSITION GUIDE: Use night cityscape elevations, light trail compositions, and reflective surface perspectives.',
    'sunrise-hope': 'COMPOSITION GUIDE: Apply dawn silhouette compositions, sun ray perspectives, and hopeful upward angles.',
    'sunset-emotional': 'COMPOSITION GUIDE: Use golden hour backlighting, emotional silhouette framing, and warm color gradient perspectives.',
    'fog-mystery': 'COMPOSITION GUIDE: Apply mysterious depth layering, partial visibility compositions, and atmospheric fade perspectives.'
  },

  animation: {
    'ghibli': 'COMPOSITION GUIDE: Use Ghibli\'s signature wide establishing shots with detailed foreground elements, low-angle hero perspectives, and dramatic sky compositions.',
    'pixar': 'COMPOSITION GUIDE: Apply Pixar\'s dynamic camera angles, cinematic depth of field, and emotionally expressive viewpoints.',
    'disney': 'COMPOSITION GUIDE: Use Disney\'s magical castle framing, fairy-tale perspectives, and romantic golden hour lighting angles.',
    'dreamworks': 'COMPOSITION GUIDE: Apply DreamWorks\' adventurous action angles, dynamic motion perspectives, and epic landscape framing.',
    'japanese-anime': 'COMPOSITION GUIDE: Use anime\'s dramatic low angles, speed lines perspective, and atmospheric depth with detailed backgrounds.',
    'webtoon': 'COMPOSITION GUIDE: Apply vertical scrolling composition, cinematic panel transitions, and dramatic close-up to wide-shot contrasts.',
    'simpsons': 'COMPOSITION GUIDE: Use Springfield\'s flat staging, three-quarter view angles, and sitcom-style establishing shots.',
    'pokemon': 'COMPOSITION GUIDE: Apply battle arena perspectives, trainer\'s eye view, and dynamic action compositions.',
    'makoto-shinkai': 'COMPOSITION GUIDE: Use Shinkai\'s signature train crossing angles, dramatic sky reflections, and emotionally distant perspectives.',
    'kpop-demon-hunters': 'COMPOSITION GUIDE: Apply Netflix animation cinematic framing, webtoon-style dramatic angles, supernatural battle choreography with idol poses, glowing magical effects around the landmark, and dynamic action camera movements typical of K-pop performance videos mixed with anime fight scenes.',
    'vintage-poster': 'COMPOSITION GUIDE: Use Art Deco vertical compositions, symmetrical arrangements, and bold geometric framing without radial patterns.'
  },

  illust: {
    'pixel-art': 'COMPOSITION GUIDE: Use isometric or platform game perspective, 45-degree angles, and clear pixel grid alignment.',
    'isometric': 'COMPOSITION GUIDE: Maintain precise 30-degree isometric angle, use elevated viewpoint, and create depth through layered elements.',
    'tilt-shift': 'COMPOSITION GUIDE: Apply miniature effect with selective focus, elevated viewpoint looking down, and strong depth of field blur.',
    'watercolor': 'COMPOSITION GUIDE: CRITICAL WATERCOLOR TECHNIQUES: Apply extreme wet-on-wet painting with visible water blooms and cauliflower effects. Create dramatic color bleeds where pigments flow into each other uncontrollably. Use atmospheric perspective with foreground elements darker and more saturated, background elements lighter and more washed out. Leave strategic areas of white paper untouched for highlights. Show visible brush strokes and water marks. Apply granulation effects where pigments separate on textured paper. Create soft, undefined edges - NO HARD LINES. Use unpredictable color mixing and happy accidents. The entire image should look spontaneously painted with very wet brushes.',
    'pencil': 'COMPOSITION GUIDE: Apply architectural sketch perspectives, construction line dynamics, and dramatic shadow compositions.',
    'crayon-colored-pencil': 'COMPOSITION GUIDE: Use childlike whimsical perspectives, layered texture building, and vibrant color blocking compositions.',
    'neon-art': 'COMPOSITION GUIDE: Apply neon sign framing, reflective surface perspectives, and electric glow compositions against dark backgrounds.',
    'lego': 'COMPOSITION GUIDE: Apply authentic LEGO set photography angles - 3/4 view display perspective like official LEGO box art, slightly elevated viewpoint to show brick studs clearly, clean white background studio setup, depth of field blur for miniature toy effect. Show the building as if it\'s sitting on LEGO baseplates with visible brick connections and modular sections. Use dramatic product photography lighting to emphasize the plastic toy texture and individual brick details.',
    'figure': 'COMPOSITION GUIDE: Use architectural model photography angles - elevated 3/4 view showing the landmark as a premium miniature figure. Display on a clean base or pedestal like a museum piece. Professional product lighting with multiple light sources to highlight architectural details. Show scale reference subtly. The landmark itself IS the figure, not stylized but accurately miniaturized.'
  },

  futureCity: {
    'cyberpunk': 'COMPOSITION GUIDE: Use extreme vertical compositions looking up from street level, neon-lit bottom-up views, and Blade Runner-style towering perspectives.',
    'urban-uam-adventure': 'COMPOSITION GUIDE: Apply dynamic aerial perspectives, banking angles, and first-person cockpit views with motion blur.',
    'robots-drones': 'COMPOSITION GUIDE: Use street-level perspectives with robots in foreground, drone traffic layers in sky, and human-robot interaction focus.',
    'flying-cars': 'COMPOSITION GUIDE: Apply multi-layered traffic perspectives, aerial highway viewpoints, and dynamic vehicle movement angles.',
    'hologram-city': 'COMPOSITION GUIDE: Use translucent hologram overlays, night cityscape with light projections, and layered reality perspectives.',
    'green-streets': 'COMPOSITION GUIDE: Apply nature-integrated architecture views, vertical garden perspectives, and eco-friendly urban canopy angles.',
    'robots-daily': 'COMPOSITION GUIDE: Use intimate human-robot interaction angles, warm daily life perspectives, and coexistence-focused compositions.'
  }
};

// 랜드마크별 특수 조건
const LANDMARK_CONDITIONS = {
  'seoul-ring': {
    base: 'Ensure the spokeless, vertically-oriented ring structure is clearly depicted.',
    futureCity: 'The background of this scene MUST be a park (공원). The Seoul Ring structure must be positioned with the park clearly visible as the background. The park setting should include green spaces, trees, and pathways. The park should be a prominent feature in the composition.'
  },

  'nodeul-island': {
    futureCity: {
      'robots-drones': 'The background of this scene MUST be a river (강). Instead of a street scene, this must be a riverside (강변) scene where robots walk along the riverside path and drones fly over the river. Water buses (수상버스) must be visible moving on the river. The building must be positioned with the river clearly visible as the background.',
      default: 'The background of this scene MUST be a river (강). The building must be positioned with the river clearly visible as the background behind it. Water buses (수상버스) must be visible moving on the river. Include one or more water buses navigating the river as part of the scene composition. The river should be a prominent feature in the composition.'
    },
    photorealistic: 'The background of this scene MUST be a river (강). The building must be positioned with the river clearly visible as the background. Water buses (수상버스) must be visible moving on the river. Include one or more water buses navigating the river as part of the scene composition. The river should be a prominent feature in the composition.'
  },

  'namsan-tower': {
    futureCity: 'The background of this scene MUST be Namsan Mountain (남산). The tower must be positioned on the mountain with the natural mountain landscape clearly visible. The mountain setting should include forest areas and hiking trails. The mountain should be a prominent feature in the composition.'
  },

  'yongsan-business-district': {
    special: {
      condition: (category, style) => category === 'photorealistic' && style === 'night-view',
      prompt: 'This is a business district scene at night. The buildings MUST have illuminated windows creating a beautiful night cityscape (건물들의 불빛/야경). Multiple office buildings should show patterns of lit windows against the dark night sky. The building lights should create a sophisticated urban night atmosphere with various lighting levels across different floors and buildings.'
    }
  }
};

// 예술가 스타일 창의성 변수
const ARTIST_CREATIVE_MODIFIERS = [
  "The building is melting like a Salvador Dali clock. ",
  "The architecture explodes into a thousand fragments. ",
  "Reality is breaking - multiple dimensions overlap. ",
  "The building exists in a dream state - logic doesn't apply. ",
  "Time is visible - past, present, future merge in one image. ",
  "The building is alive and breathing. ",
  "Gravity has reversed - everything floats. ",
  "The structure exists only as pure emotion and color. "
];

// 동적 구도 선택 함수
function getRandomComposition(compositions) {
  return compositions[Math.floor(Math.random() * compositions.length)];
}

// 프롬프트 빌더 메인 함수
export function buildGeminiPrompt(landmark, selectedCategory, selectedStyle, promptData) {
  let prompt = '';

  // 이미지 생성을 위한 간결한 프롬프트
  const landmarkName = landmark.editorTitle || landmark.title;
  prompt = `Generate an image of ${landmarkName} in VERTICAL 3:4 portrait format. `;

  // 3. 카테고리별 스타일 적용
  if (selectedCategory.id === 'photorealistic' && promptData) {
    prompt += `\nApply the photorealistic visual treatment described: ${promptData.prompt} IMPORTANT: While maintaining photorealistic quality, embrace creative camera angles and compositional techniques used in architectural photography - dramatic perspectives, interesting framing, and dynamic viewpoints are encouraged. CRITICAL: Ensure realistic and authentic depiction (사실적인 묘사) - all visual elements must appear natural, physically accurate, and true to real-world conditions.`;

    // 구도 가이드 추가
    if (COMPOSITION_GUIDES.photorealistic[selectedStyle.value]) {
      prompt += ` ${COMPOSITION_GUIDES.photorealistic[selectedStyle.value]}`;
    }
  }
  else if (selectedCategory.id === 'artist' && promptData) {
    // 창의성 변수 추가
    const randomModifier = getRandomComposition(ARTIST_CREATIVE_MODIFIERS);
    const artistPrompt = typeof promptData.prompt === 'function' ? promptData.prompt() : promptData.prompt;

    prompt += `\n${randomModifier}Transform the landmark through the artist's unique vision. Apply: ${artistPrompt} ARTISTIC INTERPRETATION: While the landmark must remain recognizable, apply bold artistic transformations - distortion, stylization, emotional coloring, and compositional freedom. The artist's style should dramatically alter the viewing experience while preserving the building's identity.`;

    // 아티스트별 동적 구도 적용 (필요시 별도 함수로 처리)
    if (selectedStyle.value === 'van-gogh') {
      prompt += ` CRITICAL FOR VAN GOGH: DO NOT maintain the original photograph's composition. Create a completely NEW and DYNAMIC viewing angle that best expresses Van Gogh's emotional intensity.`;
    }
  }
  else if (selectedCategory.id === 'animation' && promptData) {
    prompt += `\nApply the animation visual treatment described: ${promptData.prompt} IMPORTANT: While maintaining the landmark's recognizable features, embrace the animation style's characteristic perspectives and dynamic compositions to create an engaging scene.`;

    // 구도 가이드 추가
    if (COMPOSITION_GUIDES.animation[selectedStyle.value]) {
      prompt += ` ${COMPOSITION_GUIDES.animation[selectedStyle.value]}`;
    }
  }
  else if (selectedCategory.id === 'illust' && promptData) {
    // 수채화 스타일에 특별한 강조 추가
    if (selectedStyle.value === 'watercolor') {
      prompt += `\nCRITICAL: This MUST be an AUTHENTIC WATERCOLOR PAINTING with EXTREME watercolor characteristics. ${promptData.prompt}`;
      prompt += '\n\nMANDATORY WATERCOLOR EFFECTS TO APPLY:';
      prompt += '\n- WET-ON-WET TECHNIQUE: Colors must bleed and merge uncontrollably';
      prompt += '\n- WATER BLOOMS: Visible cauliflower effects and pigment pooling';
      prompt += '\n- TRANSPARENCY: Multiple transparent layers with colors showing through';
      prompt += '\n- NO HARD EDGES: Everything must be soft, fluid, and dream-like';
      prompt += '\n- PAPER TEXTURE: White paper must show through in highlights';
      prompt += '\n- WATER MARKS: Visible drips, runs, and water stains';
      prompt += '\n- ORGANIC FLOW: Unpredictable color mixing and happy accidents';
      prompt += '\nThe final image should look like it was painted with extremely wet brushes on rough watercolor paper, NOT like a digital filter.';
    } else {
      prompt += `\nApply the illustration visual treatment described: ${promptData.prompt} IMPORTANT: While keeping the landmark identifiable, feel free to use creative artistic interpretation and compositional freedom characteristic of the chosen illustration style.`;
    }

    // 구도 가이드 추가
    if (COMPOSITION_GUIDES.illust[selectedStyle.value]) {
      prompt += ` ${COMPOSITION_GUIDES.illust[selectedStyle.value]}`;
    }
  }
  else if (selectedCategory.id === 'futureCity' && promptData) {
    prompt += `\nApply the future city visual treatment described: ${promptData.prompt} IMPORTANT: While maintaining the landmark's recognizable identity, integrate it creatively into the futuristic scene with dynamic angles and compelling compositions. Ensure realistic and plausible depiction (사실적인 묘사) of all futuristic elements - they should look technically feasible and grounded in reality. Ultra high resolution 8K quality.`;

    // 구도 가이드 추가
    if (COMPOSITION_GUIDES.futureCity[selectedStyle.value]) {
      prompt += ` ${COMPOSITION_GUIDES.futureCity[selectedStyle.value]}`;
    }
  }
  else {
    prompt += `\nApply the artistic style of ${selectedStyle.value}. IMPORTANT: While maintaining the landmark's recognizable identity, feel free to use creative compositional choices and artistic interpretation to create a visually compelling image.`;
  }

  // 4. 랜드마크별 특수 조건 적용
  prompt = applyLandmarkConditions(prompt, landmark, selectedCategory, selectedStyle);

  // 5. 최종 요구사항 추가
  prompt += '\n\n' + BASE_PROMPT.finalRequirements.replace('{landmarkName}', landmark.editorTitle || landmark.title);

  return prompt;
}

// 랜드마크별 특수 조건 적용 함수
function applyLandmarkConditions(prompt, landmark, category, style) {
  const conditions = LANDMARK_CONDITIONS[landmark.id];
  if (!conditions) return prompt;

  // 기본 조건
  if (conditions.base) {
    prompt += `\n${conditions.base}`;
  }

  // 카테고리별 조건
  const futureCityStyles = ['robots-drones', 'flying-cars', 'hologram-city', 'green-streets', 'cyberpunk', 'urban-uam-adventure', 'robots-daily'];
  const photorealisticStyles = ['heavy-snow', 'full-bloom', 'thunder-lightning', 'sunset', 'strong-sunlight', 'autumn-leaves', 'lights-window', 'night-view', 'starry-sky', 'black-white', 'fireworks'];

  if (category.id === 'futureCity' && futureCityStyles.includes(style.value)) {
    if (conditions.futureCity) {
      if (typeof conditions.futureCity === 'string') {
        prompt += `\n${conditions.futureCity}`;
      } else if (conditions.futureCity[style.value]) {
        prompt += `\n${conditions.futureCity[style.value]}`;
      } else if (conditions.futureCity.default) {
        prompt += `\n${conditions.futureCity.default}`;
      }
    }
  }

  if (category.id === 'photorealistic' && photorealisticStyles.includes(style.value)) {
    if (conditions.photorealistic) {
      prompt += `\n${conditions.photorealistic}`;
    }
  }

  // 특수 조건
  if (conditions.special && conditions.special.condition(category.id, style.value)) {
    prompt += `\n${conditions.special.prompt}`;
  }

  return prompt;
}

// API 페이로드 생성 함수
export function createGeminiPayload(textPrompt, base64Image) {
  // base64 이미지에서 data URL 접두사 제거
  const imageData = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  // 이미지 생성을 위한 페이로드
  return {
    contents: [{
      parts: [
        { text: textPrompt },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageData
          }
        }
      ]
    }],
    generationConfig: {
      "temperature": 1.0,
      "topP": 0.95,
      "topK": 40,
      "maxOutputTokens": 8192
    }
  };
}

// API URL 생성 함수
export function getGeminiApiUrl() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;
}

// 에러 메시지 처리 함수
export function handleGeminiError(errorData) {
  const errorMessage = errorData?.error?.message || '';

  if (errorMessage.includes('Unable to process input image')) {
    return '이미지 처리 실패: 이미지 형식이나 크기를 확인해주세요.';
  } else if (errorMessage.includes('API key')) {
    return 'API 키가 유효하지 않습니다.';
  } else if (errorMessage.includes('overloaded')) {
    return 'AI 서비스가 현재 과부하 상태입니다. 잠시 후 다시 시도해주세요.';
  } else {
    return `Gemini API Error: ${errorMessage || '알 수 없는 오류'}`;
  }
}

// 이미지 응답 처리 함수
export function extractImageFromResponse(geminiResult) {
  console.log('Gemini API Response:', geminiResult);

  try {
    // Gemini 2.5 Flash Image Preview의 응답 처리
    const candidate = geminiResult?.candidates?.[0];

    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        // 텍스트 부분은 무시
        if (part.text) {
          console.log('Response text:', part.text);
          continue;
        }

        // inline_data로 이미지가 반환된 경우
        if (part.inlineData || part.inline_data) {
          const inlineData = part.inlineData || part.inline_data;
          const imageData = inlineData.data;
          const mimeType = inlineData.mimeType || inlineData.mime_type || 'image/png';

          console.log('Found generated image with mimeType:', mimeType);
          return `data:${mimeType};base64,${imageData}`;
        }
      }
    }

    console.warn('No image found in Gemini response');
  } catch (error) {
    console.error('Failed to extract image from Gemini response:', error);
  }

  return null;
}