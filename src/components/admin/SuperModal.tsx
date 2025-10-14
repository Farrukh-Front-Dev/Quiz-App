"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  List,
  Space,
  Typography,
  Popconfirm,
  Divider,
  notification,
  InputNumber,
} from "antd";
import { Subject } from "@/store/slices/subjectsSlice";
import { Grade } from "@/store/slices/gradesSlice";
import {
  Trash2,
  ShieldPlus,
  Edit,
  CircleCheckBig,
  Plus,
  X,
  Timer,
  ListChecks,
} from "lucide-react";

const { Title } = Typography;

// ===== Notification Hook =====
const useNotify = () => {
  const notifySuccess = useCallback((message: string) => {
    notification.success({ message, placement: "topRight" });
  }, []);
  const notifyError = useCallback((message: string) => {
    notification.error({ message, placement: "topRight" });
  }, []);
  return { notifySuccess, notifyError };
};

interface SuperModalProps {
  open: boolean;
  subject: Subject | null;
  loading: boolean;
  onClose: () => void;
  onSaveSubject: (values: { id?: string; title: string }) => Promise<void>;
  onAddGrade: (payload: {
    title: string;
    subjectId: string;
    time: number;
    questionCount: number;
  }) => Promise<Grade>;
  onUpdateGrade: (payload: {
    id: string;
    title: string;
    subjectId: string;
    time: number;
    questionCount: number;
  }) => Promise<Grade>;
  onDeleteGrade: (id: string) => Promise<void>;
}

