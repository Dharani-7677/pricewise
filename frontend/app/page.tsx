import Link from "next/link";

const FEATURES = [
  { icon: "📉", title: "Real-Time Price Tracking", desc: "We check prices every hour from Amazon, Flipkart & Meesho automatically." },
  { icon: "🔔", title: "Instant Price Drop Alerts", desc: "Set your target price. Get an email the moment the price drops below it." },
  { icon: "🤖", title: "AI Deal Checker", desc: "Claude AI analyzes the deal and tells you if it's really worth buying right now." },
  { icon: "📊", title: "Price History Charts", desc: "See the full price history graph so you never get fooled by fake discounts." },
  { icon: "🔀", title: "Multi-Platform Compare", desc: "Compare the same product across Amazon, Flipkart and Meesho side by side." },
  { icon: "🌍", title: "Community Deals Feed", desc: "Real users share hot deals. Upvote the best ones for the community." },
];

const STEPS = [
  { number: "01", title: "Add a Product", desc: "Paste any Amazon, Flipkart or Meesho product URL." },
  { number: "02", title: "Set Your Price Alert", desc: "Tell us the price you want to pay. We'll watch it for you." },
  { number: "03", title: "Get Notified & Save", desc: "Receive an email alert the moment the price drops. Buy at the right time!" },
];

const STATS = [
  { value: "10,000+", label: "Products Tracked" },
  { value: "₹50L+", label: "Savings Generated" },
  { value: "3", label: "Platforms Supported" },
  { value: "99%", label: "Alert Accuracy" },
];

const PLATFORMS = [
  { name: "Amazon", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", emoji: "🟠" },
  { name: "Flipkart", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", emoji: "🔵" },
  { name: "Meesho", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20", emoji: "🩷" },
];

export default function HomePage() {
  return (
    <div className="hero-bg min-h-screen">

      {/* HERO */}
      <section className="page-container pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6 animate-fade-in">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
          AI-Powered Price Intelligence for India 🇮🇳
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#f1f5f9] leading-tight mb-6">
          Never Overpay <span className="gradient-text">Online</span> Again.
        </h1>

        <p className="text-lg text-[#94a3b8] max-w-2xl mx-auto mb-10">
          PriceWise tracks prices across Amazon, Flipkart &amp; Meesho. Get instant alerts when prices drop and let AI tell you if it&apos;s the right time to buy.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/dashboard" className="btn-primary text-base px-8 py-4">
            🚀 Start Tracking Free
          </Link>
          <Link href="/compare" className="btn-secondary text-base px-8 py-4">
            🔀 Compare Prices
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="text-[#94a3b8] text-sm">Tracks prices on:</span>
          {PLATFORMS.map((p) => (
            <span key={p.name} className={`badge ${p.bg} ${p.color} border px-3 py-1 text-sm`}>
              {p.emoji} {p.name}
            </span>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-[#334155] bg-[#1e293b]/50 py-10">
        <div className="page-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 stagger">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold text-[#6366f1] mb-1">{stat.value}</div>
                <div className="text-[#94a3b8] text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="page-container py-20">
        <div className="text-center mb-14">
          <h2 className="section-title text-3xl">How PriceWise Works</h2>
          <p className="section-subtitle mt-2">Start saving money in 3 simple steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger">
          {STEPS.map((step, i) => (
            <div key={i} className="card-hover text-center relative">
              <div className="text-5xl font-black text-[#6366f1]/20 mb-4">{step.number}</div>
              <h3 className="text-lg font-bold text-[#f1f5f9] mb-2">{step.title}</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">{step.desc}</p>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-[#334155] text-2xl z-10">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-[#1e293b]/30 py-20">
        <div className="page-container">
          <div className="text-center mb-14">
            <h2 className="section-title text-3xl">Everything You Need to Shop Smart</h2>
            <p className="section-subtitle mt-2">Powerful features to make every purchase count</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
            {FEATURES.map((feature, i) => (
              <div key={i} className="card-hover group">
                <div className="text-4xl mb-4 group-hover:animate-float inline-block">{feature.icon}</div>
                <h3 className="text-[#f1f5f9] font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI SECTION */}
      <section className="page-container py-20">
        <div className="glass-card p-10 flex flex-col lg:flex-row items-center gap-10 glow-indigo">
          <div className="flex-1">
            <div className="badge-indigo mb-4">🤖 AI-Powered</div>
            <h2 className="text-3xl font-extrabold text-[#f1f5f9] mb-4">
              Meet Your AI <span className="gradient-text">Deal Analyst</span>
            </h2>
            <p className="text-[#94a3b8] mb-6 leading-relaxed">
              Our Claude AI analyzes the deal quality, checks historical price trends, and gives you a{" "}
              <strong className="text-[#f1f5f9]">Smart Buy Score (1–10)</strong> so you always know the perfect time to buy.
            </p>
            <ul className="space-y-2 text-sm text-[#94a3b8]">
              <li>✅ Is this the lowest price ever?</li>
              <li>✅ Is the discount real or fake?</li>
              <li>✅ Should I wait for a bigger sale?</li>
              <li>✅ How does it compare across platforms?</li>
            </ul>
            <Link href="/dashboard" className="btn-primary inline-block mt-8">
              Try AI Deal Checker →
            </Link>
          </div>

          <div className="flex-1 w-full max-w-sm mx-auto">
            <div className="card border-indigo-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-xl">🤖</div>
                <div>
                  <div className="text-sm font-semibold text-[#f1f5f9]">AI Deal Analysis</div>
                  <div className="text-xs text-[#94a3b8]">Powered by Claude</div>
                </div>
              </div>
              <div className="bg-[#0f172a] rounded-xl p-4 mb-4 text-center">
                <div className="text-5xl font-black text-[#6366f1] mb-1">8.5</div>
                <div className="text-xs text-[#94a3b8]">Smart Buy Score</div>
                <div className="flex justify-center gap-1 mt-2">
                  {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                    <div key={n} className={`w-4 h-2 rounded-full ${n <= 8 ? "bg-[#6366f1]" : "bg-[#334155]"}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-[#94a3b8] leading-relaxed">
                💡 <strong className="text-[#f1f5f9]">Great time to buy!</strong> This is the lowest price in 90 days. The discount is genuine.
              </p>
              <div className="flex gap-2 mt-4">
                <span className="badge-success">✓ Lowest Price</span>
                <span className="badge-indigo">📉 Down 32%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-600/20 border-y border-indigo-500/20 py-16">
        <div className="page-container text-center">
          <h2 className="text-3xl font-extrabold text-[#f1f5f9] mb-4">Ready to Start Saving Money? 💰</h2>
          <p className="text-[#94a3b8] mb-8 max-w-xl mx-auto">
            Join thousands of smart shoppers who never pay full price. It&apos;s free. No account needed to start.
          </p>
          <Link href="/dashboard" className="btn-primary text-base px-10 py-4">
            🚀 Track Your First Product — It&apos;s Free
          </Link>
        </div>
      </section>

    </div>
  );
}