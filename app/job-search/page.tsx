'use client';

import { LayoutShell } from '../components/LayoutShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function JobSearchPage() {
  return (
    <LayoutShell>
      {/* TITLE */}
      <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6 text-center">
        An End-to-End AI System for Finding, Applying to, and Landing a Job
      </h1>

      {/* LINK TO REPO */}
      <p className="text-center text-slate-400 mb-8 text-lg">
        Open source and free to use —{' '}
        <a
          href="https://github.com/Nordic-OG-Raven/job_search"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-700 hover:text-purple-600 font-semibold transition-colors"
        >
          get it on GitHub
        </a>
      </p>

      {/* INTRO */}
      <Card className="mb-8">
        <p className="text-slate-400 leading-relaxed">
          Most job-search tools search. This one runs the whole loop: it finds relevant
          roles across 8 portals and 5 countries before most applicants even see them
          (because many employers favor whoever applies first), mines years of old CVs
          into one comprehensive, fact-checked profile so nothing gets forgotten or
          quietly contradicted, drafts tailored applications strictly grounded in that
          profile, preps for the interview that follows, and tells me the highest-leverage
          way to spend spare time closing the gaps employers are actually asking for —
          instead of guessing at what to learn next.
        </p>
      </Card>

      {/* THE FULL LOOP */}
      <h2 className="text-2xl font-bold text-slate-100 mb-4 text-center">The Full Loop</h2>
      <Card className="mb-8">
        <ul className="space-y-4 text-slate-400 leading-relaxed">
          <li>
            <span className="text-slate-100 font-semibold">Daily multi-portal scanning.</span>{' '}
            Runs automatically every morning across 8 job portals spanning Denmark,
            Luxembourg, Switzerland, Australia, and Canada, evaluates every new posting
            for fit against my actual background, and surfaces only what's worth looking
            at — same day it's posted, not whenever I happen to go searching.
          </li>
          <li>
            <span className="text-slate-100 font-semibold">Master CV generation.</span>{' '}
            Mines an entire archive of historical CVs and cover letters going back years,
            cross-references them against my current profile, adds what's genuinely new,
            and flags contradictions (mismatched dates, conflicting claims) instead of
            silently guessing which version is right. One canonical, complete profile
            instead of a dozen half-updated CV files.
          </li>
          <li>
            <span className="text-slate-100 font-semibold">Tailored applications.</span>{' '}
            Drafts a CV and cover letter for each specific role, strictly grounded in the
            verified profile — nothing fabricated or inflated — and checked against a
            hard-rule set that catches things like misrepresenting seniority or quietly
            dropping a disclosed gap.
          </li>
          <li>
            <span className="text-slate-100 font-semibold">Interview prep.</span>{' '}
            Once an application lands an interview, generates role-specific prep —
            likely questions, talking points, and where my actual experience maps to
            what the role is asking for.
          </li>
          <li>
            <span className="text-slate-100 font-semibold">Career ROI.</span>{' '}
            Cross-references live requirements from the actual jobs I'm targeting against
            my profile and ranks the highest-leverage way to spend spare time — a
            portfolio project, a certification, a course, a LinkedIn post — by what
            employers are actually asking for, not by what sounds impressive.
          </li>
        </ul>
      </Card>

      {/* QUICK STATS */}
      <Card className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-500/20 border border-blue-500/50 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm mb-1">Portals</p>
            <p className="text-3xl font-bold text-blue-500">8</p>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/50 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm mb-1">Countries</p>
            <p className="text-3xl font-bold text-emerald-500">5</p>
          </div>
          <div className="bg-amber-500/20 border border-amber-500/50 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm mb-1">Scan Cadence</p>
            <p className="text-3xl font-bold text-amber-500">Daily</p>
          </div>
          <div className="bg-orange-500/20 border border-orange-500/50 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm mb-1">Backlog Cleared</p>
            <p className="text-3xl font-bold text-orange-500">1,111 → 1</p>
          </div>
        </div>
      </Card>

      {/* ENGINEERING NOTE (condensed) */}
      <h2 className="text-2xl font-bold text-slate-100 mb-4 text-center">Built to Actually Run</h2>
      <Card className="mb-8">
        <p className="text-slate-400 leading-relaxed">
          A tool that runs unattended every day has to survive months of real use, not
          just a demo. It's been through a full reliability pass — batched LLM
          evaluation, adaptive scaling under memory pressure instead of hard failure,
          self-healing deduplication, and two independent code reviews, both acted on —
          after a real production backlog of 1,111 postings quietly went unevaluated for
          two months and got caught and fixed.
        </p>
      </Card>

      {/* CTA */}
      <div className="text-center mb-8">
        <a href="https://github.com/Nordic-OG-Raven/job_search" target="_blank" rel="noopener noreferrer">
          <Button variant="primary">View on GitHub</Button>
        </a>
      </div>

      {/* Footer */}
      <div className="mt-8">
        <Card className="bg-gradient-to-r from-purple-700/10 to-purple-700/5 border-purple-700/20">
          <p className="text-slate-400 text-sm text-center">
            • Python · SQLite · Claude API • Runs daily via a local cron/launchd job •
            Built and used for a real, ongoing job search, not a toy dataset
          </p>
        </Card>
      </div>
    </LayoutShell>
  );
}
