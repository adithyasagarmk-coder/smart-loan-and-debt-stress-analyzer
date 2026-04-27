import React from 'react';

export const FinancialOverview = ({ income, expenses, emi }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-700 p-6 rounded-lg shadow">
        <h3 className="text-green-300 text-sm font-medium">Monthly Income</h3>
        <p className="text-3xl font-bold text-green-200 mt-2">₹{income?.toLocaleString() || 0}</p>
      </div>
      <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 border border-yellow-700 p-6 rounded-lg shadow">
        <h3 className="text-yellow-300 text-sm font-medium">Monthly Expenses</h3>
        <p className="text-3xl font-bold text-yellow-200 mt-2">₹{expenses?.toLocaleString() || 0}</p>
      </div>
      <div className="bg-gradient-to-br from-red-900 to-red-800 border border-red-700 p-6 rounded-lg shadow">
        <h3 className="text-red-300 text-sm font-medium">Total Loan EMI</h3>
        <p className="text-3xl font-bold text-red-200 mt-2">₹{emi?.toLocaleString() || 0}</p>
      </div>
    </div>
  );
};

export default FinancialOverview;
