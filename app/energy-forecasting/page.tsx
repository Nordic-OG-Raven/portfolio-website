'use client';

import Image from 'next/image';
import { LayoutShell } from '../components/LayoutShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const REPO = 'Nordic-OG-Raven/dk-power-price-forecasting';
const BRANCH = 'master';

function colabUrl(notebook: string) {
  return `https://colab.research.google.com/github/${REPO}/blob/${BRANCH}/notebooks/${notebook}`;
}

interface NotebookEntry {
  number: string;
  file: string;
  title: string;
  methodology: string;
  finding: string;
  image?: { src: string; alt: string };
}

const notebooks: NotebookEntry[] = [
  {
    number: '01',
    file: '01_data_exploration.ipynb',
    title: 'Data Exploration',
    methodology:
      "Pulls DK1/DK2 day-ahead and imbalance prices from Energinet's free API and checks whether the series actually looks like a real power market before building anything on top of it: distribution shape, negative-price mechanics, daily/weekly seasonality, autocorrelation, and the DK1-DK2 spread.",
    finding:
      'A real, volatile, occasionally-negative price series with a clear physical story (negative prices coincide with high wind + low demand), setting up exactly which features are worth engineering next.',
    image: { src: '/energy-forecasting/nb01-price-series.png', alt: 'DK1 vs DK2 day-ahead price series, 2022-2026' },
  },
  {
    number: '02',
    file: '02_day_ahead_forecast.ipynb',
    title: 'Day-Ahead Price Forecast',
    methodology:
      'Ridge, Lasso, LightGBM, XGBoost, and Holt-Winters exponential smoothing, combined into a weighted blend, evaluated with walk-forward (not shuffled) cross-validation against a seasonal-naive baseline.',
    finding:
      'Strong, consistent skill: every tree/linear model beats naive by ~55% RMSE reduction, in every fold, not just on average.',
    image: { src: '/energy-forecasting/nb02-skill-comparison.png', alt: 'Day-ahead model skill vs. seasonal-naive baseline, by model' },
  },
  {
    number: '03',
    file: '03_imbalance_divergence_model.ipynb',
    title: 'Imbalance Divergence Model',
    methodology:
      'Same model-family approach applied to the actual trading target: the gap between the day-ahead price and the real-time imbalance price. Adds a direction classifier track (logistic regression + LightGBM) scored on AUC, since the strategy only needs the sign right, not the exact magnitude.',
    finding:
      'The first pass found zero skill, an honest negative result. Adding real-time regulation-state features (aFRR/mFRR activation, imbalance direction) that the original pipeline was silently discarding turned "no signal" into a real, statistically significant one.',
    image: { src: '/energy-forecasting/nb03-classifier-auc.png', alt: 'Direction classifier accuracy and AUC vs. chance' },
  },
  {
    number: '04',
    file: '04_backtest_strategy.ipynb',
    title: 'Backtest Strategy',
    methodology:
      'Turns predicted divergence into a position (sign, proportional, or confidence-scaled sizing) and computes Sharpe, drawdown, hit rate, and a transaction-cost sensitivity sweep, since no published fee schedule exists for this exact settlement path.',
    finding:
      "Backtest Sharpe jumped from a fragile 0.35 to ~10.5, large enough to be immediately suspicious, which is exactly what triggered the validation chain in notebooks 05-06 rather than being taken at face value.",
    image: { src: '/energy-forecasting/nb04-equity-curve.png', alt: 'Out-of-sample cumulative P&L vs. a perfect-foresight ceiling' },
  },
  {
    number: '05',
    file: '05_holdout_validation.ipynb',
    title: 'Holdout Validation',
    methodology:
      'A strictly sealed-off final 120 days, untouched by any exploration or feature-engineering decision made earlier in the project. Every model is fit once on development data and scored once on the holdout, no peeking, no second attempt.',
    finding:
      'The edge held up and got stronger, not weaker (correlation 0.138 -> 0.283, Sharpe 10.5 -> 20.4) — the single strongest evidence available that a good backtest number is real rather than overfit.',
    image: { src: '/energy-forecasting/nb05-holdout-chunks.png', alt: 'Holdout P&L by roughly two-week chunk' },
  },
  {
    number: '06',
    file: '06_cpcv_validation.ipynb',
    title: 'Combinatorial Purged Cross-Validation',
    methodology:
      "Lopez de Prado's CPCV (Advances in Financial Machine Learning): instead of one train/test split, tests many different combinatorial train/test paths with proper embargo purging around each test block.",
    finding: '15 out of 15 purged combinations came back with positive correlation and positive Sharpe — the effect does not depend on which specific historical path is used to test it.',
    image: { src: '/energy-forecasting/nb06-cpcv-distribution.png', alt: 'Distribution of correlation and Sharpe across 15 CPCV combinations' },
  },
  {
    number: '07',
    file: '07_dk2_replication.ipynb',
    title: 'DK2 Replication',
    methodology:
      'The exact DK1-tuned recipe — same features, same hyperparameters, zero re-tuning — run unmodified on DK2, a physically different price zone (no direct Norway interconnector, different generation mix).',
    finding:
      "Generalizes: DK2's walk-forward correlation (0.195) is actually stronger than DK1's (0.138), real evidence this is a structural property of the Nordic balancing market, not a DK1-specific artifact, though DK2's absolute Sharpe is lower and its edge is more concentrated in the classifier.",
    image: { src: '/energy-forecasting/nb07-dk1-vs-dk2.png', alt: 'DK1 vs. DK2: walk-forward correlation and blind-holdout Sharpe' },
  },
  {
    number: '08',
    file: '08_tail_risk.ipynb',
    title: 'Tail Risk',
    methodology:
      "Triggered by a professional energy trader's direct challenge: a good Sharpe doesn't rule out getting wiped out by one price spike. Adds VaR/CVaR/skew/kurtosis, tests volatility-scaled sizing and cross-zone diversification as mitigations, fits an Extreme Value Theory tail estimate, and tries four independent methods to predict shocks in advance.",
    finding:
      "The concern was real: a single hour could lose 7% of the strategy's entire multi-year profit. Mitigations cut that worst hour by 67% while improving Sharpe. All four early-warning attempts (a statistical test, a candidate feature, a full ML classifier, high-resolution real-time data) failed to predict DK1's instantaneous shocks — strong evidence the risk is genuinely irreducible with public data.",
    image: { src: '/energy-forecasting/nb08-tail-risk-mitigation.png', alt: 'Worst single-hour loss and Sharpe, before and after tail-risk mitigation' },
  },
  {
    number: '09',
    file: '09_15min_divergence_model.ipynb',
    title: 'Native 15-Minute Divergence Model',
    methodology:
      "A live data check found Denmark's balancing market has actually settled every 15 minutes since 2023, not hourly — every earlier notebook had been trained on hourly averages of a finer-grained market. Rebuilds the model at native 15-minute resolution, extends training data through the full history, re-applies the tail-risk mitigations, checks transaction costs and probability of strategy failure, and refines a walk-backward causality test to isolate a calendar-window confound.",
    finding:
      "A materially stronger edge than the hourly model — hourly averaging was hiding real signal, not manufacturing a false one. A $1M portfolio at a market-impact-safe position would average ~€37,300/month, but real risk-sizing should anchor to the Extreme-Value-Theory worst case (€4,300-18,000 in a single 15-minute window), 14-57x larger than anything the backtest's own limited history happened to show.",
    image: { src: '/energy-forecasting/nb09-capital-sizing.png', alt: 'Average monthly P&L vs. EVT-anchored worst-case, $1M portfolio' },
  },
];

