import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [fd, setFd] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [focused, setFocused] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setFd(p => ({ ...p, [name]: name === 'email' ? value.trim().toLowerCase() : value.trim() }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (!fd.email || !fd.password) { setError('Please fill in all fields'); return; }
      await login(fd.email, fd.password);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-root">
      <div className="auth-split">
        {/* Left */}
        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-brand-icon"><IcoWave /></div>
            <span className="auth-brand-name">SmartLoan</span>
          </div>
          <div className="auth-left-body">
            <h1 className="auth-left-heading">Analyze debt.<br />Reduce stress.<br />Take control.</h1>
            <p className="auth-left-sub">AI-powered financial insights to track loans, monitor debt health, and plan a smarter future.</p>
            <div className="auth-features">
              {[['Real-time Debt Health Score', <IcoChart />], ['AI Financial Assistant', <IcoBot />], ['Loan Simulation Engine', <IcoSim />], ['Stress Trend Analysis', <IcoTrend />]].map(([label, icon], i) => (
                <div className="auth-feature-item" key={i}>
                  <span className="auth-feature-icon">{icon}</span>
                  <span className="auth-feature-label">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="auth-left-footer">Trusted by thousands of smart borrowers.</p>
        </div>

        {/* Right */}
        <div className="auth-right">
          <div className="auth-glass-card">
            <div className="auth-card-top-bar" />
            <div className="auth-card-header">
              <div className="auth-card-icon"><IcoLogin /></div>
              <div>
                <h2 className="auth-card-title">Welcome back</h2>
                <p className="auth-card-sub">Sign in to your account</p>
              </div>
            </div>

            {error   && <div className="alert alert--error"><IcoAlert /> <span>{error}</span></div>}
            {success && <div className="alert alert--success"><IcoCheck /> <span>{success}</span></div>}

            <form onSubmit={onSubmit} className="auth-form">
              <div>
                <label htmlFor="email" className="auth-label">Email address</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><IcoMail active={focused === 'email'} /></span>
                  <input id="email" name="email" type="email" value={fd.email} onChange={onChange} placeholder="you@example.com" autoComplete="email"
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    className={`auth-input${focused === 'email' ? ' auth-input--focused' : ''}`} />
                </div>
              </div>

              <div>
                <div className="auth-password-label-row">
                  <label htmlFor="password" className="auth-label">Password</label>
                  <Link to="#" className="auth-forgot">Forgot password?</Link>
                </div>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><IcoLock active={focused === 'password'} /></span>
                  <input id="password" name="password" type={showPw ? 'text' : 'password'} value={fd.password} onChange={onChange} placeholder="••••••••" autoComplete="current-password"
                    onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                    className={`auth-input${focused === 'password' ? ' auth-input--focused' : ''}`} />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowPw(p => !p)}>{showPw ? <IcoEyeOff /> : <IcoEye />}</button>
                </div>
              </div>

              <label className="auth-remember"><input type="checkbox" className="auth-checkbox" /> Remember me</label>

              <button type="submit" disabled={loading} className="auth-submit-btn">
                {loading ? <svg className="auth-spinner" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" /><path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : 'Sign In'}
              </button>
            </form>

            <div className="auth-divider"><div className="auth-divider-line" /><span className="auth-divider-text">or</span><div className="auth-divider-line" /></div>
            <p className="auth-switch">Don't have an account? <Link to="/auth/register" className="auth-switch-link">Create one</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

const IcoWave  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const IcoChart = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoBot   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V7"/><circle cx="12" cy="5" r="2"/></svg>;
const IcoSim   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IcoTrend = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IcoLogin = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;
const IcoMail  = ({ active }) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={active ? '#22c55e' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IcoLock  = ({ active }) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={active ? '#22c55e' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IcoEye   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoEyeOff= () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IcoAlert = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IcoCheck = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

export default Login;
