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
        <p className="text-xl md:text-2xl text-slate-200 text-center max-w-2xl mx-auto font-semibold">
          Watch a 10-K become a <span className="text-purple-400">forecast</span>.
        </p>
      </div>

      {/* Front door: the interactive pipeline walk (full width). Layer views get the sidebar. */}
      {view === 'overview' ? (
        <PipelineOverview
          API_BASE={API_BASE}
          companies={preloadedCompanies}
          onGoToLayer={(layer: Layer) => {
            const v = FINSIGHT_NAV.find(g => g.layer === layer)?.items[0].view;
            if (v) changeView(v);
          }}
        />
      ) : (
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
