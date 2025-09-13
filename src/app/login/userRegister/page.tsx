"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";
import { registerUser } from "@/services/auth";

export default function UserRegister() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    console.log("Register button clicked");
    console.log("Form data:", { name, surname, phone });

    try {
      const res = await registerUser({ name, surname, phone });
      console.log("API response:", res);

      if (res.access_token && res.user) {
        console.log("Saving user and token to Redux store");
        dispatch(setCredentials({ user: res.user, token: res.access_token }));
        console.log("Redirecting to /user/dashboard");
        router.push("/user/dashboard");
      } else {
        console.log("No token returned, redirecting to login");
        router.push("/user/login");
      }
    } catch (err: any) {
      console.log("Error occurred:", err);
      setError(err.message);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form
        onSubmit={handleRegister}
        className="p-6 bg-white rounded-2xl shadow-lg w-96 mb-4"
      >
        <h1 className="text-xl font-bold mb-4">User Register</h1>
        {error && <p className="text-red-500 mb-2">{error}</p>}

        <input
          type="text"
          placeholder="Ism"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
          required
        />
        <input
          type="text"
          placeholder="Familiya"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
          required
        />
        <input
          type="tel"
          placeholder="Telefon raqam"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
          required
        />

        <button
          type="submit"
          className="bg-green-600 text-white p-2 w-full rounded"
        >
          Ro‘yxatdan o‘tish
        </button>
      </form>

      {/* 🔹 Login sahifasiga o'tish tugmasi */}
      <button
        onClick={() => router.push("/login/user")}
        className="text-blue-600 underline"
      >
        Allaqachon hisobingiz bormi? Login
      </button>
    </div>
  );
}
