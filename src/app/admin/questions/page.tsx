"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  Question,
} from "@/store/slices/questionsSlice";
import { loadSubjects, Subject } from "@/store/slices/subjectsSlice";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Select,
  Popconfirm,
  message,
  Spin,
} from "antd";

const { Option } = Select;

export default function QuestionsDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: questions, loading, error } = useSelector(
    (state: RootState) => state.questions
  );
  const { items: subjects, loading: subjectsLoading } = useSelector(
    (state: RootState) => state.subjects
  );

  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>();
  const [selectedGrade, setSelectedGrade] = useState<string>();

  useEffect(() => {
    dispatch(loadSubjects());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchQuestions({ subjectId: selectedSubject, gradeId: selectedGrade }));
  }, [dispatch, selectedSubject, selectedGrade]);

  // Filter grades by selected subject
  const filteredGrades = useMemo(() => {
    const subject = subjects.find((s) => s.id === selectedSubject);
    return subject ? subject.grades : [];
  }, [subjects, selectedSubject]);

  const openAddModal = () => {
    setEditingQuestion(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (question?: Question) => {
    if (!question || !question.subject || !question.grade) {
      message.error("Savol ma'lumotlari to‘liq emas!");
      return;
    }
    setEditingQuestion(question);
    form.setFieldsValue({
      question: question.question,
      subjectId: question.subject.id,
      gradeId: question.grade.id,
      options: question.options.map((o) => ({ ...o })),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, options: values.options };
      if (editingQuestion) {
        await dispatch(updateQuestion({ id: editingQuestion.id, ...payload })).unwrap();
        message.success("Savol tahrirlandi!");
      } else {
        await dispatch(createQuestion(payload)).unwrap();
        message.success("Savol qo‘shildi!");
      }
      setModalOpen(false);
    } catch (err: any) {
      message.error(err.message || "Xatolik!");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteQuestion(id)).unwrap();
      message.success("Savol o‘chirildi!");
    } catch (err: any) {
      message.error(err.message || "Xatolik!");
    }
  };

  const columns = [
    { title: "№", dataIndex: "index", render: (_: any, __: any, index: number) => index + 1 },
    { title: "Savol", dataIndex: "question", key: "question" },
    { title: "A", dataIndex: ["options", 0, "variant"], key: "a" },
    { title: "B", dataIndex: ["options", 1, "variant"], key: "b" },
    { title: "C", dataIndex: ["options", 2, "variant"], key: "c" },
    {
      title: "Javob",
      key: "correct",
      render: (_: any, record: Question) => {
        const correct = record.options.find((o) => o.is_correct);
        return correct ? correct.variant : "-";
      },
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_: any, record: Question) => (
        <Space>
          <Button onClick={() => openEditModal(record)}>Tahrirlash</Button>
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
  ];

  if (loading || subjectsLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">❓ Savollar boshqaruvi</h1>

      <Space className="mb-4">
        <Select
          placeholder="Fan tanlang"
          style={{ width: 200 }}
          allowClear
          value={selectedSubject}
          onChange={(v) => {
            setSelectedSubject(v);
            setSelectedGrade(undefined); // reset grade when subject changes
          }}
        >
          {subjects.map((s) => (
            <Option key={s.id} value={s.id}>
              {s.title}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Daraja tanlang"
          style={{ width: 200 }}
          allowClear
          value={selectedGrade}
          onChange={(v) => setSelectedGrade(v)}
          disabled={!selectedSubject}
        >
          {filteredGrades.map((g) => (
            <Option key={g.id} value={g.id}>
              {g.title}
            </Option>
          ))}
        </Select>

        <Button type="primary" onClick={openAddModal}>
          ➕ Savol qo‘shish
        </Button>
      </Space>

      {error && <p className="text-red-500">{error}</p>}

      <Table rowKey="id" dataSource={questions} columns={columns} />

      {/* Modal */}
      <Modal
        open={modalOpen}
        title={editingQuestion ? "Savolni tahrirlash" : "Yangi savol"}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="subjectId" label="Fan" rules={[{ required: true }]}>
            <Select
              placeholder="Fan tanlang"
              onChange={(value) => {
                form.setFieldsValue({ gradeId: undefined });
              }}
            >
              {subjects.map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="gradeId" label="Daraja" rules={[{ required: true }]}>
            <Select placeholder="Daraja tanlang" disabled={!form.getFieldValue("subjectId")}>
              {(subjects.find((s) => s.id === form.getFieldValue("subjectId"))?.grades || []).map(
                (g) => (
                  <Option key={g.id} value={g.id}>
                    {g.title}
                  </Option>
                )
              )}
            </Select>
          </Form.Item>

          <Form.Item name="question" label="Savol matni" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>

          <Form.List name="options" initialValue={[{}, {}, {}]}>
            {(fields, { add, remove }) => {
              const handleCorrectChange = (selectedIndex: number) => {
                fields.forEach((field, idx) => {
                  form.setFieldValue(["options", idx, "is_correct"], idx === selectedIndex);
                });
              };

              return (
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
                          name="correctOption"
                          checked={form.getFieldValue(["options", idx, "is_correct"])}
                          onChange={() => handleCorrectChange(idx)}
                        />
                      </Form.Item>

                      <Button onClick={() => remove(field.name)}>O‘chirish</Button>
                    </Space>
                  ))}
                  <Button onClick={() => add()}>+ Variant qo‘shish</Button>
                </>
              );
            }}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}