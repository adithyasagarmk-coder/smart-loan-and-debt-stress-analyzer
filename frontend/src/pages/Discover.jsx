import React from 'react';

// Hardcoded for now. In real app, fetch from an API like BankBazaar or internal DB.
const OFFERS = [
  { bank: 'HDFC Bank', type: 'Personal Loan', rate: '10.50% p.a.', maxAmount: '₹40 Lakhs', fee: 'Zero Processing Fee', color: '#004c8f', url: 'https://www.hdfcbank.com/personal/borrow/popular-loans/personal-loan' },
  { bank: 'SBI', type: 'Home Loan', rate: '8.40% p.a.', maxAmount: 'Up to ₹10 Cr', fee: 'Waived off', color: '#007bc4', url: 'https://homeloans.sbi/' },
  { bank: 'ICICI Bank', type: 'Auto Loan', rate: '8.75% p.a.', maxAmount: '100% On-road price', fee: 'Flat ₹1500', color: '#f05a22', url: 'https://www.icicibank.com/Personal-Banking/loans/car-loan/index.page' },
  { bank: 'Axis Bank', type: 'Education Loan', rate: '9.00% p.a.', maxAmount: '₹50 Lakhs', fee: 'No prepayment charges', color: '#97144d', url: 'https://www.axisbank.com/retail/loans/education-loan' },
];

const VIDEOS = [
  { id: '1', title: 'How to Pay Off Debt FAST', url: 'https://www.youtube.com/watch?v=MKP1VjMtw9g' },
  { id: '2', title: 'Snowball vs Avalanche Debt Payoff', url: 'https://www.youtube.com/watch?v=jtgnRJKSJlw' },
];

export default function Discover() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Discover & Learn</h1>
        <p className="page-subtitle">Find the best loan offers in the market and learn how to manage your debt.</p>
      </div>

      <h2 style={{fontSize:18,fontWeight:700,color:'#111827',marginBottom:16}}>Attractive Loan Offers</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:20,marginBottom:32}}>
        {OFFERS.map((offer, i) => (
          <div key={i} className="section-card" style={{padding:'20px',borderTop:`4px solid ${offer.color}`,display:'flex',flexDirection:'column'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <span style={{fontWeight:800,fontSize:16,color:offer.color}}>{offer.bank}</span>
              <span className="badge badge--green" style={{background:'rgba(34,197,94,0.1)',color:'#16a34a'}}>{offer.type}</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
                <span style={{color:'#6b7280'}}>Interest Rate</span>
                <span style={{fontWeight:700,color:'#111827'}}>{offer.rate}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
                <span style={{color:'#6b7280'}}>Max Amount</span>
                <span style={{fontWeight:600,color:'#374151'}}>{offer.maxAmount}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
                <span style={{color:'#6b7280'}}>Processing Fee</span>
                <span style={{fontWeight:600,color:'#374151'}}>{offer.fee}</span>
              </div>
            </div>
            <a 
              href={offer.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{display:'block',textAlign:'center',textDecoration:'none',marginTop:'auto',width:'100%',padding:'10px',background:'white',border:`1px solid ${offer.color}`,color:offer.color,borderRadius:8,fontWeight:600,cursor:'pointer',transition:'background 0.2s'}} 
              onMouseEnter={e=>{e.target.style.background=offer.color;e.target.style.color='white'}} 
              onMouseLeave={e=>{e.target.style.background='white';e.target.style.color=offer.color}}
            >
              Check Eligibility
            </a>
          </div>
        ))}
      </div>

      <h2 style={{fontSize:18,fontWeight:700,color:'#111827',marginBottom:16}}>Financial Education</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))',gap:20}}>
        {VIDEOS.map(video => {
          // Dynamically extract YouTube ID for thumbnail if missing
          const videoIdMatch = video.url.match(/[?&]v=([^&]+)/);
          const videoId = videoIdMatch ? videoIdMatch[1] : '';
          const thumbUrl = video.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '');
          
          return (
          <a 
            key={video.id} 
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="section-card" 
            style={{padding:0,overflow:'hidden',cursor:'pointer',transition:'transform 0.2s',boxShadow:'0 4px 12px rgba(0,0,0,0.05)', display:'block', textDecoration:'none'}}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <div style={{position:'relative',width:'100%',height:'200px',background:'#000'}}>
              <img src={thumbUrl} alt={video.title} style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.85}} />
              <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%, -50%)',width:48,height:48,background:'rgba(255,0,0,0.9)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            </div>
            <div style={{padding:'14px 16px'}}>
              <h3 style={{fontSize:15,fontWeight:600,color:'#111827',marginBottom:4}}>{video.title}</h3>
              <p style={{fontSize:12,color:'#6b7280',margin:0}}>{video.channel || 'Financial Education'}</p>
            </div>
          </a>
        )})}
      </div>
    </div>
  );
}
