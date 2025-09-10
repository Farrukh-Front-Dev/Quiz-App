"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials, loadFromStorage } from "@/store/slices/authSlice";
import { loginAdmin } from "@/services/auth";

export default function AdminLogin() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Loading user from localStorage (if any)");
    dispatch(loadFromStorage());
  }, [dispatch]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    console.log("Login button clicked");
    console.log("Email:", email);
    console.log("Password:", password ? "***" : "");
    setLoading(true);
    setError("");

    try {
      const res = await loginAdmin({ email, password });
      console.log("API response:", res);

      if (res.access_token && res.user) {
        console.log("Saving user and token to Redux store");
        dispatch(setCredentials({ user: res.user, token: res.access_token }));

        console.log("User role:", res.user.role);

        if (res.user.role === "super-admin") {
          console.log("Redirecting to /super-admin/dashboard");
          router.push("/super-admin/dashboard");
        } else if (res.user.role === "admin") {
          console.log("Redirecting to /admin/dashboard");
          router.push("/admin/dashboard");
        } else {
          console.log("Unauthorized role");
          setError("Unauthorized role");
        }
      } else {
        console.log("No token returned from API");
        setError("Login failed: No token returned");
      }
    } catch (err: any) {
      console.log("Error during login:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-100">
      {/* 🔝 O'ng burchakdagi User Login tugmasi */}
      <button
        onClick={() => router.push("/user/login")}
        className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        User Login
      </button>

      {/* Admin Login Form */}
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
