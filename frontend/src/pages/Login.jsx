import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, BarChart3, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import DataLensLogo from '../components/common/DataLensLogo';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const from = location?.state?.from?.pathname;
      const redirectTo = (from && from !== '/login' && from !== '/register') ? from : '/upload';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(email, password);
      if (response?.success) {
        return;
      }
      setError(response?.message || 'Invalid email or password');
    } catch (err) {
      setError(err.message || 'Unable to log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-layout">
        <aside className="auth-intro">
          <DataLensLogo iconSize={42} textStyle={{ fontSize: '1.5rem' }} />
          <div className="auth-intro-copy">
            <span className="auth-eyebrow"><ShieldCheck size={15} /> Data quality, with context</span>
            <h1>Turn messy data into confident decisions.</h1>
            <p>Investigate quality issues, understand their business impact, and move from raw files to clear action.</p>
          </div>
          <div className="auth-intro-metrics">
            <div><BarChart3 size={18} /><span>Quality signals<br /><strong>in one view</strong></span></div>
            <div><ShieldCheck size={18} /><span>Built for<br /><strong>data teams</strong></span></div>
          </div>
        </aside>

        <main className="auth-card">
          <div className="auth-card-heading">
            <span className="auth-card-kicker">Workspace access</span>
            <h2>Welcome back</h2>
            <p>Sign in to continue with DataLens.</p>
          </div>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="auth-field">
              <span>Email address</span>
              <div className="auth-input-wrap">
                <Mail size={17} aria-hidden="true" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" required />
              </div>
            </label>
            <label className="auth-field">
              <span>Password</span>
              <div className="auth-input-wrap">
                <LockKeyhole size={17} aria-hidden="true" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" required />
                <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <><span className="auth-spinner" aria-hidden="true" /> Signing in...</> : <>Sign in <ArrowRight size={17} /></>}
            </button>
          </form>

          <div className="auth-switch">
            Need an account? <Link to="/register">Create one <ArrowRight size={14} /></Link>
          </div>
        </main>
      </div>
    </div>
  );
};
