import { useState } from 'react';
import { apiClient } from '../api/client';
import type { FollowUp } from './types';
import { FollowUpForm } from './FollowUpForm';

interface Props {
  followUps: FollowUp[];
  rootFeelId: string;
  depth?: number;
  onUpdate: (updated: FollowUp[]) => void;
}

function insertIntoTree(tree: FollowUp[], newFu: FollowUp): FollowUp[] {
  if (!newFu.parentFollowUpId) return [...tree, { ...newFu, children: [] }];
  return tree.map(fu => {
    if (fu.id === newFu.parentFollowUpId) {
      return { ...fu, children: [...(fu.children ?? []), { ...newFu, children: [] }] };
    }
    if (fu.children?.length) {
      return { ...fu, children: insertIntoTree(fu.children, newFu) };
    }
    return fu;
  });
}

function removeFromTree(tree: FollowUp[], id: string): FollowUp[] {
  return tree
    .filter(fu => fu.id !== id)
    .map(fu => ({ ...fu, children: removeFromTree(fu.children ?? [], id) }));
}

export function FollowUpTree({ followUps, rootFeelId, depth = 0, onUpdate }: Props) {
  const [addingTo, setAddingTo] = useState<string | null>(null); // followUpId or 'root'
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (fu: FollowUp) => {
    const hasChildren = fu.children && fu.children.length > 0;
    const msg = hasChildren
      ? `Remove this follow-up and all ${fu.children!.length} nested follow-up(s) under it?`
      : `Remove this follow-up?`;
    if (!window.confirm(msg)) return;
    setDeletingId(fu.id);
    try {
      await apiClient.delete(`/follow-ups/${fu.id}`);
      onUpdate(removeFromTree(followUps, fu.id));
    } catch (err) {
      console.error('Delete failed', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreated = (newFu: FollowUp) => {
    onUpdate(insertIntoTree(followUps, newFu));
    setAddingTo(null);
  };

  const indent = depth * 16;

  return (
    <div className="space-y-2">
      {followUps.map(fu => (
        <div key={fu.id} style={{ marginLeft: `${indent}px` }}>
          <div className="flex items-start gap-2 group">
            {/* Connector dot */}
            <div className="flex flex-col items-center mt-1.5 flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-indigo-300" />
              {(fu.children?.length ?? 0) > 0 && (
                <div className="w-px flex-1 bg-indigo-200 mt-0.5" style={{ minHeight: '1rem' }} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-slate-700 leading-snug">{fu.description}</p>
                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setAddingTo(addingTo === fu.id ? null : fu.id)}
                    title="Add follow-up"
                    className="text-indigo-400 hover:text-indigo-600 text-xs transition-colors"
                  >
                    + follow-up
                  </button>
                  <button
                    onClick={() => handleDelete(fu)}
                    disabled={deletingId === fu.id}
                    title="Delete"
                    className="text-slate-300 hover:text-red-400 disabled:opacity-40 transition-colors ml-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {fu.attachedFeel && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700 capitalize">
                  felt: {fu.attachedFeel.emotion} ({fu.attachedFeel.intensity}/10)
                </span>
              )}

              {addingTo === fu.id && (
                <FollowUpForm
                  rootFeelId={rootFeelId}
                  parentFollowUpId={fu.id}
                  onCreated={handleCreated}
                  onCancel={() => setAddingTo(null)}
                  depth={depth + 1}
                />
              )}

              {(fu.children?.length ?? 0) > 0 && (
                <FollowUpTree
                  followUps={fu.children!}
                  rootFeelId={rootFeelId}
                  depth={depth + 1}
                  onUpdate={(updated) => {
                    onUpdate(followUps.map(f => f.id === fu.id ? { ...f, children: updated } : f));
                  }}
                />
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Add to current level */}
      {addingTo === `level-${depth}` ? (
        <div style={{ marginLeft: `${indent}px` }}>
          <FollowUpForm
            rootFeelId={rootFeelId}
            parentFollowUpId={undefined}
            onCreated={handleCreated}
            onCancel={() => setAddingTo(null)}
            depth={depth}
          />
        </div>
      ) : (
        depth === 0 && (
          <button
            onClick={() => setAddingTo(`level-${depth}`)}
            className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors mt-1"
          >
            + add follow-up
          </button>
        )
      )}
    </div>
  );
}
