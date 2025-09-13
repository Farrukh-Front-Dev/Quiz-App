import api from "@/lib/api";
import { store } from "@/store";
import { setCredentials } from "@/store/slices/authSlice";
import Cookies from "js-cookie";

// 🔹 LocalStorage + Cookie-ga yozish
function saveAuthData(token: string, user: any) {
  if (typeof window !== "undefined") {
    // LocalStorage (UI uchun)
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // Cookie (middleware uchun)
    Cookies.set("token", token, {
      expires: 1, // 1 kun (kerak bo‘lsa ko‘paytirish mumkin)
      secure: true,
      sameSite: "strict",
    });
  }
}


// 🔹 Redux + LocalStorage + Cookie yangilash
function updateAuth(token: string, user: any) {
  saveAuthData(token, user);
  store.dispatch(setCredentials({ user, token }));
}

// 🔹 Generic register
export async function registerUser(data: { name: string; surname: string; phone: string }) {
  try {
    const res = await api.post("/auth/register/user", data);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Serverda xatolik yuz berdi");
  }
}

// 🔹 Generic login
export async function login(role: "user" | "admin", data: any) {
  try {
    const endpoint = role === "user" ? "/auth/login/user" : "/auth/login/admin";
    const res = await api.post(endpoint, data);

    if (res.data.access_token && res.data.user) {
      updateAuth(res.data.access_token, {
        ...res.data.user,
        role: role === "admin" && !res.data.user.role ? "admin" : res.data.user.role,
      });
    }

    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Serverda xatolik yuz berdi");
  }
}

// 🔹 Convenience wrappers
export async function loginAdmin(data: { email: string; password: string }) {
  return login("admin", data);
}

export async function loginUser(data: { phone: string }) {
  return login("user", data);
}
