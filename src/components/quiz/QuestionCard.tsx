"use client";

import { FC } from "react";
import { Card, Radio, Typography } from "antd";
import { motion } from "framer-motion";
import { Question as ResultQuestion } from "@/store/slices/resultsSlice";

const { Paragraph } = Typography;

interface Props {
  question: ResultQuestion;
  selectedAnswer?: string;
  onAnswer: (questionId: string, optionId: string) => void;
}

const QuestionCard: FC<Props> = ({ question, selectedAnswer, onAnswer }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="rounded-2xl shadow-md hover:shadow-lg transition-all"
        style={{ marginBottom: 24, background: "#fff" }}
      >
       <Paragraph strong style={{ fontSize: 18, marginBottom: 16 }}>
  {typeof question.question === "string" 
    ? question.question 
    : question.question?.question || "Savol topilmadi"}
</Paragraph>


        <Radio.Group
          onChange={(e) => onAnswer(question.id, e.target.value)}
          value={selectedAnswer}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          {question.options?.map((opt) => (
            <Radio
              key={opt.id}
              value={opt.id}
              style={{
                fontSize: 16,
                padding: "8px 12px",
                borderRadius: 8,
                border:
                  selectedAnswer === opt.id
                    ? "2px solid #1677ff"
                    : "1px solid #ddd",
                transition: "all 0.2s ease",
              }}
            >
              {opt.variant}
            </Radio>
          ))}
        </Radio.Group>
      </Card>
    </motion.div>
  );
};

export default QuestionCard;
