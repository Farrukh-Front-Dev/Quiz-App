"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { fetchQuestions, Question } from "@/store/slices/questionsSlice";
import { Card, Spin, message } from "antd";
import QuestionCard from "@/components/quiz/QuestionCard";
import QuestionNavigation from "@/components/quiz/QuestionNavigation";

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const subjectId = searchParams.get("subject");
  const gradeId = searchParams.get("grade");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});

  // 🔹 Fetch questions
  useEffect(() => {
    if (!subjectId || !gradeId) {
      message.error("Fan yoki daraja tanlanmagan!");
      router.push("/user/select");
      return;
    }

    setLoading(true);
    dispatch(fetchQuestions({ subject: subjectId, grade: gradeId }))
      .unwrap()
      .then((res) => {
        setQuestions(res.data); // ✅ res.data ishlatildi
      })
      .catch(() => {
        message.error("Savollarni yuklashda xatolik!");
      })
      .finally(() => setLoading(false));
  }, [dispatch, subjectId, gradeId, router]);

  const handleAnswer = (questionId: string, selectedOptionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedOptionId }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleSubmit = () => {
    router.push({
      pathname: "/user/result",
      query: {
        subject: subjectId,
        grade: gradeId,
        answers: JSON.stringify(answers),
      },
    });
  };

  if (loading) return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;

  if (!questions.length) return <p>Bu fan va daraja uchun savollar topilmadi.</p>;

  const currentQuestion = questions[currentIndex];

  return (
    <Card style={{ maxWidth: 800, margin: "24px auto", padding: 24 }}>
      <QuestionCard
        question={currentQuestion}
        selectedAnswer={answers[currentQuestion.id]}
        onAnswer={handleAnswer}
      />

      <QuestionNavigation
        currentIndex={currentIndex}
        total={questions.length}
        onNext={handleNext}
        onPrev={handlePrev}
        onSubmit={handleSubmit}
        disableNext={!answers[currentQuestion.id]}
      />
    </Card>
  );
}
