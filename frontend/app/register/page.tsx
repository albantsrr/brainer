'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth/auth-context';
import { useLogin, useRegister } from '@/lib/api/queries/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { setToken } = useAuth();
  const register = useRegister();
  const login = useLogin();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setConfirmError('Les mots de passe ne correspondent pas.');
      return;
    }
    setConfirmError('');
    register.mutate(
      { username, email, password },
      {
        onSuccess: () => {
          login.mutate(
            { email, password },
            {
              onSuccess: (data) => {
                setToken(data.access_token);
                router.push('/');
              },
            }
          );
        },
      }
    );
  }

  const apiError =
    register.error instanceof Error
      ? (register.error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
        register.error.message
      : null;

  const isPending = register.isPending || login.isPending;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-muted/40 to-background">
      <div className="w-full max-w-md space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-2">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Brainer</h1>
          <p className="text-sm text-muted-foreground">Créez votre compte pour accéder aux cours</p>
        </div>

        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle>Créer un compte</CardTitle>
            <CardDescription>Rejoignez Brainer et commencez à apprendre</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {apiError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Nom d&apos;utilisateur</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="jean_dupont"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  minLength={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="8 caractères minimum"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  aria-invalid={!!confirmError}
                  aria-describedby={confirmError ? 'confirm-error' : undefined}
                />
                {confirmError && (
                  <p id="confirm-error" className="text-sm text-destructive">
                    {confirmError}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                {isPending ? 'Création du compte...' : 'Créer mon compte'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Déjà inscrit ?{' '}
              <Link href="/login" className="text-primary font-medium underline-offset-4 hover:underline">
                Se connecter
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
