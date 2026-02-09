'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { MultipleChoiceContent } from '@/lib/types';

interface MultipleChoiceExerciseProps {
  content: MultipleChoiceContent;
}

export function MultipleChoiceExercise({ content }: MultipleChoiceExerciseProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedOption !== null) {
      setSubmitted(true);
    }
  };

  const isCorrect = submitted && selectedOption !== null && content.options[selectedOption]?.is_correct;

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{content.question}</p>

      <RadioGroup
        value={selectedOption?.toString()}
        onValueChange={(val) => setSelectedOption(parseInt(val))}
        disabled={submitted}
      >
        {content.options.map((option, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
            <Label htmlFor={`option-${idx}`} className="cursor-pointer">
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {!submitted && (
        <Button onClick={handleSubmit} disabled={selectedOption === null}>
          Soumettre
        </Button>
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
