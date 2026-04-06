import { useState } from 'react';
import { apiClient } from '../api/client';

export interface Recommendation {
  description: string;
  rationale: string;
}

interface Props {
  feelId: string;
  onSelect: (description: string) => void;
}

export function Recommendations({ feelId, onSelect }: Props) {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ recommendations: Recommendation[] }>(
        `/recommendations?feelId=${feelId}`
      );
      setRecs(res.data.recommendations);
      setLoaded(true);
    } catch (err) {
      setError('Could not load recommendations. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!loaded) {
    return (
      <button
        onClick={fetchRecs}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <>
            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span>Getting recommendations…</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347A3.75 3.75 0 0112 15.75a3.75 3.75 0 01-2.657-1.097l-.346-.346z" />
            </svg>
            <span>Suggest follow-ups with AI</span>
          </>
        )}
      </button>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-red-500">
        {error}{' '}
        <button onClick={fetchRecs} className="underline hover:no-underline">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-violet-700 uppercase tracking-wide">AI suggestions</span>
        <button
          onClick={fetchRecs}
          disabled={loading}
          title="Refresh recommendations"
          className="text-violet-400 hover:text-violet-600 disabled:opacity-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      <ul className="space-y-2">
        {recs.map((rec, i) => (
          <li key={i} className="group bg-violet-50 border border-violet-100 rounded-md px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-800">{rec.description}</p>
                <p className="text-xs text-slate-500 mt-0.5 italic">{rec.rationale}</p>
              </div>
              <button
                onClick={() => onSelect(rec.description)}
                title="Use this as a follow-up"
                className="flex-shrink-0 mt-0.5 text-violet-400 hover:text-violet-700 opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
