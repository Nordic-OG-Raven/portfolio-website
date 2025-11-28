'use client';

import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface QueryResult {
  result_type: 'table' | 'chart' | 'number' | 'list' | 'time_series' | 'single_row';
  data: any[];
  columns: string[];
  row_count: number;
  sql: string;
  detected_companies: string[];
  execution_time: number;
  error?: string;
  warning?: string;
}

interface NaturalLanguageQueryProps {
  API_BASE: string;
}

export default function NaturalLanguageQuery({ API_BASE }: NaturalLanguageQueryProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [showSQL, setShowSQL] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedFormat(null);

    try {
      const response = await fetch(`${API_BASE}?path=/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.status}`);
      }

      // Check if there's an error in the response data (only if error is not null/undefined)
      if (data.error && data.error !== null) {
        throw new Error(data.error);
      }

      setResult(data);
      setSelectedFormat(data.result_type); // Auto-select detected format
    } catch (err: any) {
      setError(err.message || 'Failed to execute query');
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      // Format large numbers
      if (Math.abs(value) >= 1e9) {
        return `$${(value / 1e9).toFixed(2)}B`;
      } else if (Math.abs(value) >= 1e6) {
        return `$${(value / 1e6).toFixed(2)}M`;
      } else if (Math.abs(value) >= 1e3) {
        return `$${(value / 1e3).toFixed(2)}K`;
      }
      return value.toLocaleString();
    }
    return String(value);
  };

  const renderResult = () => {
    if (!result) return null;

    const displayFormat = selectedFormat || result.result_type;
    const { data, columns } = result;

    if (data.length === 0) {
      return (
        <Card className="p-6">
          <p className="text-slate-400">No results found.</p>
        </Card>
      );
    }

    // Number display
    if (displayFormat === 'number' && data.length === 1 && columns.length === 1) {
      const value = data[0][columns[0]];
      return (
        <Card className="p-8 text-center">
          <div className="text-6xl font-bold text-purple-400 mb-2">
            {formatValue(value)}
          </div>
          <div className="text-slate-400 text-sm">{columns[0]}</div>
        </Card>
      );
    }

    // List display
    if (displayFormat === 'list' && columns.length === 1) {
      return (
        <Card className="p-6">
          <ul className="space-y-2">
            {data.map((row, idx) => (
              <li key={idx} className="text-slate-300">
                {formatValue(row[columns[0]])}
              </li>
            ))}
          </ul>
        </Card>
      );
    }

    // Chart display (time series or bar chart)
    if (displayFormat === 'chart' || displayFormat === 'time_series') {
      // Find time column
      const timeCol = columns.find(col => 
        ['fiscal_year', 'year', 'date', 'period_label', 'fiscal_quarter'].includes(col.toLowerCase())
      ) || columns[0];
      
      // Find value column(s)
      const valueCols = columns.filter(col => col !== timeCol);

      if (valueCols.length === 0) {
        return renderTable();
      }

      const chartData = data.map(row => ({
        ...row,
        [timeCol]: row[timeCol] || 'N/A',
      }));

      return (
        <Card className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            {valueCols.length === 1 ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey={timeCol} stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey={valueCols[0]} 
                  stroke="#A855F7" 
                  strokeWidth={2}
                  dot={{ fill: '#A855F7' }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey={timeCol} stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Legend />
                {valueCols.map((col, idx) => (
                  <Bar 
                    key={col} 
                    dataKey={col} 
                    fill={idx === 0 ? '#A855F7' : `hsl(${220 + idx * 30}, 70%, 60%)`}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </Card>
      );
    }

    // Table display (default)
    return renderTable();
  };

  const renderTable = () => {
    if (!result) return null;

    const { data, columns } = result;

    return (
      <Card className="p-6 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-700">
              {columns.map((col) => (
                <th key={col} className="text-left p-3 text-slate-300 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                {columns.map((col) => (
                  <td key={col} className="p-3 text-slate-400">
                    {formatValue(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {result.warning && (
          <p className="text-yellow-500 text-sm mt-4">{result.warning}</p>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about the financial data... (e.g., 'Show me Apple's revenue in 2024')"
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Querying...' : 'Query'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="p-6 bg-red-900/20 border-red-700">
          <p className="text-red-400">{error}</p>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Result Metadata */}
          <Card className="p-4 bg-slate-800/50">
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span>Rows: {result.row_count}</span>
              <span>Execution: {result.execution_time.toFixed(3)}s</span>
              {result.detected_companies.length > 0 && (
                <span>Companies: {result.detected_companies.join(', ')}</span>
              )}
              <button
                onClick={() => setShowSQL(!showSQL)}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                {showSQL ? 'Hide' : 'Show'} SQL
              </button>
            </div>
            {showSQL && (
              <pre className="mt-4 p-4 bg-slate-900 rounded text-xs text-slate-300 overflow-x-auto">
                {result.sql}
              </pre>
            )}
          </Card>

          {/* Format Selector */}
          {result.data.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm">Display as:</span>
                <div className="flex gap-2">
                  {['table', 'chart', 'number', 'list'].map((format) => (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedFormat === format
                          ? 'bg-purple-700 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {format.charAt(0).toUpperCase() + format.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Result Display */}
          {renderResult()}
        </div>
      )}
    </div>
  );
}

