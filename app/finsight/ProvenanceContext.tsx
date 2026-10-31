'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import TracePopover from './TracePopover';

// What a traceable number needs to carry so the popover can look up its lineage.
export interface FactRef {
  ticker: string;
  concept: string;      // XBRL concept (any taxonomy-prefix form; the backend matches on local part)
  fiscalYear: number;
  label?: string;
  unit?: string;
  displayValue?: string;
}

interface ProvenanceContextValue {
  provenanceOn: boolean;
  toggle: () => void;
  openTrace: (ref: FactRef, rect: DOMRect) => void;
}

const ProvenanceContext = createContext<ProvenanceContextValue | null>(null);

export function useProvenance(): ProvenanceContextValue {
  const ctx = useContext(ProvenanceContext);
  if (!ctx) throw new Error('useProvenance must be used within a ProvenanceProvider');
  return ctx;
}

// The top-bar switch. Must be rendered inside a ProvenanceProvider.
export function ProvenanceToggle() {
  const { provenanceOn, toggle } = useProvenance();
  return (
    <button
      onClick={toggle}
      role="switch"
      aria-checked={provenanceOn}
      title="Show a trace from any number back to its source SEC filing"
      className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-700 rounded-lg px-2 py-1"
    >
      <span>Provenance</span>
      <span className={`relative w-9 h-5 rounded-full transition-colors ${provenanceOn ? 'bg-purple-600' : 'bg-slate-600'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${provenanceOn ? 'translate-x-4' : ''}`} />
      </span>
      <span className="text-xs text-slate-500 w-6 text-left">{provenanceOn ? 'on' : 'off'}</span>
    </button>
  );
}

// Owns the provenance toggle (persisted) and the single shared trace popover instance.
export function ProvenanceProvider({ API_BASE, children }: { API_BASE: string; children: React.ReactNode }) {
  const [provenanceOn, setProvenanceOn] = useState(false);
  const [active, setActive] = useState<{ ref: FactRef; rect: DOMRect } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage.getItem('finsight:provenance') === 'on') {
      setProvenanceOn(true);
    }
  }, []);

  const toggle = useCallback(() => {
    setProvenanceOn(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('finsight:provenance', next ? 'on' : 'off');
      }
      if (!next) setActive(null); // turning provenance off closes any open trace
      return next;
    });
  }, []);

  const openTrace = useCallback((ref: FactRef, rect: DOMRect) => setActive({ ref, rect }), []);
  const closeTrace = useCallback(() => setActive(null), []);

  return (
    <ProvenanceContext.Provider value={{ provenanceOn, toggle, openTrace }}>
      {children}
      {active && (
        <TracePopover API_BASE={API_BASE} factRef={active.ref} anchorRect={active.rect} onClose={closeTrace} />
      )}
    </ProvenanceContext.Provider>
  );
}
