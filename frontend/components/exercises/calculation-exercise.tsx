'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ContentRenderer } from '@/components/chapters/content/content-renderer';
import type { CalculationContent } from '@/lib/types';

interface CalculationExerciseProps {
  content: CalculationContent;
}

export function CalculationExercise({ content }: CalculationExerciseProps) {
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Énoncé</h4>
        <ContentRenderer content={content.problem} />
      </div>

      {content.hints && content.hints.length > 0 && (
        <div className="space-y-2">
          {content.hints.slice(0, hintsShown).map((hint, i) => (
            <Alert key={i}>
              <AlertDescription>
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide mr-2">
                  Indice {i + 1}
                </span>
                {hint}
              </AlertDescription>
            </Alert>
          ))}
          {hintsShown < content.hints.length && (
            <Button
              onClick={() => setHintsShown((n) => n + 1)}
              variant="outline"
              size="sm"
            >
              Voir un indice
            </Button>
          )}
        </div>
      )}

      {!showSolution && (
        <Button onClick={() => setShowSolution(true)} variant="outline">
          Voir la solution
        </Button>
      )}

      {showSolution && (
        <Alert>
          <AlertDescription>
            <strong className="block mb-2">Solution :</strong>
            <ContentRenderer content={content.solution} />
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
