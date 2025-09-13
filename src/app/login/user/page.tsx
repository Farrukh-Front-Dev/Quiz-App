"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {jwtDecode} from "jwt-decode";
import { setCredentials, loadFromStorage } from "@/store/slices/authSlice";
import { loginUser } from "@/services/auth";

interface DecodedToken {
  sub: string;
  phone?: string;
  role: "user" | "admin" | "super-admin";
}

export default function UserLogin() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { dispatch(loadFromStorage()); }, [dispatch]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await loginUser({ phone });
      if (res.access_token && res.user) {
        const decoded: DecodedToken = jwtDecode(res.access_token);
        dispatch(setCredentials({
          user: { ...res.user, role: decoded.role || "user" },
          token: res.access_token
        }));
        router.push("/user/dashboard");
      } else { setError("Login failed"); }
    } catch (err: any) { setError(err.message || "Something went wrong"); }
  }

  return (
    <form onSubmit={handleLogin}>
      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" required />
      <button type="submit">Login</button>
      {error && <p>{error}</p>}
    </form>
  );
}
