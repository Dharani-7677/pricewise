"use client";

import { useState, useEffect } from "react";
import { getProducts, getAlerts, createAlert, deleteAlert } from "@/lib/api";
import type { Product, Alert } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(function () {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [alertsData, productsData] = await Promise.all([
        getAlerts(),
        getProducts(),
      ]);
      setAlerts(alertsData);
      setProducts(productsData);
    } catch (err) {
      setError("Failed to load alerts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!selectedProduct || !userEmail || !targetPrice) {
      alert("Please fill in all fields");
      return;
    }
    try {
      setCreating(true);
      await createAlert({
        product_id: String(selectedProduct),
        user_email: String(userEmail),
        target_price: parseFloat(targetPrice),
      });
      setShowModal(false);
      setSelectedProduct("");
      setUserEmail("");
      setTargetPrice("");
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to create alert");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this alert?")) return;
    try {
      await deleteAlert(id);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete alert");
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
          <div className="text-[#94a3b8]">Loading alerts...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9] p-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#f1f5f9]">Price Alerts</h1>
              <p className="text-[#94a3b8] mt-1">{alerts.length} active alerts</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg font-semibold transition-colors"
            >
              + Create Alert
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Alerts Grid */}
          {alerts.length === 0 ? (
            <div className="bg-[#1e293b] rounded-xl p-12 text-center border border-[#334155]">
              <div className="text-5xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold text-[#f1f5f9] mb-2">No alerts yet</h3>
              <p className="text-[#94a3b8] mb-6">Create an alert to get notified when prices drop!</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg font-semibold transition-colors"
              >
                + Create Alert
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alerts.map(function (alert) {
                return (
                  <div
                    key={alert.id}
                    className="bg-[#1e293b] rounded-xl p-6 border border-[#334155] hover:border-[#6366f1]/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#f1f5f9] text-sm leading-tight line-clamp-2">
                          {alert.products?.name || "Product"}
                        </h3>
                        <p className="text-[#94a3b8] text-xs mt-1">{alert.user_email}</p>
                      </div>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          alert.is_triggered
                            ? "bg-green-500/20 text-green-400"
                            : "bg-[#6366f1]/20 text-[#6366f1]"
                        }`}
                      >
                        {alert.is_triggered ? "Triggered ✓" : "Watching"}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#94a3b8]">Target Price</span>
                        <span className="text-[#6366f1] font-bold">₹{alert.target_price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#94a3b8]">Current Price</span>
                        <span className="text-[#f1f5f9]">₹{alert.products?.current_price?.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors"
                    >
                      🗑️ Remove Alert
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e293b] rounded-xl p-6 w-full max-w-md border border-[#334155]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#f1f5f9]">Create Price Alert</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-[#94a3b8] hover:text-[#f1f5f9] text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                    SELECT PRODUCT
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3 text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]"
                  >
                    <option value="">Choose a product...</option>
                    {products.map(function (product) {
                      return (
                        <option key={product.id} value={product.id}>
                          {product.name.substring(0, 50)}...
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                    YOUR EMAIL
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3 text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                    TARGET PRICE (₹)
                  </label>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3 text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]"
                  />
                  <p className="text-[#94a3b8] text-xs mt-1">
                    We&apos;ll email you when the price drops to or below this amount.
                  </p>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="w-full py-3 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
                >
                  {creating ? "Creating..." : "🔔 Create Alert"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}