"use client";

import { FC } from "react";
import { Card, Radio, Typography } from "antd";
import { Question } from "@/store/slices/questionsSlice";

const { Text, Paragraph } = Typography;

interface Props {
  question: Question;
  selectedAnswer?: string;
  onAnswer: (questionId: string, optionId: string) => void;
}

const QuestionCard: FC<Props> = ({ question, selectedAnswer, onAnswer }) => {
  return (
    <Card style={{ marginBottom: 24 }}>
      <Paragraph strong style={{ fontSize: 18 }}>
        {question.question}
      </Paragraph>

      <Radio.Group
        onChange={(e) => onAnswer(question.id, e.target.value)}
        value={selectedAnswer}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        {question.options?.map((opt) => (
          <Radio key={opt.id} value={opt.id} style={{ fontSize: 16 }}>
            {opt.variant}
          </Radio>
        ))}
      </Radio.Group>
    </Card>
  );
};

export default QuestionCard;
