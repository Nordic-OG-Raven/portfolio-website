'use client';

import { LayoutShell } from '../components/LayoutShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function JobSearchPage() {
  return (
    <LayoutShell>
      {/* TITLE */}
      <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6 text-center">
        Reliability Engineering for an AI-Powered Job Search Pipeline
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

      {/* PERFORMANCE METRICS HEADING */}
      <h2 className="text-2xl font-bold text-slate-100 mb-4 text-center">The Numbers</h2>

      {/* PERFORMANCE METRICS */}
      <Card className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-500/20 border border-blue-500/50 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm mb-1">Backlog Cleared</p>
            <p className="text-3xl font-bold text-blue-500">1,111 → 1</p>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/50 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm mb-1">Process Spawns</p>
            <p className="text-3xl font-bold text-emerald-500">~5x fewer</p>
          </div>
          <div className="bg-amber-500/20 border border-amber-500/50 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm mb-1">Portals Covered</p>
            <p className="text-3xl font-bold text-amber-500">8</p>
          </div>
          <div className="bg-orange-500/20 border border-orange-500/50 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm mb-1">Memory Response</p>
            <p className="text-3xl font-bold text-orange-500">4-tier adaptive</p>
          </div>
        </div>
      </Card>

      {/* THE PROBLEM */}
      <h2 className="text-2xl font-bold text-slate-100 mb-4 text-center">The Problem</h2>
      <Card className="mb-8">
        <p className="text-slate-400 leading-relaxed">
          A daily scan across 8 job portals, deduplicated against a local cache and
          evaluated for fit by an LLM, sounds simple until it runs for months on a
          memory-constrained machine. A silent scoping bug meant re-evaluation only ever
          looked at &ldquo;today&rdquo;&apos;s listings — anything that missed evaluation once was
          invisible to every future run, forever. By the time this was caught, over
          1,100 real postings across two months had quietly piled up unreviewed, and the
          pipeline had a habit of hard-stopping the moment system memory got tight,
          with no way back except a human noticing and re-running it by hand.
        </p>
      </Card>

      {/* WHAT CHANGED */}
      <h2 className="text-2xl font-bold text-slate-100 mb-4 text-center">What Changed</h2>
      <Card className="mb-8">
        <ul className="space-y-3 text-slate-400 leading-relaxed">
          <li>
            <span className="text-slate-100 font-semibold">Batched LLM evaluation.</span>{' '}
            Each fit-evaluation call has a fixed ~400MB overhead regardless of prompt
            size — batching 5 jobs per call instead of 1 cuts that overhead roughly 5x
            for the same workload.
          </li>
          <li>
            <span className="text-slate-100 font-semibold">Adaptive memory scaling.</span>{' '}
            Replaced a binary pause/abort with a graduated response: batch size shrinks
            as memory pressure rises — full batches under comfortable conditions, down
            to one job at a time under real pressure — so the pipeline keeps making
            progress instead of stalling outright. A hard stop is now reserved for
            genuinely critical pressure, with a bounded, single-retry auto-resume after.
          </li>
          <li>
            <span className="text-slate-100 font-semibold">Self-healing deduplication.</span>{' '}
            Postings that reappear under a new listing ID after a portal re-indexes them
            now get their rating copied instead of re-spending an API call — with a
            guard against false positives from portals that pass through a generic
            placeholder employer name instead of a real one.
          </li>
          <li>
            <span className="text-slate-100 font-semibold">Concurrency-capped subprocess dispatch.</span>{' '}
            A shared wrapper caps how many external CLI processes can run at once,
            regardless of which part of the system is asking — closing the exact gap
            that let an unbounded parallel batch take down unrelated processes on the
            same machine.
          </li>
          <li>
            <span className="text-slate-100 font-semibold">Two independent code reviews, both acted on.</span>{' '}
            Including a crash bug that would have broken the tool for anyone whose own
            profile data happened to contain a stray character, and a duplicate-matching
            bug — confirmed against live data — that could have silently copied the
            wrong rating onto unrelated postings.
          </li>
        </ul>
      </Card>

      {/* TECH STACK / CTA */}
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
            Built, broken, and fixed against a real production backlog, not a toy dataset
          </p>
        </Card>
      </div>
    </LayoutShell>
  );
}
