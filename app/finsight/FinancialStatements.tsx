'use client';

import { useState, useEffect } from 'react';

interface StatementItem {
  normalized_label: string;
  concept_name: string;
  value: number;
  unit: string;
  period_date: string | null;
  period_type: string;
  hierarchy_level: number | null;
  parent_normalized_label: string | null;
}

interface StatementsData {
  income_statement: StatementItem[];
  balance_sheet: StatementItem[];
  cash_flow: StatementItem[];
}

interface FinancialStatementsProps {
  ticker: string;
  year: number;
  API_BASE: string;
}

export default function FinancialStatements({ ticker, year, API_BASE }: FinancialStatementsProps) {
  const [data, setData] = useState<StatementsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['income_statement', 'balance_sheet', 'cash_flow']));
  const [showDetails, setShowDetails] = useState(true); // Show all hierarchy levels vs only totals

  const loadStatements = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}?path=/api/statements/${ticker}/${year}`);
      if (!res.ok) {
        throw new Error(`Backend returned ${res.status}`);
      }
      const result = await res.json();
      setData(result.statements);
    } catch (err: any) {
      setError(err.message || 'Failed to load statements');
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    if (!data && !loading) {
      loadStatements();
    }
  }, [ticker, year]);

  const formatNumber = (value: number | null, unit: string = 'USD') => {
    if (value === null || value === undefined) return 'N/A';
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

  const getIndentation = (hierarchyLevel: number | null) => {
    if (!hierarchyLevel) return 0;
    // Level 4 (statement_total): no indent
    // Level 3 (section_total): 1 indent
    // Level 2 (subtotal): 2 indents
    // Level 1 (detail): 3 indents
    return Math.max(0, 4 - hierarchyLevel) * 20; // 20px per level
  };

  const renderStatement = (title: string, items: StatementItem[], statementKey: string) => {
    if (!items || items.length === 0) return null;

    const isExpanded = expandedSections.has(statementKey);
    const filteredItems = showDetails 
      ? items 
      : items.filter(item => item.hierarchy_level && item.hierarchy_level >= 3);

    // Group items by hierarchy for better organization
    const groupedItems = filteredItems.reduce((acc, item) => {
      const level = item.hierarchy_level || 4;
      if (!acc[level]) acc[level] = [];
      acc[level].push(item);
      return acc;
    }, {} as Record<number, StatementItem[]>);

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showDetails}
                onChange={(e) => setShowDetails(e.target.checked)}
                className="rounded"
              />
              <span className="text-gray-700">Show details</span>
            </label>
            <button
              onClick={() => {
                const newExpanded = new Set(expandedSections);
                if (isExpanded) {
                  newExpanded.delete(statementKey);
                } else {
                  newExpanded.add(statementKey);
                }
                setExpandedSections(newExpanded);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {isExpanded ? '▼ Collapse' : '▶ Expand'}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Line Item
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.keys(groupedItems)
                  .sort((a, b) => Number(b) - Number(a)) // Sort by hierarchy level descending
                  .map(level => 
                    groupedItems[Number(level)].map((item, idx) => {
                      const indent = getIndentation(item.hierarchy_level);
                      const isTotal = item.hierarchy_level && item.hierarchy_level >= 3;
                      
                      return (
                        <tr 
                          key={`${item.normalized_label}-${idx}`}
                          className={isTotal ? 'bg-gray-50 font-semibold' : 'hover:bg-gray-50'}
                        >
                          <td 
                            className="px-4 py-3 text-sm text-gray-900"
                            style={{ paddingLeft: `${16 + indent}px` }}
                          >
                            {humanizeLabel(item.normalized_label)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-mono">
                            {formatNumber(item.value, item.unit)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {item.unit}
                          </td>
                        </tr>
                      );
                    })
                  )
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading financial statements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
        <p className="text-sm text-red-700">{error}</p>
        <button
          onClick={loadStatements}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <button
          onClick={loadStatements}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Load Financial Statements
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>{ticker} - {year}</strong> Financial Statements
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Total: {data.income_statement.length} income statement items, {data.balance_sheet.length} balance sheet items, {data.cash_flow.length} cash flow items
        </p>
      </div>

      {renderStatement('Income Statement', data.income_statement, 'income_statement')}
      {renderStatement('Balance Sheet', data.balance_sheet, 'balance_sheet')}
      {renderStatement('Cash Flow Statement', data.cash_flow, 'cash_flow')}
    </div>
  );
}

