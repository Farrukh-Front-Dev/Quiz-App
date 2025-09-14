"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchQuestions, createQuestion, updateQuestion, deleteQuestion, Question } from "@/store/slices/questionsSlice";
import { loadSubjects, Subject } from "@/store/slices/subjectsSlice";
import { Table, Button, Space, Popconfirm, message, Spin, Form, Select } from "antd";
import QuestionFormModal from "@/components/admin/QuestionFormModal";

const { Option } = Select;

export default function QuestionsDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: questions, loading, error } = useSelector((state: RootState) => state.questions);
  const { items: subjects, loading: subjectsLoading } = useSelector((state: RootState) => state.subjects);

  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>();
  const [selectedGrade, setSelectedGrade] = useState<string>();

  useEffect(() => { dispatch(loadSubjects()); }, [dispatch]);
  useEffect(() => { dispatch(fetchQuestions({ subjectId: selectedSubject, gradeId: selectedGrade })); }, [dispatch, selectedSubject, selectedGrade]);

  const openAddModal = () => { setEditingQuestion(null); form.resetFields(); setModalOpen(true); };
  const openEditModal = (question: Question) => {
    if (!question.subject || !question.grade) { message.error("Savol ma'lumotlari to‘liq emas!"); return; }
    setEditingQuestion(question);
    form.setFieldsValue({
      question: question.question,
      subjectId: question.subject.id,
      gradeId: question.grade.id,
      options: question.options.map(o => ({ variant: o.variant, is_correct: o.is_correct, id: o.id })),
    });
    setSelectedSubject(question.subject.id);
    setSelectedGrade(question.grade.id);
    setModalOpen(true);
  };

  const handleSave = async (values: any) => {
    try {
      const payload = { ...values, options: values.options.map((o: any) => ({ id: o.id, variant: o.variant, is_correct: o.is_correct })) };
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
    try { await dispatch(deleteQuestion(id)).unwrap(); message.success("Savol o‘chirildi!"); }
    catch (err: any) { message.error(err.message || "Xatolik!"); }
  };

  const columns = [
    { title: "№", dataIndex: "index", render: (_: any, __: any, index: number) => index + 1 },
    { title: "Savol", dataIndex: "question", key: "question" },
    { title: "A", dataIndex: ["options", 0, "variant"], key: "a" },
    { title: "B", dataIndex: ["options", 1, "variant"], key: "b" },
    { title: "C", dataIndex: ["options", 2, "variant"], key: "c" },
    { title: "Javob", key: "correct", render: (_: any, record: Question) => record.options.find(o => o.is_correct)?.variant || "-" },
    { title: "Amallar", key: "actions", render: (_: any, record: Question) => (
      <Space>
        <Button onClick={() => openEditModal(record)}>Tahrirlash</Button>
        <Popconfirm title="Rostan ham o‘chirmoqchimisiz?" onConfirm={() => handleDelete(record.id)} okText="Ha" cancelText="Yo‘q">
          <Button danger>O‘chirish</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  if (loading || subjectsLoading) return <div className="flex justify-center items-center py-20"><Spin size="large" /></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">❓ Savollar boshqaruvi</h1>
      <Space className="mb-4">
        <Select
          placeholder="Fan tanlang"
          style={{ width: 200 }}
          allowClear
          value={selectedSubject}
          onChange={(v) => { setSelectedSubject(v); setSelectedGrade(undefined); form.setFieldsValue({ subjectId: v, gradeId: undefined }); }}
        >
          {subjects.map(s => <Option key={s.id} value={s.id}>{s.title}</Option>)}
        </Select>

        <Select
          placeholder="Daraja tanlang"
          style={{ width: 200 }}
          allowClear
          value={selectedGrade}
          onChange={(v) => { setSelectedGrade(v); form.setFieldsValue({ gradeId: v }); }}
          disabled={!selectedSubject}
        >
          {subjects.find(s => s.id === selectedSubject)?.grades.map(g => (
            <Option key={g.id} value={g.id}>{g.title}</Option>
          ))}
        </Select>

        <Button type="primary" onClick={openAddModal}>➕ Savol qo‘shish</Button>
      </Space>

      <Table rowKey="id" dataSource={questions} columns={columns} />

      <QuestionFormModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSave={handleSave}
        editingQuestion={editingQuestion}
        subjects={subjects}
        form={form}
      />
    </div>
  );
}
