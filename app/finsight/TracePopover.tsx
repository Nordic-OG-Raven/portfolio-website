'use client';

import { useEffect, useState } from 'react';
import { formatNumber } from './format';
import { LAYER_ACCENT } from './finsightNav';
import type { FactRef } from './ProvenanceContext';

interface LineageData {
  gold?: {
    normalized_label?: string;
    statement_type?: string;
    period_label?: string;
    value_numeric?: number | null;
    value_usd?: number | null;
    unit?: string;
  } | null;
  silver?: { note?: string };
  bronze?: { accession?: string; concept?: string; value_numeric?: number | null; unit?: string };
  filing?: {
    accession?: string;
    cik?: string;
    form?: string;
    filing_date?: string;
    period_of_report?: string;
    company_name?: string;
  } | null;
  edgar_url?: string | null;
  error?: string;
  message?: string;
}

interface TracePopoverProps {
  API_BASE: string;
  factRef: FactRef;
  anchorRect: DOMRect;
  onClose: () => void;
}

const WIDTH = 360;

export default function TracePopover({ API_BASE, factRef, anchorRect, onClose }: TracePopoverProps) {
  const [data, setData] = useState<LineageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setData(null);

    const fp = factRef.fiscalPeriod ? `&fiscal_period=${encodeURIComponent(factRef.fiscalPeriod)}` : '';
    const backendPath =
      `/api/lineage/${encodeURIComponent(factRef.ticker)}` +
      `?concept=${encodeURIComponent(factRef.concept)}&fiscal_year=${factRef.fiscalYear}${fp}`;
    const url = `${API_BASE}?path=${encodeURIComponent(backendPath)}`;

    fetch(url, { signal: controller.signal })
      .then(async res => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 503) throw new Error('Lineage is warming up. Try again shortly.');
          if (res.status === 404) throw new Error('No source filing found for this number yet.');
          throw new Error(body.error || `Request failed (${res.status})`);
        }
        return body as LineageData;
      })
      .then(setData)
      .catch(err => { if (err.name !== 'AbortError') setError(err.message); })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [API_BASE, factRef.ticker, factRef.concept, factRef.fiscalYear, factRef.fiscalPeriod]);

  // Position below the anchor, clamped to the viewport.
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
  const left = Math.max(8, Math.min(anchorRect.left, vw - WIDTH - 8));
  const top = Math.max(8, Math.min(anchorRect.bottom + 8, vh - 360));

  const goldVal = data?.gold
    ? formatNumber(data.gold.value_usd ?? data.gold.value_numeric ?? null, data.gold.unit || 'USD')
    : null;
  const bronzeVal = data?.bronze
    ? formatNumber(data.bronze.value_numeric ?? null, data.bronze.unit || 'USD')
    : null;

  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Data lineage"
        className="fixed z-50 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl text-slate-200"
        style={{ left, top, width: WIDTH }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-slate-500">Trace to source</div>
            <div className="text-sm font-medium text-slate-100 truncate">
              {factRef.label || factRef.concept}
              {factRef.displayValue ? <span className="text-slate-400"> · {factRef.displayValue}</span> : null}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-2 shrink-0 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {loading && (
            <div className="flex items-center gap-3 py-4 text-sm text-slate-400">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500" />
              Tracing lineage...
            </div>
          )}

          {!loading && error && (
            <p className="text-sm text-amber-400 py-2">{error}</p>
          )}

          {!loading && !error && data && (
            <ol className="space-y-3">
              <TraceStep layer="gold" title="Gold · serving"
                lines={[goldVal && `${goldVal}`, data.gold?.statement_type, data.gold?.period_label].filter(Boolean) as string[]} />
              <TraceStep layer="silver" title="Silver · conformed"
                lines={[data.gold?.normalized_label, data.silver?.note].filter(Boolean) as string[]} />
              <TraceStep layer="bronze" title="Bronze · raw fact"
                lines={[bronzeVal && `${bronzeVal} (as filed)`, data.bronze?.concept].filter(Boolean) as string[]} />
              <TraceStep layer="bronze" title="Source filing"
                lines={[
                  [data.filing?.form, data.filing?.filing_date].filter(Boolean).join(' · '),
                  data.filing?.company_name,
                  data.filing?.accession,
                ].filter(Boolean) as string[]} />
            </ol>
          )}

          {!loading && !error && data?.edgar_url && (
            <a
              href={data.edgar_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-3 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors w-full justify-center"
            >
              Open the filing on SEC EDGAR
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </>
  );
}

function TraceStep({ layer, title, lines }: { layer: 'bronze' | 'silver' | 'gold'; title: string; lines: string[] }) {
  const accent = LAYER_ACCENT[layer];
  return (
    <li className="flex gap-3">
      <span className={`mt-1 inline-block w-2.5 h-2.5 rounded-full shrink-0 ${accent.dot}`} />
      <div className="min-w-0">
        <div className={`text-xs font-semibold uppercase tracking-wide ${accent.text}`}>{title}</div>
        {lines.map((l, i) => (
          <div key={i} className="text-sm text-slate-300 break-words">{l}</div>
        ))}
      </div>
    </li>
  );
}
