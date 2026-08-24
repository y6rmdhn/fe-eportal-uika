import admin from "@/services/api/admin";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/apiError";

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
        toast.error(getApiErrorMessage(error));
      } else {
        toast.error("Terjadi kesalahan");
      }
    },
  });

  const handleToggleActive = (id: string) => mutate(id);

  return { handleToggleActive, isPending };
};

export default useToggleActive;