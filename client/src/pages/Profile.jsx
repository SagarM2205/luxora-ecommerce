import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Heart, Lock, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

export default function Profile() {
  const { user, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
    else { setName(user.name); setEmail(user.email); }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/auth/profile', { name, email });
      await checkAuth(); // Refresh user data from server
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPassword(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page container">
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>{user.name}</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{user.email}</p>
          {user.role === 'admin' && (
            <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin</span>
          )}
        </div>
      </div>

      <div className="profile-layout">
        {/* ── Sidebar Tabs ── */}
        <div className="card" style={{ padding: '8px', position: 'sticky', top: '100px' }}>
          {[
            { id: 'profile', icon: <User size={16} />, label: 'Edit Profile' },
            { id: 'password', icon: <Lock size={16} />, label: 'Change Password' },
            { id: 'orders', icon: <ShoppingBag size={16} />, label: 'My Orders', href: '/orders' },
            { id: 'wishlist', icon: <Heart size={16} />, label: 'Wishlist', href: '/wishlist' },
          ].map(tab => (
            tab.href ? (
              <a key={tab.id} href={tab.href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2px' }}
                className="profile-tab-link">
                {tab.icon} {tab.label}
              </a>
            ) : (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: 'none', background: activeTab === tab.id ? 'var(--accent-light)' : 'transparent', color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: activeTab === tab.id ? 600 : 400, cursor: 'pointer', marginBottom: '2px', fontFamily: 'inherit', textAlign: 'left' }}>
                {tab.icon} {tab.label}
              </button>
            )
          ))}
        </div>

        {/* ── Main Content ── */}
        <div>
          {activeTab === 'profile' && (
            <div className="card" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={20} /> Edit Profile
              </h2>
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input className="form-input" required value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input className="form-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
                </div>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <AlertCircle size={16} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Changing your email will require you to log in again.
                  </p>
                </div>
                <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                  <Save size={16} /> {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="card" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Lock size={20} /> Change Password
              </h2>
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input className="form-input" type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input className="form-input" type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 6 characters" />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input className="form-input" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p style={{ color: 'var(--danger)', fontSize: '0.82rem', marginTop: '6px' }}>❌ Passwords don't match</p>
                  )}
                  {confirmPassword && newPassword === confirmPassword && (
                    <p style={{ color: 'var(--success)', fontSize: '0.82rem', marginTop: '6px' }}>✅ Passwords match</p>
                  )}
                </div>
                <button type="submit" className="btn btn-primary" disabled={savingPassword || newPassword !== confirmPassword}>
                  <Lock size={16} /> {savingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
