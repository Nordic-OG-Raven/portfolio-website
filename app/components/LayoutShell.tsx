import Header from './Header';
import Footer from './Footer';
import AnimatedBackground from './AnimatedBackground';
import Link from 'next/link';

interface LayoutShellProps {
  children: React.ReactNode;
  showBackButton?: boolean;
}

export function LayoutShell({ children, showBackButton = true }: LayoutShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative">
      <AnimatedBackground />
      <div className="relative z-10">
        <Header />
        <main className="pb-16 pt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {showBackButton && (
              <div className="mb-6">
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Portfolio
                </Link>
              </div>
            )}
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

