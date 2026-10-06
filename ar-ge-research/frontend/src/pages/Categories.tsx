import React, { useState } from 'react';
import toast from 'react-hot-toast';
import apiService, { Category } from '../services/api';
import { RefreshCw } from 'lucide-react';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [storeId, setStoreId] = useState('demo-store');

  const handleSyncCategories = async () => {
    if (!storeId) {
      toast.error('Please select a store');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.syncCategories(storeId);
      if (response.success) {
        setCategories(response.data || []);
        toast.success('Categories synced successfully!');
      } else {
        toast.error(response.error || 'Failed to sync categories');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sync categories');
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryTree = (categories: Category[], level = 1) => {
    return categories
      .filter((cat) => cat.level === level)
      .map((category) => (
        <div key={category.id} className="ml-4">
          <div
            className={`flex items-center space-x-2 p-2 rounded border-l-4 ${category.level === 1
                ? 'border-blue-400'
                : category.level === 2
                  ? 'border-green-400'
                  : 'border-gray-400'
              } bg-gray-50`}
          >
            <span className="text-gray-400">📁</span>
            <span className="font-medium text-gray-900">{category.name}</span>
            <span className="text-sm text-gray-500">
              ({category.ebayCategoryId})
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${category.level === 1
                  ? 'bg-blue-100 text-blue-800'
                  : category.level === 2
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
            >
              Level {category.level}
            </span>
          </div>
          {/* Render subcategories */}
          {renderCategoryTree(categories, level + 1)}
        </div>
      ));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Category Management
        </h1>
        <p className="text-gray-600">
          Sync and manage eBay categories for your store
        </p>
      </div>

      {/* Sync Controls */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Sync Categories from eBay</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Store:</label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="input text-sm"
              >
                <option value="demo-store">Demo Store</option>
                <option value="store-1">Store 1</option>
                <option value="store-2">Store 2</option>
              </select>
            </div>
            <button
              onClick={handleSyncCategories}
              disabled={loading}
              className="btn btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <RefreshCw size={16} />
              )}
              <span>{loading ? 'Syncing...' : 'Sync Categories'}</span>
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="font-semibold text-blue-900 mb-2">What this does:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Downloads the latest category tree from eBay API</li>
            <li>• Maps eBay category IDs to meaningful names</li>
            <li>• Stores the hierarchy for product classification</li>
            <li>• Enables accurate product categorization during listing</li>
          </ul>
        </div>
      </div>

      {/* Categories Display */}
      {categories.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No categories loaded
          </h3>
          <p className="text-gray-500 mb-4">
            Click "Sync Categories" to load the complete eBay category tree from
            eBay API
          </p>
        </div>
      ) : (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            Category Hierarchy ({categories.length} categories)
          </h3>

          <div className="space-y-2">{renderCategoryTree(categories)}</div>

          {/* Category Statistics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-md text-center">
              <div className="text-2xl font-bold text-blue-600">
                {categories.filter((c) => c.level === 1).length}
              </div>
              <div className="text-sm text-gray-600">Top Level Categories</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-md text-center">
              <div className="text-2xl font-bold text-green-600">
                {categories.filter((c) => c.level === 2).length}
              </div>
              <div className="text-sm text-gray-600">Subcategories</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-md text-center">
              <div className="text-2xl font-bold text-purple-600">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600">Total Categories</div>
            </div>
          </div>
        </div>
      )}

      {/* Sample Category Structure */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          Sample Category JSON Structure
        </h3>
        <div className="bg-gray-800 text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
          <pre>{`[
  {
    "id": "cat-001",
    "ebayCategoryId": "15032",
    "name": "Cell Phones & Accessories",
    "level": 1
  },
  {
    "id": "cat-002",
    "ebayCategoryId": "50331",
    "name": "Chargers & Power Supplies",
    "level": 2
  }
]`}</pre>
        </div>
      </div>
    </div>
  );
};

export default Categories;
