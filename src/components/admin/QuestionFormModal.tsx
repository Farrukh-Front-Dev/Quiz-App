"use client";

import { FC, useMemo } from "react";
import { Modal, Form, Input, Button, Space, Select } from "antd";
import { Question, Subject } from "@/store/slices/questionsSlice";

const { Option } = Select;

interface Props {
  open: boolean;
  onCancel: () => void;
  onSave: (values: any) => void;
  editingQuestion: Question | null;
  subjects: Subject[];
  form: any;
}

const QuestionFormModal: FC<Props> = ({ open, onCancel, onSave, editingQuestion, subjects, form }) => {
  // tanlangan fan bo‘yicha darajalar
  const selectedSubjectId = form.getFieldValue("subjectId");
  const filteredGrades = useMemo(
    () => subjects.find(s => s.id === selectedSubjectId)?.grades || [],
    [subjects, selectedSubjectId]
  );

  const handleCorrectChange = (fields: any[], selectedIndex: number) => {
    fields.forEach((field, idx) => {
      form.setFieldValue(["options", idx, "is_correct"], idx === selectedIndex);
    });
  };

  return (
    <Modal
      open={open}
      title={editingQuestion ? "Savolni tahrirlash" : "Yangi savol"}
      onCancel={onCancel}
      onOk={() => form.submit()}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSave}
        initialValues={{
          options: editingQuestion?.options.length ? editingQuestion.options : [{}, {}, {}],
        }}
      >
        <Form.Item name="subjectId" label="Fan" rules={[{ required: true }]}>
          <Select
            placeholder="Fan tanlang"
            onChange={() => form.setFieldsValue({ gradeId: undefined })}
          >
            {subjects.map(s => (
              <Option key={s.id} value={s.id}>{s.title}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="gradeId" label="Daraja" rules={[{ required: true }]}>
          <Select placeholder="Daraja tanlang" disabled={!selectedSubjectId}>
            {filteredGrades.map(g => (
              <Option key={g.id} value={g.id}>{g.title}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="question" label="Savol matni" rules={[{ required: true }]}>
          <Input.TextArea />
        </Form.Item>

        <Form.List name="options">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, idx) => (
                <Space key={field.key} align="baseline">
                  <Form.Item
                    {...field}
                    name={[field.name, "variant"]}
                    fieldKey={[field.fieldKey!, "variant"]}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder={`Variant ${String.fromCharCode(65 + idx)}`} />
                  </Form.Item>

                  <Form.Item
                    {...field}
                    name={[field.name, "is_correct"]}
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <input
                      type="radio"
                      name={`correctOption-${editingQuestion?.id || "new"}`}
                      checked={form.getFieldValue(["options", idx, "is_correct"])}
                      onChange={() => handleCorrectChange(fields, idx)}
                    />
                  </Form.Item>

                  <Button danger onClick={() => remove(field.name)}>O‘chirish</Button>
                </Space>
              ))}
              <Button type="dashed" onClick={() => add()} style={{ marginTop: 8 }}>
                + Variant qo‘shish
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default QuestionFormModal;
