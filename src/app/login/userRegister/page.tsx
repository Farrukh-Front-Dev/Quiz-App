"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";
import { registerUser } from "@/services/auth";
import { Card, Input, Button, message, Form } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import Particles from "@/ReactBits/Particles";

export default function UserRegister() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(values: {
    name: string;
    surname: string;
    phone: string;
  }): Promise<void> {
    setError("");
    setLoading(true);

    try {
      const res = await registerUser({
        name: values.name,
        surname: values.surname,
        phone: values.phone,
      });

      if (res.access_token && res.user) {
        dispatch(setCredentials({ user: res.user, token: res.access_token }));
        message.success("Ro&apos;yxatdan o&apos;tish muvaffaqiyatli! ✅");
        router.push("/user/select");
      } else {
        setError("Ro&apos;yxatdan o&apos;tish muvaffaq bo&apos;lmadi");
        message.error("Ro&apos;yxatdan o&apos;tish muvaffaq bo&apos;lmadi");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Server xatosi";
      setError(errorMessage);
      message.error(errorMessage);
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
            <UserOutlined className="text-white text-3xl sm:text-4xl" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">
            Ro&apos;yxatdan O&apos;tish
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Yangi akkaunt yaratish va testlarni boshlash
          </p>
        </div>

        {/* Form Card - Blur Effect */}
        <Card className="shadow-2xl bg-black/20 backdrop-blur-xl border border-green-500/20">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleRegister}
            className="space-y-4"
          >
            {/* Name Input */}
            <Form.Item
              label={<span className="font-semibold text-white">Ism</span>}
              name="name"
              rules={[
                { required: true, message: "Ismni kiriting" },
                {
                  min: 2,
                  message:
                    "Ism kamida 2 ta harfdan iborat bo'lishi kerak",
                },
              ]}
            >
              <Input
                placeholder="Ismingiz"
                size="large"
                prefix={
                  <UserOutlined className="text-green-400" />
                }
                className="rounded-lg bg-white/10 border-green-500/30 text-white placeholder:text-gray-500"
              />
            </Form.Item>

            {/* Surname Input */}
            <Form.Item
              label={<span className="font-semibold text-white">Familiya</span>}
              name="surname"
              rules={[
                { required: true, message: "Familiyani kiriting" },
                {
                  min: 2,
                  message:
                    "Familiya kamida 2 ta harfdan iborat bo'lishi kerak",
                },
              ]}
            >
              <Input
                placeholder="Familiyangiz"
                size="large"
                prefix={
                  <UserOutlined className="text-green-400" />
                }
                className="rounded-lg bg-white/10 border-green-500/30 text-white placeholder:text-gray-500"
              />
            </Form.Item>

            {/* Phone Input */}
            <Form.Item
              label={
                <span className="font-semibold text-white">
                  Telefon Raqami
                </span>
              }
              name="phone"
              rules={[
                { required: true, message: "Telefon raqamni kiriting" },
                {
                  pattern: /^\+?[0-9]{9,15}$/,
                  message: "Noto'g'ri telefon raqam",
                },
              ]}
            >
              <Input
                placeholder="+998 99 123 45 67"
                size="large"
                prefix={
                  <PhoneOutlined className="text-green-400" />
                }
                className="rounded-lg bg-white/10 border-green-500/30 text-white placeholder:text-gray-500"
              />
            </Form.Item>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Form.Item className="mb-0">
              <Button
                type="primary"
                size="large"
                block
                htmlType="submit"
                loading={loading}
                disabled={loading}
                className="
                  bg-green-500 hover:bg-green-600 border-0
                  font-semibold text-base h-12 text-black
                "
              >
                {loading ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan O'tish"}
              </Button>
            </Form.Item>
          </Form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-green-500/20"></div>
            <span className="text-green-500/60 text-xs">yoki</span>
            <div className="flex-1 h-px bg-green-500/20"></div>
          </div>

          {/* Login Link */}
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
            Allaqachon hisobingiz bormi?
          </Button>
        </Card>
      </div>
    </div>
  );
}
