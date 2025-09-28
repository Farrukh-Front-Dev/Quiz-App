"use client";

import { Avatar, Button, Popconfirm, Space } from "antd";
import type { ColumnType } from "antd/es/table";
import type { Breakpoint } from "antd/es/_util/responsiveObserver";
import { User } from "@/store/slices/usersSlice";

type Props = {
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
};

export function useUserColumns({ onEdit, onDelete }: Props) {
  const columns: ColumnType<User>[] = [
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
      width: 150,
      responsive: ["xs", "sm", "md"] as unknown as Breakpoint[],
    },
    {
      title: "Familiya",
      dataIndex: "surname",
      width: 150,
      responsive: ["xs", "sm", "md"] as unknown as Breakpoint[],
    },
    {
      title: "Telefon",
      dataIndex: "phone",
      width: 150,
      responsive: ["sm", "md"] as unknown as Breakpoint[],
    },
    {
      title: "Izoh",
      dataIndex: "izoh",
      width: 200,
      responsive: ["md"] as unknown as Breakpoint[],
      render: (izoh: string) => izoh || "-",
    },
    {
      title: "Amallar",
      key: "actions",
      width: 200,
      responsive: ["xs", "sm", "md", "lg"] as unknown as Breakpoint[],
      render: (_, record: User) => (
        <Space>
          <Button type="primary" onClick={() => onEdit(record)}>
            Tahrirlash



            {/* csdcasd */}
          </Button>
          <Popconfirm
            title="Rostan ham o‘chirmoqchimisiz?"
            onConfirm={() => onDelete(record.id)}
            okText="Ha"
            cancelText="Yo‘q"
          >
            <Button danger>O‘chirish</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return columns;
}
