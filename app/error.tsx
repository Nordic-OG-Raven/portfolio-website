'use client';

import { useEffect } from 'react';
import { Button } from './components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-slate-800 rounded-lg p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong!</h2>
          <p className="text-slate-300 mb-6">{error.message || 'An unexpected error occurred'}</p>
          <div className="flex gap-4">
            <Button onClick={reset} className="flex-1">
              Try again
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="secondary"
              className="flex-1"
            >
              Go home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

