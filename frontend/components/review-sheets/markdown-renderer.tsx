import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-neutral dark:prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mt-8 mb-4 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mt-6 mb-3 text-red-700 dark:text-red-400 border-b border-red-500/20 pb-2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold mt-4 mb-2 text-rose-600 dark:text-rose-400 uppercase tracking-wider">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-sm leading-relaxed mb-3 text-foreground">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-4 mb-3 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-4 mb-3 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-red-500 pl-4 my-4 bg-red-500/5 py-2 pr-2 rounded-r-md text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ className: codeClass, children, ...props }) => {
            const isBlock = codeClass?.includes('language-');
            if (isBlock) {
              return (
                <pre className="bg-muted rounded-md p-4 overflow-x-auto my-4">
                  <code className={cn('text-sm font-mono', codeClass)} {...props}>
                    {children}
                  </code>
                </pre>
              );
            }
            return (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          strong: ({ children }) => (
            <strong className="font-semibold text-red-700 dark:text-red-400">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          hr: () => <hr className="my-6 border-none h-px bg-gradient-to-r from-red-500/40 via-red-500/15 to-transparent" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full text-sm border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-border px-3 py-2 text-left font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-3 py-2">{children}</td>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary font-medium no-underline hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
