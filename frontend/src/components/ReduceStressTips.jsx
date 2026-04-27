import React from 'react';

const ReduceStressTips = () => {
  const tips = [
    {
      icon: '🔧',
      title: 'Cut Unnecessary Expenses',
      description: 'Review and reduce non-essential spending to free up cash.',
    },
    {
      icon: '📋',
      title: 'Consider Debt Consolidation',
      description: 'Combine multiple loans into one with lower interest rates.',
    },
    {
      icon: '💰',
      title: 'Increase Savings & Emergency Fund',
      description: 'Build a safety net to handle unexpected financial challenges.',
    },
  ];

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
      <h3 className="text-gray-200 font-semibold mb-6">Tips to Reduce Stress</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-700 p-4 rounded-lg text-center hover:shadow-md hover:border-blue-500 transition"
          >
            <div className="text-4xl mb-2">{tip.icon}</div>
            <h4 className="font-semibold text-gray-200 text-sm">{tip.title}</h4>
            <p className="text-xs text-gray-400 mt-2">{tip.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReduceStressTips;
