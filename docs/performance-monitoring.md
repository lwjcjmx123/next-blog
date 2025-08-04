# 前端性能监控使用指南

本项目集成了完整的前端性能监控系统，可以实时收集和分析Web Vitals指标。

## 功能特性

### 🔍 监控指标
- **LCP (Largest Contentful Paint)**: 最大内容绘制时间
- **FID (First Input Delay)**: 首次输入延迟
- **CLS (Cumulative Layout Shift)**: 累积布局偏移
- **FCP (First Contentful Paint)**: 首次内容绘制
- **TTFB (Time to First Byte)**: 首字节时间

### 📊 开发环境仪表板
在开发环境中，右下角会显示一个性能监控按钮，点击可查看实时性能数据。

### ⚙️ 配置选项
- 启用/禁用监控
- 自定义性能阈值
- 采样率控制
- 自定义上报函数

## 使用方法

### 基础使用

性能监控已经在首页自动启用，无需额外配置。

### 自定义配置

```tsx
import { PerformanceMonitor } from '@/components/performance-monitor';

// 自定义配置
const performanceConfig = {
  enabled: true,
  sampleRate: 0.1, // 10% 采样
  onMetric: (metric) => {
    // 发送到你的分析服务
    console.log('Custom metric handler:', metric);
  },
  thresholds: {
    LCP: { good: 2000, poor: 3500 }, // 自定义LCP阈值
    FID: { good: 80, poor: 250 },
    CLS: { good: 0.08, poor: 0.2 },
    FCP: { good: 1500, poor: 2500 },
    TTFB: { good: 150, poor: 400 }
  }
};

function MyPage() {
  return (
    <div>
      <PerformanceMonitor config={performanceConfig} />
      {/* 页面内容 */}
    </div>
  );
}
```

### 使用Hook方式

```tsx
import { usePerformanceMonitor } from '@/components/performance-monitor';

function MyComponent() {
  usePerformanceMonitor({
    onMetric: (metric) => {
      // 处理性能指标
      if (metric.rating === 'poor') {
        console.warn('Performance issue detected:', metric);
      }
    },
    enableConsoleLog: true
  });

  return <div>My Component</div>;
}
```

## 数据结构

### PerformanceMetricData

```typescript
interface PerformanceMetricData {
  name: string;                    // 指标名称 (LCP, FID, CLS, etc.)
  value: number;                   // 指标值
  rating: 'good' | 'needs-improvement' | 'poor'; // 评级
  url: string;                     // 页面URL
  timestamp: number;               // 时间戳
  userAgent?: string;              // 用户代理
  connectionType?: string;         // 连接类型
}
```

## 集成分析服务

### Google Analytics 4

```tsx
const config = {
  onMetric: (metric) => {
    gtag('event', 'web_vitals', {
      metric_name: metric.name,
      metric_value: Math.round(metric.value),
      metric_rating: metric.rating,
      custom_parameter_url: metric.url
    });
  }
};
```

### 自定义API端点

```tsx
const config = {
  onMetric: async (metric) => {
    try {
      await fetch('/api/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metric)
      });
    } catch (error) {
      console.error('Failed to send performance metric:', error);
    }
  }
};
```

## 性能阈值说明

### Google推荐阈值

| 指标 | 优秀 (Good) | 需要改进 | 较差 (Poor) |
|------|-------------|----------|-------------|
| LCP  | ≤ 2.5s     | 2.5s-4s  | > 4s        |
| FID  | ≤ 100ms    | 100-300ms| > 300ms     |
| CLS  | ≤ 0.1      | 0.1-0.25 | > 0.25      |
| FCP  | ≤ 1.8s     | 1.8s-3s  | > 3s        |
| TTFB | ≤ 200ms    | 200-500ms| > 500ms     |

## 最佳实践

### 1. 生产环境配置

```tsx
const productionConfig = {
  enabled: true,
  enableConsoleLog: false,
  enableDashboard: false,
  sampleRate: 0.05, // 5% 采样以减少性能影响
  onMetric: (metric) => {
    // 发送到分析服务
    sendToAnalytics(metric);
  }
};
```

### 2. 错误处理

```tsx
const config = {
  onMetric: (metric) => {
    try {
      // 上报逻辑
      sendMetric(metric);
    } catch (error) {
      // 静默处理错误，避免影响用户体验
      console.error('Performance reporting failed:', error);
    }
  }
};
```

### 3. 条件监控

```tsx
const config = {
  enabled: process.env.NODE_ENV === 'production',
  sampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1
};
```

## 故障排除

### 常见问题

1. **监控数据不显示**
   - 检查浏览器是否支持PerformanceObserver
   - 确认配置中enabled为true
   - 检查采样率设置

2. **仪表板不显示**
   - 确认在开发环境中运行
   - 检查enableDashboard配置

3. **某些指标缺失**
   - FID需要用户交互才会触发
   - CLS在页面稳定后才会有最终值
   - 某些指标可能需要特定的浏览器支持

### 浏览器兼容性

- Chrome 77+
- Firefox 84+
- Safari 14.1+
- Edge 79+

## 演示页面

访问 `/performance-demo` 查看完整的性能监控演示，包括：
- 实时指标监控
- 性能测试工具
- 详细的监控日志
- 各种性能场景模拟