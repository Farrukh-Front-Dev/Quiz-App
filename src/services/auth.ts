import api from "@/lib/api";

// 🔹 LocalStorage-ga yozish
function saveAuthData(token: string, user: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }
}

// 🔹 LocalStorage-dan o‘qish
export function loadAuthData() {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return {
      token,
      user: user ? JSON.parse(user) : null,
    };
  }
  return { token: null, user: null };
}

// ✅ Generic register
export async function registerUser(data: { name: string; surname: string; phone: string }) {
  try {
    const res = await api.post("/auth/register/user", data);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Serverda xatolik yuz berdi");
  }
}

// ✅ Generic login
export async function login(role: "user" | "admin", data: any) {
  try {
    const endpoint = role === "user" ? "/auth/login/user" : "/auth/login/admin";
    const res = await api.post(endpoint, data);
    saveAuthData(res.data.access_token, res.data.user);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Serverda xatolik yuz berdi");
  }
}

// ✅ Oldingi loginAdmin/loginUser bilan mos keladigan qulay wrapper
export async function loginAdmin(data: { email: string; password: string }) {
  return login("admin", data);
}

export async function loginUser(data: { phone: string }) {
  return login("user", data);
}
