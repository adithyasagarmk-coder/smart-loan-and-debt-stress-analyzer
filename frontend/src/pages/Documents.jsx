import React from 'react';
import Sidebar from '../components/Sidebar';

// Documents page simplified: document downloading section removed as requested.
// Provides a placeholder with guidance.

const Documents = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Documents</h1>
            <p className="text-gray-400">
              Document downloading has been removed. You can manage documents through your backend or integrate a viewer-only flow.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-2">No Downloading Available</h2>
            <p className="text-gray-400 text-sm">
              This section no longer supports downloading. If you need upload or secure preview, connect to the backend documents API and render a read-only list.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Documents;
