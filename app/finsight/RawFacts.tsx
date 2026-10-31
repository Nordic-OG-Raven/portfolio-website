'use client';

import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatNumber } from './format';
import type { Company } from './types';

interface FilingOption {
  accession: string;
  form: string;
  filing_date: string | null;
  fact_count: number;
}

interface RawFact {
  fact_id: number;
  concept: string;
  label: string | null;
  value_numeric: number | null;
  value_text: string | null;
  unit: string | null;
  period_start: string | null;
  period_end: string | null;
  instant_date: string | null;
  statement_type: string | null;
  is_dimensioned: boolean;
}

interface RawFactsProps {
  companies: Company[];
  loadingCompanies: boolean;
  API_BASE: string;
}

const PAGE_SIZE = 50;

// Bronze drill-down: the raw XBRL facts of one filing, exactly as filed.
export default function RawFacts({ companies, loadingCompanies, API_BASE }: RawFactsProps) {
  const [ticker, setTicker] = useState('');
  const [filingOptions, setFilingOptions] = useState<FilingOption[]>([]);
  const [accession, setAccession] = useState('');
  const [facts, setFacts] = useState<RawFact[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!ticker && companies.length > 0) setTicker(companies[0].ticker);
  }, [companies, ticker]);

  // Load the filing list for the picker whenever the company changes.
  useEffect(() => {
    if (!ticker) return;
    const controller = new AbortController();
    fetch(`${API_BASE}?path=${encodeURIComponent(`/api/filings/${ticker}`)}`, { signal: controller.signal })
      .then(async res => (res.ok ? res.json() : { filings: [] }))
      .then(data => {
        const opts: FilingOption[] = (data.filings || []).map((f: FilingOption) => ({
          accession: f.accession, form: f.form, filing_date: f.filing_date, fact_count: f.fact_count,
        }));
        setFilingOptions(opts);
        setAccession(opts[0]?.accession || '');
      })
      .catch(err => { if (err.name !== 'AbortError') setFilingOptions([]); });
    return () => controller.abort();
  }, [ticker, API_BASE]);

  // Load the raw facts for the selected filing.
  useEffect(() => {
    if (!ticker || !accession) { setFacts([]); return; }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setPage(0);
    const backendPath = `/api/raw-facts/${ticker}?accession=${encodeURIComponent(accession)}`;
    fetch(`${API_BASE}?path=${encodeURIComponent(backendPath)}`, { signal: controller.signal })
      .then(async res => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
        return body;
      })
      .then(data => { setFacts(data.facts || []); setTruncated(!!data.truncated); })
      .catch(err => { if (err.name !== 'AbortError') { setError(err.message); setFacts([]); } })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [ticker, accession, API_BASE]);

  const totalPages = Math.max(1, Math.ceil(facts.length / PAGE_SIZE));
  const pageFacts = facts.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const factPeriod = (f: RawFact) =>
    f.instant_date || [f.period_start, f.period_end].filter(Boolean).join(' → ') || '-';
  const factValue = (f: RawFact) =>
    f.value_numeric !== null ? formatNumber(f.value_numeric, f.unit || '') : (f.value_text || '-');

  return (
    <div className="space-y-6">
      <Card hover={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
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
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Filing</label>
            <select
              value={accession}
              onChange={(e) => setAccession(e.target.value)}
              disabled={filingOptions.length === 0}
              className="w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-100 focus:ring-2 focus:ring-purple-700 focus:border-transparent disabled:opacity-50"
            >
              {filingOptions.length === 0 ? (
                <option value="">No filings</option>
              ) : (
                filingOptions.map(o => (
                  <option key={o.accession} value={o.accession}>
                    {o.form} · {o.filing_date || '-'} ({o.fact_count.toLocaleString()} facts)
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </Card>

      {loading && (
        <Card hover={false}>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500" />
            Loading raw facts...
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
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-400">
              {facts.length.toLocaleString()} facts{truncated ? ' (showing the first 500)' : ''}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2 text-sm">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="px-2 py-1 bg-slate-700 rounded disabled:opacity-40">←</button>
                <span className="text-slate-400 tabular-nums">{page + 1} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="px-2 py-1 bg-slate-700 rounded disabled:opacity-40">→</button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-3 py-2">Concept</th>
                  <th className="px-3 py-2">Period</th>
                  <th className="px-3 py-2 text-right">Value</th>
                  <th className="px-3 py-2">Statement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {pageFacts.map(f => (
                  <tr key={f.fact_id} className="hover:bg-slate-700/40 align-top">
                    <td className="px-3 py-2 text-sm">
                      <span className="font-mono text-slate-200 break-all">{f.concept}</span>
                      {f.is_dimensioned && <span className="ml-2 text-[10px] text-slate-500 uppercase">segment</span>}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-400 tabular-nums whitespace-nowrap">{factPeriod(f)}</td>
                    <td className="px-3 py-2 text-sm text-right font-mono text-slate-200 tabular-nums whitespace-nowrap">{factValue(f)}</td>
                    <td className="px-3 py-2 text-xs text-slate-400">{f.statement_type || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!loading && !error && facts.length === 0 && accession && (
        <Card hover={false}><p className="text-sm text-slate-400">No facts found for this filing.</p></Card>
      )}
    </div>
  );
}
