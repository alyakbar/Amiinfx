'use client';

import { useState } from 'react';

export default function TestMpesaPage() {
  const [testId, setTestId] = useState('ws_CO_220820250633419757085200');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/mpesa/status?id=${testId}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  const testDebug = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mpesa/debug');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  const queryMpesaAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mpesa/query-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checkoutRequestID: testId }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  const checkRecentCallbacks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mpesa/recent');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">M-Pesa Payment Testing</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">CheckoutRequestID:</label>
          <input
            type="text"
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full"
            placeholder="Enter CheckoutRequestID (e.g., ws_CO_...)"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use a CheckoutRequestID from your M-Pesa payments to query status directly from Safaricom
          </p>
        </div>

        <div className="space-x-4">
          <button
            onClick={testStatus}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Local Status'}
          </button>
          
          <button
            onClick={queryMpesaAPI}
            disabled={loading}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Querying...' : 'Query M-Pesa API'}
          </button>
          
          <button
            onClick={checkRecentCallbacks}
            disabled={loading}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Recent Callbacks'}
          </button>
          
          <button
            onClick={testDebug}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Debug All Payments'}
          </button>
        </div>

        {result && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">M-Pesa Status Query Options:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Test Local Status:</strong> Checks our local database for payment status</li>
          <li>• <strong>Query M-Pesa API:</strong> Queries Safaricom directly for real-time status</li>
          <li>• <strong>Recent Callbacks:</strong> Shows recent M-Pesa callbacks received by your server</li>
          <li>• <strong>Debug All Payments:</strong> Shows all payment records in local storage</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="font-semibold text-red-800 mb-2">🚨 Troubleshooting Your Payment Issue:</h3>
        <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
          <li><strong>Click &quot;Recent Callbacks&quot;</strong> to see if M-Pesa sent us the payment confirmation</li>
          <li><strong>If no recent callbacks:</strong> Your callback URL might not be reachable by M-Pesa</li>
          <li><strong>Use your actual CheckoutRequestID</strong> (from the payment) with &quot;Query M-Pesa API&quot;</li>
          <li><strong>Check the browser console</strong> and terminal logs for detailed callback information</li>
        </ol>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">Available CheckoutRequestIDs from your data:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• ws_CO_220820250633419757085200 (User cancelled)</li>
          <li>• ws_CO_220820250635514794204465 (No response from user)</li>
          <li>• ws_CO_210820252354013794596226 (User cancelled)</li>
        </ul>
      </div>
    </div>
  );
}
