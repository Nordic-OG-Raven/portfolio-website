'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DataWarehouseView from './DataWarehouseView';
import FinancialStatements from './FinancialStatements';
import NaturalLanguageQuery from './NaturalLanguageQuery';
import { LayoutShell } from '../components/LayoutShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface Company {
  ticker: string;
  name: string;
  years: number[];
  years_detail?: Array<{
    year: number;
    quarters?: number[];
    filing_types?: string[];
    reporting_frequencies?: string[];
  }>;
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
  statement_type?: string;
  hierarchy_level?: number | null;
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
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'natural_language' | 'single' | 'warehouse'>('natural_language');
  const [tablePage, setTablePage] = useState<Record<string, number>>({});
  const [showCompaniesModal, setShowCompaniesModal] = useState(false);
  const ITEMS_PER_PAGE = 50;

  const API_BASE = '/api/finsight';

  useEffect(() => {
    // Fetch companies list and quota on mount
    setLoadingCompanies(true);
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
      })
      .finally(() => {
        setLoadingCompanies(false);
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
      // For percentages, show more decimals; for currency, show 2
      formatted = normalizedUnit === '%' ? `${value.toFixed(2)}` : `${value.toFixed(2)}`;
    }
    
    // Always append unit after the number
    return `${formatted} ${normalizedUnit}`;
  };

  const exportMetricsCSV = () => {
    if (!result) return;
    
    const rows: string[][] = [['Line Item', 'Value', 'Unit', 'Period']];
    Object.entries(result.metrics).forEach(([key, metric]) => {
      rows.push([
        key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        metric.value !== null ? String(metric.value) : 'N/A',
        metric.unit,
        metric.period_end ? new Date(metric.period_end).toLocaleDateString() : 'N/A'
      ]);
    });
    
    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.company}_${result.year}_metrics.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMetricsJSON = () => {
    if (!result) return;
    const json = JSON.stringify(result.metrics, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.company}_${result.year}_metrics.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <LayoutShell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-2 text-center">
          FinSight - Financial Analysis Pipeline
        </h1>
        <p className="text-lg text-slate-400 text-center max-w-4xl mx-auto leading-relaxed">
          End-to-end business intelligence architecture centered around an ETL pipeline to extract, prepare, visualize and analyze 10-40 thousand facts per SEC and EU ESEF filing. I built FinSight as a portfolio project to gather pipeline, data engineering, and analysis experience. And because it&apos;s just kind of fun to be honest 😊 Want to analyze a publicly listed company? Give it a go!
        </p>
      </div>

      {/* Pipeline Stages - Always Visible */}
      <Card className="mb-8">
        <h3 className="text-xl font-bold text-slate-100 mb-4">Pipeline Stages</h3>
        <div className="space-y-4 text-slate-400">
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li><strong>Ingestion</strong>: Download 10-K/20-F filings from SEC EDGAR</li>
            <li><strong>XBRL Parsing</strong>: Extract ALL facts using Arelle (10k-40k per company)</li>
            <li><strong>Normalization</strong>: Standardize units, currencies, taxonomies (US-GAAP, IFRS)</li>
            <li><strong>Validation</strong>: Verify accounting identities and cross-statement consistency</li>
            <li><strong>Storage</strong>: Load into PostgreSQL data warehouse with full provenance</li>
            <li><strong>Analysis</strong>: Query, visualize, and export for downstream use</li>
          </ol>
        </div>
      </Card>

      {/* Database Limitations Explanation */}
      <div className="mb-6 text-sm text-slate-400">
        <p>
          <strong className="text-slate-300">Limited Company Coverage:</strong> This is a free-to-use portfolio project, and database storage is limited. As a result, the number of companies in the database is restricted. You can request custom analyses for additional companies (up to 10 per month), but pre-loaded data is limited to a curated set of companies.{' '}
          <button
            onClick={() => setShowCompaniesModal(true)}
            className="text-purple-400 hover:text-purple-300 underline transition-colors"
          >
            Click here to view available companies and reports
          </button>
        </p>
      </div>

      {/* Natural Language Query - First Option */}
      {viewMode === 'natural_language' && (
        <NaturalLanguageQuery API_BASE={API_BASE} />
      )}

      {/* View Mode Selector */}
      <Card className="mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setViewMode('natural_language')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              viewMode === 'natural_language'
                ? 'bg-purple-700 text-white hover:bg-purple-600'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Natural Language Query
          </button>
          <button
            onClick={() => setViewMode('single')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              viewMode === 'single'
                ? 'bg-purple-700 text-white hover:bg-purple-600'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Single Company Analysis
          </button>
          <button
            onClick={() => setViewMode('warehouse')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              viewMode === 'warehouse'
                ? 'bg-purple-700 text-white hover:bg-purple-600'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Data Warehouse Explorer
          </button>
        </div>
      </Card>

        {/* Data Warehouse View */}
        {viewMode === 'warehouse' && (
          <DataWarehouseView companies={preloadedCompanies} API_BASE={API_BASE} />
        )}

        {/* Single Company View */}
        {viewMode === 'single' && (
          <>
          {/* Loading Screen Overlay for Initial Companies Load */}
          {loadingCompanies && (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-slate-800 rounded-lg p-8 shadow-xl max-w-md w-full mx-4">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-700 mb-4"></div>
                  <h3 className="text-xl font-bold text-slate-100 mb-2">Loading Companies</h3>
                  <p className="text-sm text-slate-400 text-center">
                    Fetching available companies and data from the backend...
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Mode Selector */}
        <Card className="mb-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setSelectedMode('preloaded')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedMode === 'preloaded'
                  ? 'bg-purple-700 text-white hover:bg-purple-600'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Pre-loaded Companies (Instant)
            </button>
            <button
              onClick={() => setSelectedMode('custom')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedMode === 'custom'
                  ? 'bg-purple-700 text-white hover:bg-purple-600'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Custom Analysis
            </button>
          </div>

          {/* Pre-loaded Mode */}
          {selectedMode === 'preloaded' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Company
                </label>
                <select
                  value={selectedTicker}
                  onChange={(e) => {
                    setSelectedTicker(e.target.value);
                    const company = preloadedCompanies.find(c => c.ticker === e.target.value);
                    if (company) setSelectedYear(company.years[0]);
                  }}
                  disabled={loadingCompanies || preloadedCompanies.length === 0}
                  className="w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-100 focus:ring-2 focus:ring-purple-700 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {preloadedCompanies.length === 0 ? (
                    <option value="">Loading companies...</option>
                  ) : (
                    preloadedCompanies.map(company => (
                      <option key={company.ticker} value={company.ticker}>
                        {company.name} ({company.ticker})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  disabled={loadingCompanies || !selectedTicker || preloadedCompanies.length === 0}
                  className="w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-100 focus:ring-2 focus:ring-purple-700 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingCompanies || !selectedTicker ? (
                    <option value="">Select a company first</option>
                  ) : (
                    preloadedCompanies
                      .find(c => c.ticker === selectedTicker)
                      ?.years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))
                  )}
                </select>
              </div>
            </div>
          )}

          {/* Custom Mode */}
          {selectedMode === 'custom' && (
            <div className="space-y-4">
              {/* Warning Banner */}
              <div className="bg-amber-500/20 border-l-4 border-amber-500 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-amber-400">
                      Extracting, transforming and loading 10-40 thousand facts takes 5-15 minutes. To keep this website free, the number of custom queries is unfortunately limited to 10 per month in total.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quota Display */}
              {quota && (
                <div className={`p-4 rounded-lg ${quota.quota_available ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-red-500/20 border border-red-500/50'}`}>
                  <p className={`text-sm font-medium ${quota.quota_available ? 'text-emerald-400' : 'text-red-400'}`}>
                    Monthly Quota: {quota.custom_requests_used}/{quota.custom_requests_limit} used
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Ticker Symbol
                  </label>
                  <input
                    type="text"
                    value={customTicker}
                    onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
                    placeholder="e.g., TSLA"
                    maxLength={5}
                    className="w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-100 focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Fiscal Year
                  </label>
                  <input
                    type="number"
                    value={customYear}
                    onChange={(e) => setCustomYear(Number(e.target.value))}
                    min={2020}
                    max={2025}
                    className="w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-800 text-slate-100 focus:ring-2 focus:ring-purple-700 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={loading || (selectedMode === 'custom' && (!customTicker || !quota?.quota_available))}
            variant="primary"
            className="w-full mt-6"
          >
            {loading ? 'Processing...' : 'Analyze Company'}
          </Button>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-700 mx-auto mb-4"></div>
            <p className="text-xl font-medium text-slate-100 mb-2">
              Processing {selectedMode === 'preloaded' ? selectedTicker : customTicker}...
            </p>
            <p className="text-sm text-slate-400">
              {selectedMode === 'preloaded' 
                ? 'Loading pre-processed data...'
                : `Extracting financial data • Elapsed: ${elapsed}s / ~300s`
              }
            </p>
            {selectedMode === 'custom' && (
              <div className="max-w-md mx-auto mt-6">
                <div className="bg-slate-700 rounded-full h-3">
                  <div 
                    className="bg-purple-700 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((elapsed / 300) * 100, 95)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Pipeline: Fetch → Parse XBRL → Normalize → Validate → Store
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/20 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">
            {/* Summary Header */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">
                    {result.company} - {result.year}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {result.fact_count.toLocaleString()} financial facts extracted
                    {result.source === 'preloaded' ? ' (pre-loaded)' : ' (custom analysis)'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Processing Time</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {result.processing_time < 1 ? '<1s' : `${result.processing_time.toFixed(1)}s`}
                  </p>
                </div>
              </div>

              {/* Link to Novo Nordisk Analysis */}
              {result.company === 'NVO' && (
                <Link
                  href="/novo-nordisk"
                  className="inline-flex items-center px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                >
                  View Dashboard Showcase
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              )}
            </Card>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.metrics.revenue && (
                <Card hover={false}>
                  <p className="text-sm text-slate-400 mb-1">Revenue</p>
                  <p className="text-2xl font-bold text-emerald-500">
                    {formatNumber(result.metrics.revenue.value, result.metrics.revenue.unit)}
                  </p>
                </Card>
              )}
              
              {result.metrics.net_income && (
                <Card hover={false}>
                  <p className="text-sm text-slate-400 mb-1">Net Income</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {formatNumber(result.metrics.net_income.value, result.metrics.net_income.unit)}
                  </p>
                </Card>
              )}
              
              {result.metrics.total_assets && (
                <Card hover={false}>
                  <p className="text-sm text-slate-400 mb-1">Total Assets</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {formatNumber(result.metrics.total_assets.value, result.metrics.total_assets.unit)}
                  </p>
                </Card>
              )}
            </div>

            {/* Financial Statements Link */}
            <Card className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-100">Financial Statements</h3>
                <Link
                  href={`#statements-${result.company}-${result.year}`}
                  className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 text-sm font-medium transition-colors"
                >
                  View Full Statements
                </Link>
              </div>
            </Card>

            {/* Full Financial Statements - NEW HIERARCHICAL VIEW */}
            <div id={`statements-${result.company}-${result.year}`} className="mt-8">
              <FinancialStatements 
                ticker={result.company} 
                year={result.year} 
                API_BASE={API_BASE}
              />
            </div>

            {/* Financial Metrics - OLD FLAT LIST (HIDDEN BY DEFAULT - UNCOMMENT TO SHOW) */}
            {false && (
            <div className="space-y-6">
              {/* Export Buttons */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={exportMetricsCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                >
                  📥 Export CSV
                </button>
                <button
                  onClick={exportMetricsJSON}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                >
                  📥 Export JSON
                </button>
              </div>
              {(() => {
                // Group metrics by statement type - proper order (not starting with Other)
                const grouped: Record<string, Array<[string, FinancialMetric]>> = {
                  'Income Statement': [],
                  'Balance Sheet': [],
                  'Cash Flow': [],
                  'Other': []
                };
                
                Object.entries(result?.metrics || {}).forEach(([key, metric]) => {
                  const stmtType = metric.statement_type || 'other';
                  if (stmtType === 'income_statement') {
                    grouped['Income Statement'].push([key, metric]);
                  } else if (stmtType === 'balance_sheet') {
                    grouped['Balance Sheet'].push([key, metric]);
                  } else if (stmtType === 'cash_flow') {
                    grouped['Cash Flow'].push([key, metric]);
                  } else {
                    grouped['Other'].push([key, metric]);
                  }
                });
                
                // Render in proper order: Income Statement → Balance Sheet → Cash Flow → Other
                const statementOrder = ['Income Statement', 'Balance Sheet', 'Cash Flow', 'Other'];
                return statementOrder.map((statementType) => {
                  const metrics = grouped[statementType];
                  if (!metrics || metrics.length === 0) return null;
                  
                  // Sort by hierarchy level (totals first) then alphabetically
                  const sorted = metrics.sort((a, b) => {
                    const levelA = a[1].hierarchy_level ?? 0;
                    const levelB = b[1].hierarchy_level ?? 0;
                    if (levelA !== levelB) return levelB - levelA; // Higher level first
                    return a[0].localeCompare(b[0]);
                  });
                  
                  const pageKey = `table-${statementType}`;
                  const currentPage = tablePage[pageKey] || 0;
                  const startIdx = currentPage * ITEMS_PER_PAGE;
                  const endIdx = startIdx + ITEMS_PER_PAGE;
                  const paginatedItems = sorted.slice(startIdx, endIdx);
                  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
                  
                  return (
                    <Card key={statementType} className="overflow-hidden">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-100 border-b-2 border-slate-700 pb-2 flex-1">
                          {statementType} ({metrics.length} items)
                        </h3>
                        {totalPages > 1 && (
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => setTablePage({...tablePage, [pageKey]: Math.max(0, currentPage - 1)})}
                              disabled={currentPage === 0}
                              className="px-3 py-1 bg-slate-700 text-slate-100 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              ←
                            </button>
                            <span className="text-sm text-slate-400">
                              Page {currentPage + 1} of {totalPages}
                            </span>
                            <button
                              onClick={() => setTablePage({...tablePage, [pageKey]: Math.min(totalPages - 1, currentPage + 1)})}
                              disabled={currentPage >= totalPages - 1}
                              className="px-3 py-1 bg-slate-700 text-slate-100 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              →
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                          <thead className="bg-slate-800">
                            <tr>
                              <th className="px-2 md:px-4 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider">
                                Line Item
                              </th>
                              <th className="px-2 md:px-4 py-3 text-right text-xs font-semibold text-slate-100 uppercase tracking-wider">
                                Value
                              </th>
                              <th className="px-2 md:px-4 py-3 text-left text-xs font-semibold text-slate-100 uppercase tracking-wider">
                                Period
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-slate-800 divide-y divide-slate-700">
                            {paginatedItems.map(([key, metric], idx) => {
                              const isTotal = metric.hierarchy_level && metric.hierarchy_level >= 3;
                              const indent = metric.hierarchy_level ? Math.max(0, 4 - metric.hierarchy_level) * 16 : 0;
                              
                              return (
                                <tr 
                                  key={key} 
                                  className={isTotal ? 'bg-slate-700 font-semibold hover:bg-slate-600' : 'hover:bg-slate-700'}
                                >
                                  <td 
                                    className="px-2 md:px-4 py-3 text-xs md:text-sm font-medium text-slate-100"
                                    style={{ paddingLeft: `${16 + indent}px` }}
                                  >
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </td>
                                  <td className={`px-2 md:px-4 py-3 text-xs md:text-sm text-right font-mono font-medium ${
                                    metric.value !== null && metric.value < 0 ? 'text-red-400' : 'text-slate-100'
                                  }`}>
                                    {formatNumber(metric.value, metric.unit)}
                                  </td>
                                  <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-slate-400">
                                    {metric.period_end ? new Date(metric.period_end).toLocaleDateString() : 'N/A'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  );
                }).filter(Boolean);
              })()}
            </div>
            )}

            {/* Pipeline Info */}
            <Card className="bg-gradient-to-r from-purple-700/10 to-purple-700/5 border-purple-700/20">
              <h3 className="text-lg font-bold text-slate-100 mb-3">About This Analysis</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Extracted {result.fact_count.toLocaleString()} financial facts from SEC XBRL filing</li>
                <li>Validated accounting identities (Assets = Liabilities + Equity)</li>
                <li>Normalized units and currencies for consistency</li>
                <li>Full provenance tracking for every data point</li>
                <li>Cross-statement validation completed</li>
              </ul>
              <p className="text-xs text-slate-500 mt-4">
                Source: SEC EDGAR • Format: XBRL • Processing: Arelle + Custom normalization
              </p>
            </Card>

          </div>
        )}

          </>
        )}

      {/* Example Analyses Section - Always Visible */}
      <Card className="bg-gradient-to-r from-purple-700/10 to-purple-700/5 border-purple-700/20 mt-8">
        <h3 className="text-2xl font-bold text-slate-100 mb-4">Example Analyses</h3>
        <p className="text-slate-400 mb-6">
          See what FinSight can produce with Apache Superset dashboards built on this pipeline:
        </p>
        <div className="space-y-3">
          <Link 
            href="/novo-nordisk"
            className="flex items-center px-6 py-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-purple-700/60 hover:shadow-lg transition-all group"
          >
            <div className="flex-1">
              <div className="font-semibold text-slate-100 group-hover:text-purple-700">Novo Nordisk - Pharma Industry Analysis</div>
              <div className="text-sm text-slate-400">Dashboard showcase: Market positioning, financial fundamentals, R&D efficiency</div>
            </div>
            <svg className="w-5 h-5 text-slate-400 group-hover:text-purple-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
          <div className="flex items-center px-6 py-4 bg-slate-800 rounded-lg border border-slate-800 opacity-60">
            <div className="flex-1">
              <div className="font-semibold text-slate-400">NVIDIA - Tech Sector Analysis</div>
              <div className="text-sm text-slate-500">Coming soon</div>
            </div>
          </div>
          <div className="flex items-center px-6 py-4 bg-slate-800 rounded-lg border border-slate-800 opacity-60">
            <div className="flex-1">
              <div className="font-semibold text-slate-400">Apple - Consumer Tech Analysis</div>
              <div className="text-sm text-slate-500">Coming soon</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Companies Modal */}
      {showCompaniesModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCompaniesModal(false)}>
          <div className="bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-100">Available Companies & Reports</h2>
              <button
                onClick={() => setShowCompaniesModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {preloadedCompanies.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">Loading companies...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {preloadedCompanies.map((company) => (
                    <div key={company.ticker} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-100">{company.name}</h3>
                          <p className="text-sm text-slate-400">Ticker: {company.ticker}</p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-3">
                        {company.years_detail && company.years_detail.length > 0 ? (
                          company.years_detail.map((yearDetail) => (
                            <div key={yearDetail.year} className="mb-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-slate-200">{yearDetail.year}</span>
                                {yearDetail.filing_types && yearDetail.filing_types.length > 0 && (
                                  <span className="text-xs text-slate-500">
                                    ({yearDetail.filing_types.join(', ')})
                                  </span>
                                )}
                              </div>
                              {yearDetail.quarters && yearDetail.quarters.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {yearDetail.quarters.map((quarter) => (
                                    <span
                                      key={quarter}
                                      className="px-2 py-1 bg-purple-700/30 text-purple-300 rounded text-xs font-medium border border-purple-700/50"
                                    >
                                      Q{quarter}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500 italic">Annual report only</span>
                              )}
                            </div>
                          ))
                        ) : (
                          <div>
                            <p className="text-sm text-slate-400 mb-2">Available Years:</p>
                            <div className="flex flex-wrap gap-2">
                              {company.years.map((year) => (
                                <span
                                  key={year}
                                  className="px-3 py-1 bg-purple-700/30 text-purple-300 rounded-md text-sm font-medium border border-purple-700/50"
                                >
                                  {year}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-700 bg-slate-800/50">
              <p className="text-xs text-slate-500 text-center">
                Total: {preloadedCompanies.length} companies • {preloadedCompanies.reduce((sum, c) => sum + c.years.length, 0)} reports
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-400">
          <p>Built with Arelle • PostgreSQL • Flask • Next.js • Apache Superset</p>
          <p className="mt-1">
            <a href="https://github.com/Nordic-OG-Raven/FinSight" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-600 transition-colors">
              View source code on GitHub →
            </a>
          </p>
        </div>
    </LayoutShell>
  );
}

