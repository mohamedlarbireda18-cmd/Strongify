import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from '../../lib/api';
import emailjs from '@emailjs/browser';
import './VerificationPopup.css';

interface ForgotPasswordPopupProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ForgotPasswordPopup: React.FC<ForgotPasswordPopupProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [resetCode, setResetCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'code') inputRefs.current[0]?.focus();
  }, [step]);

  useEffect(() => {
    if (timeLeft <= 0 || step !== 'code') return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Étape 1 : Envoyer l'email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email.'); return; }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Envoyer l'email avec EmailJS
      if (data.code) {
        try {
          await emailjs.send(
            'service_vy2q0du',
            'template_75tw2ik',
            {
              to_email: email,
              to_name: email,
              reset_code: data.code
            },
            '3lWPgda2SdWyT68dr'
          );
        } catch (e) {
          console.error('EmailJS error:', e);
        }
      }

      setUserId(data.userId);
      setStep('code');
      setMessage('A reset code has been sent to your email.');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Étape 2 : Vérifier le code
  const handleVerifyCode = async (codeToVerify?: string) => {
    const finalCode = codeToVerify || resetCode.join('');
    if (finalCode.length !== 6) { setError('Please enter the complete code.'); return; }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: finalCode })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setStep('password');
      setMessage('');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Étape 3 : Réinitialiser le mot de passe
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          code: resetCode.join(''),
          newPassword
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setMessage('Password reset successfully!');
      setTimeout(() => onSuccess(), 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion du code
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...resetCode];
    newCode[index] = value;
    setResetCode(newCode);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (index === 5 && value) handleVerifyCode(newCode.join(''));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !resetCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>×</button>

        <div className="popup-icon">
          {step === 'email' ? '🔑' : step === 'code' ? '📧' : '🔒'}
        </div>
        <h2 className="popup-title">
          {step === 'email' ? 'Forgot Password' : step === 'code' ? 'Enter Reset Code' : 'New Password'}
        </h2>
        <p className="popup-subtitle">
          {step === 'email' && 'Enter your email to receive a reset code'}
          {step === 'code' && 'We sent a 6-digit code to your email'}
          {step === 'password' && 'Create your new password'}
        </p>

        {error && (
          <div className="popup-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="popup-success">
            <span>{message}</span>
          </div>
        )}

        {/* Étape 1 : Email */}
        {step === 'email' && (
          <form onSubmit={handleSendEmail}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <input
                type="email"
                className="form-input"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>
            <button type="submit" className="popup-verify-btn" disabled={isLoading}>
              {isLoading ? <><span className="spinner" />Sending...</> : 'Send Reset Code'}
            </button>
          </form>
        )}

        {/* Étape 2 : Code */}
        {step === 'code' && (
          <>
            <div className="popup-code-inputs">
              {resetCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="popup-code-digit"
                  disabled={isLoading}
                />
              ))}
            </div>
            <div className="popup-timer">
              {timeLeft > 0 ? (
                <>Code expires in <strong>{formatTime(timeLeft)}</strong></>
              ) : (
                <span className="expired">Code expired</span>
              )}
            </div>
            <button
              className="popup-verify-btn"
              onClick={() => handleVerifyCode()}
              disabled={isLoading || resetCode.join('').length !== 6}
            >
              {isLoading ? <><span className="spinner" />Verifying...</> : 'Verify Code'}
            </button>
          </>
        )}

        {/* Étape 3 : Nouveau mot de passe */}
        {step === 'password' && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <div className="form-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input has-icon-right"
                  placeholder="New password (min. 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <input
                type="password"
                className="form-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="popup-verify-btn" disabled={isLoading}>
              {isLoading ? <><span className="spinner" />Resetting...</> : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};