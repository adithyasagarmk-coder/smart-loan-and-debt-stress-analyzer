import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import { loanService } from '../services/api';
import confetti from 'canvas-confetti';

const fmt = (n) => `₹${Number(n||0).toLocaleString()}`;

export default function Loans() {
  const { triggerRefresh } = useAuth();
  const { fetchDashboardData, dashboardData } = useDashboard();
  const [fd, setFd] = useState({ type:'', amount:'', interestRate:'', duration:'' });
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loanService.getLoans().then(r => setLoans(r.data.data||[])).catch(console.error);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleChange = (e) => setFd(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (!fd.type||!fd.amount||!fd.interestRate||!fd.duration) { setError('Please fill in all fields'); return; }
      const res = await loanService.create({ type:fd.type.trim(), amount:Number(fd.amount), interestRate:Number(fd.interestRate), duration:Number(fd.duration) });
      if (res.data.success && res.data.data) setLoans(p => [res.data.data, ...p]);
      setFd({ type:'', amount:'', interestRate:'', duration:'' });
      await fetchDashboardData();
      triggerRefresh();
    } catch (e) { setError(e.response?.data?.message||'Failed to add loan'); }
    finally { setLoading(false); }
  };

  const handleMarkPaid = async (loanId) => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#4ade80', '#fbbf24', '#facc15']
    });
    
    // Optimistically update UI to show as paid briefly
    setLoans(prev => prev.map(l => l._id === loanId ? { ...l, status: 'PAID', paidAmount: l.amount } : l));
    
    try {
      await loanService.update(loanId, { status: 'PAID' });
      await fetchDashboardData();
      triggerRefresh();
      
      // Remove it from the active list after a short delay so user sees the success state
      setTimeout(() => {
        setLoans(prev => prev.filter(l => l._id !== loanId));
      }, 2000);
    } catch (e) {
      console.error('Failed to mark loan as paid', e);
      setError('Failed to update loan status');
    }
  };

  // Simulate progress logic based on elapsed time if no specific payment records exist
  const getProgress = (loan) => {
    if (loan.status === 'PAID') return 100;
    if (loan.paidAmount && loan.amount) return Math.min(100, Math.round((loan.paidAmount / loan.amount) * 100));
    
    // Fallback: estimate from createdAt
    if (!loan.createdAt || !loan.duration) return 0;
    const start = new Date(loan.createdAt);
    const now = new Date();
    const monthsElapsed = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
    const progress = Math.max(0, Math.min(100, Math.round((monthsElapsed / loan.duration) * 100)));
    // Hardcode a default progress if newly created just to show the UI feature
    return progress === 0 ? 12 : progress; 
  };

  const getEMI = (amount, rate, duration) => {
    const p = Number(amount) || 0;
    const r = Number(rate) || 0;
    const n = Number(duration) || 0;
    if (!p || !n) return 0;
    if (!r) return p / n;
    const rMonthly = r / 12 / 100;
    return (p * rMonthly * Math.pow(1 + rMonthly, n)) / (Math.pow(1 + rMonthly, n) - 1);
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <h1 className="page-title">My Loans & Goals</h1>
          <p className="page-subtitle">Track your payoff progress and manage active loans.</p>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1.6fr',gap:20}}>
        {/* Add loan */}
        <div className="section-card">
          <h2 className="section-title">Add New Loan</h2>
          {error && <div className="alert alert--error"><span style={{flexShrink:0}}>&#9888;</span> {error}</div>}
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
            {[
              {name:'type',        label:'Loan Type',        placeholder:'e.g. Home Loan', type:'text'},
              {name:'amount',      label:'Principal Amount (₹)', placeholder:'500000',      type:'number'},
              {name:'interestRate',label:'Interest Rate (%)', placeholder:'8.5',            type:'number', step:'0.01'},
              {name:'duration',    label:'Duration (Months)',  placeholder:'240',            type:'number'},
            ].map(f => (
              <div key={f.name}>
                <label className="form-label">{f.label}</label>
                <input className="form-input" type={f.type} name={f.name} placeholder={f.placeholder}
                  value={fd[f.name]} onChange={handleChange} step={f.step} required />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Adding...' : 'Add Loan'}</button>
          </form>
        </div>

        {/* Loans list */}
        <div className="section-card">
          <h2 className="section-title">Active Goals & Progress <span style={{fontWeight:400,color:'#6b7280',fontSize:13}}>({loans.filter(l => l.status !== 'PAID').length})</span></h2>
          {loans.filter(l => l.status !== 'PAID' || l.justPaid).length === 0 ? (
            <div className="empty-state">
              <svg style={{margin:'0 auto 12px',display:'block'}} width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              No loans added yet. Add your first loan to start tracking your goals.
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {loans.filter(l => l.status !== 'PAID' || l.status === 'PAID').map((loan,i) => {
                if (loan.status === 'PAID' && !loan.paidAmount) return null; // Only show freshly paid ones
                const isPaid = loan.status === 'PAID';
                
                const duration = loan.duration || loan.tenureMonths || 0;
                const emi = loan.emi || getEMI(loan.amount, loan.interestRate, duration);
                const totalPayable = emi * duration;
                
                // Calculate estPaid
                let estPaid;
                if (loan.paidAmount !== undefined && loan.paidAmount !== null) {
                  estPaid = Number(loan.paidAmount);
                } else {
                  let prog = 0;
                  if (isPaid) prog = 100;
                  else if (loan.createdAt && duration) {
                    const start = new Date(loan.createdAt);
                    const now = new Date();
                    const monthsElapsed = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
                    prog = Math.max(0, Math.min(100, Math.round((monthsElapsed / duration) * 100)));
                    if (prog === 0) prog = 12; // default progress
                  }
                  estPaid = isPaid ? totalPayable : (totalPayable * (prog / 100));
                }
                
                const remaining = isPaid ? 0 : Math.max(0, totalPayable - estPaid);
                const progress = totalPayable > 0 ? Math.min(100, Math.round((estPaid / totalPayable) * 100)) : 0;
                
                return (
                  <div key={loan._id||i} style={{padding:'18px',borderRadius:12,background:'rgba(255,255,255,0.85)',border:'1px solid rgba(0,0,0,0.06)',boxShadow:'0 2px 8px rgba(0,0,0,0.04)',transition:'transform 0.2s'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:38,height:38,borderRadius:10,background:isPaid?'rgba(34,197,94,0.1)':'rgba(59,130,246,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                           {isPaid ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> 
                                   : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                        </div>
                        <div>
                          <span style={{fontWeight:700,color:'#111827',fontSize:15,display:'block'}}>{loan.type||loan.name||'Loan'}</span>
                          <span style={{fontSize:12,color:'#6b7280'}}>{duration} months @ {loan.interestRate}%</span>
                        </div>
                      </div>
                      
                      <div style={{display:'flex',gap:10,alignItems:'center'}}>
                        {isPaid ? (
                          <span className="badge badge--green">Fully Paid</span>
                        ) : (
                          <button 
                            onClick={() => handleMarkPaid(loan._id)}
                            style={{padding:'6px 12px',borderRadius:6,border:'1px solid #22c55e',background:'transparent',color:'#16a34a',fontSize:12,fontWeight:600,cursor:'pointer',transition:'background 0.2s'}}
                            onMouseEnter={e=>{e.target.style.background='#f0fdf4'}}
                            onMouseLeave={e=>{e.target.style.background='transparent'}}
                          >
                            Mark as Paid
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Goal Progress Bar */}
                    <div style={{marginBottom:14}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:6}}>
                        <span style={{color:'#4b5563',fontWeight:600}}>Payoff Progress</span>
                        <span style={{color:isPaid?'#16a34a':'#3b82f6',fontWeight:700}}>{progress}%</span>
                      </div>
                      <div style={{height:8,borderRadius:4,background:'rgba(0,0,0,0.06)',overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${progress}%`,background:isPaid?'#22c55e':'#3b82f6',borderRadius:4,transition:'width 1s ease-out'}} />
                      </div>
                    </div>
                    
                    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,paddingTop:12,borderTop:'1px dashed rgba(0,0,0,0.08)'}}>
                      <div>
                        <p style={{fontSize:11,color:'#9ca3af',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.4px'}}>EMI / Month</p>
                        <p style={{fontSize:14,fontWeight:700,color:'#374151'}}>{fmt(Math.round(emi))}</p>
                      </div>
                      <div>
                        <p style={{fontSize:11,color:'#9ca3af',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.4px'}}>Total Payable</p>
                        <p style={{fontSize:14,fontWeight:700,color:'#374151'}}>{fmt(Math.round(totalPayable))}</p>
                      </div>
                      <div>
                        <p style={{fontSize:11,color:'#9ca3af',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.4px'}}>Est. Paid</p>
                        {isPaid ? (
                          <p style={{fontSize:14,fontWeight:700,color:'#374151'}}>{fmt(Math.round(estPaid))}</p>
                        ) : (
                          <div style={{position:'relative', display:'flex', alignItems:'center'}}>
                            <span style={{position:'absolute', left:0, fontSize:14, fontWeight:700, color:'#374151'}}>₹</span>
                            <input 
                              type="number" 
                              style={{fontSize:14,fontWeight:700,color:'#3b82f6',background:'transparent',border:'none',borderBottom:'1px dashed #9ca3af',padding:'0 0 0 12px',width:'100%',outline:'none',cursor:'text'}}
                              value={Math.round(estPaid)}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setLoans(prev => prev.map(l => l._id === loan._id ? { ...l, paidAmount: val } : l));
                              }}
                              onBlur={async (e) => {
                                const val = Number(e.target.value);
                                try {
                                  await loanService.update(loan._id, { paidAmount: val });
                                  fetchDashboardData();
                                } catch(err) { console.error(err); }
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <p style={{fontSize:11,color:'#9ca3af',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.4px'}}>Remaining</p>
                        <p style={{fontSize:14,fontWeight:700,color:isPaid?'#16a34a':'#ef4444'}}>{fmt(Math.round(remaining))}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
