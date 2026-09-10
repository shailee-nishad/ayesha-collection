import type { Product } from "./main";

const API_BASE = "/api";

async function request(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(init.headers || {}),
    },
  });

  const text = await res.text();

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(
      data?.message || data?.error || `Request failed (${res.status})`
    );
  }

  return data;
}

/* ADMIN */

export async function adminLogin(email: string, password: string) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getAdminSession() {
  try {
    const data = await request("/session");
    return data?.authenticated ? { user: data.user } : null;
  } catch {
    return null;
  }
}

export async function adminLogout() {
  await request("/logout", { method: "POST" }).catch(() => {});
}

/* PRODUCTS */

function mapRow(r: any): Product {
  return {
    id: Number(r.id),
    name: r.name,
    brand: r.brand || "AYESHA®",
    category: r.category,
    subcategory: r.subcategory || "",
    price: Number(r.price),
    mrp: Number(r.mrp),
    discount: Number(r.discount || 0),
    rating: Number(r.rating || 4.5),
    reviewCount: Number(r.review_count || 0),
    images: Array.isArray(r.images) ? r.images : [],
    colors: Array.isArray(r.colors) ? r.colors : [],
    sizes: Array.isArray(r.sizes) ? r.sizes : [],
    fit: r.fit || "REGULAR FIT",
    stock: Number(r.stock || 0),
    description: r.description || "",
    tags: Array.isArray(r.tags) ? r.tags : [],
  };
}

export async function loadProductsFromDb(): Promise<Product[] | null> {
  const rows = await request("/products");
  return (rows || []).map(mapRow);
}

function payload(p: any) {
  return {
    name: p.name,
    brand: p.brand,
    category: p.category,
    subcategory: p.subcategory,
    price: p.price,
    mrp: p.mrp,
    discount: p.discount,
    rating: p.rating,
    review_count: p.reviewCount,
    images: p.images,
    colors: p.colors,
    sizes: p.sizes,
    fit: p.fit,
    stock: p.stock,
    description: p.description,
    tags: p.tags,
  };
}

export async function createProduct(p: any): Promise<Product> {
  return mapRow(
    await request("/products", {
      method: "POST",
      body: JSON.stringify(payload(p)),
    })
  );
}

export async function updateProduct(id: number, p: any): Promise<Product> {
  return mapRow(
    await request(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload(p)),
    })
  );
}

export async function deleteProduct(id: number) {
  await request(`/products/${id}`, { method: "DELETE" });
}

export async function uploadProductImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const data = await request("/upload", {
    method: "POST",
    body: form,
  });

  return data.url;
}

/* CUSTOMER */

const CUSTOMER_TOKEN_KEY = "ayesha-customer-token-v1";

export function getCustomerToken(): string {
  const existing = localStorage.getItem(CUSTOMER_TOKEN_KEY);
  if (existing) return existing;

  const token = crypto.randomUUID();
  localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  return token;
}

/* ORDERS */

export type ApiOrderItem = {
  product: {
    id: number;
    name: string;
    brand: string;
    images: string[];
  };
  size: string;
  color: string;
  qty: number;
  price: number;
  lineTotal: number;
};

export type ApiOrder = {
  id: string;
  databaseId: number;
  date: string;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
  };
  address: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pin: string;
  };
  items: ApiOrderItem[];
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  payment: string;
  paymentStatus: string;
  status: string;
};

export async function createOrder(payload: {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  payment: string;
  items: Array<{
    product_id: number;
    quantity: number;
    size: string;
    color: string;
  }>;
}): Promise<ApiOrder> {
  const data = await request("/orders", {
    method: "POST",
    body: JSON.stringify({
      customer_token: getCustomerToken(),
      ...payload,
    }),
  });

  return data.order;
}

export async function loadCustomerOrders(): Promise<ApiOrder[]> {
  const token = getCustomerToken();

  return request(
    `/orders?customer_token=${encodeURIComponent(token)}`
  );
}

export async function loadAdminOrders(): Promise<ApiOrder[]> {
  return request("/admin-orders");
}

export async function updateOrderStatus(
  databaseId: number,
  status: string
): Promise<ApiOrder> {
  const data = await request(`/orders/${databaseId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  return data.order;
}
