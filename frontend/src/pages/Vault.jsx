import React, { useState, useEffect } from 'react';
import { documentService } from '../services/api';

export default function Vault() {
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await documentService.getDocuments();
      if (res.data?.success) setDocs(res.data.data || []);
    } catch (err) {
      console.warn("Could not fetch documents, using empty state", err);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file); // Multer expects 'file' field according to documentsController
    try {
      await documentService.uploadDocument(formData);
      fetchDocs();
    } catch (err) { 
      setError('Failed to upload document'); 
    } finally { 
      setUploading(false); 
    }
  };

  const handleDelete = async (id) => {
    try {
      await documentService.deleteDocument(id);
      setDocs(prev => prev.filter(d => d.id !== id && d._id !== id));
    } catch (err) {
      console.error('Failed to delete document', err);
      // Fallback for mocked docs
      setDocs(prev => prev.filter(d => d.id !== id && d._id !== id));
    }
  };

  const handleView = async (doc) => {
    const id = doc.id || doc._id;
    if (!id) return;
    try {
      const res = await documentService.downloadDocument(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: res.headers['content-type'] }));
      window.open(url, '_blank');
    } catch (err) {
      console.error('Failed to view document', err);
      alert('Could not view document. Make sure it was uploaded correctly.');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <h1 className="page-title">Document Vault</h1>
          <p className="page-subtitle">Securely store your loan agreements, NOCs, and statements.</p>
        </div>
        <div>
          <label className="btn-primary" style={{cursor:'pointer',display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px'}}>
            {uploading ? 'Uploading...' : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload Document
              </>
            )}
            <input type="file" style={{display:'none'}} onChange={handleUpload} accept=".pdf,.png,.jpg,.jpeg" disabled={uploading}/>
          </label>
        </div>
      </div>

      {error && <div className="alert alert--error" style={{marginBottom:20}}>{error}</div>}

      {docs.length === 0 ? (
        <div className="section-card" style={{padding:'60px 20px',textAlign:'center'}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'rgba(34,197,94,0.1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <h3 style={{fontSize:18,fontWeight:700,color:'#111827',marginBottom:8}}>Your vault is empty</h3>
          <p style={{color:'#6b7280',maxWidth:400,margin:'0 auto 20px'}}>Keep all your important financial documents in one secure place. Upload your first document to get started.</p>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',gap:20}}>
          {docs.map(doc => (
            <div key={doc._id} style={{background:'rgba(255,255,255,0.85)',border:'1px solid rgba(0,0,0,0.06)',borderRadius:12,padding:'20px',boxShadow:'0 4px 12px rgba(0,0,0,0.03)',display:'flex',flexDirection:'column',gap:16,transition:'transform 0.2s, boxShadow 0.2s'}}>
              <div style={{display:'flex',gap:14,alignItems:'flex-start'}}>
                <div style={{width:48,height:48,borderRadius:10,background:doc.type==='PDF'?'rgba(239,68,68,0.1)':'rgba(59,130,246,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {doc.type==='PDF' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  )}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <h4 style={{fontSize:14,fontWeight:600,color:'#111827',margin:'0 0 4px 0',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}} title={doc.name || doc.title}>{doc.name || doc.title || 'Untitled Document'}</h4>
                  <p style={{fontSize:12,color:'#6b7280',margin:0}}>Added {doc.createdAt || doc.uploadedAt ? new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString() : 'Unknown Date'}</p>
                </div>
              </div>
              
              <div style={{display:'flex',gap:10}}>
                <button 
                  onClick={() => handleView(doc)}
                  style={{flex:1,padding:'8px',background:'rgba(34,197,94,0.1)',border:'none',borderRadius:8,color:'#166534',fontSize:12,fontWeight:600,cursor:'pointer'}}
                >
                  View
                </button>
                <button onClick={() => handleDelete(doc.id || doc._id)} style={{width:34,height:34,background:'rgba(239,68,68,0.05)',border:'none',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#ef4444'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
