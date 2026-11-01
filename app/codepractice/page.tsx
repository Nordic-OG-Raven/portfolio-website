'use client';

import Image from 'next/image';
import { LayoutShell } from '../components/LayoutShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const LIVE_URL = 'https://codetutor.jonashaahr.com';

const skills = ['Gen-AI (Gemini 1.5)', 'NLP', 'React', 'Vite', 'Tailwind CSS', 'Pyodide', 'SQL.js'];

export default function CodePracticePage() {
  return (
    <LayoutShell>
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">In-browser AI tutor for Python and SQL</h1>
        <p className="text-lg text-slate-400 max-w-3xl">
          Runs your code and gives real-time AI feedback, entirely in the browser.
        </p>
      </div>

      <Card className="mb-8">
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden mb-6">
          <Image src="/codetutor.png" alt="CodePractice.AI" fill className="object-cover" sizes="100vw" priority />
        </div>
        <a href={LIVE_URL} target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="primary" className="w-full justify-center">Launch the live app →</Button>
        </a>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Overview</h2>
        <p className="text-slate-400 leading-relaxed">
          A mobile-first application that uses Gemini 1.5 to give intelligent, real-time feedback on user-submitted
          Python and SQL code. It runs code fully in the browser, with no backend dependencies.
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Highlights</h2>
        <ul className="list-disc list-inside space-y-2 text-slate-400">
          <li>Real-time, intelligent feedback on Python and SQL, powered by Gemini 1.5.</li>
          <li>Executes code entirely in the browser (Pyodide for Python, SQL.js for SQL) with no backend.</li>
          <li>Mobile-first interface, so it works anywhere.</li>
        </ul>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Built with</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s} className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded-md">{s}</span>
          ))}
        </div>
      </Card>
    </LayoutShell>
  );
}
