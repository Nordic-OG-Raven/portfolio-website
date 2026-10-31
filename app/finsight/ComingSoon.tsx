'use client';

import { Card } from '../components/ui/Card';
import { LAYER_ACCENT, type Layer } from './finsightNav';

interface ComingSoonProps {
  layer: Layer;
  title: string;
  blurb: string;
  children?: React.ReactNode;
}

// Placeholder for views whose real implementation lands in a later phase. Keeps the full
// information architecture navigable now; the body is replaced when the view is built.
export default function ComingSoon({ layer, title, blurb, children }: ComingSoonProps) {
  const accent = LAYER_ACCENT[layer];
  return (
    <Card hover={false}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${accent.dot}`} />
        <h2 className="text-xl font-bold text-slate-100">{title}</h2>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-purple-300 bg-purple-700/30 border border-purple-700/50 rounded px-1.5 py-0.5">
          coming soon
        </span>
      </div>
      <p className="text-sm text-slate-400 mb-4">{blurb}</p>
      {children}
    </Card>
  );
}
