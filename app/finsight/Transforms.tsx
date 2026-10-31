'use client';

import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { LAYER_ACCENT, type Layer } from './finsightNav';

interface LayerDoc {
  id: string;
  title: string;
  source: string;
  explanation: string;
  code: string;
}

interface TransformsProps {
  API_BASE: string;
}

// Silver (and the whole pipeline): the transform code for each layer with a plain-English
// explanation. Read-only; the code is shown, never executed.
export default function Transforms({ API_BASE }: TransformsProps) {
  const [layers, setLayers] = useState<LayerDoc[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}?path=${encodeURIComponent('/api/lineage/layers')}`, { signal: controller.signal })
      .then(async res => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
        return body;
      })
      .then(data => {
        const ls: LayerDoc[] = data.layers || [];
        setLayers(ls);
        setSelected(ls.find(l => l.id === 'silver')?.id || ls[0]?.id || '');
      })
      .catch(err => { if (err.name !== 'AbortError') setError(err.message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [API_BASE]);

  if (loading) {
    return (
      <Card hover={false}>
        <div className="flex items-center gap-3 text-slate-400">
          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500" />
          Loading transforms...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border-l-4 border-red-500 p-4 rounded-lg">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  const current = layers.find(l => l.id === selected);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Layer list */}
      <div className="md:w-48 md:shrink-0 flex md:flex-col gap-2">
        {layers.map(l => {
          const accent = LAYER_ACCENT[(l.id as Layer)] ?? LAYER_ACCENT.silver;
          const active = l.id === selected;
          return (
            <button
              key={l.id}
              onClick={() => setSelected(l.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                active ? 'bg-slate-700 text-slate-100' : 'bg-slate-800 text-slate-400 hover:bg-slate-700/60'
              }`}
            >
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${accent.dot}`} />
              {l.title.split('·')[0].split('—')[0].trim()}
            </button>
          );
        })}
      </div>

      {/* Detail */}
      {current && (
        <Card hover={false} className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-slate-100">{current.title}</h2>
          <p className="text-xs text-slate-500 font-mono mt-1 mb-3">{current.source}</p>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">{current.explanation}</p>
          <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-900">
            <pre className="p-4 text-xs leading-relaxed text-slate-300 font-mono whitespace-pre">{current.code}</pre>
          </div>
        </Card>
      )}
    </div>
  );
}
