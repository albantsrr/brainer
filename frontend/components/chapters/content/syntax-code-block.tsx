'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LANGUAGE_DISPLAY: Record<string, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  bash: 'Bash',
  sh: 'Shell',
  shell: 'Shell',
  sql: 'SQL',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  html: 'HTML',
  css: 'CSS',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  rust: 'Rust',
  go: 'Go',
  ruby: 'Ruby',
  php: 'PHP',
  scala: 'Scala',
  kotlin: 'Kotlin',
  swift: 'Swift',
  r: 'R',
  text: 'Texte',
  plaintext: 'Texte',
};

interface SyntaxCodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

export function SyntaxCodeBlock({ code, language, className }: SyntaxCodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const isDark = resolvedTheme === 'dark';
  const style = isDark ? vscDarkPlus : oneLight;
  const displayLanguage = LANGUAGE_DISPLAY[language.toLowerCase()] || language;

  // Background colors matching the chosen styles
  const headerBg = isDark ? '#1e1e1e' : '#f3f3f3';
  const headerBorder = isDark ? '#3c3c3c' : 'var(--border)';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('my-4 rounded-lg overflow-hidden border border-border', className)}>
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ backgroundColor: headerBg, borderBottom: `1px solid ${headerBorder}` }}
      >
        <span
          className="text-xs font-mono font-medium"
          style={{ color: isDark ? '#858585' : undefined }}
        >
          {displayLanguage}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-transparent"
          onClick={handleCopy}
          aria-label="Copier le code"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3 opacity-50 hover:opacity-100 transition-opacity" />
          )}
        </Button>
      </div>

      {/* Syntax highlighted code */}
      <SyntaxHighlighter
        language={language}
        style={style}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: '0.875rem',
          lineHeight: '1.6',
          padding: '1rem',
        }}
        PreTag="div"
        wrapLongLines={false}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
}
