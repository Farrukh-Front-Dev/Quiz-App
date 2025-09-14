"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadSubjects,
  addSubject,
  editSubject,
  removeSubject,
  Subject,
} from "@/store/slices/subjectsSlice";
import { RootState, AppDispatch } from "@/store";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Tag,
  Space,
  Typography,
  Popconfirm,
  Avatar,
} from "antd";
import Link from "next/link";

const { Title } = Typography;
const { Search } = Input;

export default function SubjectsDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: subjects, loading, error } = useSelector(
    (state: RootState) => state.subjects
  );

  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // 🔍 search state

  useEffect(() => {
    dispatch(loadSubjects());
  }, [dispatch]);

  const openAddModal = () => {
    setEditingSubject(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    form.setFieldsValue({ title: subject.title });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingSubject) {
        await dispatch(editSubject({ id: editingSubject.id, title: values.title })).unwrap();
        message.success("Fan o‘zgartirildi!");
      } else {
        await dispatch(addSubject({ title: values.title })).unwrap();
        message.success("Fan qo‘shildi!");
      }
      setModalOpen(false);
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(removeSubject(id)).unwrap();
      message.success("Fan o‘chirildi!");
    } catch (err: any) {
      message.error(err.message || "Xatolik!");
    }
  };

  // 🔍 search filtering (case-insensitive)
  // 🔍 search filtering (case-insensitive)
  const filteredSubjects = useMemo(() => {
    // subjects bo'sh bo'lsa ham [], undefined bo'lsa ham ishlay oladi
    return (subjects ?? []).filter((s) => {
      // s yoki s.title undefined bo'lsa, false qaytaradi
      if (!s?.title) return false;
      return s.title.toLowerCase().includes((searchQuery ?? "").toLowerCase());
    });
  }, [subjects, searchQuery]);


  const columns = [
    {
      title: "Rasm",
      dataIndex: "avatar",
      width: 70,
      render: () => (
        <Avatar
          src="/subjects-icon.png"
          size={40}
          style={{ backgroundColor: "#f5f5f5" }}
        />
      ),
    },
    {
      title: "Fan nomi",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: Subject) => (
        <Link href={`/admin/subjects/${record.id}`}>
          <span className="font-medium hover:underline">{text}</span>
        </Link>
      ),
    },
    {
      title: "Darajalar",
      key: "grades",
      render: (_: any, record: Subject) =>
        record.grades.length > 0 ? (
          <div style={{ maxWidth: 200, overflowX: "auto" }}>
            <Space size={[4, 4]} wrap={false}>
              {record.grades.map((g) => (
                <Link
                  key={g.id}
                  href={`/admin/subjects/${record.id}/levels/${g.id}/tests`}
                >
                  <Tag color="blue">{g.title}</Tag>
                </Link>
              ))}
            </Space>
          </div>
        ) : (
          <Tag color="default">Mavjud emas</Tag>
        ),
    },

    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      render: (is_active: boolean) =>
        is_active ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_: any, record: Subject) => (
        <Space>
          <Button size="small" type="primary" onClick={() => openEditModal(record)}>
            Tahrirlash
          </Button>
          <Popconfirm
            title="Fanni o‘chirishni tasdiqlang"
            okText="Ha"
            cancelText="Yo‘q"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" color="red" danger>
              O‘chirish
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <Title level={3}>📚 Fanlar boshqaruvi</Title>
        <div className="flex gap-2">
          <Search
            placeholder="Fanlarni izlash..."
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ width: 250 }}
          />
          <Button type="primary" onClick={openAddModal}>
            + Yangi fan
          </Button>
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <Table
        rowKey="id"
        dataSource={filteredSubjects} // 🔍 filtered
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

      {/* Modal qo'shish / tahrirlash */}
      <Modal
        title={editingSubject ? "Fanni tahrirlash" : "Yangi fan qo‘shish"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editingSubject ? "Saqlash" : "Qo‘shish"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Fan nomi"
            rules={[{ required: true, message: "Fan nomi majburiy!" }]}
          >
            <Input placeholder="Masalan: Matematika" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
