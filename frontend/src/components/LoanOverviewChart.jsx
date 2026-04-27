import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Expects data from backend charts.chartData => [{ name: loanType, totalAmount }]
// Optionally supports emi if provided for future extensions
const LoanOverviewChart = ({ data = [] }) => {
  const safeData = Array.isArray(data) ? data : [];
  const hasData = safeData.length > 0;
  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
      <h3 className="text-gray-200 font-semibold mb-2">Loan Overview</h3>
      <p className="text-sm text-gray-400 mb-4">Total amount by loan type</p>
      {hasData ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={safeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '8px', color: '#e5e7eb' }}
              formatter={(v, k) => (k === 'totalAmount' ? [`₹${Number(v).toLocaleString()}`, 'Total Amount'] : [v, k])}
            />
            <Legend />
            <Bar dataKey="totalAmount" fill="#3B82F6" name="Total Amount (₹)" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-60 flex items-center justify-center text-gray-400">No loan data</div>
      )}
    </div>
  );
};

export default LoanOverviewChart;
