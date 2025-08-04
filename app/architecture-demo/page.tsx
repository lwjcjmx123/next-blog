'use client';

import React, { useState } from 'react';
import ArchitectureDiagram, { architectureConfigs, styleDescriptions, type DiagramStyle } from '@/components/ui/ArchitectureDiagram';

/**
 * 架构图演示页面 - 展示所有可用的架构图样式和配置
 */
export default function ArchitectureDemoPage() {
  const [selectedConfig, setSelectedConfig] = useState<keyof typeof architectureConfigs>('frontendArchitecture');
  const [selectedStyle, setSelectedStyle] = useState<DiagramStyle>('modern');
  const [showConnections, setShowConnections] = useState(true);
  const [animated, setAnimated] = useState(true);

  const configOptions = Object.keys(architectureConfigs) as Array<keyof typeof architectureConfigs>;
  const styleOptions: DiagramStyle[] = [
    'classic', 'modern', 'card', 'flow', 'circular', 'timeline', 'minimal',
    'glassmorphism', 'neon', 'gradient', 'isometric', 'blueprint', 'organic',
    'matrix', 'tree', 'radial', 'network', 'pyramid', 'hexagon'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="container mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            架构图组件演示
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            展示多种风格的架构图组件，支持不同的视觉样式和交互效果
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">控制面板</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 架构配置选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                架构配置
              </label>
              <select
                value={selectedConfig}
                onChange={(e) => setSelectedConfig(e.target.value as keyof typeof architectureConfigs)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {configOptions.map((config) => (
                  <option key={config} value={config}>
                    {architectureConfigs[config].title}
                  </option>
                ))}
              </select>
            </div>

            {/* 样式选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                显示样式
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value as DiagramStyle)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {styleOptions.map((style) => (
                  <option key={style} value={style}>
                    {styleDescriptions[style as keyof typeof styleDescriptions].name}
                  </option>
                ))}
              </select>
            </div>

            {/* 连接线开关 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                显示连接线
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showConnections}
                  onChange={(e) => setShowConnections(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {showConnections ? '显示' : '隐藏'}
                </span>
              </label>
            </div>

            {/* 动画开关 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                动画效果
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={animated}
                  onChange={(e) => setAnimated(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {animated ? '启用' : '禁用'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* 样式说明 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            当前样式：{styleDescriptions[selectedStyle as keyof typeof styleDescriptions].name}
          </h3>
          <p className="text-gray-600 mb-4">
            {styleDescriptions[selectedStyle as keyof typeof styleDescriptions].description}
          </p>
          <div className="flex flex-wrap gap-2">
            {styleDescriptions[selectedStyle as keyof typeof styleDescriptions].features.map((feature: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* 架构图展示 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <ArchitectureDiagram
            title={architectureConfigs[selectedConfig].title}
            layers={architectureConfigs[selectedConfig].layers}
            style={selectedStyle}
            showConnections={showConnections}
            animated={animated}
            className="architecture-demo"
          />
        </div>

        {/* 使用说明 */}
        <div className="mt-12 bg-gray-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">使用说明</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">基本用法</h3>
              <pre className="bg-gray-800 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`import ArchitectureDiagram, { 
  architectureConfigs 
} from '@/components/ui/ArchitectureDiagram';

<ArchitectureDiagram
  title="微服务架构图"
  layers={architectureConfigs.microservice.layers}
  style="modern"
  showConnections={true}
  animated={true}
/>`}
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">自定义配置</h3>
              <pre className="bg-gray-800 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`const customLayers = [
  {
    name: "前端层",
    color: "#3b82f6",
    description: "用户界面",
    components: ["Vue3", "React", "Angular"]
  },
  {
    name: "后端层",
    color: "#10b981",
    description: "业务逻辑",
    components: ["Node.js", "Spring Boot"]
  }
];

<ArchitectureDiagram
  title="自定义架构"
  layers={customLayers}
  style="card"
/>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}