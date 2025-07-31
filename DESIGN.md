# Future Seoul App - System Design Document

## 🏗️ Architecture Overview

### Current Architecture
```
┌─────────────────┐
│   React App     │
├─────────────────┤
│ - Gallery View  │
│ - Editor View   │
│ - Theme Toggle  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ External APIs   │
├─────────────────┤
│ - Gemini AI     │
│ - Weserv Proxy  │
│ - QRCode.js     │
└─────────────────┘
```

### Enhanced Architecture
```
┌─────────────────────────────────────────────────┐
│                  React App                       │
├─────────────────────────────────────────────────┤
│  Views           │ State Management │ Services  │
│  - Gallery       │ - Context API    │ - API     │
│  - Editor        │ - Local Storage  │ - Auth    │
│  - History       │ - Session State  │ - Storage │
│  - Settings      │                  │ - i18n    │
└─────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────┐
│              Service Layer                       │
├─────────────────────────────────────────────────┤
│ - AI Service    │ - Storage Service │ - Share   │
│ - Auth Service  │ - Analytics       │ - Cache   │
└─────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────┐
│            External Services                     │
├─────────────────────────────────────────────────┤
│ - Gemini AI    │ - Cloud Storage  │ - Analytics│
│ - Social APIs  │ - CDN            │ - Auth     │
└─────────────────────────────────────────────────┘
```

## 🧩 Component Design

### 1. Enhanced Gallery Component
```typescript
interface GalleryProps {
  landmarks: Landmark[];
  onSelect: (landmark: Landmark) => void;
  viewMode: 'carousel' | 'grid' | 'list';
  filters?: FilterOptions;
}

interface FilterOptions {
  category?: string[];
  favorites?: boolean;
  searchQuery?: string;
}

// Features:
// - Multiple view modes (carousel, grid, list)
// - Search and filter functionality
// - Favorite landmarks
// - Lazy loading for performance
// - Keyboard navigation
```

### 2. Generation History Component
```typescript
interface HistoryProps {
  userId?: string;
  onSelect: (generation: Generation) => void;
  onDelete: (id: string) => void;
  onShare: (generation: Generation) => void;
}

interface Generation {
  id: string;
  landmarkId: string;
  imageUrl: string;
  thumbnailUrl: string;
  options: GenerationOptions;
  createdAt: Date;
  tags?: string[];
  isFavorite: boolean;
}

// Features:
// - Grid/list view toggle
// - Sort by date/landmark/style
// - Batch operations
// - Export functionality
// - Infinite scroll
```

### 3. Social Sharing Component
```typescript
interface ShareModalProps {
  generation: Generation;
  isOpen: boolean;
  onClose: () => void;
}

interface ShareOptions {
  platform: 'twitter' | 'facebook' | 'instagram' | 'kakao' | 'link';
  includeDescription: boolean;
  watermark: boolean;
}

// Features:
// - Platform-specific sharing
// - Custom descriptions
// - Watermark option
// - Short URL generation
// - Share analytics
```

### 4. Settings Component
```typescript
interface SettingsProps {
  user: User;
  onUpdate: (settings: UserSettings) => void;
}

interface UserSettings {
  language: 'ko' | 'en';
  theme: 'light' | 'dark' | 'system';
  autoSave: boolean;
  imageQuality: 'low' | 'medium' | 'high';
  analytics: boolean;
  notifications: {
    email: boolean;
    push: boolean;
  };
}

// Features:
// - Language selection
// - Theme preferences
// - Privacy controls
// - Export/import settings
// - Account management
```

### 5. Multi-language Support
```typescript
interface I18nConfig {
  defaultLanguage: 'ko';
  supportedLanguages: ['ko', 'en'];
  namespaces: ['common', 'gallery', 'editor', 'settings'];
}

// Translation structure
const translations = {
  ko: {
    common: {
      title: "서울의 미래를 그리다",
      generate: "생성하기",
      back: "뒤로가기"
    },
    gallery: {
      searchPlaceholder: "랜드마크 검색...",
      viewMode: "보기 모드"
    }
  },
  en: {
    common: {
      title: "Drawing the Future of Seoul",
      generate: "Generate",
      back: "Back"
    }
  }
};
```

## 🔌 API Design

### 1. Environment Configuration
```typescript
// .env.local
VITE_GEMINI_API_KEY=your_api_key
VITE_STORAGE_BUCKET=your_bucket
VITE_ANALYTICS_ID=your_analytics_id
VITE_API_BASE_URL=https://api.futureseoul.com
```

### 2. API Service Layer
```typescript
// services/api.service.ts
class APIService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.baseURL = import.meta.env.VITE_API_BASE_URL;
  }

  async generateImage(
    landmark: Landmark,
    options: GenerationOptions,
    referenceImage: string
  ): Promise<GenerationResult> {
    // Implementation with error handling, retry logic
  }

  async saveGeneration(
    generation: Generation,
    userId?: string
  ): Promise<SaveResult> {
    // Save to local storage or cloud
  }

  async getHistory(
    userId?: string,
    options?: HistoryOptions
  ): Promise<Generation[]> {
    // Retrieve generation history
  }
}
```

