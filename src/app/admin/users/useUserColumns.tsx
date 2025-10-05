"use client";

import { Avatar, Button, Popconfirm, Space, Tag } from "antd";
import type { ColumnType } from "antd/es/table";
import type { Breakpoint } from "antd/es/_util/responsiveObserver";
import { User } from "@/store/slices/usersSlice";
import { Edit, Trash2 } from "lucide-react";

type Props = {
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
};

export function useUserColumns({ onEdit, onDelete }: Props) {
  const columns: ColumnType<User>[] = [
    {
      title: "№",
      key: "index",
      width: 50,
      render: (_: any, __: any, index: number) => (
        <span className="font-medium">{index + 1}</span>
      ),
    },
    {
      title: "Rasm",
      dataIndex: "avatar",
      width: 70,
      responsive: ["sm"] as unknown as Breakpoint[],
      render: () => (
        <Avatar
          src="/students-icon.png"
          size={40}
          style={{ backgroundColor: "#f5f5f5" }}
        />
      ),
    },
    {
      title: "Ism",
      dataIndex: "name",
      key: "name",
      width: 150,
      responsive: ["xs", "sm", "md"] as unknown as Breakpoint[],
      render: (text: string) => <span className="font-semibold text-blue-600">{text}</span>,
    },
    {
      title: "Familiya",
      dataIndex: "surname",
      key: "surname",
      width: 150,
      responsive: ["xs", "sm", "md"] as unknown as Breakpoint[],
      render: (text: string) => <span>{text || "-"}</span>,
    },
    {
      title: "Telefon",
      dataIndex: "phone",
      key: "phone",
      width: 150,
      responsive: ["sm", "md"] as unknown as Breakpoint[],
      render: (text: string) => <span>{text || "-"}</span>,
    },
    {
      title: "Izoh",
      dataIndex: "izoh",
      key: "izoh",
      width: 200,
      responsive: ["md"] as unknown as Breakpoint[],
      render: (text: string) => text ? <Tag color="blue">{text}</Tag> : <Tag color="default">-</Tag>,
    },
    {
      title: "Amallar",
      key: "actions",
      width: 200,
      responsive: ["xs", "sm", "md", "lg"] as unknown as Breakpoint[],
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<Edit size={16} />}
            onClick={() => onEdit(record)}
          >
            Tahrirlash
          </Button>
          <Popconfirm
            title="Rostan ham o‘chirmoqchimisiz?"
            okText="Ha"
            cancelText="Yo‘q"
            onConfirm={() => onDelete(record.id)}
          >
            <Button danger icon={<Trash2 size={16} />}>
              O‘chirish
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return columns;
}
