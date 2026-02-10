import parse, { HTMLReactParserOptions, Element, domToReact } from 'html-react-parser';
import { Paragraph } from './paragraph';
import { Heading } from './heading';
import { List, ListItem } from './list';
import { Blockquote } from './blockquote';
import { CodeBlock, InlineCode } from './code-block';
import { Figure, FigureImage, FigureCaption } from './figure';
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
            {domToReact(children, options)}
          </Heading>
        );
      }

      // Paragraphs
      if (name === 'p') {
        return <Paragraph>{domToReact(children, options)}</Paragraph>;
      }

      // Lists
      if (name === 'ul') {
        return <List ordered={false}>{domToReact(children, options)}</List>;
      }

      if (name === 'ol') {
        return <List ordered={true}>{domToReact(children, options)}</List>;
      }

      if (name === 'li') {
        return <ListItem>{domToReact(children, options)}</ListItem>;
      }

      // Blockquote
      if (name === 'blockquote') {
        return <Blockquote>{domToReact(children, options)}</Blockquote>;
      }

      // Code blocks
      if (name === 'pre') {
        return <CodeBlock>{domToReact(children, options)}</CodeBlock>;
      }

      // Inline code
      if (name === 'code') {
        // Check if it's inside a pre (already handled)
        const parent = domNode.parent;
        if (parent && parent instanceof Element && parent.name === 'pre') {
          return <code>{domToReact(children, options)}</code>;
        }
        return <InlineCode>{domToReact(children, options)}</InlineCode>;
      }

      // Figures and images
      if (name === 'figure') {
        return <Figure>{domToReact(children, options)}</Figure>;
      }

      if (name === 'img') {
        return (
          <FigureImage
            src={attribs?.src || ''}
            alt={attribs?.alt || ''}
          />
        );
      }

      if (name === 'figcaption') {
        return <FigureCaption>{domToReact(children, options)}</FigureCaption>;
      }

      // Strong
      if (name === 'strong' || name === 'b') {
        return (
          <strong className="font-semibold text-foreground">
            {domToReact(children, options)}
          </strong>
        );
      }

      // Emphasis
      if (name === 'em' || name === 'i') {
        return <em className="italic">{domToReact(children, options)}</em>;
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
            {domToReact(children, options)}
          </a>
        );
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
