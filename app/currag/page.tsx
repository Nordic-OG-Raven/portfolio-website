'use client';

import Image from 'next/image';
import { LayoutShell } from '../components/LayoutShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const LIVE_URL = 'https://knowledgetutor.jonashaahr.com';

const skills = ['RAG', 'LangChain', 'ChromaDB', 'OpenAI GPT-4', 'LCEL', 'Python', 'Streamlit'];

export default function CurRagPage() {
  return (
    <LayoutShell>
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">RAG system for searching through lecture notes</h1>
        <p className="text-lg text-slate-400 max-w-3xl">
          Ask a question in natural language, get an answer pulled straight from thousands of pages of my university course material.
        </p>
      </div>

      <Card className="mb-8">
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden mb-6">
          <Image src="/currag.png" alt="CurRag" fill className="object-cover" sizes="100vw" priority />
        </div>
        <a href={LIVE_URL} target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="primary" className="w-full justify-center">Launch the live app →</Button>
        </a>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Overview</h2>
        <p className="text-slate-400 leading-relaxed">
          A Retrieval-Augmented Generation system for querying university lecture notes, built with LangChain, ChromaDB,
          and OpenAI. It answers natural-language questions with passages pulled straight from the course material, through
          a simple Streamlit web interface.
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Highlights</h2>
        <ul className="list-disc list-inside space-y-2 text-slate-400">
          <li>Ask your lecture notes questions in plain English and get answers grounded in your own material.</li>
          <li>Retrieval-Augmented Generation over thousands of pages of course notes (LangChain + ChromaDB + OpenAI).</li>
          <li>Semantic search with a Streamlit web interface.</li>
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
