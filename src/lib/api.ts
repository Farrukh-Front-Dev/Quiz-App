import axios from "axios";

const api = axios.create({
  baseURL: "https://excellent-grade-test.onrender.com", // sizning backend manzilingiz
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔹 Har bir requestga token qo‘shish
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 🔹 Agar error bo‘lsa avtomatik qaytarish
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || "Serverda xatolik yuz berdi";
    return Promise.reject(new Error(message));
  }
);

export default api;
