import { useState, useEffect } from 'react';
import { Users, ShoppingBag, DollarSign, Package } from 'lucide-react';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatters';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/orders/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="page container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary">Overview</button>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/admin/orders'}>Orders</button>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/admin/products'}>Products</button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="admin-grid">
        <div className="stat-card">
          <DollarSign size={24} color="var(--accent)" />
          <div className="stat-value">{formatPrice(stats?.stats?.totalRevenue || 0)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        
        <div className="stat-card">
          <ShoppingBag size={24} color="var(--success)" />
          <div className="stat-value">{stats?.stats?.totalOrders || 0}</div>
          <div className="stat-label">Total Orders</div>
        </div>

        <div className="stat-card">
          <Users size={24} color="var(--info)" />
          <div className="stat-value">{stats?.stats?.totalUsers || 0}</div>
          <div className="stat-label">Registered Users</div>
        </div>

        <div className="stat-card">
          <Package size={24} color="var(--warning)" />
          <div className="stat-value">{stats?.stats?.totalProducts || 0}</div>
          <div className="stat-label">Products Active</div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Recent Orders</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats?.recentOrders?.map(order => (
              <tr key={order._id}>
                <td style={{ fontFamily: 'monospace' }}>{order._id.substring(0, 8)}...</td>
                <td>{order.user?.name || 'Guest'}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td style={{ fontWeight: 600 }}>{formatPrice(order.totalPrice)}</td>
                <td>
                  <span className={`status-badge ${order.status}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>No recent orders</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
