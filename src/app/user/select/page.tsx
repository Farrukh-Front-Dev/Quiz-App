"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { loadSubjectsWithGrades } from "@/store/slices/subjectsSlice";
import {
  fetchQuizQuestions,
  clearQuestions,
} from "@/store/slices/userRouteSlice";
import { Button, Select, Space, Card, Spin } from "antd";
import { useRouter } from "next/navigation";

export default function SelectPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // 🔹 Redux state’dan subjects va loading holatini olamiz
  const { items: subjects, loading: subjectsLoading } = useAppSelector(
    (state) => state.subjects
  );

  const [selectedSubject, setSelectedSubject] = useState<string>();
  const [selectedGrade, setSelectedGrade] = useState<string>();

  useEffect(() => {
    // 🔹 Yangi API’dan fanlar va darajalarni yuklaymiz
    dispatch(loadSubjectsWithGrades({ page: 1, limit: 10 }));
    // 🔹 Oldingi savollarni tozalaymiz
    dispatch(clearQuestions());
  }, [dispatch]);

  // 🔹 Tanlangan fanga qarab grades ro‘yxatini chiqaramiz
  const grades = subjects.find((s) => s.id === selectedSubject)?.grades || [];

  const handleStart = async () => {
    if (!selectedSubject || !selectedGrade) return;

    // 🔹 Savollarni yuklash
    await dispatch(
      fetchQuizQuestions({
        subject: selectedSubject,
        grade: selectedGrade,
      })
    );

    // 🔹 Quiz sahifasiga o‘tish
    router.push(`/user/quiz?subject=${selectedSubject}&grade=${selectedGrade}`);
  };

  if (subjectsLoading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="flex justify-center mt-12 px-4">
      <Card className="w-full max-w-md p-6 shadow-lg rounded-lg bg-white">
        <h2 className="text-2xl font-bold mb-6 text-center">Testni boshlash</h2>
        <Space direction="vertical" size="large" className="w-full">
          {/* 🔹 Fanni tanlash */}
          <Select
            placeholder="Fan tanlang"
            value={selectedSubject}
            onChange={(val) => {
              setSelectedSubject(val);
              setSelectedGrade(undefined);
            }}
            options={subjects.map((s) => ({ label: s.title, value: s.id }))}
            className="w-full"
          />

          {/* 🔹 Darajani tanlash */}
          <Select
            placeholder="Daraja tanlang"
            value={selectedGrade}
            onChange={(val) => setSelectedGrade(val)}
            options={grades.map((g) => ({
              label: `${g.title} (${g.questionCount} ta savol)`,
              value: g.id,
            }))}
            className="w-full"
            disabled={!selectedSubject}
          />

          {/* 🔹 Boshlash tugmasi */}
          <Button
            type="primary"
            size="large"
            onClick={handleStart}
            disabled={!selectedSubject || !selectedGrade}
            className="w-full"
          >
            Boshlash
          </Button>
        </Space>
      </Card>
    </div>
  );
}
