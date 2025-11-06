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
  const [selectedYear, setSelectedYear] = useState<number>(2024); // Single year for cross-company comparison
  const [granularity, setGranularity] = useState<number>(3); // 3=universal, 2=specific, 1=all
  const [availableMetrics, setAvailableMetrics] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [showSegments, setShowSegments] = useState(false);
  const [showAllConcepts, setShowAllConcepts] = useState(false);
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // For cross-company comparison: rows = metrics, columns = companies (single year)
  const isCrossCompanyView = selectedCompanies.length > 1;

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
            start_year: selectedYear,
            end_year: selectedYear, // Single year for comparison
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
  }, [selectedCompanies, selectedYear, API_BASE]);

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
            start_year: selectedYear,
            end_year: selectedYear, // Single year for cross-company comparison
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
    
    // Normalize unit: "pure" → "%" for percentages
    const normalizedUnit = unit === 'pure' ? '%' : unit;
    
    // Format large numbers with B/M suffix
    const absValue = Math.abs(value);
    let formatted: string;
    if (absValue >= 1e9) {
      formatted = `${(value / 1e9).toFixed(2)}B`;
    } else if (absValue >= 1e6) {
      formatted = `${(value / 1e6).toFixed(2)}M`;
    } else if (absValue >= 1e3) {
      formatted = `${(value / 1e3).toFixed(2)}K`;
    } else {
      formatted = normalizedUnit === '%' ? `${value.toFixed(2)}` : `${value.toFixed(2)}`;
    }
    
    // Always append unit after the number
    return `${formatted} ${normalizedUnit}`;
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

          {/* Year Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isCrossCompanyView 
                ? `Fiscal Year (for comparison): ${selectedYear}`
                : `Fiscal Year: ${selectedYear}`}
            </label>
            {isCrossCompanyView && (
              <p className="text-xs text-gray-600 mb-2">
                Cross-company comparison shows one year at a time. Use Single Company Analysis for multi-year trends.
              </p>
            )}
            <input
              type="range"
              min="2020"
              max="2025"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>2020</span>
              <span>2025</span>
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
            {isCrossCompanyView ? (
              // Bloomberg format for cross-company: Rows = Metrics, Columns = Companies
              (() => {
                // Group by normalized_label, then by company
                const metricsByLabel: Record<string, Record<string, DataRow>> = {};
                
                // Infer statement type for grouping
                const inferStatementType = (label: string, periodType: string | null): string => {
                  if (!label) return 'Other';
                  const labelLower = label.toLowerCase();
                  const isInstant = periodType === 'instant';
                  
                  if (isInstant || labelLower.includes('asset') || labelLower.includes('liabilit') || 
                      labelLower.includes('equity') || labelLower.includes('cash') || labelLower.includes('debt')) {
                    return 'Balance Sheet';
                  }
                  if (labelLower.includes('revenue') || labelLower.includes('income') || labelLower.includes('profit') ||
                      labelLower.includes('earnings') || labelLower.includes('eps') || labelLower.includes('expense')) {
                    return 'Income Statement';
                  }
                  if (labelLower.includes('cash_flow') || labelLower.includes('cashflow') || labelLower.includes('capex')) {
                    return 'Cash Flow';
                  }
                  return 'Other';
                };
                
                // Build map: label -> company -> row
                data.forEach(row => {
                  const label = row.normalized_label || '';
                  if (!metricsByLabel[label]) {
                    metricsByLabel[label] = {};
                  }
                  // If multiple rows for same label+company, take first (should be same value)
                  if (!metricsByLabel[label][row.company]) {
                    metricsByLabel[label][row.company] = row;
                  }
                });
                
                // Group by statement type
                const byStatementType: Record<string, string[]> = {};
                Object.keys(metricsByLabel).forEach(label => {
                  const firstRow = Object.values(metricsByLabel[label])[0];
                  const stmtType = inferStatementType(label, firstRow.period_label);
                  if (!byStatementType[stmtType]) {
                    byStatementType[stmtType] = [];
                  }
                  byStatementType[stmtType].push(label);
                });
                
                // Sort labels within each statement type
                Object.keys(byStatementType).forEach(stmtType => {
                  byStatementType[stmtType].sort();
                });
                
                return Object.entries(byStatementType).map(([stmtType, labels]) => (
                  <div key={stmtType} className="mb-8 bg-white rounded-lg shadow-md p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">
                      {stmtType} - {selectedYear}
                    </h4>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider sticky left-0 bg-gray-100 z-10">
                            Metric
                          </th>
                          {selectedCompanies.map(ticker => {
                            const company = companies.find(c => c.ticker === ticker);
                            return (
                              <th key={ticker} className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[120px]">
                                {company?.name || ticker}
                              </th>
                            );
                          })}
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                            Unit
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {labels.map(label => {
                          const firstRow = Object.values(metricsByLabel[label])[0];
                          const isTotal = firstRow.hierarchy_level === null || (firstRow.hierarchy_level && firstRow.hierarchy_level >= 3);
                          const indent = firstRow.hierarchy_level ? Math.max(0, 4 - firstRow.hierarchy_level) * 16 : 0;
                          
                          return (
                            <tr 
                              key={label}
                              className={isTotal ? 'bg-gray-50 font-semibold hover:bg-gray-100' : 'hover:bg-gray-50'}
                            >
                              <td 
                                className={`px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 z-10 ${isTotal ? 'bg-gray-50' : 'bg-white'}`}
                                style={{ paddingLeft: `${16 + indent}px` }}
                              >
                                {humanizeLabel(label)}
                              </td>
                              {selectedCompanies.map(ticker => {
                                const row = metricsByLabel[label]?.[ticker];
                                const value = row?.value_numeric;
                                return (
                                  <td 
                                    key={ticker} 
                                    className={`px-4 py-3 text-sm text-right font-mono font-medium ${
                                      value !== null && value !== undefined && value < 0 ? 'text-red-600' : 'text-gray-900'
                                    }`}
                                  >
                                    {row ? formatNumber(row.value_numeric, row.unit_measure) : '-'}
                                  </td>
                                );
                              })}
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {firstRow.unit_measure}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ));
              })()
            ) : (
              // Single company view: show data grouped by statement type
              (() => {
                const grouped: Record<string, DataRow[]> = {};
                
                const inferStatementType = (label: string, periodType: string | null): string => {
                  if (!label) return 'Other';
                  const labelLower = label.toLowerCase();
                  const isInstant = periodType === 'instant';
                  
                  if (isInstant || labelLower.includes('asset') || labelLower.includes('liabilit') || 
                      labelLower.includes('equity') || labelLower.includes('cash') || labelLower.includes('debt')) {
                    return 'Balance Sheet';
                  }
                  if (labelLower.includes('revenue') || labelLower.includes('income') || labelLower.includes('profit') ||
                      labelLower.includes('earnings') || labelLower.includes('eps') || labelLower.includes('expense')) {
                    return 'Income Statement';
                  }
                  if (labelLower.includes('cash_flow') || labelLower.includes('cashflow') || labelLower.includes('capex')) {
                    return 'Cash Flow';
                  }
                  return 'Other';
                };
                
                data.forEach(row => {
                  const stmtType = inferStatementType(row.normalized_label || '', row.period_label || null);
                  if (!grouped[stmtType]) grouped[stmtType] = [];
                  grouped[stmtType].push(row);
                });
                
                return Object.entries(grouped).map(([stmtType, rows]) => (
                  <div key={stmtType} className="mb-6 bg-gray-50 rounded-lg p-4">
                    <h5 className="text-md font-semibold text-gray-800 mb-3">{stmtType} ({rows.length} items)</h5>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Metric</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Value</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rows.slice(0, 100).map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-100">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {humanizeLabel(row.normalized_label)}
                            </td>
                            <td className={`px-4 py-3 text-sm text-right font-mono font-medium ${
                              row.value_numeric !== null && row.value_numeric !== undefined && row.value_numeric < 0 
                                ? 'text-red-600' 
                                : 'text-gray-900'
                            }`}>
                              {formatNumber(row.value_numeric, row.unit_measure)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">{row.unit_measure}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {rows.length > 100 && (
                      <p className="text-sm text-gray-600 mt-2">Showing first 100 of {rows.length} items</p>
                    )}
                  </div>
                ));
              })()
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
