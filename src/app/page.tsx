"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Welcome to Quiz App</h1>
      <div className="flex gap-4">
        <button
          className=" rounded-2xl p-2 bg-red-400"
          onClick={() => router.push("/login/user")}
        >
          User Login
        </button>
        <button
          className="bg-green-500 p-2 rounded-2xl"
          onClick={() => router.push("/login/admin")}
        >
          Admin Login
        </button>
      </div>
    </div>
  );
}
