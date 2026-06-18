import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Types ──

export interface Product {
  id: string;
  user_id?: string;
  name: string;
  url: string;
  platform: string;
  image_url: string;
  current_price: number;
  original_price: number;
  created_at: string;
}

export interface PriceHistoryEntry {
  id: string;
  product_id: string;
  price: number;
  discount_percent: number;
  checked_at: string;
}

export interface DealAnalysis {
  score: number;
  verdict: string;
  recommendation: string;
  reasons: string[];
  badges: { label: string; type: string }[];
  discount_percent: number;
}

export interface Alert {
  id: string;
  product_id: string;
  user_email: string;
  target_price: number;
  is_triggered: boolean;
  created_at: string;
  products?: {
    name: string;
    current_price: number;
  };
}

export interface CommunityDeal {
  id: string;
  product_id: string;
  posted_by: string;
  deal_description: string;
  upvotes: number;
  created_at: string;
  products: {
    name: string;
    platform: string;
    current_price: number;
    url: string;
  };
}

export interface CommunityDealLegacy extends Product {
  analysis: DealAnalysis;
}

// ── Products API ──

export async function getProducts(): Promise<Product[]> {
  const res = await api.get("/products");
  return res.data;
}

export async function getCommunityDeals(): Promise<CommunityDeal[]> {
  const res = await api.get("/community");
  return res.data;
}

export async function getProduct(id: string): Promise<Product> {
  const res = await api.get(`/products/${id}`);
  return res.data;
}

export async function addProduct(payload: {
  url: string;
  name?: string;
  platform?: string;
  current_price?: number;
  original_price?: number;
  image_url?: string;
}): Promise<Product> {
  const res = await api.post("/products", payload);
  return res.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function updateProductPrice(productId: string, newPrice: number) {
  const res = await api.put(`/products/${productId}/price`, { new_price: newPrice });
  return res.data;
}

export async function getDealAnalysis(productId: string): Promise<DealAnalysis> {
  const res = await api.get(`/products/${productId}/analysis`);
  return res.data;
}

// ── Price History API ──

export async function getPriceHistory(productId: string): Promise<PriceHistoryEntry[]> {
  const res = await api.get(`/prices/${productId}`);
  return res.data;
}

export async function addPriceEntry(
  productId: string,
  price: number,
  discountPercent: number
): Promise<PriceHistoryEntry> {
  const res = await api.post("/prices", {
    product_id: productId,
    price,
    discount_percent: discountPercent,
  });
  return res.data;
}

// ── Alerts API ──

export async function getAlerts(): Promise<Alert[]> {
  const res = await api.get("/alerts");
  return res.data;
}

export async function createAlert(
  productId: string,
  userEmail: string,
  targetPrice: number
): Promise<Alert> {
  const res = await api.post("/alerts", {
    product_id: productId,
    user_email: userEmail,
    target_price: targetPrice,
  });
  return res.data;
}

export async function deleteAlert(id: string): Promise<void> {
  await api.delete(`/alerts/${id}`);
}

// ── Community Deals API ──

export async function getCommunityDealsNew(): Promise<CommunityDeal[]> {
  const response = await api.get('/community-deals');
  return response.data;
}

export async function createCommunityDeal(deal: { product_id: string; posted_by: string; deal_description: string }): Promise<CommunityDeal> {
  const response = await api.post('/community-deals', deal);
  return response.data;
}

export async function upvoteCommunityDeal(id: string): Promise<CommunityDeal> {
  const response = await api.put(`/community-deals/${id}/upvote`);
  return response.data;
}

export async function deleteCommunityDeal(id: string): Promise<void> {
  await api.delete(`/community-deals/${id}`);
}

export default api;
