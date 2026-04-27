import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── Icons defined FIRST to avoid hoisting error ── */
const IcoWave    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IcoDash    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const IcoCard    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const IcoSim     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IcoStress  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
const IcoShield  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoLogout  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcoChevL   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoChevR   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoVault   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IcoDiscover = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;

/* ── Nav items ── */
const BASE_NAV = [
  { to: '/dashboard', label: 'Dashboard',       Icon: IcoDash   },
  { to: '/loans',     label: 'My Loans',         Icon: IcoCard   },
  { to: '/simulation',label: 'Simulation',       Icon: IcoSim    },
  { to: '/analysis',  label: 'Stress Analysis',  Icon: IcoStress },
  { to: '/vault',     label: 'Document Vault',   Icon: IcoVault  },
  { to: '/discover',  label: 'Discover',         Icon: IcoDiscover},
];

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();

  const isActive = (to) => location.pathname === to;
  const nav = user?.role === 'admin'
    ? [...BASE_NAV, { to: '/admin', label: 'Admin Panel', Icon: IcoShield }]
    : BASE_NAV;

  const handleLogout = () => { logout(); navigate('/auth/login'); };

  return (
    <>
      <aside style={{
        position:'fixed', top:0, left:0, bottom:0,
        width: open ? 240 : 68,
        background:'rgba(255,255,255,0.85)',
        backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
        borderRight:'1px solid rgba(34,197,94,0.15)',
        boxShadow:'4px 0 24px rgba(0,0,0,0.06)',
        display:'flex', flexDirection:'column',
        transition:'width 0.25s ease',
        zIndex:100, overflow:'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: open ? '20px 20px 16px' : '20px 14px 16px',
          borderBottom:'1px solid rgba(0,0,0,0.06)',
          display:'flex', alignItems:'center',
          justifyContent: open ? 'space-between' : 'center',
        }}>
          {open && (
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <div style={{width:34,height:34,borderRadius:9,background:'linear-gradient(135deg,#22c55e,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 3px 10px rgba(34,197,94,0.3)'}}>
                <IcoWave />
              </div>
              <div>
                <p style={{fontSize:14,fontWeight:700,color:'#111827',margin:0,lineHeight:1.2}}>SmartLoan</p>
                <p style={{fontSize:11,color:'#9ca3af',margin:0}}>Debt Analyzer</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setOpen(o => !o)}
            style={{width:32,height:32,borderRadius:8,border:'1px solid rgba(0,0,0,0.09)',background:'rgba(0,0,0,0.03)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,boxShadow:'none',transition:'background 0.15s'}}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(34,197,94,0.08)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(0,0,0,0.03)'}
          >
            {open ? <IcoChevL /> : <IcoChevR />}
          </button>
        </div>

        {/* ── Section label ── */}
        {open && (
          <p style={{fontSize:10.5,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.8px',padding:'14px 22px 8px',margin:0}}>Navigation</p>
        )}

        {/* ── Nav items ── */}
        <nav style={{flex:1, padding: open ? '0 12px' : '8px 10px', overflowY:'auto'}}>
          <div style={{display:'flex',flexDirection:'column',gap:2}}>
            {nav.map(({ to, label, Icon }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  title={!open ? label : ''}
                  style={{
                    display:'flex', alignItems:'center', gap:12,
                    padding: open ? '10px 12px' : '10px',
                    borderRadius:10,
                    justifyContent: open ? 'flex-start' : 'center',
                    background: active ? 'linear-gradient(135deg,rgba(34,197,94,0.14),rgba(16,163,74,0.07))' : 'transparent',
                    border: active ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent',
                    color: active ? '#16a34a' : '#6b7280',
                    textDecoration:'none', fontWeight: active ? 600 : 500,
                    fontSize:13.5, transition:'all 0.15s',
                  }}
                  onMouseEnter={e=>{if(!active){e.currentTarget.style.background='rgba(34,197,94,0.07)';e.currentTarget.style.color='#16a34a';}}}
                  onMouseLeave={e=>{if(!active){e.currentTarget.style.background='transparent';e.currentTarget.style.color='#6b7280';}}}
                >
                  <span style={{color:active?'#22c55e':'#9ca3af',flexShrink:0,display:'flex'}}><Icon /></span>
                  {open && <span style={{flex:1}}>{label}</span>}
                  {open && active && <span style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',flexShrink:0}}/>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ── Divider ── */}
        <div style={{height:1,background:'rgba(0,0,0,0.06)',margin: open ? '0 12px' : '0 10px'}}/>

        {/* ── User info + Logout ── */}
        <div style={{padding: open ? '14px 12px' : '14px 10px'}}>
          {open && user && (
            <div style={{padding:'10px 12px',borderRadius:10,background:'rgba(34,197,94,0.07)',border:'1px solid rgba(34,197,94,0.12)',marginBottom:8}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:28,height:28,borderRadius:8,background:'linear-gradient(135deg,#22c55e,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <span style={{fontSize:11,fontWeight:700,color:'#fff'}}>{(user.name||'U')[0].toUpperCase()}</span>
                </div>
                <div style={{minWidth:0}}>
                  <p style={{fontSize:12.5,fontWeight:600,color:'#111827',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.name}</p>
                  <p style={{fontSize:11,color:'#9ca3af',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.email}</p>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={!open ? 'Logout' : ''}
            style={{width:'100%',padding: open?'10px 12px':'10px',borderRadius:10,border:'1px solid rgba(239,68,68,0.2)',background:'rgba(239,68,68,0.06)',color:'#dc2626',fontSize:13,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent: open?'flex-start':'center',gap:8,boxShadow:'none',transition:'background 0.15s'}}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.12)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,0.06)'}
          >
            <IcoLogout />
            {open && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Margin class for main content */}
      <style>{`.sidebar-offset{margin-left:${open?240:68}px;transition:margin-left 0.25s ease;}`}</style>
    </>
  );
};

export default Sidebar;
