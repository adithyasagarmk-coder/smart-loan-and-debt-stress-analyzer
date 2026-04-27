import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';

const STORAGE_KEY = 'sla_reminders';

const Reminders = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', date: '' });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (_) {}
  }, [items]);

  const add = (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    setItems((prev) => [{ id: crypto.randomUUID(), ...form, done: false }, ...prev]);
    setForm({ title: '', date: '' });
  };

  const toggle = (id) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const isDue = (date) => {
    const now = new Date();
    const due = new Date(date);
    return now >= due && now - due < 1000 * 60 * 60 * 24; // due within last 24h
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4">Reminders</h1>

          {/* Due banner */}
          {items.some((i) => isDue(i.date) && !i.done) && (
            <div className="bg-yellow-900/40 border border-yellow-600 text-yellow-200 px-4 py-3 rounded mb-6">
              You have reminders due.
            </div>
          )}

          <form onSubmit={add} className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 flex gap-3">
            <input
              className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
            <input
              type="datetime-local"
              className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Add</button>
          </form>

          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="text-gray-400">No reminders yet.</div>
            ) : (
              items.map((i) => (
                <div key={i.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className={`text-white font-semibold ${i.done ? 'line-through text-gray-500' : ''}`}>{i.title}</div>
                    <div className="text-gray-400 text-sm">{new Date(i.date).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggle(i.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">
                      {i.done ? 'Undone' : 'Done'}
                    </button>
                    <button onClick={() => remove(i.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reminders;
