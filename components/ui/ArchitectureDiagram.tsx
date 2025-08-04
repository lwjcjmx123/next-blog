'use client';

import React from 'react';

interface Layer {
  name: string;
  color: string;
  components: string[];
  description?: string;
}

export type DiagramStyle = 'classic' | 'modern' | 'card' | 'flow' | 'circular' | 'timeline' | 'minimal' | 'glassmorphism' | 'neon' | 'gradient' | 'isometric' | 'blueprint' | 'organic' | 'matrix' | 'tree' | 'radial' | 'network' | 'pyramid' | 'hexagon';

interface ArchitectureDiagramProps {
  title?: string;
  layers: Layer[];
  className?: string;
  style?: DiagramStyle;
  showConnections?: boolean;
  animated?: boolean;
}

/**
 * 现代化架构图组件 - 支持多种视觉风格的分层架构图表
 * @param title 图表标题
 * @param layers 架构层级数据
 * @param className 自定义样式类
 * @param style 图表风格
 * @param showConnections 是否显示连接线
 * @param animated 是否启用动画效果
 */
export default function ArchitectureDiagram({ 
  title, 
  layers, 
  className = '',
  style = 'modern',
  showConnections = true,
  animated = false
}: ArchitectureDiagramProps) {
  
  const renderClassicStyle = () => {
    const svgHeight = layers.length * 180 + 100;
    const svgWidth = 1200;
    
    return (
      <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 border-2 border-slate-200 rounded-2xl p-10 shadow-2xl overflow-x-auto">
        <svg 
          width="100%" 
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full min-w-[900px]"
        >
          <defs>
            <linearGradient id="layerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
            <linearGradient id="componentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>
            <filter id="modernShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.12"/>
            </filter>
            <filter id="componentShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.08"/>
            </filter>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
          </defs>
          
          {showConnections && layers.map((layer, layerIndex) => {
            if (layerIndex === layers.length - 1) return null;
            
            const currentY = layerIndex * 180 + 50;
            const nextY = (layerIndex + 1) * 180 + 50;
            const componentWidth = 220;
            const spacing = 35;
            const totalWidth = layer.components.length * (componentWidth + spacing) - spacing;
            const startX = (svgWidth - totalWidth) / 2;
            
            return (
              <g key={`connection-${layerIndex}`}>
                {layer.components.map((_, componentIndex) => {
                  const x = startX + componentIndex * (componentWidth + spacing) + componentWidth / 2;
                  return (
                    <g key={componentIndex}>
                      <line
                        x1={x}
                        y1={currentY + 110}
                        x2={x}
                        y2={nextY + 30}
                        stroke={layer.color}
                        strokeWidth="3"
                        strokeDasharray="8,4"
                        opacity="0.4"
                        className={animated ? 'animate-pulse' : ''}
                      />
                      <circle
                        cx={x}
                        cy={currentY + 110}
                        r="4"
                        fill={layer.color}
                        opacity="0.6"
                      />
                      <circle
                        cx={x}
                        cy={nextY + 30}
                        r="3"
                        fill={layers[layerIndex + 1]?.color || layer.color}
                        opacity="0.6"
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}
          
          {layers.map((layer, layerIndex) => {
            const y = layerIndex * 180 + 50;
            const componentWidth = 220;
            const componentHeight = 90;
            const spacing = 35;
            const totalWidth = layer.components.length * (componentWidth + spacing) - spacing;
            const startX = (svgWidth - totalWidth) / 2;
            
            return (
              <g key={layerIndex} className={animated ? 'animate-fade-in-up' : ''} style={{ animationDelay: `${layerIndex * 0.2}s` }}>
                {/* 层级背景 - 更现代化的设计 */}
                <rect
                  x="40"
                  y={y}
                  width={svgWidth - 80}
                  height="140"
                  fill="url(#layerGradient)"
                  stroke={layer.color}
                  strokeWidth="2"
                  rx="16"
                  filter="url(#modernShadow)"
                />
                
                {/* 顶部装饰条 - 渐变效果 */}
                <rect
                  x="40"
                  y={y}
                  width={svgWidth - 80}
                  height="6"
                  fill={layer.color}
                  rx="16"
                  opacity="0.9"
                  filter="url(#glow)"
                />
                
                {/* 层级标题区域 - 更精致的设计 */}
                <rect
                  x="60"
                  y={y + 25}
                  width="160"
                  height="90"
                  fill={layer.color}
                  rx="12"
                  filter="url(#componentShadow)"
                  opacity="0.95"
                />
                
                {/* 层级图标背景 */}
                <circle
                  cx="140"
                  cy={y + 50}
                  r="12"
                  fill="white"
                  opacity="0.3"
                />
                
                <text
                  x="140"
                  y={y + 75}
                  textAnchor="middle"
                  className="fill-white text-lg font-bold"
                >
                  {layer.name}
                </text>
                
                {layer.description && (
                  <text
                    x="140"
                    y={y + 95}
                    textAnchor="middle"
                    className="fill-white text-xs opacity-90"
                  >
                    {layer.description.length > 12 ? layer.description.substring(0, 12) + '...' : layer.description}
                  </text>
                )}
                
                {/* 组件 - 现代化卡片设计 */}
                {layer.components.map((component, componentIndex) => {
                  const x = startX + componentIndex * (componentWidth + spacing);
                  
                  return (
                    <g key={componentIndex} className={animated ? 'animate-scale-in' : ''} style={{ animationDelay: `${(layerIndex * 0.2) + (componentIndex * 0.1)}s` }}>
                      {/* 组件主体 */}
                      <rect
                        x={x}
                        y={y + 25}
                        width={componentWidth}
                        height={componentHeight}
                        fill="url(#componentGradient)"
                        stroke={layer.color}
                        strokeWidth="2"
                        rx="12"
                        filter="url(#componentShadow)"
                        className="hover:stroke-3 transition-all duration-200"
                      />
                      
                      {/* 组件顶部装饰 */}
                      <rect
                        x={x}
                        y={y + 25}
                        width={componentWidth}
                        height="8"
                        fill={layer.color}
                        rx="12"
                        opacity="0.7"
                      />
                      
                      {/* 组件状态指示器 */}
                      <circle
                        cx={x + componentWidth - 15}
                        cy={y + 40}
                        r="4"
                        fill={layer.color}
                        opacity="0.6"
                      />
                      
                      {/* 组件图标区域 */}
                      <rect
                        x={x + 15}
                        y={y + 45}
                        width="24"
                        height="24"
                        fill={layer.color}
                        rx="6"
                        opacity="0.15"
                      />
                      
                      {/* 组件文本 */}
                      <text
                        x={x + 50}
                        y={y + 65}
                        className="fill-gray-800 text-sm font-semibold"
                      >
                        {component.length > 18 ? component.substring(0, 18) + '...' : component}
                      </text>
                      
                      {/* 组件副标题 */}
                      <text
                        x={x + 50}
                        y={y + 85}
                        className="fill-gray-500 text-xs"
                      >
                        服务组件
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderModernStyle = () => {
    return (
      <div className="space-y-8">
        {layers.map((layer, layerIndex) => (
          <div key={layerIndex} className={`relative ${animated ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: `${layerIndex * 0.1}s` }}>
            {/* 层级标题 */}
            <div className="flex items-center mb-6">
              <div 
                className="w-4 h-4 rounded-full mr-4 shadow-lg"
                style={{ backgroundColor: layer.color }}
              ></div>
              <h4 className="text-lg font-bold text-gray-800">{layer.name}</h4>
              {layer.description && (
                <span className="ml-4 text-sm text-gray-500">{layer.description}</span>
              )}
            </div>
            
            {/* 组件网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {layer.components.map((component, componentIndex) => (
                <div
                  key={componentIndex}
                  className={`group relative bg-white rounded-xl p-4 shadow-lg border-l-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${animated ? 'animate-scale-in' : ''}`}
                  style={{ 
                    borderLeftColor: layer.color,
                    animationDelay: `${(layerIndex * 0.1) + (componentIndex * 0.05)}s`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                      {component}
                    </span>
                    <div 
                      className="w-2 h-2 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: layer.color }}
                    ></div>
                  </div>
                  
                  {/* 悬停效果 */}
                  <div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                    style={{ backgroundColor: layer.color }}
                  ></div>
                </div>
              ))}
            </div>
            
            {/* 连接线 */}
            {showConnections && layerIndex < layers.length - 1 && (
              <div className="flex justify-center my-6">
                <div className="flex flex-col items-center">
                  <div 
                    className="w-0.5 h-8 opacity-60"
                    style={{ backgroundColor: layer.color }}
                  ></div>
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: layer.color }}
                  ></div>
                  <div 
                    className="w-0.5 h-8 opacity-60"
                    style={{ backgroundColor: layers[layerIndex + 1]?.color || layer.color }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCardStyle = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {layers.map((layer, layerIndex) => (
          <div
            key={layerIndex}
            className={`bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 ${animated ? 'animate-fade-in-up' : ''}`}
            style={{ 
              borderTopColor: layer.color,
              animationDelay: `${layerIndex * 0.1}s`
            }}
          >
            {/* 卡片头部 */}
            <div 
              className="px-6 py-4 text-white font-bold text-lg"
              style={{ backgroundColor: layer.color }}
            >
              {layer.name}
              {layer.description && (
                <p className="text-sm opacity-90 mt-1 font-normal">{layer.description}</p>
              )}
            </div>
            
            {/* 卡片内容 */}
            <div className="p-6">
              <div className="space-y-3">
                {layer.components.map((component, componentIndex) => (
                  <div
                    key={componentIndex}
                    className={`flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${animated ? 'animate-slide-in-right' : ''}`}
                    style={{ animationDelay: `${(layerIndex * 0.1) + (componentIndex * 0.05)}s` }}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                      style={{ backgroundColor: layer.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{component}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFlowStyle = () => {
    return (
      <div className="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-y-0 lg:space-x-8 overflow-x-auto pb-4">
        {layers.map((layer, layerIndex) => (
          <React.Fragment key={layerIndex}>
            <div className={`flex-shrink-0 ${animated ? 'animate-zoom-in' : ''}`} style={{ animationDelay: `${layerIndex * 0.2}s` }}>
              {/* 层级容器 */}
              <div className="relative">
                <div 
                  className="w-64 rounded-2xl shadow-xl p-6 text-white"
                  style={{ backgroundColor: layer.color }}
                >
                  <h4 className="text-lg font-bold mb-4 text-center">{layer.name}</h4>
                  {layer.description && (
                    <p className="text-sm opacity-90 mb-4 text-center">{layer.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    {layer.components.map((component, componentIndex) => (
                      <div
                        key={componentIndex}
                        className={`bg-white bg-opacity-20 rounded-lg p-2 text-center text-sm font-medium backdrop-blur-sm ${animated ? 'animate-fade-in' : ''}`}
                        style={{ animationDelay: `${(layerIndex * 0.2) + (componentIndex * 0.1)}s` }}
                      >
                        {component}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 装饰元素 */}
                <div 
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-80"
                  style={{ backgroundColor: layer.color }}
                ></div>
                <div 
                  className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full opacity-60"
                  style={{ backgroundColor: layer.color }}
                ></div>
              </div>
            </div>
            
            {/* 流程箭头 */}
            {showConnections && layerIndex < layers.length - 1 && (
              <div className={`flex-shrink-0 ${animated ? 'animate-slide-in-right' : ''}`} style={{ animationDelay: `${layerIndex * 0.2 + 0.1}s` }}>
                <div className="hidden lg:block">
                  <svg width="60" height="40" viewBox="0 0 60 40" className="text-gray-400">
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                      </marker>
                    </defs>
                    <line x1="5" y1="20" x2="50" y2="20" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  </svg>
                </div>
                <div className="lg:hidden flex justify-center">
                  <svg width="40" height="60" viewBox="0 0 40 60" className="text-gray-400">
                    <defs>
                      <marker id="arrowhead-v" markerWidth="7" markerHeight="10" refX="3.5" refY="9" orient="auto">
                        <polygon points="0 0, 3.5 10, 7 0" fill="currentColor" />
                      </marker>
                    </defs>
                    <line x1="20" y1="5" x2="20" y2="50" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead-v)" />
                  </svg>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderCircularStyle = () => {
    const centerX = 300;
    const centerY = 300;
    const radius = 200;
    const angleStep = (2 * Math.PI) / layers.length;
    
    return (
      <div className="flex justify-center">
        <div className="relative w-[600px] h-[600px]">
          <svg width="600" height="600" viewBox="0 0 600 600" className="absolute inset-0">
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/> 
                </feMerge>
              </filter>
            </defs>
            
            {/* 中心圆 */}
            <circle
              cx={centerX}
              cy={centerY}
              r="60"
              fill="#f8fafc"
              stroke="#e2e8f0"
              strokeWidth="3"
              filter="url(#glow)"
            />
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-lg font-bold fill-gray-700"
            >
              架构核心
            </text>
            
            {/* 连接线 */}
            {showConnections && layers.map((layer, index) => {
              const angle = index * angleStep - Math.PI / 2;
              const x = centerX + Math.cos(angle) * radius;
              const y = centerY + Math.sin(angle) * radius;
              
              return (
                <line
                  key={index}
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke={layer.color}
                  strokeWidth="2"
                  opacity="0.6"
                  strokeDasharray="5,5"
                />
              );
            })}
            
            {/* 层级圆圈 */}
            {layers.map((layer, index) => {
              const angle = index * angleStep - Math.PI / 2;
              const x = centerX + Math.cos(angle) * radius;
              const y = centerY + Math.sin(angle) * radius;
              
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="80"
                    fill={layer.color}
                    opacity="0.9"
                    filter="url(#glow)"
                    className={animated ? 'animate-pulse' : ''}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  />
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm font-bold fill-white"
                  >
                    {layer.name}
                  </text>
                  <text
                    x={x}
                    y={y + 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs fill-white opacity-80"
                  >
                    {layer.components.length} 组件
                  </text>
                </g>
              );
            })}
          </svg>
          
          {/* 组件详情 */}
          {layers.map((layer, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            return (
              <div
                key={index}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${animated ? 'animate-fade-in' : ''}`}
                style={{ 
                  left: x + 120 * Math.cos(angle),
                  top: y + 120 * Math.sin(angle),
                  animationDelay: `${index * 0.3}s`
                }}
              >
                <div className="bg-white rounded-lg shadow-lg p-3 border-l-4 max-w-48" style={{ borderLeftColor: layer.color }}>
                  <h5 className="font-semibold text-sm mb-2">{layer.name}</h5>
                  <div className="space-y-1">
                    {layer.components.slice(0, 3).map((component, compIndex) => (
                      <div key={compIndex} className="text-xs text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: layer.color }}></div>
                        {component}
                      </div>
                    ))}
                    {layer.components.length > 3 && (
                      <div className="text-xs text-gray-400">+{layer.components.length - 3} 更多...</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTimelineStyle = () => {
    return (
      <div className="relative">
        {/* 时间线主轴 */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div className="space-y-12">
          {layers.map((layer, layerIndex) => (
            <div key={layerIndex} className={`relative flex items-start ${animated ? 'animate-slide-in-left' : ''}`} style={{ animationDelay: `${layerIndex * 0.2}s` }}>
              {/* 时间线节点 */}
              <div className="relative z-10 flex-shrink-0">
                <div 
                  className="w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: layer.color }}
                >
                  <span className="text-white text-xs font-bold">{layerIndex + 1}</span>
                </div>
                {layerIndex < layers.length - 1 && (
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-12 bg-gray-300"></div>
                )}
              </div>
              
              {/* 内容区域 */}
              <div className="ml-8 flex-1">
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderLeftColor: layer.color }}>
                  <div className="flex items-center mb-4">
                    <h4 className="text-lg font-bold text-gray-800">{layer.name}</h4>
                    {layer.description && (
                      <span className="ml-4 text-sm text-gray-500 italic">{layer.description}</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {layer.components.map((component, componentIndex) => (
                      <div
                        key={componentIndex}
                        className={`flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${animated ? 'animate-fade-in' : ''}`}
                        style={{ animationDelay: `${(layerIndex * 0.2) + (componentIndex * 0.1)}s` }}
                      >
                        <div 
                          className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
                          style={{ backgroundColor: layer.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">{component}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMinimalStyle = () => {
    return (
      <div className="space-y-6">
        {layers.map((layer, layerIndex) => (
          <div key={layerIndex} className={`${animated ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: `${layerIndex * 0.1}s` }}>
            {/* 简洁的层级标题 */}
            <div className="flex items-center mb-4">
              <div 
                className="w-1 h-6 mr-4"
                style={{ backgroundColor: layer.color }}
              ></div>
              <h4 className="text-lg font-semibold text-gray-800">{layer.name}</h4>
              {layer.description && (
                <span className="ml-4 text-sm text-gray-500">— {layer.description}</span>
              )}
            </div>
            
            {/* 简洁的组件列表 */}
            <div className="ml-6 space-y-2">
              {layer.components.map((component, componentIndex) => (
                <div
                  key={componentIndex}
                  className={`flex items-center text-gray-700 hover:text-gray-900 transition-colors ${animated ? 'animate-slide-in-right' : ''}`}
                  style={{ animationDelay: `${(layerIndex * 0.1) + (componentIndex * 0.05)}s` }}
                >
                  <div 
                    className="w-1.5 h-1.5 rounded-full mr-3"
                    style={{ backgroundColor: layer.color }}
                  ></div>
                  <span className="text-sm">{component}</span>
                </div>
              ))}
            </div>
            
            {/* 分隔线 */}
            {layerIndex < layers.length - 1 && (
              <div className="mt-6 border-b border-gray-200"></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // 玻璃态风格
  const renderGlassmorphismStyle = () => {
    return (
      <div className="bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-2xl p-8 overflow-hidden">
        <div className="space-y-6">
          {layers.map((layer, layerIndex) => (
            <div key={layerIndex} className={`relative ${animated ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: `${layerIndex * 0.1}s` }}>
              {/* 玻璃态背景 */}
              <div className="backdrop-blur-lg bg-white bg-opacity-20 rounded-xl p-6 border border-white border-opacity-30 shadow-xl">
                <div className="flex items-center mb-4">
                  <div 
                    className="w-4 h-4 rounded-full mr-4 shadow-lg"
                    style={{ backgroundColor: layer.color }}
                  ></div>
                  <h4 className="text-lg font-bold text-white drop-shadow-lg">{layer.name}</h4>
                  {layer.description && (
                    <span className="ml-4 text-sm text-white opacity-80">{layer.description}</span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {layer.components.map((component, componentIndex) => (
                    <div
                      key={componentIndex}
                      className={`backdrop-blur-sm bg-white bg-opacity-30 rounded-lg p-3 border border-white border-opacity-40 hover:bg-opacity-40 transition-all duration-300 ${animated ? 'animate-scale-in' : ''}`}
                      style={{ animationDelay: `${(layerIndex * 0.1) + (componentIndex * 0.05)}s` }}
                    >
                      <span className="text-sm font-semibold text-white drop-shadow">
                        {component}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 霓虹风格
  const renderNeonStyle = () => {
    return (
      <div className="bg-black rounded-2xl p-8 overflow-hidden">
        <div className="space-y-8">
          {layers.map((layer, layerIndex) => (
            <div key={layerIndex} className={`relative ${animated ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: `${layerIndex * 0.1}s` }}>
              <div className="border-2 rounded-xl p-6" style={{ borderColor: layer.color, boxShadow: `0 0 20px ${layer.color}40` }}>
                <div className="flex items-center mb-6">
                  <div 
                    className="w-4 h-4 rounded-full mr-4"
                    style={{ backgroundColor: layer.color, boxShadow: `0 0 10px ${layer.color}` }}
                  ></div>
                  <h4 className="text-lg font-bold" style={{ color: layer.color, textShadow: `0 0 10px ${layer.color}` }}>{layer.name}</h4>
                  {layer.description && (
                    <span className="ml-4 text-sm text-gray-300">{layer.description}</span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {layer.components.map((component, componentIndex) => (
                    <div
                      key={componentIndex}
                      className={`border rounded-lg p-3 hover:shadow-lg transition-all duration-300 ${animated ? 'animate-scale-in' : ''}`}
                      style={{ 
                        borderColor: layer.color,
                        boxShadow: `0 0 10px ${layer.color}20`,
                        animationDelay: `${(layerIndex * 0.1) + (componentIndex * 0.05)}s`
                      }}
                    >
                      <span className="text-sm font-semibold" style={{ color: layer.color }}>
                        {component}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渐变风格
  const renderGradientStyle = () => {
    return (
      <div className="space-y-8">
        {layers.map((layer, layerIndex) => (
          <div key={layerIndex} className={`relative ${animated ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: `${layerIndex * 0.1}s` }}>
            <div 
              className="rounded-2xl p-6 text-white shadow-2xl"
              style={{ 
                background: `linear-gradient(135deg, ${layer.color} 0%, ${layer.color}80 100%)`,
              }}
            >
              <div className="flex items-center mb-6">
                <h4 className="text-lg font-bold">{layer.name}</h4>
                {layer.description && (
                  <span className="ml-4 text-sm opacity-90">{layer.description}</span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {layer.components.map((component, componentIndex) => (
                  <div
                    key={componentIndex}
                    className={`bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 hover:bg-opacity-30 transition-all duration-300 ${animated ? 'animate-scale-in' : ''}`}
                    style={{ animationDelay: `${(layerIndex * 0.1) + (componentIndex * 0.05)}s` }}
                  >
                    <span className="text-sm font-semibold text-white">
                      {component}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 等轴测风格
  const renderIsometricStyle = () => {
    const layerHeight = 120;
    const layerSpacing = 40;
    const totalHeight = layers.length * (layerHeight + layerSpacing) + 100;
    
    return (
      <div className="flex justify-center">
        <svg width="800" height={totalHeight} viewBox={`0 0 800 ${totalHeight}`} className="overflow-visible">
          <defs>
            <filter id="isometricShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="4" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.2"/>
            </filter>
          </defs>
          
          {layers.map((layer, index) => {
            const y = index * (layerHeight + layerSpacing) + 50;
            const componentWidth = 100;
            const componentSpacing = 30;
            const totalWidth = layer.components.length * (componentWidth + componentSpacing) - componentSpacing;
            const startX = (800 - totalWidth) / 2;
            
            return (
              <g key={index}>
                {/* 等轴测层级背景 */}
                <path
                  d={`M 60 ${y} L 740 ${y} L 720 ${y + layerHeight} L 40 ${y + layerHeight} Z`}
                  fill={layer.color}
                  fillOpacity="0.8"
                  filter="url(#isometricShadow)"
                  className={animated ? 'animate-fade-in-up' : ''}
                  style={{ animationDelay: `${index * 0.2}s` }}
                />
                
                {/* 等轴测顶面 */}
                <path
                  d={`M 60 ${y} L 740 ${y} L 760 ${y - 20} L 80 ${y - 20} Z`}
                  fill={layer.color}
                  fillOpacity="0.9"
                />
                
                {/* 层级标题 */}
                <text
                  x="90"
                  y={y + 30}
                  className="text-lg font-bold fill-white drop-shadow"
                >
                  {layer.name}
                </text>
                
                {/* 等轴测组件 */}
                {layer.components.map((component, compIndex) => {
                  const compX = startX + compIndex * (componentWidth + componentSpacing);
                  const compY = y + 50;
                  
                  return (
                    <g key={compIndex}>
                      {/* 组件主体 */}
                      <path
                        d={`M ${compX} ${compY} L ${compX + componentWidth} ${compY} L ${compX + componentWidth - 10} ${compY + 40} L ${compX - 10} ${compY + 40} Z`}
                        fill="white"
                        stroke={layer.color}
                        strokeWidth="2"
                        filter="url(#isometricShadow)"
                        className={animated ? 'animate-scale-in' : ''}
                        style={{ animationDelay: `${(index * 0.2) + (compIndex * 0.1)}s` }}
                      />
                      
                      {/* 组件顶面 */}
                      <path
                        d={`M ${compX} ${compY} L ${compX + componentWidth} ${compY} L ${compX + componentWidth + 10} ${compY - 10} L ${compX + 10} ${compY - 10} Z`}
                        fill="#f8f9fa"
                        stroke={layer.color}
                        strokeWidth="1"
                      />
                      
                      <text
                        x={compX + componentWidth / 2}
                        y={compY + 25}
                        textAnchor="middle"
                        className="text-xs font-semibold fill-gray-800"
                      >
                        {component}
                      </text>
                    </g>
                  );
                })}
                
                {/* 连接线 */}
                {showConnections && index < layers.length - 1 && (
                  <line
                    x1="400"
                    y1={y + layerHeight}
                    x2="400"
                    y2={y + layerHeight + layerSpacing}
                    stroke={layer.color}
                    strokeWidth="3"
                    strokeDasharray="10,5"
                    className={animated ? 'animate-pulse' : ''}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // 蓝图风格
  const renderBlueprintStyle = () => {
    return (
      <div className="bg-blue-900 rounded-2xl p-8 overflow-hidden relative">
        {/* 网格背景 */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(96, 165, 250, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(96, 165, 250, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}></div>
        
        <div className="relative space-y-8">
          {layers.map((layer, layerIndex) => (
            <div key={layerIndex} className={`relative ${animated ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: `${layerIndex * 0.1}s` }}>
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6">
                <div className="flex items-center mb-6">
                  <h4 className="text-lg font-mono font-bold text-blue-200">{layer.name.toUpperCase()}</h4>
                  {layer.description && (
                    <span className="ml-4 text-sm text-blue-300 font-mono">// {layer.description}</span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {layer.components.map((component, componentIndex) => (
                    <div
                      key={componentIndex}
                      className={`border border-dashed border-blue-400 rounded p-3 hover:border-blue-200 transition-colors ${animated ? 'animate-fade-in' : ''}`}
                      style={{ animationDelay: `${(layerIndex * 0.1) + (componentIndex * 0.05)}s` }}
                    >
                      <span className="text-sm font-mono text-blue-200">
                        {component.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 有机风格
  const renderOrganicStyle = () => {
    return (
      <div className="space-y-8">
        {layers.map((layer, layerIndex) => (
          <div key={layerIndex} className={`relative ${animated ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: `${layerIndex * 0.1}s` }}>
            <div 
              className="rounded-3xl p-6 shadow-2xl"
              style={{ 
                background: `radial-gradient(ellipse at top left, ${layer.color}40, ${layer.color}20)`,
                border: `2px solid ${layer.color}60`
              }}
            >
              <div className="flex items-center mb-6">
                <div 
                  className="w-6 h-6 rounded-full mr-4 shadow-lg"
                  style={{ backgroundColor: layer.color }}
                ></div>
                <h4 className="text-lg font-bold text-gray-800">{layer.name}</h4>
                {layer.description && (
                  <span className="ml-4 text-sm text-gray-600 italic">{layer.description}</span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {layer.components.map((component, componentIndex) => (
                  <div
                    key={componentIndex}
                    className={`bg-white rounded-full px-4 py-3 shadow-lg border-2 hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${animated ? 'animate-scale-in' : ''}`}
                    style={{ 
                      borderColor: `${layer.color}60`,
                      animationDelay: `${(layerIndex * 0.1) + (componentIndex * 0.05)}s`
                    }}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
                        style={{ backgroundColor: layer.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">
                        {component}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  /**
   * 矩阵布局风格 - 网格矩阵展示所有组件
   */
  const renderMatrixStyle = () => {
    // 将所有组件平铺到一个矩阵中
    const allComponents = layers.flatMap(layer => 
      layer.components.map(component => ({ ...layer, component }))
    );
    
    const cols = Math.ceil(Math.sqrt(allComponents.length));
    
    return (
      <div className="bg-gray-50 p-8 rounded-2xl">
        <div 
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {allComponents.map((item, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg p-4 shadow-md border-l-4 hover:shadow-lg transition-all duration-300 ${animated ? 'animate-scale-in' : ''}`}
              style={{ 
                borderLeftColor: item.color,
                animationDelay: `${index * 0.05}s`
              }}
            >
              <div className="text-xs text-gray-500 mb-1">{item.name}</div>
              <div className="text-sm font-semibold text-gray-800">{item.component}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * 树形结构风格 - 分层树状展示
   */
  const renderTreeStyle = () => {
    return (
      <div className="flex flex-col items-center space-y-8">
        {layers.map((layer, layerIndex) => (
          <div key={layerIndex} className={`w-full ${animated ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: `${layerIndex * 0.2}s` }}>
            {/* 层级标题 */}
            <div className="text-center mb-6">
              <div 
                className="inline-block px-6 py-3 rounded-full text-white font-bold text-lg shadow-lg"
                style={{ backgroundColor: layer.color }}
              >
                {layer.name}
              </div>
              {layer.description && (
                <div className="text-sm text-gray-600 mt-2">{layer.description}</div>
              )}
            </div>
            
            {/* 树形分支 */}
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl">
                {layer.components.map((component, componentIndex) => (
                  <div key={componentIndex} className="relative">
                    {/* 连接线 */}
                    {showConnections && (
                      <div 
                        className="absolute -top-8 left-1/2 w-0.5 h-8 transform -translate-x-1/2"
                        style={{ backgroundColor: layer.color }}
                      ></div>
                    )}
                    
                    {/* 组件节点 */}
                    <div
                      className={`bg-white rounded-xl p-4 shadow-lg border-2 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${animated ? 'animate-scale-in' : ''}`}
                      style={{ 
                        borderColor: layer.color,
                        animationDelay: `${(layerIndex * 0.2) + (componentIndex * 0.1)}s`
                      }}
                    >
                      <div className="text-center">
                        <div 
                          className="w-4 h-4 rounded-full mx-auto mb-2"
                          style={{ backgroundColor: layer.color }}
                        ></div>
                        <div className="text-sm font-semibold text-gray-800">{component}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 层级间连接线 */}
            {showConnections && layerIndex < layers.length - 1 && (
              <div className="flex justify-center mt-6">
                <div 
                  className="w-0.5 h-12"
                  style={{ backgroundColor: layer.color }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  /**
   * 辐射布局风格 - 中心向外辐射
   */
  const renderRadialStyle = () => {
    const centerLayer = layers[Math.floor(layers.length / 2)];
    const otherLayers = layers.filter((_, index) => index !== Math.floor(layers.length / 2));
    
    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 overflow-hidden">
        {/* 中心节点 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div 
            className={`bg-white rounded-full p-6 shadow-2xl border-4 ${animated ? 'animate-scale-in' : ''}`}
            style={{ borderColor: centerLayer.color }}
          >
            <div className="text-center">
              <div 
                className="w-6 h-6 rounded-full mx-auto mb-2"
                style={{ backgroundColor: centerLayer.color }}
              ></div>
              <div className="text-sm font-bold text-gray-800">{centerLayer.name}</div>
            </div>
          </div>
        </div>
        
        {/* 辐射节点 */}
        {otherLayers.map((layer, layerIndex) => {
          const angle = (layerIndex * 360) / otherLayers.length;
          const radius = 120;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;
          
          return (
            <div
              key={layerIndex}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${animated ? 'animate-fade-in' : ''}`}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                animationDelay: `${layerIndex * 0.2}s`
              }}
            >
              <div 
                className="bg-white rounded-lg p-3 shadow-lg border-2 hover:shadow-xl transition-all duration-300"
                style={{ borderColor: layer.color }}
              >
                <div className="text-center">
                  <div 
                    className="w-3 h-3 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: layer.color }}
                  ></div>
                  <div className="text-xs font-semibold text-gray-800">{layer.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{layer.components.length} 组件</div>
                </div>
              </div>
              
              {/* 连接线 */}
              {showConnections && (
                <div 
                  className="absolute w-0.5 origin-bottom transform -translate-x-1/2"
                  style={{
                    height: `${radius}px`,
                    backgroundColor: layer.color,
                    bottom: '50%',
                    left: '50%',
                    transform: `translateX(-50%) rotate(${angle + 180}deg)`,
                    transformOrigin: 'bottom center'
                  }}
                ></div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * 网络拓扑风格 - 网状连接展示
   */
  const renderNetworkStyle = () => {
    return (
      <div className="bg-gray-900 p-8 rounded-2xl relative overflow-hidden">
        {/* 网格背景 */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* 网络节点 */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {layers.map((layer, layerIndex) => (
            <div key={layerIndex} className="space-y-4">
              {/* 层级标题 */}
              <div 
                className={`text-center p-3 rounded-lg border-2 ${animated ? 'animate-fade-in' : ''}`}
                style={{ 
                  borderColor: layer.color,
                  backgroundColor: `${layer.color}20`,
                  animationDelay: `${layerIndex * 0.1}s`
                }}
              >
                <div className="text-white font-bold text-sm">{layer.name}</div>
              </div>
              
              {/* 组件节点 */}
              {layer.components.map((component, componentIndex) => (
                <div
                  key={componentIndex}
                  className={`bg-gray-800 rounded-lg p-3 border-l-4 hover:bg-gray-700 transition-all duration-300 ${animated ? 'animate-slide-in-right' : ''}`}
                  style={{ 
                    borderLeftColor: layer.color,
                    animationDelay: `${(layerIndex * 0.1) + (componentIndex * 0.05)}s`
                  }}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-2 h-2 rounded-full mr-2 animate-pulse"
                      style={{ backgroundColor: layer.color }}
                    ></div>
                    <span className="text-white text-xs font-medium">{component}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * 金字塔布局风格 - 层级金字塔结构
   */
  const renderPyramidStyle = () => {
    return (
      <div className="flex flex-col items-center space-y-6">
        {layers.map((layer, layerIndex) => {
          const width = Math.max(20, 100 - layerIndex * 15); // 逐层递减宽度
          
          return (
            <div 
              key={layerIndex} 
              className={`${animated ? 'animate-fade-in-up' : ''}`}
              style={{ 
                width: `${width}%`,
                animationDelay: `${layerIndex * 0.2}s`
              }}
            >
              {/* 层级标题 */}
              <div className="text-center mb-4">
                <div 
                  className="inline-block px-6 py-2 rounded-full text-white font-bold shadow-lg"
                  style={{ backgroundColor: layer.color }}
                >
                  {layer.name}
                </div>
                {layer.description && (
                  <div className="text-sm text-gray-600 mt-1">{layer.description}</div>
                )}
              </div>
              
              {/* 组件展示 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {layer.components.map((component, componentIndex) => (
                  <div
                    key={componentIndex}
                    className={`bg-white rounded-lg p-4 shadow-lg border-t-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${animated ? 'animate-scale-in' : ''}`}
                    style={{ 
                      borderTopColor: layer.color,
                      animationDelay: `${(layerIndex * 0.2) + (componentIndex * 0.1)}s`
                    }}
                  >
                    <div className="text-center">
                      <div 
                        className="w-3 h-3 rounded-full mx-auto mb-2"
                        style={{ backgroundColor: layer.color }}
                      ></div>
                      <div className="text-sm font-semibold text-gray-800">{component}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * 六边形布局风格 - 蜂窝状六边形展示
   */
  const renderHexagonStyle = () => {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {layers.map((layer, layerIndex) => (
            <div key={layerIndex} className={`${animated ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: `${layerIndex * 0.1}s` }}>
              {/* 六边形容器 */}
              <div className="relative">
                {/* 六边形背景 */}
                <div 
                  className="hexagon mx-auto mb-4 flex items-center justify-center"
                  style={{ 
                    backgroundColor: layer.color,
                    width: '120px',
                    height: '104px'
                  }}
                >
                  <div className="text-center text-white">
                    <div className="text-lg font-bold">{layer.name}</div>
                    <div className="text-xs opacity-90">{layer.components.length} 组件</div>
                  </div>
                </div>
                
                {/* 组件列表 */}
                <div className="space-y-2">
                  {layer.components.map((component, componentIndex) => (
                    <div
                      key={componentIndex}
                      className={`bg-white rounded-lg p-3 shadow-md border-l-4 hover:shadow-lg transition-all duration-300 ${animated ? 'animate-slide-in-right' : ''}`}
                      style={{ 
                        borderLeftColor: layer.color,
                        animationDelay: `${(layerIndex * 0.1) + (componentIndex * 0.05)}s`
                      }}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-3"
                          style={{ backgroundColor: layer.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">{component}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (style) {
      case 'classic':
        return renderClassicStyle();
      case 'modern':
        return renderModernStyle();
      case 'card':
        return renderCardStyle();
      case 'flow':
        return renderFlowStyle();
      case 'circular':
        return renderCircularStyle();
      case 'timeline':
        return renderTimelineStyle();
      case 'minimal':
        return renderMinimalStyle();
      case 'glassmorphism':
        return renderGlassmorphismStyle();
      case 'neon':
        return renderNeonStyle();
      case 'gradient':
        return renderGradientStyle();
      case 'isometric':
        return renderIsometricStyle();
      case 'blueprint':
        return renderBlueprintStyle();
      case 'organic':
        return renderOrganicStyle();
      case 'matrix':
        return renderMatrixStyle();
      case 'tree':
        return renderTreeStyle();
      case 'radial':
        return renderRadialStyle();
      case 'network':
        return renderNetworkStyle();
      case 'pyramid':
        return renderPyramidStyle();
      case 'hexagon':
        return renderHexagonStyle();
      default:
        return renderModernStyle();
    }
  };

  return (
    <div className={`architecture-diagram my-10 ${className}`}>
      {title && (
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {title}
          </h3>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded"></div>
        </div>
      )}
      
      {renderContent()}
    </div>
  );
}

/**
 * 预定义的架构图配置
 */
export const architectureConfigs = {
  microservice: {
    title: "微服务架构图",
    layers: [
      {
        name: "展现层",
        color: "#3b82f6",
        description: "用户交互界面层",
        components: ["Web (Vue3, React)", "移动端 (iOS, Android)", "微信小程序", "H5页面"]
      },
      {
        name: "网关层",
        color: "#10b981",
        description: "API网关与负载均衡",
        components: ["API Gateway", "负载均衡器", "CDN加速", "防火墙"]
      },
      {
        name: "服务层",
        color: "#8b5cf6",
        description: "核心业务微服务",
        components: ["用户服务", "订单服务", "支付服务", "通知服务", "文件服务"]
      },
      {
        name: "数据层",
        color: "#f59e0b",
        description: "数据存储与缓存",
        components: ["MySQL", "Redis", "MongoDB", "ElasticSearch"]
      }
    ]
  },
  
  frontendArchitecture: {
    title: "前端架构体系",
    layers: [
      {
        name: "应用层",
        color: "#06b6d4",
        description: "用户界面应用",
        components: ["管理后台", "用户端H5", "移动App", "小程序"]
      },
      {
        name: "框架层",
        color: "#8b5cf6",
        description: "前端开发框架",
        components: ["Vue3 + TypeScript", "Vite构建工具", "Pinia状态管理", "Vue Router"]
      },
      {
        name: "组件层",
        color: "#10b981",
        description: "UI组件库",
        components: ["Element Plus", "自定义组件库", "图标库", "主题系统"]
      },
      {
        name: "工具层",
        color: "#f59e0b",
        description: "开发工具链",
        components: ["ESLint", "Prettier", "Husky", "Jest测试"]
      }
    ]
  },
  
  cloudNativeArchitecture: {
    title: "云原生架构",
    layers: [
      {
        name: "用户接入层",
        color: "#ec4899",
        description: "流量接入与分发",
        components: ["DNS解析", "CDN", "负载均衡", "API网关"]
      },
      {
        name: "应用服务层",
        color: "#3b82f6",
        description: "容器化应用服务",
        components: ["Web服务", "API服务", "后台任务", "定时任务"]
      },
      {
        name: "平台服务层",
        color: "#10b981",
        description: "Kubernetes平台",
        components: ["Pod管理", "Service网络", "ConfigMap", "Secret管理"]
      },
      {
        name: "基础设施层",
        color: "#f59e0b",
        description: "云基础设施",
        components: ["计算资源", "存储服务", "网络服务", "监控告警"]
      }
    ]
  },
  
  dataArchitecture: {
    title: "数据架构体系",
    layers: [
      {
        name: "数据应用层",
        color: "#8b5cf6",
        description: "数据可视化与应用",
        components: ["BI报表", "数据大屏", "实时监控", "智能推荐"]
      },
      {
        name: "数据服务层",
        color: "#06b6d4",
        description: "数据API与服务",
        components: ["数据API", "查询引擎", "缓存服务", "搜索服务"]
      },
      {
        name: "数据处理层",
        color: "#10b981",
        description: "数据ETL与计算",
        components: ["实时计算", "离线计算", "数据清洗", "数据同步"]
      },
      {
        name: "数据存储层",
        color: "#f59e0b",
        description: "多样化数据存储",
        components: ["关系型数据库", "文档数据库", "时序数据库", "对象存储"]
      }
    ]
  },
  
  devOpsArchitecture: {
    title: "DevOps工具链",
    layers: [
      {
        name: "开发阶段",
        color: "#3b82f6",
        description: "代码开发与管理",
        components: ["Git版本控制", "代码审查", "IDE工具", "本地调试"]
      },
      {
        name: "构建阶段",
        color: "#10b981",
        description: "持续集成构建",
        components: ["自动化构建", "单元测试", "代码扫描", "制品管理"]
      },
      {
        name: "部署阶段",
        color: "#f59e0b",
        description: "持续部署发布",
        components: ["自动化部署", "环境管理", "灰度发布", "回滚机制"]
      },
      {
        name: "运维阶段",
        color: "#8b5cf6",
        description: "监控与运维",
        components: ["性能监控", "日志分析", "告警通知", "故障处理"]
      }
    ]
  }
};

/**
 * 样式配置说明
 */
export const styleDescriptions = {
  classic: {
    name: "经典风格",
    description: "传统的分层架构图，使用SVG绘制，适合正式文档",
    features: ["SVG矢量图形", "层级背景", "连接线", "适合打印"]
  },
  modern: {
    name: "现代风格",
    description: "现代化的卡片式布局，响应式设计，交互友好",
    features: ["响应式布局", "悬停效果", "渐变色彩", "移动端友好"]
  },
  card: {
    name: "卡片风格",
    description: "每个层级独立成卡片，适合展示详细信息",
    features: ["独立卡片", "阴影效果", "颜色主题", "信息丰富"]
  },
  flow: {
    name: "流程风格",
    description: "流程图样式，强调数据流向和处理过程",
    features: ["流程箭头", "圆角设计", "装饰元素", "流向清晰"]
  },
  circular: {
    name: "圆形风格",
    description: "圆形布局，中心辐射式架构图",
    features: ["圆形布局", "中心辐射", "空间利用", "视觉冲击"]
  },
  timeline: {
    name: "时间线风格",
    description: "时间线样式，适合展示架构演进过程",
    features: ["时间轴", "步骤清晰", "渐进展示", "故事性强"]
  },
  minimal: {
    name: "极简风格",
    description: "极简设计，专注内容本身",
    features: ["简洁布局", "纯文字", "轻量级", "加载快速"]
  },
  glassmorphism: {
    name: "玻璃态风格",
    description: "现代玻璃态效果，毛玻璃背景",
    features: ["毛玻璃效果", "透明背景", "现代感", "视觉层次"]
  },
  neon: {
    name: "霓虹风格",
    description: "赛博朋克霓虹灯效果",
    features: ["发光效果", "暗色主题", "科技感", "视觉冲击"]
  },
  gradient: {
    name: "渐变风格",
    description: "丰富的渐变色彩效果",
    features: ["渐变背景", "色彩丰富", "现代设计", "视觉吸引"]
  },
  isometric: {
    name: "等轴测风格",
    description: "3D等轴测投影效果",
    features: ["3D效果", "立体感", "空间层次", "专业感"]
  },
  blueprint: {
    name: "蓝图风格",
    description: "工程蓝图设计风格",
    features: ["网格背景", "技术感", "专业性", "工程风格"]
  },
  organic: {
    name: "有机风格",
    description: "自然有机的曲线设计",
    features: ["圆润设计", "自然感", "柔和曲线", "亲和力"]
  },
  matrix: {
    name: "矩阵布局",
    description: "网格矩阵展示所有组件，打破层级限制",
    features: ["网格布局", "平等展示", "空间高效", "一目了然"]
  },
  tree: {
    name: "树形结构",
    description: "分层树状展示，突出层级关系",
    features: ["树状分支", "层级清晰", "组织结构", "连接明确"]
  },
  radial: {
    name: "辐射布局",
    description: "中心向外辐射，突出核心架构",
    features: ["中心辐射", "核心突出", "360度展示", "空间利用"]
  },
  network: {
    name: "网络拓扑",
    description: "网状连接展示，体现系统互联",
    features: ["网格背景", "节点连接", "科技感", "系统化"]
  },
  pyramid: {
    name: "金字塔布局",
    description: "层级金字塔结构，体现架构层次",
    features: ["金字塔形", "层次递减", "重要性排序", "视觉聚焦"]
  },
  hexagon: {
    name: "六边形布局",
    description: "蜂窝状六边形展示，现代几何美学",
    features: ["六边形设计", "蜂窝结构", "几何美学", "现代感"]
  }
};