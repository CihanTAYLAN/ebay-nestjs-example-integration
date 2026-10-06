import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiService, { Order } from '../services/api';
import { ShoppingCart, RefreshCw, Eye } from 'lucide-react';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState('demo-store');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await apiService.getOrders(storeId);
      if (response.success) {
        setOrders(response.data || []);
      } else {
        toast.error('Failed to load orders');
      }
    } catch (error) {
      toast.error('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncOrders = async () => {
    setLoading(true);
    try {
      const response = await apiService.syncOrders(storeId);
      if (response.success) {
        toast.success('Orders synced successfully!');
        setOrders(response.data || []);
      } else {
        toast.error(response.error || 'Failed to sync orders');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sync orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      completed: 'status-success',
      processing: 'status-warning',
      pending: 'status-info',
      cancelled: 'status-error',
    };
    return statusMap[status as keyof typeof statusMap] || 'status-info';
  };

  const formatAmount = (amount: number) => `$${amount.toFixed(2)}`;

  const handleViewOrder = (orderId: string) => {
    toast.info(`Viewing order ${orderId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
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
            onClick={loadOrders}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleSyncOrders}
            disabled={loading}
            className="btn btn-primary flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>Sync Orders</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ebay-blue"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-12">
          <ShoppingCart size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-500 mb-4">
            Orders will appear here once synched from eBay
          </p>
          <button onClick={handleSyncOrders} className="btn btn-primary">
            Sync Orders from eBay
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">
                          #{order.id}
                        </div>
                        <div className="text-sm text-gray-500">eBay Order</div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.customerName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customerEmail}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusBadge(
                          order.status,
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </td>
                    <td className="font-medium">
                      {formatAmount(order.totalAmount)}
                    </td>
                    <td>
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="btn btn-primary text-sm flex items-center space-x-1"
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Statistics */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">
              {orders.length}
            </div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">
              {orders.filter((o) => o.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter((o) => o.status === 'processing').length}
            </div>
            <div className="text-sm text-gray-600">Processing</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-purple-600">
              {orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">$ Total Value</div>
          </div>
        </div>
      )}

      {/* Sample Order Structure */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          Sample Order JSON Structure
        </h3>
        <div className="bg-gray-800 text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
          <pre>{`[
  {
    "id": "ord-001",
    "customerEmail": "customer@example.com",
    "customerName": "John Doe",
    "status": "completed",
    "totalAmount": 149.99
  }
]`}</pre>
        </div>
      </div>
    </div>
  );
};

export default Orders;
