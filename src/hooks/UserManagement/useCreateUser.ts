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
      name: "",
      email: "",
      password: "",
      role: "mahasiswa",
      phone: "",
      location: "",
      about_me: "",
      nidn: "",
      nip: "",
      npm: "",
      is_active: "true",
      image: undefined,
    },
    resolver: zodResolver(createUserSchema),
  });

  const createUser = async (payload: createUserForm) => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value ?? "");
      }
    });

    const response = await admin.createUser(formData);

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
          const message = error.response?.data?.message;
          toast.error(message || "Terjadi kesalahan server");
        } else {
          toast.error(error.message);
        }
      },
    });

  const handleCreateUser = (payload: createUserForm) => {
    mutateCreateUser(payload);
  };

  return {
    form,
    isPendingCreateUser,
    handleCreateUser,
  };
};

export default useCreateUser;
