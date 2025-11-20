"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Select, Spin, Empty, Alert, message } from "antd";
import { useAppDispatch, useAppSelector } from "@/store";
import { loadSubjectsWithGrades } from "@/store/slices/subjectsSlice";
import { fetchQuizQuestions, clearQuestions } from "@/store/slices/userRouteSlice";

export default function SelectPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { items: subjects, loading: subjectsLoading, total, error } = useAppSelector(
    (state) => state.subjects
  );

  const [selectedGrades, setSelectedGrades] = useState<Record<string, string>>({});
  const [loadingSubject, setLoadingSubject] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const limit = 12;

  // Load data
  useEffect(() => {
    dispatch(loadSubjectsWithGrades({ page, limit }));
    if (page === 1) dispatch(clearQuestions());
  }, [dispatch, page]);

  // Select grade
  const handleGradeSelect = (subjectId: string, gradeId: string) => {
    setSelectedGrades((prev) => ({ ...prev, [subjectId]: gradeId }));
  };

  // Start test
  const handleStart = async (subjectId: string) => {
    const gradeId = selectedGrades[subjectId];
    if (!gradeId) {
      message.warning("Avval darajani tanlang.");
      return;
    }

    setLoadingSubject(subjectId);

    const result = await dispatch(
      fetchQuizQuestions({ subject: subjectId, grade: gradeId })
    );

    if (fetchQuizQuestions.rejected.match(result)) {
      message.error("Savollar yuklanishda xatolik yuz berdi.");
      setLoadingSubject(null);
      return;
    }

    router.push(`/user/quiz?subject=${subjectId}&grade=${gradeId}`);
  };

  // Loading screen
  if (subjectsLoading && subjects.length === 0) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="px-4 py-8 max-w-7xl mx-auto">
        <Alert message="Xatolik" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="px-4 py-10 max-w-7xl mx-auto">

      {/* Title */}
      <h2 className="text-3xl font-bold text-center mb-10 tracking-wide text-gray-800">
        Fan va darajani tanlang
      </h2>

      {/* Empty */}
      {subjects.length === 0 ? (
        <div className="flex justify-center py-20">
          <Empty description="Mavzular topilmadi" />
        </div>
      ) : (
        <>
          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="
                  bg-white rounded-2xl border border-gray-200 
                  shadow-sm hover:shadow-xl transition-all duration-300 
                  p-5 flex flex-col justify-between
                  hover:-translate-y-1
                "
              >
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">
                    {subject.title}
                  </h3>

                  <Select
                    placeholder="Darajani tanlang"
                    value={selectedGrades[subject.id]}
                    onChange={(val) => handleGradeSelect(subject.id, val)}
                    options={(subject.grades || []).map((g) => ({
                      label: `${g.title} (${g.questionCount} ta savol)`,
                      value: g.id,
                    }))}
                    className="w-full mb-4"
                    size="large"
                  />
                </div>

                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={() => handleStart(subject.id)}
                  disabled={!selectedGrades[subject.id] || loadingSubject === subject.id}
                  loading={loadingSubject === subject.id}
                  className="mt-2"
                >
                  Boshlash
                </Button>
              </div>
            ))}
          </div>

          {/* Load More */}
          {subjects.length < total && (
            <div className="flex justify-center mt-10">
              <Button
                onClick={() => setPage((p) => p + 1)}
                loading={subjectsLoading}
                size="large"
                className="px-10 py-2"
              >
                Yana yuklash
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
