'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidProps {
  chart: string;
  className?: string;
}

export default function Mermaid({ chart, className = '' }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !ref.current) return;

    const renderChart = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const mermaid = (await import('mermaid')).default;
        
        // Initialize mermaid with configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          securityLevel: 'loose',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          themeVariables: {
            primaryColor: '#3b82f6',
            primaryTextColor: '#1f2937',
            primaryBorderColor: '#6b7280',
            lineColor: '#6b7280',
            secondaryColor: '#f3f4f6',
            tertiaryColor: '#ffffff',
            background: '#ffffff',
            mainBkg: '#ffffff',
            secondBkg: '#f9fafb',
            tertiaryBkg: '#f3f4f6'
          },
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
          },
          sequence: {
            useMaxWidth: true,
          },
          gantt: {
            useMaxWidth: true,
          },
        });

        // Clear previous content
        if (ref.current) {
          ref.current.innerHTML = '';
        }

        // Generate unique ID for this chart
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        
        // Render the chart
        const { svg } = await mermaid.render(id, chart);
        
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
        
        setError(null);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError('Failed to render diagram');
        if (ref.current) {
          ref.current.innerHTML = `<pre class="text-red-500 text-sm p-4 bg-red-50 dark:bg-red-900/20 rounded border">${chart}</pre>`;
        }
      }
    };

    renderChart();
  }, [chart, isClient]);

  if (!isClient) {
    return (
      <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-32 ${className}`} />
    );
  }

  return (
    <div className={`mermaid-container my-6 ${className}`}>
      <div 
        ref={ref} 
        className="flex justify-center items-center overflow-x-auto bg-white rounded-lg border border-gray-200 p-4"
        style={{ 
          minHeight: '200px',
          maxWidth: '100%'
        }}
      />
      {error && (
        <p className="text-red-500 text-sm mt-2 text-center">
          {error}
        </p>
      )}
    </div>
  );
}