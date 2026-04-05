import { Link } from 'react-router-dom';
import { Globe, MessageCircle, Play, Mail, MapPin, Phone } from 'lucide-react';

const FOOTER_LINKS = {
  Shop: [
    { label: "Men's Wear", to: '/products?category=Men' },
    { label: "Women's Wear", to: '/products?category=Women' },
    { label: 'Kids', to: '/products?category=Kids' },
    { label: 'Ethnic Wear', to: '/products?category=Ethnic' },
    { label: 'Footwear', to: '/products?category=Footwear' },
    { label: 'Accessories', to: '/products?category=Accessories' },
  ],
  Account: [
    { label: 'My Orders', to: '/orders' },
    { label: 'Wishlist', to: '/wishlist' },
    { label: 'Cart', to: '/cart' },
    { label: 'Login', to: '/login' },
    { label: 'Register', to: '/register' },
  ],
  Support: [
    { label: 'FAQ', to: '#' },
    { label: 'Shipping Policy', to: '#' },
    { label: 'Return Policy', to: '#' },
    { label: 'Privacy Policy', to: '#' },
    { label: 'Contact Us', to: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">LUXORA</Link>
            <p className="footer-tagline">
              Premium fashion for every occasion. Curated styles, unbeatable prices, delivered to your doorstep.
            </p>
            <div className="footer-social">
              <a href="#" className="social-btn" aria-label="Website"><Globe size={18} /></a>
              <a href="#" className="social-btn" aria-label="Social"><MessageCircle size={18} /></a>
              <a href="#" className="social-btn" aria-label="Video"><Play size={18} /></a>
              <a href="#" className="social-btn" aria-label="Email"><Mail size={18} /></a>
            </div>
            <div className="footer-contact">
              <div className="contact-item">
                <MapPin size={14} /> <span>Mumbai, Maharashtra, India</span>
              </div>
              <div className="contact-item">
                <Phone size={14} /> <span>+91 98765 43210</span>
              </div>
              <div className="contact-item">
                <Mail size={14} /> <span>support@luxora.com</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className="footer-col">
              <h4 className="footer-col-title">{category}</h4>
              <ul className="footer-links">
                {links.map(link => (
                  <li key={link.label}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Luxora Fashion. All rights reserved.</p>
          <div className="footer-bottom-badges">
            <span>🔒 Secure Checkout</span>
            <span>📦 Free Returns</span>
            <span>⭐ 4.8/5 Rating</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
