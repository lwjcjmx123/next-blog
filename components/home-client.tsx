'use client';

import { PerformanceMonitor } from './performance-monitor';
import { PerformanceDashboard } from './performance-dashboard';

/**
 * 首页客户端组件包装器
 * 用于在首页中集成客户端功能，如性能监控
 */
export function HomeClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 性能监控组件 */}
      <PerformanceMonitor />
      {/* 性能仪表板（仅开发环境） */}
      <PerformanceDashboard />
      {/* 首页内容 */}
      {children}
    </>
  );
}