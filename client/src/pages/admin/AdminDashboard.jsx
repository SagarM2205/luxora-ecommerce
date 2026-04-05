import { useState, useEffect } from 'react';
import { Users, ShoppingBag, DollarSign, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatters';

const COLORS = ['var(--accent)', 'var(--success)', 'var(--warning)', 'var(--error)', 'var(--info)'];

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

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Revenue Line Chart */}
        <div className="stat-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', color: 'var(--text-primary)' }}>Revenue Timeline</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={stats?.salesData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: 'var(--accent)', fontWeight: 'bold' }}
                  labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
                  formatter={(value) => formatPrice(value)}
                />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-card)', strokeWidth: 2 }} activeDot={{ r: 6, fill: 'var(--accent)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="stat-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', color: 'var(--text-primary)' }}>Order Distribution</h2>
          <div style={{ width: '100%', height: 260, display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats?.orderStatusData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {(stats?.orderStatusData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginTop: '16px' }}>
            {(stats?.orderStatusData || []).map((entry, index) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></div>
                {entry.name} <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>({entry.value})</span>
              </div>
            ))}
          </div>
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
