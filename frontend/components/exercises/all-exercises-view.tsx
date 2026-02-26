'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Exercise, ExerciseSubmissionResponse, MultipleChoiceContent, TrueFalseContent, CodeContent } from '@/lib/types';
import { apiClient } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';

interface AllExercisesViewProps {
  exercises: Exercise[];
  chapterId: number;
  courseSlug: string;
  initialSubmissions?: Record<number, ExerciseSubmissionResponse>;
  className?: string;
}

export function AllExercisesView({ exercises, chapterId, courseSlug, initialSubmissions, className }: AllExercisesViewProps) {
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<number, any>>(
    () => Object.fromEntries(
      Object.entries(initialSubmissions ?? {}).map(([id, sub]) => [parseInt(id), sub.answer])
    )
  );
  const [submitted, setSubmitted] = useState(
    exercises.length > 0 && exercises.every(ex => (initialSubmissions ?? {})[ex.id] !== undefined)
  );

  const handleAnswerChange = (exerciseId: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [exerciseId]: answer }));
  };

  const handleSubmit = async () => {
    const allAnswered = exercises.every(ex => {
      const answer = answers[ex.id];
      return answer !== null && answer !== undefined;
    });

    if (!allAnswered) return;

    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Persist submissions fire-and-forget
    await Promise.allSettled(
      exercises.map(ex =>
        apiClient
          .post(`/api/chapters/${chapterId}/exercises/${ex.id}/submit`, { answer: answers[ex.id] })
          .catch(() => {})
      )
    );
    queryClient.invalidateQueries({ queryKey: queryKeys.progress.chapter(chapterId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.progress.course(courseSlug) });
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const answeredCount = Object.keys(answers).filter(
    key => answers[parseInt(key)] !== null && answers[parseInt(key)] !== undefined
  ).length;

  const allAnswered = answeredCount === exercises.length;

  return (
    <div className={className}>
      {/* Progress indicator */}
      {!submitted && (
        <Alert className="mb-6">
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                <strong>{answeredCount}</strong> sur <strong>{exercises.length}</strong> exercice
                {exercises.length > 1 ? 's' : ''} complété{answeredCount > 1 ? 's' : ''}
              </span>
              {allAnswered && (
                <Badge variant="default">Prêt à soumettre</Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Submit button at top when all answered */}
      {!submitted && allAnswered && (
        <div className="mb-6 flex justify-center">
          <Button onClick={handleSubmit} size="lg" className="w-full sm:w-auto">
            Soumettre toutes mes réponses
          </Button>
        </div>
      )}

      {/* Success message after submission */}
      {submitted && (
        <Alert className="mb-6" variant="default">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-semibold">Exercices soumis avec succès !</p>
            <AlertDescription>
              Consultez les corrections ci-dessous pour chaque exercice.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Exercises list */}
      <div className="space-y-8">
        {exercises.map((exercise, index) => (
          <div key={exercise.id}>
            <ExerciseCard
              exercise={exercise}
              number={index + 1}
              answer={answers[exercise.id]}
              onAnswerChange={(answer) => handleAnswerChange(exercise.id, answer)}
              submitted={submitted}
            />
            {index < exercises.length - 1 && <Separator className="my-8" />}
          </div>
        ))}
      </div>

      {/* Submit/Reset buttons at bottom */}
      <div className="mt-12 pt-8 border-t flex justify-center gap-4">
        {!submitted ? (
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered}
            size="lg"
            className="w-full sm:w-auto"
          >
            Soumettre toutes mes réponses
          </Button>
        ) : (
          <Button onClick={handleReset} variant="outline" size="lg" className="w-full sm:w-auto">
            Réinitialiser et réessayer
          </Button>
        )}
      </div>
    </div>
  );
}

// Individual Exercise Card
function ExerciseCard({
  exercise,
  number,
  answer,
  onAnswerChange,
  submitted
}: {
  exercise: Exercise;
  number: number;
  answer: any;
  onAnswerChange: (answer: any) => void;
  submitted: boolean;
}) {
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
    <Card id={`exercise-${exercise.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Exercice {number}</Badge>
              <Badge variant="secondary">{getExerciseTypeName(exercise.type)}</Badge>
            </div>
            <CardTitle className="text-xl">{exercise.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {exercise.type === 'multiple_choice' && (
          <MultipleChoiceExerciseContent
            content={exercise.content as any}
            answer={answer}
            setAnswer={onAnswerChange}
            submitted={submitted}
          />
        )}

        {exercise.type === 'true_false' && (
          <TrueFalseExerciseContent
            content={exercise.content as any}
            answer={answer}
            setAnswer={onAnswerChange}
            submitted={submitted}
          />
        )}

        {exercise.type === 'code' && (
          <CodeExerciseContent
            content={exercise.content as any}
            answer={answer}
            setAnswer={onAnswerChange}
            submitted={submitted}
          />
        )}
      </CardContent>
    </Card>
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
        <p className="text-base font-medium leading-relaxed">{content.question}</p>
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
              htmlFor={`ex-${content.question.substring(0,10)}-option-${idx}`}
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
              <RadioGroupItem value={idx.toString()} id={`ex-${content.question.substring(0,10)}-option-${idx}`} className="mt-0.5" />
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
              <p className="font-semibold">{isCorrect ? 'Correct !' : 'Incorrect'}</p>
              <AlertDescription className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {content.explanation}
              </AlertDescription>
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
        <p className="text-base font-medium leading-relaxed">{content.statement}</p>
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
                {content.answer === true && <CheckCircle2 className="h-5 w-5 text-green-600" />}
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
                {content.answer === false && <CheckCircle2 className="h-5 w-5 text-green-600" />}
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
              <p className="font-semibold">{isCorrect ? 'Correct !' : 'Incorrect'}</p>
              <AlertDescription className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {content.explanation}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
}

// Code Exercise Component (Placeholder)
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
        <p className="text-base font-medium leading-relaxed">{content.instructions}</p>
      </div>

      <Alert>
        <AlertDescription>
          Les exercices de code sont en cours de développement. Cette fonctionnalité sera bientôt disponible.
        </AlertDescription>
      </Alert>
    </div>
  );
}