### 3. Storage Service
```typescript
// services/storage.service.ts
interface StorageService {
  saveLocal(key: string, data: any): void;
  getLocal<T>(key: string): T | null;
  saveCloud(path: string, data: Blob): Promise<string>;
  deleteCloud(path: string): Promise<void>;
}

class HybridStorage implements StorageService {
  private cloudEnabled: boolean;

  async save(generation: Generation): Promise<void> {
    // Save to local storage first
    this.saveLocal(`generation_${generation.id}`, generation);
    
    // Optionally sync to cloud
    if (this.cloudEnabled) {
      await this.saveCloud(`generations/${generation.id}`, generation);
    }
  }
}
```

### 4. Analytics Service
```typescript
// services/analytics.service.ts
interface AnalyticsEvent {
  category: 'generation' | 'share' | 'gallery' | 'settings';
  action: string;
  label?: string;
  value?: number;
}

class AnalyticsService {
  track(event: AnalyticsEvent): void {
    if (!this.isEnabled()) return;
    
    // Send to analytics platform
    gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value
    });
  }

  trackGeneration(landmark: string, options: GenerationOptions): void {
    this.track({
      category: 'generation',
      action: 'create',
      label: landmark,
      value: 1
    });
  }
}
```

## 📊 State Management

### Context Structure
```typescript
// contexts/AppContext.tsx
interface AppState {
  user: User | null;
  settings: UserSettings;
  history: Generation[];
  favorites: string[];
  isLoading: boolean;
}

interface AppContextValue extends AppState {
  actions: {
    updateSettings: (settings: Partial<UserSettings>) => void;
    addToHistory: (generation: Generation) => void;
    toggleFavorite: (id: string) => void;
    clearHistory: () => void;
  };
}

// Usage
const AppProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  const value = {
    ...state,
    actions: {
      updateSettings: (settings) => 
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings }),
      // ... other actions
    }
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
```

## 🚀 Implementation Roadmap

### Phase 1: Core Improvements (Week 1-2)
1. **Security Enhancement**
   - Move API key to environment variables
   - Implement request rate limiting
   - Add input validation

2. **State Management**
   - Implement Context API
   - Add local storage persistence
   - Create app reducer

3. **UI/UX Improvements**
   - Add loading skeletons
   - Improve error messages
   - Enhance mobile experience

### Phase 2: New Features (Week 3-4)
1. **Generation History**
   - Local storage implementation
   - History UI component
   - Search and filter

2. **Multi-language Support**
   - i18n setup
   - Korean/English translations
   - Language switcher

3. **Gallery Enhancement**
   - Grid view option
   - Search functionality
   - Favorite landmarks

### Phase 3: Advanced Features (Week 5-6)
1. **Social Sharing**
   - Share modal component
   - Platform integrations
   - Analytics tracking

2. **Performance Optimization**
   - Image lazy loading
   - Code splitting
   - Bundle optimization

3. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

### Phase 4: Cloud Features (Week 7-8)
1. **User Accounts** (Optional)
   - Authentication
   - Cloud storage
   - Cross-device sync

2. **Analytics Dashboard**
   - Usage statistics
   - Popular combinations
   - Performance metrics

## 🛠️ Technical Specifications

### Performance Requirements
- Initial load: < 3 seconds on 3G
- Image generation: < 10 seconds
- Smooth 60fps animations
- Lighthouse score > 90

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers

### Accessibility Standards
- WCAG 2.1 Level AA
- Keyboard navigable
- Screen reader compatible
- High contrast support

### Security Measures
- Environment variables for secrets
- Input sanitization
- Rate limiting
- Content Security Policy
- HTTPS only

## 📦 Dependencies to Add

```json
{
  "dependencies": {
    "i18next": "^23.7.0",
    "react-i18next": "^14.0.0",
    "react-intersection-observer": "^9.5.0",
    "react-share": "^5.0.0",
    "axios": "^1.6.0",
    "date-fns": "^3.0.0",
    "react-hot-toast": "^2.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0",
    "vitest": "^1.1.0",
    "@testing-library/react": "^14.1.0"
  }
}
```

## 🎯 Success Metrics

1. **User Engagement**
   - Average generations per session > 3
   - Return user rate > 40%
   - Share rate > 20%

2. **Performance**
   - Page load time < 3s
   - Generation success rate > 95%
   - Error rate < 1%

3. **Accessibility**
   - Keyboard navigation coverage 100%
   - Screen reader compatibility 100%
   - Color contrast compliance 100%

This design provides a comprehensive blueprint for enhancing the Future Seoul app with modern features while maintaining performance and accessibility standards.