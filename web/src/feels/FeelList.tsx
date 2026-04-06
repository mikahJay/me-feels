import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import type { FollowUp } from './types';
import { FollowUpTree } from './FollowUpTree';
import { FollowUpForm } from './FollowUpForm';
import { Recommendations } from './Recommendations';

export interface Feel {
  id: string;
  emotion: string;
  intensity: number;
  notes: string | null;
  createdAt: string;
}

interface FeelCardProps {
  feel: Feel;
  onDeleted: (id: string) => void;
}

function FeelCard({ feel, onDeleted }: FeelCardProps) {
  const [deletingFeel, setDeletingFeel] = useState(false);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [fuLoaded, setFuLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [addingFollowUp, setAddingFollowUp] = useState(false);
  const [prefillDescription, setPrefillDescription] = useState('');
  const [prefillAttachFeel, setPrefillAttachFeel] = useState(false);

  const loadFollowUps = async () => {
    if (fuLoaded) return;
    try {
      const res = await apiClient.get<{ followUps: FollowUp[] }>(`/follow-ups?feelId=${feel.id}`);
      setFollowUps(res.data.followUps);
    } catch (err) {
      console.error('Failed to load follow-ups', err);
    } finally {
      setFuLoaded(true);
    }
  };

  const handleExpand = async () => {
    if (!expanded) await loadFollowUps();
    setExpanded(e => !e);
  };

  const handleDeleteFeel = async () => {
    if (!window.confirm(`Remove "${feel.emotion}" (intensity ${feel.intensity}/10)? This can be undone later.`)) return;
    setDeletingFeel(true);
    try {
      await apiClient.delete(`/emotions/${feel.id}`);
      onDeleted(feel.id);
    } catch (err) {
      console.error('Delete failed', err);
      setDeletingFeel(false);
    }
  };

  const formatDate = (raw: string) => {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <li className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      {/* Feel header */}
      <div className="px-4 py-3 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold capitalize text-slate-800">{feel.emotion}</span>
            <span className="text-sm text-slate-500">— intensity {feel.intensity}/10</span>
          </div>
          {feel.notes && <p className="text-sm text-slate-600 mt-1">{feel.notes}</p>}
          <time className="text-xs text-slate-400 mt-1 block">{formatDate(feel.createdAt)}</time>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          <button
            onClick={handleExpand}
            className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            {expanded ? 'hide' : 'follow-ups'}
            {fuLoaded && followUps.length > 0 && (
              <span className="ml-1 bg-indigo-100 text-indigo-600 rounded-full px-1.5 py-0.5 text-xs">{followUps.length}</span>
            )}
          </button>
          <button
            onClick={handleDeleteFeel}
            disabled={deletingFeel}
            aria-label={`Delete feel: ${feel.emotion}`}
            className="text-slate-400 hover:text-red-500 disabled:opacity-40 transition-colors"
          >
            {deletingFeel ? <span className="text-xs">…</span> : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Follow-ups panel */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
          {followUps.length > 0 && (
            <div className="mb-3">
              <FollowUpTree
                followUps={followUps}
                rootFeelId={feel.id}
                onUpdate={setFollowUps}
              />
            </div>
          )}

          {addingFollowUp ? (
            <FollowUpForm
              rootFeelId={feel.id}
              initialDescription={prefillDescription}
              initialAttachFeel={prefillAttachFeel}
              onCreated={(fu) => {
                setFollowUps(prev => [...prev, { ...fu, children: [] }]);
                setAddingFollowUp(false);
                setPrefillDescription('');
                setPrefillAttachFeel(false);
              }}
              onCancel={() => {
                setAddingFollowUp(false);
                setPrefillDescription('');
                setPrefillAttachFeel(false);
              }}
            />
          ) : (
            <div className="space-y-3">
              <Recommendations
                feelId={feel.id}
                onSelect={(desc, attachFeel) => {
                  setPrefillDescription(desc);
                  setPrefillAttachFeel(attachFeel);
                  setAddingFollowUp(true);
                }}
              />
              <button
                onClick={() => setAddingFollowUp(true)}
                className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
              >
                + add follow-up
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

interface Props {
  refreshKey: number;
  onDeleted?: () => void;
}

export function FeelList({ refreshKey, onDeleted }: Props) {
  const [feels, setFeels] = useState<Feel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient.get<{ entries: Feel[] }>('/emotions')
      .then(res => setFeels(res.data.entries))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleFeelDeleted = (id: string) => {
    setFeels(prev => prev.filter(f => f.id !== id));
    onDeleted?.();
  };

  if (loading) return <p className="text-slate-400 text-sm">Loading…</p>;
  if (feels.length === 0) return (
    <p className="text-slate-400 text-sm">No feels yet. Log your first one above!</p>
  );

  return (
    <ul className="space-y-3">
      {feels.map(feel => (
        <FeelCard key={feel.id} feel={feel} onDeleted={handleFeelDeleted} />
      ))}
    </ul>
  );
}

