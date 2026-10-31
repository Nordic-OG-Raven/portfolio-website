'use client';

// Silver illustration: many filers' idiosyncratic XBRL tags resolve to one canonical number.
// The curves carry a slow flow toward the canonical node.
const TAGS = [
  { w: 300, t: 'us-gaap:RevenueFromContract…' },
  { w: 230, t: 'us-gaap:Revenues' },
  { w: 260, t: 'us-gaap:SalesRevenueNet' },
  { w: 285, t: 'us-gaap:SalesRevenueGoodsNet' },
  { w: 250, t: 'nflx:StreamingRevenue' },
  { w: 240, t: 'us-gaap:RevenuesNetOf…' },
  { w: 200, t: '+ 390 more…' },
];

export default function TagConvergence() {
  const ys = [24, 60, 96, 132, 168, 204, 240];
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 mb-6">
      <style>{`
        @keyframes fs-conv { to { stroke-dashoffset: -24; } }
        .fs-conv { stroke-dasharray: 2 8; animation: fs-conv 2.2s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .fs-conv { animation: none; } }
      `}</style>
      <div className="flex items-baseline gap-3 mb-3 flex-wrap">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Silver</span>
        <h3 className="text-base font-bold text-slate-100">Many messy tags, one clean number.</h3>
        <span className="ml-auto text-xs font-mono text-slate-500">silver / fct_financial_facts</span>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox="0 0 980 300" width="100%" style={{ minWidth: 560 }} role="img"
          aria-label="Many XBRL revenue tags converging into one canonical revenue label">
          {/* tags */}
          <g fontFamily="ui-monospace, monospace" fontSize="12" fill="#94a3b8">
            {TAGS.map((tag, i) => (
              <g key={i}>
                <rect x="0" y={ys[i]} width={tag.w} height="26" rx="4" fill="#1e293b" stroke="#334155" />
                <text x="14" y={ys[i] + 17}>{tag.t}</text>
              </g>
            ))}
          </g>

          {/* converging curves (base + animated flow) */}
          {TAGS.map((tag, i) => {
            const y = ys[i] + 13;
            const d = `M${tag.w} ${y} C ${520} ${y}, ${570} 150, 720 150`;
            return (
              <g key={`c${i}`} fill="none">
                <path d={d} stroke="#cbd5e1" strokeWidth="1.2" opacity="0.28" />
                <path className="fs-conv" d={d} stroke="#cbd5e1" strokeWidth="1.3" opacity="0.6" />
              </g>
            );
          })}

          {/* canonical node */}
          <g>
            <rect x="720" y="124" width="150" height="52" rx="8" fill="rgba(203,213,225,0.07)" stroke="#cbd5e1" strokeWidth="1.5" />
            <text x="795" y="147" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="15" fontWeight="600" fill="#f1f5f9">revenue</text>
            <text x="795" y="165" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10" fill="#64748b">canonical · point-in-time</text>
          </g>
        </svg>
      </div>

      <p className="text-xs text-slate-500 mt-2">
        Every filer&apos;s idiosyncratic XBRL tags resolved to one vocabulary and stamped with their
        filing date, so the backtest never peeks ahead.
      </p>
    </div>
  );
}
