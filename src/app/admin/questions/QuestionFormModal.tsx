"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "@/store";
import { createOption, updateOption } from "@/store/slices/optionsSlice";
import { Question, Subject } from "@/store/slices/questionsSlice";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import OptionFields from "./OptionFields";

interface Props {
  open: boolean;
  onCancel: () => void;
  onSave: (values: {  
    question: string;
    subjectId: string;
    gradeId: string;
  }) => Promise<{ id: string } | void>;
  editingQuestion: Question | null;
  subjects: Subject[];
}

export default function QuestionFormModal({
  open,
  onCancel,
  onSave,
  editingQuestion,
  subjects,
}: Props) {
  const dispatch = useAppDispatch();
  const { register, handleSubmit, reset, watch, setValue, control } = useForm<any>({
    defaultValues: {
      question: "",
      subjectId: "",
      gradeId: "",
      options: [],
    },
  });

  const selectedSubjectId = watch("subjectId");
  const selectedGradeId = watch("gradeId");

  const filteredGrades = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubjectId)?.grades || [];
  }, [subjects, selectedSubjectId]);

  // 🧠 Edit rejimida formni to‘ldirish
  useEffect(() => {
    if (editingQuestion) {
      reset({
        question: editingQuestion.question,
        subjectId: editingQuestion.subject?.id || "",
        gradeId: editingQuestion.grade?.id || "",
        options:
          editingQuestion.options?.map((o) => ({
            id: o.id,
            variant: o.variant,
            is_correct: o.is_correct,
          })) || [],
      });
    } else {
      reset({
        question: "",
        subjectId: "",
        gradeId: "",
        options: [
          { id: "temp-1", variant: "", is_correct: false },
          { id: "temp-2", variant: "", is_correct: false },
          { id: "temp-3", variant: "", is_correct: false },
        ],
      });
    }
  }, [editingQuestion, reset]);

  // 🧾 Form submit
  const handleFormSubmit = async (values: any) => {
    const res = await onSave({
      question: values.question,
      subjectId: values.subjectId,
      gradeId: values.gradeId,
    });

    const questionId = editingQuestion?.id || res?.id;
    if (!questionId) return;

    for (const opt of values.options) {
      if (!opt.variant.trim()) continue;

      if (opt.id?.startsWith("temp")) {
        // 🔹 Yangi variant → create
        await dispatch(
          createOption({
            question_id: questionId,
            variant: opt.variant,
            is_correct: opt.is_correct,
          })
        );
      } else {
        // 🔹 Mavjud variant → update
        await dispatch(
          updateOption({
            id: opt.id,
            variant: opt.variant,
            is_correct: opt.is_correct,
          })
        );
      }
    }

    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingQuestion ? "Savolni tahrirlash" : "Yangi savol qo‘shish"}
          </DialogTitle>
          <DialogDescription>
            Savol matni, fan, daraja va variantlarni kiriting.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Fan tanlash */}
          <Select
            value={selectedSubjectId}
            onValueChange={(v) => {
              setValue("subjectId", v);
              setValue("gradeId", "");
            }}
          >
            <SelectTrigger>
              {subjects.find((s) => s.id === selectedSubjectId)?.title ||
                "Fan tanlang"}
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Grade tanlash */}
          <Select
            value={selectedGradeId}
            onValueChange={(v) => setValue("gradeId", v)}
            disabled={!selectedSubjectId}
          >
            <SelectTrigger>
              {filteredGrades.find((g) => g.id === selectedGradeId)?.title ||
                "Daraja tanlang"}
            </SelectTrigger>
            <SelectContent>
              {filteredGrades.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Savol matni */}
          <Textarea
            {...register("question", { required: true })}
            placeholder="Savol matni"
          />

          {/* Variantlar (alohida komponent) */}
          <OptionFields control={control} setValue={setValue} watch={watch} />

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Bekor qilish
            </Button>
            <Button type="submit" className="bg-blue-600 text-white">
              Saqlash
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
