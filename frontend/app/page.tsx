'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState({ products: 0, savings: 0, users: 0 });

  useEffect(() => {
    setMounted(true);
    const targets = { products: 50000, savings: 2500000, users: 12000 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount({
        products: Math.round(targets.products * ease),
        savings:  Math.round(targets.savings  * ease),
        users:    Math.round(targets.users    * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  // ✅ KEY FIX: Check login before redirecting
  async function handleStartTracking() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/signup');
    }
  }

  const features = [
    { icon: '📉', title: 'Real-Time Price Tracking', desc: 'Auto-scrape Amazon prices every 6 hours. Never miss a price drop again.' },
    { icon: '🔔', title: 'Smart Price Alerts', desc: 'Set your target price and get instant email alerts the moment it drops.' },
    { icon: '🤖', title: 'AI Deal Analysis', desc: 'Claude AI analyses price trends and tells you exactly when to buy or wait.' },
    { icon: '📊', title: 'Price History Charts', desc: 'Visual 1M / 3M / MAX charts to understand price trends at a glance.' },
    { icon: '⚡', title: 'Smart Compare', desc: 'Paste any Amazon URL and instantly compare prices across your tracked products.' },
    { icon: '🏘️', title: 'Community Deals', desc: 'Share hot deals with the community and upvote the best savings.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif', overflowX: 'hidden' }}>

      <style>{`
        @keyframes fadeUp   { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float    { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-12px); } }
        @keyframes pulse    { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        @keyframes gradMove { 0% { background-position:0% 50%; } 50% { background-position:100% 50%; } 100% { background-position:0% 50%; } }
        .fade-up  { animation: fadeUp 0.7s ease forwards; }
        .float    { animation: float 4s ease-in-out infinite; }
        .grad-btn {
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
          background-size: 200% 200%;
          animation: gradMove 3s ease infinite;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .grad-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(99,102,241,0.5); }
        .outline-btn { transition: all 0.2s; }
        .outline-btn:hover { background: #1e293b !important; border-color: #6366f1 !important; color: #fff !important; transform: translateY(-2px); }
        .feature-card { transition: all 0.25s; cursor: default; }
        .feature-card:hover { transform: translateY(-6px); border-color: #6366f1 !important; box-shadow: 0 8px 32px rgba(99,102,241,0.2); }
        .stat-card { transition: all 0.2s; }
        .stat-card:hover { transform: scale(1.04); }
        .glow { text-shadow: 0 0 40px rgba(99,102,241,0.6); }
        .badge { animation: pulse 2s ease-in-out infinite; }
      `}</style>

      {/* ── Hero ── */}
      <section style={{ padding: '80px 24px 80px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
          <div className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '999px', padding: '6px 16px', fontSize: '13px', color: '#a5b4fc', marginBottom: '32px' }}>
            <span style={{ width: '6px', height: '6px', background: '#6366f1', borderRadius: '50%', display: 'inline-block' }} />
            AI-Powered Price Intelligence for Indian Shoppers
          </div>

          <h1 className={`glow ${mounted ? 'fade-up' : ''}`}
            style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-1px' }}>
            Stop Overpaying.<br />
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Shop Smarter.
            </span>
          </h1>

          <p style={{ color: '#94a3b8', fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 60px' }}>
            PriceWise tracks Amazon prices 24/7, alerts you when prices drop, and uses AI to tell you the perfect time to buy.
          </p>

          {/* Floating product card */}
          <div className="float" style={{ display: 'inline-block', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px 28px', textAlign: 'left', maxWidth: '340px', width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '40px', height: '40px', background: '#0f172a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📱</div>
              <div>
                <p style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: 600 }}>Samsung Galaxy S25 Ultra</p>
                <p style={{ color: '#94a3b8', fontSize: '11px' }}>Amazon.in</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '11px', textDecoration: 'line-through' }}>₹1,29,999</p>
                <p style={{ color: '#6366f1', fontSize: '22px', fontWeight: 800 }}>₹99,999</p>
              </div>
              <div style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid #34d399', borderRadius: '8px', padding: '6px 12px', textAlign: 'center' }}>
                <p style={{ color: '#34d399', fontSize: '13px', fontWeight: 700 }}>23% OFF</p>
                <p style={{ color: '#34d399', fontSize: '10px' }}>↓ Price Drop!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section id="stats" style={{ padding: '60px 24px', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'center' }}>
          {[
            { value: `${(count.products/1000).toFixed(0)}K+`, label: 'Products Tracked', color: '#6366f1' },
            { value: `₹${(count.savings/100000).toFixed(1)}L+`, label: 'Total Savings', color: '#34d399' },
            { value: `${(count.users/1000).toFixed(0)}K+`, label: 'Happy Users', color: '#a855f7' },
          ].map(({ value, label, color }) => (
            <div key={label} className="stat-card" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '28px' }}>
              <p style={{ color, fontSize: '40px', fontWeight: 900, marginBottom: '8px' }}>{value}</p>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ color: '#6366f1', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Everything You Need</p>
            <h2 style={{ color: '#f1f5f9', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, marginBottom: '16px' }}>Built for Smart Indian Shoppers</h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>From tracking to AI insights — everything to make sure you always get the best deal.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="feature-card"
                style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '28px' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(99,102,241,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '16px' }}>
                  {icon}
                </div>
                <h3 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.15))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '24px', padding: '60px 40px', textAlign: 'center' }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, marginBottom: '16px' }}>
            Ready to Save Money? 💰
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '36px', lineHeight: 1.6 }}>
            Join thousands of smart shoppers who never overpay on Amazon. Free forever.
          </p>

          {/* ✅ FIXED BUTTON */}
          <button
            onClick={handleStartTracking}
            className="grad-btn"
            style={{ color: '#fff', border: 'none', borderRadius: '12px', padding: '16px 40px', fontSize: '17px', fontWeight: 700, cursor: 'pointer' }}
          >
            🚀 Start Tracking for Free
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #1e293b', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>💰</div>
          <span style={{ fontWeight: 700, fontSize: '15px' }}>Price<span style={{ color: '#6366f1' }}>Wise</span></span>
        </div>
        <p style={{ color: '#475569', fontSize: '13px' }}>© 2026 PriceWise. Built for smart Indian shoppers. 🇮🇳</p>
      </footer>

    </div>
  );
}