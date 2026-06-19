import admin from "@/services/api/admin";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

const useDeleteAppModule = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (id: number) => {
      const response = await admin.deleteAppModule(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-module"] });
      toast.success("Modul berhasil dihapus");
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
    handleDelete: (id: number) => mutate(id),
    isPendingDelete: isPending,
  };
};

export default useDeleteAppModule;
