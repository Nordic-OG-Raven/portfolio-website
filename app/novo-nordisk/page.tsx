'use client';

import Image from 'next/image';
import { LayoutShell } from '../components/LayoutShell';
import { Card } from '../components/ui/Card';

export default function NovoNordiskPage() {
  return (
    <LayoutShell>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
          Novo Nordisk Financial Analysis
        </h1>
        <p className="text-lg text-slate-400 max-w-3xl">
          Strategic analysis of Novo Nordisk - Denmark's pharmaceutical leader
          and GLP-1 innovator. This dashboard provides insights into financial
          performance, competitive positioning, R&D efficiency, and market dynamics.
        </p>
      </div>

      {/* Methodology Section */}
      <Card className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Analysis Methodology</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Data Sources</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Yahoo Finance: Financial statements & stock prices (2015-2024)</li>
              <li>Financial Modeling Prep: Supplementary ratios</li>
              <li>Eurostat: Healthcare & pharmaceutical market data</li>
              <li>Danish Statistics: R&D expenditure & employment data</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Key Metrics</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Profitability: Margins, ROE, ROA, ROIC</li>
              <li>Liquidity: Current, Quick, Cash ratios</li>
              <li>Leverage: Debt-to-Equity, Debt-to-Assets</li>
              <li>Growth: Revenue, Net Income, FCF trends</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Dashboard Images */}
      <Card className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Strategic Financials Dashboard</h2>
        <p className="text-slate-400 mb-6">
          Comprehensive analysis covering market positioning, financial fundamentals, and capital allocation strategies.
        </p>
        <div className="space-y-6">
          <div className="relative w-full">
            <Image
              src="/novo-data-analysis-2025-11-05T22-09-23.149Z.jpg"
              alt="Novo Nordisk Strategic Financials Dashboard"
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg shadow-lg"
              priority
            />
          </div>
        </div>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Innovation & R&D Focus</h2>
        <p className="text-slate-400 mb-6">
          Analysis of R&D investment, efficiency, and innovation returns compared to industry peers.
        </p>
        <div className="space-y-6">
          <div className="relative w-full">
            <Image
              src="/novo-data-analysis-2025-11-05T22-11-20.258Z.jpg"
              alt="Novo Nordisk Innovation & R&D Dashboard"
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg shadow-lg"
              priority
            />
          </div>
        </div>
      </Card>

      {/* Peer Comparison Note */}
      <Card className="bg-blue-500/20 border-blue-500/50">
        <h3 className="text-lg font-semibold text-blue-400 mb-2">Peer Comparison</h3>
        <p className="text-blue-300 text-sm">
          This analysis compares Novo Nordisk against key competitors including Eli Lilly (LLY),
          Sanofi (SNY), AstraZeneca (AZN), Novartis (NVS), and Bayer (BAYRY) across multiple
          financial dimensions including market positioning, profitability, R&D efficiency, and capital allocation.
        </p>
      </Card>
    </LayoutShell>
  );
}
