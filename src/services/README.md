# Service Layer Architecture

## 📡 API Service Specifications

### Core Services

#### 1. AI Generation Service
```typescript
// services/ai/gemini.service.ts
interface GeminiService {
  generateImage(params: GenerationParams): Promise<GenerationResult>;
  validateApiKey(): Promise<boolean>;
  getUsageStats(): Promise<UsageStats>;
}

interface GenerationParams {
  landmark: Landmark;
  options: GenerationOptions;
  referenceImage: string;
  quality?: 'standard' | 'high';
  aspectRatio?: '3:4' | '16:9' | '1:1';
}

interface GenerationResult {
  imageUrl: string;
  metadata: {
    generationId: string;
    timestamp: Date;
    processingTime: number;
    tokensUsed?: number;
  };
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

// Implementation with retry logic
class GeminiServiceImpl implements GeminiService {
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;
  
  async generateImage(params: GenerationParams): Promise<GenerationResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const result = await this.callGeminiAPI(params);
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (!this.isRetryableError(error)) {
          throw error;
        }
        
        await this.delay(this.retryDelay * Math.pow(2, attempt));
      }
    }
    
    throw lastError;
  }
  
  private isRetryableError(error: any): boolean {
    return error.code === 'RATE_LIMIT' || 
           error.code === 'TIMEOUT' ||
           error.message?.includes('overloaded');
  }
}
```

#### 2. Storage Service
```typescript
// services/storage/storage.service.ts
interface StorageService {
  // Local Storage
  saveLocal<T>(key: string, data: T): void;
  getLocal<T>(key: string): T | null;
  removeLocal(key: string): void;
  clearLocal(): void;
  
  // Cloud Storage (Future enhancement)
  saveCloud(path: string, data: Blob): Promise<string>;
  getCloud(path: string): Promise<Blob>;
  deleteCloud(path: string): Promise<void>;
  listCloud(prefix: string): Promise<string[]>;
}

// Hybrid storage implementation
class HybridStorageService implements StorageService {
  private readonly localStorage = window.localStorage;
  private readonly sessionStorage = window.sessionStorage;
  private cloudEnabled = false;
  
  saveLocal<T>(key: string, data: T): void {
    try {
      const serialized = JSON.stringify(data);
      this.localStorage.setItem(key, serialized);
      
      // Emit storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: serialized,
        url: window.location.href
      }));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        this.handleStorageQuotaExceeded();
      }
      throw error;
    }
  }
  
  private handleStorageQuotaExceeded(): void {
    // Remove oldest items based on timestamp
    const items = this.getAllLocalItems();
    const sorted = items.sort((a, b) => a.timestamp - b.timestamp);
    
    // Remove oldest 20% of items
    const toRemove = Math.ceil(sorted.length * 0.2);
    sorted.slice(0, toRemove).forEach(item => {
      this.removeLocal(item.key);
    });
  }
}
```

#### 3. History Service
```typescript
// services/history/history.service.ts
interface HistoryService {
  addGeneration(generation: Generation): Promise<void>;
  getHistory(options?: HistoryOptions): Promise<Generation[]>;
  getGeneration(id: string): Promise<Generation | null>;
  updateGeneration(id: string, updates: Partial<Generation>): Promise<void>;
  deleteGeneration(id: string): Promise<void>;
  exportHistory(format: 'json' | 'csv'): Promise<Blob>;
  importHistory(data: Blob): Promise<number>;
}

interface HistoryOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'landmark' | 'style';
  sortOrder?: 'asc' | 'desc';
  filters?: {
    landmarkId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    favorite?: boolean;
    tags?: string[];
  };
}

class HistoryServiceImpl implements HistoryService {
  private readonly storageKey = 'generation_history';
  private readonly maxHistorySize = 100;
  
  async addGeneration(generation: Generation): Promise<void> {
    const history = await this.getHistory();
    
    // Add new generation at the beginning
    history.unshift(generation);
    
    // Maintain max size
    if (history.length > this.maxHistorySize) {
      history.splice(this.maxHistorySize);
    }
    
    await this.saveHistory(history);
    
    // Emit event for UI updates
    this.emitHistoryChange('add', generation);
  }
  
  async getHistory(options?: HistoryOptions): Promise<Generation[]> {
    const allHistory = await this.loadHistory();
    let filtered = [...allHistory];
    
    // Apply filters
    if (options?.filters) {
      filtered = this.applyFilters(filtered, options.filters);
    }
    
    // Apply sorting
    if (options?.sortBy) {
      filtered = this.sortHistory(filtered, options.sortBy, options.sortOrder);
    }
    
    // Apply pagination
    if (options?.offset !== undefined || options?.limit !== undefined) {
      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;
      filtered = filtered.slice(start, end);
    }
    
    return filtered;
  }
}
```

