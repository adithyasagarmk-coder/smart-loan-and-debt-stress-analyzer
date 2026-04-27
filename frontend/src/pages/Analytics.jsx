import React, { useState, useEffect } from 'react';
import { loanService, dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Analytics = () => {
  const [chartData, setChartData] = useState({
    loanDistribution: [],
    loanDetails: [],
    dashboardData: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const loanRes = await loanService.getLoans();
      const dashRes = await dashboardService.getDashboard();

      const loans = loanRes.data.data || [];
      const dashData = dashRes.data.data;

      // Loan distribution by type
      const distribution = {};
      loans.forEach((loan) => {
        if (loan.status === 'ACTIVE') {
          distribution[loan.type] = (distribution[loan.type] || 0) + loan.amount;
        }
      });

      const loanDistribution = Object.entries(distribution).map(([name, value]) => ({
        name,
        value: Math.round(value),
      }));

      // Loan details for bar chart
      const loanDetails = loans
        .filter((l) => l.status === 'ACTIVE')
        .slice(0, 5)
        .map((loan) => ({
          type: loan.type.substring(0, 10),
          emi: Math.round(loan.monthlyEMI),
          interest: Math.round(loan.interestRate * 100) / 100,
        }));

      setChartData({
        loanDistribution: loanDistribution.length > 0 ? loanDistribution : [{ name: 'No Loans', value: 1 }],
        loanDetails,
        dashboardData: dashData,
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-400">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Derived analytics
  const insights = [];
  const dash = chartData.dashboardData;
  if (dash) {
    const utilization = dash.financialOverview.monthlyIncome
      ? dash.financialOverview.totalEMI / dash.financialOverview.monthlyIncome
      : 0;
    if (utilization > 0.5) insights.push({ t: 'warning', m: 'EMI to income utilization is high (>50%).' });
    if (dash.stressMetrics?.riskScore >= 70) insights.push({ t: 'danger', m: 'Elevated risk score detected.' });
    const chart = dash.charts?.stressTrendData || [];
    if (chart.length > 2) {
      const first = chart[0].riskScore;
      const last = chart[chart.length - 1].riskScore;
      const delta = last - first;
      if (delta > 5) insights.push({ t: 'warning', m: `Risk score rising (+${delta.toFixed(1)}).` });
      if (delta < -5) insights.push({ t: 'positive', m: `Risk score improving (${delta.toFixed(1)}).` });
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">Visual insights into your loans and finances</p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-600 text-red-200 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Key Metrics */}
          {chartData.dashboardData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-600 rounded-lg p-6">
                  <p className="text-gray-400 text-sm mb-2">Total Loans</p>
                  <p className="text-3xl font-bold text-blue-400">{chartData.dashboardData.loans.activeCount}</p>
                </div>

                <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-600 rounded-lg p-6">
                  <p className="text-gray-400 text-sm mb-2">Total Amount</p>
                  <p className="text-3xl font-bold text-green-400">
                    ₹{(chartData.dashboardData.loans.totalAmount ?? 0 / 100000).toFixed(1)}L
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-600 rounded-lg p-6">
                  <p className="text-gray-400 text-sm mb-2">Monthly EMI</p>
                  <p className="text-3xl font-bold text-purple-400">
                    ₹{chartData.dashboardData.financialOverview.totalEMI.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 border border-orange-600 rounded-lg p-6">
                  <p className="text-gray-400 text-sm mb-2">Total Interest</p>
                  <p className="text-3xl font-bold text-orange-400">
                    ₹{chartData.dashboardData.loans.totalInterest.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Utilization + Risk quick view */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Utilization */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <p className="text-gray-400 text-sm mb-2">EMI / Income Utilization</p>
                  {(() => {
                    const income = dash.financialOverview.monthlyIncome || 0;
                    const emi = dash.financialOverview.totalEMI || 0;
                    const util = income ? emi / income : 0;
                    const pct = Math.min(100, Math.round(util * 100));
                    const color = pct < 30 ? 'bg-green-600' : pct < 50 ? 'bg-yellow-500' : 'bg-red-600';
                    return (
                      <>
                        <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                          <div className={`${color} h-3 rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-white text-xl font-bold">{pct}%</p>
                        <p className="text-gray-500 text-xs">Lower is better</p>
                      </>
                    );
                  })()}
                </div>
                {/* Delinquency heuristic */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <p className="text-gray-400 text-sm mb-2">Delinquency Risk (Heuristic)</p>
                  {(() => {
                    const risk = dash.stressMetrics?.riskScore || 0;
                    const ratio = (dash.stressMetrics?.debtRatio || 0) * 100;
                    const score = Math.min(100, Math.round(0.7 * risk + 0.3 * ratio));
                    const label = score < 30 ? 'Low' : score < 60 ? 'Moderate' : 'High';
                    const color = score < 30 ? 'text-green-400' : score < 60 ? 'text-yellow-400' : 'text-red-400';
                    return (
                      <div>
                        <p className={`text-3xl font-bold ${color}`}>{label}</p>
                        <p className="text-gray-500 text-xs">Composite: {score}/100</p>
                      </div>
                    );
                  })()}
                </div>
                {/* Insights count */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <p className="text-gray-400 text-sm mb-2">Insights</p>
                  <p className="text-3xl font-bold text-blue-400">{insights.length}</p>
                  <p className="text-gray-500 text-xs">Generated from your data</p>
                </div>
              </div>
            </>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Loan Distribution Pie Chart */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-6">📊 Loan Distribution by Type</h2>
              {chartData.loanDistribution.length > 0 && chartData.loanDistribution[0].name !== 'No Loans' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.loanDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.loanDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value) => `₹${value.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-400">
                  <p>No loan data available</p>
                </div>
              )}
            </div>

            {/* EMI vs Interest Rate */}
            {chartData.loanDetails.length > 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-bold text-white mb-6">📈 EMI vs Interest Rate</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.loanDetails}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="type" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="emi" fill="#3B82F6" name="Monthly EMI (₹)" />
                    <Bar dataKey="interest" fill="#EF4444" name="Interest Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Income vs Expense Analysis */}
          {chartData.dashboardData && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-bold text-white mb-6">💰 Income vs Expense vs EMI</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      category: 'Monthly Finances',
                      income: chartData.dashboardData.financialOverview.monthlyIncome,
                      expenses: chartData.dashboardData.financialOverview.monthlyExpense,
                      emi: chartData.dashboardData.financialOverview.totalEMI,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value) => `₹${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10B981" name="Income (₹)" />
                  <Bar dataKey="expenses" fill="#F59E0B" name="Expenses (₹)" />
                  <Bar dataKey="emi" fill="#EF4444" name="EMI (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Summary Table */}
          {chartData.loanDetails.length > 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-bold text-white mb-6">📋 Top Loans Summary</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-700">
                    <tr className="text-gray-400">
                      <th className="text-left py-3 px-4">Loan Type</th>
                      <th className="text-right py-3 px-4">Monthly EMI</th>
                      <th className="text-right py-3 px-4">Interest Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.loanDetails.map((loan, idx) => (
                      <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                        <td className="py-3 px-4 text-white">{loan.type}</td>
                        <td className="py-3 px-4 text-right text-green-400 font-medium">₹{loan.emi}</td>
                        <td className="py-3 px-4 text-right text-orange-400">{loan.interest}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
