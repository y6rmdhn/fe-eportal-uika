import z from "zod";

export const createUserSchema = z.object({
  email:    z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role:     z.string().optional(),
  nidn:     z.string().optional(),
  npm:      z.string().optional(),
  unit_id:  z.preprocess((val) => val === "" || val === undefined || val === null ? null : Number(val), z.number().nullable().optional()),
  roles:    z.array(z.string()).min(1, "Minimal pilih 1 jabatan"),
});

export const updateUserSchema = z.object({
  email:    z.string().email("Email tidak valid").optional(),
  password: z.string().min(8, "Password minimal 8 karakter").optional().or(z.literal("")),
  role:     z.string().optional(),
  nidn:     z.string().optional(),
  npm:      z.string().optional(),
  unit_id:  z.preprocess((val) => val === "" || val === undefined || val === null ? null : Number(val), z.number().nullable().optional()),
  roles:    z.array(z.string()).optional(),
});

export type updateUserForm = z.infer<typeof updateUserSchema>;
export type createUserForm = z.infer<typeof createUserSchema>;
