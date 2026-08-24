import admin from "@/services/api/admin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/apiError";

export const useGetRoles = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await admin.getRoles();
      return res.data;
    },
  });
  return { data, isLoading, refetch };
};

export const useGetRolesPaged = (params: {
  page: number;
  per_page: number;
  search?: string;
}) => {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["roles-paged", params],
    queryFn: async () => {
      const res = await admin.getRolesPaged(params);
      return res.data;
    },
    placeholderData: (prev) => prev,
  });
  return { data, isLoading, isFetching, refetch };
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: { name: string; guard_name?: string }) =>
      admin.createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["roles-paged"] });
      toast.success("Role berhasil dibuat");
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(getApiErrorMessage(error));
      } else {
        toast.error(error.message);
      }
    },
  });

  return { mutateCreate: mutate, isPendingCreate: isPending };
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: { name: string; guard_name?: string };
    }) => admin.updateRole(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["roles-paged"] });
      toast.success("Role berhasil diperbarui");
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(getApiErrorMessage(error));
      } else {
        toast.error(error.message);
      }
    },
  });

  return { mutateUpdate: mutate, isPendingUpdate: isPending };
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (id: number) => admin.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["roles-paged"] });
      toast.success("Role berhasil dihapus");
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(getApiErrorMessage(error));
      } else {
        toast.error(error.message);
      }
    },
  });

  return { mutateDelete: mutate, isPendingDelete: isPending };
};
