import parse, { HTMLReactParserOptions, Element, domToReact, DOMNode, Text } from 'html-react-parser';
import { Paragraph } from './paragraph';
import { Heading } from './heading';
import { List, ListItem } from './list';
import { Blockquote } from './blockquote';
import { CodeBlock, InlineCode } from './code-block';
import { Figure, FigureImage, FigureCaption } from './figure';
import { MermaidDiagram } from './mermaid-diagram';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
import { cn } from '@/lib/utils';

interface ContentRendererProps {
  content: string;
  className?: string;
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

      // Blockquote
      if (name === 'blockquote') {
        return <Blockquote>{domToReact(children as DOMNode[], options)}</Blockquote>;
      }

      // Code blocks
      if (name === 'pre') {
        // Check if it's a Mermaid diagram
        const codeChild = children?.find(
          (child) => child instanceof Element && child.name === 'code'
        ) as Element | undefined;

        if (codeChild) {
          const className = codeChild.attribs?.class || '';
          if (className.includes('language-mermaid') || className.includes('mermaid')) {
            // Extract mermaid code from text nodes
            const mermaidCode = codeChild.children
              ?.filter((child) => child instanceof Text)
              .map((child) => (child as Text).data)
              .join('') || '';

            if (mermaidCode.trim()) {
              return <MermaidDiagram chart={mermaidCode.trim()} />;
            }
          }
        }

        // Check if it's inside a figure (diagram)
        const parent = domNode.parent;
        if (parent && parent instanceof Element && parent.name === 'figure') {
          // Diagram in a figure - preserve alignment for ASCII/Unicode diagrams
          return (
            <pre className="my-0 overflow-x-auto text-sm font-mono whitespace-pre">
              {domToReact(children as DOMNode[], options)}
            </pre>
          );
        }
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
          <strong className="font-semibold text-foreground">
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
