"use client";

import { Button, Popconfirm, Space, Tag } from "antd";
import type { ColumnType } from "antd/es/table";
import { Question } from "@/store/slices/questionsSlice";
import { Trash2, Edit } from "lucide-react";

type Props = {
  currentPage: number;
  pageSize: number;
  openEditModal: (q: Question) => void;
  handleDelete: (id: string) => void;
};

export function useQuestionColumns({
  currentPage,
  pageSize,
  openEditModal,
  handleDelete,
}: Props) {
  const columns: ColumnType<Question>[] = [
    {
      title: "№",
      key: "index",
      width: 50,
      render: (_: any, __: any, index: number) =>
        <span>{(currentPage - 1) * pageSize + index + 1}</span>,
    },
    {
      title: "Savol",
      dataIndex: "question",
      key: "question",
      render: (text: string) => (
        <span className="font-medium text-blue-600 truncate max-w-[300px]">{text}</span>
      ),
    },
    {
      title: "A",
      key: "optionA",
      render: (_, record) => record.options?.[0]?.variant || "-",
    },
    {
      title: "B",
      key: "optionB",
      render: (_, record) => record.options?.[1]?.variant || "-",
    },
    {
      title: "C",
      key: "optionC",
      render: (_, record) => record.options?.[2]?.variant || "-",
    },
    {
      title: "Javob",
      key: "answer",
      render: (_, record) => {
        const correct = record.options?.find(o => o.is_correct);
        return correct ? <Tag color="green">{correct.variant}</Tag> : <Tag color="default">-</Tag>;
      },
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_: any, record) => (
        <Space>
          <Button
            size="small"
            type="primary"
            icon={<Edit size={16} />}
            onClick={() => openEditModal(record)}
          >
            Tahrirlash
          </Button>

          <Popconfirm
            title="Savolni o‘chirishni tasdiqlang"
            okText="Ha"
            cancelText="Yo‘q"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger icon={<Trash2 size={16} />}>
              O‘chirish
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return columns;
}
