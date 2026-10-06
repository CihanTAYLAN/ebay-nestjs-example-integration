import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiService, { Store } from '../services/api';
import { Plus, Store as StoreIcon, Settings } from 'lucide-react';

const Stores: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    userId: 'user-1',
    description: '',
    sandboxMode: true,
  });

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const response = await apiService.getStores();
      if (response.success) {
        setStores(response.data || []);
      } else {
        toast.error('Failed to load stores');
      }
    } catch (error) {
      toast.error('Error loading stores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await apiService.createStore(formData);
      if (response.success) {
        toast.success('Store created successfully!');
        setStores([...stores, response.data!]);
        setShowCreateForm(false);
        setFormData({
          name: '',
          userId: 'user-1',
          description: '',
          sandboxMode: true,
        });
      } else {
        toast.error(response.error || 'Failed to create store');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ebay-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Store Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Create Store</span>
        </button>
      </div>

      {/* Create Store Form */}
      {showCreateForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Create New Store</h3>
          <form onSubmit={handleCreateStore} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.userId}
                  onChange={(e) =>
                    setFormData({ ...formData, userId: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="input"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sandboxMode"
                className="rounded border-gray-300"
                checked={formData.sandboxMode}
                onChange={(e) =>
                  setFormData({ ...formData, sandboxMode: e.target.checked })
                }
              />
              <label
                htmlFor="sandboxMode"
                className="ml-2 text-sm text-gray-700"
              >
                Sandbox Mode (for testing)
              </label>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Store'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stores List */}
      {stores.length === 0 ? (
        <div className="card text-center py-12">
          <StoreIcon size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No stores yet
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by creating your first eBay store
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            Create Your First Store
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div key={store.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <StoreIcon size={20} className="text-ebay-blue" />
                  <span
                    className={`status-badge ${store.sandboxMode ? 'status-warning' : 'status-success'
                      }`}
                  >
                    {store.sandboxMode ? 'Sandbox' : 'Production'}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Settings size={16} />
                </button>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {store.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {store.description || 'No description'}
              </p>

              <div className="text-xs text-gray-500 space-y-1 mb-4">
                <p>Owner: {store.user?.name || store.user?.email}</p>
                <p>Products: {store._count?.products || 0}</p>
                <p>Orders: {store._count?.orders || 0}</p>
              </div>

              <button className="w-full btn btn-primary">
                Configure eBay Auth
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Stores;
