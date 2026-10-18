'use client';

import { useState, useEffect } from 'react';

// New flat shape served by the FinSight API (GET /api/financials/<ticker>):
// each statement is a list of { label, values: {year: native}, values_usd: {year: usd} }.
interface Line {
  label: string;
  values: Record<string, number | null>;
  values_usd?: Record<string, number | null>;
}
interface Statements {
  income_statement: Line[];
  balance_sheet: Line[];
  cash_flow: Line[];
}
interface FinancialsResponse {
  ticker: string;
  company: string;
  currency: string;
  fiscal_year_end: string | null;
  years: number[];
  statements: Statements;
}

interface FinancialStatementsProps {
  ticker: string;
  year: number;
  API_BASE: string;
}

const SECTIONS: { key: keyof Statements; title: string }[] = [
  { key: 'income_statement', title: 'Income Statement' },
  { key: 'cash_flow', title: 'Cash Flow Statement' },
  { key: 'balance_sheet', title: 'Balance Sheet' },
];

// Line labels that read as totals/subtotals — rendered bold.
const TOTAL_HINTS = ['total', 'net income', 'net loss', 'gross profit', 'operating income',
  'net revenue', 'net sales', 'profit', 'net increase', 'net decrease', 'net cash'];

export default function FinancialStatements({ ticker, API_BASE }: FinancialStatementsProps) {
  const [data, setData] = useState<FinancialsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}?path=/api/financials/${ticker}`);
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || `Backend returned ${res.status}`);
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to load statements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker]);

  // Monetary values are shown in millions; per-share values in full (2 decimals).
  const fmt = (value: number | null | undefined, label: string): string => {
    if (value === null || value === undefined) return '—';
    const neg = value < 0;
    const wrap = (s: string) => (neg ? `(${s})` : s);
    if (label.toLowerCase().includes('per share')) {
      return wrap(Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }
    return wrap((Math.abs(value) / 1e6).toLocaleString('en-US', { maximumFractionDigits: 0 }));
  };

  const fmtFYE = (d: string | null): string => {
    if (!d) return '';
    try {
      const dt = new Date(d);
      return `fiscal year ending ${dt.getDate()} ${dt.toLocaleDateString('en-US', { month: 'long' })}`;
    } catch {
      return '';
    }
  };

  const isTotal = (label: string) => {
    const l = label.toLowerCase();
    return TOTAL_HINTS.some(h => l.includes(h));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading financial statements…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
        <p className="text-sm text-red-700">{error}</p>
        <button onClick={load} className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <button onClick={load} className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Load Financial Statements
        </button>
      </div>
    );
  }

  const years = data.years;
  const latest = years[0];

  const renderTable = (key: keyof Statements, title: string) => {
    const lines = data.statements[key] || [];
    if (lines.length === 0) return null;
    const open = !collapsed.has(key);
    return (
      <div key={key} className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">(in millions of {data.currency}; per-share values in full)</p>
          </div>
          <button
            onClick={() => {
              const next = new Set(collapsed);
              open ? next.add(key) : next.delete(key);
              setCollapsed(next);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {open ? '▼ Collapse' : '▶ Expand'}
          </button>
        </div>

        {open && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider sticky left-0 bg-gray-100 z-10">
                    Item
                  </th>
                  {years.map(y => (
                    <th
                      key={y}
                      className={`px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[120px] ${y === latest ? 'bg-purple-100' : ''}`}
                    >
                      {y}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {lines.map((line, i) => {
                  const bold = isTotal(line.label);
                  return (
                    <tr key={`${line.label}-${i}`} className={`${bold ? 'bg-gray-50 font-bold' : 'hover:bg-gray-50'} border-t border-gray-100`}>
                      <td className={`px-4 py-2.5 text-sm sticky left-0 z-10 ${bold ? 'bg-gray-50 font-bold text-gray-900' : 'bg-white text-gray-900'}`}>
                        {line.label}
                      </td>
                      {years.map(y => {
                        const v = line.values[String(y)];
                        return (
                          <td
                            key={y}
                            className={`px-4 py-2.5 text-sm text-right font-mono ${v !== null && v !== undefined && v < 0 ? 'text-red-600' : 'text-gray-900'} ${bold ? 'font-bold' : ''} ${y === latest ? 'bg-purple-50' : ''}`}
                          >
                            {fmt(v, line.label)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>{data.company} ({data.ticker})</strong> — financial statements, {data.currency}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          {years.join(', ')} · {fmtFYE(data.fiscal_year_end)} · served live from the FinSight warehouse
        </p>
      </div>
      {SECTIONS.map(s => renderTable(s.key, s.title))}
    </div>
  );
}
