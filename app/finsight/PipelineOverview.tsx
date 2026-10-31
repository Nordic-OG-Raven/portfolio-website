'use client';

import { useState, useEffect, useRef } from 'react';
import { LAYER_ACCENT, type Layer } from './finsightNav';
import type { Company } from './types';

// ---- shapes of the live endpoints this walk reads (all real data, nothing mocked) ----
interface PipelineStats {
  bronze: { filings: number; raw_facts: number; companies: number };
  silver: { conformed_facts: number };
  gold: { served_facts: number; marts?: number };
  intelligence: { forecasts: number; graded: number };
}
interface Filing { form: string; filing_date: string; fact_count: number; accession: string; }
interface FilingsResp { count: number; filings: Filing[]; ticker: string; }
interface Pending { metric: string; fiscal_year: number; quarter: number; forecast: number; interval_80: [number, number]; consensus: number | null; model: string; }
interface HistRow { fiscal_year: number; quarter: number; metric: string; actual: number | null; }
interface Accuracy { [metric: string]: { our_mape: number; consensus_mape: number | null; n: number }; }
interface ForecastResp { pending: Pending[]; history: HistRow[]; accuracy: Accuracy; }

interface LayerCode { id: string; code: string; }

interface Props {
  API_BASE: string;
  companies: Company[];
  onGoToLayer: (layer: Layer) => void;
}

type StageKey = 'bronze' | 'silver' | 'gold' | 'forecast';
const STAGES: { k: StageKey; layer: Layer; name: string; role: string; codeId?: string }[] = [
  { k: 'bronze', layer: 'bronze', name: 'Bronze', role: 'Every XBRL fact the company has filed with the SEC, exactly as filed.', codeId: 'bronze' },
  { k: 'silver', layer: 'silver', name: 'Silver', role: 'Deduped to the latest filing, currency-normalized, synonym tags reconciled to one canonical line.', codeId: 'silver' },
  { k: 'gold', layer: 'gold', name: 'Gold', role: 'The clean quarterly series the apps query. Q1–Q3 are filed; Q4 is derived from the annual.', codeId: 'gold' },
  { k: 'forecast', layer: 'intelligence', name: 'Forecast', role: 'Leakage-safe next-quarter model with a calibrated interval, graded against the street.' },
];

const abbrev = (n: number): string =>
  n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : String(n);
const usdB = (n: number): string => `$${(n / 1e9).toFixed(1)}B`;

