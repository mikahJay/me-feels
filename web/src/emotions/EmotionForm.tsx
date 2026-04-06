import React, { useState } from 'react';
import { apiClient } from '../api/client';

interface Props {
  onCreated: () => void;
}

const EMOTIONS = ['happy', 'sad', 'anxious', 'angry', 'excited', 'calm', 'frustrated', 'grateful'];

export function EmotionForm({ onCreated }: Props) {
  const [emotion, setEmotion] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emotion) return;
    setSubmitting(true);
    try {
      await apiClient.post('/emotions', { emotion, intensity, notes: notes || undefined });
      setEmotion('');
      setIntensity(5);
      setNotes('');
      onCreated();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label htmlFor="emotion">How are you feeling?</label>
        <select
          id="emotion"
          value={emotion}
          onChange={e => setEmotion(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem' }}
        >
          <option value="">Select an emotion…</option>
          {EMOTIONS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="intensity">Intensity: {intensity}/10</label>
        <input
          id="intensity"
          type="range"
          min={1}
          max={10}
          value={intensity}
          onChange={e => setIntensity(Number(e.target.value))}
          style={{ display: 'block', width: '100%' }}
        />
      </div>

      <div>
        <label htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem' }}
        />
      </div>

      <button type="submit" disabled={submitting || !emotion}>
        {submitting ? 'Saving…' : 'Log emotion'}
      </button>
    </form>
  );
}
