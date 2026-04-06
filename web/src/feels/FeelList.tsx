import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

export interface Feel {
  id: string;
  emotion: string;
  intensity: number;
  notes: string | null;
  createdAt: string;
}

interface Props {
  refreshKey: number;
  onDeleted?: () => void;
}

export function FeelList({ refreshKey, onDeleted }: Props) {
  const [feels, setFeels] = useState<Feel[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient.get<{ entries: Feel[] }>('/emotions')
      .then(res => setFeels(res.data.entries))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleDelete = async (feel: Feel) => {
    const confirmed = window.confirm(
      `Remove "${feel.emotion}" (intensity ${feel.intensity}/10)? This can be undone later.`
    );
    if (!confirmed) return;
    setDeletingId(feel.id);
    try {
      await apiClient.delete(`/emotions/${feel.id}`);
      setFeels(prev => prev.filter(f => f.id !== feel.id));
      onDeleted?.();
    } catch (err) {
      console.error('Delete failed', err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (raw: string) => {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) return <p className="text-slate-400 text-sm">Loading…</p>;
  if (feels.length === 0) return (
    <p className="text-slate-400 text-sm">No feels yet. Log your first one above!</p>
  );

  return (
    <ul className="space-y-3">
      {feels.map(feel => (
        <li key={feel.id} className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex items-start justify-between gap-4 shadow-sm">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold capitalize text-slate-800">{feel.emotion}</span>
              <span className="text-sm text-slate-500">— intensity {feel.intensity}/10</span>
            </div>
            {feel.notes && (
              <p className="text-sm text-slate-600 mt-1 truncate">{feel.notes}</p>
            )}
            <time className="text-xs text-slate-400 mt-1 block">{formatDate(feel.createdAt)}</time>
          </div>
          <button
            onClick={() => handleDelete(feel)}
            disabled={deletingId === feel.id}
            aria-label={`Delete feel: ${feel.emotion}`}
            className="flex-shrink-0 text-slate-400 hover:text-red-500 disabled:opacity-40 transition-colors mt-0.5"
          >
            {deletingId === feel.id ? (
              <span className="text-xs">…</span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
