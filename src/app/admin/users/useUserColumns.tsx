"use client";

import { useMemo } from "react";
import { Avatar, Button, Popconfirm, Space, Tag, Tooltip } from "antd";
import type { ColumnType } from "antd/es/table";
import { User } from "@/store/slices/usersSlice";
import { Edit, Trash2, Phone, User as UserIcon } from "lucide-react";

interface UseUserColumnsProps {
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

/**
 * Custom hook for user table columns with memoization
 * Non-responsive version - all columns always visible
 */
export function useUserColumns({ onEdit, onDelete }: UseUserColumnsProps) {
  const columns: ColumnType<User>[] = useMemo(
    () => [
      {
        title: "№",
        key: "index",
        width: 60,
        align: "center" as const,
        render: (_: any, __: User, index: number) => (
          <span className="font-semibold text-gray-700">{index + 1}</span>
        ),
      },
      {
        title: "Profil",
        dataIndex: "avatar",
        key: "avatar",
        width: 80,
        align: "center" as const,
        render: (_: string, record: User) => (
          <Tooltip title={`${record.name} ${record.surname}`}>
            <Avatar
              src={record.avatar || "/students-icon.png"}
              alt={`${record.name} avatar`}
              size={48}
              icon={<UserIcon size={24} />}
              className="shadow-sm border-2 border-white hover:scale-110 transition-transform duration-200"
              style={{ backgroundColor: "#fff1" }}
            />
          </Tooltip>
        ),
      },
      {
        title: "Ism",
        dataIndex: "name",
        key: "name",
        width: 150,
        ellipsis: {
          showTitle: false,
        },
        render: (text: string) => (
          <Tooltip title={text}>
            <span className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              {text || "-"}
            </span>
          </Tooltip>
        ),
      },
      {
        title: "Familiya",
        dataIndex: "surname",
        key: "surname",
        width: 150,
        ellipsis: {
          showTitle: false,
        },
        render: (text: string) => (
          <Tooltip title={text}>
            <span className="text-gray-700 font-medium">{text || "-"}</span>
          </Tooltip>
        ),
      },
      {
        title: "Telefon",
        dataIndex: "phone",
        key: "phone",
        width: 160,
        render: (text: string) => (
          <a
            href={`tel:${text}`}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors group"
          >
            <Phone size={16} className="group-hover:scale-110 transition-transform" />
            <span className="font-mono">{text || "-"}</span>
          </a>
        ),
      },
      {
        title: "Izoh",
        dataIndex: "izoh",
        key: "izoh",
        width: 200,
        ellipsis: {
          showTitle: false,
        },
        render: (text: string | null) => {
          if (!text) {
            return (
              <Tag color="default" className="rounded-full">
                Izoh yo'q
              </Tag>
            );
          }
          return (
            <Tooltip title={text}>
              <Tag color="blue" className="rounded-full max-w-full truncate">
                {text}
              </Tag>
            </Tooltip>
          );
        },
      },
      {
        title: "Holat",
        dataIndex: "is_active",
        key: "is_active",
        width: 100,
        align: "center" as const,
        render: (isActive: boolean) => (
          <Tag
            color={isActive ? "success" : "default"}
            className="rounded-full font-medium"
          >
            {isActive ? "Faol" : "Faol emas"}
          </Tag>
        ),
      },
      {
        title: "Amallar",
        key: "actions",
        width: 220,
        align: "center" as const,
        render: (_: any, record: User) => (
          <Space size="small" className="flex justify-center">
            <Tooltip title="Tahrirlash">
              <Button
                type="primary"
                size="middle"
                icon={<Edit size={16} />}
                onClick={() => onEdit(record)}
                className="hover:scale-105 transition-transform shadow-sm"
                aria-label={`Tahrirlash ${record.name} ${record.surname}`}
              >
                Tahrirlash
              </Button>
            </Tooltip>

            <Popconfirm
              title="Userni o'chirish"
              description={`${record.name} ${record.surname}ni rostan ham o'chirmoqchimisiz?`}
              okText="Ha, o'chirish"
              cancelText="Yo'q"
              okButtonProps={{
                danger: true,
                className: "hover:scale-105 transition-transform",
              }}
              onConfirm={() => onDelete(record.id)}
            >
              <Tooltip title="O'chirish">
                <Button
                  danger
                  size="middle"
                  icon={<Trash2 size={16} />}
                  className="hover:scale-105 transition-transform shadow-sm"
                  aria-label={`O'chirish ${record.name} ${record.surname}`}
                >
                  O'chirish
                </Button>
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [onEdit, onDelete]
  );

  return columns;
}