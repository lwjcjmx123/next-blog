'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

/**
 * 性能仪表板组件
 * 在开发环境中显示实时性能数据
 */
export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isDevelopment, setIsDevelopment] = useState(false);

  useEffect(() => {
    // 只在开发环境中显示
    const isDev = process.env.NODE_ENV === 'development';
    console.log('PerformanceDashboard: Environment check, isDevelopment:', isDev);
    setIsDevelopment(isDev);
  }, []);

  useEffect(() => {
    if (!isDevelopment) {
      console.log('PerformanceDashboard: Not in development mode, skipping event listener setup');
      return;
    }

    console.log('PerformanceDashboard: Setting up event listener for performance-metric');
    // 监听性能指标事件
    const handlePerformanceMetric = (event: CustomEvent<PerformanceMetric>) => {
      console.log('PerformanceDashboard: Received metric event:', event.detail);
      setMetrics(prev => {
        const existing = prev.find(m => m.name === event.detail.name);
        if (existing) {
          return prev.map(m => 
            m.name === event.detail.name ? event.detail : m
          );
        } else {
          return [...prev, event.detail];
        }
      });
    };

    // 添加事件监听器
    window.addEventListener('performance-metric', handlePerformanceMetric as EventListener);

    return () => {
      window.removeEventListener('performance-metric', handlePerformanceMetric as EventListener);
    };
  }, [isDevelopment]);

  // 获取评级颜色
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // 获取评级图标
  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good': return '✅';
      case 'needs-improvement': return '⚠️';
      case 'poor': return '❌';
      default: return '📊';
    }
  };

  if (!isDevelopment) {
    return null;
  }

  return (
    <>
      {/* 浮动按钮 */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(!isVisible)}
          className="rounded-full w-12 h-12 shadow-lg"
          variant="outline"
        >
          📊
        </Button>
      </div>

      {/* 性能仪表板 */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 w-80">
          <Card className="p-4 shadow-xl bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                性能监控
              </h3>
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-3">
              {metrics.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  等待性能数据...
                </p>
              ) : (
                metrics.map((metric) => (
                  <div
                    key={metric.name}
                    className="flex items-center justify-between p-2 rounded-lg border"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {getRatingIcon(metric.rating)}
                      </span>
                      <div>
                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                          {metric.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(metric.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-gray-900 dark:text-white">
                        {metric.name === 'CLS' 
                          ? metric.value.toFixed(3)
                          : `${Math.round(metric.value)}ms`
                        }
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${getRatingColor(metric.rating)}`}>
                        {metric.rating}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t">
              <Button
                onClick={() => setMetrics([])}
                variant="outline"
                size="sm"
                className="w-full"
              >
                清除数据
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}