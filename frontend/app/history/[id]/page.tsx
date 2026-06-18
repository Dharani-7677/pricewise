"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
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
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
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

  if (loading) {
    return (
      <div className="page-container p-6 lg:p-10">
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl text-center py-20">
          <p className="text-[#94a3b8] animate-pulse">Loading price history...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="page-container p-6 lg:p-10">
        <div className="bg-[#1e293b] border border-red-500/30 rounded-xl text-center py-20">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-400 font-medium mb-4">{errorMsg || "Product not found."}</p>
          <Link href="/dashboard" className="px-6 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg transition-all font-bold">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const discount = getDiscount(product.current_price, product.original_price);
  const savings = product.original_price - product.current_price;

  const chartData = history.map(function (h) {
    return {
      date: formatChartDate(h.checked_at),
      price: h.price,
    };
  });

  if (chartData.length === 0) {
    chartData.push({
      date: formatChartDate(product.created_at),
      price: product.current_price,
    });
  }

  const prices = chartData.map(function (h) { return h.price; });
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round(prices.reduce(function (a, b) { return a + b; }, 0) / prices.length);

  return (
    <div className="page-container p-6 lg:p-10">

      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard" className="text-[#94a3b8] hover:text-[#f1f5f9] text-sm transition-colors">
          Dashboard
        </Link>
        <span className="text-[#334155]">/</span>
        <span className="text-[#f1f5f9] text-sm font-medium">Price History</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
        <div>
          <p className="text-[#94a3b8] text-sm mb-1 font-medium uppercase tracking-wider">
            {getPlatformEmoji(product.platform)} {product.platform}
          </p>
          <h1 className="text-3xl font-bold text-[#f1f5f9] mb-1 leading-tight">{product.name}</h1>
          <p className="text-[#94a3b8] text-sm">
            {history.length > 0
              ? `Price tracked over ${history.length} checkpoints`
              : "No price history yet — showing current price"}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={"/alerts?product=" + product.id} className="px-5 py-2.5 bg-[#1e293b] hover:bg-[#334155] text-white border border-[#334155] rounded-lg text-sm transition-all font-bold">
            🔔 Set Alert
          </Link>
          <Link href={product.url} target="_blank" className="px-5 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg text-sm transition-all font-bold shadow-lg shadow-[#6366f1]/20">
            🛒 Buy Now
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1e293b] p-5 rounded-xl border border-[#334155]">
          <div className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-widest mb-1">Current Price</div>
          <div className="text-2xl font-black text-[#6366f1]">
            {"₹" + product.current_price.toLocaleString("en-IN")}
          </div>
          {discount > 0 && <div className="text-xs text-green-400 mt-1 font-bold">{"-" + discount + "% off"}</div>}
        </div>
        <div className="bg-[#1e293b] p-5 rounded-xl border border-[#334155]">
          <div className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-widest mb-1">Lowest Tracked</div>
          <div className="text-2xl font-black text-green-400">
            {"₹" + minPrice.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="bg-[#1e293b] p-5 rounded-xl border border-[#334155]">
          <div className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-widest mb-1">Highest Tracked</div>
          <div className="text-2xl font-black text-red-400">
            {"₹" + maxPrice.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="bg-[#1e293b] p-5 rounded-xl border border-[#334155]">
          <div className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-widest mb-1">Average Price</div>
          <div className="text-2xl font-black text-amber-400">
            {"₹" + avgPrice.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      <div className="bg-[#1e293b] p-6 rounded-xl border border-[#334155] mb-8">
        <h2 className="text-lg font-bold text-[#f1f5f9] mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#6366f1]"></span>
          Price History Chart
        </h2>

        {chartData.length === 1 ? (
          <div className="text-center py-16 bg-[#0f172a]/50 rounded-lg border border-dashed border-[#334155]">
            <p className="text-[#94a3b8] text-sm">Not enough price history yet to draw a trend.</p>
            <p className="text-[#64748b] text-[11px] mt-1">Check back later after the automated price checks.</p>
          </div>
        ) : (
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                  tickFormatter={function (v) { return "₹" + v; }}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#f1f5f9",
                    fontSize: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  itemStyle={{ color: "#6366f1", fontWeight: "bold" }}
                  labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                  formatter={function (value: number) {
                    return ["₹" + value.toLocaleString("en-IN"), "Price"];
                  }}
                />
                <ReferenceLine y={minPrice} stroke="#22c55e" strokeDasharray="4 4" label={{ position: 'right', value: 'Low', fill: '#22c55e', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: "#6366f1", stroke: "#1e293b", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: "#818cf8", stroke: "#fff", strokeWidth: 2 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        <div className="bg-[#1e293b] p-6 rounded-xl border border-[#334155]">
          <h2 className="text-lg font-bold text-[#f1f5f9] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6366f1]"></span>
            💡 AI Deal Analysis
          </h2>

          {analysis ? (
            <>
              <div className="bg-[#0f172a] rounded-xl p-5 mb-5 text-center border border-[#334155]/50 shadow-inner">
                <div className={"text-5xl font-black mb-1 " + getScoreColor(analysis.score)}>
                  {analysis.score}
                </div>
                <div className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-widest">Smart Buy Score / 10</div>
                <div className="flex justify-center gap-1.5 mt-3">
                  {[1,2,3,4,5,6,7,8,9,10].map(function (n) {
                    return (
                      <div
                        key={n}
                        className={"w-5 h-1.5 rounded-full transition-all duration-500 " + (n <= analysis.score ? "bg-[#6366f1] shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "bg-[#334155]")}
                      />
                    );
                  })}
                </div>
              </div>

              <p className="text-sm text-[#f1f5f9] font-bold mb-2">{analysis.verdict}</p>
              <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
                {analysis.recommendation}
              </p>

              {analysis.reasons.length > 0 && (
                <ul className="text-xs text-[#94a3b8] space-y-2 mb-4 p-4 bg-[#0f172a]/30 rounded-lg border border-[#334155]/30">
                  {analysis.reasons.map(function (reason, i) {
                    return (
                      <li key={i} className="flex gap-2">
                        <span className="text-[#6366f1] font-bold">•</span>
                        <span>{reason}</span>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="flex gap-2 flex-wrap">
                {analysis.badges.map(function (badge, i) {
                  return (
                    <span key={i} className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${getBadgeClass(badge.type)}`}>
                      {badge.label}
                    </span>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-10 bg-[#0f172a]/50 rounded-lg border border-dashed border-[#334155]">
              <p className="text-[#94a3b8] text-sm">Analysis unavailable right now.</p>
            </div>
          )}
        </div>

        <div className="bg-[#1e293b] p-6 rounded-xl border border-[#334155]">
          <h2 className="text-lg font-bold text-[#f1f5f9] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6366f1]"></span>
            📋 Price Summary
          </h2>
          <div className="space-y-1">
            <div className="flex justify-between py-3 border-b border-[#334155]/50">
              <span className="text-sm text-[#94a3b8]">Current Price</span>
              <span className="text-sm font-bold text-[#f1f5f9]">{"₹" + product.current_price.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-[#334155]/50">
              <span className="text-sm text-[#94a3b8]">Original Price</span>
              <span className="text-sm font-bold text-[#94a3b8] line-through">{"₹" + product.original_price.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-[#334155]/50">
              <span className="text-sm text-[#94a3b8]">You Save</span>
              <span className="text-sm font-bold text-green-400">{"₹" + savings.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-sm text-[#94a3b8]">Discount</span>
              <span className="text-sm font-bold text-green-400 px-2 py-0.5 bg-green-500/10 rounded border border-green-500/20">{discount + "% OFF"}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}