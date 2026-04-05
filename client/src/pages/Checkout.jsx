import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShoppingBag, MapPin, CreditCard, ArrowRight, CheckCircle, ChevronLeft, Package, Truck, Phone, User, Download, Tag } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { formatPrice } from '../utils/formatters';
import { generateReceipt } from '../utils/receiptGenerator';

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const STEPS = [
  { id: 1, label: 'Delivery', icon: MapPin },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Review', icon: ShoppingBag },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCartStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placedOrder, setPlacedOrder] = useState(null);

  const [addr, setAddr] = useState({
    fullName: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  const updateAddr = (field, val) => setAddr(prev => ({ ...prev, [field]: val }));

  // Guard: empty cart (but not after success)
  if (!success && (!cart || cart.items.length === 0)) {
    navigate('/cart');
    return null;
  }

  const subtotal = Number(cart?.totalPrice) || 0;
  const taxPrice = Math.round(subtotal * 0.18);
  const shippingPrice = 0;
  
  const [couponInput, setCouponInput] = useState('');
  const [activeCoupon, setActiveCoupon] = useState(null);
  
  let discountAmount = 0;
  if (activeCoupon) {
    discountAmount = Math.round((subtotal * activeCoupon.discountPercentage) / 100);
    if (activeCoupon.maxDiscountAmount > 0 && discountAmount > activeCoupon.maxDiscountAmount) {
      discountAmount = activeCoupon.maxDiscountAmount;
    }
  }

  const total = subtotal + taxPrice + shippingPrice - discountAmount;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    try {
      setLoading(true);
      const { data } = await api.post('/coupons/validate', { code: couponInput.trim() });
      setActiveCoupon({
        code: data.code,
        discountPercentage: data.discountPercentage,
        maxDiscountAmount: data.maxDiscountAmount
      });
      toast.success(data.message || 'Coupon Applied!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid Coupon Code');
      setActiveCoupon(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      if (paymentMethod === 'cod') {
        const { data } = await api.post('/orders', {
          shippingAddress: addr,
          paymentMethod,
          couponCode: activeCoupon?.code
        });

        setPlacedOrder(data.order);
        await fetchCart();
        setSuccess(true);
        setLoading(false);
      } else if (paymentMethod === 'razorpay') {
        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!res) {
          toast.error('Razorpay SDK failed to load. Check your connection.');
          setLoading(false);
          return;
        }

        const { data } = await api.post('/orders/razorpay/create', { 
           shippingAddress: addr,
           couponCode: activeCoupon?.code
        });
        
        if (!data.success) {
          toast.error(data.message || 'Failed to initialize Razorpay');
          setLoading(false);
          return;
        }

        const options = {
          key: data.keyId,
          amount: data.order.amount,
          currency: data.order.currency,
          name: "LUXORA",
          description: "Premium Fashion Purchase",
          image: "https://ui-avatars.com/api/?name=Luxora&background=6366f1&color=fff",
          order_id: data.order.id, // This is the razorpay order_id
          handler: async function (response) {
            try {
              setLoading(true);
              // Verify the payment signature on the backend
              const { data: verData } = await api.post('/orders/razorpay/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              
              setPlacedOrder(verData.order);
              await fetchCart();
              setSuccess(true);
            } catch (err) {
              toast.error(err.response?.data?.message || 'Payment Verification Failed');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: addr.fullName,
            email: user?.email || '',
            contact: addr.phone
          },
          theme: {
            color: "#6366f1"
          },
          modal: {
            ondismiss: function () {
              setLoading(false); // Stop loading if user closes the modal
            }
          }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response) {
          toast.error(response.error.description || 'Payment Failed');
        });
        rzp1.open();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start payment');
      setLoading(false);
    }
  };

  // ── Success Screen ────────────────────────────────────
  if (success) {
    return (
      <div className="page container" style={{ maxWidth: '600px' }}>
        <div className="card" style={{ padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '3px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'pulse 2s ease-in-out infinite' }}>
            <CheckCircle size={40} color="var(--success)" />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Order Placed! 🎉</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '1.05rem' }}>
            Thank you, <strong>{user?.name?.split(' ')[0]}</strong>! Your order has been received.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '32px' }}>
            You'll receive a confirmation shortly. Track your order in My Orders.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', padding: '20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', marginBottom: '32px' }}>
            <div style={{ textAlign: 'center' }}>
              <Truck size={28} color="var(--accent)" style={{ marginBottom: '6px' }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Estimated Delivery</div>
              <div style={{ fontWeight: 700 }}>3–5 Business Days</div>
            </div>
            <div style={{ width: '1px', height: '48px', background: 'var(--border)' }} />
            <div style={{ textAlign: 'center' }}>
              <Package size={28} color="var(--accent)" style={{ marginBottom: '6px' }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Payment</div>
              <div style={{ fontWeight: 700 }}>{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/orders" className="btn btn-primary btn-lg">View My Orders</Link>
            <Link to="/products" className="btn btn-secondary btn-lg">Continue Shopping</Link>
            {placedOrder && (
              <button 
                className="btn btn-secondary btn-lg" 
                onClick={() => generateReceipt(placedOrder)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Download size={18} /> Download Receipt
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Step Indicator ────────────────────────────────────
  const StepBar = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '36px' }}>
      {STEPS.map((s, i) => {
        const done = step > s.id;
        const active = step === s.id;
        const Icon = s.icon;
        return (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', background: done ? 'var(--success)' : active ? 'var(--accent)' : 'var(--bg-secondary)', color: (done || active) ? '#fff' : 'var(--text-muted)', boxShadow: active ? '0 0 0 4px var(--accent-light)' : 'none' }}>
                {done ? <CheckCircle size={18} /> : <Icon size={18} />}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: active ? 700 : 400, color: active ? 'var(--accent)' : done ? 'var(--success)' : 'var(--text-muted)' }}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: '80px', height: '2px', background: step > s.id ? 'var(--success)' : 'var(--border)', margin: '0 4px', marginBottom: '22px', transition: 'background 0.3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="page container">
      <StepBar />

      <div className="cart-layout">
        {/* ── Left: Step Content ── */}
        <div>
          {/* STEP 1: Shipping */}
          {step === 1 && (
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><MapPin size={18} /></div>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Delivery Address</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input required className="form-input" placeholder="e.g. Sagar Patil" value={addr.fullName} onChange={e => updateAddr('fullName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input required className="form-input" placeholder="e.g. 9876543210" type="tel" maxLength={10} value={addr.phone} onChange={e => updateAddr('phone', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>Street / House No.</label>
                <input required className="form-input" placeholder="e.g. 12, MG Road, Flat 3B" value={addr.street} onChange={e => updateAddr('street', e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>City</label>
                  <input required className="form-input" placeholder="Mumbai" value={addr.city} onChange={e => updateAddr('city', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input required className="form-input" placeholder="Maharashtra" value={addr.state} onChange={e => updateAddr('state', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>PIN Code</label>
                  <input required className="form-input" placeholder="400001" maxLength={6} value={addr.pincode} onChange={e => updateAddr('pincode', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <select className="form-input" value={addr.country} onChange={e => updateAddr('country', e.target.value)}>
                    <option>India</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                  </select>
                </div>
              </div>

              <button className="btn btn-primary btn-lg" style={{ marginTop: '8px', width: '100%' }}
                onClick={() => {
                  const { fullName, phone, street, city, state, pincode } = addr;
                  if (!fullName || !phone || !street || !city || !state || !pincode) {
                    return toast.error('Please fill in all required fields');
                  }
                  if (phone.length < 10) return toast.error('Enter a valid 10-digit phone number');
                  setStep(2);
                }}>
                Continue to Payment <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === 2 && (
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><CreditCard size={18} /></div>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Payment Method</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  { value: 'cod', label: 'Cash on Delivery', sub: 'Pay when your order arrives', emoji: '💵', disabled: false },
                  { value: 'razorpay', label: 'Razorpay — UPI / Card / Net Banking', sub: 'Fast & Secure Online Payment', emoji: '💳', disabled: false },
                ].map(opt => (
                  <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', border: `2px solid ${paymentMethod === opt.value ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', background: paymentMethod === opt.value ? 'var(--accent-light)' : 'var(--bg-input)', cursor: opt.disabled ? 'not-allowed' : 'pointer', opacity: opt.disabled ? 0.55 : 1 }}>
                    <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => !opt.disabled && setPaymentMethod(opt.value)} disabled={opt.disabled} />
                    <div style={{ fontSize: '1.5rem' }}>{opt.emoji}</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{opt.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{opt.sub}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)}><ChevronLeft size={18} /> Back</button>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => setStep(3)}>
                  Review Order <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><ShoppingBag size={18} /></div>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Review & Confirm</h2>
              </div>

              {/* Address confirm */}
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>📦 Shipping To</span>
                  <button onClick={() => setStep(1)} style={{ fontSize: '0.8rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                </div>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                  <strong>{addr.fullName}</strong> &bull; {addr.phone}<br />
                  {addr.street}, {addr.city}, {addr.state} – {addr.pincode}<br />
                  {addr.country}
                </div>
              </div>

              {/* Payment confirm */}
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>💳 Payment</span>
                  <button onClick={() => setStep(2)} style={{ fontSize: '0.8rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Razorpay'}</div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Items ({cart.items.length})</h4>
                {cart.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} onError={e => { e.target.src = 'https://placehold.co/48x48/png'; }} />
                    <div style={{ flex: 1, fontSize: '0.9rem' }}>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      {item.size && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Size: {item.size}</span>}
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
                      <div style={{ fontWeight: 700 }}>{formatPrice(Number(item.price) * Number(item.quantity))}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>×{item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={() => setStep(2)}><ChevronLeft size={18} /> Back</button>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? '⏳ Placing Order...' : '✅ Place Order'} {!loading && <ArrowRight size={18} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Order Summary (sticky) ── */}
        <div className="cart-summary" style={{ height: 'fit-content', position: 'sticky', top: '100px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            <ShoppingBag size={20} color="var(--accent)" />
            <h3 style={{ margin: 0 }}>Order Summary</h3>
          </div>

          {cart?.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center' }}>
              <img src={item.image} alt={item.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} onError={e => { e.target.src = 'https://placehold.co/44x44/png'; }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, flexShrink: 0 }}>{formatPrice(Number(item.price) * Number(item.quantity))}</div>
            </div>
          ))}

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
            <div className="summary-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="summary-row"><span>GST (18%)</span><span>{formatPrice(taxPrice)}</span></div>
            {discountAmount > 0 && (
              <div className="summary-row"><span style={{ color: 'var(--success)' }}>Discount ({activeCoupon?.code})</span><span style={{ color: 'var(--success)' }}>-{formatPrice(discountAmount)}</span></div>
            )}
            <div className="summary-row"><span>Shipping</span><span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE 🎉</span></div>
            <div className="summary-row total"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>

          {!activeCoupon ? (
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter Voucher Code" 
                value={couponInput}
                onChange={e => setCouponInput(e.target.value.toUpperCase())}
                style={{ flex: 1, textTransform: 'uppercase' }}
              />
              <button type="submit" className="btn btn-secondary" disabled={loading || !couponInput}>Apply</button>
            </form>
          ) : (
            <div style={{ marginTop: '20px', padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(34,197,94,0.1)', border: '1px dashed var(--success)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 600 }}>
                <Tag size={16} /> {activeCoupon.code} Applied
              </div>
              <button onClick={() => { setActiveCoupon(null); setCouponInput(''); }} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Remove</button>
            </div>
          )}

          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(34,197,94,0.08)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600 }}>
            🛡️ 100% Secure Checkout &bull; Free Returns within 7 days
          </div>
        </div>
      </div>
    </div>
  );
}
