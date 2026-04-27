import React from 'react';

const AdminPanel = () => (
  <div className="fade-in">
    <div className="page-header">
      <h1 className="page-title">Admin Panel</h1>
      <p className="page-subtitle">Administration and system management tools.</p>
    </div>

    <div className="section-card" style={{textAlign:'center',padding:'56px 24px'}}>
      <div style={{width:60,height:60,borderRadius:16,background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <h2 style={{fontSize:17,fontWeight:700,color:'#111827',marginBottom:8}}>Admin features coming soon</h2>
      <p style={{fontSize:14,color:'#6b7280',maxWidth:380,margin:'0 auto'}}>This area will include user management, loan administration, and system analytics once the backend APIs are available.</p>
    </div>
  </div>
);

export default AdminPanel;
