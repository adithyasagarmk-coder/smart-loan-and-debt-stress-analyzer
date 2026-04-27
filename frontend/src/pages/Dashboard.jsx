import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import { dashboardService, financeService } from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import AiAssistant from '../components/AiAssistant';

const fmt   = (n) => `₹${Number(n||0).toLocaleString()}`;
const fmtK  = (n) => n >= 1000 ? `₹${(n/1000).toFixed(0)}k` : `₹${n}`;
const GREEN  = '#22c55e';
const COLORS = ['#22c55e','#16a34a','#4ade80','#86efac','#a7f3d0','#6ee7b7'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{background:'rgba(255,255,255,0.95)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:10,padding:'10px 14px',fontSize:12,boxShadow:'0 4px 16px rgba(0,0,0,0.1)'}}>
        {label && <p style={{fontWeight:700,color:'#111827',marginBottom:4}}>{label}</p>}
        {payload.map((p,i) => <p key={i} style={{color:p.color||'#374151',margin:'2px 0'}}>{p.name}: <strong>{typeof p.value==='number'&&p.value>100?fmt(p.value):`${p.value}${p.name==='Stress'?'%':''}`}</strong></p>)}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user, refreshKey } = useAuth();
  const { dashboardData, fetchDashboardData } = useDashboard();
  const [showSetup, setShowSetup] = useState(false);
  const [income, setIncome]   = useState('');
  const [expenses, setExpenses] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [stressTrend, setStressTrend] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => { fetchDashboardData(); }, [refreshKey, fetchDashboardData]);

  // Fetch real stress trend from /api/finance/stress-trend
  useEffect(() => {
    if (!dashboardData) return;
    financeService.stressTrend()
      .then(r => { if (r.data?.data?.length) setStressTrend(r.data.data); })
      .catch(() => {
        // fallback: use dashboard's own stressTrend (flat but better than nothing)
        if (dashboardData?.stressTrend?.length) setStressTrend(dashboardData.stressTrend);
      });
  }, [dashboardData]);

  const handleSave = async () => {
    setSetupLoading(true);
    try {
      await dashboardService.updateFinancialInfo({ monthlyIncome: Number(income)||0, monthlyExpenses: Number(expenses)||0 });
      await fetchDashboardData();
      setShowSetup(false); setIncome(''); setExpenses('');
    } catch(e){ console.error(e); } finally { setSetupLoading(false); }
  };

  const handleSample = async () => {
    setSetupLoading(true);
    try {
      await dashboardService.updateFinancialInfo({ monthlyIncome: 50000, monthlyExpenses: 20000 });
      await fetchDashboardData(); setShowSetup(false);
    } catch(e){ console.error(e); } finally { setSetupLoading(false); }
  };

  const score = dashboardData?.stressScore ?? 0;
  const scoreLabel = score >= 70 ? 'Low Stress' : score >= 40 ? 'Moderate' : 'High Stress';
  const scoreBadge = score >= 70 ? 'stat-badge--green' : score >= 40 ? 'stat-badge--amber' : 'stat-badge--red';
  const needleDeg  = Math.min(180, Math.max(0, (score/100)*180));

  // Chart data derived from dashboard
  const emiBreakdown = (dashboardData?.allActiveLoansBreakdown||dashboardData?.recentLoans||[]).map(l => ({
    name: l.loanType||l.type||'Loan',
    value: Math.round(l.emi||0),
  })).filter(d => d.value > 0);

  const barData = dashboardData ? [
    { name: 'Income',   value: dashboardData.monthlyIncome   },
    { name: 'Expenses', value: dashboardData.monthlyExpenses },
    { name: 'EMI',      value: dashboardData.totalEMI        },
    { name: 'Free',     value: Math.max(0, dashboardData.monthlyIncome - dashboardData.monthlyExpenses - (dashboardData.totalEMI||0)) },
  ] : [];

  return (
    <div className="fade-in" onClick={() => setOpenDropdown(null)}>
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0] || 'there'}</h1>
        <p className="page-subtitle">Your financial stress overview — updated in real time.</p>
      </div>

      {/* Setup prompt */}
      {(!dashboardData?.monthlyIncome || dashboardData.monthlyIncome === 0) && !showSetup && (
        <div style={{marginBottom:20,padding:'14px 18px',background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:12,display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <p style={{fontSize:13.5,color:'#166534',flex:1}}>Set your monthly income and expenses to see accurate insights.</p>
          <button className="btn-primary" style={{padding:'8px 16px',fontSize:13}} onClick={()=>setShowSetup(true)}>Set up now</button>
          <button className="btn-secondary" style={{padding:'8px 16px',fontSize:13}} onClick={handleSample} disabled={setupLoading}>{setupLoading?'Loading...':'Use sample data'}</button>
        </div>
      )}

      {showSetup && (
        <div className="section-card" style={{marginBottom:20}}>
          <h3 className="section-title">Set Financial Information</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16}}>
            <div><label className="form-label">Monthly Income (₹)</label><input className="form-input" type="number" value={income} onChange={e=>setIncome(e.target.value)} placeholder="50000"/></div>
            <div><label className="form-label">Monthly Expenses (₹)</label><input className="form-input" type="number" value={expenses} onChange={e=>setExpenses(e.target.value)} placeholder="20000"/></div>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button className="btn-primary" onClick={handleSave} disabled={setupLoading||!income||!expenses} style={{padding:'9px 20px',fontSize:13}}>{setupLoading?'Saving...':'Save'}</button>
            <button className="btn-secondary" onClick={()=>setShowSetup(false)} style={{padding:'9px 20px',fontSize:13}}>Cancel</button>
          </div>
        </div>
      )}

      {!dashboardData ? (
        <div className="page-spinner"><p style={{color:'#6b7280'}}>Loading dashboard...</p></div>
      ) : (
        <>
          {/* KPI Row */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
            {[
              {label:'Monthly Income',    value:fmt(dashboardData.monthlyIncome),    sub:'Total earnings', editable: true},
              {label:'Monthly Expenses',  value:fmt(dashboardData.monthlyExpenses),  sub:'Fixed costs', editable: true},
              {label:'Disposable Income', value:fmt(Math.max(0,dashboardData.monthlyIncome-dashboardData.monthlyExpenses-(dashboardData.totalEMI||0))), sub:'After EMI'},
              {label:'Total EMI',         value:fmt(dashboardData.totalEMI),         sub:`${dashboardData.loansCount||0} active loans`, hoverKey: 'emi'},
              {label:'Total Payable Amount', value:fmt(dashboardData.totalPayableAmount || 0), sub:'Principal + Interest', hoverKey: 'payable'},
              {label:'Total Interest',    value:fmt(dashboardData.totalInterest || 0), sub:'Overall interest cost', hoverKey: 'interest'},
            ].map((s,i)=>(
              <div 
                className="stat-card" 
                key={i} 
                style={{position:'relative', cursor: s.hoverKey ? 'pointer' : 'default'}}
                onClick={(e) => {
                  e.stopPropagation();
                  if (s.hoverKey) setOpenDropdown(openDropdown === s.hoverKey ? null : s.hoverKey);
                }}
              >
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <p className="stat-label">{s.label}</p>
                  {s.editable && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIncome(dashboardData.monthlyIncome || '');
                        setExpenses(dashboardData.monthlyExpenses || '');
                        setShowSetup(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{background:'transparent',border:'none',color:'#9ca3af',cursor:'pointer',padding:0,display:'flex'}}
                      title="Edit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                  )}
                </div>
                <p className="stat-value" style={{fontSize:22}}>{s.value}</p>
                <p style={{fontSize:11.5,color:'#9ca3af',marginTop:4}}>{s.sub}</p>

                {/* Click Dropdown */}
                {openDropdown === s.hoverKey && s.hoverKey && dashboardData.allActiveLoansBreakdown?.length > 0 && (
                  <div style={{position:'absolute', top:'100%', left:0, width:'100%', minWidth:'220px', background:'white', border:'1px solid rgba(0,0,0,0.08)', borderRadius:10, boxShadow:'0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', zIndex:50, padding:14, marginTop:6}} onClick={e=>e.stopPropagation()}>
                    <p style={{fontSize:12, fontWeight:700, color:'#374151', marginBottom:10, borderBottom:'1px solid #f3f4f6', paddingBottom:6, textTransform:'uppercase', letterSpacing:'0.5px'}}>Breakdown by Loan</p>
                    <div style={{display:'flex', flexDirection:'column', gap:8}}>
                      {dashboardData.allActiveLoansBreakdown.map(l => (
                        <div key={l.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13}}>
                          <span style={{color:'#4b5563', display:'flex', alignItems:'center', gap:6}}>
                            <div style={{width:6, height:6, borderRadius:'50%', background:'#3b82f6'}}></div>
                            {l.type}
                          </span>
                          <span style={{fontWeight:700, color:'#111827'}}>
                            {s.hoverKey === 'emi' && fmt(l.emi)}
                            {s.hoverKey === 'payable' && fmt(l.totalPayable)}
                            {s.hoverKey === 'interest' && fmt(l.totalInterest)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Row 2: Gauge + Trend chart + Bar chart */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1.8fr 1.4fr',gap:16,marginBottom:16}}>

            {/* Stress gauge */}
            <div className="section-card">
              <h3 className="section-title">Stress Score</h3>
              <div style={{textAlign:'center'}}>
                <svg viewBox="0 0 200 120" style={{width:'100%',maxWidth:200,margin:'0 auto',display:'block'}}>
                  <defs>
                    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e"/>
                      <stop offset="50%" stopColor="#eab308"/>
                      <stop offset="100%" stopColor="#ef4444"/>
                    </linearGradient>
                  </defs>
                  <path d="M 24 104 A 76 76 0 0 1 176 104" stroke="rgba(0,0,0,0.06)" strokeWidth="14" fill="none" strokeLinecap="round"/>
                  <path d="M 24 104 A 76 76 0 0 1 176 104" stroke="url(#g1)" strokeWidth="14" fill="none" strokeLinecap="round"/>
                  <g transform={`rotate(${needleDeg - 90}, 100, 104)`}>
                    <line x1="100" y1="104" x2="100" y2="34" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"/>
                    <circle cx="100" cy="104" r="5" fill="#374151"/>
                  </g>
                  <text x="100" y="88" textAnchor="middle" fontSize="26" fontWeight="800" fill="#111827">{score}</text>
                </svg>
                <span className={`stat-badge ${scoreBadge}`} style={{fontSize:12.5,padding:'5px 14px'}}>{scoreLabel}</span>
                <p style={{fontSize:12,color:'#9ca3af',marginTop:8}}>EMI/Disposable ratio: {Math.round((dashboardData.emiRatio||0)*100)}%</p>
              </div>
            </div>

            {/* Stress trend line chart */}
            <div className="section-card">
              <h3 className="section-title">Stress Trend (6 months)</h3>
              {stressTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={stressTrend} margin={{top:4,right:4,bottom:0,left:-20}}>
                    <defs>
                      <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={GREEN} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={GREEN} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)"/>
                    <XAxis dataKey="month" tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false} unit="%"/>
                    <Tooltip content={<CustomTooltip />}/>
                    <Area type="monotone" dataKey="stress" name="Stress" stroke={GREEN} strokeWidth={2.5} fill="url(#stressGrad)" dot={{r:3,fill:GREEN}}/>
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state" style={{height:150,display:'flex',alignItems:'center',justifyContent:'center'}}>No trend data yet</div>
              )}
            </div>

            {/* Income breakdown bar */}
            <div className="section-card">
              <h3 className="section-title">Monthly Breakdown</h3>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={barData} margin={{top:4,right:4,bottom:0,left:-24}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)"/>
                  <XAxis dataKey="name" tick={{fontSize:10.5,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10.5,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={fmtK}/>
                  <Tooltip content={<CustomTooltip />}/>
                  <Bar dataKey="value" name="Amount" radius={[6,6,0,0]}>
                    {barData.map((_,i) => (
                      <Cell key={i} fill={['#22c55e','#f97316','#3b82f6','#a3e635'][i]||GREEN}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 3: EMI donut + Recent loans */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:16,marginBottom:16}}>

            {/* EMI breakdown donut */}
            <div className="section-card">
              <h3 className="section-title">EMI Breakdown</h3>
              {emiBreakdown.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={emiBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                        {emiBreakdown.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                      </Pie>
                      <Tooltip formatter={(v) => fmt(v)}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{display:'flex',flexDirection:'column',gap:5,marginTop:4}}>
                    {emiBreakdown.map((d,i) => (
                      <div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
                        <div style={{width:8,height:8,borderRadius:'50%',background:COLORS[i%COLORS.length],flexShrink:0}}/>
                        <span style={{color:'#374151',flex:1}}>{d.name}</span>
                        <span style={{fontWeight:600,color:'#111827'}}>{fmt(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state">Add loans to see EMI breakdown</div>
              )}
            </div>

            {/* Recent loans table */}
            <div className="section-card">
              <h3 className="section-title">Recent Loans</h3>
              {dashboardData.recentLoans?.length ? (
                <div style={{overflowX:'auto'}}>
                  <table className="data-table">
                    <thead>
                      <tr><th>Loan Type</th><th>Principal</th><th>Rate</th><th>EMI</th><th>Total Interest</th><th>Total Payable</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentLoans.map((l,i)=>(
                        <tr key={i}>
                          <td style={{fontWeight:600}}>{l.loanType||l.type||'Loan'}</td>
                          <td>{fmt(l.amount)}</td>
                          <td>{l.interestRate}%</td>
                          <td style={{fontWeight:600,color:'#16a34a'}}>{fmt(l.emi)}</td>
                          <td>{fmt(l.totalInterest || 0)}</td>
                          <td>{fmt(l.totalAmount || 0)}</td>
                          <td><span className={`badge ${['ACTIVE','Active','active'].includes(l.status)?'badge--green':l.status==='PAID'||l.status==='Paid'?'badge--amber':'badge--gray'}`}>{l.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <svg style={{margin:'0 auto 10px',display:'block'}} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                  No loans yet. Go to My Loans to add your first loan.
                </div>
              )}
            </div>
          </div>

          {/* Tips row */}
          <div className="section-card">
            <h3 className="section-title">Financial Health Tips</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
              {[
                {title:'Keep EMI below 40%', desc:'Your EMI should not exceed 40% of your monthly income for healthy finances.', ok: dashboardData.emiRatio < 0.4},
                {title:'Build an emergency fund', desc:'Aim to save 3–6 months of expenses. Current free cash: '+fmt(Math.max(0,dashboardData.monthlyIncome-dashboardData.monthlyExpenses-(dashboardData.totalEMI||0))+'/mo.'), ok: true},
                {title:'Prioritise high-interest loans', desc:'Pay off loans with the highest interest rate first to minimise total interest paid.', ok: (dashboardData.loansCount||0) <= 1},
              ].map((tip,i)=>(
                <div key={i} style={{padding:'14px 16px',borderRadius:10,background:tip.ok?'rgba(34,197,94,0.06)':'rgba(239,68,68,0.05)',border:`1px solid ${tip.ok?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)'}`}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                    <div style={{width:7,height:7,borderRadius:'50%',background:tip.ok?'#22c55e':'#ef4444',flexShrink:0}}/>
                    <p style={{fontSize:13,fontWeight:700,color:tip.ok?'#166534':'#b91c1c'}}>{tip.title}</p>
                  </div>
                  <p style={{fontSize:12.5,color:'#6b7280',lineHeight:1.5}}>{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
