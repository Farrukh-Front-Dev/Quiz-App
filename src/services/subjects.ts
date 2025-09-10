import api from "@/lib/api";

export type Grade = { id: string; title: string };
export type Subject = { id: string; title: string; grades: Grade[] };

export const fetchSubjects = async () => {
    return await api.get("/subjects");
};

export const createSubject = async (title: string) => {
    return await api.post("/subjects", { title });
};

export const updateSubject = async (id: string, title: string) => {
    return await api.patch(`/subjects/${id}`, { title });
};

export const deleteSubject = async (id: string) => {
    return await api.delete(`/subjects/${id}`);
};
    