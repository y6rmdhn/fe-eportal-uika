import admin from "@/services/api/admin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

export const useGetSsoClients = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["sso-clients"],
    queryFn: async () => {
      const res = await admin.getSsoClients();
      return res.data;
    },
  });
  return { data, isLoading, refetch };
};

export const useCreateSsoClient = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: { name: string; callback_url: string; description?: string; allowed_module_ids?: number[]; is_active?: boolean }) =>
      admin.createSsoClient(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["sso-clients"] });
      toast.success("SSO Client berhasil dibuat");
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

export const useUpdateSsoClient = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { name?: string; callback_url?: string; description?: string; allowed_module_ids?: number[]; is_active?: boolean } }) =>
      admin.updateSsoClient(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sso-clients"] });
      toast.success("SSO Client berhasil diperbarui");
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

export const useDeleteSsoClient = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (id: number) => admin.deleteSsoClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sso-clients"] });
      toast.success("SSO Client berhasil dihapus");
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

export const useResetSsoClientSecret = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (id: number) => admin.resetSsoClientSecret(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sso-clients"] });
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
