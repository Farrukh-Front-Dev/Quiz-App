"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { setCredentials, loadFromStorage } from "@/store/slices/authSlice";
import { loginAdmin } from "@/services/auth";
import { RootState } from "@/store";

interface DecodedToken {
  sub: string;
  role: "user" | "admin" | "super-admin";
  name?: string;
  surname?: string;
}

export default function AdminLogin() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Agar oldindan login bo'lib qolgan bo'lsa → avtomatik redirect
  useEffect(() => {
    dispatch(loadFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (token && user?.role) {
      if (user.role === "super-admin") router.replace("/super-admin/dashboard");
      else if (user.role === "admin") router.replace("/admin/dashboard");
    }
  }, [token, user, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginAdmin({ email, password });

      if (res.access_token) {
        const decoded: DecodedToken = jwtDecode(res.access_token);

        // 🔹 Faqat admin yoki super-admin kirishiga ruxsat beramiz
        if (!["admin", "super-admin"].includes(decoded.role)) {
          setError("You are not authorized to access admin panel.");
          setLoading(false);
          return;
        }

        dispatch(
          setCredentials({
            user: {
              id: decoded.sub,
              role: decoded.role,
              name: decoded.name,
              surname: decoded.surname,
            },
            token: res.access_token,
          })
        );

        // 🔹 Role-ga qarab redirect
        if (decoded.role === "super-admin") router.push("/super-admin/dashboard");
        else router.push("/admin/dashboard");
      } else {
        setError("Login failed");
      }
    } catch (err: any) {
      setError(err.message || "Server error, please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="border rounded px-3 py-2"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
}
