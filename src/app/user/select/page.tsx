"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { loadSubjectsWithGrades } from "@/store/slices/subjectsSlice";
import { fetchQuizQuestions, clearQuestions } from "@/store/slices/userRouteSlice";
import { Button, Select, Spin } from "antd";
import { useRouter } from "next/navigation";

export default function SelectPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { items: subjects, loading: subjectsLoading, total } = useAppSelector(
    (state) => state.subjects
  );

  const [selectedGrades, setSelectedGrades] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    dispatch(loadSubjectsWithGrades({ page, limit }));
    if (page === 1) dispatch(clearQuestions());
  }, [dispatch, page]);

  const handleGradeSelect = (subjectId: string, gradeId: string) => {
    setSelectedGrades((prev) => ({ ...prev, [subjectId]: gradeId }));
  };

  const handleStart = async (subjectId: string) => {
    const selectedGrade = selectedGrades[subjectId];
    if (!selectedGrade) return;

    await dispatch(fetchQuizQuestions({ subject: subjectId, grade: selectedGrade }));
    router.push(`/user/quiz?subject=${subjectId}&grade=${selectedGrade}`);
  };

  if (subjectsLoading && subjects.length === 0) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">Testni boshlash</h2>

      {/* 🔹 Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="rounded-xl border shadow-sm hover:shadow-lg p-4 transition bg-white flex flex-col justify-between"
          >
            <h3 className="text-lg font-semibold mb-3">{subject.title}</h3>

            <Select
              placeholder="Darajani tanlang"
              value={selectedGrades[subject.id]}
              onChange={(val) => handleGradeSelect(subject.id, val)}
              options={subject.grades.map((g) => ({
                label: `${g.title} (${g.questionCount} ta savol)`,
                value: g.id,
              }))}
              className="w-full mb-3"
            />

            <Button
              type="primary"
              block
              onClick={() => handleStart(subject.id)}
              disabled={!selectedGrades[subject.id]}
            >
              Boshlash
            </Button>
          </div>
        ))}
      </div>

      {/* 🔹 Yana yuklash */}
      {subjects.length < total && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => setPage((p) => p + 1)}
            loading={subjectsLoading}
            size="large"
          >
            Yana yuklash
          </Button>
        </div>
      )}
    </div>
  );
}
