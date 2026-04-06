import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { EmotionForm } from '../emotions/EmotionForm';
import { EmotionList } from '../emotions/EmotionList';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: '#5c6bc0' }}>me-feels</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#666' }}>{user?.name ?? user?.email}</span>
          <button onClick={logout}>Sign out</button>
        </div>
      </header>

      <section style={{ marginBottom: '2rem' }}>
        <h2>How are you feeling?</h2>
        <EmotionForm onCreated={() => setRefreshKey(k => k + 1)} />
      </section>

      <section>
        <h2>Your recent emotions</h2>
        <EmotionList refreshKey={refreshKey} />
      </section>
    </div>
  );
}
