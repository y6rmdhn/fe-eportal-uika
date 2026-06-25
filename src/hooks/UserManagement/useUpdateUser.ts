import admin from "@/services/api/admin";
import {
  updateUserSchema,
  type updateUserForm,
} from "@/validations/userManagementValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const useUpdateUser = () => {
  const queryClient = useQueryClient();

  const form = useForm<updateUserForm>({
    resolver: zodResolver(updateUserSchema) as any,
  });

  const updateUser = async ({
    id,
    payload,
  }: {
    id: string;
    payload: updateUserForm;
  }) => {
    const response = await admin.updateUser(id, payload as any); // JSON biasa
    return response.data;
  };

  const { mutate: mutateUpdateUser, isPending: isPendingUpdateUser } =
    useMutation({
      mutationFn: updateUser,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["user-management"] });
        toast.success("Berhasil update user");
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
    isPendingUpdateUser,
    handleUpdateUser: (id: string, payload: updateUserForm) =>
      mutateUpdateUser({ id, payload }),
  };
};

export default useUpdateUser;
