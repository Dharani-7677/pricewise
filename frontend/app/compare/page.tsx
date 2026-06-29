"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getProducts, Product } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

function getPlatformEmoji(p: string) {
  if (p === "amazon") return "🟠";
  if (p === "flipkart") return "🔵";
  if (p === "meesho") return "🩷";
  return "🛍️";
}

function getPlatformLabel(p: string) {
  if (!p) return "Other";
  return p.charAt(0).toUpperCase() + p.slice(1);
}

function getPlatformColor(p: string) {
  if (p === "amazon") return "border-orange-500/30 bg-orange-500/5";
  if (p === "flipkart") return "border-blue-500/30 bg-blue-500/5";
  if (p === "meesho") return "border-pink-500/30 bg-pink-500/5";
  return "border-gray-500/30 bg-gray-500/5";
}

function normalizeForGrouping(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(" ")
    .slice(0, 3)
    .join(" ")
    .trim();
}

// Highlight matched search text
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-[#6366f1]/30 text-[#f1f5f9] rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

interface ProductGroup {
  key: string;
  displayName: string;
  items: Product[];
}

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErrorMsg("");
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setErrorMsg("Could not load products. Is the backend running?");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Group products by normalized name
  const groups: ProductGroup[] = [];
  products.forEach(function (p) {
    const key = normalizeForGrouping(p.name);
    const existing = groups.find(function (g) { return g.key === key; });
    if (existing) {
      existing.items.push(p);
    } else {
      groups.push({ key: key, displayName: p.name, items: [p] });
    }
  });

  const multiPlatformGroups = groups.filter(function (g) { return g.items.length > 1; });
  const singlePlatformGroups = groups.filter(function (g) { return g.items.length === 1; });

  // FIXED: Search checks name, platform, and price — case insensitive, any word match
  const searchLower = search.toLowerCase().trim();

  function matchesSearch(group: ProductGroup): boolean {
    if (!searchLower) return true;
    // Check group display name
    if (group.displayName.toLowerCase().includes(searchLower)) return true;
    // Check any item's platform or price
    return group.items.some(function (item) {
      return (
        item.platform.toLowerCase().includes(searchLower) ||
        item.current_price.toString().includes(searchLower) ||
        item.name.toLowerCase().includes(searchLower)
      );
    });
  }

  const filteredMulti = multiPlatformGroups.filter(matchesSearch);
  const filteredSingle = singlePlatformGroups.filter(matchesSearch);
  const totalResults = filteredMulti.length + filteredSingle.length;

  return (
    <ProtectedRoute>
      <div className="page-container">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#f1f5f9]">Compare Prices</h1>
          <p className="text-[#94a3b8] mt-1">
            Compare the same product across Amazon, Flipkart and Meesho
          </p>
        </div>

        {/* IMPROVED SEARCH BOX */}
        <div className="mb-6">
          <div className="relative max-w-md">
            {/* Search icon */}
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] text-lg pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by name, platform, price..."
              value={search}
              onChange={function (e) { setSearch(e.target.value); }}
              className="input w-full pl-10 pr-10"
            />
            {/* Clear button */}
            {search && (
              <button
                onClick={function () { setSearch(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors text-lg leading-none"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search result count */}
          {search && !loading && (
            <p className="text-sm text-[#94a3b8] mt-2">
              {totalResults > 0 ? (
                <>
                  <span className="text-[#6366f1] font-semibold">{totalResults}</span>
                  {" result"}
                  {totalResults !== 1 ? "s" : ""}
                  {" found for "}
                  <span className="text-[#f1f5f9] font-medium">"{search}"</span>
                </>
              ) : (
                <>No results for <span className="text-[#f1f5f9] font-medium">"{search}"</span></>
              )}
            </p>
          )}
        </div>

        {loading && (
          <div className="card text-center py-16">
            <div className="text-4xl mb-3 animate-spin">⏳</div>
            <p className="text-[#94a3b8]">Loading products...</p>
          </div>
        )}

        {!loading && errorMsg && (
          <div className="card text-center py-16 border-red-500/30">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-400 font-medium">{errorMsg}</p>
          </div>
        )}

        {!loading && !errorMsg && products.length === 0 && (
          <div className="card text-center py-20">
            <div className="text-6xl mb-4">🔀</div>
            <h3 className="text-[#f1f5f9] font-bold text-xl mb-2">No products to compare yet</h3>
            <p className="text-[#94a3b8] mb-6">Add products from different platforms to compare prices</p>
            <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
          </div>
        )}

        {/* NO SEARCH RESULTS */}
        {!loading && !errorMsg && products.length > 0 && search && totalResults === 0 && (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-[#f1f5f9] font-bold text-lg mb-2">No products found</h3>
            <p className="text-[#94a3b8] mb-4">
              Try searching with a different keyword
            </p>
            <button
              onClick={function () { setSearch(""); }}
              className="btn-secondary text-sm"
            >
              Clear search
            </button>
          </div>
        )}

        {/* MULTI PLATFORM */}
        {!loading && filteredMulti.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-[#f1f5f9] mb-4">🔀 Available for Comparison</h2>
            <div className="flex flex-col gap-6">
              {filteredMulti.map(function (group) {
                const sorted = [...group.items].sort(function (a, b) { return a.current_price - b.current_price; });
                const lowestPrice = sorted[0].current_price;

                return (
                  <div key={group.key} className="card">
                    <h3 className="text-[#f1f5f9] font-semibold mb-4 text-sm leading-snug">
                      <HighlightText text={group.displayName} query={search} />
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sorted.map(function (item) {
                        const isLowest = item.current_price === lowestPrice;
                        return (
                          <div
                            key={item.id}
                            className={"rounded-xl border p-4 flex flex-col gap-2 " + getPlatformColor(item.platform) + (isLowest ? " ring-2 ring-green-500/50" : "")}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-[#f1f5f9]">
                                {getPlatformEmoji(item.platform) + " " + getPlatformLabel(item.platform)}
                              </span>
                              {isLowest && (
                                <span className="badge bg-green-500/10 text-green-400 border border-green-500/20 text-xs px-2 py-0.5 rounded-full">
                                  🏆 Best Price
                                </span>
                              )}
                            </div>
                            <div className="text-2xl font-black text-[#f1f5f9]">
                              {"₹" + item.current_price.toLocaleString("en-IN")}
                            </div>
                            <Link href={item.url} className="btn-secondary text-xs py-2 text-center mt-2">
                              View on {getPlatformLabel(item.platform)}
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SINGLE PLATFORM */}
        {!loading && filteredSingle.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-[#f1f5f9] mb-2">📦 Tracked on One Platform</h2>
            <p className="text-[#94a3b8] text-sm mb-4">
              Add the same product from another platform to compare prices here.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSingle.map(function (group) {
                const item = group.items[0];
                return (
                  <div key={group.key} className="card flex flex-col gap-2">
                    <span className="text-sm font-medium text-[#94a3b8]">
                      {getPlatformEmoji(item.platform) + " " + getPlatformLabel(item.platform)}
                    </span>
                    <h4 className="text-[#f1f5f9] font-semibold text-sm leading-snug" style={{ minHeight: "40px" }}>
                      <HighlightText text={item.name} query={search} />
                    </h4>
                    <div className="text-xl font-black text-[#f1f5f9]">
                      {"₹" + item.current_price.toLocaleString("en-IN")}
                    </div>
                    <Link href={"/dashboard"} className="text-xs text-[#6366f1] hover:underline mt-1">
                      Add from another platform →
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}