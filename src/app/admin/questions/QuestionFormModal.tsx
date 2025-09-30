"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Question, Subject } from "@/store/slices/questionsSlice";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

interface Props {
  open: boolean;
  onCancel: () => void;
  onSave: (values: any) => void;
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
  const { register, handleSubmit, reset, watch, setValue } = useForm<any>({
    defaultValues: {
      question: "",
      subjectId: "",
      gradeId: "",
      options: [
        { variant: "", is_correct: false },
        { variant: "", is_correct: false },
        { variant: "", is_correct: false },
      ],
    },
  });

  const selectedSubjectId = watch("subjectId");
  const filteredGrades = useMemo(
    () =>
      subjects.find((s) => s.id === selectedSubjectId)?.grades || [],
    [subjects, selectedSubjectId]
  );

  useEffect(() => {
    if (editingQuestion) {
      reset({
        question: editingQuestion.question,
        subjectId: editingQuestion.subject?.id,
        gradeId: editingQuestion.grade?.id,
        options: editingQuestion.options,
      });
    } else {
      reset();
    }
  }, [editingQuestion, reset]);

  const handleCorrectChange = (index: number) => {
    const options = watch("options").map((o: any, i: number) => ({
      ...o,
      is_correct: i === index,
    }));
    setValue("options", options);
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingQuestion ? "Savolni tahrirlash" : "Yangi savol"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <Select
            value={watch("subjectId")}
            onValueChange={(v) => setValue("subjectId", v)}
          >
            <SelectTrigger>Fan tanlang</SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={watch("gradeId")}
            onValueChange={(v) => setValue("gradeId", v)}
            disabled={!selectedSubjectId}
          >
            <SelectTrigger>Daraja tanlang</SelectTrigger>
            <SelectContent>
              {filteredGrades.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea {...register("question")} placeholder="Savol matni" />

          {watch("options").map((opt: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                {...register(`options.${idx}.variant`)}
                placeholder={`Variant ${String.fromCharCode(65 + idx)}`}
              />
              <input
                type="radio"
                name="correctOption"
                checked={opt.is_correct}
                onChange={() => handleCorrectChange(idx)}
              />
            </div>
          ))}

          <DialogFooter className="flex justify-end gap-2">
            <Button type="submit">Saqlash</Button>
            <Button variant="destructive" onClick={onCancel}>
              Bekor qilish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
