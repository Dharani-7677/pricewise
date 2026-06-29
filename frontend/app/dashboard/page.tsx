"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getProducts, addProduct, deleteProduct, updateProductPrice, Product } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

function getDiscount(cur: number, ori: number) {
  if (!ori || ori === 0) return 0;
  return Math.round(((ori - cur) / ori) * 100);
}

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
  const plat = (p || "").toLowerCase();
  if (plat === "amazon") return "bg-orange-500/10 text-orange-400 border-orange-500/20";
  if (plat === "flipkart") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  if (plat === "meesho") return "bg-pink-500/10 text-pink-400 border-pink-500/20";
  return "bg-gray-500/10 text-gray-400 border-gray-500/20";
}

function getScore(discount: number) {
  if (discount >= 60) return { score: 9, label: "Buy Now!", color: "text-green-400" };
  if (discount >= 40) return { score: 7, label: "Good Deal", color: "text-indigo-400" };
  if (discount >= 20) return { score: 5, label: "Average", color: "text-amber-400" };
  return { score: 3, label: "Wait", color: "text-red-400" };
}

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [needsManual, setNeedsManual] = useState(false);

  const [formUrl, setFormUrl] = useState("");
  const [formName, setFormName] = useState("");
  const [formPlatform, setFormPlatform] = useState("amazon");
  const [formCurrent, setFormCurrent] = useState("");
  const [formOriginal, setFormOriginal] = useState("");

  async function loadProducts() {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Could not load products. Is the backend running on port 5000?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter(function (p) {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchPlatform = filterPlatform === "all" || p.platform === filterPlatform;
    return matchSearch && matchPlatform;
  });

  const totalSavings = products.reduce(function (sum, p) {
    return sum + (p.original_price - p.current_price);
  }, 0);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter(function (p) { return p.id !== id; }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete product.");
    }
  }

  async function handleUpdatePrice(productId: string, currentPrice: number) {
    const input = window.prompt("Enter new price (₹):", currentPrice.toString());
    if (!input) return;
    const newPrice = parseFloat(input);
    if (isNaN(newPrice) || newPrice <= 0) {
      alert("Please enter a valid price.");
      return;
    }
    try {
      const result = await updateProductPrice(productId, newPrice);
      setProducts(products.map(function (p) {
        return p.id === productId ? { ...p, current_price: newPrice } : p;
      }));
      if (result.emails_sent > 0) {
        alert("Price updated! " + result.emails_sent + " alert email(s) sent.");
      } else {
        alert("Price updated to ₹" + newPrice.toLocaleString("en-IN"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update price.");
    }
  }

  function resetForm() {
    setFormUrl("");
    setFormName("");
    setFormCurrent("");
    setFormOriginal("");
    setNeedsManual(false);
    setErrorMsg("");
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      const payload: { url: string; name?: string; current_price?: number; original_price?: number; platform?: string } = { url: formUrl };
      if (needsManual || formName) payload.name = formName;
      if (needsManual || formCurrent) payload.current_price = parseFloat(formCurrent);
      if (formOriginal) payload.original_price = parseFloat(formOriginal);
      if (needsManual) payload.platform = formPlatform;

      const data = await addProduct(payload);

      setProducts([data, ...products]);
      setShowModal(false);
      resetForm();
    } catch (err) {
      const error = err as { response?: { data?: { needs_manual_entry?: boolean; error?: string } }; message?: string };
      const data = error.response?.data;
      if (data?.needs_manual_entry) {
        setNeedsManual(true);
        
        let customMsg = "Auto-detect failed. Please fill in the details manually below.";
        if (formUrl.includes("meesho.com")) {
          setFormPlatform("meesho");
          customMsg = "Meesho auto-detect not supported yet. Please fill details manually.";
        } else if (formUrl.includes("flipkart.com")) {
          setFormPlatform("flipkart");
          customMsg = "Flipkart auto-detect failed. Please fill details manually.";
        } else if (formUrl.includes("amazon.in") || formUrl.includes("amazon.com")) {
          setFormPlatform("amazon");
        }
        
        setErrorMsg(customMsg);
        return;
      }
      alert(data?.error || error.message || "Failed to add product.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="page-container p-6 lg:p-10">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#f1f5f9]">My Dashboard</h1>
            <p className="text-[#94a3b8] mt-1">{products.length} products tracked</p>
          </div>
          <button className="btn-primary px-6 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg transition-all" onClick={function () { setShowModal(true); }}>
            + Add Product
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card bg-[#1e293b] p-6 rounded-xl border border-[#334155]">
            <div className="text-xs text-[#94a3b8] uppercase mb-1 font-bold">Tracking</div>
            <div className="text-3xl font-black text-[#f1f5f9]">{products.length}</div>
            <div className="text-sm text-[#94a3b8]">Products</div>
          </div>
          <div className="card bg-[#1e293b] p-6 rounded-xl border border-[#334155]">
            <div className="text-xs text-[#94a3b8] uppercase mb-1 font-bold">Total Savings</div>
            <div className="text-3xl font-black text-green-400">₹{totalSavings.toLocaleString()}</div>
            <div className="text-sm text-[#94a3b8]">Across all items</div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="flex-1 bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2 text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2 text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]"
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
          >
            <option value="all">All Platforms</option>
            <option value="amazon">Amazon</option>
            <option value="flipkart">Flipkart</option>
            <option value="meesho">Meesho</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#94a3b8]">Loading products...</div>
        ) : errorMsg && products.length === 0 ? (
          <div className="text-center py-20 text-red-400">{errorMsg}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 card border-dashed border-2 border-[#334155]">
            <p className="text-[#94a3b8]">No products found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => {
              const discount = getDiscount(product.current_price, product.original_price);
              const score = getScore(discount);
              return (
                <div key={product.id} className="card bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden hover:border-[#6366f1]/50 transition-all group">
                  <div className="relative h-48 bg-white/5 flex items-center justify-center p-4">
                    <img src={product.image_url} alt={product.name} className="max-h-full object-contain mix-blend-normal" />
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-bold border ${getPlatformColor(product.platform)}`}>
                      {getPlatformEmoji(product.platform)} {getPlatformLabel(product.platform)}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-[#f1f5f9] line-clamp-2 mb-3 h-12 leading-tight">
                      {product.name}
                    </h3>
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <div className="text-2xl font-black text-[#f1f5f9]">₹{product.current_price.toLocaleString()}</div>
                        <div className="text-sm text-[#94a3b8] line-through">₹{product.original_price.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${score.color}`}>{discount}% OFF</div>
                        <div className="text-[10px] uppercase tracking-wider text-[#94a3b8]">Saving ₹{(product.original_price - product.current_price).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Link href={`/history/${product.id}`} className="flex-1 text-center py-2 bg-[#334155] hover:bg-[#475569] text-white rounded-lg text-sm transition-all font-medium">
                          View History
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                      <button 
                        onClick={function () { handleUpdatePrice(product.id, product.current_price); }}
                        className="btn-secondary text-xs py-2 text-center w-full bg-[#1e293b] hover:bg-[#334155] text-[#94a3b8] hover:text-white rounded-lg border border-[#334155] transition-all"
                      >
                        ✏️ Update Price
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ADD PRODUCT MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1e293b] border border-[#334155] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-[#334155] flex justify-between items-center bg-[#0f172a]/50">
                <h2 className="text-xl font-bold text-white">Add New Product</h2>
                <button onClick={resetForm} className="text-[#94a3b8] hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                {errorMsg && (
                  <div className={`p-3 rounded-lg text-sm ${needsManual ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {errorMsg}
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1">Product URL</label>
                  <input 
                    required
                    type="url" 
                    placeholder="Paste Amazon/Flipkart link..." 
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                  />
                </div>

                {needsManual && (
                  <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                      <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1">Product Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. iPhone 15 Pro" 
                        className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1">Current Price (₹)</label>
                        <input 
                          required
                          type="number" 
                          placeholder="79999" 
                          className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]"
                          value={formCurrent}
                          onChange={(e) => setFormCurrent(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1">Original Price (₹)</label>
                        <input 
                          type="number" 
                          placeholder="89999" 
                          className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]"
                          value={formOriginal}
                          onChange={(e) => setFormOriginal(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1">Platform</label>
                      <select 
                        className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]"
                        value={formPlatform}
                        onChange={(e) => setFormPlatform(e.target.value)}
                      >
                        <option value="amazon">Amazon</option>
                        <option value="flipkart">Flipkart</option>
                        <option value="meesho">Meesho</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button 
                    disabled={submitting}
                    className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#6366f1]/20 transition-all disabled:opacity-50"
                  >
                    {submitting ? "Processing..." : needsManual ? "Save Product" : "Track Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
