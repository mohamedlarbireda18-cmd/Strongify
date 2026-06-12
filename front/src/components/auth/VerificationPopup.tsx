import React, { useState, useRef, useEffect } from 'react';
import './VerificationPopup.css';
import { API_URL } from '../../lib/api';
import emailjs from '@emailjs/browser';

interface VerificationPopupProps {
  userId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const VerificationPopup: React.FC<VerificationPopupProps> = ({ userId, onSuccess, onClose }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes en secondes
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Timer principal (expiration du code)
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Cooldown entre deux renvois (30 secondes)
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (index === 5 && value) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    pasted.split('').forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });
    setCode(newCode);
    if (pasted.length === 6) {
      handleVerify(pasted);
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const finalCode = codeToVerify || code.join('');
    if (finalCode.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: finalCode })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage('Account verified! Redirecting...');
      setTimeout(() => onSuccess(), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    // Vérifier que le code a expiré
    if (!canResend) {
      setError(`Please wait until the current code expires (${formatTime(timeLeft)} remaining).`);
      return;
    }

    // Vérifier le cooldown
    if (resendCooldown > 0) {
      setError(`Please wait ${resendCooldown}s before requesting a new code.`);
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/auth/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Envoyer le nouveau code par email
      if (data.code) {
        try {
          await emailjs.send(
            'service_8h8pmb9',
            'template_2z8e81r',
            {
              to_email: '',
              to_name: '',
              verification_code: data.code
            },
            'WHXPcURFYkh-_gGUi'
          );
        } catch (e) {
          console.error('EmailJS error:', e);
        }
      }

      // Réinitialiser les états
      setTimeLeft(900);
      setCanResend(false);
      setResendCooldown(30); // 30 secondes de cooldown avant de pouvoir renvoyer
      setCode(['', '', '', '', '', '']);
      setMessage('✅ A new code has been sent to your email.');
      
      setTimeout(() => setMessage(''), 4000);
      inputRefs.current[0]?.focus();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>×</button>
        
        <div className="popup-icon">📧</div>
        <h2 className="popup-title">Verify Your Email</h2>
        <p className="popup-subtitle">
          We sent a 6-digit code to your email address
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

        <div className="popup-code-inputs">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="popup-code-digit"
              disabled={isLoading}
            />
          ))}
        </div>

        {/* Timer */}
        <div className={`popup-timer ${timeLeft <= 60 ? 'expiring' : ''}`}>
          {timeLeft > 0 ? (
            <>Code expires in <strong>{formatTime(timeLeft)}</strong></>
          ) : (
            <span className="expired">Code expired — You can request a new one</span>
          )}
        </div>

        {/* Bouton Resend */}
        <button
          className={`popup-resend ${!canResend ? 'disabled' : ''}`}
          onClick={handleResendCode}
          disabled={isLoading || (!canResend && timeLeft > 0) || resendCooldown > 0}
        >
          {resendCooldown > 0 
            ? `Resend available in ${resendCooldown}s` 
            : !canResend 
              ? 'Resend code (wait for expiration)' 
              : 'Resend code'
          }
        </button>

        <button
          className="popup-verify-btn"
          onClick={() => handleVerify()}
          disabled={isLoading || code.join('').length !== 6}
        >
          {isLoading ? (
            <><span className="spinner" /> Verifying...</>
          ) : (
            'Verify Account'
          )}
        </button>
      </div>
    </div>
  );
};