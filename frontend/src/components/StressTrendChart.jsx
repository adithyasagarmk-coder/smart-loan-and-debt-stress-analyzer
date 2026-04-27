import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const StressTrendChart = ({ data = [] }) => {
  const safeData = Array.isArray(data) ? data : [];
  const hasData = safeData && safeData.length > 0;

  // Simple trend analysis based on riskScore delta over last 3 points
  let trendLabel = null;
  let trendClass = '';
  if (hasData) {
    const points = safeData.slice(-3);
    const first = points[0]?.riskScore ?? safeData[0]?.riskScore;
    const last = points[points.length - 1]?.riskScore ?? safeData[safeData.length - 1]?.riskScore;
    const delta = typeof first === 'number' && typeof last === 'number' ? last - first : 0;
    if (delta > 2) {
      trendLabel = `Rising risk (+${delta.toFixed(1)})`;
      trendClass = 'text-red-400';
    } else if (delta < -2) {
      trendLabel = `Improving risk (${delta.toFixed(1)})`;
      trendClass = 'text-green-400';
    } else {
      trendLabel = `Stable (${delta.toFixed(1)})`;
      trendClass = 'text-yellow-400';
    }
  }

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
      <h3 className="text-gray-200 font-semibold mb-4">Stress Trend Analysis</h3>
      {hasData ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={safeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '8px', color: '#e5e7eb' }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="riskScore"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
                name="Risk Score"
              />
              <Line
                type="monotone"
                dataKey="debtRatio"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={false}
                name="Debt Ratio"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 text-sm">
            <span className="text-gray-400 mr-2">Trend:</span>
            <span className={`font-semibold ${trendClass}`}>{trendLabel}</span>
          </div>
        </>
      ) : (
        <div className="h-60 flex items-center justify-center text-gray-400">No stress trend data</div>
      )}
    </div>
  );
};

export default StressTrendChart;
