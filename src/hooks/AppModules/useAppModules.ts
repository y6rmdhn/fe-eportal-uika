import admin from "@/services/api/admin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

export const useGetAppModules = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["app-modules"],
    queryFn: async () => {
      const res = await admin.getAppModules();
      return res.data;
    },
  });
  return { data, isLoading, refetch };
};

export const useCreateAppModule = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: { name: string; url: string }) =>
      admin.createAppModule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-modules"] });
      toast.success("App Module berhasil dibuat");
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Terjadi kesalahan server");
      } else {
        toast.error(error.message);
      }
    },
  });

  return { mutateCreate: mutate, isPendingCreate: isPending };
};

export const useUpdateAppModule = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { name: string; url: string } }) =>
      admin.updateAppModule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-modules"] });
      toast.success("App Module berhasil diperbarui");
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Terjadi kesalahan server");
      } else {
        toast.error(error.message);
      }
    },
  });

  return { mutateUpdate: mutate, isPendingUpdate: isPending };
};

export const useDeleteAppModule = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (id: number) => admin.deleteAppModule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-modules"] });
      toast.success("App Module berhasil dihapus");
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Terjadi kesalahan server");
      } else {
        toast.error(error.message);
      }
    },
  });

  return { mutateDelete: mutate, isPendingDelete: isPending };
};

export const useResetAppModuleSecret = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (id: number) => admin.resetAppModuleSecret(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-modules"] });
      toast.success("SSO Client Secret berhasil di-reset");
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Terjadi kesalahan server");
      } else {
        toast.error(error.message);
      }
    },
  });

  return { mutateResetSecret: mutate, isPendingResetSecret: isPending };
};
