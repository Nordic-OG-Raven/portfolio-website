'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  // If not on home page, link to home page with hash, otherwise use hash only
  const getLink = (hash: string) => isHomePage ? hash : `/${hash}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <span className="text-xl font-bold text-slate-100">Jonas</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href={getLink('#about')} className="text-slate-400 hover:text-purple-700 transition-colors">
              About
            </Link>
            <Link href={getLink('#projects')} className="text-slate-400 hover:text-purple-700 transition-colors">
              Projects
            </Link>
            <Link href={getLink('#contact')} className="text-slate-400 hover:text-purple-700 transition-colors">
              Contact
            </Link>
            <a
              href="https://github.com/Nordic-OG-Raven"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              GitHub
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4">
              <Link
                href={getLink('#about')}
                className="block text-slate-400 hover:text-purple-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href={getLink('#projects')}
                className="block text-slate-400 hover:text-purple-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Projects
              </Link>
              <Link
                href={getLink('#contact')}
                className="block text-slate-400 hover:text-purple-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <a
                href="https://github.com/Nordic-OG-Raven"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 transition-colors text-center"
              >
                GitHub
              </a>
            </div>
          )}
      </nav>
    </header>
  );
}

