'use client';

import Image from 'next/image';
import { LayoutShell } from '../components/LayoutShell';
import { Card } from '../components/ui/Card';

export default function KaggleHousePricesPage() {
  return (
    <LayoutShell>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
          House Prices Prediction
        </h1>
        <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
          Real Estate Economics Meets Machine Learning. A Kaggle competition solution combining 
          hedonic pricing theory with modern ML techniques. Achieved top-tier performance through 
          theory-driven feature engineering, 8-model hybrid ensemble, and disciplined stacking.
        </p>
      </div>

      {/* Key Results Section */}
      <Card className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-6">Key Results</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-3">Performance</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li>
                Average prediction error: <span className="text-green-400 font-semibold">~11.8%</span> 
                <span className="text-slate-500 text-sm ml-2">(Log-RMSE: 0.111909)</span>
              </li>
              <li>Final Feature Count: 254 features</li>
              <li>Ensemble Architecture: 8-model hybrid with 2-level stacking</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-3">Methodology</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li>2-level stacking with Ridge meta-model for optimal model combination</li>
              <li>Theory-driven feature engineering based on hedonic pricing principles</li>
              <li>Domain-aware missing value imputation treating structural absence vs. unknown data</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Leaderboard Visualization */}
      <Card className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Competition Performance</h2>
        <p className="text-slate-400 mb-6">
          Leaderboard visualization showing the ensemble's performance across different model combinations 
          and stacking strategies. The final hybrid ensemble achieved optimal balance between bias and variance.
        </p>
        <div className="space-y-6">
          <div className="relative w-full">
            <Image
              src="/kaggle-leaderboard-viz.png"
              alt="Kaggle House Prices Competition Leaderboard Visualization"
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg shadow-lg"
              priority
            />
          </div>
        </div>
      </Card>

      {/* Methodology Section */}
      <Card className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Theoretical Foundation</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Hedonic Pricing Theory</h3>
            <p className="text-slate-400 mb-3">
              A house is a bundle of attributes. The price is the sum of the implicit values of each attribute.
            </p>
            <p className="text-slate-400 text-sm">
              <strong>P = f(S, T)</strong> where S = Structural attributes (size, rooms, quality) and 
              T = Locational attributes (neighborhood, externalities, lot configuration).
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Feature Engineering Principles</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Log transforms for diminishing marginal utility</li>
              <li>Composite features for hedonic pricing</li>
              <li>Spatial equilibrium via neighborhood encoding</li>
              <li>Domain-aware missing value handling</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Ensemble Architecture */}
      <Card className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Ensemble Architecture</h2>
        <div className="space-y-4 text-slate-400">
          <p>
            The solution uses a <strong className="text-slate-100">disciplined 2-level stacking approach</strong> 
            combining 8 diverse models to capture different aspects of the hedonic pricing function.
          </p>
          
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Level 1: Base Models (8 models)</h3>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
              <li>
                <strong className="text-slate-100">Linear Models:</strong> Ridge, LASSO, ElasticNet, BayesianRidge, KernelRidge
              </li>
              <li>
                <strong className="text-slate-100">Tree-based Models:</strong> XGBoost, LightGBM, CatBoost, GradientBoosting
              </li>
            </ul>
            <p className="text-sm ml-4">
              Each model captures different aspects of the hedonic pricing function - linear models approximate 
              the additive attribute values, while tree models capture complex interactions between structural and 
              locational attributes.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Level 2: Meta-Model</h3>
            <p className="ml-4">
              Ridge regression (alpha=2) trained on out-of-fold predictions. This simple meta-model prevents 
              overfitting while learning optimal combinations of base model outputs.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Final Blend</h3>
            <p className="ml-4">
              Weighted combination of Level 2 stacking output, tree-based model average, and linear model average. 
              This hybrid approach balances the complementary strengths of different model families.
            </p>
          </div>
        </div>
      </Card>

      {/* Kaggle Link */}
      <Card className="bg-purple-500/20 border-purple-500/50">
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Full Notebook & Code</h3>
        <p className="text-purple-300 text-sm mb-4">
          Explore the complete implementation, methodology, and experimental results on Kaggle. The notebook 
          includes detailed explanations of theory-driven feature engineering, ensemble architecture, and 
          performance analysis.
        </p>
        <a
          href="https://www.kaggle.com/code/jonashaahr/jh-advanced-regression"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
        >
          View on Kaggle
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </Card>
    </LayoutShell>
  );
}

