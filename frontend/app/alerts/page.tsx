"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getProducts, getAlerts, createAlert, deleteAlert, Product, Alert } from "@/lib/api";

function getPlatformEmoji(p: string) {
  const plat = (p || "").toLowerCase();
  if (plat === "amazon") return "🟠";
  if (plat === "flipkart") return "🔵";
  if (plat === "meesho") return "🩷";
  return "🛍️";
}

function AlertsContent() {
  const searchParams = useSearchParams();
  const preselectedProductId = searchParams.get("product") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formProductId, setFormProductId] = useState(preselectedProductId);
  const [formEmail, setFormEmail] = useState("");
  const [formTargetPrice, setFormTargetPrice] = useState("");

  async function loadData() {
    setLoading(true);
    setErrorMsg("");
    try {
      const [productsData, alertsData] = await Promise.all([
        getProducts(),
        getAlerts(),
      ]);
      setProducts(productsData);
      setAlerts(alertsData);
    } catch (err) {
      console.error(err);
      setErrorMsg("Could not load alerts. Is the backend running on port 5000?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (preselectedProductId) {
      setFormProductId(preselectedProductId);
      setShowModal(true);
    }
  }, [preselectedProductId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formProductId || !formEmail || !formTargetPrice) return;

    setSubmitting(true);
    try {
      const newAlert = await createAlert(formProductId, formEmail, parseFloat(formTargetPrice));
      setAlerts([newAlert, ...alerts]);
      setShowModal(false);
      setFormEmail("");
      setFormTargetPrice("");
      setFormProductId("");
    } catch (err) {
      console.error(err);
      alert("Failed to create alert.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this alert?")) return;
    try {
      await deleteAlert(id);
      setAlerts(alerts.filter(function (a) { return a.id !== id; }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete alert.");
    }
  }

  function findProduct(productId: string): Product | undefined {
    return products.find(function (p) { return p.id === productId; });
  }

  return (
    <div className="page-container p-6 lg:p-10">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#f1f5f9]">Price Alerts</h1>
          <p className="text-[#94a3b8] mt-1">
            {alerts.length} active alert{alerts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="px-6 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg transition-all font-bold disabled:opacity-50"
          onClick={function () { setShowModal(true); }}
          disabled={products.length === 0}
        >
          + Create Alert
        </button>
      </div>

      {loading && (
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl text-center py-20">
          <p className="text-[#94a3b8] animate-pulse">Loading alerts...</p>
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
          <p className="text-[#94a3b8] mb-4">You need to add a product before creating an alert.</p>
          <Link href="/dashboard" className="px-6 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg transition-all font-bold">
            Go to Dashboard
          </Link>
        </div>
      )}

      {!loading && !errorMsg && products.length > 0 && alerts.length === 0 && (
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl text-center py-20">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-[#f1f5f9] font-bold text-xl mb-2">No alerts yet</h3>
          <p className="text-[#94a3b8] mb-6 max-w-xs mx-auto">Set a target price and we'll email you when it drops</p>
          <button onClick={function () { setShowModal(true); }} className="px-6 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg transition-all font-bold">
            + Create Alert
          </button>
        </div>
      )}

      {!loading && alerts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {alerts.map(function (alertItem) {
            const linkedProduct = alertItem.products || findProduct(alertItem.product_id);
            const currentPrice = linkedProduct ? linkedProduct.current_price : 0;
            const reached = currentPrice > 0 && currentPrice <= alertItem.target_price;

            return (
              <div key={alertItem.id} className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 flex flex-col gap-4 hover:border-[#6366f1]/50 transition-all">

                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm font-bold text-[#f1f5f9] truncate flex-1 leading-tight">
                    {linkedProduct ? linkedProduct.name : "Unknown product"}
                  </span>
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${alertItem.is_triggered || reached ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                    {alertItem.is_triggered || reached ? "✓ Triggered" : "⏳ Watching"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 bg-[#0f172a]/50 p-4 rounded-lg border border-[#334155]/50">
                  <div>
                    <div className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-widest mb-1">Target Price</div>
                    <div className="text-xl font-black text-[#6366f1]">
                      {"₹" + alertItem.target_price.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-widest mb-1">Current Price</div>
                    <div className="text-xl font-black text-[#f1f5f9]">
                      {currentPrice > 0 ? "₹" + currentPrice.toLocaleString("en-IN") : "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#94a3b8] font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  {alertItem.user_email}
                </div>

                <div className="flex gap-2 mt-2">
                  {linkedProduct && (
                    <Link href={"/history/" + (linkedProduct.id || alertItem.product_id)} className="flex-1 text-center py-2 bg-[#334155] hover:bg-[#475569] text-white rounded-lg text-xs transition-all font-bold">
                      📊 View History
                    </Link>
                  )}
                  <button
                    onClick={function () { handleDelete(alertItem.id); }}
                    className="px-4 py-2 text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-lg text-xs transition-all font-bold"
                  >
                    🗑️ Remove
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#334155] flex justify-between items-center bg-[#0f172a]/50">
              <h2 className="text-xl font-bold text-white">Create Price Alert</h2>
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
                        {getPlatformEmoji(p.platform) + " " + p.name + " (₹" + p.current_price.toLocaleString("en-IN") + ")"}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1">Your Email</label>
                <input
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]"
                  type="email"
                  placeholder="you@example.com"
                  value={formEmail}
                  onChange={function (e) { setFormEmail(e.target.value); }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1">Target Price (₹)</label>
                <input
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]"
                  type="number"
                  placeholder="e.g. 999"
                  value={formTargetPrice}
                  onChange={function (e) { setFormTargetPrice(e.target.value); }}
                  required
                />
                <p className="text-[10px] text-[#94a3b8] mt-2 font-medium">
                  We'll email you when the price drops to or below this amount.
                </p>
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
                  {submitting ? "Creating..." : "🔔 Create Alert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AlertsPage() {
  return (
    <Suspense fallback={
      <div className="page-container p-6 lg:p-10">
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl text-center py-20">
          <p className="text-[#94a3b8] animate-pulse">Loading Alerts...</p>
        </div>
      </div>
    }>
      <AlertsContent />
    </Suspense>
  );
}