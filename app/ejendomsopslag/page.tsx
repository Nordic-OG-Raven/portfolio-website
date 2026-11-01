'use client';

import Image from 'next/image';
import { LayoutShell } from '../components/LayoutShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const LIVE_URL = 'https://bde-ejendomsopslag.streamlit.app';

const skills = ['Python', 'Streamlit', 'GraphQL', 'REST API Integration', 'Reverse Engineering', 'pytest', 'BeautifulSoup', 'Danish Open Data'];

export default function EjendomsopslagPage() {
  return (
    <LayoutShell>
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">Instant data lookup for any Danish address</h1>
        <p className="text-lg text-slate-400 max-w-3xl">
          Combines five government and public sources in seconds, including two undocumented APIs I reverse-engineered.
        </p>
      </div>

      <Card className="mb-8">
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden mb-6">
          <Image src="/ejendomsopslag.jpg" alt="Ejendomsopslag" fill className="object-cover" sizes="100vw" priority />
        </div>
        <a href={LIVE_URL} target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="primary" className="w-full justify-center">Launch the live app →</Button>
        </a>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Overview</h2>
        <p className="text-slate-400 leading-relaxed">
          Gives anyone a full picture of a Danish address in seconds. It enriches any address with data from five
          government and public sources, including reverse-engineering two undocumented APIs where no official access
          existed. Deployed with full test coverage, structured logging, and GraphQL/REST integration against Denmark&apos;s
          national data-distribution platform.
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Highlights</h2>
        <ul className="list-disc list-inside space-y-2 text-slate-400">
          <li>Pulls together five government and public data sources (BBR building records, historical sale prices, energy certificates, and more) for any address.</li>
          <li>Reverse-engineered two undocumented APIs where no official access existed.</li>
          <li>Integrates with Denmark&apos;s national data-distribution platform (Datafordeler) over GraphQL and REST.</li>
          <li>Full test coverage with pytest and structured logging, built to return a complete picture in seconds.</li>
        </ul>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Built with</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s} className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded-md">{s}</span>
          ))}
        </div>
      </Card>
    </LayoutShell>
  );
}
