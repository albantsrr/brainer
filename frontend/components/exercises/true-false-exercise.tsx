'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { TrueFalseContent } from '@/lib/types';

interface TrueFalseExerciseProps {
  content: TrueFalseContent;
}

export function TrueFalseExercise({ content }: TrueFalseExerciseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (answer: boolean) => {
    setSelectedAnswer(answer);
    setSubmitted(true);
  };

  const isCorrect = submitted && selectedAnswer === content.answer;

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{content.statement}</p>

      {!submitted && (
        <div className="flex gap-4">
          <Button onClick={() => handleSubmit(true)} variant="outline">
            Vrai
          </Button>
          <Button onClick={() => handleSubmit(false)} variant="outline">
            Faux
          </Button>
        </div>
      )}

      {submitted && (
        <Alert variant={isCorrect ? 'default' : 'destructive'}>
          <div className="flex items-start gap-2">
            <Badge variant={isCorrect ? 'default' : 'destructive'}>
              {isCorrect ? 'Correct !' : 'Incorrect'}
            </Badge>
            <AlertDescription>{content.explanation}</AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
}
