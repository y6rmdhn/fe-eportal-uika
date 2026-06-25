import admin from "@/services/api/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const ROLES = ["admin", "mahasiswa", "dosen"] as const;

export const appModuleSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  url: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  is_active: z.boolean(),
  order: z.coerce.number(),
  roles: z.array(z.enum(ROLES)).min(1, "Pilih minimal 1 role"),
  icon: z
    .any()
    .optional()
    .refine((f) => !f || f instanceof File, { message: "Format tidak valid!" })
    .refine((f) => !f || f.size <= 2 * 1024 * 1024, {
      message: "Maksimal 2MB!",
    }),
});

export type AppModuleForm = z.infer<typeof appModuleSchema>;

const useCreateAppModule = () => {
  const queryClient = useQueryClient();

  const form = useForm<AppModuleForm>({
    resolver: zodResolver(appModuleSchema) as any,
    defaultValues: {
      name: "",
      url: "",
      description: "",
      is_active: true,
      order: 0,
      roles: [],
      icon: undefined,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: AppModuleForm) => {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("url", payload.url ?? "");
      formData.append("description", payload.description ?? "");
      formData.append("is_active", payload.is_active ? "1" : "0");
      formData.append("order", String(payload.order));
      payload.roles.forEach((r) => formData.append("roles[]", r));
      if (payload.icon instanceof File) formData.append("icon", payload.icon);

      // @ts-ignore
      const response = await admin.createAppModule(formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-module"] });
      toast.success("Modul berhasil ditambahkan");
      form.reset();
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message || "Terjadi kesalahan server",
        );
      } else {
        toast.error(error.message);
      }
    },
  });

  return {
    form,
    isPending,
    handleCreate: (payload: AppModuleForm) => mutate(payload),
  };
};

export default useCreateAppModule;
