import admin from "@/services/api/admin";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

const useToggleActive = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (id: string) => {
      const response = await admin.toggleActive(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-management"] });
      toast.success("Status akun berhasil diubah");
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Terjadi kesalahan server");
      } else {
        toast.error("Terjadi kesalahan");
      }
    },
  });

  const handleToggleActive = (id: string) => mutate(id);

  return { handleToggleActive, isPending };
};

export default useToggleActive;