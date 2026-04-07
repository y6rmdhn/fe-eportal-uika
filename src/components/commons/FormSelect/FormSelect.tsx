import React from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface FormSelectProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    selectItem: { value: string; label: string; disabled?: boolean }[];
    placeholder?: string;
}

export default function FormSelect<T extends FieldValues>({
                                                              control,
                                                              name,
                                                              label,
                                                              selectItem,
                                                              placeholder,
                                                          }: FormSelectProps<T>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={name}>{label}</FieldLabel>

                    <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                    >
                        <SelectTrigger
                            id={name}
                            aria-invalid={fieldState.invalid}
                            className={cn("w-full", {
                                "border-red-500 focus:ring-red-500": fieldState.invalid,
                            })}
                        >
                            <SelectValue placeholder={placeholder || `Pilih ${label}`} />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>{label}</SelectLabel>
                                {selectItem.map((item) => (
                                    <SelectItem
                                        key={item.value}
                                        value={item.value}
                                        disabled={item.disabled}
                                        className="capitalize"
                                    >
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}