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
  const [pageSize, setPageSize] = useState(8);
  const [form] = Form.useForm();

  // 📡 Fetch users
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // 🔄 Page size — noutbuk va katta ekranlar uchun optimallashtirilgan
  useEffect(() => {
    const updatePageSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      let size = 6;

      if (width >= 1700 && height >= 800) size = 12; // katta monitorlar
      else if (width >= 1366 && height >= 700) size = 10; // odatiy noutbuklar (Full HD)
      else if (width >= 1100 && height >= 650) size = 8; // o‘rtacha noutbuklar
      else if (width >= 900) size = 6; // kichik noutbuk
      else size = 4; // planshet / telefon

      console.log("📏 width:", width, "height:", height, "=> pageSize:", size);
      setPageSize(size);
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

  // ✏️ Handlers
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

  // ✅ Pagination config (useMemo bilan)
  const paginationConfig = useMemo(
    () => ({
      pageSize,
      showSizeChanger: false,
    }),
    [pageSize]
  );

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaUsers /> Users boshqaruvi
        </h1>
        <Button type="primary" onClick={handleCreate}>
          ➕ Yangi user qo‘shish
        </Button>
      </div>

      <Input.Search
        placeholder="Ism, familiya yoki telefon bo‘yicha izlash..."
        allowClear
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ maxWidth: 400, marginBottom: 16 }}
      />

      {loading && (
        <div className="flex justify-center mb-4">
          <Spin tip="Yuklanmoqda..." />
        </div>
      )}
      {error && <Alert type="error" message={error} className="mb-4" />}

      {/* Jadval konteyneri */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <Table
          dataSource={filteredUsers}
          rowKey="id"
          pagination={paginationConfig}
          columns={columns}
          scroll={{ x: "max-content" }} // faqat ustunlar sig‘masa scroll chiqadi
        />
      </div>

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
          <Form.Item
            name="name"
            label="Ism"
            rules={[{ required: true, message: "Ism kerak!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="surname"
            label="Familiya"
            rules={[{ required: true, message: "Familiya kerak!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Telefon"
            rules={[{ required: true, message: "Telefon kerak!" }]}
          >
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
