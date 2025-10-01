"use client";

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadSubjects,
  addSubject,
  editSubject,
  removeSubject,
  searchSubjectsByTitle,
  Subject,
} from "@/store/slices/subjectsSlice";
import {
  createGrade,
  updateGrade,
  deleteGrade,
  Grade,
} from "@/store/slices/gradesSlice";
import { RootState, AppDispatch } from "@/store";
import { Table, Button, Typography, notification, Input } from "antd";
import { useSubjectColumns } from "@/app/admin/subjects/useSubjectColumns";
import SuperModal from "@/components/admin/SuperModal";
import { BookOpenText, Plus } from "lucide-react"; // ✅ Lucide icons

const { Title } = Typography;

// ===== Notification Hook =====
const useNotify = () => {
  const notifySuccess = useCallback((message: string) => {
    notification.success({ message, placement: "topRight" });
  }, []);
  const notifyError = useCallback((message: string) => {
    notification.error({ message, placement: "topRight" });
  }, []);
  return { notifySuccess, notifyError };
};

export default function SubjectsDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: subjects,
    loading,
    error,
  } = useSelector((state: RootState) => state.subjects);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [saving, setSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(5);

  const { notifySuccess, notifyError } = useNotify();

  useEffect(() => {
    dispatch(loadSubjects());
  }, [dispatch]);

  // responsive page size
  useEffect(() => {
    const updatePageSize = () => {
      if (window.innerWidth >= 1600) setPageSize(12);
      else if (window.innerWidth >= 1200) setPageSize(10);
      else if (window.innerWidth >= 992) setPageSize(8);
      else if (window.innerWidth >= 768) setPageSize(6);
      else setPageSize(4);
    };
    updatePageSize();
    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, []);

  // ====== SUBJECT CRUD ======
  const openAddModal = () => {
    setEditingSubject(null);
    setModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setModalOpen(true);
  };

  const handleSaveSubject = async (values: { id?: string; title: string }) => {
    try {
      setSaving(true);

      if (editingSubject) {
        await dispatch(
          editSubject({ id: editingSubject.id, title: values.title })
        ).unwrap();
        notifySuccess("Fan o‘zgartirildi!");
      } else {
        await dispatch(addSubject({ title: values.title })).unwrap();
        notifySuccess("Fan qo‘shildi!");
      }

      setModalOpen(false);
      setEditingSubject(null);
    } catch (err: any) {
      notifyError(err?.message || "Xatolik!");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await dispatch(removeSubject(id)).unwrap();
      notifySuccess("Fan o‘chirildi!");
    } catch (err: any) {
      notifyError(err?.message || "Xatolik!");
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      dispatch(searchSubjectsByTitle(value));
    } else {
      dispatch(loadSubjects());
    }
  };

  // ====== GRADE CRUD (parent state bilan sync) ======
  // SubjectsDashboard.tsx

  const handleAddGrade = async (payload: {
    title: string;
    subjectId: string;
  }): Promise<Grade> => {
    try {
      const newGrade = await dispatch(createGrade(payload)).unwrap();
      // parent state bilan sync
      setEditingSubject((prev) =>
        prev ? { ...prev, grades: [...prev.grades, newGrade] } : prev
      );
      notifySuccess("Daraja qo‘shildi!");
      return newGrade; // ✅ Grade qaytaryapmiz
    } catch (err: any) {
      notifyError(err?.message || "Xatolik!");
      throw err;
    }
  };

  const handleUpdateGrade = async (payload: {
    id: string;
    title: string;
    subjectId: string;
  }): Promise<Grade> => {
    try {
      const updatedGrade = await dispatch(updateGrade(payload)).unwrap();
      setEditingSubject((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          grades: prev.grades.map((g) =>
            g.id === updatedGrade.id ? updatedGrade : g
          ),
        };
      });
      notifySuccess("Daraja o‘zgartirildi!");
      return updatedGrade; // ✅ Grade qaytaryapmiz
    } catch (err: any) {
      notifyError(err?.message || "Xatolik!");
      throw err;
    }
  };

  // SubjectsDashboard.tsx
  const handleDeleteGrade = async (id: string): Promise<void> => {
    try {
      await dispatch(deleteGrade(id)).unwrap();
      // parent state bilan sync
      setEditingSubject((prev) =>
        prev
          ? { ...prev, grades: prev.grades.filter((g) => g.id !== id) }
          : prev
      );
      notifySuccess("Daraja o‘chirildi!");
    } catch (err: any) {
      notifyError(err?.message || "Xatolik!");
      throw err;
    }
  };

  const columns = useSubjectColumns({
    openEditModal,
    handleDelete: handleDeleteSubject,
  });

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <Title className="flex justify-between items-center gap-2" level={3}>
          <BookOpenText className="text-green-600" />
          Fanlar boshqaruvi
        </Title>
        <div className="flex gap-2">
          <Input.Search
            placeholder="Fanlarni izlash..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={openAddModal}
          >
            Yangi fan
          </Button>
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <Table
        rowKey="id"
        dataSource={subjects}
        columns={columns}
        loading={loading}
        pagination={{ pageSize }}
      />

      {/* SUPER MODAL */}
      <SuperModal
        open={modalOpen}
        loading={saving}
        subject={editingSubject}
        onClose={() => setModalOpen(false)}
        onSaveSubject={handleSaveSubject}
        onAddGrade={handleAddGrade}
        onUpdateGrade={handleUpdateGrade}
        onDeleteGrade={handleDeleteGrade}
      />
    </div>
  );
}
