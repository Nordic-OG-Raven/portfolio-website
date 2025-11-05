'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DataWarehouseView from './DataWarehouseView';
import FinancialStatements from './FinancialStatements';

interface Company {
  ticker: string;
  name: string;
  years: number[];
}

interface QuotaInfo {
  custom_requests_used: number;
  custom_requests_limit: number;
  quota_available: boolean;
  message: string;
}

interface FinancialMetric {
  value: number | null;
  unit: string;
  period_end: string | null;
}

interface AnalysisResult {
  company: string;
  year: number;
  metrics: Record<string, FinancialMetric>;
  fact_count: number;
  processing_time: number;
  source: 'preloaded' | 'custom';
}

export default function FinSightPage() {
  const [preloadedCompanies, setPreloadedCompanies] = useState<Company[]>([]);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [selectedMode, setSelectedMode] = useState<'preloaded' | 'custom'>('preloaded');
  const [selectedTicker, setSelectedTicker] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [customTicker, setCustomTicker] = useState<string>('');
  const [customYear, setCustomYear] = useState<number>(2024);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'single' | 'warehouse'>('single');

  const API_BASE = '/api/finsight';

  useEffect(() => {
    // Fetch companies list and quota on mount
    fetch(`${API_BASE}?path=/api/companies`)
      .then(res => {
        if (!res.ok) {
          // Don't set error for 404/500 - might be temporary
          if (res.status >= 500) {
            throw new Error(`Backend error (${res.status}) - please try again`);
          }
          throw new Error(`API returned ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setPreloadedCompanies(data.preloaded || []);
        setQuota(data.quota);
        if (data.preloaded && data.preloaded.length > 0) {
          setSelectedTicker(data.preloaded[0].ticker);
          setSelectedYear(data.preloaded[0].years[0]);
        }
        setError(null); // Clear any previous errors
      })
      .catch(err => {
        console.error('Failed to load companies:', err);
        // Only show error if it's a network error, not a temporary server error
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('Backend API is not available. The Flask API needs to be deployed to Railway.');
        } else {
          setError(`Connection issue: ${err.message}. Please try again.`);
        }
      });
  }, [API_BASE]);

  useEffect(() => {
    // Timer for elapsed time during loading
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (selectedMode === 'preloaded') {
        // Fetch pre-loaded data (instant)
        const res = await fetch(`${API_BASE}?path=/api/analyze/${selectedTicker}/${selectedYear}`);
        
        if (!res.ok && res.status === 404) {
          // API not running
          throw new Error('API not available. Backend needs to be deployed to Railway.');
        }
        
        const data = await res.json();
        
        if (res.ok) {
          setResult(data);
        } else {
          setError(data.message || 'Failed to fetch data');
        }
      } else {
        // Run custom analysis
        const res = await fetch(`${API_BASE}?path=/api/analyze/custom`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticker: customTicker, year: customYear })
        });
        
        const data = await res.json();
        
        if (res.ok) {
          setResult(data);
          // Refresh quota
          const quotaRes = await fetch(`${API_BASE}?path=/api/quota`);
          const quotaData = await quotaRes.json();
          setQuota(quotaData.quota);
        } else {
          if (data.error === 'quota_exceeded') {
            setError(`Monthly quota exceeded (${data.quota_used}/${data.quota_limit}). Resets on ${new Date(data.resets_on).toLocaleDateString()}.`);
          } else if (data.error === 'storage_quota_exceeded') {
            setError(`Storage limit reached. ${data.message} Contact: ${data.contact}`);
          } else {
            setError(data.message || 'Analysis failed');
          }
        }
      }
    } catch (err: any) {
      if (err.message.includes('Failed to fetch') || err.message.includes('fetch failed') || err.message.includes('NetworkError')) {
        setError('Backend API is not available. The Flask API needs to be deployed to Railway to enable live analysis.');
      } else {
        setError(err.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: number | null, unit: string = 'USD') => {
    if (value === null) return 'N/A';
    
    // Format large numbers with B/M suffix
    const absValue = Math.abs(value);
    if (absValue >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B ${unit}`;
    } else if (absValue >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M ${unit}`;
    } else if (absValue >= 1e3) {
      return `${(value / 1e3).toFixed(2)}K ${unit}`;
    }
    return `${value.toFixed(2)} ${unit}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            ← Back to Portfolio
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
            FinSight - Financial Analysis Pipeline
          </h1>
          <p className="text-lg text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
            End-to-end business intelligence architecture centered around an ETL pipeline to extract, prepare, visualize and analyze 10-40 thousand facts per SEC and EU ESEF filing. I built FinSight as a portfolio project to gather pipeline, data engineering, and analysis experience. And because it&apos;s just kind of fun to be honest 😊 Want to analyze a publicly listed company? Give it a go!
          </p>
        </div>

        {/* View Mode Selector */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode('single')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                viewMode === 'single'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Single Company Analysis
            </button>
            <button
              onClick={() => setViewMode('warehouse')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                viewMode === 'warehouse'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📈 Data Warehouse Explorer
            </button>
          </div>
        </div>

        {/* Data Warehouse View */}
        {viewMode === 'warehouse' && (
          <DataWarehouseView companies={preloadedCompanies} API_BASE={API_BASE} />
        )}

        {/* Single Company View */}
        {viewMode === 'single' && (
          <>

        {/* Mode Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setSelectedMode('preloaded')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedMode === 'preloaded'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📚 Pre-loaded Companies (Instant)
            </button>
            <button
              onClick={() => setSelectedMode('custom')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedMode === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔧 Custom Analysis
            </button>
          </div>

          {/* Pre-loaded Mode */}
          {selectedMode === 'preloaded' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Company
                </label>
                <select
                  value={selectedTicker}
                  onChange={(e) => {
                    setSelectedTicker(e.target.value);
                    const company = preloadedCompanies.find(c => c.ticker === e.target.value);
                    if (company) setSelectedYear(company.years[0]);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {preloadedCompanies.map(company => (
                    <option key={company.ticker} value={company.ticker}>
                      {company.name} ({company.ticker})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {preloadedCompanies
                    .find(c => c.ticker === selectedTicker)
                    ?.years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {/* Custom Mode */}
          {selectedMode === 'custom' && (
            <div className="space-y-4">
              {/* Warning Banner */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Extracting, transforming and loading 10-40 thousand facts takes 5-15 minutes. To keep this website free, the number of custom queries is unfortunately limited to 10 per month in total.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quota Display */}
              {quota && (
                <div className={`p-4 rounded-lg ${quota.quota_available ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className={`text-sm font-medium ${quota.quota_available ? 'text-green-800' : 'text-red-800'}`}>
                    Monthly Quota: {quota.custom_requests_used}/{quota.custom_requests_limit} used
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ticker Symbol
                  </label>
                  <input
                    type="text"
                    value={customTicker}
                    onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
                    placeholder="e.g., TSLA"
                    maxLength={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiscal Year
                  </label>
                  <input
                    type="number"
                    value={customYear}
                    onChange={(e) => setCustomYear(Number(e.target.value))}
                    min={2020}
                    max={2025}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading || (selectedMode === 'custom' && (!customTicker || !quota?.quota_available))}
            className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Analyze Company'}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-xl font-medium text-gray-900 mb-2">
              Processing {selectedMode === 'preloaded' ? selectedTicker : customTicker}...
            </p>
            <p className="text-sm text-gray-600">
              {selectedMode === 'preloaded' 
                ? 'Loading pre-processed data...'
                : `Extracting financial data • Elapsed: ${elapsed}s / ~300s`
              }
            </p>
            {selectedMode === 'custom' && (
              <div className="max-w-md mx-auto mt-6">
                <div className="bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((elapsed / 300) * 100, 95)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Pipeline: Fetch → Parse XBRL → Normalize → Validate → Store
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">
            {/* Summary Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {result.company} - {result.year}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {result.fact_count.toLocaleString()} financial facts extracted
                    {result.source === 'preloaded' ? ' (pre-loaded)' : ' (custom analysis)'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Processing Time</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {result.processing_time < 1 ? '<1s' : `${result.processing_time.toFixed(1)}s`}
                  </p>
                </div>
              </div>

              {/* Link to Superset */}
              {result.company === 'NVO' && (
                <Link
                  href="/novo-nordisk"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  📊 View Full Superset Dashboard
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              )}
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.metrics.revenue && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-sm text-gray-600 mb-1">Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatNumber(result.metrics.revenue.value, result.metrics.revenue.unit)}
                  </p>
                </div>
              )}
              
              {result.metrics.net_income && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-sm text-gray-600 mb-1">Net Income</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatNumber(result.metrics.net_income.value, result.metrics.net_income.unit)}
                  </p>
                </div>
              )}
              
              {result.metrics.total_assets && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-sm text-gray-600 mb-1">Total Assets</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatNumber(result.metrics.total_assets.value, result.metrics.total_assets.unit)}
                  </p>
                </div>
              )}
            </div>

            {/* Financial Statements Toggle */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">View Full Financial Statements</h3>
                <Link
                  href={`#statements-${result.company}-${result.year}`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                >
                  📊 View Statements
                </Link>
              </div>
            </div>

            {/* Detailed Metrics Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Financial Metrics</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Metric
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period End
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(result.metrics).map(([key, metric]) => (
                      <tr key={key}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                          {formatNumber(metric.value, metric.unit)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {metric.period_end ? new Date(metric.period_end).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pipeline Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">About This Analysis</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ Extracted {result.fact_count.toLocaleString()} financial facts from SEC XBRL filing</li>
                <li>✅ Validated accounting identities (Assets = Liabilities + Equity)</li>
                <li>✅ Normalized units and currencies for consistency</li>
                <li>✅ Full provenance tracking for every data point</li>
                <li>✅ Cross-statement validation completed</li>
              </ul>
              <p className="text-xs text-gray-600 mt-4">
                Source: SEC EDGAR • Format: XBRL • Processing: Arelle + Custom normalization
              </p>
            </div>

            {/* Full Financial Statements */}
            <div id={`statements-${result.company}-${result.year}`} className="mt-8">
              <FinancialStatements 
                ticker={result.company} 
                year={result.year} 
                API_BASE={API_BASE}
              />
            </div>
          </div>
        )}

        {/* Initial State - Show Pipeline Info */}
        {!result && !loading && !error && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Pipeline Stages</h3>
            <div className="space-y-4 text-gray-700">
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li><strong>Ingestion</strong>: Download 10-K/20-F filings from SEC EDGAR</li>
                <li><strong>XBRL Parsing</strong>: Extract ALL facts using Arelle (10k-40k per company)</li>
                <li><strong>Normalization</strong>: Standardize units, currencies, taxonomies (US-GAAP, IFRS)</li>
                <li><strong>Validation</strong>: Verify accounting identities and cross-statement consistency</li>
                <li><strong>Storage</strong>: Load into PostgreSQL data warehouse with full provenance</li>
                <li><strong>Analysis</strong>: Query, visualize, and export for downstream use</li>
              </ol>
            </div>
          </div>
        )}

        {/* Example Analyses Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-md p-8 mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Example Analyses</h3>
          <p className="text-gray-700 mb-6">
            See what FinSight can produce with Apache Superset dashboards built on this pipeline:
          </p>
          <div className="space-y-3">
            <a 
              href="https://analyses.nordicravensolutions.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center px-6 py-4 bg-white rounded-lg shadow hover:shadow-lg transition-all group"
            >
              <span className="text-2xl mr-4">📊</span>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 group-hover:text-blue-600">Novo Nordisk - Pharma Industry Analysis</div>
                <div className="text-sm text-gray-600">5-year trend analysis, peer comparison, comprehensive financial metrics</div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <div className="flex items-center px-6 py-4 bg-gray-100 rounded-lg opacity-60">
              <span className="text-2xl mr-4">📊</span>
              <div className="flex-1">
                <div className="font-semibold text-gray-700">NVIDIA - Tech Sector Analysis</div>
                <div className="text-sm text-gray-600">Coming soon</div>
              </div>
            </div>
            <div className="flex items-center px-6 py-4 bg-gray-100 rounded-lg opacity-60">
              <span className="text-2xl mr-4">📊</span>
              <div className="flex-1">
                <div className="font-semibold text-gray-700">Apple - Consumer Tech Analysis</div>
                <div className="text-sm text-gray-600">Coming soon</div>
              </div>
            </div>
          </div>
        </div>

          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Built with Arelle • PostgreSQL • Flask • Next.js • Apache Superset</p>
          <p className="mt-1">
            <a href="https://github.com/Nordic-OG-Raven/FinSight" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
              View source code on GitHub →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

