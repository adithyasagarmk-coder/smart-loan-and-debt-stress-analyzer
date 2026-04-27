import React, { useState, useEffect, useMemo } from 'react';
import { loanService } from '../services/api';
import { useDashboard } from '../context/DashboardContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const fmt = (n) => `₹${Number(n||0).toLocaleString()}`;
const fmtK = (n) => n >= 1000 ? `₹${(n/1000).toFixed(0)}k` : `₹${n}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{background:'rgba(255,255,255,0.97)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:10,padding:'10px 14px',fontSize:12,boxShadow:'0 4px 16px rgba(0,0,0,0.1)'}}>
      <p style={{fontWeight:700,color:'#111827',marginBottom:4}}>Month {label}</p>
      {payload.map((p,i) => <p key={i} style={{color:p.color,margin:'2px 0'}}>{p.name}: <strong>{fmt(p.value)}</strong></p>)}
    </div>
  );
  return null;
};

// Build amortization schedule for chart
function buildAmortization(amount, rate, months, extraEMI = 0, prepayment = 0) {
  const r = (rate / 12) / 100;
  const baseEMI = r === 0 ? amount / months : amount * r * Math.pow(1+r,months) / (Math.pow(1+r,months)-1);
  let principal = Math.max(0, amount - prepayment);
  const data = [];
  const pay = baseEMI + extraEMI;

  for (let m = 1; m <= months && principal > 0.01; m++) {
    const interest = principal * r;
    const prinPay  = Math.min(principal, Math.max(0, pay - interest));
    principal = Math.max(0, principal - prinPay);
    if (m % Math.max(1, Math.floor(months/12)) === 0 || m === 1) {
      data.push({ month: m, balance: Math.round(principal), interest: Math.round(interest), principal: Math.round(prinPay) });
    }
    if (data.length > 50) break; // cap data points
  }
  return data;
}

export default function Simulation() {
  const { dashboardData } = useDashboard();
  const [fd, setFd] = useState({ amount:'', interestRate:'', duration:'', emiAdjustment:'', prepayment:'' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dashboardData?.recentLoans?.length) {
      const l = dashboardData.recentLoans[0];
      setFd(p => ({...p, amount:p.amount||l.amount||500000, interestRate:p.interestRate||l.interestRate||8.5, duration:p.duration||240}));
    }
  }, [dashboardData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await loanService.simulate(
        { amount:Number(fd.amount||500000), interestRate:Number(fd.interestRate||8.5), tenureMonths:Number(fd.duration||240) },
        { extraEMI:Number(fd.emiAdjustment||0), prepayment:Number(fd.prepayment||0) }
      );
      setResult(res.data.data);
    } catch(e){ setError(e.response?.data?.message||'Simulation failed'); }
    finally { setLoading(false); }
  };

  const amortBase = useMemo(() =>
    fd.amount && fd.interestRate && fd.duration
      ? buildAmortization(Number(fd.amount), Number(fd.interestRate), Number(fd.duration), 0, 0)
      : [], [fd.amount, fd.interestRate, fd.duration]);

  const amortNew = useMemo(() =>
    result && fd.amount && fd.interestRate && fd.duration
      ? buildAmortization(Number(fd.amount), Number(fd.interestRate), Number(fd.duration), Number(fd.emiAdjustment||0), Number(fd.prepayment||0))
      : [], [result, fd]);

  const resultItems = result ? [
    { label:'Interest Saved',   value: fmt(result.interestSaved??0),   color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
    { label:'New Monthly EMI',  value: fmt(result.newEmi??0),           color:'#1d4ed8', bg:'#eff6ff', border:'#bfdbfe' },
    { label:'Months Remaining', value: `${result.months??'N/A'} mo`,    color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe' },
    { label:'Debt-Free Date',   value: result.newEndDate ? new Date(result.newEndDate).toLocaleDateString('en-IN',{month:'short',year:'numeric'}) : 'N/A', color:'#b45309', bg:'#fefce8', border:'#fde68a' },
  ] : [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Loan Simulation</h1>
        <p className="page-subtitle">Model different repayment scenarios and see the impact on your debt.</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
        {/* Loan parameters */}
        <div className="section-card">
          <h2 className="section-title">Loan Parameters</h2>
          {[
            {n:'amount',      l:'Principal Amount (₹)', p:'500000', t:'number'},
            {n:'interestRate',l:'Interest Rate (%)',     p:'8.5',    t:'number', s:'0.01'},
            {n:'duration',    l:'Duration (Months)',      p:'240',    t:'number'},
          ].map(f => (
            <div key={f.n} style={{marginBottom:14}}>
              <label className="form-label">{f.l}</label>
              <input className="form-input" type={f.t} name={f.n} placeholder={f.p} value={fd[f.n]}
                onChange={e=>setFd(p=>({...p,[e.target.name]:e.target.value}))} step={f.s} required/>
            </div>
          ))}
        </div>

        {/* What-if params */}
        <div className="section-card">
          <h2 className="section-title">What-If Scenario</h2>
          <p style={{fontSize:13,color:'#6b7280',marginBottom:16}}>See how paying extra each month or making a lump-sum prepayment changes your loan trajectory.</p>
          {[
            {n:'emiAdjustment',l:'Extra EMI per Month (₹)',p:'0',t:'number'},
            {n:'prepayment',   l:'One-time Prepayment (₹)',p:'0',t:'number'},
          ].map(f => (
            <div key={f.n} style={{marginBottom:14}}>
              <label className="form-label">{f.l}</label>
              <input className="form-input" type={f.t} name={f.n} placeholder={f.p} value={fd[f.n]}
                onChange={e=>setFd(p=>({...p,[e.target.name]:e.target.value}))}/>
            </div>
          ))}
          {error && <div className="alert alert--error" style={{marginBottom:12}}>{error}</div>}
          <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary" style={{width:'100%',marginTop:8}}>
            {loading ? 'Calculating...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="fade-in">
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
            {resultItems.map((c,i) => (
              <div key={i} style={{padding:'18px 16px',borderRadius:12,background:c.bg,border:`1px solid ${c.border}`,textAlign:'center'}}>
                <p style={{fontSize:11.5,fontWeight:700,color:c.color,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8}}>{c.label}</p>
                <p style={{fontSize:20,fontWeight:800,color:'#111827'}}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Amortization chart */}
          <div className="section-card">
            <h3 className="section-title">Loan Balance Over Time</h3>
            <p style={{fontSize:12.5,color:'#9ca3af',marginBottom:12}}>Compare your original repayment schedule vs. the optimised one.</p>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart margin={{top:4,right:8,bottom:0,left:-10}}>
                <defs>
                  <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)"/>
                <XAxis dataKey="month" tick={{fontSize:10.5,fill:'#9ca3af'}} axisLine={false} tickLine={false} label={{value:'Month',position:'insideBottom',offset:-2,fontSize:11,fill:'#9ca3af'}}/>
                <YAxis tick={{fontSize:10.5,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={fmtK}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend wrapperStyle={{fontSize:12}}/>
                <Area data={amortBase} type="monotone" dataKey="balance" name="Original Balance" stroke="#ef4444" strokeWidth={2} fill="url(#baseGrad)" dot={false}/>
                <Area data={amortNew}  type="monotone" dataKey="balance" name="Optimised Balance" stroke="#22c55e" strokeWidth={2} fill="url(#newGrad)"  dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Summary text */}
          <div className="section-card" style={{marginTop:14,background:'rgba(34,197,94,0.06)',borderColor:'rgba(34,197,94,0.2)'}}>
            <p style={{fontSize:13.5,color:'#166534',lineHeight:1.7}}>
              By paying an extra <strong>{fmt(fd.emiAdjustment||0)}/month</strong> and a prepayment of <strong>{fmt(fd.prepayment||0)}</strong>,
              you save <strong>{fmt(result.interestSaved)}</strong> in total interest and become debt-free
              <strong> {Number(fd.duration||0) - (result.months||0)} months</strong> earlier.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
