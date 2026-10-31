'use client';

import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import type { Company } from './types';

interface Filing {
  accession: string;
  cik: string;
  company_name: string;
  form: string;
  filing_date: string | null;
  period_of_report: string | null;
  fact_count: number;
  edgar_url: string | null;
}

interface FilingsBrowserProps {
  companies: Company[];
  loadingCompanies: boolean;
  API_BASE: string;
}

// Bronze: every SEC filing ingested for a company, newest first, linked straight to EDGAR.
export default function FilingsBrowser({ companies, loadingCompanies, API_BASE }: FilingsBrowserProps) {
  const [ticker, setTicker] = useState('');
  const [filings, setFilings] = useState<Filing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker && companies.length > 0) setTicker(companies[0].ticker);
  }, [companies, ticker]);

  useEffect(() => {
    if (!ticker) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}?path=${encodeURIComponent(`/api/filings/${ticker}`)}`, { signal: controller.signal })
      .then(async res => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
        return body;
      })
      .then(data => setFilings(data.filings || []))
      .catch(err => { if (err.name !== 'AbortError') { setError(err.message); setFilings([]); } })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [ticker, API_BASE]);

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
          {!loading && filings.length > 0 && (
            <p className="text-sm text-slate-400">{filings.length} filings ingested</p>
          )}
        </div>
      </Card>

      {loading && (
        <Card hover={false}>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500" />
            Loading filings...
          </div>
        </Card>
      )}

      {!loading && error && (
        <div className="bg-red-500/20 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && filings.length > 0 && (
        <Card hover={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-3 py-2">Form</th>
                  <th className="px-3 py-2">Filed</th>
                  <th className="px-3 py-2">Period</th>
                  <th className="px-3 py-2 text-right">Facts</th>
                  <th className="px-3 py-2 text-right">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filings.map(f => (
                  <tr key={f.accession} className="hover:bg-slate-700/40">
                    <td className="px-3 py-2"><Badge variant="default">{f.form}</Badge></td>
                    <td className="px-3 py-2 text-sm text-slate-200 tabular-nums">{f.filing_date || '—'}</td>
                    <td className="px-3 py-2 text-sm text-slate-400 tabular-nums">{f.period_of_report || '—'}</td>
                    <td className="px-3 py-2 text-sm text-slate-200 text-right tabular-nums">{f.fact_count.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">
                      {f.edgar_url ? (
                        <a
                          href={f.edgar_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          EDGAR
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : <span className="text-slate-600 text-sm">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!loading && !error && filings.length === 0 && ticker && (
        <Card hover={false}><p className="text-sm text-slate-400">No filings found for {ticker}.</p></Card>
      )}
    </div>
  );
}
