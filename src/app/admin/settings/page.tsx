'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState({ sender: '', recipient: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings').then(res => res.json()).then(setSettings);
  }, []);

  const handleSave = async () => {
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setMessage('Settings saved!');
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (!session || !session.user.isAdmin) return <div>Unauthorized</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">Email Settings</h1>
      <div className="mb-4">
        <label className="block mb-1">Sender Email</label>
        <input
          className="border px-3 py-2 rounded w-full"
          value={settings.sender}
          onChange={e => setSettings(s => ({ ...s, sender: e.target.value }))}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Recipient Emails (separate with semicolon)</label>
        <textarea
          className="border px-3 py-2 rounded w-full"
          value={settings.recipient}
          onChange={e => setSettings(s => ({ ...s, recipient: e.target.value }))}
          rows={2}
        />
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleSave}
      >Save</button>
      {message && <div className="text-green-600 mt-2">{message}</div>}
    </div>
  );
} 