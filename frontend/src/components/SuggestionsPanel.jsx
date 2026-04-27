import React, { useState, useEffect } from 'react';
import { suggestionsService } from '../services/api';

const SuggestionsPanel = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stressMetrics, setStressMetrics] = useState(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const res = await suggestionsService.getSuggestions();
      setSuggestions(res.data.data.suggestions || []);
      setStressMetrics(res.data.data.stressMetrics);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch suggestions');
      console.error('Suggestions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return '🚨';
      case 'medium':
        return '⚠️';
      case 'low':
        return 'ℹ️';
      default:
        return '💡';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-900 border-red-700';
      case 'medium':
        return 'bg-yellow-900 border-yellow-700';
      case 'low':
        return 'bg-green-900 border-green-700';
      default:
        return 'bg-blue-900 border-blue-700';
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-400">Loading suggestions...</div>;
  }

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
      <h3 className="text-gray-200 font-semibold mb-2">Smart Suggestions</h3>
      {stressMetrics && (
        <p className="text-sm text-gray-400 mb-4">
          Current Debt Ratio: {(stressMetrics.debtRatio * 100).toFixed(1)}% | Risk Score: {stressMetrics.riskScore}/100
        </p>
      )}

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`border-l-4 p-4 rounded-lg ${getPriorityColor(suggestion.priority)}`}
            >
              <h4 className="font-semibold text-white flex items-center gap-2">
                <span>{getPriorityIcon(suggestion.priority)}</span>
                {suggestion.title}
              </h4>
              <p className="text-sm text-gray-200 mt-2">{suggestion.message}</p>
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-center py-4">
            No suggestions available
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionsPanel;
