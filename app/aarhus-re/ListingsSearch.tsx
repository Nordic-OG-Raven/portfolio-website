'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

interface Listing {
  id: number | null;
  url: string | null;
  img: string | null;
  street: string | null;
  city: string | null;
  zip: number | null;
  propertyType: number | null;
  price: number | null;
  fairValue: number | null;
  discountPct: number | null;
  monthlyCost: number | null;
  expMonthly: number | null;
  sqm: number | null;
  rooms: number | null;
  year: number | null;
  energy: string | null;
}

interface SnapshotData {
  snapshotDate: string;
  propertyTypes: Record<string, string>;
  listings: Listing[];
}

function formatDkk(n: number | null): string {
  if (n === null) return '—';
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' kr';
}

export default function ListingsSearch() {
  const [data, setData] = useState<SnapshotData | null>(null);
  const [zip, setZip] = useState('8000');
  const [propertyType, setPropertyType] = useState('3');
  const [minRooms, setMinRooms] = useState('2');
  const [maxPrice, setMaxPrice] = useState('2200000');
  const [sortBy, setSortBy] = useState<'discount' | 'price_asc' | 'price_desc'>('discount');

  useEffect(() => {
    fetch('/data/aarhus-listings.json')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    let rows = data.listings;
    if (zip) rows = rows.filter((l) => l.zip === parseInt(zip, 10));
    if (propertyType) rows = rows.filter((l) => l.propertyType === parseInt(propertyType, 10));
    if (minRooms) rows = rows.filter((l) => (l.rooms ?? 0) >= parseInt(minRooms, 10));
    if (maxPrice) rows = rows.filter((l) => (l.price ?? Infinity) <= parseInt(maxPrice, 10));

    const sorted = [...rows];
    if (sortBy === 'discount') {
      sorted.sort((a, b) => (b.discountPct ?? -Infinity) - (a.discountPct ?? -Infinity));
    } else if (sortBy === 'price_asc') {
      sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    } else {
      sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    }
    return sorted.slice(0, 60);
  }, [data, zip, propertyType, minRooms, maxPrice, sortBy]);

  return (
    <Card className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-100">Try the Search</h3>
        {data && (
          <span className="text-xs text-slate-500">
            Snapshot from {data.snapshotDate} — {filtered.length} of {data.listings.length} matching
          </span>
        )}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4 text-xs text-amber-300">
        This is a frozen demo snapshot, not a live feed — the data pipeline that refreshes it
        weekly runs on infrastructure that&apos;s currently offline. Filtering below is real and
        instant, the listings themselves are a point-in-time example.
      </div>

      {!data && <p className="text-sm text-slate-500">Loading snapshot…</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Postnummer</label>
              <input
                type="number"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-600"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-600"
              >
                <option value="">Alle</option>
                {Object.entries(data.propertyTypes).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Min. rum</label>
              <select
                value={minRooms}
                onChange={(e) => setMinRooms(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-600"
              >
                <option value="">Alle</option>
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>{r}+</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Maks. pris</label>
              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-600"
              >
                <option value="">Ingen grænse</option>
                {[[1500000, '1,5M'], [2000000, '2,0M'], [2200000, '2,2M'], [2500000, '2,5M'], [3000000, '3,0M'], [4000000, '4,0M'], [5000000, '5,0M']].map(([p, pl]) => (
                  <option key={p} value={p}>{pl} kr</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Sortering</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-600"
              >
                <option value="discount">Størst rabat (model)</option>
                <option value="price_asc">Laveste pris</option>
                <option value="price_desc">Højeste pris</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map((l) => (
              <a
                key={l.id ?? `${l.street}-${l.price}`}
                href={l.url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-slate-900/60 border border-slate-700 rounded-xl overflow-hidden hover:border-purple-600 transition-colors"
              >
                {l.img && (
                  <div className="relative w-full h-36 bg-black">
                    <img src={l.img} alt={l.street ?? ''} className="w-full h-full object-cover" loading="lazy" />
                    {l.discountPct !== null && (
                      <div className="absolute top-2 right-2">
                        <Badge variant={l.discountPct >= 15 ? 'success' : l.discountPct >= 8 ? 'warning' : 'default'}>
                          {l.discountPct.toFixed(1)}% rabat
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-3 space-y-1.5">
                  <p className="text-sm font-medium text-white leading-snug">{l.street}</p>
                  <p className="text-xs text-slate-500">{l.zip} {l.city}</p>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold text-white">{formatDkk(l.price)}</span>
                    {l.fairValue && <span className="text-xs text-slate-500">Model: {formatDkk(l.fairValue)}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs text-slate-400">
                    {l.rooms && <span className="bg-slate-800 rounded px-1.5 py-0.5">{l.rooms} rum</span>}
                    {l.sqm && <span className="bg-slate-800 rounded px-1.5 py-0.5">{Math.round(l.sqm)} m²</span>}
                    {l.year && <span className="bg-slate-800 rounded px-1.5 py-0.5">{l.year}</span>}
                    {l.energy && <span className="bg-slate-800 rounded px-1.5 py-0.5">Energi {l.energy}</span>}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center py-12 text-slate-500 text-sm">Ingen boliger matcher filteret.</p>
          )}
        </>
      )}
    </Card>
  );
}
