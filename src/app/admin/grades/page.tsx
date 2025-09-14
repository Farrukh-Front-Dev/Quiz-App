"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  fetchGrades,
  createGrade,
  updateGrade,
  deleteGrade,
  Grade,
} from "@/store/slices/gradesSlice";
import { loadSubjects, Subject } from "@/store/slices/subjectsSlice";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  Tag,
  Spin,
  message,
} from "antd";

export default function GradesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: grades, loading, error } = useSelector((state: RootState) => state.grades);
  const { items: subjects } = useSelector((state: RootState) => state.subjects);

  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchGrades());
    dispatch(loadSubjects());
  }, [dispatch]);

  const filteredGrades = filterSubject
    ? grades.filter((g) => g.subject?.id === filterSubject)
    : grades;

  const openCreateModal = () => {
    setEditingGrade(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (grade: Grade) => {
    setEditingGrade(grade);
    form.setFieldsValue({
      title: grade.title,
      subject_id: grade.subject.id,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingGrade) {
        await dispatch(
          updateGrade({ id: editingGrade.id, ...values })
        ).unwrap();
        message.success("Daraja o‘zgartirildi!");
      } else {
        await dispatch(createGrade(values)).unwrap();
        message.success("Daraja qo‘shildi!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      message.error(err.message || "Xatolik!");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteGrade(id)).unwrap();
      message.success("Daraja o‘chirildi!");
    } catch (err: any) {
      message.error(err.message || "O‘chirishda xatolik!");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📊 Darajalar boshqaruvi</h1>
        <Button type="primary" onClick={openCreateModal}>
          + Yangi daraja
        </Button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <Select
          allowClear
          placeholder="Fan bo‘yicha filter"
          style={{ width: 250 }}
          onChange={(value) => setFilterSubject(value || null)}
        >
          {subjects.map((s: Subject) => (
            <Select.Option key={s.id} value={s.id}>
              {s.title}
            </Select.Option>
          ))}
        </Select>
      </div>

      {loading && <Spin tip="Yuklanmoqda..." />}
      {error && <p className="text-red-500">{error}</p>}

      <Table
        dataSource={filteredGrades}
        rowKey="id"
        pagination={{ pageSize: 6 }}
        columns={[
          { title: "Daraja nomi", dataIndex: "title" },
          {
            title: "Fan",
            render: (_, record: Grade) => (
              <Tag color="blue">{record.subject?.title}</Tag>
            ),
          },
          {
            title: "Status",
            dataIndex: "is_active",
            render: (active: boolean) =>
              active ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
          },
          {
            title: "Amallar",
            render: (_, record: Grade) => (
              <Space>
                <Button onClick={() => openEditModal(record)}>Tahrirlash</Button>
                <Popconfirm
                  title="O‘chirishni tasdiqlaysizmi?"
                  onConfirm={() => handleDelete(record.id)}
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
        title={editingGrade ? "Darajani tahrirlash" : "Yangi daraja qo‘shish"}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText="Saqlash"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Daraja nomi"
            rules={[{ required: true, message: "Daraja nomini kiriting!" }]}
          >
            <Input placeholder="Masalan: A1" />
          </Form.Item>
          <Form.Item
            name="subject_id"
            label="Fan"
            rules={[{ required: true, message: "Fan tanlang!" }]}
          >
            <Select placeholder="Fan tanlang">
              {subjects.map((s: Subject) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
