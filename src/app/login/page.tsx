"use client";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-6">Kirish turini tanlang</h1>

        <div className="flex flex-col gap-4">
          {/* 👤 User Login */}
          <button
            onClick={() => router.push("/login/user")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-lg font-medium"
          >
            User Login
          </button>

          {/* 🛠 Admin Login */}
          <button
            onClick={() => router.push("/login/admin")}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 px-4 rounded-lg text-lg font-medium"
          >
            Admin Login
          </button>

          {/* ✍️ User Registration */}
          <button
            onClick={() => router.push("/login/userRegister")}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg text-lg font-medium"
          >
            User Registration
          </button>
        </div>
      </div>
    </div>
  );
}
