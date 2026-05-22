import axios from "axios";
import type {
  Product,
  Order,
  OrderItemInput,
  DashboardData,
  ListResponse,
} from "@/types";

export const apiBase = '/api';

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// ---- Products ----

export async function fetchProducts(search = ""): Promise<Product[]> {
  const res = await api.get<ListResponse<Product>>("/products", {
    params: { search, limit: 200 },
  });
  return res.data.items;
}

export async function createProduct(data: {
  name: string;
  spec: string;
  unit: string;
  reference_price: number;
}): Promise<Product> {
  const res = await api.post<Product>("/products", data);
  return res.data;
}

export async function updateProduct(
  id: number,
  data: Partial<{ name: string; spec: string; unit: string; reference_price: number }>
): Promise<Product> {
  const res = await api.put<Product>(`/products/${id}`, data);
  return res.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`);
}

// ---- Orders ----

export async function fetchOrders(params: {
  start?: string;
  end?: string;
  keyword?: string;
  skip?: number;
  limit?: number;
}): Promise<ListResponse<Order>> {
  const res = await api.get<ListResponse<Order>>("/orders", { params });
  return res.data;
}

export async function fetchOrder(id: number): Promise<Order> {
  const res = await api.get<Order>(`/orders/${id}`);
  return res.data;
}

export async function createOrder(data: {
  order_date: string;
  items: OrderItemInput[];
  remark: string;
}): Promise<Order> {
  const res = await api.post<Order>("/orders", data);
  return res.data;
}

// ---- Dashboard ----

export async function fetchDashboard(): Promise<DashboardData> {
  const res = await api.get<DashboardData>("/dashboard");
  return res.data;
}
