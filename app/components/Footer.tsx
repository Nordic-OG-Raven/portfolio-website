'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const [heartClicked, setHeartClicked] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-300 py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        {!isHomePage && (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-slate-100 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/#about" className="text-slate-400 hover:text-purple-700 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="/#projects" className="text-slate-400 hover:text-purple-700 transition-colors">
                    Projects
                  </a>
                </li>
                <li>
                  <a href="/#contact" className="text-slate-400 hover:text-purple-700 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="text-lg font-semibold text-slate-100 mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a
                  href="https://github.com/Nordic-OG-Raven"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-800 hover:bg-purple-700 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="GitHub"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/jh98/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-800 hover:bg-purple-700 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className={`${!isHomePage ? 'border-t border-slate-800 pt-8' : 'pt-0'} text-center text-slate-400 text-sm`}>
          <p className="flex items-center justify-center gap-2">
            Made with
            <button
              onClick={() => setHeartClicked(!heartClicked)}
              className="inline-flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label="Heart"
            >
              <svg
                className={`w-5 h-5 transition-colors ${
                  heartClicked ? 'text-red-500 fill-red-500' : 'text-white fill-none'
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

