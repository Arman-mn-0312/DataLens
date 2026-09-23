import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import DataLensLogo from '../components/common/DataLensLogo';

export const Register = () => {
  const navigate = useNavigate();
  const { register, googleLogin, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [visiblePasswords, setVisiblePasswords] = useState({ password: false, confirmPassword: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/upload', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await register(form.name, form.email, form.password);
      if (response?.success) {
        return;
      }
      setError(response?.message || 'Unable to create account.');
    } catch (err) {
      setError(err.message || 'Unable to create account.');
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
            <span className="auth-eyebrow"><ShieldCheck size={15} /> A clearer view of quality</span>
            <h1>Make every dataset easier to trust.</h1>
            <p>Bring your investigation workflow into one focused workspace for faster, more informed decisions.</p>
          </div>
          <div className="auth-intro-metrics">
            <div><BarChart3 size={18} /><span>Find the signal<br /><strong>behind the numbers</strong></span></div>
            <div><ShieldCheck size={18} /><span>Ready for your<br /><strong>next dataset</strong></span></div>
          </div>
        </aside>

        <main className="auth-card">
          <div className="auth-card-heading">
            <span className="auth-card-kicker">New workspace</span>
            <h2>Create your account</h2>
            <p>Start analyzing your data with DataLens.</p>
          </div>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="auth-field">
              <span>Full name</span>
              <div className="auth-input-wrap">
                <UserRound size={17} aria-hidden="true" />
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" autoComplete="name" required />
              </div>
            </label>
            <label className="auth-field">
              <span>Email address</span>
              <div className="auth-input-wrap">
                <Mail size={17} aria-hidden="true" />
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" autoComplete="email" required />
              </div>
            </label>
            <label className="auth-field">
              <span>Password</span>
              <div className="auth-input-wrap">
                <LockKeyhole size={17} aria-hidden="true" />
                <input type={visiblePasswords.password ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="At least 8 characters" autoComplete="new-password" required />
                <button type="button" className="auth-password-toggle" onClick={() => setVisiblePasswords((current) => ({ ...current, password: !current.password }))} aria-label={visiblePasswords.password ? 'Hide password' : 'Show password'}>
                  {visiblePasswords.password ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
            <label className="auth-field">
              <span>Confirm password</span>
              <div className="auth-input-wrap">
                <LockKeyhole size={17} aria-hidden="true" />
                <input type={visiblePasswords.confirmPassword ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat your password" autoComplete="new-password" required />
                <button type="button" className="auth-password-toggle" onClick={() => setVisiblePasswords((current) => ({ ...current, confirmPassword: !current.confirmPassword }))} aria-label={visiblePasswords.confirmPassword ? 'Hide password' : 'Show password'}>
                  {visiblePasswords.confirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <><span className="auth-spinner" aria-hidden="true" /> Creating account...</> : <>Create account <ArrowRight size={17} /></>}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account? <Link to="/login">Sign in <ArrowRight size={14} /></Link>
          </div>
        </main>
      </div>
    </div>
  );
};
