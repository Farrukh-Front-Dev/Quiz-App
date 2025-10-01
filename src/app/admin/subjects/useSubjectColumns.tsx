"use client";

import { Avatar, Button, Popconfirm, Space, Tag } from "antd";
import type { ColumnType } from "antd/es/table";
import { Subject } from "@/store/slices/subjectsSlice";
import { Trash2, Edit } from "lucide-react";

type Props = {
  openEditModal: (subject: Subject) => void;
  handleDelete: (id: string) => void;
};

export function useSubjectColumns({
  openEditModal,
  handleDelete,
}: Props) {
  const columns: ColumnType<Subject>[] = [
    {
      title: "№",
      key: "index",
      render: (_: any, __: any, index: number) => <span>{index + 1}</span>,
      width: 50,
    },
    {
      title: "Rasm",
      dataIndex: "avatar",
      width: 70,
      responsive: ["md"],
      render: () => (
        <Avatar
          src="/subjects-icon.png"
          size={40}
          style={{ backgroundColor: "#f5f5f5" }}
        />
      ),
    },
    {
      title: "Fan nomi",
      dataIndex: "title",
      key: "title",
      render: (text: string) => (
        <span className="font-medium text-blue-600">{text}</span>
      ),
    },
    {
      title: "Darajalar",
      key: "grades",
      render: (_: any, record: Subject) =>
        record.grades.length > 0 ? (
          <div className="flex flex-wrap gap-2 max-w-[250px]">
            {record.grades.map((g) => (
              <Tag key={g.id} color="blue">
                {g.title}
              </Tag>
            ))}
          </div>
        ) : (
          <Tag color="default">Mavjud emas</Tag>
        ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      responsive: ["md", "lg"],
      render: (is_active: boolean) =>
        is_active ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        ),
    },
    {
      title: "Amallar",
      key: "actions",
      responsive: ["xs", "sm", "md", "lg"],
      render: (_: any, record: Subject) => (
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
    title="Fanni o‘chirishni tasdiqlang"
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
