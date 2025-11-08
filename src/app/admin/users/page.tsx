"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  clearError,
  User,
} from "@/store/slices/usersSlice";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Spin,
  Alert,
  Empty,
  message,
} from "antd";
import { useUserColumns } from "@/app/admin/users/useUserColumns";
import { FaUsers } from "react-icons/fa";
import { UserPlus } from "lucide-react";

/**
 * Users Dashboard Component - CRM Style
 * Optimized with memoization and proper error handling
 */
export default function UsersDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: users, loading, error } = useSelector(
    (state: RootState) => state.users
  );

  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageSize, setPageSize] = useState(8);
  const [form] = Form.useForm();

  // Fetch users on mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Debounced search (300ms delay)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchText]);

  // Dynamic page size based on screen dimensions
  useEffect(() => {
    const updatePageSize = () => {
      const { innerWidth: width, innerHeight: height } = window;

      let size = 6;
      if (width >= 1920 && height >= 900) size = 15;
      else if (width >= 1700 && height >= 800) size = 12;
      else if (width >= 1366 && height >= 700) size = 10;
      else if (width >= 1100 && height >= 650) size = 8;
      else if (width >= 900) size = 6;
      else size = 5;

      setPageSize(size);
    };

    updatePageSize();
    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, []);

  // Filtered users with memoization
  const filteredUsers = useMemo(() => {
    if (!debouncedSearch.trim()) return users;

    const term = debouncedSearch.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.surname.toLowerCase().includes(term) ||
        user.phone.toLowerCase().includes(term) ||
        user.izoh?.toLowerCase().includes(term)
    );
  }, [users, debouncedSearch]);

  // Modal handlers
  const handleOpenCreateModal = useCallback(() => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  }, [form]);

  const handleOpenEditModal = useCallback(
    (user: User) => {
      setEditingUser(user);
      form.setFieldsValue({
        name: user.name,
        surname: user.surname,
        phone: user.phone,
        izoh: user.izoh || "",
      });
      setIsModalOpen(true);
    },
    [form]
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingUser(null);
    form.resetFields();
  }, [form]);

  const handleSaveUser = useCallback(async () => {
    try {
      const values = await form.validateFields();

      if (editingUser) {
        await dispatch(updateUser({ id: editingUser.id, ...values })).unwrap();
        message.success("User muvaffaqiyatli yangilandi!");
      } else {
        await dispatch(createUser(values)).unwrap();
        message.success("Yangi user qo'shildi!");
      }

      handleCloseModal();
    } catch (error: any) {
      message.error(error?.message || "Xatolik yuz berdi!");
    }
  }, [dispatch, editingUser, form, handleCloseModal]);

  const handleDeleteUser = useCallback(
    async (userId: string) => {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        message.success("User o'chirildi!");
      } catch (error: any) {
        message.error(error?.message || "O'chirishda xatolik!");
      }
    },
    [dispatch]
  );

  // Table columns
  const columns = useUserColumns({
    onEdit: handleOpenEditModal,
    onDelete: handleDeleteUser,
  });

  // Pagination config
  const paginationConfig = useMemo(
    () => ({
      pageSize,
      showSizeChanger: false,
      showTotal: (total: number, range: [number, number]) =>
        `${range[0]}-${range[1]} / ${total}`,
    }),
    [pageSize]
  );

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaUsers /> Users boshqaruvi
        </h1>
        <Button
          type="primary"
          size="large"
          icon={<UserPlus size={18} />}
          onClick={handleOpenCreateModal}
        >
          Yangi user qo'shish
        </Button>
      </div>

      {/* Search */}
      <Input.Search
        placeholder="Ism, familiya, telefon yoki izoh bo'yicha qidirish..."
        allowClear
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        size="large"
        style={{ maxWidth: 500, marginBottom: 16 }}
      />

      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          message="Xatolik"
          description={error}
          showIcon
          closable
          onClose={() => dispatch(clearError())}
          className="mb-4"
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Spin size="large" tip="Yuklanmoqda..." />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredUsers.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12">
          <Empty
            description={
              searchText
                ? "Qidiruv bo'yicha natija topilmadi"
                : "Hozircha foydalanuvchilar yo'q"
            }
          >
            {!searchText && (
              <Button type="primary" onClick={handleOpenCreateModal}>
                Birinchi userni qo'shish
              </Button>
            )}
          </Empty>
        </div>
      )}

      {/* Users Table */}
      {!loading && filteredUsers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-green-500">
          <Table
            dataSource={filteredUsers}
            columns={columns}
            rowKey="id"
            pagination={paginationConfig}
            scroll={{ x: 1200 }}
            loading={loading}
          />
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={isModalOpen}
        title={editingUser ? "Userni tahrirlash" : "Yangi user qo'shish"}
        onCancel={handleCloseModal}
        onOk={handleSaveUser}
        okText="Saqlash"
        cancelText="Bekor qilish"
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Ism"
            rules={[
              { required: true, message: "Ism kiriting!" },
              { min: 2, message: "Ism kamida 2 ta harf bo'lishi kerak!" },
              { max: 50, message: "Ism 50 ta harfdan oshmasligi kerak!" },
            ]}
          >
            <Input placeholder="Masalan: Aziz" size="large" />
          </Form.Item>

          <Form.Item
            name="surname"
            label="Familiya"
            rules={[
              { required: true, message: "Familiya kiriting!" },
              { min: 2, message: "Familiya kamida 2 ta harf bo'lishi kerak!" },
              { max: 50, message: "Familiya 50 ta harfdan oshmasligi kerak!" },
            ]}
          >
            <Input placeholder="Masalan: Valiyev" size="large" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Telefon"
            rules={[
              { required: true, message: "Telefon raqam kiriting!" },
              {
                pattern: /^[\d\s\-\+\(\)]+$/,
                message: "Telefon raqam noto'g'ri formatda!",
              },
            ]}
          >
            <Input placeholder="+998 90 123 45 67" size="large" />
          </Form.Item>

          <Form.Item
            name="izoh"
            label="Izoh (ixtiyoriy)"
            rules={[
              { max: 200, message: "Izoh 200 ta belgidan oshmasligi kerak!" },
            ]}
          >
            <Input.TextArea
              placeholder="Qo'shimcha ma'lumot..."
              rows={4}
              showCount
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}