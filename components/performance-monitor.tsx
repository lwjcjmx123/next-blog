"use client";

import { useEffect, useMemo } from "react";
import {
  defaultPerformanceConfig,
  getPerformanceRating,
  shouldSample,
  getConnectionInfo,
  getDeviceInfo,
  type PerformanceConfig,
  type PerformanceMetricData,
} from "@/lib/performance-config";

interface PerformanceMonitorProps {
  config?: Partial<PerformanceConfig>;
}

/**
 * 性能监控组件
 * 用于收集和上报Web Vitals性能指标
 */
export function PerformanceMonitor({
  config: userConfig,
}: PerformanceMonitorProps = {}) {
  const config = useMemo(
    () => ({ ...defaultPerformanceConfig, ...userConfig }),
    [userConfig]
  );

  useEffect(() => {
    console.log("PerformanceMonitor: Initializing with config:", config);

    // 检查是否启用监控
    if (!config.enabled) {
      console.log("PerformanceMonitor: Monitoring disabled");
      return;
    }

    // 检查浏览器支持
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      return;
    }

    // 检查采样率
    if (!shouldSample(config.sampleRate)) {
      return;
    }

    // 获取设备和连接信息
    const deviceInfo = getDeviceInfo();
    const connectionType = getConnectionInfo();

    // 性能数据上报函数
    const reportMetric = (
      metricData: Omit<PerformanceMetricData, "userAgent" | "connectionType">
    ) => {
      const fullMetric: PerformanceMetricData = {
        ...metricData,
        userAgent: deviceInfo.userAgent,
        connectionType,
      };

      console.log("PerformanceMonitor: Reporting metric:", fullMetric);

      // 控制台输出
      if (config.enableConsoleLog) {
        console.log("Performance Metric:", fullMetric);
      }

      // 发送自定义事件给仪表板组件
      if (config.enableDashboard) {
        console.log("PerformanceMonitor: Dispatching event to dashboard");
        window.dispatchEvent(
          new CustomEvent("performance-metric", {
            detail: fullMetric,
          })
        );
      }

      // 调用自定义上报函数
      if (config.onMetric) {
        config.onMetric(fullMetric);
      }
    };

    // 使用配置文件中的评级函数
    const getRating = (metric: string, value: number) => {
      return getPerformanceRating(metric, value, config.thresholds);
    };

    // 监听Web Vitals指标
    const vitalsObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        let metricName = "";
        let value = 0;

        switch (entry.entryType) {
          case "largest-contentful-paint":
            metricName = "LCP";
            value = entry.startTime;
            break;
          case "first-input":
            metricName = "FID";
            value = entry.processingStart - entry.startTime;
            break;
          case "layout-shift":
            if (!entry.hadRecentInput) {
              metricName = "CLS";
              value = entry.value;
            }
            break;
        }

        if (metricName) {
          const rating = getRating(metricName, value);
          reportMetric({
            name: metricName,
            value,
            rating,
            url: window.location.href,
            timestamp: Date.now(),
          });
        }
      });
    });

    // 监听Paint事件
    const paintObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (entry.name === "first-contentful-paint") {
          const value = entry.startTime;
          const rating = getRating("FCP", value);
          reportMetric({
            name: "FCP",
            value,
            rating,
            url: window.location.href,
            timestamp: Date.now(),
          });
        }
      });
    });

    try {
      // 启动Web Vitals监听
      const supportedTypes = PerformanceObserver.supportedEntryTypes || [];
      const vitalsTypes = [
        "largest-contentful-paint",
        "first-input",
        "layout-shift",
      ].filter((type) => supportedTypes.includes(type));

      if (vitalsTypes.length > 0) {
        vitalsObserver.observe({ entryTypes: vitalsTypes });
      }

      // 启动Paint事件监听
      if (supportedTypes.includes("paint")) {
        paintObserver.observe({ entryTypes: ["paint"] });
      }

      // 延迟检查Navigation Timing和Paint事件，确保数据可用
      const checkMetrics = () => {
        console.log("PerformanceMonitor: Checking Navigation Timing...");
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;
        console.log("PerformanceMonitor: Navigation entry:", navigation);
        if (
          navigation &&
          navigation.responseStart > 0 &&
          navigation.requestStart > 0
        ) {
          const ttfb = navigation.responseStart - navigation.requestStart;
          console.log("PerformanceMonitor: TTFB calculated:", ttfb, "ms");
          if (ttfb > 0) {
            const rating = getRating("TTFB", ttfb);
            console.log("PerformanceMonitor: TTFB rating:", rating);
            reportMetric({
              name: "TTFB",
              value: ttfb,
              rating,
              url: window.location.href,
              timestamp: Date.now(),
            });
          } else {
            console.log(
              "PerformanceMonitor: TTFB value is not positive:",
              ttfb
            );
          }
        } else {
          console.log(
            "PerformanceMonitor: Navigation timing data not ready yet"
          );
        }

        // 检查Paint事件
        console.log("PerformanceMonitor: Checking existing paint entries...");
        const paintEntries = performance.getEntriesByType("paint");
        console.log("PerformanceMonitor: Paint entries found:", paintEntries);
        paintEntries.forEach((entry) => {
          console.log(
            "PerformanceMonitor: Paint entry:",
            entry.name,
            entry.startTime
          );
          if (entry.name === "first-contentful-paint") {
            const value = entry.startTime;
            const rating = getRating("FCP", value);
            console.log(
              "PerformanceMonitor: FCP found:",
              value,
              "ms, rating:",
              rating
            );
            reportMetric({
              name: "FCP",
              value,
              rating,
              url: window.location.href,
              timestamp: Date.now(),
            });
          }
        });

        if (paintEntries.length === 0) {
          console.log("PerformanceMonitor: No paint entries found yet");
        }
      };

      // 立即检查一次
      checkMetrics();

      // 延迟再检查一次，确保所有指标都能被收集到
      setTimeout(checkMetrics, 1000);
      setTimeout(checkMetrics, 3000);

      // 测试指标已移除，避免无限循环
    } catch (error) {
      console.warn("Performance monitoring setup failed:", error);
    }

    // 清理函数
    return () => {
      vitalsObserver.disconnect();
      paintObserver.disconnect();
    };
  }, [config]);

  // 这个组件不渲染任何UI
  return null;
}

/**
 * 性能监控Hook
 * 提供更灵活的使用方式
 */
export function usePerformanceMonitor(options?: {
  onMetric?: (metric: any) => void;
  enableConsoleLog?: boolean;
}) {
  useEffect(() => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      return;
    }

    const { onMetric, enableConsoleLog = true } = options || {};

    const handleMetric = (metric: any) => {
      if (enableConsoleLog) {
        console.log("Performance Metric:", metric);
      }
      onMetric?.(metric);
    };

    // 这里可以复用上面的监控逻辑
    // 为了简化，这里只是一个示例
    const observer = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry: any) => {
        if (entry.entryType === "largest-contentful-paint") {
          handleMetric({
            name: "LCP",
            value: entry.startTime,
            timestamp: Date.now(),
          });
        }
      });
    });

    try {
      if (
        PerformanceObserver.supportedEntryTypes?.includes(
          "largest-contentful-paint"
        )
      ) {
        observer.observe({ entryTypes: ["largest-contentful-paint"] });
      }
    } catch (error) {
      console.warn("Performance monitoring hook failed:", error);
    }

    return () => observer.disconnect();
  }, [options]);
}
