import z from "zod";

export const createUserSchema = z.object({
  email:    z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role:     z.enum(["Mahasiswa", "Dosen", "Admin"]),
  nidn:     z.string().optional(),
  npm:      z.string().optional(),
});

export const updateUserSchema = z.object({
  email:    z.string().email().optional(),
  password: z.string().min(8).optional().or(z.literal("")),
  role:     z.enum(["Mahasiswa", "Dosen", "Admin"]).optional(),
  nidn:     z.string().optional(),
  npm:      z.string().optional(),
});

export type updateUserForm = z.infer<typeof updateUserSchema>;
export type createUserForm = z.infer<typeof createUserSchema>;
