"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { setCredentials, loadFromStorage } from "@/store/slices/authSlice";
import { loginAdmin } from "@/services/auth";
import { RootState } from "@/store";
import { Card, Input, Button, message } from "antd";
import { LockOutlined, MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import Particles from "@/ReactBits/Particles";

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

        if (!["admin", "super-admin"].includes(decoded.role)) {
          setError("Admin paneliga kirishga huquqingiz yo'q.");
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

        message.success("Muvaffaqiyatli login qilindi!");
        if (decoded.role === "super-admin") router.push("/super-admin/dashboard");
        else router.push("/admin/dashboard");
      } else {
        setError("Login muvaffaq bo'lmadi");
      }
    } catch (err: any) {
      setError(err.message || "Server xatosi, qayta urinib ko'ring.");
      message.error(err.message || "Server xatosi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden">
      
      {/* Particles Background */}
      <div className="absolute inset-0 w-full h-full">
        <Particles
          particleColors={["#39ff14", "#39ff14", "#39ff14"]}
          particleCount={150}
          particleSpread={10}
          speed={0.08}
          particleBaseSize={80}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
        />
      </div>

      {/* Back Button */}
      <button
        onClick={() => router.push("/login")}
        className="
          absolute top-6 left-6 sm:top-8 sm:left-8 z-20
          flex items-center gap-2 text-white 
          hover:bg-white/10 px-4 py-2 rounded-lg
          transition-all duration-200
        "
      >
        <ArrowLeftOutlined className="text-lg" />
        <span className="text-sm sm:text-base font-medium">Orqaga</span>
      </button>

      {/* Content */}
      <div className="w-full max-w-md mt-12 sm:mt-0 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl mb-4 sm:mb-6 shadow-xl">
            <LockOutlined className="text-white text-3xl sm:text-4xl" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">
            Admin Login
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Admin panelga kirish uchun hisob ma'lumotlarini kiriting
          </p>
        </div>

        {/* Form Card - Blur Effect */}
        <Card className="shadow-2xl bg-black/20 backdrop-blur-xl border border-green-500/20">
          <form onSubmit={handleLogin} className="flex flex-col gap-4 sm:gap-5">
            
            {/* Email Input */}
            <div>
              <label className="block text-white font-semibold mb-2 text-sm">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                disabled={loading}
                prefix={<MailOutlined className="text-green-400" />}
                size="large"
                className="rounded-lg bg-white/10 border-green-500/30 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-white font-semibold mb-2 text-sm">
                Parol
              </label>
              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                prefix={<LockOutlined className="text-green-400" />}
                size="large"
                className="rounded-lg bg-white/10 border-green-500/30 text-white"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="primary"
              size="large"
              block
              htmlType="submit"
              disabled={loading}
              loading={loading}
              className="
                bg-green-500 hover:bg-green-600 border-0
                font-semibold text-base h-12 mt-2 text-black
              "
            >
              {loading ? "Login qilinmoqda..." : "Login"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-green-500/20"></div>
            <span className="text-green-500/60 text-xs">yoki</span>
            <div className="flex-1 h-px bg-green-500/20"></div>
          </div>

          {/* Back to User Login */}
          <Button
            block
            size="large"
            onClick={() => router.push("/login/user")}
            className="
              border-2 border-green-500/30 text-green-400 font-semibold
              hover:bg-green-500/10 transition-all text-base h-11
              bg-black/20
            "
          >
            Foydalanuvchi sifatida kirish
          </Button>
        </Card>
      </div>
    </div>
  );
}
