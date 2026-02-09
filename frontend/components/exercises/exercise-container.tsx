import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MultipleChoiceExercise } from './multiple-choice-exercise';
import { TrueFalseExercise } from './true-false-exercise';
import { CodeExercise } from './code-exercise';
import type { Exercise } from '@/lib/types';

interface ExerciseContainerProps {
  exercise: Exercise;
}

export function ExerciseContainer({ exercise }: ExerciseContainerProps) {
  const renderExercise = () => {
    switch (exercise.type) {
      case 'multiple_choice':
        return <MultipleChoiceExercise content={exercise.content as any} />;
      case 'code':
        return <CodeExercise content={exercise.content as any} />;
      case 'true_false':
        return <TrueFalseExercise content={exercise.content as any} />;
      default:
        return <p>Type d&apos;exercice inconnu</p>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{exercise.title}</CardTitle>
          <Badge>{exercise.type.replace('_', ' ')}</Badge>
        </div>
      </CardHeader>
      <CardContent>{renderExercise()}</CardContent>
    </Card>
  );
}
