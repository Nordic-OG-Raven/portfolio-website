'use client';

import { useState, useEffect } from 'react';
import { LAYER_ACCENT, type Layer } from './finsightNav';
import TagConvergence from './TagConvergence';
import CodeModal, { type LayerDoc } from './CodeModal';

const ORDER: Layer[] = ['bronze', 'silver', 'gold', 'intelligence'];

const LABEL: Record<Layer, string> = {
  bronze: 'Bronze', silver: 'Silver', gold: 'Gold', intelligence: 'Intelligence',
};

// One short line per layer, so you always know what you're looking at. Bronze/Silver are framed as
// "see how it's made" (demonstration layers); Gold/Intelligence stay light — that's the workspace.
const EXPLAIN: Record<Layer, string> = {
  bronze: 'Raw SEC filings, exactly as filed. Nothing cleaned yet — this is the evidence everything else is built from.',
  silver: 'The raw facts cleaned: converted to USD, deduped to the latest filing, and given shared labels so they line up across companies.',
  gold: 'The read-optimized layer the apps query. Each number keeps a link back to its source filing.',
  intelligence: 'The apps built on the data: ask a question, forecast earnings, and the live track record.',
};

// id in /api/lineage/layers + the ELT verb shown on the code button (Bronze extracts, not transforms).
const CODE_ID: Record<Layer, string> = { bronze: 'bronze', silver: 'silver', gold: 'gold', intelligence: 'intelligence' };
const VERB: Record<Layer, string> = { bronze: 'extraction', silver: 'transform', gold: 'transform', intelligence: 'model' };

interface PipelineStats {
  bronze: { filings: number; raw_facts: number; companies: number };
  silver: { conformed_facts: number };
  gold: { served_facts: number; marts?: number };
  intelligence: { forecasts: number; graded: number };
}

const abbrev = (n: number): string =>
  n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : String(n);

function statLine(layer: Layer, s: PipelineStats): string {
  switch (layer) {
    case 'bronze': return `${abbrev(s.bronze.raw_facts)} raw facts · ${s.bronze.filings} filings · ${s.bronze.companies} companies`;
    case 'silver': return `${abbrev(s.silver.conformed_facts)} conformed facts`;
    case 'gold': return `${s.gold.marts ?? 9} serving marts · ${abbrev(s.gold.served_facts)} served facts`;
    case 'intelligence': return `${s.intelligence.forecasts} forecasts logged · ${s.intelligence.graded} graded`;
  }
}

interface LayerIntroProps {
  layer: Layer;
  API_BASE: string;
}

export default function LayerIntro({ layer, API_BASE }: LayerIntroProps) {
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [docs, setDocs] = useState<Record<string, LayerDoc>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const accent = LAYER_ACCENT[layer];
  const doc = docs[CODE_ID[layer]];

  useEffect(() => {
    const c = new AbortController();
    fetch(`${API_BASE}?path=${encodeURIComponent('/api/pipeline-stats')}`, { signal: c.signal })
      .then(r => (r.ok ? r.json() : null)).then(d => { if (d && !d.error) setStats(d); }).catch(() => {});
    fetch(`${API_BASE}?path=${encodeURIComponent('/api/lineage/layers')}`, { signal: c.signal })
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d?.layers) setDocs(Object.fromEntries(d.layers.map((l: LayerDoc) => [l.id, l]))); })
      .catch(() => {});
    return () => c.abort();
  }, [API_BASE]);

  return (
    <>
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

        {stats && (
          <p className={`mt-2 text-xs font-mono tabular-nums ${accent.text}`}>{statLine(layer, stats)}</p>
        )}

        {doc && (
          <button
            onClick={() => setModalOpen(true)}
            className={`mt-2 text-xs font-medium ${accent.text} hover:underline`}
          >
            Show the {VERB[layer]}
          </button>
        )}
      </div>

      {/* Silver demonstration: the "many messy tags → one clean number" illustration. */}
      {layer === 'silver' && <TagConvergence />}

      {modalOpen && doc && (
        <CodeModal doc={doc} subtitle={VERB[layer]} accentDot={accent.dot} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
