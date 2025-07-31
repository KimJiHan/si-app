# Component Specifications

## 🎨 Design System

### Color Palette
```css
/* Light Theme */
--color-primary: #0066FF;
--color-secondary: #FF6B6B;
--color-background: #FFFFFF;
--color-surface: #F8F9FA;
--color-text: #212529;
--color-text-secondary: #6C757D;

/* Dark Theme */
--dark-primary: #4D94FF;
--dark-secondary: #FF8787;
--dark-background: #000000;
--dark-surface: #1A1A1A;
--dark-text: #FFFFFF;
--dark-text-secondary: #ADB5BD;

/* Semantic Colors */
--color-success: #28A745;
--color-warning: #FFC107;
--color-error: #DC3545;
--color-info: #17A2B8;
```

### Typography
```css
/* Font Family */
--font-primary: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", 
                "Pretendard", "Segoe UI", "Roboto", sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System
```css
/* Spacing Scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## 📦 Component Library

### 1. Button Component
```typescript
// components/Button/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  children: React.ReactNode;
}

// Usage
<Button 
  variant="primary" 
  size="lg" 
  icon={<Sparkles />}
  loading={isGenerating}
>
  나만의 서울 미래상 생성하기
</Button>
```

### 2. Card Component
```typescript
// components/Card/Card.tsx
interface CardProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

interface CardMediaProps {
  src: string;
  alt: string;
  aspectRatio?: '1:1' | '4:3' | '16:9' | '3:4';
  loading?: 'lazy' | 'eager';
}

// Usage
<Card variant="elevated" interactive onClick={handleSelect}>
  <CardMedia src={landmark.imageUrl} alt={landmark.title} />
  <CardContent>
    <CardTitle>{landmark.title}</CardTitle>
    <CardDescription>{landmark.description}</CardDescription>
  </CardContent>
</Card>
```

### 3. Modal Component
```typescript
// components/Modal/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
}

// Usage
<Modal 
  isOpen={showShareModal} 
  onClose={() => setShowShareModal(false)}
  title="이미지 공유하기"
  size="md"
>
  <ShareContent generation={currentGeneration} />
</Modal>
```

### 4. Select Component
```typescript
// components/Select/Select.tsx
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  multiple?: boolean;
}

// Usage
<Select
  label="그림 스타일"
  options={artStyleOptions}
  value={selectedStyle}
  onChange={setSelectedStyle}
  placeholder="스타일을 선택하세요"
/>
```

### 5. Toast Component
```typescript
// components/Toast/Toast.tsx
interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Usage
toast.success('이미지가 성공적으로 생성되었습니다!');
toast.error('이미지 생성 중 오류가 발생했습니다.');
```

### 6. Skeleton Component
```typescript
// components/Skeleton/Skeleton.tsx
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

// Usage
<Skeleton variant="rectangular" width="100%" height={400} />
<Skeleton variant="text" width="80%" />
<Skeleton variant="circular" width={40} height={40} />
```

### 7. Tab Component
```typescript
// components/Tabs/Tabs.tsx
interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

// Usage
<Tabs
  tabs={[
    { id: 'gallery', label: '갤러리', icon: <GridIcon /> },
    { id: 'history', label: '히스토리', icon: <HistoryIcon /> }
  ]}
  activeTab={currentView}
  onChange={setCurrentView}
/>
```

### 8. Image Component
```typescript
// components/Image/Image.tsx
interface ImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  loading?: 'lazy' | 'eager';
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
}

// Usage
<Image
  src={landmark.imageUrl}
  alt={landmark.title}
  aspectRatio="3/4"
  loading="lazy"
  fallback="/placeholder.jpg"
/>
```

### 9. SearchInput Component
```typescript
// components/SearchInput/SearchInput.tsx
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  showClearButton?: boolean;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
}

// Usage
<SearchInput
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="랜드마크 검색..."
  debounceMs={300}
  suggestions={landmarkSuggestions}
/>
```

### 10. LanguageSwitch Component
```typescript
// components/LanguageSwitch/LanguageSwitch.tsx
interface LanguageSwitchProps {
  currentLanguage: 'ko' | 'en';
  onChange: (language: 'ko' | 'en') => void;
  variant?: 'dropdown' | 'toggle' | 'flags';
}

// Usage
<LanguageSwitch
  currentLanguage={language}
  onChange={setLanguage}
  variant="toggle"
/>
```

## 🎯 Component Guidelines

### Accessibility
- All interactive components must have proper ARIA labels
- Support keyboard navigation (Tab, Enter, Escape)
- Maintain focus management
- Provide screen reader announcements
- Ensure color contrast ratios meet WCAG AA standards

### Performance
- Use React.memo for expensive components
- Implement lazy loading for images
- Use dynamic imports for large components
- Optimize re-renders with proper dependency arrays
- Implement virtualization for long lists

### Responsive Design
```typescript
// Breakpoint system
const breakpoints = {
  xs: '0px',      // Mobile
  sm: '640px',    // Large mobile
  md: '768px',    // Tablet
  lg: '1024px',   // Desktop
  xl: '1280px',   // Large desktop
  '2xl': '1536px' // Extra large
};

// Usage with Tailwind
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
```

### State Management
```typescript
// Use custom hooks for component logic
const useImageGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const generate = async (options: GenerationOptions) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generateImage(options);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { generate, isLoading, error };
};
```

### Testing Strategy
```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

This component specification provides a solid foundation for building a consistent, accessible, and performant UI system for the Future Seoul app.