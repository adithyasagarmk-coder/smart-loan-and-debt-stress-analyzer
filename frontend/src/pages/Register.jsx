import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [fd, setFd] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [pwStr, setPwStr] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [focused, setFocused] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const calcStr = (p) => {
    let s = 0;
    if (p.length >= 6) s++; if (p.length >= 10) s++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++; if (/[^a-zA-Z\d]/.test(p)) s++;
    return s;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    const v = name === 'email' ? value.trim().toLowerCase() : value.trim();
    setFd(p => ({ ...p, [name]: v }));
    if (name === 'password') setPwStr(calcStr(v));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const { name, email, password, confirmPassword } = fd;
      if (!name || !email || !password || !confirmPassword) { setError('Please fill in all fields'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
      await register(name, email, password);
      setSuccess('Account created! Redirecting...');
      setTimeout(() => navigate('/auth/login'), 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const strMeta = [
    { label: 'Very weak', color: '#ef4444' }, { label: 'Weak', color: '#f97316' },
    { label: 'Fair', color: '#eab308' },      { label: 'Good', color: '#22c55e' },
    { label: 'Strong', color: '#10b981' },
  ];
  const sm = pwStr > 0 ? strMeta[pwStr - 1] : null;
  const pwMatch    = fd.confirmPassword && fd.password === fd.confirmPassword;
  const pwMismatch = fd.confirmPassword && fd.password !== fd.confirmPassword;

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
            <h1 className="auth-left-heading">Start your financial journey.</h1>
            <p className="auth-left-sub">Join thousands of users who manage debt smarter, understand their financial health, and reach their goals faster.</p>
            <div className="auth-steps">
              {[['01','Create your account','Takes less than a minute'],['02','Set up your profile','Income, expenses & loans'],['03','Get AI insights','Personalised advice instantly']].map(([n,t,d],i)=>(
                <div className="auth-step-item" key={i}>
                  <div className="auth-step-num">{n}</div>
                  <div><div className="auth-step-title">{t}</div><div className="auth-step-desc">{d}</div></div>
                </div>
              ))}
            </div>
          </div>
          <p className="auth-left-footer">Your data is encrypted and never shared.</p>
        </div>

        {/* Right */}
        <div className="auth-right">
          <div className="auth-glass-card">
            <div className="auth-card-top-bar" />
            <div className="auth-card-header">
              <div className="auth-card-icon"><IcoUserPlus /></div>
              <div>
                <h2 className="auth-card-title">Create account</h2>
                <p className="auth-card-sub">Join Smart Loan Analyzer today</p>
              </div>
            </div>

            {error   && <div className="alert alert--error"><IcoAlert /> <span>{error}</span></div>}
            {success && <div className="alert alert--success"><IcoCheckCircle /> <span>{success}</span></div>}

            <form onSubmit={onSubmit} className="auth-form">
              <div className="auth-two-col">
                <Field id="name" name="name" type="text" label="Full name" placeholder="Jane Smith" value={fd.name} onChange={onChange} focused={focused} setFocused={setFocused} icon={<IcoUser active={focused==='name'} />} />
                <Field id="email" name="email" type="email" label="Email address" placeholder="you@example.com" value={fd.email} onChange={onChange} focused={focused} setFocused={setFocused} icon={<IcoMail active={focused==='email'} />} />
              </div>

              <div>
                <label htmlFor="password" className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><IcoLock active={focused==='password'} /></span>
                  <input id="password" name="password" type={showPw?'text':'password'} value={fd.password} onChange={onChange} placeholder="Min. 6 characters" autoComplete="new-password"
                    onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                    className={`auth-input${focused==='password'?' auth-input--focused':''}`} />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowPw(p=>!p)}>{showPw?<IcoEyeOff />:<IcoEye />}</button>
                </div>
                {fd.password && sm && (
                  <div className="auth-strength">
                    <div className="auth-strength-bars">{[1,2,3,4,5].map(i=><div key={i} className="auth-strength-bar" style={{background:i<=pwStr?sm.color:'rgba(0,0,0,0.08)'}}/>)}</div>
                    <span className="auth-strength-label" style={{color:sm.color}}>{sm.label}</span>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="auth-label">Confirm password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><IcoLock active={focused==='confirm'} /></span>
                  <input id="confirmPassword" name="confirmPassword" type={showCf?'text':'password'} value={fd.confirmPassword} onChange={onChange} placeholder="Repeat your password" autoComplete="new-password"
                    onFocus={() => setFocused('confirm')} onBlur={() => setFocused('')}
                    className={`auth-input${focused==='confirm'?' auth-input--focused':''}${pwMismatch?' auth-input--error':''}${pwMatch?' auth-input--success':''}`} />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowCf(p=>!p)}>{showCf?<IcoEyeOff />:<IcoEye />}</button>
                </div>
                {pwMismatch && <p className="auth-field-error">Passwords do not match</p>}
              </div>

              <button type="submit" disabled={loading} className="auth-submit-btn">
                {loading ? <svg className="auth-spinner" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : 'Create Account'}
              </button>
            </form>

            <div className="auth-divider"><div className="auth-divider-line"/><span className="auth-divider-text">or</span><div className="auth-divider-line"/></div>
            <p className="auth-switch">Already have an account? <Link to="/auth/login" className="auth-switch-link">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ id, name, type, label, placeholder, value, onChange, focused, setFocused, icon }) => (
  <div>
    <label htmlFor={id} className="auth-label">{label}</label>
    <div className="auth-input-wrap">
      <span className="auth-input-icon">{icon}</span>
      <input id={id} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(name)} onBlur={() => setFocused('')}
        autoComplete={type==='email'?'email':type==='text'?'name':undefined}
        className={`auth-input${focused===name?' auth-input--focused':''}`} />
    </div>
  </div>
);

const IcoWave    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IcoUserPlus= () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>;
const IcoUser    = ({ active }) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={active?'#22c55e':'#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoMail    = ({ active }) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={active?'#22c55e':'#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IcoLock    = ({ active }) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={active?'#22c55e':'#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IcoEye     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoEyeOff  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IcoAlert   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IcoCheckCircle = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

export default Register;
