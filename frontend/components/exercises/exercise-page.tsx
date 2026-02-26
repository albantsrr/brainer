'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Exercise, ExerciseSubmissionResponse, MultipleChoiceContent, TrueFalseContent, CodeContent } from '@/lib/types';
import { useSubmitExerciseAnswer } from '@/lib/api/queries/progress';

interface ExercisePageProps {
  exercise: Exercise;
  chapterId: number;
  courseSlug: string;
  initialSubmission?: ExerciseSubmissionResponse | null;
  className?: string;
}

export function ExercisePage({ exercise, chapterId, courseSlug, initialSubmission, className }: ExercisePageProps) {
  const [submitted, setSubmitted] = useState(!!initialSubmission);
  const [answer, setAnswer] = useState<any>(initialSubmission?.answer ?? null);
  const submitMutation = useSubmitExerciseAnswer(chapterId, exercise.id, courseSlug);

  const handleSubmit = () => {
    if (answer !== null && answer !== undefined) {
      setSubmitted(true);
      submitMutation.mutate({ answer });
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setAnswer(null);
  };

  const getExerciseTypeName = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return 'Choix multiple';
      case 'true_false':
        return 'Vrai ou Faux';
      case 'code':
        return 'Exercice de code';
      default:
        return type;
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle className="text-2xl">{exercise.title}</CardTitle>
              <CardDescription>
                <Badge variant="secondary">
                  {getExerciseTypeName(exercise.type)}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {exercise.type === 'multiple_choice' && (
            <MultipleChoiceExerciseContent
              content={exercise.content as any}
              answer={answer}
              setAnswer={setAnswer}
              submitted={submitted}
            />
          )}

          {exercise.type === 'true_false' && (
            <TrueFalseExerciseContent
              content={exercise.content as any}
              answer={answer}
              setAnswer={setAnswer}
              submitted={submitted}
            />
          )}

          {exercise.type === 'code' && (
            <CodeExerciseContent
              content={exercise.content as any}
              answer={answer}
              setAnswer={setAnswer}
              submitted={submitted}
            />
          )}

          {!submitted ? (
            <Button
              onClick={handleSubmit}
              disabled={answer === null || answer === undefined}
              size="lg"
              className="w-full sm:w-auto"
            >
              Soumettre ma réponse
            </Button>
          ) : (
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              Réessayer
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Multiple Choice Component
function MultipleChoiceExerciseContent({
  content,
  answer,
  setAnswer,
  submitted
}: {
  content: MultipleChoiceContent;
  answer: number | null;
  setAnswer: (val: number) => void;
  submitted: boolean;
}) {
  const selectedOption = answer !== null ? content.options[answer] : null;
  const isCorrect = selectedOption?.is_correct ?? false;

  return (
    <div className="space-y-6">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-lg font-medium leading-relaxed">{content.question}</p>
      </div>

      <RadioGroup
        value={answer?.toString() ?? ''}
        onValueChange={(val) => setAnswer(parseInt(val))}
        disabled={submitted}
        className="space-y-3"
      >
        {content.options.map((option, idx) => {
          const isSelected = answer === idx;
          const showCorrect = submitted && option.is_correct;
          const showIncorrect = submitted && isSelected && !option.is_correct;

          return (
            <Label
              key={idx}
              htmlFor={`option-${idx}`}
              className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
                submitted ? '' : 'cursor-pointer'
              } ${
                showCorrect
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                  : showIncorrect
                  ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                  : isSelected && !submitted
                  ? 'border-primary bg-accent'
                  : 'border-border hover:bg-accent/50'
              }`}
            >
              <RadioGroupItem value={idx.toString()} id={`option-${idx}`} className="mt-0.5" />
              <span className="flex-1 font-normal leading-relaxed">{option.text}</span>
              {showCorrect && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />}
              {showIncorrect && <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />}
            </Label>
          );
        })}
      </RadioGroup>

      {submitted && (
        <Alert variant={isCorrect ? 'default' : 'destructive'} className="mt-6 !flex !flex-col">
          <div className="flex items-start gap-3">
            {isCorrect ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 space-y-2">
              <p className="font-semibold">
                {isCorrect ? 'Correct !' : 'Incorrect'}
              </p>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {content.explanation}
              </div>
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
}

// True/False Component
function TrueFalseExerciseContent({
  content,
  answer,
  setAnswer,
  submitted
}: {
  content: TrueFalseContent;
  answer: boolean | null;
  setAnswer: (val: boolean) => void;
  submitted: boolean;
}) {
  const isCorrect = answer === content.answer;

  return (
    <div className="space-y-6">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-lg font-medium leading-relaxed">{content.statement}</p>
      </div>

      {!submitted ? (
        <div className="flex gap-4">
          <Button
            onClick={() => setAnswer(true)}
            variant={answer === true ? 'default' : 'outline'}
            size="lg"
            className="flex-1"
          >
            Vrai
          </Button>
          <Button
            onClick={() => setAnswer(false)}
            variant={answer === false ? 'default' : 'outline'}
            size="lg"
            className="flex-1"
          >
            Faux
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-4">
            <div
              className={`flex-1 rounded-lg border p-4 ${
                content.answer === true
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                  : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Vrai</span>
                {content.answer === true && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
              </div>
            </div>
            <div
              className={`flex-1 rounded-lg border p-4 ${
                content.answer === false
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                  : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Faux</span>
                {content.answer === false && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {submitted && (
        <Alert variant={isCorrect ? 'default' : 'destructive'} className="!flex !flex-col">
          <div className="flex items-start gap-3">
            {isCorrect ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 space-y-2">
              <p className="font-semibold">
                {isCorrect ? 'Correct !' : 'Incorrect'}
              </p>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {content.explanation}
              </div>
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
}

// Code Exercise Component (Placeholder for now)
function CodeExerciseContent({
  content,
  answer,
  setAnswer,
  submitted
}: {
  content: CodeContent;
  answer: string | null;
  setAnswer: (val: string) => void;
  submitted: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-lg font-medium leading-relaxed">{content.instructions}</p>
      </div>

      <Alert>
        <AlertDescription>
          Les exercices de code sont en cours de développement. Cette fonctionnalité sera bientôt disponible.
        </AlertDescription>
      </Alert>
    </div>
  );
}
