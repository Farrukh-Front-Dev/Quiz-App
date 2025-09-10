import api from "@/lib/api";

// ✅ User Register
export async function registerUser(data: { name: string; surname: string; phone: string }) {
  const res = await api.post("/auth/register/user", data);
  return res.data;
}

// ✅ User Login
export async function loginUser(data: { phone: string }) {
  const res = await api.post("/auth/login/user", data);

  if (typeof window !== "undefined") {
    localStorage.setItem("token", res.data.access_token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }

  return res.data;
}

// ✅ Admin Login
export async function loginAdmin(data: { email: string; password: string }) {
  const res = await api.post("/auth/login/admin", data);

  if (typeof window !== "undefined") {
    localStorage.setItem("token", res.data.access_token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }

  return res.data;
}
