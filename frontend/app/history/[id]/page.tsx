"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getProduct, getPriceHistory } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

type FilterType = "1M" | "3M" | "MAX";
interface PricePoint { id: string; product_id: string; price: number; checked_at: string; }
interface ProductType { id: string; name: string; url: string; current_price: number; original_price?: number; platform: string; }
interface AiAnalysis { recommendation: "BUY" | "WAIT"; confidence: "High" | "Medium" | "Low"; reason: string; savings_tip: string; }

function filterHistory(data: PricePoint[], filter: FilterType): PricePoint[] {
  if (filter === "MAX") return data;
  const days = filter === "1M" ? 30 : 90;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return data.filter((d) => new Date(d.checked_at) >= cutoff);
}
function formatDate(s: string) { return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short" }); }
function formatPrice(p: number) { return "₹" + p.toLocaleString("en-IN"); }

export default function HistoryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [product, setProduct] = useState<ProductType | null>(null);
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [filter, setFilter] = useState<FilterType>("MAX");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiAnalysis | null>(null);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      try {
        const [prod, hist] = await Promise.all([getProduct(id), getPriceHistory(id)]);
        setProduct(prod);
        setHistory(hist);
      } catch (err) {
        console.error(err);
        setError("Could not load product data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const filtered = filterHistory(history, filter);
  const chartData = filtered.map((h) => ({ date: formatDate(h.checked_at), price: h.price }));
  const prices = filtered.map((h) => h.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const avgPrice = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;

  async function handleAiAnalysis() {
    if (!product) return;
    setAiLoading(true);
    setAiError("");
    setAiResult(null);
    try {
      const res = await fetch("http://localhost:5000/api/ai/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product.name,
          currentPrice: product.current_price,
          highPrice: maxPrice,
          lowPrice: minPrice,
          avgPrice: avgPrice,
          priceHistory: history.map((h) => ({ date: h.checked_at, price: h.price })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiResult(data.analysis);
      } else {
        setAiError(data.error || "AI analysis failed.");
      }
    } catch (err) {
      console.error(err);
      setAiError("AI analysis failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) return (
    <ProtectedRoute>
      <div className="page-container">
        <div className="card text-center py-20">
          <p className="text-[#94a3b8]">Loading...</p>
        </div>
      </div>
    </ProtectedRoute>
  );

  if (error || !product) return (
    <ProtectedRoute>
      <div className="page-container">
        <div className="card text-center py-20">
          <p className="text-red-400">{error || "Not found."}</p>
          <button onClick={() => router.back()} className="btn-secondary mt-4">Go Back</button>
        </div>
      </div>
    </ProtectedRoute>
  );

  const currentVsAvg = avgPrice > 0 ? (((product.current_price - avgPrice) / avgPrice) * 100).toFixed(1) : "0";
  const currentVsMin = minPrice > 0 ? (((product.current_price - minPrice) / minPrice) * 100).toFixed(1) : "0";

  return (
    <ProtectedRoute>
      <div className="page-container">

        <div className="mb-6">
          <button onClick={() => router.back()} className="text-[#94a3b8] hover:text-[#f1f5f9] text-sm mb-4 flex items-center gap-1">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-[#f1f5f9] leading-snug">{product.name}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-3xl font-black text-[#f1f5f9]">{formatPrice(product.current_price)}</span>
            {product.original_price && product.original_price > product.current_price && (
              <>
                <span className="text-[#94a3b8] line-through text-lg">{formatPrice(product.original_price)}</span>
                <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-sm px-2 py-0.5 rounded-full">
                  {Math.round(((product.original_price - product.current_price) / product.original_price) * 100)}% off
                </span>
              </>
            )}
            <Link href={product.url} target="_blank" className="text-[#6366f1] hover:underline text-sm">
              View on Amazon →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="card text-center py-4">
            <p className="text-[#94a3b8] text-xs mb-1">Current</p>
            <p className="text-[#f1f5f9] font-bold text-lg">{formatPrice(product.current_price)}</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-[#94a3b8] text-xs mb-1">Lowest</p>
            <p className="text-green-400 font-bold text-lg">{formatPrice(minPrice)}</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-[#94a3b8] text-xs mb-1">Highest</p>
            <p className="text-red-400 font-bold text-lg">{formatPrice(maxPrice)}</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-[#94a3b8] text-xs mb-1">Average</p>
            <p className="text-[#6366f1] font-bold text-lg">{formatPrice(avgPrice)}</p>
          </div>
        </div>

        <div className="card mb-6 flex flex-wrap gap-6">
          <div>
            <p className="text-[#94a3b8] text-xs mb-1">vs Average</p>
            <p className={parseFloat(currentVsAvg) <= 0 ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
              {parseFloat(currentVsAvg) <= 0 ? "▼" : "▲"} {Math.abs(parseFloat(currentVsAvg))}%
            </p>
          </div>
          <div>
            <p className="text-[#94a3b8] text-xs mb-1">vs All-time Low</p>
            <p className={parseFloat(currentVsMin) <= 5 ? "text-green-400 font-semibold" : "text-orange-400 font-semibold"}>
              ▲ {Math.abs(parseFloat(currentVsMin))}% above lowest
            </p>
          </div>
          <div>
            <p className="text-[#94a3b8] text-xs mb-1">Data Points</p>
            <p className="text-[#f1f5f9] font-semibold">{history.length} checks</p>
          </div>
        </div>

        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-[#f1f5f9] font-bold text-lg">Price History</h2>
            <div className="flex gap-2">
              {(["1M", "3M", "MAX"] as FilterType[]).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={filter === f
                    ? "px-3 py-1 rounded-lg text-sm font-medium bg-[#6366f1] text-white"
                    : "px-3 py-1 rounded-lg text-sm font-medium text-[#94a3b8] border border-[#334155] hover:border-[#6366f1] transition-colors"
                  }>
                  {f}
                </button>
              ))}
            </div>
          </div>
          {chartData.length === 0 ? (
            <div className="text-center py-12 text-[#94a3b8]">No data for this period</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11, fill: "#94a3b8" }} interval="preserveStartEnd" />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v: number) => "₹" + (v / 1000).toFixed(0) + "k"} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9" }} formatter={(value: number) => [formatPrice(value), "Price"]} />
                  <Area type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2} fill="url(#priceGrad)" dot={false} activeDot={{ r: 4, fill: "#6366f1" }} />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-[#94a3b8] text-xs text-right mt-2">{chartData.length} data points shown</p>
            </>
          )}
        </div>

        <div className="card mb-6">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
            <div>
              <h2 className="text-[#f1f5f9] font-bold text-lg">🤖 AI Deal Analysis</h2>
              <p className="text-[#94a3b8] text-sm">Smart buy/wait recommendation based on price trend</p>
            </div>
            <button onClick={handleAiAnalysis} disabled={aiLoading}
              className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {aiLoading ? "⏳ Analysing..." : "✨ Analyse Deal"}
            </button>
          </div>

          {!aiResult && !aiError && !aiLoading && (
            <p className="text-[#94a3b8] text-sm text-center py-4">
              Click "Analyse Deal" to get an AI-powered buy/wait recommendation
            </p>
          )}

          {aiError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-3">
              <p className="text-red-400 text-sm">{aiError}</p>
            </div>
          )}

          {aiResult && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={aiResult.recommendation === "BUY"
                  ? "text-2xl font-black text-green-400 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-xl"
                  : "text-2xl font-black text-orange-400 bg-orange-500/10 border border-orange-500/30 px-4 py-2 rounded-xl"}>
                  {aiResult.recommendation === "BUY" ? "🟢 BUY NOW" : "🟡 WAIT"}
                </span>
                <span className={
                  aiResult.confidence === "High" ? "text-sm text-green-400 border border-green-500/20 bg-green-500/10 px-3 py-1 rounded-full" :
                  aiResult.confidence === "Medium" ? "text-sm text-yellow-400 border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 rounded-full" :
                  "text-sm text-gray-400 border border-gray-500/20 bg-gray-500/10 px-3 py-1 rounded-full"}>
                  {aiResult.confidence} Confidence
                </span>
              </div>
              <div className="bg-[#0f172a] rounded-lg p-4 border border-[#334155]">
                <p className="text-[#94a3b8] text-xs mb-1 font-medium uppercase tracking-wide">Analysis</p>
                <p className="text-[#f1f5f9] text-sm leading-relaxed">{aiResult.reason}</p>
              </div>
              <div className="bg-[#6366f1]/10 rounded-lg p-4 border border-[#6366f1]/20">
                <p className="text-[#6366f1] text-xs mb-1 font-medium uppercase tracking-wide">💡 Tip</p>
                <p className="text-[#f1f5f9] text-sm leading-relaxed">{aiResult.savings_tip}</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </ProtectedRoute>
  );
}