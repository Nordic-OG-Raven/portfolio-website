'use client';

import { useState, useEffect } from 'react';
import { LAYER_ACCENT, type Layer } from './finsightNav';

interface PipelineStats {
  bronze: { filings: number; raw_facts: number; companies: number };
  silver: { conformed_facts: number; canonical_facts: number };
  gold: { served_facts: number };
  intelligence: { forecasts: number; graded: number };
}

interface PipelineOverviewProps {
  API_BASE: string;
  onSelectLayer?: (layer: Layer) => void;
}

const abbrev = (n: number): string => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
};

// A live visual of the medallion pipeline: a funnel from the raw SEC facts down to the forecasts,
// with real row counts per layer. The headline illustration of what FinSight is.
export default function PipelineOverview({ API_BASE, onSelectLayer }: PipelineOverviewProps) {
  const [stats, setStats] = useState<PipelineStats | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}?path=${encodeURIComponent('/api/pipeline-stats')}`, { signal: controller.signal })
      .then(res => (res.ok ? res.json() : null))
      .then(d => { if (d && !d.error) setStats(d); })
      .catch(() => {});
    return () => controller.abort();
  }, [API_BASE]);

  const stages: Array<{ layer: Layer; big: number; bigLabel: string; sub: string }> = stats
    ? [
        { layer: 'bronze', big: stats.bronze.raw_facts, bigLabel: 'raw facts', sub: `${stats.bronze.filings} filings · ${stats.bronze.companies} companies` },
        { layer: 'silver', big: stats.silver.conformed_facts, bigLabel: 'conformed facts', sub: `${stats.silver.canonical_facts.toLocaleString()} canonical` },
        { layer: 'gold', big: stats.gold.served_facts, bigLabel: 'served facts', sub: 'indexed for the apps' },
        { layer: 'intelligence', big: stats.intelligence.forecasts, bigLabel: 'forecasts', sub: `${stats.intelligence.graded} graded vs actuals` },
      ]
    : [];

  const maxLog = stages.length ? Math.log10(Math.max(...stages.map(s => s.big || 1))) : 1;

  return (
    <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-5 mb-6">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">The pipeline, live</h2>
        <span className="text-xs text-slate-500">every number below traces back to a SEC filing</span>
      </div>

      {/* Stage tiles with connecting flow */}
      <div className="flex flex-col lg:flex-row items-stretch gap-2">
        {stages.length === 0
          ? [0, 1, 2, 3].map(i => <div key={i} className="flex-1 h-24 rounded-lg bg-slate-700/30 animate-pulse" />)
          : stages.map((s, i) => {
              const accent = LAYER_ACCENT[s.layer];
              return (
                <div key={s.layer} className="flex flex-col lg:flex-row items-stretch gap-2 lg:flex-1">
                  <button
                    onClick={() => onSelectLayer?.(s.layer)}
                    className={`flex-1 text-left rounded-lg border border-slate-700 bg-slate-900/60 p-4 transition-colors hover:border-slate-500 ring-1 ${accent.ring}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-block w-2 h-2 rounded-full ${accent.dot}`} />
                      <span className={`text-xs font-bold uppercase tracking-wide ${accent.text}`}>{s.layer}</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-100 font-mono tabular-nums leading-tight">
                      {s.big.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">{s.bigLabel}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{s.sub}</div>
                  </button>
                  {i < stages.length - 1 && (
                    <div className="flex items-center justify-center text-slate-600 shrink-0" aria-hidden="true">
                      <svg className="w-5 h-5 rotate-90 lg:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
      </div>

      {/* Funnel bar — log-scaled widths show the refinement from 500k facts to a few hundred forecasts */}
      {stages.length > 0 && (
        <div className="mt-4 flex items-center gap-1 h-2.5">
          {stages.map(s => {
            const w = Math.max(14, (Math.log10(s.big || 1) / maxLog) * 100);
            const accent = LAYER_ACCENT[s.layer];
            return <div key={s.layer} className={`h-full rounded-full ${accent.dot}`} style={{ width: `${w}%` }} title={`${s.layer}: ${s.big.toLocaleString()}`} />;
          })}
        </div>
      )}
    </div>
  );
}
