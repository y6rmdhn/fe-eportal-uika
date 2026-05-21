import admin from "@/services/api/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { appModuleSchema, type AppModuleForm } from "./useCreateAppModule";

const useUpdateAppModule = () => {
  const queryClient = useQueryClient();

  const form = useForm<AppModuleForm>({
    resolver: zodResolver(appModuleSchema) as any,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: AppModuleForm;
    }) => {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("url", payload.url ?? "");
      formData.append("description", payload.description ?? "");
      formData.append("is_active", payload.is_active ? "1" : "0");
      formData.append("order", String(payload.order));
      payload.roles.forEach((r) => formData.append("roles[]", r));
      if (payload.icon instanceof File) formData.append("icon", payload.icon);

      const response = await admin.updateAppModule(id, formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-module"] });
      toast.success("Modul berhasil diupdate");
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

  const handleUpdate = (id: number, payload: AppModuleForm) =>
    mutate({ id, payload });

  return { form, isPending, handleUpdate };
};

export default useUpdateAppModule;
