"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials, loadFromStorage } from "@/store/slices/authSlice";
import { loginUser } from "@/services/auth";

export default function UserLogin() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Loading user from local storage (if any)");
    dispatch(loadFromStorage());
  }, [dispatch]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    console.log("Login button clicked");
    console.log("Phone entered:", phone);

    try {
      const res = await loginUser({ phone });
      console.log("API response:", res);

      if (res.access_token && res.user) {
        console.log("Saving user and token to Redux store");
        dispatch(setCredentials({ user: res.user, token: res.access_token }));

        console.log("Redirecting to /user/dashboard");
        router.push("/user/dashboard");
      } else {
        console.log("No token returned, show error");
        setError("Login failed: No token returned");
      }
    } catch (err: any) {
      console.log("Error occurred during login:", err);
      setError(err.message);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
      {/* 🔝 O'ng burchakdagi Admin Login tugmasi */}
      <button
        onClick={() => router.push("/admin/login")}
        className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Admin Login
      </button>

      {/* User Login Form */}
      <form className="flex flex-col gap-3 w-80 bg-white p-6 rounded shadow-md" onSubmit={handleLogin}>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefon raqam"
          className="border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Login
        </button>

        {error && <p className="text-red-500">{error}</p>}

        {/* 🔗 Register link */}
        <p className="text-sm text-center mt-2">
          Yangi foydalanuvchi?{" "}
          <span
            onClick={() => router.push("/user/register")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Ro'yxatdan o'tish
          </span>
        </p>
      </form>
    </div>
  );
}
