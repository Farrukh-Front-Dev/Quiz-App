"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {jwtDecode} from "jwt-decode";
import { setCredentials, loadFromStorage } from "@/store/slices/authSlice";
import { loginUser } from "@/services/auth";
import { Input, Button, Form, message } from "antd";

interface DecodedToken {
  sub: string;
  phone?: string;
  role: "user" | "admin" | "super-admin";
}

export default function UserLogin() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(loadFromStorage());
  }, [dispatch]);

  const handleLogin = async (values: { phone: string }) => {
    setLoading(true);
    try {
      const res = await loginUser({ phone: values.phone });
      if (res.access_token && res.user) {
        const decoded: DecodedToken = jwtDecode(res.access_token);
        dispatch(
          setCredentials({
            user: { ...res.user, role: decoded.role || "user" },
            token: res.access_token,
          })
        );
        message.success("Login muvaffaqiyatli ✅");
        router.push("/user/select");

      } else {
        message.error("Login failed ❌");
      }
    } catch (err: any) {
      message.error(err.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">User Login</h1>
      <Form onFinish={handleLogin} layout="vertical">
        <Form.Item
          label="Phone"
          name="phone"
          rules={[{ required: true, message: "Phone raqamni kiriting" }]}
        >
          <Input placeholder="Phone raqam" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
