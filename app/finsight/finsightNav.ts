// Single source of truth for the medallion navigation: the sidebar, the view dispatch, and
// the URL (?view=) all read from this. Layers follow the data flow bronze -> silver -> gold ->
// intelligence. Each view belongs to the layer whose data it shows.

export type Layer = 'bronze' | 'silver' | 'gold' | 'intelligence';

export type View =
  | 'filings' | 'raw_facts'                       // bronze
  | 'canonical_facts'                             // silver
  | 'warehouse' | 'statements' | 'company'        // gold
  | 'ask' | 'forecast' | 'track_record';          // intelligence

export interface NavItem {
  view: View;
  label: string;
}

export interface NavGroup {
  layer: Layer;
  label: string;
  blurb: string;
  items: NavItem[];
}

export const FINSIGHT_NAV: NavGroup[] = [
  {
    layer: 'bronze',
    label: 'Bronze',
    blurb: 'Raw filings',
    items: [
      { view: 'filings', label: 'Filings browser' },
      { view: 'raw_facts', label: 'Raw facts' },
    ],
  },
  {
    layer: 'silver',
    label: 'Silver',
    blurb: 'Conformed facts',
    items: [
      { view: 'canonical_facts', label: 'Canonical facts' },
    ],
  },
  {
    layer: 'gold',
    label: 'Gold',
    blurb: 'Serving marts',
    items: [
      { view: 'warehouse', label: 'Warehouse explorer' },
      { view: 'statements', label: 'Financial statements' },
      { view: 'company', label: 'Company analysis' },
    ],
  },
  {
    layer: 'intelligence',
    label: 'Intelligence',
    blurb: 'The apps',
    items: [
      { view: 'ask', label: 'Ask' },
      { view: 'forecast', label: 'Earnings forecast' },
      { view: 'track_record', label: 'Track record' },
    ],
  },
];

// Per-layer accent classes (medallion metals). Used by the sidebar and view headers.
export const LAYER_ACCENT: Record<Layer, { dot: string; text: string; ring: string }> = {
  bronze: { dot: 'bg-amber-600', text: 'text-amber-500', ring: 'ring-amber-600/40' },
  silver: { dot: 'bg-slate-300', text: 'text-slate-300', ring: 'ring-slate-400/40' },
  gold: { dot: 'bg-yellow-400', text: 'text-yellow-400', ring: 'ring-yellow-400/40' },
  intelligence: { dot: 'bg-purple-500', text: 'text-purple-400', ring: 'ring-purple-500/40' },
};

export const ALL_VIEWS: View[] = FINSIGHT_NAV.flatMap(g => g.items.map(i => i.view));

export const DEFAULT_VIEW: View = 'company';

export function isView(v: string | null | undefined): v is View {
  return !!v && (ALL_VIEWS as string[]).includes(v);
}

export function layerOfView(view: View): Layer {
  const group = FINSIGHT_NAV.find(g => g.items.some(i => i.view === view));
  return group ? group.layer : 'gold';
}

export function labelOfView(view: View): string {
  for (const g of FINSIGHT_NAV) {
    const item = g.items.find(i => i.view === view);
    if (item) return item.label;
  }
  return view;
}
