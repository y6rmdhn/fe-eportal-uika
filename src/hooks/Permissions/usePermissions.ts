import admin from "@/services/api/admin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

export const useGetPermissions = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const res = await admin.getPermissions();
      return res.data;
    },
  });
  return { data, isLoading, refetch };
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: { name: string; guard_name?: string; appModule_id: number }) =>
      admin.createPermission(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Permission berhasil dibuat");
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

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: { name: string; guard_name?: string; appModule_id: number };
    }) => admin.updatePermission(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Permission berhasil diperbarui");
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

export const useDeletePermission = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (id: number) => admin.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Permission berhasil dihapus");
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

export const useBulkCreatePermission = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: {
      appModule_id: number;
      permissions: { name: string; guard_name?: string }[];
    }) => admin.bulkCreatePermission(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      const created = res.data?.data?.created?.length ?? 0;
      const skipped = res.data?.data?.skipped?.length ?? 0;
      if (skipped > 0) {
        toast.success(`${created} permission dibuat, ${skipped} dilewati (sudah ada).`);
      } else {
        toast.success(`${created} permission berhasil dibuat.`);
      }
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Terjadi kesalahan server");
      } else {
        toast.error(error.message);
      }
    },
  });

  return { mutateBulkCreate: mutate, isPendingBulkCreate: isPending };
};

export const useBulkUpdatePermission = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: {
      permissions: { id: number; name: string; guard_name?: string; appModule_id?: number }[];
    }) => admin.bulkUpdatePermission(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      const updated = res.data?.data?.updated?.length ?? 0;
      const errors  = res.data?.data?.errors ?? [];
      if (errors.length > 0) {
        toast.success(`${updated} diperbarui, ${errors.length} gagal.`);
      } else {
        toast.success(`${updated} permission berhasil diperbarui.`);
      }
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Terjadi kesalahan server");
      } else {
        toast.error(error.message);
      }
    },
  });

  return { mutateBulkUpdate: mutate, isPendingBulkUpdate: isPending };
};

export const useBulkDeletePermission = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: { ids: number[] }) =>
      admin.bulkDeletePermission(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      const deleted  = res.data?.data?.deleted ?? 0;
      const notFound = res.data?.data?.not_found ?? [];
      if (notFound.length > 0) {
        toast.success(`${deleted} permission dihapus, ${notFound.length} tidak ditemukan.`);
      } else {
        toast.success(`${deleted} permission berhasil dihapus.`);
      }
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Terjadi kesalahan server");
      } else {
        toast.error(error.message);
      }
    },
  });

  return { mutateBulkDelete: mutate, isPendingBulkDelete: isPending };
};