#### 4. Share Service
```typescript
// services/share/share.service.ts
interface ShareService {
  shareToSocial(platform: SocialPlatform, data: ShareData): Promise<void>;
  generateShareUrl(generation: Generation): Promise<string>;
  generateQRCode(data: string, options?: QROptions): Promise<string>;
  copyToClipboard(text: string): Promise<void>;
  canShare(): boolean;
}

type SocialPlatform = 'twitter' | 'facebook' | 'instagram' | 'kakao' | 'line';

interface ShareData {
  title: string;
  text: string;
  url?: string;
  imageUrl?: string;
  hashtags?: string[];
}

class ShareServiceImpl implements ShareService {
  async shareToSocial(platform: SocialPlatform, data: ShareData): Promise<void> {
    const shareUrls = {
      twitter: this.buildTwitterUrl(data),
      facebook: this.buildFacebookUrl(data),
      kakao: this.buildKakaoUrl(data),
      instagram: this.buildInstagramUrl(data),
      line: this.buildLineUrl(data)
    };
    
    const url = shareUrls[platform];
    
    if (this.canUseWebShare() && platform !== 'instagram') {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url
      });
    } else {
      window.open(url, '_blank', 'width=600,height=400');
    }
    
    // Track share event
    this.trackShare(platform, data);
  }
  
  private buildTwitterUrl(data: ShareData): string {
    const params = new URLSearchParams({
      text: data.text,
      url: data.url || '',
      hashtags: data.hashtags?.join(',') || ''
    });
    return `https://twitter.com/intent/tweet?${params}`;
  }
  
  private buildKakaoUrl(data: ShareData): string {
    // Kakao SDK initialization required
    if (!window.Kakao?.isInitialized()) {
      window.Kakao.init(process.env.VITE_KAKAO_API_KEY);
    }
    
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: data.title,
        description: data.text,
        imageUrl: data.imageUrl,
        link: {
          mobileWebUrl: data.url,
          webUrl: data.url
        }
      }
    });
    
    return '#'; // Kakao SDK handles the sharing
  }
}
```

#### 5. Analytics Service
```typescript
// services/analytics/analytics.service.ts
interface AnalyticsService {
  initialize(config: AnalyticsConfig): void;
  trackEvent(event: AnalyticsEvent): void;
  trackPageView(page: string): void;
  trackTiming(category: string, variable: string, time: number): void;
  setUserProperty(property: string, value: any): void;
  getSessionId(): string;
}

interface AnalyticsEvent {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  customDimensions?: Record<string, any>;
}

type EventCategory = 
  | 'generation'
  | 'share'
  | 'gallery'
  | 'settings'
  | 'navigation'
  | 'error';

class AnalyticsServiceImpl implements AnalyticsService {
  private sessionId: string;
  private isEnabled: boolean = true;
  
  trackEvent(event: AnalyticsEvent): void {
    if (!this.isEnabled || !this.isInitialized()) return;
    
    // Google Analytics implementation
    if (window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.customDimensions
      });
    }
    
    // Custom analytics endpoint
    this.sendToCustomAnalytics({
      ...event,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }
  
  // Predefined tracking methods
  trackGeneration(landmark: string, options: GenerationOptions): void {
    this.trackEvent({
      category: 'generation',
      action: 'create',
      label: landmark,
      customDimensions: {
        weather: options.weatherSeason,
        time: options.time,
        style: options.artStyle,
        cityscape: options.cityscape,
        camera: options.cameraPosition
      }
    });
  }
  
  trackShare(platform: string, generation: Generation): void {
    this.trackEvent({
      category: 'share',
      action: platform,
      label: generation.landmarkId,
      value: 1
    });
  }
}
```

#### 6. Internationalization Service
```typescript
// services/i18n/i18n.service.ts
interface I18nService {
  initialize(config: I18nConfig): Promise<void>;
  setLanguage(language: Language): Promise<void>;
  getCurrentLanguage(): Language;
  translate(key: string, params?: Record<string, any>): string;
  translatePlural(key: string, count: number, params?: Record<string, any>): string;
  getAvailableLanguages(): Language[];
  loadNamespace(namespace: string): Promise<void>;
}

type Language = 'ko' | 'en';

interface I18nConfig {
  defaultLanguage: Language;
  fallbackLanguage: Language;
  namespaces: string[];
  loadPath: string;
  detection?: {
    order: ('querystring' | 'cookie' | 'localStorage' | 'navigator')[];
    caches: ('cookie' | 'localStorage')[];
  };
}

