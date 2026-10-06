import React, { useState } from 'react';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import { Key, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

const Auth: React.FC = () => {
  const [storeId, setStoreId] = useState('');
  const [consentUrl, setConsentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<
    'idle' | 'pending' | 'completed' | 'error'
  >('idle');

  const handleGetConsentUrl = async () => {
    if (!storeId.trim()) {
      toast.error('Please enter a store ID');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.getConsentUrl(storeId);
      if (response.success) {
        setConsentUrl(response.data?.consentUrl || '');
        setAuthStatus('pending');
        toast.success('Consent URL generated successfully!');
      } else {
        toast.error(response.error || 'Failed to generate consent URL');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate consent URL');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAuth = () => {
    setAuthStatus('completed');
    toast.success('Authentication flow completed!');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          eBay Authentication Setup
        </h1>
        <p className="text-gray-600">
          Configure OAuth 2.0 authentication for your eBay stores
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div
            className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${authStatus === 'completed' ? 'bg-green-100' : 'bg-gray-100'
              }`}
          >
            {authStatus === 'completed' ? (
              <CheckCircle className="text-green-600" size={24} />
            ) : (
              <Key className="text-gray-400" size={24} />
            )}
          </div>
          <h3 className="font-semibold text-gray-900">1. Get Consent URL</h3>
          <p className="text-sm text-gray-600 mt-1">
            Generate OAuth consent URL for your store
          </p>
        </div>

        <div className="card text-center">
          <div
            className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${authStatus === 'pending'
                ? 'bg-yellow-100'
                : authStatus === 'completed'
                  ? 'bg-green-100'
                  : 'bg-gray-100'
              }`}
          >
            {authStatus === 'completed' ? (
              <CheckCircle className="text-green-600" size={24} />
            ) : authStatus === 'pending' ? (
              <ExternalLink className="text-yellow-600" size={24} />
            ) : (
              <AlertCircle className="text-gray-400" size={24} />
            )}
          </div>
          <h3 className="font-semibold text-gray-900">2. User Consent</h3>
          <p className="text-sm text-gray-600 mt-1">
            User grants permission on eBay
          </p>
        </div>

        <div className="card text-center">
          <div
            className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${authStatus === 'completed' ? 'bg-green-100' : 'bg-gray-100'
              }`}
          >
            {authStatus === 'completed' ? (
              <CheckCircle className="text-green-600" size={24} />
            ) : (
              <AlertCircle className="text-gray-400" size={24} />
            )}
          </div>
          <h3 className="font-semibold text-gray-900">3. Tokens Received</h3>
          <p className="text-sm text-gray-600 mt-1">
            Access and refresh tokens stored
          </p>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="card max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">OAuth Configuration</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store ID
            </label>
            <input
              type="text"
              className="input"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              placeholder="Enter your store ID"
            />
          </div>

          <button
            onClick={handleGetConsentUrl}
            disabled={loading || !storeId.trim()}
            className="w-full btn btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Key size={18} />
            )}
            <span>
              {loading ? 'Generating...' : 'Generate OAuth Consent URL'}
            </span>
          </button>
        </div>
      </div>

      {/* Consent URL Display */}
      {consentUrl && (
        <div className="card max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <ExternalLink size={20} />
            <span>Consent URL Generated</span>
          </h3>

          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Click the link below to grant eBay API permissions for your store:
            </p>
            <a
              href={consentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ebay-blue hover:underline break-all"
            >
              {consentUrl}
            </a>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Click the consent URL above (opens in new tab)</li>
              <li>Sign in to your eBay account</li>
              <li>Review and accept the API permissions</li>
              <li>You'll be redirected back (this completes the OAuth flow)</li>
            </ol>
          </div>

          <button
            onClick={handleCompleteAuth}
            className="w-full btn btn-success"
          >
            Mark as Completed
          </button>
        </div>
      )}

      {/* Technical Details */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Technical Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">OAuth Scopes</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• sell.inventory - Manage product listings</li>
              <li>• sell.fulfillment - Access order data</li>
              <li>• sell.account - Account information</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Token Types</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Application Token - Metadata access</li>
              <li>• User Token - Protected operations</li>
              <li>• Refresh Token - Renew access tokens</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
