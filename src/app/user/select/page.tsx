"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { loadSubjects } from "@/store/slices/subjectsSlice";
import { Button, Select, Space, Card, Spin } from "antd";
import { useRouter } from "next/navigation";

export default function SelectPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { items: subjects, loading } = useSelector((state: RootState) => state.subjects);

  const [selectedSubject, setSelectedSubject] = useState<string>();
  const [selectedGrade, setSelectedGrade] = useState<string>();

  useEffect(() => {
    dispatch(loadSubjects());
  }, [dispatch]);

  const grades = subjects.find(s => s.id === selectedSubject)?.grades || [];

  const handleStart = () => {
    if (!selectedSubject || !selectedGrade) return;
    router.push(`/user/quiz?subject=${selectedSubject}&grade=${selectedGrade}`);
  };

  if (loading)
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
          <Select
            placeholder="Fan tanlang"
            value={selectedSubject}
            onChange={val => {
              setSelectedSubject(val);
              setSelectedGrade(undefined);
            }}
            options={subjects.map(s => ({ label: s.title, value: s.id }))}
            className="w-full"
          />
          <Select
            placeholder="Daraja tanlang"
            value={selectedGrade}
            onChange={val => setSelectedGrade(val)}
            options={grades.map(g => ({ label: g.title, value: g.id }))}
            className="w-full"
            disabled={!selectedSubject}
          />
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
