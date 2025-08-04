"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  description: string;
}

interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
}

export default function PerformanceDemo() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [paintMetrics, setPaintMetrics] = useState<PerformanceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // 添加日志函数
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  // 获取性能评级
  const getRating = (
    metric: string,
    value: number
  ): "good" | "needs-improvement" | "poor" => {
    switch (metric) {
      case "LCP":
        return value <= 2500
          ? "good"
          : value <= 4000
          ? "needs-improvement"
          : "poor";
      case "FID":
        return value <= 100
          ? "good"
          : value <= 300
          ? "needs-improvement"
          : "poor";
      case "CLS":
        return value <= 0.1
          ? "good"
          : value <= 0.25
          ? "needs-improvement"
          : "poor";
      case "FCP":
        return value <= 1800
          ? "good"
          : value <= 3000
          ? "needs-improvement"
          : "poor";
      default:
        return "good";
    }
  };

  // 获取评级颜色
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "good":
        return "text-green-600 bg-green-50";
      case "needs-improvement":
        return "text-yellow-600 bg-yellow-50";
      case "poor":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // 监听Paint性能指标
  useEffect(() => {
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      // 监听paint事件
      const paintObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          addLog(`Paint事件: ${entry.name} - ${entry.startTime.toFixed(2)}ms`);
          setPaintMetrics((prev) => [
            ...prev,
            {
              name: entry.name,
              entryType: entry.entryType,
              startTime: entry.startTime,
              duration: entry.duration,
            },
          ]);
        });
      });

      try {
        paintObserver.observe({ entryTypes: ["paint"] });
        addLog("Paint Observer 已启动");
      } catch (error) {
        addLog("Paint Observer 启动失败: " + error);
      }

      return () => paintObserver.disconnect();
    }
  }, []);

  // 监听Web Vitals指标
  useEffect(() => {
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      const vitalsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          let metricName = "";
          let value = 0;
          let description = "";

          switch (entry.entryType) {
            case "largest-contentful-paint":
              metricName = "LCP";
              value = entry.startTime;
              description = "最大内容绘制时间";
              break;
            case "first-input":
              metricName = "FID";
              value = entry.processingStart - entry.startTime;
              description = "首次输入延迟";
              break;
            case "layout-shift":
              if (!entry.hadRecentInput) {
                metricName = "CLS";
                value = entry.value;
                description = "累积布局偏移";
              }
              break;
          }

          if (metricName) {
            const rating = getRating(metricName, value);
            addLog(`${metricName}: ${value.toFixed(2)} (${rating})`);

            setMetrics((prev) => {
              const existing = prev.find((m) => m.name === metricName);
              if (existing) {
                return prev.map((m) =>
                  m.name === metricName ? { ...m, value, rating } : m
                );
              } else {
                return [
                  ...prev,
                  { name: metricName, value, rating, description },
                ];
              }
            });
          }
        });
      });

      try {
        // 尝试观察各种性能指标
        const supportedTypes = PerformanceObserver.supportedEntryTypes || [];
        const typesToObserve = [
          "largest-contentful-paint",
          "first-input",
          "layout-shift",
        ].filter((type) => supportedTypes.includes(type));

        if (typesToObserve.length > 0) {
          vitalsObserver.observe({ entryTypes: typesToObserve });
          addLog(
            `Web Vitals Observer 已启动，监听: ${typesToObserve.join(", ")}`
          );
        } else {
          addLog("当前浏览器不支持 Web Vitals 监听");
        }
      } catch (error) {
        addLog("Web Vitals Observer 启动失败: " + error);
      }

      return () => vitalsObserver.disconnect();
    }
  }, []);

  // 手动触发性能测试
  const triggerPerformanceTest = async () => {
    setIsLoading(true);
    addLog("开始性能测试...");

    // 模拟一些性能操作
    try {
      // 获取当前的性能数据
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        const domLoadTime =
          navigation.domContentLoadedEventEnd - navigation.startTime;
        const pageLoadTime = navigation.loadEventEnd - navigation.startTime;

        addLog(`TTFB: ${ttfb.toFixed(2)}ms`);
        addLog(`DOM加载: ${domLoadTime.toFixed(2)}ms`);
        addLog(`页面加载: ${pageLoadTime.toFixed(2)}ms`);

        // 更新指标
        const newMetrics: PerformanceMetric[] = [
          {
            name: "TTFB",
            value: ttfb,
            rating:
              ttfb <= 200 ? "good" : ttfb <= 500 ? "needs-improvement" : "poor",
            description: "首字节时间",
          },
          {
            name: "DOM Load",
            value: domLoadTime,
            rating:
              domLoadTime <= 1500
                ? "good"
                : domLoadTime <= 3000
                ? "needs-improvement"
                : "poor",
            description: "DOM加载时间",
          },
          {
            name: "Page Load",
            value: pageLoadTime,
            rating:
              pageLoadTime <= 2000
                ? "good"
                : pageLoadTime <= 4000
                ? "needs-improvement"
                : "poor",
            description: "页面加载时间",
          },
        ];

        setMetrics((prev) => {
          const filtered = prev.filter(
            (m) => !["TTFB", "DOM Load", "Page Load"].includes(m.name)
          );
          return [...filtered, ...newMetrics];
        });
      }

      // 获取FCP
      const paintEntries = performance.getEntriesByType("paint");
      const fcpEntry = paintEntries.find(
        (entry) => entry.name === "first-contentful-paint"
      );
      if (fcpEntry) {
        const fcpValue = fcpEntry.startTime;
        const fcpRating = getRating("FCP", fcpValue);
        addLog(`FCP: ${fcpValue.toFixed(2)}ms (${fcpRating})`);

        setMetrics((prev) => {
          const existing = prev.find((m) => m.name === "FCP");
          if (existing) {
            return prev.map((m) =>
              m.name === "FCP"
                ? { ...m, value: fcpValue, rating: fcpRating }
                : m
            );
          } else {
            return [
              ...prev,
              {
                name: "FCP",
                value: fcpValue,
                rating: fcpRating,
                description: "首次内容绘制",
              },
            ];
          }
        });
      }
    } catch (error) {
      addLog("性能测试出错: " + error);
    }

    setIsLoading(false);
    addLog("性能测试完成");
  };

  // 清除日志
  const clearLogs = () => {
    setLogs([]);
    setMetrics([]);
    setPaintMetrics([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            前端性能监控实时演示
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            基于 PerformanceObserver API 的 Web Vitals 实时监控演示
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={triggerPerformanceTest}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "测试中..." : "开始性能测试"}
            </Button>
            <Button onClick={clearLogs} variant="outline">
              清除数据
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 性能指标卡片 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              性能指标
            </h2>
            {metrics.length === 0 ? (
              <Card className="p-6">
                <p className="text-gray-500 text-center">
                  暂无性能数据，请点击"开始性能测试"或刷新页面
                </p>
              </Card>
            ) : (
              metrics.map((metric, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {metric.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {metric.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {metric.name === "CLS"
                          ? metric.value.toFixed(3)
                          : `${metric.value.toFixed(0)}ms`}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(
                          metric.rating
                        )}`}
                      >
                        {metric.rating === "good"
                          ? "优秀"
                          : metric.rating === "needs-improvement"
                          ? "需改进"
                          : "较差"}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* 实时日志 */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              实时监控日志
            </h2>
            <Card className="p-4 h-96 overflow-y-auto">
              <div className="space-y-1">
                {logs.length === 0 ? (
                  <p className="text-gray-500 text-center">
                    监控日志将在这里显示...
                  </p>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      className="text-sm font-mono text-gray-700 dark:text-gray-300"
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Paint 性能指标 */}
        {paintMetrics.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Paint 性能指标
            </h2>
            <Card className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">事件名称</th>
                      <th className="text-left py-2">类型</th>
                      <th className="text-left py-2">开始时间</th>
                      <th className="text-left py-2">持续时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paintMetrics.map((metric, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 font-medium">{metric.name}</td>
                        <td className="py-2">{metric.entryType}</td>
                        <td className="py-2">
                          {metric.startTime.toFixed(2)}ms
                        </td>
                        <td className="py-2">{metric.duration.toFixed(2)}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* 说明文档 */}
        <div className="mt-8">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              指标说明
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Core Web Vitals</h3>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>
                    <strong>LCP</strong>: 最大内容绘制 (≤2.5s 优秀)
                  </li>
                  <li>
                    <strong>FID</strong>: 首次输入延迟 (≤100ms 优秀)
                  </li>
                  <li>
                    <strong>CLS</strong>: 累积布局偏移 (≤0.1 优秀)
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">其他指标</h3>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>
                    <strong>FCP</strong>: 首次内容绘制 (≤1.8s 优秀)
                  </li>
                  <li>
                    <strong>TTFB</strong>: 首字节时间 (≤200ms 优秀)
                  </li>
                  <li>
                    <strong>DOM Load</strong>: DOM加载时间
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
