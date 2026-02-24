import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

export async function getProducts(params = {}) {
  const { data } = await api.get("/products", { params });
  return data;
}

export async function getProductStats() {
  const { data } = await api.get("/products/stats/summary");
  return data;
}

export async function createProduct(payload) {
  const { data } = await api.post("/products", payload);
  return data;
}

export async function updateProduct(id, payload) {
  const { data } = await api.put(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id) {
  await api.delete(`/products/${id}`);
}

export async function getSugarScore(sugarPer100g) {
  const { data } = await api.get(`/sugar-score/${sugarPer100g}`);
  return data;
}

export async function getUsers(params = {}) {
  const { data } = await api.get("/users", { params });
  return data;
}

export async function getUserById(id) {
  const { data } = await api.get(`/users/${id}`);
  return data;
}

export async function getUserStats() {
  const { data } = await api.get("/users/stats/summary");
  return data;
}

export async function createUser(payload) {
  const { data } = await api.post("/users", payload);
  return data;
}

export async function updateUser(id, payload) {
  const { data } = await api.put(`/users/${id}`, payload);
  return data;
}

export async function deleteUser(id) {
  await api.delete(`/users/${id}`);
}

export async function updateUserProfile(id, payload) {
  const { data } = await api.patch(`/users/${id}/profile`, payload);
  return data;
}

export async function adminLogin({ email, password }) {
  const { data } = await api.post("/auth/admin-login", { email, password });
  return data;
}

export default api;
