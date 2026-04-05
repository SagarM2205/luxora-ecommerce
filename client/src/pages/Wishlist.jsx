import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import useCartStore from '../store/useCartStore';
import { formatPrice } from '../utils/formatters';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore(s => s.addToCart);

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data.wishlist.items || []);
    } catch (err) {
      console.error('Failed to load wishlist', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist(wishlist.filter(item => item.product._id !== productId));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleMoveToCart = async (product) => {
    try {
      await addToCart(product._id, 1, product.sizes?.[0] || '', product.colors?.[0]?.name || '');
      await removeFromWishlist(product._id);
      toast.success('Moved to cart!');
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  if (wishlist.length === 0) {
    return (
      <div className="page container">
        <div className="empty-state">
          <Heart size={64} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <h2>Your wishlist is empty</h2>
          <p>Save items you love here and buy them later.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '24px' }}>
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page container">
      <h1 style={{ marginBottom: '32px' }}>My Wishlist ({wishlist.length})</h1>

      <div className="product-grid">
        {wishlist.map((item) => (
          <div key={item.product._id} className="card product-card" style={{ position: 'relative' }}>
            <img 
              className="product-image" 
              src={item.product.images?.[0] || 'https://placehold.co/500x500/png'} 
              alt={item.product.name} 
              style={{ paddingBottom: '0' }}
            />
            
            <button 
              className="wishlist-btn active" 
              onClick={() => removeFromWishlist(item.product._id)}
              style={{ zIndex: 10 }}
              title="Remove from wishlist"
            >
              <Trash2 size={16} />
            </button>

            <div className="product-info">
              <div className="product-brand">{item.product.brand}</div>
              <Link to={`/products/${item.product._id}`} className="product-name" style={{ display: 'block', marginBottom: '8px' }}>
                {item.product.name}
              </Link>

              <div className="product-price" style={{ marginBottom: '16px' }}>
                <span className="price-current">{formatPrice(item.product.price)}</span>
                <span className="price-mrp">{formatPrice(item.product.mrp)}</span>
              </div>

              <button 
                className="btn btn-primary btn-full btn-sm"
                onClick={() => handleMoveToCart(item.product)}
                disabled={item.product.stock <= 0}
              >
                <ShoppingBag size={16} /> {item.product.stock > 0 ? 'Move to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
