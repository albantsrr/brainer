'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export function MermaidDiagram({ chart, className }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for theme to be available
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const currentTheme = theme === 'system' ? systemTheme : theme;
    const isDark = currentTheme === 'dark';

    // Configure mermaid with theme
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      themeVariables: {
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      },
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
      },
    });

    const renderDiagram = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        // Replace literal \n escape sequences with actual newlines
        const processedChart = chart.replace(/\\n/g, '\n');
        const { svg } = await mermaid.render(id, processedChart);
        setSvg(svg);
        setError('');
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError('Erreur lors du rendu du diagramme');
      }
    };

    renderDiagram();
  }, [chart, theme, systemTheme, mounted]);

  if (!mounted) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <div className="text-sm text-muted-foreground">Chargement du diagramme...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <div className="text-sm text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'my-8 flex justify-center overflow-x-auto',
        className
      )}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
