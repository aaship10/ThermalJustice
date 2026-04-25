import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/shared/NavBar.jsx';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        const res = await fetch('http://127.0.0.1:8000/api/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.detail || 'Failed to fetch history');
        setHistory(data.history || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0a0f18] text-white pt-24 px-8 pb-12 overflow-y-auto w-full relative z-10">
      <NavBar activeTab={undefined} />
      
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#0D9488]/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#4575B4]/10 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-20">
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-display)' }}>
              Optimization History
            </h1>
            <p className="text-[#94A3B8] text-sm mt-2">
              Review and restore your past urban heat interventions.
            </p>
          </div>
          <button
            onClick={() => navigate('/app')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#0D9488]/40 bg-[#0D9488]/10 text-[#2DD4BF] hover:bg-[#0D9488]/20 transition-colors shadow-[0_4px_12px_rgba(13,148,136,0.2)]"
          >
            New Optimization
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#94A3B8] animate-pulse">Loading past strategies...</div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-500/20 text-red-200 border border-red-500/30 text-center">
            {error}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 text-[#94A3B8] italic p-12 rounded-2xl bg-white/5 border border-white/5">
            You haven't run any optimizations yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((record) => {
              const date = new Date(record.createdat);
              return (
                <div 
                  key={record.id}
                  className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl transition-transform hover:-translate-y-1 hover:border-[#0D9488]/30 flex flex-col relative overflow-hidden group"
                  style={{ backdropFilter: 'blur(20px)' }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-teal-500/20 transition-all pointer-events-none" />
                  
                  <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold mb-3 flex items-center justify-between border-b border-white/10 pb-3">
                    <span>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>{date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  
                  <div className="flex-1 mb-6 mt-2">
                    <div className="text-[#94A3B8] text-[10px] uppercase tracking-wider mb-1">Target Area</div>
                    <h3 className="text-xl font-bold text-teal-400 capitalize mb-4 truncate" title={record.location.replace('pmc-', '').replace('pcmc-', '').replace(/-/g, ' ')}>
                      {record.location.replace('pmc-', '').replace('pcmc-', '').replace(/-/g, ' ')}
                    </h3>
                    
                    <div className="text-[#94A3B8] text-[10px] uppercase tracking-wider mb-1">Allocated Budget</div>
                    <div className="flex items-baseline gap-1 bg-black/20 self-start inline-block px-3 py-1.5 rounded-lg border border-white/5 shadow-inner">
                      <span className="text-teal-400 font-bold text-lg pointer-events-none">₹</span>
                      <span className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-mono)' }}>{record.budget}</span>
                      <span className="text-[#94A3B8] font-bold text-sm pointer-events-none">Cr</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/app?location=${encodeURIComponent(record.location)}&budget=${record.budget}`)}
                    className="w-full py-3 mt-auto rounded-xl text-[13px] font-bold tracking-wide uppercase transition-all bg-[#0D9488]/20 text-[#2DD4BF] border border-[#0D9488]/50 hover:bg-gradient-to-r hover:from-[#0D9488] hover:to-[#1A3C5E] hover:text-white hover:border-transparent hover:shadow-[0_4px_15px_rgba(13,148,136,0.5)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    View Portfolio
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
