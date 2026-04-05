import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Minus, Plus, Trash2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { formatPrice, getDiscount } from '../utils/formatters';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import OptimizedImage from '../components/common/OptimizedImage';

// ──────────────────────────────────────────────
// Star Rating Input Component
// ──────────────────────────────────────────────
function StarInput({ rating, setRating }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '4px', cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          size={28}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => setRating(star)}
          fill={(hovered || rating) >= star ? 'var(--warning)' : 'none'}
          color={(hovered || rating) >= star ? 'var(--warning)' : 'var(--border)'}
          style={{ transition: 'all 0.15s ease' }}
        />
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// Single Review Row
// ──────────────────────────────────────────────
function ReviewCard({ review, currentUserId, isAdmin, onDelete }) {
  const canDelete = currentUserId === review.user?._id || isAdmin;

  return (
    <div className="review-card">
      <div className="review-header">
        <div>
          <div className="review-author">{review.user?.name || 'Anonymous'}</div>
          <div className="review-date">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="review-stars">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={14} fill={review.rating >= s ? 'var(--warning)' : 'none'} color={review.rating >= s ? 'var(--warning)' : 'var(--border)'} />
            ))}
          </div>
          {canDelete && (
            <button className="btn btn-sm" style={{ color: 'var(--danger)', background: 'none', border: 'none', padding: '4px' }} onClick={() => onDelete(review._id)}>
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
      <div className="review-title">{review.title}</div>
      <div className="review-body">{review.body}</div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Product Detail Page
// ──────────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const addToCart = useCartStore(s => s.addToCart);
  const { isAuthenticated, user } = useAuthStore();

  // Check if this product is already wishlisted
  useEffect(() => {
    if (!isAuthenticated) return;
    const checkWishlist = async () => {
      try {
        const { data } = await api.get('/wishlist');
        const items = data.wishlist?.items || [];
        setWishlisted(items.some(item => item.product._id === id || item.product === id));
      } catch (err) { /* silent */ }
    };
    checkWishlist();
  }, [id, isAuthenticated]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
        if (data.product.sizes?.length > 0) setSelectedSize(data.product.sizes[0]);
        if (data.product.colors?.length > 0) setSelectedColor(data.product.colors[0].name);
      } catch (err) {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get(`/products/${id}/reviews`);
        setReviews(data.reviews);
      } catch (err) {
        console.error('Failed to load reviews', err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast('Please login to add items to cart', { icon: '🔐' });
      return navigate('/login');
    }
    try {
      await addToCart(product._id, quantity, selectedSize, selectedColor);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast('Please login to save items', { icon: '🔐' });
      return navigate('/login');
    }
    setWishlistLoading(true);
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${product._id}`);
        setWishlisted(false);
        toast('Removed from wishlist', { icon: '💔' });
      } else {
        await api.post('/wishlist', { productId: product._id });
        setWishlisted(true);
        toast.success('Added to wishlist! ❤️');
      }
    } catch (err) {
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast('Please login to write a review', { icon: '🔐' });
      return navigate('/login');
    }
    if (reviewRating === 0) return toast.error('Please select a star rating');

    setSubmitting(true);
    try {
      const { data } = await api.post(`/products/${id}/reviews`, { rating: reviewRating, title: reviewTitle, body: reviewBody });
      setReviews([data.review, ...reviews]);
      // update displayed average
      setProduct(prev => ({
        ...prev,
        ratings: {
          average: Math.round(((prev.ratings.average * prev.ratings.count) + reviewRating) / (prev.ratings.count + 1) * 10) / 10,
          count: prev.ratings.count + 1
        }
      }));
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewTitle('');
      setReviewBody('');
      toast.success('Review submitted! ⭐');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/products/${id}/reviews/${reviewId}`);
      setReviews(reviews.filter(r => r._id !== reviewId));
      toast.success('Review deleted');
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;
  if (!product) return <div className="empty-state"><h2>Product not found</h2></div>;

  const avgRating = product.ratings?.average || 0;
  const ratingCount = product.ratings?.count || 0;

  return (
    <div className="page container">
      {/* ── Product Info Layout ── */}
      <div className="product-detail-layout">
        {/* Image */}
        <div className="product-gallery">
          <OptimizedImage
            src={product.images[0]}
            alt={product.name}
            loading="eager"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Thumbnail strip if multiple images */}
          {product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {product.images.slice(0, 4).map((img, i) => (
                <OptimizedImage 
                  key={i} 
                  src={img} 
                  alt="" 
                  style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', opacity: 0.7, cursor: 'pointer' }} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="product-info">
          <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>{product.brand}</div>
          <h1 style={{ fontSize: '2.2rem', lineHeight: 1.2, marginBottom: '16px' }}>{product.name}</h1>

          {/* Rating summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={16} fill={avgRating >= s ? 'var(--warning)' : 'none'} color={avgRating >= s ? 'var(--warning)' : 'var(--border)'} />
              ))}
            </div>
            <span style={{ fontWeight: 700 }}>{avgRating}</span>
            <span style={{ color: 'var(--text-secondary)' }}>({ratingCount} {ratingCount === 1 ? 'review' : 'reviews'})</span>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800 }}>{formatPrice(product.price)}</span>
            <span style={{ fontSize: '1.2rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>{formatPrice(product.mrp)}</span>
            <span style={{ color: 'var(--success)', fontWeight: 700, padding: '4px 10px', background: 'rgba(34,197,94,0.1)', borderRadius: 'var(--radius-full)' }}>
              {getDiscount(product.mrp, product.price)}% OFF
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '28px', lineHeight: 1.6 }}>{product.description}</p>

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '12px' }}>Select Size</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {product.sizes.map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)} style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: `1px solid ${selectedSize === size ? 'var(--accent)' : 'var(--border)'}`, background: selectedSize === size ? 'var(--accent-light)' : 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '12px' }}>Color: <span style={{ color: 'var(--accent)' }}>{selectedColor}</span></label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {product.colors.map(c => (
                  <button key={c.name} title={c.name} onClick={() => setSelectedColor(c.name)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: c.hex || '#ddd', border: selectedColor === c.name ? '3px solid var(--accent)' : '2px solid var(--border)', cursor: 'pointer', outline: selectedColor === c.name ? '2px solid var(--accent-light)' : 'none' }} />
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div style={{ marginBottom: '36px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '12px' }}>Quantity</label>
            <div className="quantity-control">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: '40px', height: '40px' }}><Minus size={18} /></button>
              <span style={{ width: '40px', fontSize: '1.1rem' }}>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} style={{ width: '40px', height: '40px' }}><Plus size={18} /></button>
            </div>
            {product.stock < 10 && product.stock > 0 && <p style={{ fontSize: '0.85rem', color: 'var(--warning)', marginTop: '8px' }}>⚠️ Only {product.stock} left in stock!</p>}
            {product.stock <= 0 && <p style={{ fontSize: '0.85rem', color: 'var(--danger)', marginTop: '8px' }}>❌ Out of stock</p>}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={handleAddToCart} className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={product.stock <= 0}>
              <ShoppingBag size={20} /> {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button
              className={`btn btn-lg ${wishlisted ? 'btn-danger' : 'btn-secondary'}`}
              style={{ padding: '0 24px', transition: 'all 0.2s ease' }}
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      {/* ── REVIEWS SECTION ── */}
      <div className="reviews-section">
        <div className="reviews-header">
          <div>
            <h2 className="reviews-title">
              <MessageSquare size={24} /> Customer Reviews
              {ratingCount > 0 && <span className="reviews-count">{ratingCount}</span>}
            </h2>
            {ratingCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{avgRating}</div>
                <div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={20} fill={avgRating >= s ? 'var(--warning)' : 'none'} color={avgRating >= s ? 'var(--warning)' : 'var(--border)'} />
                    ))}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>out of 5 stars</div>
                </div>
              </div>
            )}
          </div>
          <button className="btn btn-primary" onClick={() => { if (!isAuthenticated) { toast('Login to write a review', { icon: '🔐' }); return navigate('/login'); } setShowReviewForm(!showReviewForm); }}>
            {showReviewForm ? 'Cancel' : '✍️ Write a Review'}
          </button>
        </div>

        {/* Write Review Form */}
        {showReviewForm && (
          <form className="review-form" onSubmit={handleSubmitReview}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Your Review</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Rating</label>
              <StarInput rating={reviewRating} setRating={setReviewRating} />
            </div>
            <div className="form-group">
              <label>Review Title</label>
              <input required className="form-input" placeholder="e.g. Great quality and fast delivery!" value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} maxLength={100} />
            </div>
            <div className="form-group">
              <label>Your Experience</label>
              <textarea required className="form-input" rows="4" placeholder="Share your experience with other shoppers..." value={reviewBody} onChange={e => setReviewBody(e.target.value)} maxLength={1000} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        {reviewsLoading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : reviews.length === 0 ? (
          <div className="reviews-empty">
            <Star size={40} style={{ opacity: 0.3 }} />
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map(review => (
              <ReviewCard
                key={review._id}
                review={review}
                currentUserId={user?._id}
                isAdmin={user?.role === 'admin'}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
