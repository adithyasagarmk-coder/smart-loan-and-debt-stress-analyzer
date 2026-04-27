import React, { useState, useRef, useEffect } from 'react';
import { assistantService, dashboardService } from '../services/api';

const SUGGESTIONS = [
  'How is my stress score calculated?',
  'Which loan should I pay off first?',
  'Can I afford to take a new loan?',
  'How can I become debt-free faster?',
  'What is my EMI-to-income ratio?',
];

const AiAssistant = ({ monthlyIncome=0, monthlyExpenses=0, totalEMI=0, stressScore=0, loans=[] }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setMessages(m => [...m, { role: 'user', text: msg }]);
    setInput('');
    setLoading(true);

    try {
      // Always pull freshest dashboard data for context
      let ctx = { monthlyIncome, monthlyExpenses, totalEMI, stressScore, loans };
      try {
        const dash = await dashboardService.getData();
        const d = dash?.data?.data;
        if (d && Number(d.monthlyIncome) > 0) {
          ctx = {
            monthlyIncome:   Number(d.monthlyIncome),
            monthlyExpenses: Number(d.monthlyExpenses),
            totalEMI:        Number(d.totalEMI),
            stressScore:     Number(d.stressScore),
            loans:           d.recentLoans || [],
          };
        }
      } catch { /* use prop values */ }

      const res = await assistantService.chat({ message: msg, ...ctx });

      if (res.data?.success) {
        setMessages(m => [...m, { role: 'assistant', text: res.data.data.reply }]);
      } else {
        setMessages(m => [...m, { role: 'error', text: 'Could not get a response. Please try again.' }]);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'AI service is temporarily unavailable. Please try again shortly.';
      setMessages(m => [...m, { role: 'error', text: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(); };

  return (
    <>
      {/* ── FAB ── */}
      <button
        id="ai-assistant-fab"
        onClick={() => setOpen(o => !o)}
        title={open ? 'Close assistant' : 'AI Financial Assistant'}
        style={{
          position:'fixed', bottom:24, right:24,
          width:52, height:52, borderRadius:'50%',
          background:'linear-gradient(135deg,#22c55e,#16a34a)',
          border:'none', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 20px rgba(34,197,94,0.4)',
          zIndex:200, transition:'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.08)';e.currentTarget.style.boxShadow='0 6px 28px rgba(34,197,94,0.55)';}}
        onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 4px 20px rgba(34,197,94,0.4)';}}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div style={{
          position:'fixed', bottom:88, right:24,
          width:348, maxHeight:540,
          display:'flex', flexDirection:'column',
          background:'rgba(255,255,255,0.94)',
          backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)',
          borderRadius:18,
          border:'1px solid rgba(34,197,94,0.18)',
          boxShadow:'0 20px 60px rgba(0,0,0,0.13)',
          zIndex:199, overflow:'hidden',
        }}>

          {/* Header */}
          <div style={{padding:'16px 18px',borderBottom:'1px solid rgba(0,0,0,0.06)',display:'flex',alignItems:'center',gap:11,flexShrink:0}}>
            <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#22c55e,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 3px 10px rgba(34,197,94,0.3)'}}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div style={{flex:1}}>
              <p style={{fontSize:14,fontWeight:700,color:'#111827',margin:0}}>AI Financial Advisor</p>
              <p style={{fontSize:11.5,color:'#6b7280',margin:0}}>Powered by Mixtral · Stress Score {stressScore}/100</p>
            </div>
            {messages.length > 0 && (
              <button onClick={()=>setMessages([])} style={{background:'none',border:'none',cursor:'pointer',color:'#9ca3af',fontSize:11.5,padding:'2px 6px',borderRadius:6}} title="Clear chat">Clear</button>
            )}
          </div>

          {/* Quick suggestions */}
          {messages.length === 0 && (
            <div style={{padding:'12px 14px 0',flexShrink:0}}>
              <p style={{fontSize:11.5,color:'#9ca3af',marginBottom:8,fontWeight:500}}>Try asking:</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {SUGGESTIONS.map((s,i) => (
                  <button key={i} onClick={()=>sendMessage(s)} style={{padding:'5px 11px',background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.18)',borderRadius:20,fontSize:11.5,color:'#166534',cursor:'pointer',fontFamily:'inherit',fontWeight:500,lineHeight:1.4}}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={{flex:1,overflowY:'auto',padding:'14px',display:'flex',flexDirection:'column',gap:10}}>
            {messages.length === 0 && (
              <p style={{fontSize:13,color:'#9ca3af',textAlign:'center',padding:'24px 0',lineHeight:1.6}}>
                Ask me anything about your loans, EMIs, or financial health.
              </p>
            )}

            {messages.map((m, i) => (
              <div key={i} style={{display:'flex', justifyContent: m.role==='user' ? 'flex-end' : 'flex-start'}}>
                <div style={{
                  maxWidth:'84%',
                  padding:'10px 13px',
                  borderRadius: m.role==='user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background:
                    m.role==='user'    ? 'linear-gradient(135deg,#22c55e,#16a34a)' :
                    m.role==='error'   ? 'rgba(239,68,68,0.08)' :
                    'rgba(255,255,255,0.95)',
                  color:
                    m.role==='user'  ? '#fff' :
                    m.role==='error' ? '#b91c1c' :
                    '#374151',
                  fontSize:13.5,
                  lineHeight:1.55,
                  border:
                    m.role==='user'  ? 'none' :
                    m.role==='error' ? '1px solid rgba(239,68,68,0.2)' :
                    '1px solid rgba(0,0,0,0.07)',
                  boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
                  whiteSpace:'pre-wrap',
                }}>
                  {m.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{display:'flex',justifyContent:'flex-start'}}>
                <div style={{padding:'10px 14px',borderRadius:'14px 14px 14px 4px',background:'rgba(255,255,255,0.95)',border:'1px solid rgba(0,0,0,0.07)',display:'flex',gap:5,alignItems:'center'}}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',animation:`bounce 1.1s ${i*0.18}s ease-in-out infinite`}}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} style={{padding:'12px 14px',borderTop:'1px solid rgba(0,0,0,0.06)',display:'flex',gap:8,flexShrink:0}}>
            <input
              ref={inputRef}
              id="ai-chat-input"
              value={input}
              onChange={e=>setInput(e.target.value)}
              placeholder="Ask about EMI, loans, debt health..."
              disabled={loading}
              style={{flex:1,padding:'10px 14px',background:'rgba(0,0,0,0.04)',border:'1px solid rgba(0,0,0,0.09)',borderRadius:24,fontSize:13,color:'#111827',outline:'none',fontFamily:'inherit',transition:'border-color 0.15s'}}
              onFocus={e=>e.target.style.borderColor='rgba(34,197,94,0.4)'}
              onBlur={e=>e.target.style.borderColor='rgba(0,0,0,0.09)'}
            />
            <button
              id="ai-chat-send"
              type="submit"
              disabled={loading || !input.trim()}
              style={{width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,#22c55e,#16a34a)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,opacity:(!input.trim()||loading)?0.45:1,transition:'opacity 0.15s, transform 0.15s'}}
              onMouseEnter={e=>{if(!loading&&input.trim())e.currentTarget.style.transform='scale(1.07)';}}
              onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50%       { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default AiAssistant;
