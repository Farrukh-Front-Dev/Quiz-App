"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {jwtDecode} from "jwt-decode"; // default import ishlatish
import { setCredentials, loadFromStorage } from "@/store/slices/authSlice";
import { loginAdmin } from "@/services/auth";

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  name?: string;
  surname?: string;
  phone?: string;
}

export default function AdminLogin() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Loading from storage...");
    dispatch(loadFromStorage());
  }, [dispatch]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("Sending login data:", { email, password });

    try {
      const res = await loginAdmin({ email, password });
      console.log("Response from backend:", res);

      if (!res.access_token) {
        console.error("No access_token returned:", res);
        setError("Login failed: No token returned");
        return;
      }

      const decoded: DecodedToken = jwtDecode(res.access_token);
      console.log("Decoded token:", decoded);

      dispatch(
        setCredentials({
          user: {
            id: decoded.id,
            name: decoded.name || "",
            surname: decoded.surname || "",
            phone: decoded.phone || "",
          },
          token: res.access_token,
        })
      );

      // Role bo‘yicha redirect
      if (decoded.role === "super-admin") {
        console.log("Redirecting to super-admin dashboard");
        router.push("/super-admin/dashboard");
      } else if (decoded.role === "admin") {
        console.log("Redirecting to admin subjects");
        router.push("/admin/subjects");
      } else {
        console.warn("Unauthorized role:", decoded.role);
        setError("Unauthorized role");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
      console.log("Loading finished");
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-md w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center">Admin Login</h1>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="border p-2 rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
