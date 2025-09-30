"use client";

import { Avatar, Button, Popconfirm, Space, Tag } from "antd";
import Link from "next/link";
import type { ColumnType } from "antd/es/table";
import type { Breakpoint } from "antd/es/_util/responsiveObserver";
import { Subject } from "@/store/slices/subjectsSlice";

type Props = {
  openEditModal: (subject: Subject) => void;
  handleDelete: (id: string) => void;
  openGradesModal: (subject: Subject) => void; // 🔹 yangi qo‘shildi
};

export function useSubjectColumns({
  openEditModal,
  handleDelete,
  openGradesModal,
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
      responsive: ["md"] as unknown as Breakpoint[],
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
      responsive: ["xs", "sm", "md", "lg"] as unknown as Breakpoint[],
      render: (text: string, record: Subject) => (
        <Link href={`/admin/subjects/${record.id}`}>
          <span className="font-medium hover:underline">{text}</span>
        </Link>
      ),
    },
    {
      title: "Darajalar",
      key: "grades",
      responsive: ["sm", "md"] as unknown as Breakpoint[],
      render: (_: any, record: Subject) =>
        record.grades.length > 0 ? (
          <div style={{ maxWidth: 250, overflowX: "auto" }}>
            <Space size={[4, 4]} wrap={false}>
              {record.grades.map((g) => (
                <Link
                  key={g.id}
                  href={`/admin/subjects/${record.id}/levels/${g.id}/tests`}
                >
                  <Tag color="blue">{g.title}</Tag>
                </Link>
              ))}
            </Space>
          </div>
        ) : (
          <Tag color="default">Mavjud emas</Tag>
        ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      responsive: ["md", "lg"] as unknown as Breakpoint[],
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
      responsive: ["xs", "sm", "md", "lg"] as unknown as Breakpoint[],
      render: (_: any, record: Subject) => (
        <Space>
          <Button size="small" type="primary" onClick={() => openEditModal(record)}>
            Tahrirlash
          </Button>
          <Popconfirm
            title="Fanni o‘chirishni tasdiqlang"
            okText="Ha"
            cancelText="Yo‘q"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger>
              O‘chirish
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return columns;
}
