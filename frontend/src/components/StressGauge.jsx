import React from 'react';

const StressGauge = ({ score = 50 }) => {
  const getStressLevel = () => {
    if (score < 34) return 'Low';
    if (score < 67) return 'Medium';
    return 'High';
  };

  const getColor = () => {
    if (score < 34) return 'text-green-600';
    if (score < 67) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = () => {
    if (score < 34) return 'bg-green-500';
    if (score < 67) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const stressLevel = getStressLevel();
  const percentage = (score / 100) * 360;

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-lg shadow">
      <h3 className="text-gray-900 font-semibold text-center mb-6">Debt Health Score</h3>
      <div className="flex flex-col items-center">
        {/* Gauge */}
        <div className="relative w-48 h-24 mb-6">
          <svg viewBox="0 0 200 120" className="w-full h-full">
            {/* Background circle */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#374151"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Green section (Low - 0-120 degrees) */}
            <path
              d="M 20 100 A 80 80 0 0 1 69.28 22.63"
              fill="none"
              stroke="#22c55e"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Yellow section (Medium - 120-240 degrees) */}
            <path
              d="M 69.28 22.63 A 80 80 0 0 1 130.72 22.63"
              fill="none"
              stroke="#eab308"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Red section (High - 240-360 degrees) */}
            <path
              d="M 130.72 22.63 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#ef4444"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Needle */}
            <g transform={`rotate(${90 + percentage / 2} 100 100)`}>
              <line x1="100" y1="100" x2="100" y2="25" stroke="#f3f4f6" strokeWidth="3" strokeLinecap="round" />
              <circle cx="100" cy="100" r="6" fill="#f3f4f6" />
            </g>
            {/* Labels */}
            <text x="25" y="115" fontSize="11" fill="#9ca3af" fontWeight="500">
              Low
            </text>
            <text x="165" y="115" fontSize="11" fill="#9ca3af" fontWeight="500">
              High
            </text>
          </svg>
        </div>

        {/* Score Display */}
        <div className="text-center">
          <div className={`text-5xl font-bold ${getColor()} mb-2`}>{score}</div>
          <div className={`text-xl font-semibold ${getColor()} mb-4`}>{stressLevel} Stress</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full mt-6">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${getProgressBarColor()} transition-all duration-500`}
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-4 text-sm text-gray-300 text-center">
          {score < 34 && '✅ Your financial health is good. Keep maintaining!'}
          {score >= 34 && score < 67 && '⚠️ Monitor your finances carefully. Avoid new loans.'}
          {score >= 67 && '🚨 Critical! Take immediate action to reduce debt.'}
        </div>
      </div>
    </div>
  );
};

export default StressGauge;