export default function SuperModal({
  open,
  subject,
  loading,
  onClose,
  onSaveSubject,
  onAddGrade,
  onUpdateGrade,
  onDeleteGrade,
}: SuperModalProps) {
  const [form] = Form.useForm();
  const [gradeForm] = Form.useForm();
  const [grades, setGrades] = useState<Grade[]>(subject?.grades || []);
  const [editingGradeId, setEditingGradeId] = useState<string | "new" | null>(
    null
  );

  const { notifySuccess, notifyError } = useNotify();

  // sync local grades state when modal opens or subject changes
  useEffect(() => {
    setGrades(subject?.grades || []);
  }, [subject]);

  // === Fan saqlash ===
  const handleSaveSubject = async (values: { id?: string; title: string }) => {
    try {
      await onSaveSubject(values);
      notifySuccess(
        values.id
          ? "Fan muvaffaqiyatli tahrirlandi!"
          : "Fan muvaffaqiyatli qo‘shildi!"
      );
      form.resetFields();
    } catch (err: any) {
      notifyError(err?.message || "Fan saqlashda xatolik!");
    }
  };

  // === Daraja qo‘shish ===
  const handleAddGrade = async (values: {
    title: string;
    time: number;
    questionCount: number;
  }) => {
    if (!subject) return;
    try {
      const newGrade = await onAddGrade({
        title: values.title,
        subjectId: subject.id,
        time: values.time,
        questionCount: values.questionCount,
      });
      setGrades((prev) => [...prev, newGrade]);
      setEditingGradeId(null);
      gradeForm.resetFields();
      notifySuccess("Daraja qo‘shildi!");
    } catch (err: any) {
      notifyError(err?.message || "Daraja qo‘shishda xatolik!");
    }
  };

  // === Daraja yangilash ===
  const handleUpdateGrade = async (
    id: string,
    values: { title: string; time: number; questionCount: number }
  ) => {
    if (!subject) return;
    try {
      const updatedGrade = await onUpdateGrade({
        id,
        subjectId: subject.id,
        ...values,
      });
      setGrades((prev) =>
        prev.map((g) => (g.id === id ? updatedGrade : g))
      );
      setEditingGradeId(null);
      gradeForm.resetFields();
      notifySuccess("Daraja muvaffaqiyatli tahrirlandi!");
    } catch (err: any) {
      notifyError(err?.message || "Daraja tahrirlashda xatolik!");
    }
  };

  // === Daraja o‘chirish ===
  const handleDeleteGrade = async (id: string) => {
    try {
      await onDeleteGrade(id);
      setGrades((prev) => prev.filter((g) => g.id !== id));
      notifySuccess("Daraja o‘chirildi!");
    } catch (err: any) {
      notifyError(err?.message || "Daraja o‘chirishda xatolik!");
    }
  };

  return (
    <Modal
      open={open}
      title="Fan va darajalarni boshqarish"
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      {/* FAN NOMI */}
      <Form
        form={form}
        initialValues={{ title: subject?.title || "" }}
        onFinish={handleSaveSubject}
        layout="vertical"
      >
        <Form.Item
          name="title"
          label="Fan nomi"
          rules={[{ required: true, message: "Fan nomini kiriting" }]}
        >
          <Input placeholder="Masalan: Matematika" />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading} block>
          <CircleCheckBig /> Fanni saqlash
        </Button>
      </Form>

      <Divider />

      {/* DARAJALAR */}
      <div>
        <Title className="flex justify-center items-center" level={5}>
          <ShieldPlus className="text-green-600 mr-2" /> Darajalar
        </Title>

        <List
          bordered
          size="small"
          dataSource={grades}
          renderItem={(grade: Grade) => (
            <List.Item
              actions={[
                <Button
                  key="edit"
                  type="link"
                  size="small"
                  icon={<Edit size={14} />}
                  onClick={() => {
                    gradeForm.setFieldsValue({
                      title: grade.title,
                      time: grade.time,
                      questionCount: grade.questionCount,
                    });
                    setEditingGradeId(grade.id);
                  }}
                >
                  Tahrirlash
                </Button>,
                <Popconfirm
                  key="delete"
                  title="Darajani o‘chirasizmi?"
                  onConfirm={() => handleDeleteGrade(grade.id)}
                >
                  <Button
                    size="small"
                    danger
                    type="link"
                    icon={<Trash2 size={14} />}
                  >
                    O‘chirish
                  </Button>
                </Popconfirm>,
              ]}
            >
              {editingGradeId === grade.id ? (
                <Form
                  form={gradeForm}
                  initialValues={{
                    title: grade.title,
                    time: grade.time,
                    questionCount: grade.questionCount,
                  }}
                  onFinish={(values) => handleUpdateGrade(grade.id, values)}
                >
                  <Space>
                    <Form.Item name="title" rules={[{ required: true }]}>
                      <Input size="small" placeholder="Daraja nomi" />
                    </Form.Item>
                    <Form.Item name="time" rules={[{ required: true }]}>
                      <InputNumber
                        size="small"
                        placeholder="Vaqt (daq.)"
                        min={1}
                        prefix={<Timer size={12} />}
                      />
                    </Form.Item>
                    <Form.Item name="questionCount" rules={[{ required: true }]}>
                      <InputNumber
                        size="small"
                        placeholder="Savollar soni"
                        min={1}
                        prefix={<ListChecks size={12} />}
                      />
                    </Form.Item>
                    <Button htmlType="submit" size="small" type="primary">
                      💾
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setEditingGradeId(null)}
                      icon={<X size={14} />}
                    />
                  </Space>
                </Form>
              ) : (
                <span>
                  {grade.title} — ⏱ {grade.time} daq., ❓ {grade.questionCount} ta
                  savol
                </span>
              )}
            </List.Item>
          )}
        />

        {/* YANGI DARAJA */}
        {editingGradeId === "new" ? (
          <Form form={gradeForm} onFinish={handleAddGrade} layout="inline">
            <Form.Item
              name="title"
              rules={[{ required: true, message: "Daraja nomini kiriting" }]}
            >
              <Input size="small" placeholder="Daraja nomi" />
            </Form.Item>
            <Form.Item
              name="time"
              rules={[{ required: true, message: "Vaqtni kiriting" }]}
            >
              <InputNumber
                size="small"
                placeholder="Vaqt (daq.)"
                min={1}
                prefix={<Timer size={12} />}
              />
            </Form.Item>
            <Form.Item
              name="questionCount"
              rules={[{ required: true, message: "Savollar sonini kiriting" }]}
            >
              <InputNumber
                size="small"
                placeholder="Savollar soni"
                min={1}
                prefix={<ListChecks size={12} />}
              />
            </Form.Item>
            <Button htmlType="submit" size="small" type="primary" icon={<Plus size={14} />} />
            <Button size="small" onClick={() => setEditingGradeId(null)} icon={<X size={14} />} />
          </Form>
        ) : (
          subject && (
            <Button
              className="mt-3"
              onClick={() => {
                gradeForm.resetFields();
                setEditingGradeId("new");
              }}
              block
              icon={<Plus size={14} />}
            >
              Yangi   
            </Button>
          )
        )}
      </div>
    </Modal>
  );
}
