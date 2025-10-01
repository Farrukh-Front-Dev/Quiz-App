"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  User,
} from "@/store/slices/usersSlice";
import { Table, Button, Modal, Form, Input, Spin, Alert } from "antd";
import { useUserColumns } from "@/app/admin/users/useUserColumns";
import { FaUsers } from "react-icons/fa";

export default function UsersDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: users, loading, error } = useSelector(
    (state: RootState) => state.users
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [form] = Form.useForm();

  // 📡 Fetch users
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // 🔄 Responsive pageSize
  useEffect(() => {
    const updatePageSize = () => {
      if (window.innerWidth >= 1600) setPageSize(12);
      else if (window.innerWidth >= 1200) setPageSize(10);
      else if (window.innerWidth >= 992) setPageSize(8);
      else if (window.innerWidth >= 768) setPageSize(6);
      else setPageSize(4);
    };
    updatePageSize();
    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, []);

  // 🔍 Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(timeout);
  }, [searchText]);

  // 🧠 Filtered users
  const filteredUsers = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.surname.toLowerCase().includes(term) ||
        u.phone.toLowerCase().includes(term)
    );
  }, [users, debouncedSearch]);

  // Handlers
  const handleCreate = useCallback(() => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  }, [form]);

  const handleEdit = useCallback(
    (user: User) => {
      setEditingUser(user);
      form.setFieldsValue(user);
      setIsModalOpen(true);
    },
    [form]
  );

  const handleSave = useCallback(async () => {
    const values = await form.validateFields();
    if (editingUser) {
      await dispatch(updateUser({ ...editingUser, ...values })).unwrap();
    } else {
      await dispatch(createUser(values)).unwrap();
    }
    setIsModalOpen(false);
    form.resetFields();
  }, [dispatch, editingUser, form]);

  const handleDelete = useCallback(
    async (id: string) => {
      await dispatch(deleteUser(id)).unwrap();
    },
    [dispatch]
  );

  // 📊 Columns
  const columns = useUserColumns({ onEdit: handleEdit, onDelete: handleDelete });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{<FaUsers />} Users boshqaruvi</h1>
        <Button type="primary" onClick={handleCreate}>
          ➕ Yangi user qo‘shish
        </Button>
      </div>

      {/* 🔍 Search bar */}
      <Input.Search
        placeholder="Ism, familiya yoki telefon bo‘yicha izlash..."
        allowClear
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ maxWidth: 400, marginBottom: 16 }}
      />

      {/* Loader va xatolik */}
      {loading && <Spin tip="Yuklanmoqda..." className="mb-4" />}
      {error && <Alert type="error" message={error} className="mb-4" />}

      {/* Jadval */}
      <Table
        dataSource={filteredUsers}
        rowKey="id"
        pagination={{ pageSize, showSizeChanger: false }}
        columns={columns}
      />

      {/* Modal */}
      <Modal
        open={isModalOpen}
        title={editingUser ? "Userni tahrirlash" : "Yangi user qo‘shish"}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={handleSave}
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Ism" rules={[{ required: true, message: "Ism kerak!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="surname" label="Familiya" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Telefon" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="izoh" label="Izoh">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
