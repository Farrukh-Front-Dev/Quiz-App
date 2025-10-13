// import { Modal, Form, Input } from "antd";
// import { Subject } from "@/store/slices/subjectsSlice";
// import { useEffect } from "react";

// interface SubjectModalProps {
//   open: boolean;
//   loading: boolean;
//   subject: Subject | null;
//   onClose: () => void;
//   onSave: (values: { title: string }) => Promise<void>;
// }

// export default function SubjectModal({
//   open,
//   loading,
//   subject,
//   onClose,
//   onSave,
// }: SubjectModalProps) {
//   const [form] = Form.useForm();

//   // formni subject bilan to'ldirish
//   useEffect(() => {
//     if (subject) {
//       form.setFieldsValue({ title: subject.title });
//     } else {
//       form.resetFields();
//     }
//   }, [subject]);

//   return (
//     <Modal
//       title={subject ? "Fanni tahrirlash" : "Yangi fan qo‘shish"}
//       open={open}
//       onCancel={onClose}
//       onOk={() => form.submit()}
//       confirmLoading={loading}
//       okText={subject ? "Saqlash" : "Qo‘shish"}
//     >
//       <Form form={form} layout="vertical" onFinish={onSave}>
//         <Form.Item
//           name="title"
//           label="Fan nomi"
//           rules={[{ required: true, message: "Fan nomi majburiy!" }]}
//         >
//           <Input placeholder="Masalan: Matematika" />
//         </Form.Item>
//       </Form>
//     </Modal>
//   );
// }
