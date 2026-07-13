import admin from "@/services/api/admin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

export const useGetUnits = (params?: {
  per_page?: number;
  page?: number;
  search?: string;
}) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["units", params],
    queryFn: async () => {
      const res = await admin.getUnits(params);
      return res.data;
    },
  });
  return { data, isLoading, refetch };
};

export const useCreateUnit = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: { code: string; nama_unit: string }) =>
      admin.createUnit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast.success("Unit berhasil dibuat");
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

export const useUpdateUnit = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: { code: string; nama_unit: string };
    }) => admin.updateUnit(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast.success("Unit berhasil diperbarui");
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

export const useDeleteUnit = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (id: number) => admin.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast.success("Unit berhasil dihapus");
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
