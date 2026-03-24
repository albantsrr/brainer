'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  latex: string;
  block?: boolean;
}

export function MathFormula({ latex, block = false }: MathFormulaProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(latex, ref.current, {
        displayMode: block,
        throwOnError: false,
        trust: false,
      });
    } catch {
      if (ref.current) ref.current.textContent = latex;
    }
  }, [latex, block]);

  if (block) {
    return <div ref={ref as React.RefObject<HTMLDivElement>} className="my-4 overflow-x-auto text-center" />;
  }

  return <span ref={ref} className="align-middle" />;
}
