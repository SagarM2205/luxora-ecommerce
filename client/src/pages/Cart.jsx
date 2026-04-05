import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import { formatPrice } from '../utils/formatters';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, loading } = useCartStore();

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="page container">
        <div className="empty-state">
          <ShoppingBag size={64} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '24px' }}>
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page container">
      <h1 style={{ marginBottom: '32px' }}>Shopping Cart ({cart.items.length} Items)</h1>
      
      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map((item) => (
            <div key={item._id} className="cart-item">
              <img src={item.image || 'https://placehold.co/100x120/png'} alt={item.name} onError={e => { e.target.onError = null; e.target.src = 'https://placehold.co/100x120/png'; }} />
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{item.name}</h3>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {item.size && <span style={{ marginRight: '16px' }}>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item._id)} 
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '8px' }}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="quantity-control">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                  </div>
                  
                  <span style={{ fontWeight: 700, fontSize: '1.3rem', color: 'var(--accent)' }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal ({cart.items.length} items):</span> 
            <span>{formatPrice(cart.totalPrice)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span> 
            <span style={{ color: 'var(--success)' }}>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span> 
            <span>{formatPrice(cart.totalPrice)}</span>
          </div>
          
          <Link to="/checkout" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '24px' }}>
            Proceed to Checkout <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
