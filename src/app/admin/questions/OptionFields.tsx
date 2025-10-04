"use client";

import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  control: any;
  watch: any;
  setValue: any;
}

export default function OptionFields({ control, watch, setValue }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const options = watch("options");

  const handleCorrectChange = (index: number) => {
    const updated = options.map((o: any, i: number) => ({
      ...o,
      is_correct: i === index,
    }));
    setValue("options", updated);
  };

  return (
    <div className="space-y-2">
      {fields.map((field, idx) => (
        <div key={field.id} className="flex items-center gap-2">
          <Input
            {...control.register?.(`options.${idx}.variant`, { required: true })}
            placeholder={`Variant ${String.fromCharCode(65 + idx)}`}
          />
          <input
            type="radio"
            name="correctOption"
            checked={options[idx]?.is_correct}
            onChange={() => handleCorrectChange(idx)}
          />
          <span className="text-sm text-gray-600">To‘g‘ri</span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => remove(idx)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({ id: `temp-${Date.now()}`, variant: "", is_correct: false })
        }
      >
        <Plus className="w-4 h-4" /> Variant qo‘shish
      </Button>
    </div>
  );
}
