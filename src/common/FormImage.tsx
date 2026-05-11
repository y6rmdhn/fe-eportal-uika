import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getImageData } from "@/lib/utils";
import type { Preview } from "@/types/general.type";
import { FileImageIcon } from "lucide-react";
import {
  Controller,
  type FieldValues,
  type Path,
  type UseFormReturn,
} from "react-hook-form";

export default function FormImage<T extends FieldValues>({
  form,
  name,
  label,
  preview,
  setPreview,
}: {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  preview?: Preview;
  setPreview?: (preview: Preview) => void;
}) {
  console.log("FormImage preview:", preview);

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

          <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9 rounded-lg">
              <AvatarImage
                src={preview?.displayUrl}
                alt="preview"
                className="object-cover"
              />
              <AvatarFallback className="rounded-lg">
                <FileImageIcon className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <Input
              type="file"
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              disabled={field.disabled}
              onChange={async (event) => {
                // field.onChange(event);
                const { file, displayUrl } = getImageData(event);

                if (file) {
                  field.onChange(file);
                  setPreview?.({
                    file,
                    displayUrl,
                  });
                }
              }}
            />
          </div>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
