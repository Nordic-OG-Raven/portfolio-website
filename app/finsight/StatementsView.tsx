'use client';

import { useState, useEffect } from 'react';
import FinancialStatements from './FinancialStatements';
import { Card } from '../components/ui/Card';
import type { Company } from './types';

interface StatementsViewProps {
  companies: Company[];
  loadingCompanies: boolean;
  API_BASE: string;
}

// Gold view: pick a company + year, render the full hierarchical statements. Promotes the
// statements (previously reachable only inside a company analysis) to a first-class view.
export default function StatementsView({ companies, loadingCompanies, API_BASE }: StatementsViewProps) {
  const [ticker, setTicker] = useState('');
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    if (!ticker && companies.length > 0) {
      setTicker(companies[0].ticker);
      setYear(companies[0].years[0]);
    }
  }, [companies, ticker]);

  const selected = companies.find(c => c.ticker === ticker);

  return (
    <div className="space-y-6">
      <Card hover={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
            <select
              value={ticker}
              onChange={(e) => {
                setTicker(e.target.value);
                const c = companies.find(x => x.ticker === e.target.value);
                if (c) setYear(c.years[0]);
              }}
              disabled={loadingCompanies || companies.length === 0}
              className="w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-100 focus:ring-2 focus:ring-purple-700 focus:border-transparent disabled:opacity-50"
            >
              {companies.length === 0 ? (
                <option value="">Loading companies...</option>
              ) : (
                companies.map(c => (
                  <option key={c.ticker} value={c.ticker}>{c.name} ({c.ticker})</option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Year</label>
            <select
              value={year ?? ''}
              onChange={(e) => setYear(Number(e.target.value))}
              disabled={loadingCompanies || !ticker}
              className="w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-100 focus:ring-2 focus:ring-purple-700 focus:border-transparent disabled:opacity-50"
            >
              {!selected ? (
                <option value="">Select a company first</option>
              ) : (
                selected.years.map(y => <option key={y} value={y}>{y}</option>)
              )}
            </select>
          </div>
        </div>
      </Card>

      {ticker && year && (
        <FinancialStatements ticker={ticker} year={year} API_BASE={API_BASE} />
      )}
    </div>
  );
}
