"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getProducts, getCommunityDealsNew, createCommunityDeal, upvoteCommunityDeal, deleteCommunityDeal, Product, CommunityDeal } from "@/lib/api";

function getPlatformEmoji(p: string) {
  const plat = (p || "").toLowerCase();
  if (plat === "amazon") return "🟠";
  if (plat === "flipkart") return "🔵";
  if (plat === "meesho") return "🩷";
  return "🛍️";
}

export default function CommunityPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<CommunityDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formProductId, setFormProductId] = useState("");
  const [formPostedBy, setFormPostedBy] = useState("");
  const [formDescription, setFormDescription] = useState("");

  async function loadData() {
    setLoading(true);
    setErrorMsg("");
    try {
      const [productsData, dealsData] = await Promise.all([
        getProducts(),
        getCommunityDealsNew(),
      ]);
      setProducts(productsData);
      setDeals(dealsData);
    } catch (err) {
      console.error(err);
      setErrorMsg("Could not load community deals. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formProductId || !formPostedBy || !formDescription) return;

    setSubmitting(true);
    try {
      const newDeal = await createCommunityDeal({
        product_id: formProductId,
        posted_by: formPostedBy,
        deal_description: formDescription,
      });
      // Re-load data to get the joined product info properly or manually merge
      loadData(); 
      setShowModal(false);
      setFormPostedBy("");
      setFormDescription("");
      setFormProductId("");
    } catch (err) {
      console.error(err);
      alert("Failed to share deal.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpvote(id: string) {
    try {
      const updatedDeal = await upvoteCommunityDeal(id);
      setDeals(deals.map(function (d) {
        return d.id === id ? { ...d, upvotes: updatedDeal.upvotes } : d;
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to upvote.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    try {
      await deleteCommunityDeal(id);
      setDeals(deals.filter(function (d) { return d.id !== id; }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete deal.");
    }
  }

  return (
    <div className="page-container p-6 lg:p-10">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#f1f5f9]">Community Deals</h1>
          <p className="text-[#94a3b8] mt-1">
            {deals.length} deal{deals.length !== 1 ? "s" : ""} shared by the community
          </p>
        </div>
        <button
          className="px-6 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg transition-all font-bold disabled:opacity-50"
          onClick={function () { setShowModal(true); }}
          disabled={products.length === 0}
        >
          + Share a Deal
        </button>
      </div>

      {loading && (
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl text-center py-20">
          <p className="text-[#94a3b8] animate-pulse">Loading community deals...</p>
        </div>
      )}

      {!loading && errorMsg && (
        <div className="bg-[#1e293b] border border-red-500/30 rounded-xl text-center py-20">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-400 font-medium">{errorMsg}</p>
        </div>
      )}

      {!loading && !errorMsg && products.length === 0 && (
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl text-center py-20 border-dashed border-2">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-[#94a3b8] mb-4">You need to add a product before sharing a deal.</p>
          <Link href="/dashboard" className="px-6 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg transition-all font-bold">
            Go to Dashboard
          </Link>
        </div>
      )}

      {!loading && !errorMsg && products.length > 0 && deals.length === 0 && (
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl text-center py-20">
          <div className="text-6xl mb-4">🤝</div>
          <h3 className="text-[#f1f5f9] font-bold text-xl mb-2">No deals shared yet</h3>
          <p className="text-[#94a3b8] mb-6 max-w-xs mx-auto">Be the first to share a great find with the community!</p>
          <button onClick={function () { setShowModal(true); }} className="px-6 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg transition-all font-bold">
            + Share a Deal
          </button>
        </div>
      )}

      {!loading && deals.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {deals.map(function (deal) {
            return (
              <div key={deal.id} className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 flex flex-col gap-4 hover:border-[#6366f1]/50 transition-all">
                
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">
                        {getPlatformEmoji(deal.products?.platform)} {deal.products?.platform}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#f1f5f9] leading-tight line-clamp-1">
                      {deal.products?.name}
                    </h3>
                  </div>
                  <div className="text-xl font-black text-green-400">
                    {"₹" + (deal.products?.current_price?.toLocaleString("en-IN") || "0")}
                  </div>
                </div>

                <div className="bg-[#0f172a]/50 p-4 rounded-lg border border-[#334155]/50 italic text-[#f1f5f9] text-sm">
                  "{deal.deal_description}"
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-[#94a3b8]">
                      Posted by <span className="text-[#f1f5f9] font-bold">{deal.posted_by}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={function () { handleUpvote(deal.id); }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#6366f1]/10 hover:bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/20 rounded-lg transition-all"
                    >
                      <span className="text-sm font-bold">👍 {deal.upvotes}</span>
                    </button>
                    <button 
                      onClick={function () { handleDelete(deal.id); }}
                      className="p-2 text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>

                {deal.products?.url && (
                  <Link 
                    href={deal.products.url} 
                    target="_blank"
                    className="w-full text-center py-2 bg-[#334155] hover:bg-[#475569] text-white rounded-lg text-xs transition-all font-bold"
                  >
                    🔗 View Deal on {deal.products.platform}
                  </Link>
                )}

              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#334155] flex justify-between items-center bg-[#0f172a]/50">
              <h2 className="text-xl font-bold text-white">Share a Deal</h2>
              <button
                onClick={function () { setShowModal(false); }}
                className="text-[#94a3b8] hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1">Select Product</label>
                <select
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]"
                  value={formProductId}
                  onChange={function (e) { setFormProductId(e.target.value); }}
                  required
                >
                  <option value="">-- Choose a product --</option>
                  {products.map(function (p) {
                    return (
                      <option key={p.id} value={p.id}>
                        {getPlatformEmoji(p.platform) + " " + p.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1">Your Name</label>
                <input
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formPostedBy}
                  onChange={function (e) { setFormPostedBy(e.target.value); }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1">Deal Description</label>
                <textarea
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-[#f1f5f9] focus:outline-none focus:border-[#6366f1] min-h-[100px]"
                  placeholder="Tell the community why this is a great deal..."
                  value={formDescription}
                  onChange={function (e) { setFormDescription(e.target.value); }}
                  required
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={function () { setShowModal(false); }}
                  className="flex-1 py-3 bg-[#334155] hover:bg-[#475569] text-white rounded-xl transition-all font-bold"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl transition-all font-bold disabled:opacity-50">
                  {submitting ? "Sharing..." : "🚀 Share Deal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
