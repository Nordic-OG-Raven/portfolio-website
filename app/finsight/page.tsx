'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DataWarehouseView from './DataWarehouseView';
import NaturalLanguageQuery from './NaturalLanguageQuery';
import Forecast from './Forecast';
import CompanyAnalysis from './CompanyAnalysis';
import StatementsView from './StatementsView';
import FilingsBrowser from './FilingsBrowser';
import RawFacts from './RawFacts';
import CanonicalFacts from './CanonicalFacts';
import TrackRecord from './TrackRecord';
import Sidebar from './Sidebar';
import LayerIntro from './LayerIntro';
import PipelineOverview from './PipelineOverview';
import { LayoutShell } from '../components/LayoutShell';
import { Card } from '../components/ui/Card';
import { ProvenanceProvider, ProvenanceToggle } from './ProvenanceContext';
import type { Company, QuotaInfo } from './types';
import { DEFAULT_VIEW, FINSIGHT_NAV, isView, labelOfView, layerOfView, LAYER_ACCENT, type Layer, type View } from './finsightNav';

function FinSightApp() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [preloadedCompanies, setPreloadedCompanies] = useState<Company[]>([]);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const [showCompaniesModal, setShowCompaniesModal] = useState(false);

  const paramView = searchParams.get('view');
  const [view, setView] = useState<View>(isView(paramView) ? paramView : DEFAULT_VIEW);

  const API_BASE = '/api/finsight';

  useEffect(() => {
    // Fetch companies list and quota on mount
    setLoadingCompanies(true);
    fetch(`${API_BASE}?path=/api/companies`)
      .then(res => {
        if (!res.ok) {
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
        setCompaniesError(null);
      })
      .catch(err => {
        console.error('Failed to load companies:', err);
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setCompaniesError('Backend API is temporarily unavailable. Please try again shortly.');
        } else {
          setCompaniesError(`Connection issue: ${err.message}. Please try again.`);
        }
      })
      .finally(() => {
        setLoadingCompanies(false);
      });
  }, [API_BASE]);

  const changeView = (v: View) => {
    setView(v);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('view', v);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const renderView = () => {
    switch (view) {
      case 'warehouse':
        return <DataWarehouseView companies={preloadedCompanies} API_BASE={API_BASE} />;
      case 'statements':
        return <StatementsView companies={preloadedCompanies} loadingCompanies={loadingCompanies} API_BASE={API_BASE} />;
      case 'company':
        return (
          <CompanyAnalysis
            companies={preloadedCompanies}
            quota={quota}
            setQuota={setQuota}
            loadingCompanies={loadingCompanies}
            companiesError={companiesError}
            API_BASE={API_BASE}
          />
        );
      case 'ask':
        return <NaturalLanguageQuery API_BASE={API_BASE} />;
      case 'forecast':
        return <Forecast API_BASE={API_BASE} />;
      case 'track_record':
        return <TrackRecord API_BASE={API_BASE} />;
      case 'filings':
        return <FilingsBrowser companies={preloadedCompanies} loadingCompanies={loadingCompanies} API_BASE={API_BASE} />;
      case 'raw_facts':
        return <RawFacts companies={preloadedCompanies} loadingCompanies={loadingCompanies} API_BASE={API_BASE} />;
      case 'canonical_facts':
        return <CanonicalFacts companies={preloadedCompanies} loadingCompanies={loadingCompanies} API_BASE={API_BASE} />;
      default:
        return null;
    }
  };

  const activeLayer = layerOfView(view);
  const accent = LAYER_ACCENT[activeLayer];

  return (
    <ProvenanceProvider API_BASE={API_BASE}>
    <LayoutShell>
      {/* Hero */}
      <div className="mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-3 text-center">
          FinSight
        </h1>
        <p className="text-lg text-slate-400 text-center max-w-2xl mx-auto leading-relaxed">
          Browse the raw SEC filings, watch each layer refine them, and trace any number back to the
          filing it came from.
        </p>
        <p className="text-sm text-slate-500 text-center mt-2">
          <button
            onClick={() => setShowCompaniesModal(true)}
            className="text-purple-400 hover:text-purple-300 underline transition-colors"
          >
            View the companies covered
          </button>
        </p>
      </div>

      {/* Live pipeline overview */}
      <PipelineOverview
        API_BASE={API_BASE}
        onSelectLayer={(layer: Layer) => {
          const v = FINSIGHT_NAV.find(g => g.layer === layer)?.items[0].view;
          if (v) changeView(v);
        }}
      />

      {/* Medallion layout: layer sidebar + active view */}
      <div className="flex flex-col lg:flex-row gap-6">
        <Sidebar view={view} onSelect={changeView} />

        <div className="flex-1 min-w-0">
          {/* Top bar: breadcrumb + provenance toggle */}
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-2 text-sm">
              <span className={`inline-block w-2 h-2 rounded-full ${accent.dot}`} />
              <span className={`capitalize font-medium ${accent.text}`}>{activeLayer}</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-200 font-medium">{labelOfView(view)}</span>
            </div>

            <ProvenanceToggle />
          </div>

          <LayerIntro layer={activeLayer} API_BASE={API_BASE} />

          {renderView()}
        </div>
      </div>

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
    </ProvenanceProvider>
  );
}

export default function FinSightPage() {
  return (
    <Suspense fallback={null}>
      <FinSightApp />
    </Suspense>
  );
}
