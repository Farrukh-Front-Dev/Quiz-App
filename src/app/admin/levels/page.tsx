"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { loadGrades } from "@/store/slices/gradesSlice";
import { useParams } from "next/navigation";

export default function LevelsDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: grades, loading, error } = useSelector((state: RootState) => state.grades);
  const params = useParams();
  const { subjectId } = params; // /subjects/[subjectId]/levels

  useEffect(() => {
    dispatch(loadGrades());
  }, [dispatch]);

  const filteredGrades = grades.filter((g) => g.subject.id === subjectId);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Darajalar</h1>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {loading && <p>Loading...</p>}

      <div className="space-y-4">
        {filteredGrades.length > 0 ? (
          filteredGrades.map((grade) => (
            <div
              key={grade.id}
              className="p-4 border rounded flex justify-between items-center"
            >
              <h2 className="text-lg font-semibold">{grade.title}</h2>
              <a
                href={`/admin/subjects/${subjectId}/levels/${grade.id}/tests`}
                className="text-blue-600 hover:underline"
              >
                Testlar
              </a>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Darajalar mavjud emas</p>
        )}
      </div>
    </div>
  );
}
