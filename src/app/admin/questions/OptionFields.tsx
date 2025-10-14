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
    <div className="space-y-3">
      <label className="text-sm font-medium block">Variantlar</label>
      
      {fields.map((field, idx) => (
        <div key={field.id} className="flex items-center gap-2">
          <span className="text-sm font-semibold w-6">
            {String.fromCharCode(65 + idx)}:
          </span>
          
          <Input
            {...control.register(`options.${idx}.variant`, { required: true })}
            placeholder={`Variant ${String.fromCharCode(65 + idx)}`}
            className="flex-1"
          />
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="correctOption"
              checked={options[idx]?.is_correct || false}
              onChange={() => handleCorrectChange(idx)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-600">To'g'ri</span>
          </label>
          
          {fields.length > 1 && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => remove(idx)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}

      {fields.length < 6 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ 
              id: `temp-${Date.now()}`, 
              variant: "", 
              is_correct: false 
            })
          }
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" /> Variant qo'shish
        </Button>
      )}
    </div>
  );
}