'use client';

import { useEffect } from 'react';
import { Button } from '../components/ui/Button';

export default function FinSightError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('FinSight Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800 rounded-lg p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-red-400 mb-4">FinSight Error</h2>
          <p className="text-slate-300 mb-2">
            {error.message || 'An error occurred while loading financial data'}
          </p>
          {error.message?.includes('Failed to fetch') && (
            <p className="text-sm text-slate-400 mb-6">
              Make sure the Flask API is running at http://localhost:5000
            </p>
          )}
          <div className="flex gap-4">
            <Button onClick={reset} className="flex-1">
              Try again
            </Button>
            <Button
              onClick={() => window.location.href = '/finsight'}
              variant="secondary"
              className="flex-1"
            >
              Reload page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

