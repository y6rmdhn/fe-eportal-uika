import admin from "@/services/api/admin";
import {
  createUserSchema,
  type createUserForm,
} from "@/validations/userManagementValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const useCreateUser = () => {
  const queryClient = useQueryClient();

  const form = useForm<createUserForm>({
    defaultValues: {
      email: "",
      password: "",
      nidn: "",
      npm: "",
      unit_id: "" as any,
      roles: [],
    },
    resolver: zodResolver(createUserSchema),
  });

  const createUser = async (payload: createUserForm) => {
    const response = await admin.createUser(payload); // JSON biasa, bukan FormData
    return response.data;
  };

  const { mutate: mutateCreateUser, isPending: isPendingCreateUser } =
    useMutation({
      mutationFn: createUser,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["user-management"] });
        form.reset();
        toast.success("Berhasil membuat user baru");
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

  return { form, isPendingCreateUser, handleCreateUser: mutateCreateUser };
};

export default useCreateUser;
