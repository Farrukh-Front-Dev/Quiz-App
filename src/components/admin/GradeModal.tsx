"use client";

import { useEffect } from "react";
import { Modal, Form, Input, Button, Popconfirm, Space } from "antd";
import { Grade, Subject } from "@/store/slices/gradesSlice";

interface GradeModalProps {
  open: boolean;
  loading: boolean;
  subject: Subject | null; // qaysi fan uchun daraja
  grade: Grade | null; // agar null bo‘lsa -> yangi qo‘shish
  onClose: () => void;
  onSave: (values: { title: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSwitchToAdd: () => void; // yangi qo‘shishga o‘tish tugmasi
}

export default function GradeModal({
  open,
  loading,
  subject,
  grade,
  onClose,
  onSave,
  onDelete,
  onSwitchToAdd,
}: GradeModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (grade) {
      form.setFieldsValue({ title: grade.title });
    } else {
      form.resetFields();
    }
  }, [grade, open]);

  return (
    <Modal
      title={
        grade
          ? `Darajani tahrirlash (${subject?.title})`
          : `Yangi daraja qo‘shish (${subject?.title})`
      }
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={grade ? "Saqlash" : "Qo‘shish"}
    >
      <Form form={form} layout="vertical" onFinish={onSave}>
        <Form.Item
          name="title"
          label="Daraja nomi"
          rules={[{ required: true, message: "Daraja nomi majburiy!" }]}
        >
          <Input placeholder="Masalan: 1-sinf" />
        </Form.Item>
      </Form>

      <Space className="mt-4">
        {grade && (
          <Popconfirm
            title="Darajani o‘chirish"
            description="Bu darajani o‘chirishni xohlaysizmi?"
            onConfirm={() => onDelete(grade.id)}
            okText="Ha"
            cancelText="Yo‘q"
          >
            <Button danger>O‘chirish</Button>
          </Popconfirm>
        )}

        {/* ✅ yangi qo‘shishga o‘tish tugmasi */}
        {!grade && (
          <Button onClick={onSwitchToAdd} type="dashed">
            + Yangi daraja qo‘shish
          </Button>
        )}
      </Space>
    </Modal>
  );
}