export default function EnergyForecastingPage() {
  return (
    <LayoutShell>
      {/* TITLE */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
          DK1/DK2 Power Price Forecasting + Backtested Divergence Strategy
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          Can you build a trading strategy, using only free public data, around the gap between
          Denmark&apos;s day-ahead power price and the real-time imbalance price that settles after
          the fact? Nine notebooks, run in order, each answering one specific question: an honest
          negative result, the feature fix that turned it real, four independent rounds of
          skepticism (blind holdout, Combinatorial Purged CV, a second price zone, tail-risk
          stress-testing), and a structural discovery that the whole model had been trained at the
          wrong time resolution. Every negative result and correction along the way is reported in
          the notebooks, not smoothed over.
        </p>
      </div>

      {/* QUICK STATS */}
      <Card className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-500/20 border border-blue-500/50 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm mb-1">Notebooks</p>
            <p className="text-3xl font-bold text-blue-500">9</p>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/50 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm mb-1">CPCV Splits Positive</p>
            <p className="text-3xl font-bold text-emerald-500">15/15</p>
          </div>
          <div className="bg-amber-500/20 border border-amber-500/50 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm mb-1">Price Zones</p>
            <p className="text-3xl font-bold text-amber-500">DK1 + DK2</p>
          </div>
          <div className="bg-orange-500/20 border border-orange-500/50 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm mb-1">Data Source</p>
            <p className="text-3xl font-bold text-orange-500">100% Free</p>
          </div>
        </div>
      </Card>

      {/* WHICH MODEL, WHEN */}
      <h2 className="text-2xl font-bold text-slate-100 mb-4 text-center">Two Models, On Purpose</h2>
      <Card className="mb-8">
        <p className="text-slate-400 leading-relaxed mb-4">
          The project ended up with two genuinely separate, independently-validated models, not one
          merged pipeline. They coexist because Denmark&apos;s day-ahead auction only started
          clearing every 15 minutes on 2025-09-30 — before that, only one position per hour was ever
          achievable, even though the underlying imbalance settlement has been 15-minute since 2023.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-400">
            <thead className="text-slate-100 border-b border-slate-700">
              <tr>
                <th className="py-2 pr-4"></th>
                <th className="py-2 pr-4">Hourly model (01-08)</th>
                <th className="py-2">15-min model (09)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="py-2 pr-4 text-slate-100">Tradeable window</td>
                <td className="py-2 pr-4">2022-01 onward (~4.5 years)</td>
                <td className="py-2">2025-09-30 onward (~11 months)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-slate-100">Validation</td>
                <td className="py-2 pr-4">Full gauntlet: walk-forward, blind holdout, CPCV, DK2 replication, tail-risk/EVT</td>
                <td className="py-2">Same full gauntlet, run independently at 15-min resolution</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-slate-100">Edge size</td>
                <td className="py-2 pr-4">Real, but smaller</td>
                <td className="py-2">Materially stronger — hourly averaging was hiding signal</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-slate-100">Best for</td>
                <td className="py-2 pr-4">Longest validated track record, one trade per hour</td>
                <td className="py-2">Quarter-hourly signals, post-2025-09-30 regime</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* NOTEBOOKS */}
      <h2 className="text-2xl font-bold text-slate-100 mb-4 text-center">The Nine Notebooks</h2>
      <div className="space-y-6 mb-8">
        {notebooks.map((nb) => (
          <Card key={nb.file} className="flex flex-col md:flex-row gap-6">
            {nb.image && (
              <div className="relative w-full md:w-96 h-56 flex-shrink-0 overflow-hidden rounded-lg bg-white">
                <Image
                  src={nb.image.src}
                  alt={nb.image.alt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 384px"
                />
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-slate-100 mb-1">
                <span className="text-purple-700 mr-2">{nb.number}</span>
                {nb.title}
              </h3>
              <p className="text-sm text-slate-500 mb-3">
                <span className="text-slate-100 font-semibold">Methodology: </span>
                {nb.methodology}
              </p>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                <span className="text-slate-100 font-semibold">Key finding: </span>
                {nb.finding}
              </p>
              <div className="mt-auto">
                <a href={colabUrl(nb.file)} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" className="text-sm px-4 py-2">
                    Open Notebook in Colab
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* BIGGER PICTURE */}
      <Card className="bg-gradient-to-r from-purple-700/10 to-purple-700/5 border-purple-700/20 mb-8">
        <h3 className="text-lg font-semibold text-slate-100 mb-2">Does This Kind of Strategy Actually Work?</h3>
        <div className="text-slate-400 text-sm leading-relaxed space-y-3">
          <p>
            Trading the gap between the day-ahead price and the real-time imbalance price is a
            well-known idea in energy markets, but it&apos;s rarely tested this rigorously end to
            end on public data alone. The answer here is a qualified yes: the edge is real, not an
            artifact of one clever model or a lucky backtest window. It held up under a blind
            holdout, fifteen independently resampled test paths, and an unmodified replication in a
            second, physically different price zone. Its source is intuitive, too — grid imbalance
            is persistent minute to minute, so recent regulation activity is genuinely informative
            about what happens next, a real physical mechanism rather than a statistical
            coincidence.
          </p>
          <p>
            But real doesn&apos;t mean free money. The same short-lag mechanism that makes the edge
            trustworthy also caps how large it can get before market impact takes over, and it
            comes bundled with real, structurally unavoidable tail risk: a handful of instantaneous
            price shocks that no amount of public data can currently predict in advance. A viable
            version of this strategy looks less like &quot;find the signal, deploy it&quot; and more
            like a risk-management discipline — sizing positions off the worst case a statistical
            tail model implies, not the best case a backtest happens to show.
          </p>
          <p>
            The more interesting structural finding is about market microstructure, not modeling.
            Rebuilding the same strategy at the market&apos;s actual 15-minute settlement resolution,
            instead of the hourly averages this project started with, revealed a meaningfully
            stronger edge than the coarser view ever showed. Hourly aggregation wasn&apos;t just
            imprecise, it was actively destroying signal that the real-time market carries. That&apos;s
            a broader lesson for modeling any market that settles faster than the data conventionally
            used to study it: the resolution you choose isn&apos;t a neutral implementation detail —
            it can determine whether you find the edge at all.
          </p>
        </div>
      </Card>

      {/* CTA */}
      <div className="text-center mb-8">
        <a
          href={`https://github.com/${REPO}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="primary">View Full Repo on GitHub</Button>
        </a>
      </div>
    </LayoutShell>
  );
}
