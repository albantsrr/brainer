import parse, { HTMLReactParserOptions, Element, domToReact, DOMNode, Text } from 'html-react-parser';
import { Paragraph } from './paragraph';
import { Heading } from './heading';
import { List, ListItem } from './list';
import { Blockquote } from './blockquote';
import { CodeBlock, InlineCode } from './code-block';
import { SyntaxCodeBlock } from './syntax-code-block';
import { Figure, FigureImage, FigureCaption } from './figure';
import { MermaidDiagram } from './mermaid-diagram';
import { MathFormula } from './math-formula';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
import { Illustration, IllustrationCaption } from './illustration';
import { cn } from '@/lib/utils';

interface ContentRendererProps {
  content: string;
  className?: string;
}

function extractKatexLatex(element: Element): string | null {
  if (element.name === 'annotation' && element.attribs?.encoding === 'application/x-tex') {
    return element.children?.filter((c) => c instanceof Text).map((c) => (c as Text).data).join('') || null;
  }
  for (const child of element.children || []) {
    if (child instanceof Element) {
      const result = extractKatexLatex(child);
      if (result !== null) return result;
    }
  }
  return null;
}

export function ContentRenderer({ content, className }: ContentRendererProps) {
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (!(domNode instanceof Element)) return;

      const { name, attribs, children } = domNode;

      // Headings (h1-h6)
      if (name && /^h[1-6]$/.test(name)) {
        const level = parseInt(name[1]) as 1 | 2 | 3 | 4 | 5 | 6;
        return (
          <Heading level={level} id={attribs?.id}>
            {domToReact(children as DOMNode[], options)}
          </Heading>
        );
      }

      // Paragraphs
      if (name === 'p') {
        return <Paragraph>{domToReact(children as DOMNode[], options)}</Paragraph>;
      }

      // Lists
      if (name === 'ul') {
        return <List ordered={false}>{domToReact(children as DOMNode[], options)}</List>;
      }

      if (name === 'ol') {
        return <List ordered={true}>{domToReact(children as DOMNode[], options)}</List>;
      }

      if (name === 'li') {
        return <ListItem>{domToReact(children as DOMNode[], options)}</ListItem>;
      }

      // Math formulas (KaTeX)
      // Pre-rendered KaTeX HTML (legacy format) — extract LaTeX from annotation and re-render
      if (name === 'span' && attribs?.class?.trim() === 'katex') {
        const isBlock = domNode.parent instanceof Element && domNode.parent.attribs?.class?.includes('katex-display');
        const latex = extractKatexLatex(domNode);
        if (latex) return <MathFormula latex={latex} block={isBlock} />;
      }

      if (name === 'span' && attribs?.class?.includes('math-inline')) {
        const latex = children?.filter((c) => c instanceof Text).map((c) => (c as Text).data).join('') || '';
        return <MathFormula latex={latex} block={false} />;
      }

      // SVG illustration wrapper
      if (name === 'div' && attribs?.class?.includes('illustration')) {
        return <Illustration>{domToReact(children as DOMNode[], options)}</Illustration>;
      }

      if (name === 'p' && attribs?.class?.includes('illustration-caption')) {
        return <IllustrationCaption>{domToReact(children as DOMNode[], options)}</IllustrationCaption>;
      }

      if (name === 'div' && attribs?.class?.includes('math-block')) {
        const latex = children?.filter((c) => c instanceof Text).map((c) => (c as Text).data).join('') || '';
        return <MathFormula latex={latex} block={true} />;
      }

      // Aside blocks (micro-challenge, story)
      if (name === 'aside') {
        const asideClass = attribs?.class || '';

        if (asideClass.includes('micro-challenge')) {
          return (
            <aside className="my-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 p-4">
              {domToReact(children as DOMNode[], options)}
            </aside>
          );
        }

        if (asideClass.includes('story')) {
          return (
            <aside className="my-6 rounded-lg border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 p-4 italic">
              {domToReact(children as DOMNode[], options)}
            </aside>
          );
        }

        // Generic aside fallback
        return (
          <aside className="my-6 rounded-lg border-l-4 border-muted-foreground/30 bg-muted/30 p-4">
            {domToReact(children as DOMNode[], options)}
          </aside>
        );
      }

      // Blockquote
      if (name === 'blockquote') {
        return <Blockquote>{domToReact(children as DOMNode[], options)}</Blockquote>;
      }

      // Code blocks
      if (name === 'pre') {
        const codeChild = children?.find(
          (child) => child instanceof Element && child.name === 'code'
        ) as Element | undefined;

        if (codeChild) {
          const codeClass = codeChild.attribs?.class || '';

          // Mermaid diagram
          if (codeClass.includes('language-mermaid') || codeClass.includes('mermaid')) {
            const mermaidCode = codeChild.children
              ?.filter((child) => child instanceof Text)
              .map((child) => (child as Text).data)
              .join('') || '';

            if (mermaidCode.trim()) {
              return <MermaidDiagram chart={mermaidCode.trim()} />;
            }
          }

          // Check if it's inside a figure (ASCII/Unicode diagram)
          const parent = domNode.parent;
          if (parent && parent instanceof Element && parent.name === 'figure') {
            return (
              <pre className="my-0 overflow-x-auto text-sm font-mono whitespace-pre">
                {domToReact(children as DOMNode[], options)}
              </pre>
            );
          }

          // Extract raw text and language for syntax highlighting
          const rawCode = codeChild.children
            ?.filter((child) => child instanceof Text)
            .map((child) => (child as Text).data)
            .join('') || '';

          const langMatch = codeClass.match(/language-(\w+)/);
          const language = langMatch?.[1];

          // No language class = preformatted pedagogical content (tables, derivations, ASCII art)
          // Render as plain pre block without code chrome (no header, no copy button)
          if (!language && rawCode.trim()) {
            return (
              <pre className="my-4 p-4 rounded-lg bg-muted/50 overflow-x-auto text-sm font-mono whitespace-pre leading-relaxed">
                {rawCode}
              </pre>
            );
          }

          if (language && rawCode.trim()) {
            return <SyntaxCodeBlock code={rawCode} language={language} />;
          }
        }

        // Fallback for pre without code child
        return <CodeBlock>{domToReact(children as DOMNode[], options)}</CodeBlock>;
      }

      // Inline code
      if (name === 'code') {
        // Check if it's inside a pre (already handled)
        const parent = domNode.parent;
        if (parent && parent instanceof Element && parent.name === 'pre') {
          return <code>{domToReact(children as DOMNode[], options)}</code>;
        }
        return <InlineCode>{domToReact(children as DOMNode[], options)}</InlineCode>;
      }

      // Figures and images
      if (name === 'figure') {
        return <Figure>{domToReact(children as DOMNode[], options)}</Figure>;
      }

      if (name === 'img') {
        // Extract width and height from attributes if available
        const width = attribs?.width ? parseInt(attribs.width) : undefined;
        const height = attribs?.height ? parseInt(attribs.height) : undefined;

        return (
          <FigureImage
            src={attribs?.src || ''}
            alt={attribs?.alt || ''}
            width={width}
            height={height}
          />
        );
      }

      if (name === 'figcaption') {
        return <FigureCaption>{domToReact(children as DOMNode[], options)}</FigureCaption>;
      }

      // SVG diagrams
      if (name === 'svg') {
        return (
          <div className="w-full overflow-x-auto">
            <svg {...attribs} className={cn('mx-auto', attribs?.className)}>
              {domToReact(children as DOMNode[], options)}
            </svg>
          </div>
        );
      }

      // Strong
      if (name === 'strong' || name === 'b') {
        return (
          <strong className="font-semibold text-foreground bg-accent/10 px-0.5 rounded-sm">
            {domToReact(children as DOMNode[], options)}
          </strong>
        );
      }

      // Emphasis
      if (name === 'em' || name === 'i') {
        return <em className="italic">{domToReact(children as DOMNode[], options)}</em>;
      }

      // Links
      if (name === 'a') {
        return (
          <a
            href={attribs?.href}
            className="text-primary font-medium no-underline hover:underline"
            target={attribs?.target}
            rel={attribs?.rel}
          >
            {domToReact(children as DOMNode[], options)}
          </a>
        );
      }

      // Tables
      if (name === 'table') {
        return <Table>{domToReact(children as DOMNode[], options)}</Table>;
      }

      if (name === 'thead') {
        return <TableHeader>{domToReact(children as DOMNode[], options)}</TableHeader>;
      }

      if (name === 'tbody') {
        return <TableBody>{domToReact(children as DOMNode[], options)}</TableBody>;
      }

      if (name === 'tr') {
        return <TableRow>{domToReact(children as DOMNode[], options)}</TableRow>;
      }

      if (name === 'th') {
        return <TableHead>{domToReact(children as DOMNode[], options)}</TableHead>;
      }

      if (name === 'td') {
        return <TableCell>{domToReact(children as DOMNode[], options)}</TableCell>;
      }

      // Default: return undefined to keep original behavior
      return undefined;
    },
  };

  if (!content) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Aucun contenu disponible.</p>
      </div>
    );
  }

  return (
    <article className={cn('space-y-0', className)}>
      {parse(content, options)}
    </article>
  );
}
