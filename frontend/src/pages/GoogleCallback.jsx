import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import { setStoredToken } from '../auth/authService';
import DataLensLogo from '../components/common/DataLensLogo';

export const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const fragmentParams = new URLSearchParams(window.location.hash.slice(1));
    const token = fragmentParams.get('token');
    const error = queryParams.get('error') || fragmentParams.get('error');

    if (token) {
      setStoredToken(token);
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate('/upload', { replace: true });
      return;
    }

    if (error) {
      navigate('/login', { replace: true, state: { error } });
      return;
    }

    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div className="auth-shell auth-callback-shell">
      <div className="auth-callback-card">
        <DataLensLogo iconSize={42} textStyle={{ fontSize: '1.5rem' }} />
        <div className="auth-callback-icon"><LoaderCircle size={26} /></div>
        <span className="auth-card-kicker"><ShieldCheck size={14} /> Secure sign-in</span>
        <h1>Completing Google sign-in</h1>
        <p>Verifying your account and preparing your DataLens workspace.</p>
      </div>
    </div>
  );
};
