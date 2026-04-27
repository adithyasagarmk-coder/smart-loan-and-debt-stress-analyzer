import React from 'react';

const getStatusColor = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-green-900 text-green-200';
    case 'Paid':
      return 'bg-orange-900 text-orange-200';
    case 'Pending':
      return 'bg-red-900 text-red-200';
    default:
      return 'bg-gray-700 text-gray-200';
  }
};

const RecentLoansTable = ({ loans = [] }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow overflow-x-auto">
      <h3 className="text-gray-200 font-semibold mb-4">Recent Loans</h3>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 font-semibold text-gray-300">Loan Type</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-300">Amount</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-300">Interest Rate</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-300">Status</th>
          </tr>
        </thead>
        <tbody>
          {loans.length > 0 ? (
            loans.slice(0, 5).map((loan) => (
              <tr key={loan._id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                <td className="py-3 px-4 text-gray-300">{loan.type}</td>
                <td className="py-3 px-4 text-gray-300">₹{loan.amount?.toLocaleString()}</td>
                <td className="py-3 px-4 text-gray-300">{loan.interestRate}%</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                    {loan.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="py-4 px-4 text-center text-gray-400">
                No loans found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecentLoansTable;
