'use client';

import { useState } from 'react';

export default function Footer() {
  const [heartClicked, setHeartClicked] = useState(false);

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-300 py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Bottom Bar */}
        <div className="text-center text-slate-400 text-sm">
          <p className="flex items-center justify-center gap-2">
            Made with
            <button
              onClick={() => setHeartClicked(!heartClicked)}
              className="inline-flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label="Heart"
            >
              <svg
                className={`w-5 h-5 transition-colors ${
                  heartClicked ? 'text-white fill-white' : 'text-white fill-none'
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            by Jonas H.
          </p>
        </div>
      </div>
    </footer>
  );
}

