import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import type { Feel } from '../feels/FeelList';

// Color scale: hue shifts from green (calm/low) to red (intense/negative).
// Each emotion has a base hue; intensity (1-10) drives lightness.
const EMOTION_HUES: Record<string, number> = {
  happy: 140,
  excited: 100,
  grateful: 160,
  calm: 180,
  sad: 220,
  anxious: 40,
  frustrated: 20,
  angry: 0,
};

function emotionColor(emotion: string, intensity: number): string {
  const hue = EMOTION_HUES[emotion.toLowerCase()] ?? 270; // indigo fallback for custom
  // intensity 1 → light (75% lightness), intensity 10 → saturated (45% lightness)
  const lightness = 75 - (intensity - 1) * 3;
  const saturation = 55 + (intensity - 1) * 4;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function formatDay(raw: string) {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(raw: string) {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function groupByDay(feels: Feel[]): { day: string; items: Feel[] }[] {
  const map = new Map<string, Feel[]>();
  for (const feel of feels) {
    const day = formatDay(feel.createdAt);
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(feel);
  }
  return Array.from(map.entries()).map(([day, items]) => ({ day, items }));
}

export default function Dashboard() {
  const [feels, setFeels] = useState<Feel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<{ entries: Feel[] }>('/emotions?limit=100')
      .then(res => setFeels(res.data.entries))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const groups = groupByDay(feels);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-700 mb-6">Dashboard</h1>

      {loading && <p className="text-slate-400 text-sm">Loading…</p>}

      {!loading && feels.length === 0 && (
        <p className="text-slate-400 text-sm">No feels logged yet. Head to <a href="/" className="text-indigo-500 hover:underline">Home</a> to log your first one!</p>
      )}

      {!loading && groups.map(({ day, items }) => (
        <div key={day} className="mb-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">{day}</h2>
          <div className="relative border-l-2 border-slate-200 pl-6 space-y-4">
            {items.map(feel => (
              <div key={feel.id} className="relative">
                {/* Timeline dot */}
                <span
                  className="absolute -left-[1.45rem] top-2 w-3 h-3 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: emotionColor(feel.emotion, feel.intensity) }}
                />
                <div
                  className="rounded-lg px-4 py-3 shadow-sm border border-slate-100"
                  style={{ backgroundColor: emotionColor(feel.emotion, feel.intensity) + '33' }}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: emotionColor(feel.emotion, feel.intensity) }}
                      />
                      <span className="font-semibold capitalize text-slate-800">{feel.emotion}</span>
                      <span className="text-xs text-slate-500">intensity {feel.intensity}/10</span>
                    </div>
                    <time className="text-xs text-slate-400">{formatTime(feel.createdAt)}</time>
                  </div>
                  {feel.notes && (
                    <p className="text-sm text-slate-600 mt-1">{feel.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
