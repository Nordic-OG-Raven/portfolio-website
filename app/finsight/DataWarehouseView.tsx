'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Company {
  ticker: string;
  name: string;
  years: number[];
}

interface DataRow {
  company: string;
  concept: string;
  normalized_label: string;
  fiscal_year: number | null;
  value_numeric: number | null;
  value_text: string | null;
  unit_measure: string;
  hierarchy_level: number | null;
  axis_name: string | null;
  member_name: string | null;
  data_type: string | null;
  period_label: string | null;
  period_end: string | null;
}

interface DataWarehouseViewProps {
  companies: Company[];
  API_BASE: string;
}

export default function DataWarehouseView({ companies, API_BASE }: DataWarehouseViewProps) {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState<[number, number]>([2023, 2024]);
  const [granularity, setGranularity] = useState<number>(3); // 3=universal, 2=specific, 1=all
  const [availableMetrics, setAvailableMetrics] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [showSegments, setShowSegments] = useState(false);
  const [showAllConcepts, setShowAllConcepts] = useState(false);
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available metrics when companies/year change
  useEffect(() => {
    if (selectedCompanies.length === 0) {
      setAvailableMetrics([]);
      return;
    }

    const fetchMetrics = async () => {
      try {
        const res = await fetch(`${API_BASE}?path=/api/metrics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companies: selectedCompanies,
            start_year: yearRange[0],
            end_year: yearRange[1],
          }),
        });
        const result = await res.json();
        if (result.success) {
          setAvailableMetrics(result.metrics || []);
        }
      } catch (err) {
        console.error('Failed to load metrics:', err);
      }
    };

    fetchMetrics();
  }, [selectedCompanies, yearRange, API_BASE]);

  // Initialize with first few companies
  useEffect(() => {
    if (companies.length > 0 && selectedCompanies.length === 0) {
      setSelectedCompanies(companies.slice(0, 5).map(c => c.ticker));
    }
  }, [companies]);

  const handleLoadData = async () => {
    if (selectedCompanies.length === 0) {
      setError('Please select at least one company');
      return;
    }

    setLoading(true);
    setError(null);

    try {
        const res = await fetch(`${API_BASE}?path=/api/data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companies: selectedCompanies,
            start_year: yearRange[0],
            end_year: yearRange[1],
            concepts: selectedMetrics.length > 0 ? selectedMetrics : undefined,
            show_segments: showSegments,
            min_hierarchy_level: granularity,
            show_all_concepts: showAllConcepts,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: `Backend returned ${res.status}` }));
          throw new Error(errorData.error || `Backend returned ${res.status}`);
        }

        const result = await res.json();
        if (result.success) {
          setData(result.data || []);
        } else {
          setError(result.error || 'Failed to load data');
        }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: number | null, unit: string = 'USD') => {
    if (value === null) return 'N/A';
    const absValue = Math.abs(value);
    if (absValue >= 1e9) return `${(value / 1e9).toFixed(2)}B ${unit}`;
    if (absValue >= 1e6) return `${(value / 1e6).toFixed(2)}M ${unit}`;
    if (absValue >= 1e3) return `${(value / 1e3).toFixed(2)}K ${unit}`;
    return `${value.toFixed(2)} ${unit}`;
  };

  const humanizeLabel = (label: string) => {
    return label
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const exportCSV = () => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify((row as any)[h] || '')).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finsight_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    if (data.length === 0) return;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finsight_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Prepare chart data
  const timeSeriesData = selectedCompanies.length === 1 && selectedMetrics.length > 0
    ? data
        .filter(d => d.value_numeric !== null && selectedMetrics.includes(d.normalized_label))
        .map(d => ({
          year: String(d.fiscal_year),
          [humanizeLabel(d.normalized_label)]: d.value_numeric,
        }))
        .reduce((acc, curr) => {
          const existing = acc.find((a: any) => a.year === curr.year);
          if (existing) {
            Object.assign(existing, curr);
          } else {
            acc.push(curr);
          }
          return acc;
        }, [] as any[])
    : [];

  const crossCompanyData = selectedCompanies.length > 1 && selectedMetrics.length === 1
    ? data
        .filter(d => d.value_numeric !== null && d.normalized_label === selectedMetrics[0])
        .map(d => ({
          company: d.company,
          year: String(d.fiscal_year),
          value: d.value_numeric,
        }))
    : [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Customize Your Analysis</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Companies
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2">
              {companies.map(company => (
                <label key={company.ticker} className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCompanies.includes(company.ticker)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCompanies([...selectedCompanies, company.ticker]);
                      } else {
                        setSelectedCompanies(selectedCompanies.filter(t => t !== company.ticker));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-900 font-medium">{company.name} ({company.ticker})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Year Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fiscal Year Range: {yearRange[0]} - {yearRange[1]}
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="2020"
                max="2025"
                value={yearRange[0]}
                onChange={(e) => setYearRange([Number(e.target.value), yearRange[1]])}
                className="w-full"
              />
              <input
                type="range"
                min="2020"
                max="2025"
                value={yearRange[1]}
                onChange={(e) => setYearRange([yearRange[0], Number(e.target.value)])}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Granularity */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Granularity
          </label>
          <select
            value={granularity}
            onChange={(e) => setGranularity(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value={3}>Universal metrics (totals like Total Assets)</option>
            <option value={2}>Specific metrics (section breakdowns)</option>
            <option value={1}>Very specific metrics (all line items)</option>
          </select>
        </div>

        {/* Metrics Selection */}
        {availableMetrics.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metrics (leave empty for all)
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2">
              {availableMetrics.map(metric => (
                <label key={metric} className="flex items-center space-x-2 p-1 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMetrics([...selectedMetrics, metric]);
                      } else {
                        setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-900">{humanizeLabel(metric)}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Options */}
        <div className="mt-4 space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showSegments}
              onChange={(e) => setShowSegments(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Show segment breakdowns</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showAllConcepts}
              onChange={(e) => setShowAllConcepts(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Auditor view (show all concepts including duplicates)</span>
          </label>
        </div>

        {/* Load Button */}
        <button
          onClick={handleLoadData}
          disabled={loading || selectedCompanies.length === 0}
          className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Load Data'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Data Table */}
      {data.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Data ({data.length.toLocaleString()} rows)
            </h3>
            <div className="space-x-2">
              <button
                onClick={exportCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                📥 CSV
              </button>
              <button
                onClick={exportJSON}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                📥 JSON
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.slice(0, 100).map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm">{row.company}</td>
                    <td className="px-4 py-2 text-sm">{humanizeLabel(row.normalized_label)}</td>
                    <td className="px-4 py-2 text-sm">{row.fiscal_year}</td>
                    <td className="px-4 py-2 text-sm text-right font-mono">
                      {formatNumber(row.value_numeric, row.unit_measure)}
                    </td>
                    <td className="px-4 py-2 text-sm">{row.unit_measure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 100 && (
              <p className="text-sm text-gray-500 mt-2">Showing first 100 rows of {data.length.toLocaleString()}</p>
            )}
          </div>
        </div>
      )}

      {/* Visualizations */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time Series */}
          {timeSeriesData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Time Series</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedMetrics.map((metric, idx) => (
                    <Line
                      key={metric}
                      type="monotone"
                      dataKey={humanizeLabel(metric)}
                      stroke={`hsl(${idx * 60}, 70%, 50%)`}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Cross-Company Comparison */}
          {crossCompanyData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {humanizeLabel(selectedMetrics[0])} by Company
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={crossCompanyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="company" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
