// src/hooks/SsoKeys/useSsoTemplates.ts
import admin from "@/services/api/admin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useSsoTemplates = () => {
  const queryClient = useQueryClient();

  const { data: templatesData, isLoading } = useQuery({
    queryKey: ["sso-templates"],
    queryFn: async () => {
      const res = await admin.getSsoTemplates();
      return res.data.data;
    },
  });

  const { mutate: createTemplate, isPending: isCreating } = useMutation({
    mutationFn: (payload: any) => admin.createSsoTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sso-templates"] });
      toast.success("Template berhasil ditambahkan!");
    },
    onError: () => toast.error("Gagal menambahkan template."),
  });

  const { mutate: updateTemplate, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      admin.updateSsoTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sso-templates"] });
      toast.success("Template berhasil diupdate!");
    },
    onError: () => toast.error("Gagal mengupdate template."),
  });

  const { mutate: deleteTemplate, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => admin.deleteSsoTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sso-templates"] });
      toast.success("Template berhasil dihapus!");
    },
    onError: () => toast.error("Gagal menghapus template."),
  });

  return {
    templates: templatesData || [],
    isLoading,
    createTemplate,
    isCreating,
    updateTemplate,
    isUpdating,
    deleteTemplate,
    isDeleting,
  };
};

export default useSsoTemplates;
