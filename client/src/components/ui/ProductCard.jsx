import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice, getDiscount } from '../../utils/formatters';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';
import OptimizedImage from '../common/OptimizedImage';
import useWishlistStore from '../../store/useWishlistStore';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500';

const ProductCard = memo(function ProductCard({ product }) {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const wishlisted = isInWishlist(product._id);
  const [addingToCart, setAddingToCart] = useState(false);
  const discount = getDiscount(product.mrp, product.price);
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast('Please login to save to wishlist', { icon: '🔐' });
      return navigate('/login');
    }
    
    try {
      const result = await toggleWishlist(product._id);
      if (result.isWishlisted) {
        toast.success('Saved to wishlist ❤️');
      } else {
        toast.success('Removed from wishlist');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const handleQuickCart = async (e) => {
    e.stopPropagation(); // Don't navigate to product detail
    if (!isAuthenticated) {
      toast('Please login to add to cart', { icon: '🔐' });
      return navigate('/login');
    }
    setAddingToCart(true);
    try {
      // Use first size/color by default for quick add
      await addToCart(product._id, 1, product.sizes?.[0] || '', product.colors?.[0]?.name || '');
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="card product-card" onClick={() => navigate(`/products/${product._id}`)}>
      {product.featured && <span className="badge-featured">Featured</span>}

      <div className="product-image-wrap">
        <OptimizedImage
          className="product-image"
          src={product.images?.[0]}
          fallbackSrc={FALLBACK_IMAGE}
          alt={product.name}
        />
        {/* Hover Overlay with Quick Actions */}
        <div className="product-overlay">
          <button
            className="quick-cart-btn"
            onClick={handleQuickCart}
            disabled={addingToCart || product.stock <= 0}
          >
            <ShoppingBag size={16} />
            {product.stock <= 0 ? 'Out of Stock' : addingToCart ? 'Adding...' : 'Quick Add'}
          </button>
        </div>
      </div>

      {/* Wishlist heart — always visible */}
      <button className={`wishlist-btn ${wishlisted ? 'active' : ''}`} onClick={handleWishlist}>
        <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
      </button>

      <div className="product-info">
        <div className="product-brand">{product.brand}</div>
        <div className="product-name">{product.name}</div>

        <div className="product-price">
          <span className="price-current">{formatPrice(product.price)}</span>
          <span className="price-mrp">{formatPrice(product.mrp)}</span>
          <span className="price-discount">{discount}% OFF</span>
        </div>

        {product.ratings?.count > 0 && (
          <div className="product-rating">
            <Star size={13} className="star" fill="currentColor" />
            <span>{product.ratings.average}</span>
            <span>({product.ratings.count})</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default ProductCard;
