import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadialBarChart, RadialBar, Legend
} from 'recharts';

const fmt = (n) => `₹${Number(n||0).toLocaleString()}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{background:'rgba(255,255,255,0.97)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:10,padding:'10px 14px',fontSize:12,boxShadow:'0 4px 16px rgba(0,0,0,0.1)'}}>
        {label && <p style={{fontWeight:700,color:'#111827',marginBottom:4}}>{label}</p>}
        {payload.map((p,i) => <p key={i} style={{color:p.color||'#374151',margin:'2px 0'}}>{p.name}: <strong>{p.name==='EMI'?fmt(p.value):`${p.value}%`}</strong></p>)}
      </div>
    );
  }
  return null;
};

export default function StressAnalysis() {
  const { dashboardData } = useDashboard();

  const stressData = useMemo(() => {
    if (!dashboardData?.recentLoans) return [];
    const disp = dashboardData.monthlyIncome - dashboardData.monthlyExpenses;
    return dashboardData.recentLoans.map(loan => ({
      name: loan.loanType||loan.type||'Loan',
      emi: Math.round(loan.emi||0),
      stress: disp > 0 ? Math.round(((loan.emi||0)/disp)*100) : 0,
      amount: loan.amount||0,
    })).sort((a,b) => b.stress - a.stress);
  }, [dashboardData]);

  const score = dashboardData?.stressScore ?? 0;
  const disposable = (dashboardData?.monthlyIncome||0) - (dashboardData?.monthlyExpenses||0);
  const freeAfterEMI = Math.max(0, disposable - (dashboardData?.totalEMI||0));

  const colorFor = (s) => s < 30 ? '#22c55e' : s < 60 ? '#eab308' : '#ef4444';

  const gaugeData = [{ name: 'Score', value: score, fill: colorFor(100 - score) }];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Stress Analysis</h1>
        <p className="page-subtitle">Understand how each loan contributes to your financial pressure.</p>
      </div>

      {!dashboardData ? (
        <div className="page-spinner"><p style={{color:'#6b7280'}}>Loading data...</p></div>
      ) : (
        <>
          {/* KPI row */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
            {[
              {label:'Monthly Income',   value:fmt(dashboardData.monthlyIncome)},
              {label:'Total EMI',        value:fmt(dashboardData.totalEMI)},
              {label:'Disposable Income',value:fmt(disposable)},
              {label:'Free after EMI',   value:fmt(freeAfterEMI)},
            ].map((s,i)=>(
              <div className="stat-card" key={i}>
                <p className="stat-label">{s.label}</p>
                <p className="stat-value" style={{fontSize:22}}>{s.value}</p>
              </div>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:16}}>
            {/* Per-loan stress bar chart */}
            <div className="section-card">
              <h3 className="section-title">Stress Contribution by Loan</h3>
              {stressData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stressData} layout="vertical" margin={{top:0,right:16,bottom:0,left:8}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false}/>
                    <XAxis type="number" tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false} unit="%"/>
                    <YAxis type="category" dataKey="name" tick={{fontSize:12,fill:'#374151',fontWeight:500}} axisLine={false} tickLine={false} width={90}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="stress" name="Stress" radius={[0,6,6,0]} maxBarSize={28}>
                      {stressData.map((d,i) => <Cell key={i} fill={colorFor(d.stress)}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">Add loans to see stress analysis</div>
              )}
            </div>

            {/* Radial gauge + score */}
            <div className="section-card" style={{textAlign:'center'}}>
              <h3 className="section-title">Overall Score</h3>
              <ResponsiveContainer width="100%" height={160}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="85%" startAngle={180} endAngle={0} data={[{value:score,fill:score>=70?'#22c55e':score>=40?'#eab308':'#ef4444'}]}>
                  <RadialBar dataKey="value" cornerRadius={8} background={{fill:'rgba(0,0,0,0.05)'}}/>
                </RadialBarChart>
              </ResponsiveContainer>
              <p style={{fontSize:36,fontWeight:800,color:'#111827',lineHeight:1,marginTop:-16}}>{score}</p>
              <span className={`stat-badge ${score>=70?'stat-badge--green':score>=40?'stat-badge--amber':'stat-badge--red'}`} style={{fontSize:13,padding:'5px 14px',marginTop:6,display:'inline-flex'}}>
                {score>=70?'Low Stress':score>=40?'Moderate':'High Stress'}
              </span>
            </div>
          </div>

          {/* Detailed loan table */}
          {stressData.length > 0 && (
            <div className="section-card" style={{marginBottom:16}}>
              <h3 className="section-title">Loan Details</h3>
              <table className="data-table">
                <thead><tr><th>Loan</th><th>Principal</th><th>Monthly EMI</th><th>Stress %</th><th>Risk Level</th></tr></thead>
                <tbody>
                  {stressData.map((d,i) => (
                    <tr key={i}>
                      <td style={{fontWeight:600}}>{d.name}</td>
                      <td>{fmt(d.amount)}</td>
                      <td style={{fontWeight:600,color:'#16a34a'}}>{fmt(d.emi)}</td>
                      <td style={{fontWeight:600}}>{d.stress}%</td>
                      <td><span className={`badge ${d.stress<30?'badge--green':d.stress<60?'badge--amber':'badge--red'}`}>{d.stress<30?'Low':d.stress<60?'Medium':'High'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Insights */}
          <div className="section-card" style={{background:'rgba(34,197,94,0.05)',borderColor:'rgba(34,197,94,0.18)'}}>
            <h3 className="section-title" style={{color:'#166534'}}>AI Insights</h3>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {stressData.length > 0 ? [
                `${stressData[0].name} is your highest-stress loan at ${stressData[0].stress}% of disposable income.`,
                `Your total EMI consumes ${Math.round(((dashboardData.totalEMI||0)/Math.max(1,dashboardData.monthlyIncome))*100)}% of your gross income.`,
                freeAfterEMI > 0 ? `You have ${fmt(freeAfterEMI)}/month free after all commitments.` : 'Your EMI exceeds disposable income — consider restructuring.',
                score < 40 ? 'High stress detected. Consider debt consolidation or increasing income.' : score < 70 ? 'Moderate stress. Avoid taking new loans.' : 'Good financial health. Keep maintaining discipline.',
              ].map((t,i) => (
                <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',marginTop:7,flexShrink:0}}/>
                  <p style={{fontSize:13.5,color:'#166534',lineHeight:1.6}}>{t}</p>
                </div>
              )) : <p style={{fontSize:13.5,color:'#166534'}}>Add loans to see personalised insights.</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
