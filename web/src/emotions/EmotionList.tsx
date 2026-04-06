import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

interface EmotionEntry {
  id: string;
  emotion: string;
  intensity: number;
  notes: string | null;
  createdAt: string;
}

interface Props {
  refreshKey: number;
}

export function EmotionList({ refreshKey }: Props) {
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<{ entries: EmotionEntry[] }>('/emotions')
      .then(res => setEntries(res.data.entries))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <p>Loading…</p>;
  if (entries.length === 0) return <p>No entries yet. Log your first emotion above!</p>;

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {entries.map(entry => (
        <li key={entry.id} style={{
          padding: '1rem',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          marginBottom: '0.5rem',
          background: '#fff',
        }}>
          <strong style={{ textTransform: 'capitalize' }}>{entry.emotion}</strong>
          {' '}— intensity {entry.intensity}/10
          {entry.notes && <p style={{ margin: '0.25rem 0 0', color: '#666' }}>{entry.notes}</p>}
          <small style={{ color: '#999' }}>{new Date(entry.createdAt).toLocaleString()}</small>
        </li>
      ))}
    </ul>
  );
}
