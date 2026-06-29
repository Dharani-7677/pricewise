"use client";

import { useState } from "react";
import Link from "next/link";
import { smartCompare, SmartCompareResult } from "@/lib/api";
import { Search, ShoppingCart, ExternalLink, Trophy, AlertCircle, Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

function getPlatformColor(p: string) {
  const plat = (p || "").toLowerCase();
  if (plat === "amazon") return "bg-orange-500/10 text-orange-400 border-orange-500/20";
  if (plat === "flipkart") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  if (plat === "meesho") return "bg-pink-500/10 text-pink-400 border-pink-500/20";
  return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
}

function getPlatformLabel(p: string) {
  if (!p) return "Unknown";
  if (p.toLowerCase() === "amazon") return "Amazon.in";
  if (p.toLowerCase() === "flipkart") return "Flipkart.com";
  if (p.toLowerCase() === "meesho") return "Meesho.com";
  return p.charAt(0).toUpperCase() + p.slice(1);
}

export default function SmartComparePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartCompareResult | null>(null);
  const [error, setError] = useState("");

  async function handleCompare(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await smartCompare(url);
      setResult(data);
    } catch (err) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setError(errorObj.response?.data?.error || "Failed to compare. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  }

  const validPrices = (result?.results ?? []).filter(r => r.price !== null).map(r => r.price as number);
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;

  return (
    <ProtectedRoute>
      <div className="page-container p-6 lg:p-10 pb-32">

        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-black text-[#f1f5f9] mb-4">
            Smart <span className="text-[#6366f1]">Compare</span>
          </h1>
          <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
            Paste any product URL (Amazon, Flipkart or Meesho) and we&apos;ll find the best deal across all platforms.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <form onSubmit={handleCompare} className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-[#475569] group-focus-within:text-[#6366f1] transition-colors" />
            </div>
            <input
              type="url"
              placeholder="Paste any Amazon, Flipkart or Meesho link here..."
              className="w-full bg-[#1e293b] border-2 border-[#334155] focus:border-[#6366f1] rounded-2xl py-5 pl-14 pr-44 text-[#f1f5f9] text-lg font-medium shadow-2xl transition-all focus:outline-none"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-2 bottom-2 px-6 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Compare Prices 🔍"}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-xl font-bold text-[#f1f5f9] mb-2">Searching across platforms...</h2>
            <p className="text-[#94a3b8] text-sm">We&apos;re finding the best matching products for you.</p>
          </div>
        )}

        {result && result.results && result.results.length > 0 && (
          <div className={`grid grid-cols-1 md:grid-cols-2 ${result.results.length >= 3 ? "lg:grid-cols-3" : ""} gap-8 max-w-6xl mx-auto`}>
            {result.results.map((item, index) => {
              const isBestPrice = item.price !== null && item.price === minPrice;
              const cardImage = item.image_url || result.results.find(r => r.isSource)?.image_url;

              return (
                <div
                  key={index}
                  className={`relative bg-[#1e293b] rounded-3xl border-2 p-8 shadow-2xl flex flex-col transition-all ${
                    isBestPrice
                      ? "border-green-500 shadow-green-500/10 scale-105 z-10"
                      : "border-[#334155]"
                  }`}
                >
                  {isBestPrice && item.price !== null && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1 shadow-lg whitespace-nowrap">
                      <Trophy size={14} /> Best Price
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getPlatformColor(item.platform)}`}>
                      {getPlatformLabel(item.platform)}
                    </span>
                    {item.isSource && (
                      <span className="text-[10px] font-bold text-[#94a3b8] bg-[#0f172a] px-2 py-1 rounded-md border border-[#334155]">
                        Original Link
                      </span>
                    )}
                  </div>

                  <div className="h-48 bg-white/5 rounded-2xl flex items-center justify-center p-6 mb-6">
                    {cardImage ? (
                      <img
                        src={cardImage}
                        alt={item.name}
                        className={`max-h-full object-contain ${item.isSource ? "" : "grayscale opacity-75"}`}
                      />
                    ) : (
                      <ShoppingCart size={64} className="text-[#334155]" />
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-[#f1f5f9] line-clamp-3 mb-4 leading-tight flex-grow">
                    {item.name}
                  </h3>

                  {item.price ? (
                    <div className="flex items-baseline gap-2 mb-8">
                      <span className="text-4xl font-black text-white">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                      {item.original_price && item.original_price > item.price && (
                        <span className="text-sm text-[#94a3b8] line-through">
                          ₹{item.original_price.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="mb-8 h-10 flex items-center">
                      <span className="text-[#94a3b8] italic">Price unavailable</span>
                    </div>
                  )}

                  {item.url ? (
                    <Link
                      href={item.url}
                      target="_blank"
                      className={`mt-auto w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black transition-all group ${
                        isBestPrice
                          ? "bg-[#6366f1] hover:bg-[#4f46e5] text-white shadow-lg shadow-[#6366f1]/20"
                          : "bg-[#0f172a] border border-[#334155] hover:bg-[#334155] text-white"
                      }`}
                    >
                      View Deal <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="mt-auto w-full py-4 bg-[#0f172a] text-[#475569] rounded-2xl font-black cursor-not-allowed"
                    >
                      Not Available
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!result && !loading && (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#334155] rounded-3xl max-w-2xl mx-auto opacity-50">
            <ShoppingCart size={48} className="text-[#94a3b8] mb-4" />
            <p className="text-[#94a3b8] font-medium">Paste a product URL above to compare prices</p>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}