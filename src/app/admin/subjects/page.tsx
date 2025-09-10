"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  loadSubjects,
  addSubject,
  editSubject,
  removeSubject,
  Subject,
} from "@/store/slices/subjectsSlice";
import { RootState, AppDispatch } from "@/store";

export default function SubjectsDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: subjects, loading, error } = useSelector((state: RootState) => state.subjects);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(loadSubjects());
  }, [dispatch]);

  const handleAdd = async () => {
    if (!newTitle.trim() || !currentUser) return;
    try {
      setAdding(true);
      await dispatch(addSubject({ title: newTitle, userId: currentUser.id })).unwrap();

      setNewTitle("");
    } catch (err: any) {
      alert(err.message || "Fan qo‘shishda xatolik yuz berdi");
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = async (id: string) => {
    const newName = prompt("Yangi fan nomini kiriting:");
    if (!newName) return;
    try {
      setEditingId(id);
      await dispatch(editSubject({ id, title: newName })).unwrap();
    } catch (err: any) {
      alert(err.message || "Fan nomini o‘zgartirishda xatolik");
    } finally {
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Fanni o‘chirishni xohlaysizmi?")) return;
    try {
      setDeletingId(id);
      await dispatch(removeSubject(id)).unwrap();
    } catch (err: any) {
      alert(err.message || "Fanni o‘chirishda xatolik");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Fanlar va Darajalar</h1>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      {currentUser && (
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Yangi fan nomi"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 rounded"
            disabled={adding}
          >
            {adding ? "Loading..." : "Qo‘shish"}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {subjects.map((subject: Subject) => {
          const isOwner = subject.created_by === currentUser?.id;
          return (
            <div key={subject.id} className="p-4 border rounded flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{subject.title}</h2>
                {subject.grades.length > 0 ? (
                  <ul className="ml-4 mt-2 list-disc">
                    {subject.grades.map((grade) => (
                      <li key={grade.id}>
                        <Link
                          href={`/admin/subjects/${subject.id}/levels/${grade.id}/tests`}
                          className="text-blue-600 hover:underline"
                        >
                          {grade.title} → Testlar
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="ml-4 text-gray-500">Darajalar mavjud emas</p>
                )}
              </div>

              <div className="flex gap-2">
                {isOwner && (
                  <>
                    <button
                      onClick={() => handleEdit(subject.id)}
                      className="bg-yellow-400 px-3 rounded"
                      disabled={editingId === subject.id}
                    >
                      {editingId === subject.id ? "Loading..." : "Edit"}
                    </button>
                    <button
                      onClick={() => handleDelete(subject.id)}
                      className="bg-red-500 text-white px-3 rounded"
                      disabled={deletingId === subject.id}
                    >
                      {deletingId === subject.id ? "Loading..." : "Delete"}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
