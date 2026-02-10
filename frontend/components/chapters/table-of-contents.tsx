'use client';

import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
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
    // Restaurer l'état depuis localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('toc-open');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  // Sauvegarder l'état dans localStorage
  useEffect(() => {
    localStorage.setItem('toc-open', String(isOpen));
  }, [isOpen]);

  useEffect(() => {
    // Parse HTML content to extract headings
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4');

    const items: TocItem[] = Array.from(headings).map((heading, index) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent || '';
      let id = heading.id;

      // Generate ID if not present
      if (!id) {
        id = `heading-${index}`;
        // We'll need to add this ID to the actual rendered content
      }

      return { id, text, level };
    });

    setTocItems(items);
  }, [content]);

  useEffect(() => {
    // Track scroll position to highlight active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
      }
    );

    // Observe all headings in the actual content
    tocItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [tocItems]);

  if (tocItems.length === 0) {
    return null;
  }

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for fixed header if any
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav
      className={cn(
        "hidden xl:block transition-all duration-300 ease-in-out relative",
        isOpen ? "w-64" : "w-12",
        className
      )}
    >
      <div className="sticky top-20">
        {/* Toggle button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "absolute top-0 z-10 transition-all",
            isOpen ? "-left-4" : "left-2"
          )}
          aria-label={isOpen ? "Masquer la table des matières" : "Afficher la table des matières"}
        >
          {isOpen ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        {/* Content - visible seulement si ouvert */}
        <div className={cn(
          "transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <div className="flex items-center gap-2 mb-4">
            <List className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold">Sur cette page</h4>
          </div>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <ul className="space-y-2 text-sm">
              {tocItems.map((item) => (
                <li
                  key={item.id}
                  style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
                >
                  <button
                    onClick={() => handleClick(item.id)}
                    className={cn(
                      "w-full text-left transition-colors hover:text-foreground",
                      activeId === item.id
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
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
