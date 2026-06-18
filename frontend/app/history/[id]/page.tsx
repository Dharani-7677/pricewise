"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { 
  ArrowLeft, 
  Bell, 
  ExternalLink, 
  TrendingDown, 
  TrendingUp, 
  Info, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ShieldCheck
} from "lucide-react";
import { getProduct, getPriceHistory, getDealAnalysis, Product, PriceHistoryEntry, DealAnalysis } from "@/lib/api";

function getDiscount(cur: number, ori: number) {
  if (!ori || ori === 0) return 0;
  return Math.round(((ori - cur) / ori) * 100);
}

function getPlatformEmoji(p: string) {
  const plat = (p || "").toLowerCase();
  if (plat === "amazon") return "🟠";
  if (plat === "flipkart") return "🔵";
  if (plat === "meesho") return "🩷";
  return "🛍️";
}

function formatChartDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatDateFull(dateStr: string) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function getBadgeClass(type: string) {
  if (type === "success") return "bg-green-500/10 text-green-400 border border-green-500/20";
  if (type === "danger") return "bg-red-500/10 text-red-400 border border-red-500/20";
  if (type === "warning") return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
  return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
}

function getScoreColor(score: number) {
  if (score >= 8) return "text-green-400";
  if (score >= 6) return "text-indigo-400";
  if (score >= 4) return "text-amber-400";
  return "text-red-400";
}

function getVerdictInfo(score: number) {
  if (score >= 8) return { label: "YES", color: "bg-green-500", text: "Excellent time to buy!" };
  if (score >= 6) return { label: "OKAY", color: "bg-indigo-500", text: "Good deal, worth it." };
  if (score >= 4) return { label: "WAIT", color: "bg-amber-500", text: "Consider waiting for a drop." };
  return { label: "SKIP", color: "bg-red-500", text: "Price is too high right now." };
}

