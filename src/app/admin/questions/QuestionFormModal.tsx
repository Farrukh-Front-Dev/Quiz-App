"use client";

import { useEffect, useMemo } from "react";
import { useForm, Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { useAppDispatch } from "@/store";
import { createOption, updateOption, deleteOption } from "@/store/slices/optionsSlice";
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
  SelectValue,
} from "@/components/ui/select";

import OptionFields from "./OptionFields";

interface FormValues {
  question: string;
  subjectId: string;
  gradeId: string;
  options: Array<{
    id: string;
    variant: string;
    is_correct: boolean;
  }>;
}

interface Props {
  open: boolean;
  onCancel: () => void;
  onSave: (values: {
    question: string;
    gradeId: string;
  }) => Promise<{ id: string } | void>;
  editingQuestion: Question | null;
  subjects: Subject[];
}

export default function QuestionFormModal({
  open,
  onCancel,
  editingQuestion,
  subjects,
  onSave,
}: Props) {
  const dispatch = useAppDispatch();
  const { register, handleSubmit, reset, watch, setValue, control } = useForm<FormValues>({
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

  // Form to'ldirish (edit rejimida)
  useEffect(() => {
    if (editingQuestion) {
      const subjectId = editingQuestion.subject?.id || editingQuestion.grade?.subject?.id || "";
      reset({
        question: editingQuestion.question,
        subjectId,
        gradeId: editingQuestion.grade?.id || "",
        options: editingQuestion.options?.length
          ? editingQuestion.options.map((o) => ({
              id: o.id,
              variant: o.variant,
              is_correct: o.is_correct,
            }))
          : [
              { id: `temp-${Date.now()}-1`, variant: "", is_correct: false },
              { id: `temp-${Date.now()}-2`, variant: "", is_correct: false },
              { id: `temp-${Date.now()}-3`, variant: "", is_correct: false },
            ],
      });
    } else {
      reset({
        question: "",
        subjectId: "",
        gradeId: "",
        options: [
          { id: `temp-${Date.now()}-1`, variant: "", is_correct: false },
          { id: `temp-${Date.now()}-2`, variant: "", is_correct: false },
          { id: `temp-${Date.now()}-3`, variant: "", is_correct: false },
        ],
      });
    }
  }, [editingQuestion, reset, open]);

  // Form submit
  const handleFormSubmit = async (values: FormValues): Promise<void> => {
    try {
      // 1️⃣ Savolni yaratish/yangilash
      const result = await onSave({
        question: values.question,
        gradeId: values.gradeId,
      });

      const questionId = editingQuestion?.id || result?.id;
      if (!questionId) {
        console.error("❌ Question ID topilmadi!");
        return;
      }

      // 2️⃣ Eski variantlarni o'chirish (faqat edit rejimida)
      if (editingQuestion?.options) {
        const oldOptionIds = editingQuestion.options
          .map((o) => o.id)
          .filter((id): id is string => !!id && !id.startsWith("temp"));
        
        const newOptionIds = values.options
          .map((o) => o.id)
          .filter((id): id is string => !!id && !id.startsWith("temp"));

        const toDelete = oldOptionIds.filter((id) => !newOptionIds.includes(id));
        
        for (const id of toDelete) {
          if (id) {
            await dispatch(deleteOption(id)).unwrap();
          }
        }
      }

      // 3️⃣ Variantlarni yaratish/yangilash
      for (const opt of values.options) {
        if (!opt.variant.trim()) continue;

        if (!opt.id || opt.id.startsWith("temp")) {
          // Yangi variant yaratish
          await dispatch(
            createOption({
              questionId,
              variant: opt.variant,
              is_correct: opt.is_correct,
            })
          ).unwrap();
        } else {
          // Mavjud variantni yangilash
          await dispatch(
            updateOption({
              id: opt.id,
              variant: opt.variant,
              is_correct: opt.is_correct,
            })
          ).unwrap();
        }
      }

      onCancel();
    } catch (error) {
      console.error("❌ handleFormSubmit error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingQuestion ? "Savolni tahrirlash" : "Yangi savol qo'shish"}
          </DialogTitle>
          <DialogDescription>
            Savol matni, fan, daraja va variantlarni kiriting.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Fan tanlash */}
          <div>
            <label className="text-sm font-medium mb-2 block">Fan</label>
            <Select
              value={selectedSubjectId}
              onValueChange={(v) => {
                setValue("subjectId", v);
                setValue("gradeId", "");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Fan tanlang" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grade tanlash */}
          <div>
            <label className="text-sm font-medium mb-2 block">Daraja</label>
            <Select
              value={selectedGradeId}
              onValueChange={(v) => setValue("gradeId", v)}
              disabled={!selectedSubjectId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Daraja tanlang" />
              </SelectTrigger>
              <SelectContent>
                {filteredGrades.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Savol matni */}
          <div>
            <label className="text-sm font-medium mb-2 block">Savol matni</label>
            <Textarea
              {...register("question", { required: true })}
              placeholder="Savolingizni kiriting..."
              rows={3}
            />
          </div>

          {/* Variantlar */}
          <OptionFields control={control} setValue={setValue} watch={watch} />

          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Bekor qilish
            </Button>
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
              Saqlash
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}