import admin from "@/services/api/admin";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

const useDeleteUser = () => {
  const queryClient = useQueryClient();

  const updateUser = async (id: string) => {
    const response = await admin.deleteUser(id);

    return response.data;
  };

  const { mutate: mutateDeleteUser, isPending: isPendingDeleteUser } =
    useMutation({
      mutationFn: updateUser,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["user-management"] });

        toast.success("Berhasil delete user");
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

  const handleDeleteUser = (id: string) => {
    mutateDeleteUser(id);
  };

  return {
    isPendingDeleteUser,
    handleDeleteUser,
  };
};

export default useDeleteUser;
