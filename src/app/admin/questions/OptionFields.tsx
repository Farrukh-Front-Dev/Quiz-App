"use client";

import { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";

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

interface OptionFieldsProps {
  control: Control<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  watch: UseFormWatch<FormValues>;
}

export default function OptionFields({
  control,
  setValue,
  watch,
}: OptionFieldsProps) {
  const options = watch("options");

  const handleAddOption = () => {
    setValue("options", [
      ...options,
      { id: `temp-${Date.now()}`, variant: "", is_correct: false },
    ]);
  };

  const handleRemoveOption = (index: number) => {
    setValue("options", options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (
    index: number,
    field: "variant" | "is_correct",
    value: string | boolean
  ) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setValue("options", updated);
  };

  const handleCorrectChange = (index: number) => {
    const updated = options.map((o, i) => ({
      ...o,
      is_correct: i === index,
    }));
    setValue("options", updated);
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium block">Variantlar</label>

      {options.map((option, index) => (
        <div key={option.id} className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              value={option.variant}
              onChange={(e) => handleOptionChange(index, "variant", e.target.value)}
              placeholder={`Variant ${index + 1}`}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={option.is_correct}
              onChange={() => handleCorrectChange(index)}
            />
            <span className="text-sm text-gray-600">To&apos;g&apos;ri</span>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => handleRemoveOption(index)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}

      {options.length < 6 && (
        <Button type="button" variant="outline" onClick={handleAddOption}>
          Variantni qo&apos;sh
        </Button>
      )}
    </div>
  );
}
