'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { CodeContent } from '@/lib/types';

interface CodeExerciseProps {
  content: CodeContent;
}

export function CodeExercise({ content }: CodeExerciseProps) {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Instructions</h4>
        <p className="text-sm text-muted-foreground">{content.instructions}</p>
      </div>

      {content.starter_code && (
        <div>
          <h4 className="font-medium mb-2">Code de départ</h4>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto">
            <code>{content.starter_code}</code>
          </pre>
        </div>
      )}

      {!showSolution && (
        <Button onClick={() => setShowSolution(true)} variant="outline">
          Voir la solution
        </Button>
      )}

      {showSolution && (
        <Alert>
          <div className="space-y-2">
            <AlertDescription>
              <strong>Solution :</strong>
            </AlertDescription>
            <pre className="bg-background p-4 rounded-md overflow-x-auto">
              <code>{content.solution}</code>
            </pre>
          </div>
        </Alert>
      )}
    </div>
  );
}
