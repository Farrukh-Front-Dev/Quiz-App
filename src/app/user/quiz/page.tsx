"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchResultByParams, Result } from "@/store/slices/resultsSlice";
import { Card, Spin, message } from "antd";
import QuestionCard from "@/components/quiz/QuestionCard";
import QuestionNavigation from "@/components/quiz/QuestionNavigation";

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const subjectId = searchParams.get("subject");
  const gradeId = searchParams.get("grade");

  const { item: result, loading, error } = useSelector((state: RootState) => state.results);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [startTime] = useState(Date.now());

  // 🔹 Fetch result + questions
  useEffect(() => {
    if (!subjectId || !gradeId) {
      message.error("Fan yoki daraja tanlanmagan!");
      router.push("/user/select");
      return;
    }

    dispatch(fetchResultByParams({ subjectId, gradeId }));
  }, [dispatch, subjectId, gradeId, router]);

  // 🔹 Answer handler
  const handleAnswer = (questionId: string, selectedOptionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedOptionId }));
  };

  const handleNext = () => {
    if (result && currentIndex < result.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // 🔹 Submit handler
  const handleSubmit = async () => {
    if (!subjectId || !gradeId || !result) return;

    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          gradeId,
          answers,
          startedAt: new Date(startTime).toISOString(),
          finishedAt: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error("Natijani yuborishda xatolik");

      const savedResult = await response.json();
      const params = new URLSearchParams();
      params.append("result", JSON.stringify(savedResult));

      router.push(`/user/result?${params.toString()}`);
    } catch (err) {
      console.error(err);
      message.error("Natijani yuborishda xatolik yuz berdi!");
    }
  };

  // 🔹 Loading / error / no questions
  if (loading) return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;
  if (error) return <p>{error}</p>;
  if (!result || !result.questions?.length) return <p>Bu fan va daraja uchun savollar topilmadi.</p>;

  // 🔹 Safety check for current question
  const currentQuestion = result.questions[currentIndex];
  if (!currentQuestion) return null;

  return (
    <Card style={{ maxWidth: 800, margin: "24px auto", padding: 24 }}>
      <QuestionCard
  question={{
    id: currentQuestion.id,
    question: currentQuestion.question,
    options: currentQuestion.options || [],
  }}
  selectedAnswer={answers[currentQuestion.id]}
  onAnswer={handleAnswer}
/>


      <QuestionNavigation
        currentIndex={currentIndex}
        total={result.questions.length}
        onNext={handleNext}
        onPrev={handlePrev}
        onSubmit={handleSubmit}
        disableNext={!answers[currentQuestion.id]}
      />
    </Card>
  );
}
