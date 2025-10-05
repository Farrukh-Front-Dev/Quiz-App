"use client";

import { FC } from "react";
import { Space, Button, Progress } from "antd";

interface Props {
  currentIndex: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  disableNext?: boolean;
}

const QuestionNavigation: FC<Props> = ({
  currentIndex,
  total,
  onNext,
  onPrev,
  onSubmit,
  disableNext,
}) => {
  const isLast = currentIndex === total - 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Progress
        percent={Math.round(((currentIndex + 1) / total) * 100)}
        size="small"
      />

      <Space style={{ justifyContent: "space-between", width: "100%" }}>
        <Button onClick={onPrev} disabled={currentIndex === 0}>
          Previous
        </Button>

        {!isLast && (
          <Button type="primary" onClick={onNext} disabled={disableNext}>
            Next
          </Button>
        )}

        {isLast && (
          <Button type="primary" onClick={onSubmit} disabled={disableNext}>
            Submit
          </Button>
        )}
      </Space>
    </div>
  );
};

export default QuestionNavigation;
