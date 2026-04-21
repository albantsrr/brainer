'use client';

import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronRight, AlignLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('toc-open');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('toc-open', String(isOpen));
  }, [isOpen]);

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4');

    const items: TocItem[] = Array.from(headings).map((heading, index) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent || '';
      let id = heading.id;
      if (!id) {
        id = `heading-${index}`;
      }
      return { id, text, level };
    });

    setTocItems(items);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    tocItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [tocItems]);

  if (tocItems.length === 0) return null;

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - 80, behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={cn(
        "hidden xl:block transition-all duration-300 ease-in-out shrink-0",
        isOpen ? "w-56" : "w-10",
        className
      )}
    >
      <div className="sticky top-20">
        {/* Toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 w-8 mb-4 text-muted-foreground hover:text-foreground"
          aria-label={isOpen ? "Masquer la table des matières" : "Afficher la table des matières"}
        >
          {isOpen ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <AlignLeft className="h-3.5 w-3.5" />
          )}
        </Button>

        <div className={cn(
          "transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-muted-foreground/55 mb-4 pl-3">
            Sur cette page
          </p>

          <ScrollArea className="h-[calc(100vh-12rem)]">
            <ul className="relative space-y-0.5 pr-2">
              {/* Left rail */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-border/50" />

              {tocItems.map((item) => (
                <li
                  key={item.id}
                  className="relative"
                  style={{ paddingLeft: `${(item.level - 1) * 0.55 + 0.75}rem` }}
                >
                  {activeId === item.id && (
                    <div className="absolute left-0 top-[2px] bottom-[2px] w-[2px] bg-primary rounded-full" />
                  )}
                  <button
                    onClick={() => handleClick(item.id)}
                    className={cn(
                      "w-full text-left py-1.5 text-[0.72rem] leading-snug transition-colors hover:text-foreground",
                      activeId === item.id
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground font-normal"
                    )}
                  >
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      </div>
    </nav>
  );
}
