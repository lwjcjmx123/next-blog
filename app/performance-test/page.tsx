"use client";

import { useEffect, useState } from "react";
import { PerformanceMonitor } from "@/components/performance-monitor";
import { PerformanceDashboard } from "@/components/performance-dashboard";

interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
}

/**
 * 性能监控测试页面
 */
export default function PerformanceTestPage() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // 监听性能指标事件
    const handlePerformanceMetric = (event: CustomEvent<PerformanceMetric>) => {
      console.log("Test Page: Received metric:", event.detail);

      setMetrics((prev) => {
        const existing = prev.find((m) => m.name === event.detail.name);
        if (existing) {
          return prev.map((m) =>
            m.name === event.detail.name ? event.detail : m
          );
        } else {
          return [...prev, event.detail];
        }
      });

      setLogs((prev) => {
        const newLog = `${new Date().toLocaleTimeString()}: ${
          event.detail.name
        } = ${event.detail.value.toFixed(2)}ms (${event.detail.rating})`;
        // 避免重复添加相同的日志
        if (prev[prev.length - 1] !== newLog) {
          return [...prev, newLog];
        }
        return prev;
      });
    };

    // 添加事件监听器
    window.addEventListener(
      "performance-metric",
      handlePerformanceMetric as EventListener
    );

    // 添加初始日志
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: 页面加载，开始监听性能指标...`,
    ]);

    return () => {
      window.removeEventListener(
        "performance-metric",
        handlePerformanceMetric as EventListener
      );
    };
  }, []);

  const triggerTestMetric = () => {
    const testEvent = new CustomEvent("performance-metric", {
      detail: {
        name: "MANUAL_TEST",
        value: Math.random() * 1000,
        rating: "good" as const,
        timestamp: Date.now(),
      },
    });
    window.dispatchEvent(testEvent);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">性能监控测试页面</h1>

      {/* 性能监控组件 */}
      <PerformanceMonitor
        config={{ enableConsoleLog: true, enableDashboard: true }}
      />

      {/* 性能仪表板 */}
      <PerformanceDashboard />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 收集到的指标 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">收集到的性能指标</h2>
          {metrics.length === 0 ? (
            <p className="text-gray-500">等待性能数据...</p>
          ) : (
            <div className="space-y-2">
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span className="font-medium">{metric.name}</span>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      metric.rating === "good"
                        ? "bg-green-100 text-green-800"
                        : metric.rating === "needs-improvement"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {metric.value.toFixed(2)}ms ({metric.rating})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 日志 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">事件日志</h2>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm text-gray-600 font-mono">
                {log}
              </div>
            ))}
          </div>
          <button
            onClick={triggerTestMetric}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            触发测试指标
          </button>
        </div>
      </div>
    </div>
  );
}
