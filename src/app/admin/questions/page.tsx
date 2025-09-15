"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import '@ant-design/v5-patch-for-react-19';
import {
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  clearError,
  Question,
} from "@/store/slices/questionsSlice";
import { loadSubjects, Subject } from "@/store/slices/subjectsSlice";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Select,
  Popconfirm,
  message,
  Spin,
  Alert,
  Radio,
  Card,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

export default function QuestionsDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: questions, loading, error } = useSelector(
    (state: RootState) => state.questions
  );
  const { items: subjects, loading: subjectsLoading } = useSelector(
    (state: RootState) => state.subjects
  );

  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>();
  const [selectedGrade, setSelectedGrade] = useState<string>();

  useEffect(() => {
    dispatch(loadSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (selectedSubject || selectedGrade) {
      dispatch(fetchQuestions({ 
        subjectId: selectedSubject, 
        gradeId: selectedGrade 
      }));
    }
  }, [dispatch, selectedSubject, selectedGrade]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Filter grades by selected subject
  const filteredGrades = useMemo(() => {
    if (!selectedSubject) return [];
    const subject = subjects.find((s) => s.id === selectedSubject);
    return subject ? subject.grades : [];
  }, [subjects, selectedSubject]);

  const openAddModal = () => {
    setEditingQuestion(null);
    form.resetFields();
    form.setFieldsValue({
      options: [
        { variant: "", is_correct: false },
        { variant: "", is_correct: false },
        { variant: "", is_correct: false },
      ]
    });
    setModalOpen(true);
  };

  const openEditModal = (question: Question) => {
    if (!question?.subject?.id || !question?.grade?.id) {
      message.error("Savol ma'lumotlari to'liq emas!");
      return;
    }
    
    setEditingQuestion(question);
    form.setFieldsValue({
      question: question.question,
      subjectId: question.subject.id,
      gradeId: question.grade.id,
      options: question.options.length >= 3 
        ? question.options.map((o) => ({ 
            id: o.id,
            variant: o.variant, 
            is_correct: o.is_correct 
          }))
        : [
            ...question.options.map((o) => ({ 
              id: o.id,
              variant: o.variant, 
              is_correct: o.is_correct 
            })),
            ...Array(3 - question.options.length).fill({ variant: "", is_correct: false })
          ]
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // Validate that at least one option is marked as correct
      const hasCorrectAnswer = values.options.some((opt: any) => opt.is_correct);
      if (!hasCorrectAnswer) {
        message.error("Kamida bitta to'g'ri javob belgilang!");
        return;
      }

      // Filter out empty options
      const validOptions = values.options.filter((opt: any) => opt.variant.trim() !== "");
      if (validOptions.length < 2) {
        message.error("Kamida 2 ta variant kiritish kerak!");
        return;
      }

      const payload = {
        question: values.question,
        subjectId: values.subjectId,
        gradeId: values.gradeId,
        options: validOptions,
      };

      if (editingQuestion) {
        await dispatch(updateQuestion({ 
          id: editingQuestion.id, 
          ...payload 
        })).unwrap();
        message.success("Savol muvaffaqiyatli tahrirlandi!");
      } else {
        await dispatch(createQuestion(payload)).unwrap();
        message.success("Savol muvaffaqiyatli qo'shildi!");
      }
      
      setModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      console.error("Save error:", err);
      message.error(err.message || "Saqlashda xatolik yuz berdi!");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteQuestion(id)).unwrap();
      message.success("Savol muvaffaqiyatli o'chirildi!");
    } catch (err: any) {
      console.error("Delete error:", err);
      message.error(err.message || "O'chirishda xatolik yuz berdi!");
    }
  };

  const columns = [
    { 
      title: "№", 
      width: 50,
      render: (_: any, __: any, index: number) => index + 1 
    },
    { 
      title: "Savol", 
      dataIndex: "question", 
      key: "question",
      width: 300,
      ellipsis: true,
    },
    {
      title: "Fan",
      key: "subject",
      width: 120,
      render: (_: any, record: Question) => record.subject?.title || "-"
    },
    {
      title: "Daraja",
      key: "grade", 
      width: 100,
      render: (_: any, record: Question) => record.grade?.title || "-"
    },
    { 
      title: "A", 
      width: 150,
      render: (_: any, record: Question) => record.options[0]?.variant || "-"
    },
    { 
      title: "B", 
      width: 150,
      render: (_: any, record: Question) => record.options[1]?.variant || "-"
    },
    { 
      title: "C", 
      width: 150,
      render: (_: any, record: Question) => record.options[2]?.variant || "-"
    },
    {
      title: "To'g'ri javob",
      key: "correct",
      width: 120,
      render: (_: any, record: Question) => {
        const correct = record.options.find((o) => o.is_correct);
        return correct ? correct.variant : "-";
      },
    },
    {
      title: "Amallar",
      key: "actions",
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Question) => (
        <Space>
          <Button 
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Tahrirlash
          </Button>
          <Popconfirm
            title="Rostan ham o'chirmoqchimisiz?"
            description="Bu amalni bekor qilib bo'lmaydi."
            onConfirm={() => handleDelete(record.id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button 
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              O'chirish
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (subjectsLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">❓ Savollar boshqaruvi</h1>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={openAddModal}
            disabled={!selectedSubject || !selectedGrade}
          >
            Savol qo'shish
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Space wrap>
            <Select
              placeholder="Fan tanlang"
              style={{ width: 200 }}
              allowClear
              value={selectedSubject}
              onChange={(v) => {
                setSelectedSubject(v);
                setSelectedGrade(undefined);
              }}
            >
              {subjects.map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.title}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Daraja tanlang"
              style={{ width: 200 }}
              allowClear
              value={selectedGrade}
              onChange={(v) => setSelectedGrade(v)}
              disabled={!selectedSubject}
            >
              {filteredGrades.map((g) => (
                <Option key={g.id} value={g.id}>
                  {g.title}
                </Option>
              ))}
            </Select>
          </Space>
        </div>

        {/* Error Display */}
        {error && (
          <Alert
            message="Xatolik"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => dispatch(clearError())}
            className="mb-4"
          />
        )}

        {/* Loading or Table */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : (
          <Table 
            rowKey="id" 
            dataSource={questions} 
            columns={columns}
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} / ${total} ta savol`,
            }}
          />
        )}
      </Card>

      {/* Modal */}
      <Modal
        open={modalOpen}
        title={editingQuestion ? "Savolni tahrirlash" : "Yangi savol qo'shish"}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        onOk={handleSave}
        width={800}
        okText="Saqlash"
        cancelText="Bekor qilish"
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="subjectId" 
            label="Fan" 
            rules={[{ required: true, message: "Fan tanlang!" }]}
          >
            <Select
              placeholder="Fan tanlang"
              onChange={(value) => {
                form.setFieldsValue({ gradeId: undefined });
              }}
            >
              {subjects.map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            name="gradeId" 
            label="Daraja" 
            rules={[{ required: true, message: "Daraja tanlang!" }]}
          >
            <Select 
              placeholder="Daraja tanlang" 
              disabled={!form.getFieldValue("subjectId")}
            >
              {(subjects.find((s) => s.id === form.getFieldValue("subjectId"))?.grades || []).map(
                (g) => (
                  <Option key={g.id} value={g.id}>
                    {g.title}
                  </Option>
                )
              )}
            </Select>
          </Form.Item>

          <Form.Item 
            name="question" 
            label="Savol matni" 
            rules={[
              { required: true, message: "Savol matnini kiriting!" },
              { min: 10, message: "Savol kamida 10 ta belgidan iborat bo'lishi kerak!" }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="Savol matnini kiriting..."
            />
          </Form.Item>

          <Form.List name="options">
            {(fields, { add, remove }) => (
              <div>
                <h4 className="mb-3">Javob variantlari:</h4>
                {fields.map((field, idx) => (
                  <div key={field.key} className="mb-3 p-3 border rounded">
                    <Space align="start" className="w-full">
                      <span className="font-medium min-w-[30px]">
                        {String.fromCharCode(65 + idx)}:
                      </span>
                      
                      <Form.Item
                        {...field}
                        name={[field.name, "variant"]}
                        rules={[
                          { required: true, message: "Variant matnini kiriting!" }
                        ]}
                        className="flex-1 mb-0"
                      >
                        <Input placeholder={`Variant ${String.fromCharCode(65 + idx)}`} />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        name={[field.name, "is_correct"]}
                        valuePropName="checked"
                        className="mb-0"
                      >
                        <Radio.Button>
                          To'g'ri
                        </Radio.Button>
                      </Form.Item>

                      {fields.length > 2 && (
                        <Button 
                          danger 
                          onClick={() => remove(field.name)}
                          disabled={fields.length <= 2}
                        >
                          O'chirish
                        </Button>
                      )}
                    </Space>
                  </div>
                ))}
                
                {fields.length < 6 && (
                  <Button 
                    type="dashed" 
                    onClick={() => add({ variant: "", is_correct: false })}
                    block
                  >
                    + Variant qo'shish
                  </Button>
                )}
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}