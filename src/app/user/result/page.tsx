"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchUserResults, Result } from "@/store/slices/resultsSlice";
import { Card, Row, Col, Spin, Typography, Progress, message } from "antd";
import { useRouter, useSearchParams } from "next/navigation";

const { Title, Text } = Typography;

export default function UserResultPage() {
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const userId = searchParams.get("userId"); // Agar login orqali olishni xohlasak, redux authSlice’dan ham olish mumkin
  const { items: results, loading, error } = useSelector(
    (state: RootState) => state.results
  );

  useEffect(() => {
    if (!userId) {
      message.error("Foydalanuvchi aniqlanmadi!");
      router.push("/user/select");
      return;
    }
    dispatch(fetchUserResults(userId));
  }, [dispatch, userId, router]);

  if (loading)
    return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;

  if (error) return <Text type="danger">{error}</Text>;

  if (!results.length) return <Text>Hali test topshirmadingiz.</Text>;

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 12px" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
        Test Natijalaringiz
      </Title>

      <Row gutter={[16, 16]}>
        {results.map((result: Result) => {
          const percentage = Math.round((result.result / result.grade.questionCount) * 100);
          return (
            <Col xs={24} sm={12} lg={8} key={result.id}>
              <Card
                title={`${result.subject.title} - ${result.grade.title}`}
                bordered
                hoverable
              >
                <Text strong>Status:</Text> {result.status} <br />
                <Text strong>To‘g‘ri javoblar:</Text> {result.result} / {result.grade.questionCount} <br />
                <Text strong>Vaqt (sekund):</Text> {result.time} <br />
                <Progress percent={percentage} status="active" />
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
