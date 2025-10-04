"use client";

import { useEffect, useState } from "react";
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

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import QuestionFormModal from "./QuestionFormModal";
import InfinityLoader from "@/components/admin/InfinityLoader";

export default function QuestionsDashboard() {
  const dispatch = useDispatch<AppDispatch>();

  // Redux states
  const { items: questions, loading } = useSelector(
    (state: RootState) => state.questions
  );
  const { items: subjects, loading: subjectsLoading } = useSelector(
    (state: RootState) => state.subjects
  );

  // Local states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();
  const [selectedGrade, setSelectedGrade] = useState<string | undefined>();

  // 🔹 Initial load
  useEffect(() => {
    dispatch(loadSubjects());
    dispatch(fetchQuestions({})); // barcha savollarni olish
  }, [dispatch]);

  // 🔹 Filter trigger
 // 🔹 Filter trigger
 useEffect(() => {
  dispatch(fetchQuestions({
    subject: selectedSubject,
    grade: selectedGrade,
  }));
}, [dispatch, selectedSubject, selectedGrade]);



  // 🔹 Modal open/close
  const openAddModal = () => {
    setEditingQuestion(null);
    setModalOpen(true);
  };

  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setModalOpen(true);
  };

  // 🔹 Save (create/update)
  const handleSave = async (values: any) => {
    try {
      // ✅ options mavjud bo‘lmasa, bo‘sh massiv qilib olamiz
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
  
      let res;
      if (editingQuestion) {
        res = await dispatch(
          updateQuestion({ id: editingQuestion.id, ...payload })
        ).unwrap();
      } else {
        res = await dispatch(createQuestion(payload)).unwrap();
      }
  
      // 🔹 Modalni yopamiz
      setModalOpen(false);
  
      // 🔹 Yangi saqlangandan keyin qayta yuklaymiz
      dispatch(fetchQuestions({ subject: selectedSubject, grade: selectedGrade }));
      return res;
    } catch (err) {
      console.error("❌ Savol saqlashda xatolik:", err);
    }
  };
  

  // 🔹 Delete
  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteQuestion(id)).unwrap();
    } catch (err) {
      console.error("❌ Savol o‘chirishda xatolik:", err);
    }
  };

  // 🔹 Loader state
  if (loading || subjectsLoading) {
    return (
      <div className="flex justify-center py-10">
        <InfinityLoader />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">❓ Savollar boshqaruvi</h1>

      {/* 🔹 Filterlar */}
      <div className="flex flex-wrap gap-4">
        {/* Subject filter */}
        <Select
          value={selectedSubject}
          onValueChange={(val) => {
            setSelectedSubject(val);
            setSelectedGrade(undefined); // reset grade when subject changes
          }}
        >
          <SelectTrigger className="w-[200px]">
            {selectedSubject
              ? subjects.find((s) => s.id === selectedSubject)?.title
              : "Fan tanlang"}
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Grade filter */}
        <Select
          value={selectedGrade}
          onValueChange={setSelectedGrade}
          disabled={!selectedSubject}
        >
          <SelectTrigger className="w-[200px]">
            {selectedGrade
              ? subjects
                  .find((s) => s.id === selectedSubject)
                  ?.grades.find((g) => g.id === selectedGrade)?.title
              : "Daraja tanlang"}
          </SelectTrigger>
          <SelectContent>
            {subjects
              .find((s) => s.id === selectedSubject)
              ?.grades.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.title}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Button onClick={openAddModal}>➕ Savol qo‘shish</Button>
      </div>

      {/* 🔹 Jadval */}
      <Card className="p-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Savol</TableHead>
              <TableHead>A</TableHead>
              <TableHead>B</TableHead>
              <TableHead>C</TableHead>
              <TableHead>Javob</TableHead>
              <TableHead>Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((q, idx) => (
              <TableRow key={q.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell className="max-w-[250px] truncate">
                  {q.question || "-"}
                </TableCell>
                <TableCell>{q.options?.[0]?.variant || "-"}</TableCell>
                <TableCell>{q.options?.[1]?.variant || "-"}</TableCell>
                <TableCell>{q.options?.[2]?.variant || "-"}</TableCell>
                <TableCell className="font-semibold text-green-600">
                  {q.options?.find((o) => o.is_correct)?.variant || "-"}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" onClick={() => openEditModal(q)}>
                    ✏️ Tahrirlash
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(q.id)}
                  >
                    🗑 O‘chirish
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {questions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  Hech qanday savol topilmadi
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

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
