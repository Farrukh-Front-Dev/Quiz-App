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
  const { items: questions, loading } = useSelector(
    (state: RootState) => state.questions
  );
  const { items: subjects, loading: subjectsLoading } = useSelector(
    (state: RootState) => state.subjects
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(
    undefined
  );
  const [selectedGrade, setSelectedGrade] = useState<string | undefined>(
    undefined
  );

  // Ma'lumotlarni yuklash
  useEffect(() => {
    dispatch(loadSubjects());
    dispatch(fetchQuestions({}));
  }, [dispatch]);

  // Grade tanlanganda filter
  useEffect(() => {
    if (selectedGrade) {
      dispatch(fetchQuestions({ gradeId: selectedGrade }));
    }
  }, [dispatch, selectedGrade]);

  const filteredQuestions = useMemo(() => {
    if (!selectedSubject) return questions;
    return questions.filter((q) => q.subject?.id === selectedSubject);
  }, [questions, selectedSubject]);

  const openAddModal = () => {
    setEditingQuestion(null);
    setModalOpen(true);
  };

  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setModalOpen(true);
  };

  const handleSave = async (values: any) => {
    try {
      const payload = {
        ...values,
        options: values.options.map((o: any) => ({
          id: o.id,
          variant: o.variant,
          is_correct: o.is_correct,
        })),
      };
      if (editingQuestion) {
        await dispatch(
          updateQuestion({ id: editingQuestion.id, ...payload })
        ).unwrap();
      } else {
        await dispatch(createQuestion(payload)).unwrap();
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteQuestion(id)).unwrap();
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading || subjectsLoading)
    return (
      <div className="flex justify-center py-10">
        <InfinityLoader />
      </div>
    );

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">❓ Savollar boshqaruvi</h1>

      <div className="flex flex-wrap gap-4">
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-[200px]">Fan tanlang</SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedGrade}
          onValueChange={setSelectedGrade}
          disabled={!selectedSubject}
        >
          <SelectTrigger className="w-[200px]">Daraja tanlang</SelectTrigger>
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

      <Card className="p-4">
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
            {filteredQuestions.map((q, idx) => (
              <TableRow key={q.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{q.question || "-"}</TableCell>
                <TableCell>{q.options?.[0]?.variant || "-"}</TableCell>
                <TableCell>{q.options?.[1]?.variant || "-"}</TableCell>
                <TableCell>{q.options?.[2]?.variant || "-"}</TableCell>
                <TableCell>
                  {q.options?.find((o) => o.is_correct)?.variant || "-"}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" onClick={() => openEditModal(q)}>
                    Tahrirlash
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(q.id)}
                  >
                    O‘chirish
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

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
