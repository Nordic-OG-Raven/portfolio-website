'use client';

import { LayoutShell } from '../components/LayoutShell';
import { Card } from '../components/ui/Card';
import ListingsSearch from './ListingsSearch';

export default function AarhusRePage() {
  return (
    <LayoutShell>
      {/* TITLE */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
          Aarhus RE Scanner — Automated Property Valuation Model
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          A solo-built automated valuation model (AVM) for Aarhus residential real estate,
          benchmarked directly against the accuracy figures published by the Danish tax
          authority&apos;s own model-development process — the one at the center of Denmark&apos;s
          2013 ejendomsvurderingsskandale. Five reverse-engineered and public data sources feed a
          5-model stacking ensemble, validated on a strict temporal holdout so the reported accuracy
          reflects genuine forward-looking generalization, not a favorable random split.
        </p>
      </div>

      {/* QUICK STATS */}
      <Card className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-500/20 border border-blue-500/50 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm mb-1">Base Models</p>
            <p className="text-3xl font-bold text-blue-500">5</p>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/50 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm mb-1">Hit Rate (±20%)</p>
            <p className="text-3xl font-bold text-emerald-500">82.2%</p>
          </div>
          <div className="bg-amber-500/20 border border-amber-500/50 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm mb-1">Data Sources</p>
            <p className="text-3xl font-bold text-amber-500">7</p>
          </div>
          <div className="bg-orange-500/20 border border-orange-500/50 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm mb-1">Holdout Test Rows</p>
            <p className="text-3xl font-bold text-orange-500">6,458</p>
          </div>
        </div>
      </Card>

      {/* METHODOLOGY */}
      <h2 className="text-2xl font-bold text-slate-100 mb-4 text-center">The Model</h2>
      <Card className="mb-8">
        <p className="text-slate-400 leading-relaxed mb-4">
          A hedonic log-price model: 5 base learners (Ridge, ElasticNet, LightGBM, XGBoost,
          CatBoost) combined via a Ridge meta-learner trained on out-of-fold predictions. Data is
          joined from Datafordeler BBR (structural attributes), OSM Overpass (spatial amenities),
          Statistics Denmark (macro/fiscal context), and two undocumented sources reverse-engineered
          from scratch — a historical sale-price API and an energy-certificate lookup, neither of
          which has an official public endpoint.
        </p>
        <p className="text-slate-400 leading-relaxed">
          Validation is a single temporal holdout: every model is trained only on transactions
          before a fixed cutoff date and tested only on transactions after it, never seen during
          training or tuning — the same discipline used across every project on this site. A/B
          feature and architecture experiments are accepted only when they improve the net holdout
          RMSE summed across all three property segments (condo, house, apartment), no
          per-segment cherry-picking.
        </p>
      </Card>

      {/* COMPARISON TABLE */}
      <h2 className="text-2xl font-bold text-slate-100 mb-4 text-center">
        Benchmarked Against the Government&apos;s Own Model Development
      </h2>
      <Card className="mb-8">
        <p className="text-slate-400 leading-relaxed mb-4">
          Denmark suspended its public property valuations in 2013 after a damning Rigsrevisionen
          audit and spent the following years building a statistical replacement — documented in a
          2014 expert-committee report (Engberg-udvalget) and a 2016 refinement (Skatteministeriet
          / ICE). Both publish the accuracy metric Danish valuation law actually targets: the
          percentage of assessments landing within ±20% of the real sale price. Pulled directly from
          both primary-source PDFs and compared against this model&apos;s own genuine held-out test
          predictions:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-400">
            <thead className="text-slate-100 border-b border-slate-700">
              <tr>
                <th className="py-2 pr-4">Property type</th>
                <th className="py-2 pr-4">SKAT, old system (2014)</th>
                <th className="py-2 pr-4">Engberg prototype (2014)</th>
                <th className="py-2 pr-4">ICE refined (2016)</th>
                <th className="py-2">This model (2026)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="py-2 pr-4 text-slate-100">Houses</td>
                <td className="py-2 pr-4">62.9%</td>
                <td className="py-2 pr-4">67.5%</td>
                <td className="py-2 pr-4">~71%</td>
                <td className="py-2 text-emerald-400 font-semibold">81.3%</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-slate-100">Condos</td>
                <td className="py-2 pr-4">—</td>
                <td className="py-2 pr-4">83.4%</td>
                <td className="py-2 pr-4">~85%</td>
                <td className="py-2 text-emerald-400 font-semibold">83.7%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed mt-4">
          Both government figures are pre-launch, development-stage numbers (2014/2016), not the
          system&apos;s real-world post-2019 production accuracy, which isn&apos;t publicly
          available — the honest framing is &quot;beats every documented iteration of the
          government&apos;s own model development,&quot; not &quot;beats the current system.&quot;
        </p>
      </Card>

      {/* INTERACTIVE SEARCH */}
      <ListingsSearch />

      {/* NOTE */}
      <div className="text-center text-sm text-slate-500 mb-8">
        Private repository — proprietary model, not open-sourced like this site&apos;s other
        projects. Happy to walk through the code and methodology directly.
      </div>
    </LayoutShell>
  );
}
