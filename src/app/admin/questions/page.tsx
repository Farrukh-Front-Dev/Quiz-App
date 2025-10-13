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
import { loadSubjects } from "@/store/slices/subjectsSlice";

import {
  Table,
  Select,
  Button,
  Card,
  Pagination,
  Spin,
  Space,
  message,
} from "antd";

import QuestionFormModal from "./QuestionFormModal";
import { useQuestionColumns } from "./useQuestionsColumns";

export default function QuestionsDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: questions, loading } = useSelector(
    (state: RootState) => state.questions
  );
  const { items: subjects, loading: subjectsLoading } = useSelector(
    (state: RootState) => state.subjects
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();
  const [selectedGrade, setSelectedGrade] = useState<string | undefined>();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // 🔹 Load initial data
  useEffect(() => {
    dispatch(loadSubjects());
    dispatch(fetchQuestions({}));
  }, [dispatch]);

  // 🔹 Filter trigger
  useEffect(() => {
    dispatch(fetchQuestions({ subject: selectedSubject, grade: selectedGrade }));
    setCurrentPage(1);
  }, [dispatch, selectedSubject, selectedGrade]);

  // 🔹 Dynamic pageSize
  useEffect(() => {
    const updatePageSize = () => {
      const width = window.innerWidth;
      if (width >= 1600) setPageSize(12);
      else if (width >= 1200) setPageSize(10);
      else if (width >= 992) setPageSize(8);
      else if (width >= 768) setPageSize(6);
      else setPageSize(4);
    };
    updatePageSize();
    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, []);

  // 🔹 Paginate
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return questions.slice(start, start + pageSize);
  }, [questions, pageSize, currentPage]);

  // 🔹 Handlers
  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setModalOpen(true);
  };

  const openAddModal = () => {
    setEditingQuestion(null);
    setModalOpen(true);
  };

  const handleSave = async (values: any) => {
    try {
      const options = Array.isArray(values.options) ? values.options : [];
      const payload = {
        question: values.question,
        subjectId: values.subjectId,
        gradeId: values.gradeId,
        options: options.map((o: any) => ({
          id: o.id,
          variant: o.variant,
          is_correct: !!o.is_correct,
        })),
      };

      if (editingQuestion) {
        await dispatch(updateQuestion({ id: editingQuestion.id, ...payload })).unwrap();
        message.success("Savol yangilandi ✅");
      } else {
        await dispatch(createQuestion(payload)).unwrap();
        message.success("Savol qo‘shildi ✅");
      }

      setModalOpen(false);
      dispatch(fetchQuestions({ subject: selectedSubject, grade: selectedGrade }));
    } catch (err) {
      console.error(err);
      message.error("Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteQuestion(id)).unwrap();
      message.success("Savol o‘chirildi 🗑️");
    } catch {
      message.error("Savolni o‘chirishda xatolik yuz berdi");
    }
  };

  // 🔹 Columns
  const columns = useQuestionColumns({
    currentPage,
    pageSize,
    openEditModal,
    handleDelete,
  });

  // 🔹 Loading state
  if (loading || subjectsLoading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">❓ Savollar boshqaruvi</h1>

      {/* 🔹 Filterlar */}
      <Space wrap>
        <Select
          placeholder="Fan tanlang"
          value={selectedSubject}
          onChange={(val) => {
            setSelectedSubject(val);
            setSelectedGrade(undefined);
          }}
          style={{ width: 200 }}
          options={subjects.map((s) => ({ value: s.id, label: s.title }))}
        />
        <Select
          placeholder="Daraja tanlang"
          value={selectedGrade}
          disabled={!selectedSubject}
          onChange={(val) => setSelectedGrade(val)}
          style={{ width: 200 }}
          options={
            subjects
              .find((s) => s.id === selectedSubject)
              ?.grades.map((g) => ({ value: g.id, label: g.title })) || []
          }
        />
        <Button type="primary" onClick={openAddModal}>➕ Savol qo‘shish</Button>
      </Space>

      {/* 🔹 Table */}
      <Card style={{ overflowX: "auto" }}>
        <Table
          dataSource={paginatedQuestions}
          columns={columns}
          rowKey="id"
          pagination={false}
          bordered
        />
      </Card>

      {/* 🔹 Pagination */}
      {questions.length > pageSize && (
        <div className="flex justify-end pt-4">
          <Pagination
            current={currentPage}
            total={questions.length}
            pageSize={pageSize}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      )}

      {/* 🔹 Modal */}
      <QuestionFormModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSave={handleSave}
        editingQuestion={editingQuestion}
        subjects={subjects}
      />
    </div>
  );
}
