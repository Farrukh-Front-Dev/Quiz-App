"use client";

import { Button, Popconfirm, Space, Tag, Tooltip } from "antd";
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
      width: 60,
      fixed: "left",
      render: (_: any, __: any, index: number) => (
        <span className="font-semibold">
          {(currentPage - 1) * pageSize + index + 1}
        </span>
      ),
    },
    {
      title: "Savol",
      dataIndex: "question",
      key: "question",
      width: 300,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="font-medium text-blue-600 cursor-pointer">
            {text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Fan",
      key: "subject",
      width: 150,
      render: (_, record) => (
        <Tag color="blue">
          {record.subject?.title || record.grade?.subject?.title || "-"}
        </Tag>
      ),
    },
    {
      title: "Daraja",
      key: "grade",
      width: 120,
      render: (_, record) => (
        <Tag color="green">{record.grade?.title || "-"}</Tag>
      ),
    },
    {
      title: "A",
      key: "optionA",
      width: 150,
      ellipsis: true,
      render: (_, record) => (
        <Tooltip title={record.options?.[0]?.variant}>
          <span className={record.options?.[0]?.is_correct ? "font-bold text-green-600" : ""}>
            {record.options?.[0]?.variant || "-"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "B",
      key: "optionB",
      width: 150,
      ellipsis: true,
      render: (_, record) => (
        <Tooltip title={record.options?.[1]?.variant}>
          <span className={record.options?.[1]?.is_correct ? "font-bold text-green-600" : ""}>
            {record.options?.[1]?.variant || "-"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "C",
      key: "optionC",
      width: 150,
      ellipsis: true,
      render: (_, record) => (
        <Tooltip title={record.options?.[2]?.variant}>
          <span className={record.options?.[2]?.is_correct ? "font-bold text-green-600" : ""}>
            {record.options?.[2]?.variant || "-"}
          </span>
        </Tooltip>
      ),
    },
    // {
    //   title: "D",
    //   key: "optionD",
    //   width: 150,
    //   ellipsis: true,
    //   render: (_, record) => (
    //     <Tooltip title={record.options?.[3]?.variant}>
    //       <span className={record.options?.[3]?.is_correct ? "font-bold text-green-600" : ""}>
    //         {record.options?.[3]?.variant || "-"}
    //       </span>
    //     </Tooltip>
    //   ),
    // },
    {
      title: "To'g'ri javob",
      key: "answer",
      width: 120,
      render: (_, record) => {
        const correct = record.options?.find((o) => o.is_correct);
        const index = record.options?.findIndex((o) => o.is_correct);
        return correct ? (
          <Tag color="success" className="font-bold">
            {String.fromCharCode(65 + (index || 0))}: {correct.variant}
          </Tag>
        ) : (
          <Tag color="default">-</Tag>
        );
      },
    },
    {
      title: "Amallar",
      key: "actions",
      width: 180,
      fixed: "right",
      render: (_: any, record) => (
        <Space size="small">
          <Button
            size="small"
            type="primary"
            icon={<Edit size={14} />}
            onClick={() => openEditModal(record)}
          >
            Tahrirlash
          </Button>

          <Popconfirm
            title="Savolni o'chirish"
            description="Haqiqatan ham bu savolni o'chirmoqchimisiz?"
            okText="Ha, o'chirish"
            cancelText="Bekor qilish"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger icon={<Trash2 size={14} />}>
              O'chirish
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return columns;
}