export default function HistoryPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<PriceHistoryEntry[]>([]);
  const [analysis, setAnalysis] = useState<DealAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg("");
      try {
        const [productData, historyData, analysisData] = await Promise.all([
          getProduct(productId),
          getPriceHistory(productId),
          getDealAnalysis(productId).catch(function () { return null; }),
        ]);

        setProduct(productData);
        setHistory(historyData);
        setAnalysis(analysisData);
      } catch (err) {
        console.error(err);
        setErrorMsg("Could not load price history. Is the backend running?");
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadData();
    }
  }, [productId]);

  // Calculations
  const stats = useMemo(() => {
    if (!product) return null;

    const allPrices = history.length > 0 
      ? history.map(h => h.price) 
      : [product.current_price];
    
    if (history.length === 0) {
      return {
        minPrice: product.current_price,
        maxPrice: product.current_price,
        avgPrice: product.current_price,
        minDate: product.created_at,
        maxDate: product.created_at,
        daysTracked: 1
      };
    }

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const avgPrice = Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length);

    const minEntry = history.reduce((prev, curr) => (prev.price <= curr.price ? prev : curr), history[0]);
    const maxEntry = history.reduce((prev, curr) => (prev.price >= curr.price ? prev : curr), history[0]);

    // Calculate days tracked
    const firstDate = new Date(history[0].checked_at);
    const lastDate = new Date();
    const diffTime = Math.abs(lastDate.getTime() - firstDate.getTime());
    const daysTracked = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      minPrice,
      maxPrice,
      avgPrice,
      minDate: minEntry.checked_at,
      maxDate: maxEntry.checked_at,
      daysTracked
    };
  }, [product, history]);

  const chartData = useMemo(() => {
    if (!product) return [];
    if (history.length === 0) {
      return [{
        date: formatChartDate(product.created_at),
        price: product.current_price,
      }];
    }
    return history.map(h => ({
      date: formatChartDate(h.checked_at),
      price: h.price,
    }));
  }, [product, history]);

  if (loading) {
    return (
      <div className="page-container p-6 lg:p-10 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#94a3b8] animate-pulse font-medium">Fetching history from Supabase...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !product || !stats) {
    return (
      <div className="page-container p-6 lg:p-10">
        <div className="bg-[#1e293b] border border-red-500/30 rounded-2xl text-center py-20 shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-50" />
          <p className="text-red-400 font-bold text-xl mb-2">{errorMsg || "Product not found."}</p>
          <p className="text-[#94a3b8] mb-8 max-w-md mx-auto">We couldn't find the product details or history. Please try again or head back to the dashboard.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-3 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl transition-all font-bold shadow-lg shadow-[#6366f1]/20">
            <ArrowLeft size={20} /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const verdict = getVerdictInfo(analysis?.score || 5);
  const discount = getDiscount(product.current_price, product.original_price);
  const scorePosition = ((analysis?.score || 5) / 10) * 100;

  return (
    <div className="page-container p-6 lg:p-10 pb-32">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-8 bg-[#1e293b]/50 self-start px-4 py-2 rounded-full border border-[#334155]">
        <Link href="/dashboard" className="text-[#94a3b8] hover:text-[#f1f5f9] text-xs transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <span className="text-[#334155]">/</span>
        <span className="text-[#f1f5f9] text-xs font-bold uppercase tracking-wider">Price History</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div className="flex gap-6 items-start">
          <div className="w-24 h-24 bg-white rounded-2xl p-2 flex items-center justify-center shrink-0 shadow-xl border border-[#334155]">
            <img src={product.image_url} alt={product.name} className="max-h-full object-contain" />
          </div>
          <div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border ${
              product.platform === 'amazon' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
              product.platform === 'flipkart' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
              'bg-pink-500/10 text-pink-400 border-pink-500/20'
            }`}>
              {getPlatformEmoji(product.platform)} {product.platform}
            </div>
            <h1 className="text-3xl font-black text-[#f1f5f9] mb-2 leading-tight max-w-2xl">{product.name}</h1>
            <div className="flex items-center gap-4 text-[#94a3b8] text-sm">
              <span className="flex items-center gap-1"><Calendar size={14} /> Tracking for {stats.daysTracked} days</span>
              <span className="flex items-center gap-1"><Info size={14} /> {history.length} checkpoints</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={"/alerts?product=" + product.id} className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e293b] hover:bg-[#334155] text-white border border-[#334155] rounded-xl text-sm transition-all font-bold group">
            <Bell size={18} className="text-[#6366f1] group-hover:scale-110 transition-transform" /> Set Alert
          </Link>
          <Link href={product.url} target="_blank" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:from-[#4f46e5] hover:to-[#4338ca] text-white rounded-xl text-sm transition-all font-bold shadow-lg shadow-[#6366f1]/20">
            View on Store <ExternalLink size={18} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Chart */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Should you buy section */}
          <div className="bg-[#1e293b] p-8 rounded-3xl border border-[#334155] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#6366f1]"></div>
            <h2 className="text-xl font-black text-[#f1f5f9] mb-8 flex items-center gap-2">
              <ShieldCheck className="text-[#6366f1]" /> Should you buy at this price?
            </h2>
            
            <div className="relative mb-12 px-4">
              {/* Slider Bar */}
              <div className="h-4 w-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500 relative">
                {/* Score Labels */}
                <div className="absolute -bottom-7 left-0 text-[10px] font-black text-red-500 uppercase tracking-widest">Skip</div>
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-black text-amber-500 uppercase tracking-widest">Wait</div>
                <div className="absolute -bottom-7 right-0 text-[10px] font-black text-green-500 uppercase tracking-widest">Yes</div>
              </div>
              
              {/* Indicator */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-out"
                style={{ left: `${scorePosition}%` }}
              >
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full ${verdict.color} border-4 border-[#1e293b] shadow-2xl flex items-center justify-center font-black text-[10px] text-white`}>
                    {analysis?.score || 5}
                  </div>
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-black px-3 py-1 rounded-lg text-xs font-black shadow-xl">
                    {verdict.label}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-[#0f172a]/50 p-5 rounded-2xl border border-[#334155]/50 mt-4">
              <p className="text-[#f1f5f9] font-bold text-lg mb-1">{verdict.text}</p>
              <p className="text-[#94a3b8] text-sm leading-relaxed">{analysis?.recommendation || "Based on current market trends and historical data."}</p>
            </div>
          </div>

          {/* 2. Enhanced Chart section */}
          <div className="bg-[#1e293b] p-8 rounded-3xl border border-[#334155] shadow-xl">
            <h2 className="text-xl font-black text-[#f1f5f9] mb-6 flex items-center gap-2">
              <TrendingDown className="text-[#6366f1]" /> Price History Trend
            </h2>

            {/* Gradient Bar Above Chart */}
            <div className="mb-8 bg-[#0f172a] p-1 rounded-2xl border border-[#334155]">
              <div className="h-3 w-full rounded-xl bg-gradient-to-r from-green-500 via-amber-500 to-red-500 relative mb-4"></div>
              <div className="flex justify-between items-center px-4 pb-3">
                <div className="text-center">
                  <div className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Lowest</div>
                  <div className="text-lg font-black text-[#f1f5f9]">₹{stats.minPrice.toLocaleString("en-IN")}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Average</div>
                  <div className="text-lg font-black text-[#f1f5f9]">₹{stats.avgPrice.toLocaleString("en-IN")}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Highest</div>
                  <div className="text-lg font-black text-[#f1f5f9]">₹{stats.maxPrice.toLocaleString("en-IN")}</div>
                </div>
              </div>
            </div>

            {chartData.length === 1 ? (
              <div className="text-center py-20 bg-[#0f172a]/50 rounded-2xl border-2 border-dashed border-[#334155]">
                <HelpCircle className="w-12 h-12 text-[#94a3b8] mx-auto mb-4 opacity-30" />
                <p className="text-[#f1f5f9] font-bold">Only one price point recorded</p>
                <p className="text-[#94a3b8] text-xs mt-2 max-w-xs mx-auto">We need at least two price checks to show a trend chart. Check back in a few hours!</p>
              </div>
            ) : (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.4} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                      axisLine={{ stroke: "#334155" }}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                      axisLine={{ stroke: "#334155" }}
                      tickLine={false}
                      tickFormatter={(v) => "₹" + (v >= 1000 ? (v/1000).toFixed(1) + "k" : v)}
                      width={45}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "16px",
                        color: "#f1f5f9",
                        fontSize: "12px",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                        padding: "12px"
                      }}
                      itemStyle={{ color: "#6366f1", fontWeight: "900" }}
                      labelStyle={{ color: "#94a3b8", marginBottom: "8px", fontWeight: "700" }}
                      formatter={(value: number) => ["₹" + value.toLocaleString("en-IN"), "Price"]}
                    />
                    <ReferenceLine 
                      y={stats.avgPrice} 
                      stroke="#fbbf24" 
                      strokeDasharray="5 5" 
                      label={{ position: 'right', value: 'AVG', fill: '#fbbf24', fontSize: 10, fontWeight: 900 }} 
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#6366f1"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* 3. Price Stats section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1e293b] p-6 rounded-3xl border border-[#334155] shadow-lg relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-green-500/5 rounded-full group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-xs font-black text-[#94a3b8] uppercase tracking-widest">Lowest Ever</span>
              </div>
              <div className="text-2xl font-black text-green-400 mb-1">₹{stats.minPrice.toLocaleString("en-IN")}</div>
              <div className="text-[10px] text-[#94a3b8] font-bold">On {formatDateFull(stats.minDate)}</div>
            </div>

            <div className="bg-[#1e293b] p-6 rounded-3xl border border-[#334155] shadow-lg relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-500/5 rounded-full group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Info className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-xs font-black text-[#94a3b8] uppercase tracking-widest">Average Price</span>
              </div>
              <div className="text-2xl font-black text-amber-400 mb-1">₹{stats.avgPrice.toLocaleString("en-IN")}</div>
              <div className="text-[10px] text-[#94a3b8] font-bold">Based on {history.length} price checks</div>
            </div>

            <div className="bg-[#1e293b] p-6 rounded-3xl border border-[#334155] shadow-lg relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-red-500/5 rounded-full group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-xs font-black text-[#94a3b8] uppercase tracking-widest">Highest Ever</span>
              </div>
              <div className="text-2xl font-black text-red-400 mb-1">₹{stats.maxPrice.toLocaleString("en-IN")}</div>
              <div className="text-[10px] text-[#94a3b8] font-bold">On {formatDateFull(stats.maxDate)}</div>
            </div>
          </div>

        </div>

        {/* Right Column: Analysis & Summary */}
        <div className="space-y-8">
          
          {/* AI Analysis Card */}
          <div className="bg-[#1e293b] p-8 rounded-3xl border border-[#334155] shadow-xl">
            <h2 className="text-xl font-black text-[#f1f5f9] mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#6366f1] animate-pulse"></div>
              AI Insights
            </h2>

            {analysis ? (
              <>
                <div className="bg-[#0f172a] rounded-2xl p-6 mb-6 text-center border border-[#334155]/50 shadow-inner">
                  <div className={"text-6xl font-black mb-2 " + getScoreColor(analysis.score)}>
                    {analysis.score}
                  </div>
                  <div className="text-[10px] text-[#94a3b8] uppercase font-black tracking-widest mb-4">Smart Buy Score / 10</div>
                  <div className="flex justify-center gap-1.5">
                    {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                      <div
                        key={n}
                        className={"w-full h-1.5 rounded-full transition-all duration-700 " + (n <= analysis.score ? "bg-[#6366f1] shadow-[0_0_10px_rgba(99,102,241,0.6)]" : "bg-[#334155]")}
                        style={{ transitionDelay: `${n * 50}ms` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-[#f1f5f9] font-black mb-1">{analysis.verdict}</p>
                      <p className="text-xs text-[#94a3b8] leading-relaxed">{analysis.recommendation}</p>
                    </div>
                  </div>

                  {analysis.reasons.length > 0 && (
                    <div className="bg-[#0f172a]/30 p-4 rounded-2xl border border-[#334155]/30">
                      <ul className="space-y-3">
                        {analysis.reasons.map((reason, i) => (
                          <li key={i} className="flex gap-2 text-[11px] text-[#94a3b8] leading-tight">
                            <span className="text-[#6366f1] font-black">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap pt-2">
                    {analysis.badges.map((badge, i) => (
                      <span key={i} className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getBadgeClass(badge.type)}`}>
                        {badge.label}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-[#0f172a]/50 rounded-2xl border-2 border-dashed border-[#334155]">
                <p className="text-[#94a3b8] text-sm">AI Analysis is brewing...</p>
              </div>
            )}
          </div>

          {/* Price Summary Card */}
          <div className="bg-[#1e293b] p-8 rounded-3xl border border-[#334155] shadow-xl">
            <h2 className="text-xl font-black text-[#f1f5f9] mb-6 flex items-center gap-2">
              <TrendingDown className="text-[#6366f1]" /> Deal Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-end py-3 border-b border-[#334155]/30">
                <span className="text-sm font-bold text-[#94a3b8]">Original Price</span>
                <span className="text-lg font-black text-[#94a3b8] line-through">₹{product.original_price.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-end py-3 border-b border-[#334155]/30">
                <span className="text-sm font-bold text-[#94a3b8]">Current Price</span>
                <span className="text-2xl font-black text-[#6366f1]">₹{product.current_price.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#94a3b8]">Savings</span>
                  <span className="text-lg font-black text-green-400">₹{(product.original_price - product.current_price).toLocaleString("en-IN")}</span>
                </div>
                <div className="px-4 py-2 bg-green-500/10 rounded-xl border border-green-500/20">
                  <span className="text-xl font-black text-green-400">{discount}% OFF</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Sticky Buy Now Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <Link 
          href={product.url} 
          target="_blank" 
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#6366f1] to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white rounded-2xl font-black shadow-[0_15px_30px_-10px_rgba(99,102,241,0.5)] transition-all hover:scale-105 active:scale-95 group"
        >
          <span className="text-lg">Buy @ {product.platform === 'amazon' ? 'amazon.in' : product.platform === 'flipkart' ? 'flipkart.com' : product.platform}</span>
          <ExternalLink size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </Link>
      </div>

    </div>
  );
}
