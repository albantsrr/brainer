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
import { useLogin } from '@/lib/api/queries/auth';

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useAuth();
  const login = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          setToken(data.access_token);
          router.push('/');
        },
      }
    );
  }

  const errorMessage =
    login.error instanceof Error
      ? (login.error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
        login.error.message
      : null;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-muted/40 to-background">
      <div className="w-full max-w-md space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-2">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Brainer</h1>
          <p className="text-sm text-muted-foreground">Bienvenue ! Connectez-vous pour continuer</p>
        </div>

        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle>Connexion</CardTitle>
            <CardDescription>Accédez à vos cours Brainer</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={login.isPending}>
                {login.isPending ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Pas encore de compte ?{' '}
              <Link href="/register" className="text-primary font-medium underline-offset-4 hover:underline">
                S&apos;inscrire gratuitement
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
