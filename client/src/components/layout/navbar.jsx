import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, Heart, Sun, Moon, LogOut, LayoutDashboard, User, Search, Bell } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useCartStore from '../../store/useCartStore';
import useThemeStore from '../../store/useThemeStore';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartCount = useCartStore((s) => s.getCartCount());
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">LUXORA</Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="navbar-search">
          <Search size={16} className="navbar-search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="navbar-search-input"
          />
        </form>

        <div className="navbar-links">
          <Link to="/products" className={isActive('/products')}>
            <ShoppingBag size={18} /> <span>Shop</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/cart" className={`cart-badge ${isActive('/cart')}`} style={{ marginRight: '8px' }}>
                <ShoppingCart size={18} />
                {cartCount > 0 && <span>{cartCount}</span>}
              </Link>

              {/* Notification Bell */}
              <button 
                title="Notifications"
                style={{ 
                  background: 'none', border: 'none', color: 'var(--text-secondary)', 
                  cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center',
                  marginRight: '8px'
                }}
              >
                <Bell size={18} />
                <span style={{
                  position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px',
                  background: 'var(--danger)', borderRadius: '50%', border: '2px solid var(--bg-primary)'
                }} />
              </button>

              {/* Profile Dropdown */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px 4px 4px', 
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius-full)', cursor: 'pointer'
                  }}
                >
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: 'white', fontWeight: 'bold', fontSize: '14px' 
                  }}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                </button>

                {isProfileOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 12px)', right: '0', width: '240px', 
                    background: 'var(--bg-card)', border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                    overflow: 'hidden', zIndex: 50
                  }}>
                    {/* Header */}
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', margin: 0 }}>{user?.name}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '4px 0 0' }}>{user?.email}</p>
                    </div>
                    
                    {/* Links */}
                    <div className="profile-dropdown-links" style={{ display: 'flex', flexDirection: 'column' }}>
                      {user?.role === 'admin' && (
                        <Link to="/admin" onClick={() => setIsProfileOpen(false)} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                          <LayoutDashboard size={16} /> Admin Dashboard
                        </Link>
                      )}
                      <Link to="/profile" onClick={() => setIsProfileOpen(false)} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
                        <User size={16} /> My Profile
                      </Link>
                      <Link to="/orders" onClick={() => setIsProfileOpen(false)} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
                        <ShoppingCart size={16} /> My Orders
                      </Link>
                      <Link to="/wishlist" onClick={() => setIsProfileOpen(false)} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                        <Heart size={16} /> Wishlist
                      </Link>
                      <button onClick={() => { logout(); setIsProfileOpen(false); }} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--danger)', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 500 }}>
                        <LogOut size={16} /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="btn btn-sm btn-primary">
              Login
            </Link>
          )}

          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