// Translation files structure
const translations = {
  ko: {
    common: {
      title: '서울의 미래를 그리다',
      subtitle: '서울의 미래공간을 나만의 스타일로 그려보세요',
      generate: '나만의 서울 미래상 생성하기',
      generating: '생성 중...',
      back: '뒤로가기',
      share: '공유하기',
      save: '저장하기',
      delete: '삭제하기',
      cancel: '취소',
      confirm: '확인',
      error: '오류가 발생했습니다',
      retry: '다시 시도'
    },
    gallery: {
      searchPlaceholder: '랜드마크 검색...',
      viewMode: {
        carousel: '캐러셀 보기',
        grid: '그리드 보기',
        list: '리스트 보기'
      },
      filter: {
        all: '전체',
        favorites: '즐겨찾기',
        recent: '최근 본 항목'
      }
    },
    editor: {
      options: {
        weather: '날씨/계절',
        time: '시간대',
        cityscape: '도시배경',
        artStyle: '그림 스타일',
        camera: '카메라 위치'
      },
      generation: {
        success: '이미지가 성공적으로 생성되었습니다!',
        error: '이미지 생성 중 오류가 발생했습니다.',
        quota: 'API 사용량을 초과했습니다. 잠시 후 다시 시도해주세요.'
      }
    },
    history: {
      title: '생성 히스토리',
      empty: '아직 생성한 이미지가 없습니다.',
      deleteConfirm: '이 이미지를 삭제하시겠습니까?',
      exportSuccess: '히스토리를 성공적으로 내보냈습니다.',
      importSuccess: '{{count}}개의 항목을 가져왔습니다.'
    }
  },
  en: {
    common: {
      title: 'Drawing the Future of Seoul',
      subtitle: 'Draw Seoul\'s future spaces in your own style',
      generate: 'Generate My Future Seoul',
      generating: 'Generating...',
      back: 'Back',
      share: 'Share',
      save: 'Save',
      delete: 'Delete',
      cancel: 'Cancel',
      confirm: 'Confirm',
      error: 'An error occurred',
      retry: 'Retry'
    }
    // ... English translations
  }
};
```

### Service Registry

```typescript
// services/index.ts
import { GeminiService } from './ai/gemini.service';
import { StorageService } from './storage/storage.service';
import { HistoryService } from './history/history.service';
import { ShareService } from './share/share.service';
import { AnalyticsService } from './analytics/analytics.service';
import { I18nService } from './i18n/i18n.service';

// Service container
class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, any> = new Map();
  
  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }
  
  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }
  
  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service as T;
  }
}

// Service initialization
export const initializeServices = async () => {
  const container = ServiceContainer.getInstance();
  
  // Register services
  container.register('gemini', new GeminiService());
  container.register('storage', new StorageService());
  container.register('history', new HistoryService());
  container.register('share', new ShareService());
  container.register('analytics', new AnalyticsService());
  container.register('i18n', new I18nService());
  
  // Initialize services
  const i18n = container.get<I18nService>('i18n');
  await i18n.initialize({
    defaultLanguage: 'ko',
    fallbackLanguage: 'en',
    namespaces: ['common', 'gallery', 'editor', 'history'],
    loadPath: '/locales/{{lng}}/{{ns}}.json'
  });
  
  const analytics = container.get<AnalyticsService>('analytics');
  analytics.initialize({
    trackingId: import.meta.env.VITE_ANALYTICS_ID,
    debug: import.meta.env.DEV
  });
};

// Service hooks
export const useService = <T>(name: string): T => {
  return ServiceContainer.getInstance().get<T>(name);
};

export const useGeminiService = () => useService<GeminiService>('gemini');
export const useStorageService = () => useService<StorageService>('storage');
export const useHistoryService = () => useService<HistoryService>('history');
export const useShareService = () => useService<ShareService>('share');
export const useAnalyticsService = () => useService<AnalyticsService>('analytics');
export const useI18nService = () => useService<I18nService>('i18n');
```

### Error Handling

```typescript
// services/errors/service-errors.ts
export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false,
    public details?: any
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export class NetworkError extends ServiceError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', true, details);
  }
}

export class APIError extends ServiceError {
  constructor(
    message: string,
    public statusCode: number,
    details?: any
  ) {
    super(
      message,
      `API_ERROR_${statusCode}`,
      statusCode >= 500,
      details
    );
  }
}

export class ValidationError extends ServiceError {
  constructor(message: string, public fields: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', false, fields);
  }
}

export class QuotaExceededError extends ServiceError {
  constructor(
    message: string,
    public quotaType: 'storage' | 'api' | 'generation'
  ) {
    super(message, 'QUOTA_EXCEEDED', false, { quotaType });
  }
}
```

This service layer architecture provides a robust foundation for implementing all the planned features with proper separation of concerns, error handling, and extensibility.