import React, { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';

const weight = { payment: 0.35, utilization: 0.3, age: 0.15, mix: 0.1, inquiries: 0.1 };

const CreditScore = () => {
  const [factors, setFactors] = useState({ payment: 95, utilization: 30, age: 3, mix: 2, inquiries: 1 });

  const score = useMemo(() => {
    const p = Math.max(0, Math.min(100, factors.payment));
    const u = Math.max(0, Math.min(100, 100 - factors.utilization)); // lower util = better
    const a = Math.min(100, factors.age * 10);
    const m = Math.min(100, factors.mix * 15);
    const q = Math.max(0, Math.min(100, 100 - factors.inquiries * 15)); // fewer inquiries better
    const raw = p * weight.payment + u * weight.utilization + a * weight.age + m * weight.mix + q * weight.inquiries;
    return Math.round(300 + (raw / 100) * 550);
  }, [factors]);

  const set = (k) => (e) => setFactors((prev) => ({ ...prev, [k]: Number(e.target.value) }));

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4">Credit Score Simulator</h1>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
            <div className="text-white text-5xl font-extrabold">{score}</div>
            <div className="text-gray-400">Estimated score based on inputs</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <label className="text-gray-300 text-sm">Payment History (%)</label>
              <input type="range" min="0" max="100" value={factors.payment} onChange={set('payment')} className="w-full" />
              <div className="text-white">{factors.payment}%</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <label className="text-gray-300 text-sm">Utilization (%)</label>
              <input type="range" min="0" max="100" value={factors.utilization} onChange={set('utilization')} className="w-full" />
              <div className="text-white">{factors.utilization}%</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <label className="text-gray-300 text-sm">Credit Age (years)</label>
              <input type="range" min="0" max="20" value={factors.age} onChange={set('age')} className="w-full" />
              <div className="text-white">{factors.age} years</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <label className="text-gray-300 text-sm">Credit Mix (types)</label>
              <input type="range" min="0" max="6" value={factors.mix} onChange={set('mix')} className="w-full" />
              <div className="text-white">{factors.mix}</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <label className="text-gray-300 text-sm">Recent Inquiries</label>
              <input type="range" min="0" max="10" value={factors.inquiries} onChange={set('inquiries')} className="w-full" />
              <div className="text-white">{factors.inquiries}</div>
            </div>
          </div>

          <div className="mt-6 bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h2 className="text-white font-semibold mb-2">Tips</h2>
            <ul className="text-gray-300 text-sm list-disc ml-5">
              <li>Keep utilization under 30% for better scores.</li>
              <li>Build a longer payment history by avoiding missed payments.</li>
              <li>Diversify credit mix gradually; avoid opening many accounts at once.</li>
              <li>Limit new inquiries to protect your score short-term.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreditScore;
