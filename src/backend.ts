import type { Product } from "./main";

const API_BASE = "/api";

async function request(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Request failed (${res.status})`);
  }
  return data;
}

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
  return mapRow(await request("/products", { method: "POST", body: JSON.stringify(payload(p)) }));
}

export async function updateProduct(id: number, p: any): Promise<Product> {
  return mapRow(await request(`/products/${id}`, { method: "PATCH", body: JSON.stringify(payload(p)) }));
}

export async function deleteProduct(id: number) {
  await request(`/products/${id}`, { method: "DELETE" });
}

export async function uploadProductImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const data = await request("/upload", { method: "POST", body: form });
  return data.url;
}
