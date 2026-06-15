import admin from "@/services/api/admin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

export const useGetRolePermissions = (roleId: number | null) => {
  const { data, isLoading } = useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: async () => {
      const res = await admin.getRolePermissions(roleId!);
      return res.data;
    },
    enabled: roleId !== null,
  });
  return { data, isLoading };
};

export const useSyncRolePermissions = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: { role_id: number; permission_ids: number[] }) =>
      admin.syncRolePermissions(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["role-permissions", variables.role_id],
      });
      toast.success("Permissions role berhasil diperbarui");
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Terjadi kesalahan server");
      } else {
        toast.error(error.message);
      }
    },
  });

  return { mutateSync: mutate, isPendingSync: isPending };
};

export const useAssignRolePermissions = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: { role_id: number; permission_ids: number[] }) =>
      admin.assignRolePermissions(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["role-permissions", variables.role_id],
      });
      toast.success("Permissions berhasil ditambahkan ke role");
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Terjadi kesalahan server");
      } else {
        toast.error(error.message);
      }
    },
  });

  return { mutateAssign: mutate, isPendingAssign: isPending };
};

export const useUnassignRolePermissions = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: { role_id: number; permission_ids: number[] }) =>
      admin.unassignRolePermissions(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["role-permissions", variables.role_id],
      });
      toast.success("Permissions berhasil dicabut dari role");
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Terjadi kesalahan server");
      } else {
        toast.error(error.message);
      }
    },
  });

  return { mutateUnassign: mutate, isPendingUnassign: isPending };
};

