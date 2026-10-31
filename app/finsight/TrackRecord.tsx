'use client';

import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

interface ScoreRow {
  ticker: string;
  metric: string;
  n: number;
  our_mape: number | null;
  consensus_mape: number | null;
}

interface Overall {
  metric: string;
  our_mape: number | null;
  consensus_mape: number | null;
  n: number;
}

interface TrackRecordData {
  pending_count: number;
  overall: Overall[];
  scorecard: ScoreRow[];
}

interface TrackRecordProps {
  API_BASE: string;
}

const METRIC_LABEL: Record<string, string> = {
  revenue: 'Revenue',
  revenue_q4: 'Revenue (Q4)',
  eps: 'EPS',
};

const metricName = (m: string) => METRIC_LABEL[m] || m;
const fmt = (x: number | null) => (x === null ? '—' : `${x.toFixed(1)}%`);

// Intelligence: the live, leakage-safe forecast track record — our realized accuracy vs analyst
// consensus, graded against what each company actually reported. Lower MAPE is better.
export default function TrackRecord({ API_BASE }: TrackRecordProps) {
  const [data, setData] = useState<TrackRecordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}?path=${encodeURIComponent('/api/track-record')}`, { signal: controller.signal })
      .then(async res => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
        return body;
      })
      .then(setData)
      .catch(err => { if (err.name !== 'AbortError') setError(err.message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [API_BASE]);

  if (loading) {
    return (
      <Card hover={false}>
        <div className="flex items-center gap-3 text-slate-400">
          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500" />
          Loading track record...
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-500/20 border-l-4 border-red-500 p-4 rounded-lg">
        <p className="text-sm text-red-400">{error || 'No track record available.'}</p>
      </div>
    );
  }

  const cell = (our: number | null, cons: number | null, which: 'our' | 'cons') => {
    const val = which === 'our' ? our : cons;
    const better = our !== null && cons !== null && (which === 'our' ? our <= cons : cons < our);
    return (
      <span className={`font-mono tabular-nums ${better ? 'text-emerald-400 font-semibold' : 'text-slate-300'}`}>
        {fmt(val)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <Card hover={false}>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Live forecast track record</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Every forecast is logged before the company reports, then graded against the actual result and
          against analyst consensus. These are realized errors over time (mean absolute percentage error,
          so lower is better), not a backtest. The automated, filings-only method matches consensus on
          stable names and leads on guidance-driven hyper-growth (NVIDIA, Broadcom); consensus, which
          folds in company guidance and segment detail, leads on the rest. {data.pending_count} forecasts
          are currently logged and awaiting their next report. Consensus via MarketBeat.
        </p>
      </Card>

      {/* Overall by metric */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {data.overall.map(o => {
          const weWin = o.our_mape !== null && o.consensus_mape !== null && o.our_mape <= o.consensus_mape;
          return (
            <Card key={o.metric} hover={false}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-200">{metricName(o.metric)}</span>
                <Badge variant="default">{o.n} graded</Badge>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div className="text-xs text-slate-500">FinSight</div>
                  <div className={`text-2xl font-bold font-mono ${weWin ? 'text-emerald-400' : 'text-slate-100'}`}>{fmt(o.our_mape)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Consensus</div>
                  <div className={`text-2xl font-bold font-mono ${!weWin ? 'text-emerald-400' : 'text-slate-300'}`}>{fmt(o.consensus_mape)}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Per-company scorecard */}
      <Card hover={false} className="overflow-hidden">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">By company</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Metric</th>
                <th className="px-3 py-2 text-right">Quarters</th>
                <th className="px-3 py-2 text-right">FinSight MAPE</th>
                <th className="px-3 py-2 text-right">Consensus MAPE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {data.scorecard.map((r, i) => (
                <tr key={`${r.ticker}-${r.metric}-${i}`} className="hover:bg-slate-700/40">
                  <td className="px-3 py-2 text-sm text-slate-100 font-medium">{r.ticker}</td>
                  <td className="px-3 py-2 text-sm text-slate-400">{metricName(r.metric)}</td>
                  <td className="px-3 py-2 text-sm text-right text-slate-400 tabular-nums">{r.n}</td>
                  <td className="px-3 py-2 text-sm text-right">{cell(r.our_mape, r.consensus_mape, 'our')}</td>
                  <td className="px-3 py-2 text-sm text-right">{cell(r.our_mape, r.consensus_mape, 'cons')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-3">Green marks the lower error in each row. Lower is better.</p>
      </Card>
    </div>
  );
}
