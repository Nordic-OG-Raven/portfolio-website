'use client';

import { useState } from 'react';
import { LAYER_ACCENT, type Layer } from './finsightNav';

const ORDER: Layer[] = ['bronze', 'silver', 'gold', 'intelligence'];

const LABEL: Record<Layer, string> = {
  bronze: 'Bronze', silver: 'Silver', gold: 'Gold', intelligence: 'Intelligence',
};

// One short line per layer, so you always know what you're looking at.
const EXPLAIN: Record<Layer, string> = {
  bronze: 'Raw SEC filings, exactly as filed. Nothing cleaned yet.',
  silver: 'The raw facts cleaned: converted to USD, deduped to the latest filing, and given shared labels so they line up across companies.',
  gold: 'The read-optimized layer the apps query. Each number keeps a link back to its source filing.',
  intelligence: 'The apps built on the data: ask a question, forecast earnings, and the live track record.',
};

// id used by /api/lineage/layers (intelligence has no transform code)
const CODE_ID: Partial<Record<Layer, string>> = { bronze: 'bronze', silver: 'silver', gold: 'gold' };

interface LayerIntroProps {
  layer: Layer;
  API_BASE: string;
}

export default function LayerIntro({ layer, API_BASE }: LayerIntroProps) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const accent = LAYER_ACCENT[layer];
  const codeId = CODE_ID[layer];

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && code === null && codeId) {
      fetch(`${API_BASE}?path=${encodeURIComponent('/api/lineage/layers')}`)
        .then(res => (res.ok ? res.json() : null))
        .then(d => {
          const entry = d?.layers?.find((l: { id: string }) => l.id === codeId);
          setCode(entry?.code || 'unavailable');
        })
        .catch(() => setCode('unavailable'));
    }
  };

  return (
    <div className="mb-4 rounded-xl border border-slate-700 bg-slate-800 p-4">
      {/* mini pipeline position */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {ORDER.map((l, i) => {
          const a = LAYER_ACCENT[l];
          const here = l === layer;
          return (
            <span key={l} className="flex items-center gap-1.5">
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${here ? 'bg-slate-700' : ''}`}>
                <span className={`inline-block w-2 h-2 rounded-full ${here ? a.dot : 'bg-slate-600'}`} />
                <span className={here ? `font-semibold ${a.text}` : 'text-slate-500'}>{LABEL[l]}</span>
              </span>
              {i < ORDER.length - 1 && (
                <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </span>
          );
        })}
      </div>

      <p className="text-sm text-slate-300 leading-relaxed">{EXPLAIN[layer]}</p>

      {codeId && (
        <>
          <button
            onClick={toggle}
            className={`mt-2 text-xs font-medium ${accent.text} hover:underline`}
          >
            {open ? 'Hide the transform' : 'Show the transform'}
          </button>
          {open && (
            <div className="mt-2 overflow-x-auto rounded-lg border border-slate-700 bg-slate-900">
              <pre className="p-3 text-xs leading-relaxed text-slate-300 font-mono whitespace-pre">
                {code ?? 'Loading…'}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
