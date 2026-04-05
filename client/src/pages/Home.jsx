import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Truck, HeadphonesIcon, RefreshCw, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import ProductCard from '../components/ui/ProductCard';

const HERO_SLIDES = [
  {
    title: 'Summer\nCollection',
    subtitle: 'Up to 50% off on trending styles. Shop the season\'s hottest looks.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&auto=format&fit=crop',
    link: '/products?category=Women',
    tag: 'New Arrivals'
  },
  {
    title: "Men's\nEssentials",
    subtitle: 'Classic styles crafted for the modern man. Timeless, effortless.',
    image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1400&auto=format&fit=crop',
    link: '/products?category=Men',
    tag: 'Men\'s Edit'
  },
  {
    title: 'Ethnic\nWear',
    subtitle: 'Celebrate traditions in style. Curated collections for every occasion.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1400&auto=format&fit=crop',
    link: '/products?category=Ethnic',
    tag: 'Festive Season'
  }
];

const TRUST_BADGES = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders over ₹2,000' },
  { icon: ShieldCheck, title: 'Secure Payments', desc: '100% safe & encrypted' },
  { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Always here to help' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '30-day hassle-free returns' },
];

const CATEGORIES = [
  { name: 'Men', emoji: '👔', bg: '#1e293b' },
  { name: 'Women', emoji: '👗', bg: '#2d1b3d' },
  { name: 'Kids', emoji: '🧒', bg: '#1a2e1a' },
  { name: 'Footwear', emoji: '👟', bg: '#1a1a2e' },
  { name: 'Ethnic', emoji: '🪷', bg: '#2d1a22' },
  { name: 'Accessories', emoji: '⌚', bg: '#1a2a2a' },
];

const MARQUEE_ITEMS = [
  '✨ FREE SHIPPING ON ORDERS OVER ₹2000',
  '🎉 NEW ARRIVALS EVERY WEEK',
  '🛍️ EASY 30-DAY RETURNS',
  '💎 PREMIUM AUTHENTIC BRANDS',
  '⚡ USE CODE LUXORA10 FOR 10% OFF',
  '🌟 OVER 10,000 HAPPY CUSTOMERS',
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/products?featured=true&limit=8');
        setFeatured(data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('🎉 You\'re subscribed! Check your inbox for your 10% discount code.');
    setEmail('');
  };

  return (
    <div>
      {/* ── ANNOUNCEMENT MARQUEE ── */}
      <div className="marquee-strip">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="marquee-item">{item}</span>
          ))}
        </div>
      </div>

      {/* ── HERO CAROUSEL ── */}
      <section className="hero-carousel">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%), url(${slide.image})` }}
          >
            <div className="hero-slide-content">
              <span className="hero-tag">{slide.tag}</span>
              <h1 style={{ whiteSpace: 'pre-line' }}>{slide.title}</h1>
              <p>{slide.subtitle}</p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link to={slide.link} className="btn btn-primary btn-lg">
                  Shop Now <ArrowRight size={20} />
                </Link>
                <Link to="/products" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}>
                  Explore All
                </Link>
              </div>
            </div>
          </div>
        ))}

        <button className="carousel-btn carousel-prev" onClick={prevSlide}><ChevronLeft size={24} /></button>
        <button className="carousel-btn carousel-next" onClick={nextSlide}><ChevronRight size={24} /></button>

        <div className="carousel-dots">
          {HERO_SLIDES.map((_, index) => (
            <button key={index} className={`carousel-dot ${index === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(index)} />
          ))}
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="trust-strip">
        <div className="container">
          <div className="trust-grid">
            {TRUST_BADGES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="trust-item">
                <Icon size={28} className="trust-icon" />
                <div>
                  <div className="trust-title">{title}</div>
                  <div className="trust-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">Explore</p>
              <h2>Shop by Category</h2>
            </div>
            <Link to="/products" className="btn btn-outline btn-sm">View All <ArrowRight size={14} /></Link>
          </div>
          <div className="category-grid">
            {CATEGORIES.map((cat) => (
              <Link key={cat.name} to={`/products?category=${cat.name}`} className="category-card" style={{ '--cat-bg': cat.bg }}>
                <div className="category-emoji">{cat.emoji}</div>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENTO COLLECTIONS GRID ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">Curated</p>
              <h2>Collections</h2>
            </div>
          </div>
          <div className="bento-grid">
            <Link to="/products?category=Women" className="bento-card bento-large" style={{ backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%), url(https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format)' }}>
              <div className="bento-label">
                <span className="bento-eyebrow">This Season</span>
                <h3>Women's Edit</h3>
                <span className="bento-cta">Shop Now →</span>
              </div>
            </Link>
            <Link to="/products?category=Men" className="bento-card bento-small" style={{ backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%), url(https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=600&auto=format)' }}>
              <div className="bento-label">
                <span className="bento-eyebrow">Essentials</span>
                <h3>Men's Wear</h3>
                <span className="bento-cta">Shop Now →</span>
              </div>
            </Link>
            <Link to="/products?category=Footwear" className="bento-card bento-small" style={{ backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%), url(https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format)' }}>
              <div className="bento-label">
                <span className="bento-eyebrow">Step Up</span>
                <h3>Footwear</h3>
                <span className="bento-cta">Shop Now →</span>
              </div>
            </Link>
            <Link to="/products?category=Ethnic" className="bento-card bento-medium" style={{ backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%), url(https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format)' }}>
              <div className="bento-label">
                <span className="bento-eyebrow">Festive Special</span>
                <h3>Ethnic Wear</h3>
                <span className="bento-cta">Shop Now →</span>
              </div>
            </Link>
            <Link to="/products?category=Accessories" className="bento-card bento-medium" style={{ backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%), url(https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=700&auto=format)' }}>
              <div className="bento-label">
                <span className="bento-eyebrow">Complete Your Look</span>
                <h3>Accessories</h3>
                <span className="bento-cta">Shop Now →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">Handpicked</p>
              <h2>Featured Products</h2>
            </div>
            <Link to="/products" className="btn btn-outline btn-sm">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="loader"><div className="spinner"></div></div>
          ) : (
            <div className="product-grid">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-inner">
            <div className="newsletter-text">
              <ShoppingBag size={40} className="newsletter-icon" />
              <h2>Join the Luxora Family</h2>
              <p>Subscribe to our newsletter and get <strong>10% off</strong> your first order. New arrivals, exclusive offers, and style inspiration — all in your inbox.</p>
            </div>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary btn-lg">
                Subscribe & Save 10%
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
