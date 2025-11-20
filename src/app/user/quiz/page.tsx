"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { createResult, fetchResultById } from "@/store/slices/resultsSlice";
import { Card, Spin, message, Progress, Button } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import QuestionCard from "@/components/quiz/QuestionCard";
import QuestionNavigation from "@/components/quiz/QuestionNavigation";
import api from "@/lib/api";

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const gradeId = searchParams.get("grade");

  const { item: result, loading, error } = useSelector(
    (state: RootState) => state.results
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadResult = async () => {
      if (!gradeId) {
        message.error("Daraja tanlanmagan!");
        router.push("/user/select");
        return;
      }

      try {
        const created = await dispatch(
          createResult({ gradeId })
        ).unwrap();

        await dispatch(fetchResultById(created.id));
      } catch (err) {
        console.error(err);
        message.error("Testni yuklashda xatolik!");
        router.push("/user/select");
      }
    };

    loadResult();
  }, [dispatch, gradeId, router]);

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

  const handleSubmit = async () => {
    if (!result) return;
    setSubmitting(true);

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
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Spin size="large" />
        <p className="mt-4 text-gray-600 text-center">Test yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md text-center border-red-200">
          <p className="text-red-600 font-semibold text-lg">{error}</p>
          <Button 
            onClick={() => router.push("/user/select")} 
            type="primary" 
            className="mt-4"
            block
          >
            Orqaga qaytish
          </Button>
        </Card>
      </div>
    );
  }

  if (!result || !result.questions?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md text-center">
          <p className="text-gray-600 text-lg">Ushbu daraja uchun savollar topilmadi.</p>
          <Button 
            onClick={() => router.push("/user/select")} 
            type="primary" 
            className="mt-4"
            block
          >
            Orqaga qaytish
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = result.questions[currentIndex];
  const progress = ((currentIndex + 1) / result.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header Card */}
        <Card className="mb-4 sm:mb-6 shadow-lg border-0 bg-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Test</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                Savol {currentIndex + 1} / {result.questions.length}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-blue-50 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base">
              <ClockCircleOutlined className="text-blue-600 text-sm" />
              <span className="text-gray-700 font-medium">
                {answeredCount}/{result.questions.length}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <Progress
              percent={Math.round(progress)}
              strokeColor={{ '0%': '#3b82f6', '100%': '#06b6d4' }}
              showInfo={false}
              size="small"
            />
          </div>
        </Card>

        {/* Question Card */}
        <Card className="mb-4 sm:mb-6 shadow-lg border-0 bg-white overflow-hidden">
          <div className="p-4 sm:p-6">
            <QuestionCard
              question={{
                id: currentQuestion.id,
                question: currentQuestion.question,
                options: currentQuestion.options || [],
              }}
              selectedAnswer={answers[currentQuestion.id]}
              onAnswer={handleAnswer}
            />
          </div>
        </Card>

        {/* Navigation */}
        <Card className="shadow-lg border-0 bg-white">
          <div className="p-4 sm:p-6">
            <QuestionNavigation
              currentIndex={currentIndex}
              total={result.questions.length}
              onNext={handleNext}
              onPrev={handlePrev}
              onSubmit={handleSubmit}
              disableNext={!answers[currentQuestion.id]}
            />
          </div>
        </Card>

        {/* Info Footer */}
        <div className="mt-6 text-center text-gray-500 text-xs sm:text-sm px-2">
          <p>Testni yakunlash uchun barcha savollarni javob bering va "Taqdim etish" tugmasini bosing</p>
        </div>
      </div>
    </div>
  );
}
