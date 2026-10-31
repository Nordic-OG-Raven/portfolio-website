'use client';

import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { formatNumber } from './format';
import type { Company } from './types';

interface CanonicalFact {
  accession: string;
  concept: string;
  canonical_label: string;
  standard_label: string | null;
  value_usd: number | null;
  value_numeric: number | null;
  unit: string | null;
  fiscal_year: number;
  fiscal_period: string | null;
  statement_type: string | null;
}

interface CanonicalFactsProps {
  companies: Company[];
  loadingCompanies: boolean;
  API_BASE: string;
}

const PAGE_SIZE = 50;

// Silver: the conformed fact grain, one row per economic fact with a resolved canonical label.
export default function CanonicalFacts({ companies, loadingCompanies, API_BASE }: CanonicalFactsProps) {
  const [ticker, setTicker] = useState('');
  const [facts, setFacts] = useState<CanonicalFact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!ticker && companies.length > 0) setTicker(companies[0].ticker);
  }, [companies, ticker]);

  useEffect(() => {
    if (!ticker) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setPage(0);
    fetch(`${API_BASE}?path=${encodeURIComponent(`/api/canonical-facts/${ticker}`)}`, { signal: controller.signal })
      .then(async res => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
        return body;
      })
      .then(data => setFacts(data.facts || []))
      .catch(err => { if (err.name !== 'AbortError') { setError(err.message); setFacts([]); } })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [ticker, API_BASE]);

  const totalPages = Math.max(1, Math.ceil(facts.length / PAGE_SIZE));
  const pageFacts = facts.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const humanize = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="space-y-6">
      <Card hover={false}>
        <div className="flex flex-wrap items-end gap-4 justify-between">
          <div className="min-w-[220px]">
            <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
            <select
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              disabled={loadingCompanies || companies.length === 0}
              className="w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-100 focus:ring-2 focus:ring-purple-700 focus:border-transparent disabled:opacity-50"
            >
              {companies.length === 0 ? (
                <option value="">Loading companies...</option>
              ) : (
                companies.map(c => <option key={c.ticker} value={c.ticker}>{c.name} ({c.ticker})</option>)
              )}
            </select>
          </div>
          {!loading && facts.length > 0 && (
            <p className="text-sm text-slate-400">{facts.length.toLocaleString()} canonical facts</p>
          )}
        </div>
      </Card>

      {loading && (
        <Card hover={false}>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500" />
            Loading canonical facts...
          </div>
        </Card>
      )}

      {!loading && error && (
        <div className="bg-red-500/20 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && facts.length > 0 && (
        <Card hover={false} className="overflow-hidden">
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 text-sm mb-3">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="px-2 py-1 bg-slate-700 rounded disabled:opacity-40">←</button>
              <span className="text-slate-400 tabular-nums">{page + 1} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="px-2 py-1 bg-slate-700 rounded disabled:opacity-40">→</button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-3 py-2">Canonical label</th>
                  <th className="px-3 py-2">Concept</th>
                  <th className="px-3 py-2">Period</th>
                  <th className="px-3 py-2 text-right">Value (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {pageFacts.map((f, i) => (
                  <tr key={`${f.accession}-${f.concept}-${f.fiscal_year}-${f.fiscal_period}-${i}`} className="hover:bg-slate-700/40">
                    <td className="px-3 py-2 text-sm text-slate-100">{humanize(f.canonical_label)}</td>
                    <td className="px-3 py-2 text-xs font-mono text-slate-400 break-all">{f.concept}</td>
                    <td className="px-3 py-2 text-sm text-slate-400 tabular-nums whitespace-nowrap">
                      {f.fiscal_year}{f.fiscal_period ? ` ${f.fiscal_period}` : ''}
                    </td>
                    <td className="px-3 py-2 text-sm text-right font-mono text-slate-200 tabular-nums whitespace-nowrap">
                      {formatNumber(f.value_usd ?? f.value_numeric ?? null, f.unit || 'USD')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!loading && !error && facts.length === 0 && ticker && (
        <Card hover={false}><p className="text-sm text-slate-400">No canonical facts found for {ticker}.</p></Card>
      )}
    </div>
  );
}
