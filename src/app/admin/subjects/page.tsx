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
  Typography,
} from "antd";
import { useSubjectColumns } from "@/app/admin/subjects/useSubjectColumns";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    dispatch(loadSubjects());
  }, [dispatch]);

  // Ekran o'lchamiga qarab pageSize ni moslash
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
      message.error(err?.message || "Xatolik!");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(removeSubject(id)).unwrap();
      message.success("Fan o‘chirildi!");
    } catch (err: any) {
      message.error(err?.message || "Xatolik!");
    }
  };

  const filteredSubjects = useMemo(() => {
    return (subjects ?? []).filter((s) =>
      s?.title?.toLowerCase().includes((searchQuery ?? "").toLowerCase())
    );
  }, [subjects, searchQuery]);

  const columns = useSubjectColumns({ openEditModal, handleDelete });

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
        dataSource={filteredSubjects}
        columns={columns}
        loading={loading}
        pagination={{ pageSize }}
      />

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
