import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../components/ui/Toast';
import { API_URL } from '../lib/api';
import '../components/profile/Profile.css';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; icon: string; type?: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setName(parsed.name || '');
    }
  }, []);

  useEffect(() => {
    if (!showDeleteConfirm) {
      setDeleteCountdown(10);
      return;
    }
    if (deleteCountdown <= 0) return;
    const timer = setInterval(() => {
      setDeleteCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [showDeleteConfirm, deleteCountdown]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setToast({ message: 'Name cannot be empty', icon: '⚠️', type: 'error' });
      return;
    }
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name })
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setToast({ message: 'Profile updated', icon: '✅', type: 'success' });
    } catch {
      setToast({ message: 'Failed to update profile', icon: '❌', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setToast({ message: 'All fields are required', icon: '⚠️', type: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setToast({ message: 'Password must be at least 8 characters', icon: '⚠️', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ message: 'Passwords do not match', icon: '⚠️', type: 'error' });
      return;
    }
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setToast({ message: 'Password changed successfully', icon: '✅', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to change password', icon: '❌', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/account`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch {
      setToast({ message: 'Failed to delete account', icon: '❌', type: 'error' });
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <div className="profile-page">
      <h1 className="profile-title">Profile</h1>

      <div className="profile-avatar-section">
        <div className="profile-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{user?.name || 'User'}</h2>
          <p className="profile-email">{user?.email || ''}</p>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`profile-tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
          Edit Profile
        </button>
        <button className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
          Change Password
        </button>
      </div>

      {activeTab === 'info' && (
        <form className="profile-form" onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={user?.email || ''} disabled />
            <span className="form-hint">Email cannot be changed</span>
          </div>
          <button type="submit" className="btn-save-profile" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {activeTab === 'password' && (
        <form className="profile-form" onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <div className="form-input-wrapper">
              <input type={showCurrent ? 'text' : 'password'} className="form-input has-icon-right" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current password" />
              <button type="button" className="password-toggle" onClick={() => setShowCurrent(!showCurrent)}>
                {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="form-input-wrapper">
              <input type={showNew ? 'text' : 'password'} className="form-input has-icon-right" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" />
              <button type="button" className="password-toggle" onClick={() => setShowNew(!showNew)}>
                {showNew ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="form-input-wrapper">
              <input type={showConfirm ? 'text' : 'password'} className="form-input has-icon-right" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
              <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-save-profile" disabled={isSaving}>
            {isSaving ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}

      <button className="btn-logout" onClick={() => setShowLogoutConfirm(true)}>
        🚪 Logout
      </button>
      <button className="btn-delete-account" onClick={() => setShowDeleteConfirm(true)}>
        🗑️ Delete Account
      </button>

      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Logout</h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Are you sure you want to logout?
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="btn-save" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title" style={{ color: '#ef4444' }}>Delete Account</h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              This action is irreversible. All your data will be permanently deleted.
            </p>
            <div className="delete-countdown">
              <div className="countdown-circle">
                <span className="countdown-number">{deleteCountdown}</span>
              </div>
              <p className="countdown-text">
                {deleteCountdown > 0
                  ? `You can delete in ${deleteCountdown} second${deleteCountdown !== 1 ? 's' : ''}`
                  : 'You can now delete your account'}
              </p>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button
                className="btn-save"
                style={{ background: '#ef4444' }}
                onClick={handleDeleteAccount}
                disabled={deleteCountdown > 0 || isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} icon={toast.icon} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};