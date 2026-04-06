import React, { useState } from 'react';
import { apiClient } from '../api/client';
import type { FollowUp } from './types';

const PRESET_EMOTIONS = ['happy', 'sad', 'anxious', 'angry', 'excited', 'calm', 'frustrated', 'grateful'];

interface Props {
  rootFeelId: string;
  parentFollowUpId?: string;
  onCreated: (fu: FollowUp) => void;
  onCancel: () => void;
  depth?: number;
}

export function FollowUpForm({ rootFeelId, parentFollowUpId, onCreated, onCancel, depth = 0 }: Props) {
  const [description, setDescription] = useState('');
  const [attachEmotion, setAttachEmotion] = useState(false);
  const [emotion, setEmotion] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const inputClass = 'block w-full mt-1 px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent';
  const labelClass = 'block text-xs font-medium text-slate-500 uppercase tracking-wide';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        rootFeelId,
        description: description.trim(),
      };
      if (parentFollowUpId) body.parentFollowUpId = parentFollowUpId;
      if (attachEmotion && emotion) {
        body.attachedFeel = { emotion, intensity, notes: notes || undefined };
      }
      const res = await apiClient.post<{ followUp: FollowUp }>('/follow-ups', body);
      onCreated(res.data.followUp);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`mt-2 p-3 rounded-lg border border-indigo-200 bg-indigo-50 space-y-3 ${depth > 0 ? 'ml-4' : ''}`}>
      <div>
        <label className={labelClass}>What happened / what did you do?</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          required
          autoFocus
          placeholder="e.g. Went for a walk, talked to a friend, ignored it…"
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={attachEmotion}
          onChange={e => setAttachEmotion(e.target.checked)}
          className="accent-indigo-600"
        />
        Attach a feel to this action
      </label>

      {attachEmotion && (
        <div className="space-y-2 pl-2 border-l-2 border-indigo-300">
          <div>
            <label className={labelClass}>Emotion</label>
            <select value={emotion} onChange={e => setEmotion(e.target.value)} required className={inputClass}>
              <option value="">Select…</option>
              {PRESET_EMOTIONS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Intensity: <strong>{intensity}/10</strong></label>
            <input type="range" min={1} max={10} value={intensity}
              onChange={e => setIntensity(Number(e.target.value))}
              className="block w-full accent-indigo-600 mt-1" />
          </div>
          <div>
            <label className={labelClass}>Notes (optional)</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
              className={inputClass} />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={submitting || !description.trim()}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors">
          {submitting ? 'Saving…' : 'Add'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
