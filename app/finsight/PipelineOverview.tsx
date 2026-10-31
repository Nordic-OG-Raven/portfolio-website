'use client';

import { useState, useEffect } from 'react';
import { LAYER_ACCENT, type Layer } from './finsightNav';

interface PipelineStats {
  bronze: { filings: number; raw_facts: number; companies: number };
  silver: { conformed_facts: number };
  gold: { served_facts: number; marts?: number };
  intelligence: { forecasts: number; graded: number };
}

interface PipelineOverviewProps {
  API_BASE: string;
  onSelectLayer?: (layer: Layer) => void;
}

const BRONZE = '#d97706', SILVER = '#cbd5e1', GOLD = '#facc15', PURPLE = '#a855f7';

const abbrev = (n: number): string =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `~${Math.round(n / 1e3)}K` : String(n);

// The headline illustration: a 10-K becoming a forecast. Raw bronze facts (scattered) conform to a
// silver grid, consolidate into gold marts (bars), and drive the intelligence forecast (rising line),
// joined by flowing connectors. Counts are live.
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

  const cols: Array<{ layer: Layer; name: string; big: string; cap: string }> = [
    { layer: 'bronze', name: 'Bronze', big: stats ? abbrev(stats.bronze.raw_facts) : '·', cap: 'raw facts, as filed' },
    { layer: 'silver', name: 'Silver', big: '1', cap: 'canonical vocabulary' },
    { layer: 'gold', name: 'Gold', big: stats ? String(stats.gold.marts ?? 9) : '·', cap: 'query-ready marts' },
    { layer: 'intelligence', name: 'Intelligence', big: '∞', cap: 'ask · explore · forecast' },
  ];

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 mb-6">
      <style>{`
        @keyframes fs-dash { to { stroke-dashoffset: -18; } }
        @keyframes fs-pulse { 0%{transform:scale(.6);opacity:.55} 70%{transform:scale(1.9);opacity:0} 100%{opacity:0} }
        @keyframes fs-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @keyframes fs-draw { to { stroke-dashoffset: 0; } }
        @keyframes fs-proj { to { stroke-dashoffset: -16; } }
        .fs-flow { stroke-dasharray:3 6; animation: fs-dash 1.4s linear infinite; }
        .fs-pulse { transform-box: fill-box; transform-origin: center; animation: fs-pulse 2.6s ease-out infinite; }
        .fs-grow { transform-box: fill-box; transform-origin: center bottom; animation: fs-grow .8s cubic-bezier(.2,.8,.2,1) both; }
        .fs-draw { stroke-dasharray: 150; stroke-dashoffset: 150; animation: fs-draw 1.2s ease-out .25s both; }
        .fs-proj { animation: fs-proj .9s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .fs-flow, .fs-pulse, .fs-proj, .fs-grow { animation: none; }
          .fs-draw { animation: none; stroke-dasharray: none; stroke-dashoffset: 0; }
        }
      `}</style>

      <svg viewBox="0 0 1040 230" width="100%" role="img"
        aria-label="Pipeline: raw bronze facts conform through silver and gold into an intelligence forecast">
        {/* flowing connectors */}
        <g stroke={PURPLE} strokeWidth="1.6" opacity="0.8" fill="none">
          <line className="fs-flow" x1="231" y1="115" x2="289" y2="115" />
          <line className="fs-flow" x1="491" y1="115" x2="549" y2="115" />
          <line className="fs-flow" x1="751" y1="115" x2="809" y2="115" />
        </g>
        <g fill={PURPLE} opacity="0.85">
          <path d="M289 115 l-9 -5 v10 z" /><path d="M549 115 l-9 -5 v10 z" /><path d="M809 115 l-9 -5 v10 z" />
        </g>

        {/* bronze: scattered raw facts */}
        <g fill={BRONZE}>
          <circle cx="90" cy="60" r="4" opacity=".9" /><circle cx="140" cy="48" r="3" opacity=".6" /><circle cx="180" cy="72" r="4" opacity=".8" />
          <circle cx="70" cy="100" r="3" opacity=".5" /><circle cx="122" cy="94" r="5" opacity=".9" /><circle cx="170" cy="108" r="3" opacity=".6" />
          <circle cx="96" cy="140" r="4" opacity=".75" /><circle cx="148" cy="136" r="3" opacity=".55" /><circle cx="190" cy="140" r="4" opacity=".85" />
          <circle cx="74" cy="166" r="3" opacity=".5" /><circle cx="126" cy="176" r="4" opacity=".7" /><circle cx="176" cy="170" r="3" opacity=".6" />
          <circle cx="108" cy="118" r="3" opacity=".6" /><circle cx="158" cy="82" r="3" opacity=".5" /><circle cx="134" cy="150" r="3" opacity=".55" />
        </g>

        {/* silver: normalized grid */}
        <g fill={SILVER}>
          {[56, 80, 104, 128, 152].map((y, r) => (
            [351, 373, 395, 417].map(x => (
              <rect key={`${x}-${y}`} x={x} y={y} width="12" height="12" rx="2" opacity={r % 2 ? 0.7 : 0.88} />
            ))
          ))}
        </g>

        {/* gold: consolidated marts (grow on load) */}
        <g fill={GOLD}>
          <rect className="fs-grow" style={{ animationDelay: '0.1s' }} x="598" y="140" width="20" height="40" rx="2" opacity=".7" />
          <rect className="fs-grow" style={{ animationDelay: '0.2s' }} x="626" y="110" width="20" height="70" rx="2" opacity=".85" />
          <rect className="fs-grow" style={{ animationDelay: '0.3s' }} x="654" y="86" width="20" height="94" rx="2" />
          <rect className="fs-grow" style={{ animationDelay: '0.4s' }} x="682" y="124" width="20" height="56" rx="2" opacity=".8" />
        </g>

        {/* intelligence: forecast line (draws in, projection flows out to the pulsing endpoint) */}
        <g>
          <polyline className="fs-draw" points="845,162 871,140 897,146 923,110 949,118" fill="none" stroke={PURPLE} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
          <polyline className="fs-proj" points="949,118 975,82" fill="none" stroke={PURPLE} strokeWidth="2.4" strokeDasharray="4 4" />
          <circle className="fs-pulse" cx="975" cy="82" r="10" fill="none" stroke={PURPLE} strokeWidth="1.2" />
          <circle cx="975" cy="82" r="5" fill={PURPLE} />
        </g>
      </svg>

      {/* live stat labels */}
      <div className="grid grid-cols-4 mt-2">
        {cols.map(c => {
          const accent = LAYER_ACCENT[c.layer];
          return (
            <button
              key={c.layer}
              onClick={() => onSelectLayer?.(c.layer)}
              className="text-center px-1 py-1 rounded-lg hover:bg-slate-700/40 transition-colors"
            >
              <div className={`text-xs font-semibold uppercase tracking-wider ${accent.text}`}>{c.name}</div>
              <div className="text-lg font-bold text-slate-100 font-mono tabular-nums mt-0.5">{c.big}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{c.cap}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
