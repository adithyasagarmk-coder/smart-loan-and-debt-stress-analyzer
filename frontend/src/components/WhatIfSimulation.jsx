import React, { useState } from 'react';
import { dashboardService } from '../services/api';

const WhatIfSimulation = ({ onUpdate, currentData }) => {
  const [formData, setFormData] = useState({
    monthlyIncome: currentData?.monthlyIncome || 5000,
    monthlyExpense: currentData?.monthlyExpense || 2000,
    totalLoanEMI: currentData?.totalLoanEMI || 1000,
  });
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value) || 0,
    });
  };

  const handleSimulate = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.updateSimulation(formData);
      // Backend returns stress metrics at data level: { debtRatio, stressLevel, riskScore, disposableIncome }
      setSimulationResult(res.data.data);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStressColor = (stressLevel) => {
    switch (stressLevel) {
      case 'SAFE':
        return 'text-green-400';
      case 'RISKY':
        return 'text-yellow-400';
      case 'DANGEROUS':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
      <h3 className="text-gray-200 font-semibold mb-4">What-If Simulation</h3>
      <p className="text-xs text-gray-400 mb-4">See how your stress level changes</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Monthly Income</label>
          <input
            type="number"
            name="monthlyIncome"
            value={formData.monthlyIncome}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Monthly Expenses</label>
          <input
            type="number"
            name="monthlyExpense"
            value={formData.monthlyExpense}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Total Monthly EMI</label>
          <input
            type="number"
            name="totalLoanEMI"
            value={formData.totalLoanEMI}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleSimulate}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Run Simulation'}
        </button>
      </div>

      {simulationResult && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-gray-200 font-semibold mb-3">Simulation Results</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Debt Ratio:</span>
              <span className="text-white font-semibold">
                {(simulationResult.debtRatio * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Stress Level:</span>
              <span className={`font-semibold ${getStressColor(simulationResult.stressLevel)}`}>
                {simulationResult.stressLevel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Risk Score:</span>
              <span className="text-white font-semibold">{simulationResult.riskScore}/100</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 italic">
            *This is a simulation only and does not affect your actual financial data.
          </p>
        </div>
      )}
    </div>
  );
};

export default WhatIfSimulation;
