import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatters';

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS = {
  pending: 'var(--warning)',
  confirmed: 'var(--info)',
  shipped: 'var(--accent)',
  delivered: 'var(--success)',
  cancelled: 'var(--danger)',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const query = filterStatus ? `?status=${filterStatus}` : '';
      const { data } = await api.get(`/orders${query}`);
      setOrders(data.orders);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="page container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Manage Orders</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/admin'}>Overview</button>
          <button className="btn btn-primary">Orders</button>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/admin/products'}>Products</button>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm ${filterStatus === '' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterStatus('')}
        >
          All Orders ({orders.length > 0 && !filterStatus ? orders.length : '...'})
        </button>
        {ORDER_STATUSES.map(status => (
          <button
            key={status}
            className={`btn btn-sm ${filterStatus === status ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus(status)}
            style={{ textTransform: 'capitalize' }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{order._id.substring(0, 10)}...</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{order.user?.name || 'Deleted User'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.user?.email}</div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{order.items?.length} item(s)</td>
                <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{formatPrice(order.totalPrice)}</td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td>
                  <span className={`status-badge ${order.status}`}>{order.status}</span>
                </td>
                <td>
                  {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                    <select
                      className="form-input"
                      style={{ padding: '6px 10px', fontSize: '0.8rem', width: '140px' }}
                      value={order.status}
                      disabled={updatingId === order._id}
                      onChange={e => handleStatusChange(order._id, e.target.value)}
                    >
                      {ORDER_STATUSES.map(s => (
                        <option key={s} value={s} style={{ textTransform: 'capitalize' }}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {order.status === 'delivered' ? '✅ Delivered' : '❌ Cancelled'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                  No orders found{filterStatus ? ` with status "${filterStatus}"` : ''}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
