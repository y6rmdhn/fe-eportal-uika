import z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const roleSchema = z.enum(["admin", "mahasiswa", "dosen"], {
  error: () => ({
    message: "Pilihan role tidak valid! Pilih admin, mahasiswa, atau dosen.",
  }),
});

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password is too long"),
  role: roleSchema,
  phone: z.string().min(10, { message: "Nomor HP minimal 10 digit!" }).max(15),
  location: z.string().min(1, { message: "Lokasi wajib diisi!" }),
  about_me: z.string().optional(),
  nidn: z.string().optional(),
  nip: z.string().optional(),
  npm: z.string().optional(),
  is_active: z.enum(["true", "false"], {
    message: "Status aktif tidak valid!",
  }),
  image: z
    .any()
    .refine((file) => file instanceof File, {
      message: "Gambar wajib diupload!",
    })
    .refine((file) => file?.size <= MAX_FILE_SIZE, {
      message: "Ukuran gambar maksimal 5MB!",
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file?.type), {
      message: "Format gambar harus .jpg, .jpeg, .png, atau .webp!",
    }),
});

export const updateUserSchema = createUserSchema.partial().extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password is too long")
    .optional()
    .or(z.literal("")),
  is_active: z.enum(["true", "false"]).optional(),
  // field yang bisa null dari API
  phone: z.coerce.string().optional(),
  location: z.string().optional().nullable(),
  about_me: z.string().optional().nullable(),
  nidn: z.string().optional().nullable(),
  nip: z.string().optional().nullable(),
  npm: z.string().optional().nullable(),
  image: z
    .any()
    .optional()
    .refine((file) => !file || file instanceof File, {
      message: "Format gambar tidak valid!",
    })
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
      message: "Ukuran gambar maksimal 5MB!",
    })
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type), {
      message: "Format gambar harus .jpg, .jpeg, .png, atau .webp!",
    }),
});

export type updateUserForm = z.infer<typeof updateUserSchema>;
export type createUserForm = z.infer<typeof createUserSchema>;
