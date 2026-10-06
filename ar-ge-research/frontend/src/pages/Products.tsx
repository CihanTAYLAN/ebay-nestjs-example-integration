import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiService, { Product } from '../services/api';
import { Package, Plus, RefreshCw } from 'lucide-react';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState('demo-store');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await apiService.getProducts(storeId);
      if (response.success) {
        setProducts(response.data || []);
      } else {
        toast.error('Failed to load products');
      }
    } catch (error) {
      toast.error('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncProduct = async (productId: string) => {
    try {
      toast.loading('Syncing product...', { id: 'sync' });
      const response = await apiService.syncProduct(productId, storeId);
      if (response.success) {
        toast.success('Product synced successfully!', { id: 'sync' });
      } else {
        toast.error(response.error || 'Failed to sync product', { id: 'sync' });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sync product', { id: 'sync' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
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
            onClick={loadProducts}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ebay-blue"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="card text-center py-12">
          <Package size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-500 mb-4">
            Products will appear here once synched from eBay
          </p>
          <button onClick={loadProducts} className="btn btn-primary">
            Load Sample Products
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">
                          {product.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {product.id}
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {product.sku}
                      </code>
                    </td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>
                      <span
                        className={`status-badge ${product.quantity > 10
                            ? 'status-success'
                            : product.quantity > 0
                              ? 'status-warning'
                              : 'status-error'
                          }`}
                      >
                        {product.quantity}
                      </span>
                    </td>
                    <td>
                      <span className="status-success">Active</span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleSyncProduct(product.id)}
                        className="btn btn-primary text-sm"
                      >
                        Sync to eBay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sample Data Section */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Plus size={20} />
          <span>Sample Product Data</span>
        </h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-600 mb-3">
            In a real implementation, this page would display actual products
            from your database and allow synchronization with eBay. Here's what
            the sample data structure looks like:
          </p>
          <div className="bg-gray-800 text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
            <pre>{`[
  {
    "id": "prod-001",
    "title": "Wireless Bluetooth Headphones",
    "sku": "HEAD-BT-001",
    "price": 89.99,
    "quantity": 25,
    "categoryId": "cat-electronics"
  }
]`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
