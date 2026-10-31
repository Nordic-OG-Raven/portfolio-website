'use client';

import { FINSIGHT_NAV, LAYER_ACCENT, type View } from './finsightNav';

interface SidebarProps {
  view: View;
  onSelect: (view: View) => void;
}

// Displayed top-to-bottom as Intelligence -> Gold -> Silver -> Bronze, so the raw source sits at
// the bottom and the apps at the top (the nav config stays in data-flow order for the diagrams).
const NAV_DISPLAY = [...FINSIGHT_NAV].reverse();

export default function Sidebar({ view, onSelect }: SidebarProps) {
  return (
    <nav className="lg:w-64 lg:shrink-0" aria-label="Medallion layers">
      <div className="bg-slate-800 rounded-xl border border-slate-800 p-3 lg:sticky lg:top-24">
        <div className="space-y-5">
          {NAV_DISPLAY.map((group, gi) => {
            const accent = LAYER_ACCENT[group.layer];
            return (
              <div key={group.layer}>
                <div className="flex items-center gap-2 px-2 mb-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${accent.dot}`} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${accent.text}`}>
                    {group.label}
                  </span>
                  <span className="text-xs text-slate-500">· {group.blurb}</span>
                </div>
                <ul className="space-y-0.5">
                  {group.items.map(item => {
                    const active = item.view === view;
                    return (
                      <li key={item.view}>
                        <button
                          onClick={() => onSelect(item.view)}
                          aria-current={active ? 'page' : undefined}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                            active
                              ? 'bg-slate-700 text-slate-100 font-medium'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                          }`}
                        >
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${active ? accent.dot : 'bg-transparent'}`} />
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {gi < NAV_DISPLAY.length - 1 && (
                  <div className="mt-4 ml-3 border-l border-slate-700 h-3" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
