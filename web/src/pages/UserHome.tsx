import { useState } from 'react';
import { FeelForm } from '../feels/FeelForm';
import { FeelList } from '../feels/FeelList';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(k => k + 1);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">How are you feeling?</h2>
        <FeelForm onCreated={refresh} />
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Your recent feels</h2>
        <FeelList refreshKey={refreshKey} onDeleted={refresh} />
      </section>
    </div>
  );
}

