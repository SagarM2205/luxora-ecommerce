import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp, MapPin, CreditCard, ShoppingBag, Download } from 'lucide-react';
import api from '../services/api';
import { formatPrice } from '../utils/formatters';
import { generateReceipt } from '../utils/receiptGenerator';
import OptimizedImage from '../components/common/OptimizedImage';

// ── Status Config ──────────────────────────────────────
const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'var(--warning)', bg: 'rgba(234,179,8,0.1)',   icon: Clock },
  confirmed: { label: 'Confirmed', color: '#3b82f6',        bg: 'rgba(59,130,246,0.1)',  icon: CheckCircle },
  shipped:   { label: 'Shipped',   color: '#8b5cf6',        bg: 'rgba(139,92,246,0.1)',  icon: Truck },
  delivered: { label: 'Delivered', color: 'var(--success)', bg: 'rgba(34,197,94,0.1)',   icon: Package },
  cancelled: { label: 'Cancelled', color: 'var(--danger)',  bg: 'rgba(239,68,68,0.1)',   icon: XCircle },
};

const STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

// ── Order Progress Stepper ─────────────────────────────
function OrderStepper({ status }) {
  if (status === 'cancelled') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontWeight: 600, fontSize: '0.9rem' }}>
        <XCircle size={18} /> Order Cancelled
      </div>
    );
  }

  const currentIdx = STEPS.indexOf(status);

  return (
    <div className="order-stepper">
      {STEPS.map((step, i) => {
        const cfg = STATUS_CONFIG[step];
        const Icon = cfg.icon;
        const done = i <= currentIdx;
        const active = i === currentIdx;

        return (
          <div key={step} className="order-step" data-active={active} data-done={done}>
            <div className="order-step-icon" style={{
              background: done ? 'var(--accent)' : 'var(--bg-secondary)',
              color: done ? '#fff' : 'var(--text-muted)',
              border: active ? '2px solid var(--accent)' : '2px solid transparent',
              boxShadow: active ? '0 0 0 4px var(--accent-light)' : 'none',
            }}>
              <Icon size={16} />
            </div>
            <span className="order-step-label" style={{ color: done ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: active ? 700 : 400 }}>
              {cfg.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="order-step-line" style={{ background: i < currentIdx ? 'var(--accent)' : 'var(--border)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Single Order Card ──────────────────────────────────
const OrderCard = memo(function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  return (
    <div className="order-card">
      {/* Header */}
      <div className="order-card-header" onClick={() => setExpanded(!expanded)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              #{order._id.slice(-8).toUpperCase()}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: cfg.bg, color: cfg.color }}>
              <Icon size={12} /> {cfg.label}
            </span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {order.items.length} item{order.items.length !== 1 ? 's' : ''} &bull; Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent)' }}>{formatPrice(order.totalPrice)}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total paid</div>
          </div>
          <div style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}>
            <ChevronDown size={20} />
          </div>
        </div>
      </div>

      {/* Preview thumbnails when collapsed */}
      {!expanded && (
        <div style={{ display: 'flex', gap: '8px', padding: '0 24px 20px' }}>
          {order.items.slice(0, 5).map((item, i) => (
            <OptimizedImage key={i} src={item.image} alt={item.name}
              style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
            />
          ))}
          {order.items.length > 5 && (
            <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              +{order.items.length - 5}
            </div>
          )}
        </div>
      )}

      {/* Expanded Detail */}
      {expanded && (
        <div className="order-detail">
          {/* Progress */}
          <OrderStepper status={order.status} />

          {/* Items */}
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Items Ordered</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <OptimizedImage src={item.image} alt={item.name}
                    style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1 }}>
                    <Link to={`/products/${item.product?._id || item.product}`} style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {item.name}
                    </Link>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '3px', display: 'flex', gap: '12px' }}>
                      {item.size && <span>Size: <strong>{item.size}</strong></span>}
                      {item.color && <span>Color: <strong>{item.color}</strong></span>}
                      <span>Qty: <strong>{item.quantity}</strong></span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>{formatPrice(item.price)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
            {/* Address */}
            <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                <MapPin size={14} /> Shipping To
              </div>
              {order.shippingAddress ? (
                <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                  {order.shippingAddress.country}
                </div>
              ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No address on record</span>}
            </div>

            {/* Payment */}
            <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                <CreditCard size={14} /> Payment
              </div>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.8 }}>
                <div>Method: <strong>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}</strong></div>
                <div>Subtotal: <strong>{formatPrice(order.itemsPrice || order.totalPrice)}</strong></div>
                <div>GST (18%): <strong>{formatPrice(order.taxPrice || 0)}</strong></div>
                {order.discount > 0 && <div style={{ color: 'var(--success)' }}>Discount ({order.couponApplied}): <strong>-{formatPrice(order.discount)}</strong></div>}
                <div>Shipping: <strong style={{ color: 'var(--success)' }}>Free</strong></div>
                <div style={{ paddingTop: '6px', borderTop: '1px solid var(--border)', marginTop: '6px', fontWeight: 700, fontSize: '1rem' }}>
                  Total: {formatPrice(order.totalPrice)}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={(e) => { e.stopPropagation(); generateReceipt(order); }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Download size={16} /> Download Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

// ── Main Page ──────────────────────────────────────────
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my');
        setOrders(data.orders);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  if (orders.length === 0) {
    return (
      <div className="page container">
        <div className="empty-state">
          <ShoppingBag size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders yet. Start exploring our collections!</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '24px' }}>Start Shopping</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'all', label: 'All Orders', count: orders.length },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ].map(t => ({ ...t, count: t.count ?? orders.filter(o => o.status === t.key).length }))
   .filter(t => t.key === 'all' || t.count > 0);

  return (
    <div className="page container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ margin: 0 }}>My Orders</h1>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{orders.length} total order{orders.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600, transition: 'var(--transition-fast)',
              background: filter === tab.key ? 'var(--accent)' : 'var(--bg-secondary)',
              color: filter === tab.key ? '#fff' : 'var(--text-secondary)',
            }}>
            {tab.label} {tab.count > 0 && <span style={{ opacity: 0.8 }}>({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: '48px 0' }}>
          <Package size={40} style={{ opacity: 0.3 }} />
          <p>No {filter} orders</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(order => <OrderCard key={order._id} order={order} />)}
        </div>
      )}
    </div>
  );
}
