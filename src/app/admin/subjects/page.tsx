"use client";

import { useEffect, useState } from "react";
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
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Typography,
  Collapse,
  Space,
} from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useSubjectColumns } from "@/app/admin/subjects/useSubjectColumns";

const { Title } = Typography;
const { Search } = Input;
const { Panel } = Collapse;

export default function SubjectsDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: subjects, loading, error } = useSelector(
    (state: RootState) => state.subjects
  );

  const [form] = Form.useForm();
  const [gradeForm] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [gradesModalOpen, setGradesModalOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [gradeSaving, setGradeSaving] = useState(false);

  useEffect(() => {
    dispatch(loadSubjects());
  }, [dispatch]);

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
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    form.setFieldsValue({ title: subject.title });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingSubject) {
        await dispatch(
          editSubject({ id: editingSubject.id, title: values.title })
        ).unwrap();
        message.success("Fan o‘zgartirildi!");
      } else {
        await dispatch(addSubject({ title: values.title })).unwrap();
        message.success("Fan qo‘shildi!");
      }
      setModalOpen(false);
    } catch (err: any) {
      message.error(err?.message || "Xatolik!");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(removeSubject(id)).unwrap();
      message.success("Fan o‘chirildi!");
    } catch (err: any) {
      message.error(err?.message || "Xatolik!");
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

  // ====== GRADE CRUD ======
  const openGradesModal = (subject: Subject) => {
    setCurrentSubject(subject);
    setGradesModalOpen(true);
  };

  const handleSaveGrade = async () => {
    try {
      const values = await gradeForm.validateFields();
      setGradeSaving(true);
      if (editingGrade) {
        await dispatch(
          updateGrade({
            id: editingGrade.id, title: values.title,
            subjectId: ""
          })
        ).unwrap();
        message.success("Daraja o‘zgartirildi!");
      } else if (currentSubject) {
        await dispatch(
          createGrade({ subjectId: currentSubject.id, title: values.title })
        ).unwrap();
        message.success("Daraja qo‘shildi!");
      }
      setGradesModalOpen(true);
      setEditingGrade(null);
      gradeForm.resetFields();
    } catch (err: any) {
      message.error(err?.message || "Xatolik!");
    } finally {
      setGradeSaving(false);
    }
  };

  const handleDeleteGrade = async (id: string) => {
    console.log("🗑️ O‘chirilayotgan grade ID:", id);
    try {
      await dispatch(deleteGrade(id)).unwrap();
      message.success("Daraja o‘chirildi!");
    } catch (err: any) {
      console.error("❌ Delete error:", err);
      message.error(err?.message || "Xatolik!");
    }
  };
  

  const columns = useSubjectColumns({ openEditModal, handleDelete, openGradesModal });

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <Title level={3}>📚 Fanlar boshqaruvi</Title>
        <div className="flex gap-2">
          <Search
            placeholder="Fanlarni izlash..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            style={{ width: 250 }}
          />
          <Button type="primary" onClick={openAddModal}>
            + Yangi fan
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
        expandable={{
          expandedRowRender: (subject: Subject) => (
            <Collapse>
              <Panel header="Darajalar" key="1">
                <Space direction="vertical" className="w-full">
                  {subject.grades?.map((g) => (
                    <div
                      key={g.id}
                      className="flex justify-between items-center border p-2 rounded"
                    >
                      <span>{g.title}</span>
                      <Space>
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => {
                            setEditingGrade(g);
                            gradeForm.setFieldsValue({ title: g.title });
                            setCurrentSubject(subject);
                            setGradesModalOpen(true);
                          }}
                        />
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteGrade(g.id)}
                        />
                      </Space>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingGrade(null);
                      gradeForm.resetFields();
                      setCurrentSubject(subject);
                      setGradesModalOpen(true);
                    }}
                  >
                    + Yangi daraja
                  </Button>
                </Space>
              </Panel>
            </Collapse>
          ),
        }}
      />

      {/* SUBJECT Modal */}
      <Modal
        title={editingSubject ? "Fanni tahrirlash" : "Yangi fan qo‘shish"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editingSubject ? "Saqlash" : "Qo‘shish"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Fan nomi"
            rules={[{ required: true, message: "Fan nomi majburiy!" }]}
          >
            <Input placeholder="Masalan: Matematika" />
          </Form.Item>
        </Form>
      </Modal>

      {/* GRADE Modal */}
      <Modal
        title={editingGrade ? "Darajani tahrirlash" : "Yangi daraja qo‘shish"}
        open={gradesModalOpen}
        onCancel={() => {
          setGradesModalOpen(false);
          setEditingGrade(null);
        }}
        onOk={handleSaveGrade}
        confirmLoading={gradeSaving}
        okText={editingGrade ? "Saqlash" : "Qo‘shish"}
      >
        <Form form={gradeForm} layout="vertical">
          <Form.Item
            name="title"
            label="Daraja nomi"
            rules={[{ required: true, message: "Daraja nomi majburiy!" }]}
          >
            <Input placeholder="Masalan: 1-sinf" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
