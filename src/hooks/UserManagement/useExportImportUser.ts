import admin from "@/services/api/admin";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRef } from "react";
import toast from "react-hot-toast";

const useExportImportUser = (
  currentSearch?: string,
  currentFilter?: string,
) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: exportUsers, isPending: isPendingExport } = useMutation({
    mutationFn: async () => {
      const response = await admin.exportUsers({
        search: currentSearch,
        role: currentFilter,
      });
      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `users-${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => toast.success("Export berhasil"),
    onError: (error) => {
      if (error instanceof AxiosError) {
        console.log("Export error:", error.response);
        toast.error(error.response?.data?.message || "Gagal export");
      }
    },
  });

  const { mutate: importUsers, isPending: isPendingImport } = useMutation({
    mutationFn: async (file: File) => {
      const response = await admin.importUsers(file);
      return response.data;
    },
    onSuccess: (data) => {
      const failed = data.data?.failed?.length ?? 0;
      if (failed > 0) {
        toast.success(`Import selesai. ${failed} data gagal diimport.`);
      } else {
        toast.success(data.message);
      }
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Gagal import");
      }
    },
  });

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importUsers(file);
      e.target.value = ""; // reset input
    }
  };

  return {
    exportUsers,
    isPendingExport,
    importUsers,
    isPendingImport,
    fileInputRef,
    handleImportClick,
    handleFileChange,
  };
};

export default useExportImportUser;
