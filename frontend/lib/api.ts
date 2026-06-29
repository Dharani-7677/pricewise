import axios from "axios";
import { supabase } from './supabase';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || 'guest';
}

export interface Product {
  id: string;
  user_id: string;
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

export interface Alert {
  id: string;
  product_id: string;
  user_email: string;
  target_price: number;
  is_triggered: boolean;
  created_at: string;
  products: {
    name: string;
    platform: string;
    current_price: number;
    url: string;
  };
}

export interface DealAnalysis {
  score: number;
  verdict: string;
  recommendation: string;
  reasons: string[];
  badges: string[];
  discount_percent: number;
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

export interface SmartCompareItem {
  platform: string;
  price: number | null;
  name: string;
  image_url: string | null;
  url: string | null;
  isSource: boolean;
  original_price: number | null;
}

export interface SmartCompareResult {
  results: SmartCompareItem[];
}

export async function getProducts(): Promise<Product[]> {
  const userId = await getUserId();
  const response = await api.get('/products', {
    headers: { 'x-user-id': userId }
  });
  return response.data;
}

export async function getProduct(id: string): Promise<Product> {
  const response = await api.get(`/products/${id}`);
  return response.data;
}

export async function addProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  const userId = await getUserId();
  const response = await api.post('/products', product, {
    headers: { 'x-user-id': userId }
  });
  return response.data;
}

export async function deleteProduct(id: string): Promise<void> {
  const userId = await getUserId();
  await api.delete(`/products/${id}`, {
    headers: { 'x-user-id': userId }
  });
}

export async function getPriceHistory(productId: string): Promise<PriceHistoryEntry[]> {
  const response = await api.get(`/prices/${productId}`);
  return response.data;
}

export async function getAlerts(): Promise<Alert[]> {
  const response = await api.get('/alerts');
  return response.data;
}

export async function createAlert(alert: { product_id: string; user_email: string; target_price: number }): Promise<Alert> {
  const response = await api.post('/alerts', {
    product_id: alert.product_id.trim().replace(/"/g, ''),
    user_email: alert.user_email.trim(),
    target_price: Number(alert.target_price)
  });
  return response.data;
}

export async function deleteAlert(id: string): Promise<void> {
  await api.delete(`/alerts/${id}`);
}

export async function getDealAnalysis(productId: string): Promise<DealAnalysis> {
  const response = await api.get(`/products/${productId}/analysis`);
  return response.data;
}

export async function updateProductPrice(id: string, price: number): Promise<Product> {
  const userId = await getUserId();
  const response = await api.put(`/products/${id}/price`, { price }, {
    headers: { 'x-user-id': userId }
  });
  return response.data;
}

export async function getCommunityDeals(): Promise<CommunityDeal[]> {
  const response = await api.get('/community');
  return response.data;
}

export async function createCommunityDeal(deal: { product_id: string; posted_by: string; deal_description: string }): Promise<CommunityDeal> {
  const response = await api.post('/community', deal);
  return response.data;
}

export async function upvoteCommunityDeal(id: string): Promise<CommunityDeal> {
  const response = await api.put(`/community/${id}/upvote`);
  return response.data;
}

export async function deleteCommunityDeal(id: string): Promise<void> {
  await api.delete(`/community/${id}`);
}

export const smartCompare = async (url: string): Promise<SmartCompareResult> => {
  const response = await api.post('/smart-compare', { url });
  return response.data;
};

export default api;