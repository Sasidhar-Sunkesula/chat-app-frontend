import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    identifier: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      if (mode === 'login') {
        await login(formData.identifier, formData.password);
        navigate('/');
      } else {
        await register(formData.username, formData.identifier, formData.password);
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl shadow-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
        <h2 className="text-center font-bold text-xl text-neutral-800 dark:text-neutral-200">
          {mode === 'login' ? 'Sign In' : 'Register'}
        </h2>

        <form className="my-8" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <LabelInputContainer className="mb-8">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
              />
            </LabelInputContainer>
          )}

          <LabelInputContainer className="mb-4">
            <Label htmlFor="identifier">
              {mode === 'login' ? 'Email or Username' : 'Email Address'}
            </Label>
            <Input
              id="identifier"
              placeholder={mode === 'login' ? 'email or username' : 'you@example.com'}
              type="text"
              value={formData.identifier}
              onChange={handleChange}
            />
          </LabelInputContainer>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
          </LabelInputContainer>

          {error && (
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            className="cursor-pointer bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            type="submit"
          >
            {mode === 'login' ? 'Sign in' : 'Sign up'} &rarr;
          </button>
        </form>
        <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                className="text-neutral-800 cursor-pointer dark:text-neutral-200 underline"
                onClick={() => navigate('/register')}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                className="text-neutral-800 cursor-pointer dark:text-neutral-200 underline"
                onClick={() => navigate('/login')}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};