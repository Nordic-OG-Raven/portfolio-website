'use client';

import { Card } from '../components/ui/Card';
import { FINSIGHT_NAV, LAYER_ACCENT, type Layer } from './finsightNav';

const LAYER_DETAIL: Record<Layer, { source: string; note: string }> = {
  bronze: { source: 'bronze.raw_filings · bronze.raw_facts', note: 'Raw XBRL, exactly as filed' },
  silver: { source: 'stg_facts · fct_financial_facts', note: 'Converted to USD, deduped, canonical labels' },
  gold: { source: 'v_facts_hierarchical · earnings · segments', note: 'Denormalized, carries the accession' },
  intelligence: { source: 'statements · forecast · ask', note: 'The apps you use' },
};

// Silver: a static visual of how a number flows bronze -> silver -> gold -> intelligence, and
// how the trace walks that path back to the source filing.
export default function LineageMap() {
  const layers = FINSIGHT_NAV.map(g => g.layer);

  return (
    <Card hover={false}>
      <h2 className="text-xl font-bold text-slate-100 mb-1">Lineage map</h2>
      <p className="text-sm text-slate-400 mb-6">
        Every number flows left to right through the layers. Turn Provenance on in any statement to
        walk that path back, right to left, to the exact SEC filing it came from.
      </p>

      <div className="flex flex-col lg:flex-row items-stretch gap-3">
        {layers.map((layer, i) => {
          const accent = LAYER_ACCENT[layer];
          const detail = LAYER_DETAIL[layer];
          return (
            <div key={layer} className="flex flex-col lg:flex-row items-stretch gap-3 lg:flex-1">
              <div className={`flex-1 rounded-xl border border-slate-700 bg-slate-900/60 p-4 ring-1 ${accent.ring}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${accent.dot}`} />
                  <span className={`text-sm font-bold capitalize ${accent.text}`}>{layer}</span>
                </div>
                <p className="text-sm text-slate-200 mb-2">{detail.note}</p>
                <p className="text-[11px] font-mono text-slate-500 break-words">{detail.source}</p>
              </div>
              {i < layers.length - 1 && (
                <div className="flex items-center justify-center text-slate-600" aria-hidden="true">
                  {/* down arrow on mobile, right arrow on desktop */}
                  <svg className="w-5 h-5 rotate-90 lg:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        The trace reverses this flow: gold value → silver canonical fact → bronze raw fact → the filing on EDGAR.
      </div>
    </Card>
  );
}
