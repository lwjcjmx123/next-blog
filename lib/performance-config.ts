/**
 * 性能监控配置
 */
export interface PerformanceConfig {
  // 是否启用性能监控
  enabled: boolean;
  // 是否在控制台输出日志
  enableConsoleLog: boolean;
  // 是否显示开发环境仪表板
  enableDashboard: boolean;
  // 采样率 (0-1)
  sampleRate: number;
  // 自定义上报函数
  onMetric?: (metric: PerformanceMetricData) => void;
  // 性能阈值配置
  thresholds: PerformanceThresholds;
}

export interface PerformanceMetricData {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  url: string;
  timestamp: number;
  userAgent?: string;
  connectionType?: string;
}

export interface PerformanceThresholds {
  LCP: { good: number; poor: number };
  FID: { good: number; poor: number };
  CLS: { good: number; poor: number };
  FCP: { good: number; poor: number };
  TTFB: { good: number; poor: number };
  TEST: { good: number; poor: number };
  [key: string]: { good: number; poor: number };
}

/**
 * 默认性能监控配置
 */
export const defaultPerformanceConfig: PerformanceConfig = {
  enabled: true,
  enableConsoleLog: process.env.NODE_ENV === "development",
  enableDashboard: process.env.NODE_ENV === "development",
  sampleRate: 1.0, // 100% 采样
  thresholds: {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 200, poor: 500 },
    TEST: { good: 1000, poor: 2000 },
  },
};

/**
 * 获取性能评级
 */
export function getPerformanceRating(
  metric: string,
  value: number,
  thresholds: PerformanceThresholds
): "good" | "needs-improvement" | "poor" {
  const threshold = thresholds[metric as keyof PerformanceThresholds];
  if (!threshold) return "good";

  return value <= threshold.good
    ? "good"
    : value <= threshold.poor
    ? "needs-improvement"
    : "poor";
}

/**
 * 检查是否应该采样此次监控
 */
export function shouldSample(sampleRate: number): boolean {
  return Math.random() < sampleRate;
}

/**
 * 获取连接类型信息
 */
export function getConnectionInfo(): string {
  if (typeof navigator !== "undefined" && "connection" in navigator) {
    const connection = (navigator as any).connection;
    return connection?.effectiveType || "unknown";
  }
  return "unknown";
}

/**
 * 获取设备信息
 */
export function getDeviceInfo() {
  if (typeof navigator === "undefined") {
    return {
      userAgent: "unknown",
      platform: "unknown",
      language: "unknown",
    };
  }

  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
  };
}
