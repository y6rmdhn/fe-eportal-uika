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
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value ?? "");
      }
    });

    const response = await admin.updateUser(id, formData);

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
          const message = error.response?.data?.message;
          toast.error(message || "Terjadi kesalahan server");
        } else {
          toast.error(error.message);
        }
      },
    });

  const handleUpdateUser = (id: string, payload: updateUserForm) => {
    mutateUpdateUser({ id, payload });
  };

  return {
    form,
    isPendingUpdateUser,
    handleUpdateUser,
  };
};

export default useUpdateUser;
