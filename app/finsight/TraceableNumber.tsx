'use client';

import { useRef } from 'react';
import { useProvenance, type FactRef } from './ProvenanceContext';

interface TraceableNumberProps {
  value: string;
  factRef: FactRef;
  className?: string;
}

// A number that, when provenance is on, becomes a dashed-underline control opening its trace.
// When provenance is off (or the concept is missing), it renders as plain text.
export default function TraceableNumber({ value, factRef, className = '' }: TraceableNumberProps) {
  const { provenanceOn, openTrace } = useProvenance();
  const ref = useRef<HTMLButtonElement>(null);

  if (!provenanceOn || !factRef.concept) {
    return <>{value}</>;
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) openTrace({ ...factRef, displayValue: value }, rect);
      }}
      title="Trace this number to its source SEC filing"
      className={`border-b border-dashed border-purple-500 hover:text-purple-700 hover:border-purple-700 cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-purple-500 rounded-sm ${className}`}
    >
      {value}
    </button>
  );
}
