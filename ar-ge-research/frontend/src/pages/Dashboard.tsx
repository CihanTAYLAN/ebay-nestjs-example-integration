import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>System Online</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Total Stores
          </h3>
          <div className="text-3xl font-bold text-ebay-blue">0</div>
          <p className="text-sm text-gray-500 mt-1">Active eBay stores</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Products Synced
          </h3>
          <div className="text-3xl font-bold text-green-600">0</div>
          <p className="text-sm text-gray-500 mt-1">Listed on eBay</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Orders Imported
          </h3>
          <div className="text-3xl font-bold text-blue-600">0</div>
          <p className="text-sm text-gray-500 mt-1">From eBay</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            API Status
          </h3>
          <div className="status-success">Healthy</div>
          <p className="text-sm text-gray-500 mt-1">All systems operational</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full btn btn-primary">Create New Store</button>
            <button className="w-full btn btn-secondary">Sync Products</button>
            <button className="w-full btn btn-secondary">Import Orders</button>
            <button className="w-full btn btn-secondary">
              Configure eBay Auth
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  System initialized
                </p>
                <p className="text-xs text-gray-500">
                  Welcome to eBay Integration
                </p>
              </div>
              <span className="text-xs text-gray-500">Just now</span>
            </div>
          </div>
          <div className="mt-4 text-center text-gray-500">
            <p className="text-sm">
              No activities yet - start by creating your first store!
            </p>
          </div>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Getting Started
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-ebay-blue rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">
              1
            </div>
            <h4 className="font-semibold text-gray-900">Create Store</h4>
            <p className="text-sm text-gray-600 mt-1">
              Set up your eBay store configuration
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-ebay-blue rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">
              2
            </div>
            <h4 className="font-semibold text-gray-900">Configure Auth</h4>
            <p className="text-sm text-gray-600 mt-1">
              Set up eBay API authentication
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-ebay-blue rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">
              3
            </div>
            <h4 className="font-semibold text-gray-900">Sync Data</h4>
            <p className="text-sm text-gray-600 mt-1">
              Start syncing products and orders
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
