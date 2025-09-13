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
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Spin,
  Popconfirm,
  Alert,
  Avatar,
} from "antd";

export default function UsersDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: users, loading, error } = useSelector(
    (state: RootState) => state.users
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  // Fetch users
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // ✅ Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(timeout);
  }, [searchText]);

  // ✅ Filtering
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">👥 Users boshqaruvi</h1>
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

      {/* ✅ Loading & Error UI */}
      {loading && <Spin tip="Yuklanmoqda..." className="mb-4" />}
      {error && <Alert type="error" message={error} className="mb-4" />}

      {/* ✅ Table with only pagination */}
      <Table
        dataSource={filteredUsers}
        rowKey="id"
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
        }}
        columns={[
          {
            title: "Rasm",
            dataIndex: "avatar",
            width: 70,
            render: () => (
              <Avatar
                src="/students-icon.png"
                size={40}
                style={{ backgroundColor: "#f5f5f5" }}
              />
            ),
          },
          { title: "Ism", dataIndex: "name", width: 150 },
          { title: "Familiya", dataIndex: "surname", width: 150 },
          { title: "Telefon", dataIndex: "phone", width: 150 },
          {
            title: "Izoh",
            dataIndex: "izoh",
            width: 200,
            render: (izoh) => izoh || "-",
          },
          {
            title: "Amallar",
            width: 200,
            render: (_, record: User) => (
              <Space>
                <Button type="primary" onClick={() => handleEdit(record)}>
                  Tahrirlash
                </Button>
                <Popconfirm
                  title="Rostan ham o‘chirmoqchimisiz?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Ha"
                  cancelText="Yo‘q"
                >
                  <Button danger>O‘chirish</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
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
          <Form.Item
            name="name"
            label="Ism"
            rules={[{ required: true, message: "Ism kerak!" }]}
          >
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
