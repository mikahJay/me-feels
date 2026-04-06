import React, { useState } from 'react';
import { apiClient } from '../api/client';

interface Props {
  onCreated: () => void;
}

const PRESET_EMOTIONS = ['happy', 'sad', 'anxious', 'angry', 'excited', 'calm', 'frustrated', 'grateful'];
const CUSTOM_EMOTIONS_KEY = 'me-feels:custom-emotions';

function loadCustomEmotions(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_EMOTIONS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveCustomEmotions(emotions: string[]) {
  localStorage.setItem(CUSTOM_EMOTIONS_KEY, JSON.stringify(emotions));
}

export function FeelForm({ onCreated }: Props) {
  const [emotion, setEmotion] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [customEmotions, setCustomEmotions] = useState<string[]>(loadCustomEmotions);

  const handleEmotionChange = (value: string) => {
    setEmotion(value);
    if (value !== '__custom__') setCustomInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmotion = emotion === '__custom__' ? customInput.trim().toLowerCase() : emotion;
    if (!finalEmotion) return;
    setSubmitting(true);
    try {
      await apiClient.post('/emotions', { emotion: finalEmotion, intensity, notes: notes || undefined });

      // Persist custom emotion to dropdown if it's new
      if (emotion === '__custom__' && !customEmotions.includes(finalEmotion)) {
        const updated = [...customEmotions, finalEmotion];
        setCustomEmotions(updated);
        saveCustomEmotions(updated);
      }

      setEmotion('');
      setCustomInput('');
      setIntensity(5);
      setNotes('');
      onCreated();
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'block w-full mt-1 px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent';
  const labelClass = 'block text-sm font-medium text-slate-600';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="emotion" className={labelClass}>Emotion</label>
        <select
          id="emotion"
          value={emotion}
          onChange={e => handleEmotionChange(e.target.value)}
          required
          className={inputClass}
        >
          <option value="">Select an emotion…</option>
          <optgroup label="Presets">
            {PRESET_EMOTIONS.map(e => <option key={e} value={e}>{e}</option>)}
          </optgroup>
          {customEmotions.length > 0 && (
            <optgroup label="Custom">
              {customEmotions.map(e => <option key={e} value={e}>{e}</option>)}
            </optgroup>
          )}
          <option value="__custom__">+ Add my own…</option>
        </select>
      </div>

      {emotion === '__custom__' && (
        <div>
          <label htmlFor="custom-emotion" className={labelClass}>My emotion</label>
          <input
            id="custom-emotion"
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            placeholder="e.g. overwhelmed"
            required
            maxLength={50}
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label htmlFor="intensity" className={labelClass}>
          Intensity: <span className="font-semibold text-indigo-600">{intensity}/10</span>
        </label>
        <input
          id="intensity"
          type="range"
          min={1}
          max={10}
          value={intensity}
          onChange={e => setIntensity(Number(e.target.value))}
          className="block w-full mt-1 accent-indigo-600"
        />
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>Notes (optional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !emotion || (emotion === '__custom__' && !customInput.trim())}
        className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors"
      >
        {submitting ? 'Saving…' : 'Log feel'}
      </button>
    </form>
  );
}
