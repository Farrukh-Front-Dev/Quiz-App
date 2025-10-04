// "use client";

// import { useEffect, useMemo, useState, useCallback } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState, AppDispatch } from "@/store";
// import {
//   fetchGrades,
//   createGrade,
//   updateGrade,
//   deleteGrade,
//   Grade,
// } from "@/store/slices/gradesSlice";
// import { loadSubjects, Subject } from "@/store/slices/subjectsSlice";
// import {
//   Table,
//   Button,
//   Modal,
//   Form,
//   Select,
//   Space,
//   Popconfirm,
//   Tag,
//   Avatar,
//   message,
// } from "antd";
// import InfinityLoader from "@/components/admin/InfinityLoader";
// import { GRADE_OPTIONS } from "@/constants/grades";

// function useResponsivePageSize() {
//   const [pageSize, setPageSize] = useState(5);

//   useEffect(() => {
//     function updatePageSize() {
//       const w = window.innerWidth;
//       if (w < 640) setPageSize(4);
//       else if (w < 1024) setPageSize(6);
//       else if (w < 1440) setPageSize(10);
//       else setPageSize(10);
//     }
//     updatePageSize();
//     window.addEventListener("resize", updatePageSize);
//     return () => window.removeEventListener("resize", updatePageSize);
//   }, []);

//   return pageSize;
// }

// type GradesTableColumnsProps = {
//   onEdit: (grade: Grade) => void;
//   onDelete: (id: string) => void;
// };

// const GradesTableColumns = ({ onEdit, onDelete }: GradesTableColumnsProps) => {
//   return [
//     {
//       title: "№",
//       key: "index",
//       render: (_: any, __: any, index: number) => <span>{index + 1}</span>,
//       width: 50,
//     },
//     {
//       title: "Rasm",
//       key: "avatar",
//       render: () => <Avatar src="/grades-icon.jpg" size={40} />,
//       width: 70,
//     },
//     {
//       title: "Daraja",
//       dataIndex: "title",
//       key: "title",
//       render: (title: string) => <Tag color="blue">{title.toUpperCase()}</Tag>,
//     },
//     {
//       title: "Fan",
//       key: "subject",
//       render: (_: any, record: Grade) => (
//         <Tag color="green">{record.subject?.title}</Tag>
//       ),
//     },
//     {
//       title: "Status",
//       dataIndex: "is_active",
//       key: "status",
//       render: (active: boolean) =>
//         active ? <Tag color="success">Active</Tag> : <Tag color="error">Inactive</Tag>,
//     },
//     {
//       title: "Amallar",
//       key: "actions",
//       render: (_: any, record: Grade) => (
//         <Space>
//           <Button size="small" type="primary" onClick={() => onEdit(record)}>
//             Tahrirlash
//           </Button>
//           <Popconfirm
//             title="O‘chirishni tasdiqlaysizmi?"
//             onConfirm={() => onDelete(record.id)}
//             okText="Ha"
//             cancelText="Yo‘q"
//           >
//             <Button size="small" danger>
//               O‘chirish
//             </Button>
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];
// };

// export default function GradesPage() {
//   const dispatch = useDispatch<AppDispatch>();
//   const { items: grades, loading, error } = useSelector((state: RootState) => state.grades);
//   const { items: subjects } = useSelector((state: RootState) => state.subjects);

//   const [filterSubject, setFilterSubject] = useState<string | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
//   const [form] = Form.useForm();

//   const pageSize = useResponsivePageSize();

//   useEffect(() => {
//     dispatch(fetchGrades());
//     dispatch(loadSubjects());
//   }, [dispatch]);

//   const filteredGrades = useMemo(() => {
//     return filterSubject
//       ? grades.filter((g) => g.subject?.id === filterSubject)
//       : grades;
//   }, [grades, filterSubject]);

//   const openCreateModal = useCallback(() => {
//     setEditingGrade(null);
//     form.resetFields();
//     setIsModalOpen(true);
//   }, [form]);

//   const openEditModal = useCallback(
//     (grade: Grade) => {
//       setEditingGrade(grade);
//       form.setFieldsValue({
//         title: grade.title,
//         subject_id: grade.subject.id,
//       });
//       setIsModalOpen(true);
//     },
//     [form]
//   );

//   const handleSave = useCallback(async () => {
//     try {
//       const values = await form.validateFields();
//       if (editingGrade) {
//         await dispatch(updateGrade({ id: editingGrade.id, ...values })).unwrap();
//         message.success("Daraja o‘zgartirildi!");
//       } else {
//         await dispatch(createGrade(values)).unwrap();
//         message.success("Daraja qo‘shildi!");
//       }
//       setIsModalOpen(false);
//     } catch (err: any) {
//       message.error(err.message || "Xatolik!");
//     }
//   }, [dispatch, editingGrade, form]);

//   const handleDelete = useCallback(
//     async (id: string) => {
//       try {
//         await dispatch(deleteGrade(id)).unwrap();
//         message.success("Daraja o‘chirildi!");
//       } catch (err: any) {
//         message.error(err.message || "O‘chirishda xatolik!");
//       }
//     },
//     [dispatch]
//   );

//   return (
//     <div className="p-6 bg-white rounded-xl shadow-sm">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-bold">📊 Darajalar boshqaruvi</h1>
//         <Button type="primary" onClick={openCreateModal}>
//           + Yangi daraja
//         </Button>
//       </div>

//       <div className="mb-4">
//         <Select
//           allowClear
//           placeholder="Fan bo‘yicha filter"
//           style={{ width: 250 }}
//           onChange={(value) => setFilterSubject(value || null)}
//         >
//           {subjects.map((s: Subject) => (
//             <Select.Option key={s.id} value={s.id}>
//               {s.title}
//             </Select.Option>
//           ))}
//         </Select>
//       </div>

//       {loading && <InfinityLoader />}
//       {error && <p className="text-red-500">{error}</p>}

//       <Table
//         rowKey="id"
//         dataSource={filteredGrades}
//         columns={GradesTableColumns({ onEdit: openEditModal, onDelete: handleDelete })}
//         pagination={{ pageSize }}
//       />

//       <Modal
//         open={isModalOpen}
//         title={editingGrade ? "Darajani tahrirlash" : "Yangi daraja qo‘shish"}
//         onCancel={() => setIsModalOpen(false)}
//         onOk={handleSave}
//         okText="Saqlash"
//       >
//         <Form form={form} layout="vertical">
//           <Form.Item
//             name="title"
//             label="Daraja nomi"
//             rules={[{ required: true, message: "Darajani tanlang!" }]}
//           >
//             <Select placeholder="Darajani tanlang">
//               {GRADE_OPTIONS.map((g) => (
//                 <Select.Option key={g} value={g}>
//                   {g.toUpperCase()}
//                 </Select.Option>
//               ))}
//             </Select>
//           </Form.Item>

//           <Form.Item
//             name="subject_id"
//             label="Fan"
//             rules={[{ required: true, message: "Fan tanlang!" }]}
//           >
//             <Select placeholder="Fan tanlang">
//               {subjects.map((s: Subject) => (
//                 <Select.Option key={s.id} value={s.id}>
//                   {s.title}
//                 </Select.Option>
//               ))}
//             </Select>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// }
