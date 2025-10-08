"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Spin, message } from "antd";

export default function ResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const subjectId = searchParams.get("subject");
  const gradeId = searchParams.get("grade");
  const answers = searchParams.get("answers");

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subjectId || !gradeId || !answers) {
      message.error("Ma'lumotlar to‘liq emas!");
      router.push("/user/select");
      return;
    }

    console.log("📤 Yuborilayotgan ma'lumot:", {
      subjectId,
      gradeId,
      answers: JSON.parse(answers),
    });

    // TODO: bu yerda backendga request ketadi
    setLoading(false);
    setResult({ correct: 3, total: 5, percentage: 60 }); // test uchun
  }, [subjectId, gradeId, answers, router]);

  if (loading) return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;

  if (!result) return <p>Natija topilmadi.</p>;

  return (
    <Card style={{ maxWidth: 600, margin: "40px auto", padding: 24, textAlign: "center" }}>
      <h2>Test yakunlandi 🎯</h2>
      <p><b>To‘g‘ri javoblar:</b> {result.correct} / {result.total}</p>
      <p><b>Foiz:</b> {result.percentage}%</p>
    </Card>
  );
}
