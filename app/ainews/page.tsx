'use client';

import MASFlow from '../components/MASFlow';
import { LayoutShell } from '../components/LayoutShell';
import { Card } from '../components/ui/Card';

export default function AInewsPage() {
  return (
    <LayoutShell>
      {/* TITLE */}
      <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6 text-center">
        Multi-Agent System (MAS) for AI Research and News Curation
      </h1>

      {/* LINK TO COMPANY PAGE */}
      <p className="text-center text-slate-400 mb-8 text-lg">
        To follow along the news letter and have a read,{' '}
        <a 
          href="https://www.linkedin.com/company/nordic-raven-solutions/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-purple-700 hover:text-purple-600 font-semibold transition-colors"
        >
          follow this link
        </a>
        , or visit @NordicRavenSolutions on linkedin
      </p>

      {/* PERFORMANCE METRICS HEADING */}
      <h2 className="text-2xl font-bold text-slate-100 mb-4 text-center">Performance Metrics</h2>

      {/* PERFORMANCE METRICS */}
      <Card className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-500/20 border border-blue-500/50 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm mb-1">Articles Processed</p>
            <p className="text-3xl font-bold text-blue-500">150 → 6</p>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/50 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm mb-1">Rejection Rate</p>
            <p className="text-3xl font-bold text-emerald-500">96%</p>
          </div>
          <div className="bg-amber-500/20 border border-amber-500/50 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm mb-1">Components</p>
            <p className="text-3xl font-bold text-amber-500">11</p>
          </div>
          <div className="bg-orange-500/20 border border-orange-500/50 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm mb-1">Cost/Daily Digest</p>
            <p className="text-3xl font-bold text-orange-500">~$0.50</p>
          </div>
        </div>
      </Card>

      {/* HOW IT WORKS HEADING */}
      <h2 className="text-2xl font-bold text-slate-100 mb-4 text-center">How It Works</h2>

      {/* INSTRUCTION */}
      <p className="text-slate-400 mb-6 text-center">Click any component for details</p>

      {/* Interactive Flow Diagram */}
      <Card className="mb-8">
        <MASFlow />
      </Card>

      {/* Footer */}
      <div className="mt-8">
        <Card className="bg-gradient-to-r from-purple-700/10 to-purple-700/5 border-purple-700/20">
          <p className="text-slate-400 text-sm text-center">
            • Open source • AI-powered but quality focused • In the spirit of continuous learning
          </p>
        </Card>
      </div>
    </LayoutShell>
  );
}

