'use client';

import MASFlow from '../components/MASFlow';
import Link from 'next/link';

export default function AInewsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            ← Back to Portfolio
          </Link>
        </div>

        {/* TITLE */}
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
          Multi-Agent System (MAS) for AI Research and News Curation
        </h1>

        {/* LINK TO COMPANY PAGE */}
        <p className="text-center text-gray-700 mb-8 text-lg">
          To follow along the news letter and have a read,{' '}
          <a 
            href="https://www.linkedin.com/company/nordic-raven-solutions/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            follow this link
          </a>
          , or visit @NordicRavenSolutions on linkedin
        </p>

        {/* PERFORMANCE METRICS HEADING */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Performance Metrics</h2>

        {/* PERFORMANCE METRICS */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm mb-1">Articles Processed</p>
              <p className="text-3xl font-bold text-blue-600">150 → 6</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm mb-1">Rejection Rate</p>
              <p className="text-3xl font-bold text-green-600">96%</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm mb-1">Avg Quality Score</p>
              <p className="text-3xl font-bold text-purple-600">6.1/10</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm mb-1">Components</p>
              <p className="text-3xl font-bold text-yellow-600">11</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm mb-1">Cost/Daily Digest</p>
              <p className="text-3xl font-bold text-orange-600">~$0.50</p>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS HEADING */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">How It Works</h2>

        {/* INSTRUCTION */}
        <p className="text-gray-700 mb-6 text-center">Click any component for details</p>

        {/* Interactive Flow Diagram */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <MASFlow />
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 text-center">
          <p className="text-gray-600 text-sm">
            • Open source • AI-powered but quality focused • In the spirit of continuous learning
          </p>
        </div>
      </div>
    </div>
  );
}

