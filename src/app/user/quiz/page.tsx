"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { createResult, fetchResultById } from "@/store/slices/resultsSlice";
import { Card, Spin, message } from "antd";
import QuestionCard from "@/components/quiz/QuestionCard";
import QuestionNavigation from "@/components/quiz/QuestionNavigation";
import api from "@/lib/api";

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const subjectId = searchParams.get("subject");
  const gradeId = searchParams.get("grade");

  const { item: result, loading, error } = useSelector(
    (state: RootState) => state.results
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [startTime] = useState(Date.now());

  
  useEffect(() => {
    const loadResult = async () => {
      if (!subjectId || !gradeId) {
        message.error("Fan yoki daraja tanlanmagan!");
        router.push("/user/select");
        return;
      }

      try {
        
        const created = await dispatch(
          createResult({ subjectId, gradeId })
        ).unwrap();

        
        await dispatch(fetchResultById(created.id));
      } catch (err) {
        console.error(err);
        message.error("Testni yuklashda xatolik!");
        router.push("/user/select");
      }
    };

    loadResult();
  }, [dispatch, subjectId, gradeId, router]);

  // --- Javob tanlash ---
  const handleAnswer = (questionId: string, selectedOptionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOptionId }));
  };

  const handleNext = () => {
    if (result && currentIndex < result.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // --- Yakunlash ---
  const handleSubmit = async () => {
    if (!result) return;
    try {
      await api.post(`/results/${result.id}/finish`, {
        answers,
        startedAt: new Date(startTime).toISOString(),
        finishedAt: new Date().toISOString(),
      });

      message.success("Test yakunlandi!");
      router.push(`/user/result/${result.id}`);
    } catch (err) {
      console.error(err);
      message.error("Natijani yuborishda xatolik yuz berdi!");
    }
  };

  
  if (loading)
    return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;
  if (error) return <p>{error}</p>;
  if (!result || !result.questions?.length)
    return <p>Bu fan va daraja uchun savollar topilmadi.</p>;

  // --- Hozirgi savol ---
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