export default function PipelineOverview({ API_BASE, companies, onGoToLayer }: Props) {
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [ticker, setTicker] = useState<string>('NVDA'); // open on our strongest case (beats consensus)
  const [filings, setFilings] = useState<FilingsResp | null>(null);
  const [fc, setFc] = useState<ForecastResp | null>(null);

  const [ran, setRan] = useState<boolean[]>([false, false, false, false]);
  const [busy, setBusy] = useState(false);
  const [openCode, setOpenCode] = useState<StageKey | null>(null);
  const [log, setLog] = useState<{ cls: string; text: string }[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  const get = (path: string) => fetch(`${API_BASE}?path=${encodeURIComponent(path)}`).then(r => (r.ok ? r.json() : null));

  // warehouse-wide stats + the real transform code, once
  useEffect(() => {
    get('/api/pipeline-stats').then(d => { if (d && !d.error) setStats(d); }).catch(() => {});
    get('/api/lineage/layers').then(d => {
      if (d?.layers) setCodes(Object.fromEntries(d.layers.map((l: LayerCode) => [l.id, l.code])));
    }).catch(() => {});
  }, [API_BASE]); // eslint-disable-line react-hooks/exhaustive-deps

  // per-company artifacts whenever the selected company changes
  useEffect(() => {
    if (companies.length && !companies.some(c => c.ticker === ticker)) setTicker(companies[0].ticker);
  }, [companies]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let live = true;
    reset();
    get(`/api/filings/${ticker}`).then(d => { if (live && d && !d.error) setFilings(d); });
    get(`/api/forecast/${ticker}`).then(d => { if (live && d && !d.error) setFc(d); });
    return () => { live = false; };
  }, [ticker]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  function reset() {
    busyRef.current = false;
    setRan([false, false, false, false]); setBusy(false); setOpenCode(null);
    setLog([{ cls: 'faint', text: '› pick a company, then run a layer' }]);
  }
  const addLog = (cls: string, text: string) => setLog(l => [...l, { cls, text }]);

  const rawFacts = filings ? filings.filings.reduce((s, f) => s + (f.fact_count || 0), 0) : null;
  const revHist = fc ? fc.history.filter(h => h.metric === 'revenue' && h.actual != null) : [];
  const revPending = fc?.pending.find(p => p.metric === 'revenue') || fc?.pending[0];

  // funnel numbers: warehouse-wide (real), highlighted per stage as it runs
  const funnel: { k: StageKey; label: string; num: string; sub: string }[] = [
    { k: 'bronze', label: 'Bronze', num: stats ? abbrev(stats.bronze.raw_facts) : '—', sub: 'raw facts, as filed' },
    { k: 'silver', label: 'Silver', num: stats ? abbrev(stats.silver.conformed_facts) : '—', sub: 'conformed, one per period' },
    { k: 'gold', label: 'Gold', num: stats ? String(stats.gold.marts ?? 9) : '—', sub: 'serving marts' },
    { k: 'forecast', label: 'Intelligence', num: stats ? String(stats.intelligence.forecasts) : '—', sub: 'forecasts logged' },
  ];

  // Returns a promise that resolves when the stage's log animation finishes, so "run all" can
  // await each in order. A ref (not state) guards against overlap, since state is stale in a loop.
  function runStage(i: number): Promise<void> {
    return new Promise(resolve => {
      if (busyRef.current || i < 0 || i >= STAGES.length) { resolve(); return; }
      busyRef.current = true; setBusy(true);
      const s = STAGES[i];
      addLog(`p-${s.layer}`, `${s.name.toUpperCase()} layer`);
      const lines = buildLog(s.k);
      let step = 0;
      const tick = setInterval(() => {
        if (step >= lines.length) {
          clearInterval(tick);
          setRan(r => { const n = [...r]; n[i] = true; return n; });
          busyRef.current = false; setBusy(false);
          resolve();
          return;
        }
        addLog(lines[step].cls, lines[step].text);
        step++;
      }, 340);
    });
  }

  function buildLog(k: StageKey): { cls: string; text: string }[] {
    if (k === 'bronze') return [
      { cls: 'faint', text: `connect to SEC EDGAR · ${ticker}` },
      { cls: 'faint', text: `pulled ${filings?.count ?? '…'} filings (10-K, 10-Q)` },
      { cls: 'ok', text: `landed ${rawFacts != null ? abbrev(rawFacts) : '…'} raw facts — nothing dropped` },
    ];
    if (k === 'silver') return [
      { cls: 'faint', text: 'dedupe restated vintages → newest filing wins' },
      { cls: 'faint', text: 'reconcile synonym tags → one canonical line · derive fiscal quarter' },
      { cls: 'ok', text: stats ? `${abbrev(stats.bronze.raw_facts)} raw → ${abbrev(stats.silver.conformed_facts)} conformed (warehouse-wide)` : 'conformed' },
    ];
    if (k === 'gold') return [
      { cls: 'faint', text: 'place quarters · split-adjust · derive Q4 = annual − (Q1+Q2+Q3)' },
      { cls: 'ok', text: `${revHist.length} graded revenue quarters for ${ticker}` },
    ];
    return [
      { cls: 'faint', text: 'build point-in-time series (leakage-safe)' },
      { cls: 'faint', text: revPending ? `model: ${revPending.model}` : 'model' },
      { cls: 'ok', text: revPending ? `next quarter: ${usdB(revPending.forecast)}` : 'forecast' },
    ];
  }

  const logColor: Record<string, string> = {
    faint: 'text-slate-500', ok: 'text-emerald-400',
    'p-bronze': 'text-amber-500', 'p-silver': 'text-slate-300', 'p-gold': 'text-yellow-400', 'p-intelligence': 'text-purple-400',
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 mb-6">
      {/* header + company picker */}
      <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.18em] text-purple-400 mb-1.5">The pipeline</div>
          <h2 className="text-lg font-bold text-slate-100">Watch a company move through the warehouse</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">Run each layer in turn. The code under each step is the code that actually runs; the numbers are live.</p>
        </div>
        <label className="flex flex-col gap-1 text-right">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Company</span>
          <select
            value={ticker}
            onChange={e => setTicker(e.target.value)}
            className="font-mono text-sm bg-slate-900 text-slate-100 border border-slate-600 rounded-lg px-3 py-2 min-w-[180px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500"
          >
            {companies.map(c => <option key={c.ticker} value={c.ticker}>{c.ticker} — {c.name}</option>)}
          </select>
        </label>
      </div>

      {/* convergence funnel (warehouse-wide, real) */}
      <div className="flex rounded-lg border border-slate-700 bg-slate-900/60 overflow-x-auto mb-4">
        {funnel.map((f, i) => {
          const lit = ran[i];
          const a = LAYER_ACCENT[STAGES[i].layer];
          return (
            <div key={f.k} className={`flex-1 min-w-[120px] px-4 py-3 ${i > 0 ? 'border-l border-slate-700' : ''}`}>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{f.label}</div>
              <div className={`text-xl font-bold font-mono tabular-nums transition-colors ${lit ? a.text : 'text-slate-600'}`}>{f.num}</div>
              <div className="text-[11px] text-slate-500">{f.sub}</div>
            </div>
          );
        })}
      </div>

      {/* controls */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <button
          onClick={async () => { reset(); await sleep(0); for (let i = 0; i < STAGES.length; i++) { await runStage(i); await sleep(220); } }}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-purple-700 hover:bg-purple-600 text-white transition-colors"
        >▶ Run the whole pipeline</button>
        <button onClick={reset} className="px-4 py-2 rounded-lg text-sm font-mono border border-slate-600 text-slate-300 hover:border-slate-400 transition-colors">↺ Reset</button>
        <span className="text-xs font-mono text-slate-500">or run each layer below</span>
      </div>

      {/* stage cards — a row on wide screens (the left-to-right pipeline), wrapping on narrow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {STAGES.map((s, i) => {
          const a = LAYER_ACCENT[s.layer];
          const locked = i > 0 && !ran[i - 1];
          const done = ran[i];
          return (
            <div key={s.k} className={`rounded-xl border bg-slate-900/50 relative overflow-hidden transition-opacity ${locked ? 'opacity-50' : 'opacity-100'} border-slate-700`}>
              <div className={`h-[3px] ${a.dot}`} />
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${a.dot}`} />
                  <span className="font-mono text-xs uppercase tracking-wider font-semibold text-slate-200">{s.name}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 min-h-[48px]">{s.role}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => { if (!ran[i] && (i === 0 || ran[i - 1])) runStage(i); }}
                    disabled={locked || busy || done}
                    className="font-mono text-xs px-3 py-1.5 rounded-lg border border-slate-600 text-slate-200 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >{done ? 'Re-run' : `Run ${s.name}`}</button>
                  <span className={`font-mono text-[11px] ${done ? 'text-emerald-400' : locked ? 'text-slate-600' : 'text-slate-500'}`}>
                    {done ? 'done ✓' : locked ? 'queued' : 'ready'}
                  </span>
                </div>

                {/* output */}
                <div className="mt-3 min-h-[40px]">{done ? renderOutput(s.k) : <div className="text-xs font-mono text-slate-600">output appears after you run this layer</div>}</div>

                {/* code toggle */}
                {s.codeId && (
                  <>
                    <button onClick={() => setOpenCode(openCode === s.k ? null : s.k)} className={`mt-3 text-[11px] font-mono ${a.text} hover:underline`}>
                      {openCode === s.k ? '▾ hide transform' : '▸ show transform'}
                    </button>
                    {openCode === s.k && (
                      <pre className="mt-2 p-3 rounded-lg bg-[#0a0d13] border border-slate-700 text-[11px] leading-relaxed text-slate-300 font-mono overflow-x-auto max-h-64 whitespace-pre">
                        {codes[s.codeId] ?? 'Loading…'}
                      </pre>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* build log */}
      <div className="mt-4 rounded-lg border border-slate-700 bg-[#07090d] overflow-hidden">
        <div className="px-3 py-2 border-b border-slate-700 font-mono text-[11px] text-slate-500 tracking-wider">build log · {ticker}</div>
        <div ref={logRef} className="p-3 font-mono text-xs leading-relaxed max-h-44 overflow-y-auto">
          {log.map((l, i) => (
            <div key={i} className={logColor[l.cls] || 'text-slate-400'}>
              {l.cls.startsWith('p-') ? `■ ${l.text}` : <span><span className="text-slate-600">›</span> {l.text}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* hand-off CTA */}
      <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-slate-400">Now explore any layer in depth, or jump straight to the apps.</p>
        <div className="flex gap-2">
          <button onClick={() => onGoToLayer('bronze')} className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-600 text-slate-200 hover:border-slate-400 transition-colors">Start at Bronze →</button>
          <button onClick={() => onGoToLayer('intelligence')} className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-700 text-slate-100 hover:bg-slate-600 transition-colors">Jump to the forecast →</button>
        </div>
      </div>
    </div>
  );

  function renderOutput(k: StageKey) {
    if (k === 'bronze') {
      if (!filings) return <div className="text-xs font-mono text-slate-500">loading…</div>;
      return (
        <div className="text-xs font-mono">
          <div className="text-slate-200"><span className="text-amber-500 font-semibold">{abbrev(rawFacts || 0)}</span> raw facts · {filings.count} filings</div>
          <div className="mt-1 space-y-0.5 text-slate-500">
            {filings.filings.slice(0, 3).map(f => (
              <div key={f.accession} className="truncate">{f.form} · {f.filing_date} · {f.fact_count} facts</div>
            ))}
          </div>
        </div>
      );
    }
    if (k === 'silver') {
      return (
        <div className="text-xs font-mono text-slate-300">
          {stats && <div><span className="text-slate-300 font-semibold">{abbrev(stats.bronze.raw_facts)}</span> → <span className="text-slate-100 font-semibold">{abbrev(stats.silver.conformed_facts)}</span> conformed</div>}
          <div className="mt-1 text-slate-500">synonym tags collapse to one canonical line; each stamped with its filing date so the backtest never peeks ahead.</div>
        </div>
      );
    }
    if (k === 'gold') {
      if (!fc) return <div className="text-xs font-mono text-slate-500">loading…</div>;
      const recent = revHist.slice(-3);
      return (
        <div className="text-xs font-mono">
          <div className="text-slate-200"><span className="text-yellow-400 font-semibold">{revHist.length}</span> clean revenue quarters</div>
          <div className="mt-1 space-y-0.5 text-slate-500">
            {recent.map(h => (
              <div key={`${h.fiscal_year}Q${h.quarter}`}>FY{h.fiscal_year} Q{h.quarter} · {h.actual != null ? usdB(h.actual) : '—'}</div>
            ))}
          </div>
        </div>
      );
    }
    // forecast
    if (!fc || !revPending) return <div className="text-xs font-mono text-slate-500">no forecast tracked</div>;
    const acc = fc.accuracy?.revenue;
    return (
      <div className="text-xs font-mono">
        <div className="text-slate-200">FY{revPending.fiscal_year} Q{revPending.quarter}: <span className="text-purple-400 font-semibold">{usdB(revPending.forecast)}</span></div>
        <div className="text-slate-500 mt-0.5">80% band {usdB(revPending.interval_80[0])} – {usdB(revPending.interval_80[1])}</div>
        {acc && <div className="text-slate-500 mt-0.5">track record: {acc.our_mape}% vs street {acc.consensus_mape ?? '—'}% (n={acc.n})</div>}
      </div>
    );
  }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
