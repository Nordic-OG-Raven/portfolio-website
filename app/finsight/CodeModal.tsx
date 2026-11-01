'use client';

import { useEffect } from 'react';

export interface LayerDoc {
  id?: string;
  title: string;
  explanation?: string;
  code: string;
  highlight?: string[];
}

// Renders code with line numbers, dimmed comments, and the "core" lines highlighted in amber
// (a line is highlighted if it contains any of the layer's highlight substrings).
function CodeBlock({ code, highlight }: { code: string; highlight: string[] }) {
  const lines = code.replace(/\s+$/, '').split('\n');
  return (
    <div className="font-mono text-[12.5px] leading-[1.6] min-w-max">
      {lines.map((ln, i) => {
        const hi = highlight.some(h => h && ln.includes(h));
        const comment = /^\s*(--|#)/.test(ln);
        return (
          <div key={i} className={`flex ${hi ? 'bg-amber-400/10' : ''}`}>
            <span
              aria-hidden
              className={`select-none sticky left-0 w-10 shrink-0 pr-3 text-right ${hi ? 'bg-[#15171d] text-amber-500/80' : 'bg-slate-950 text-slate-600'}`}
            >
              {i + 1}
            </span>
            <span className={`pl-3 border-l-2 whitespace-pre ${hi ? 'border-amber-400/70 text-amber-100' : `border-transparent ${comment ? 'text-slate-500' : 'text-slate-200'}`}`}>
              {ln || ' '}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface CodeModalProps {
  doc: LayerDoc;
  subtitle: string;      // the ELT verb: 'extraction' | 'transform' | 'model'
  accentDot: string;     // tailwind bg-* for the layer dot
  onClose: () => void;
}

export default function CodeModal({ doc, subtitle, accentDot, onClose }: CodeModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={doc.title}>
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[86vh] flex flex-col shadow-2xl">
        <div className="px-5 py-3 border-b border-slate-700 shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${accentDot}`} />
            <span className="font-mono text-sm text-slate-200 truncate">{doc.title}</span>
            <span className="font-mono text-xs text-slate-500 shrink-0">· {subtitle}</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="shrink-0 text-slate-400 hover:text-slate-200 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-slate-950">
          <CodeBlock code={doc.code} highlight={doc.highlight || []} />
        </div>
      </div>
    </div>
  );
}
