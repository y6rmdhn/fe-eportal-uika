import admin from "@/services/api/admin";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRef } from "react";
import toast from "react-hot-toast";

const useExportImportUser = (
  currentSearch?: string,
  currentFilter?: string,
) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { mutate: exportUsers, isPending: isPendingExport } = useMutation({
    mutationFn: async () => {
      const response = await admin.exportUsers({
        search: currentSearch,
        role: currentFilter,
      });
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
      queryClient.invalidateQueries({ queryKey: ["user-management"] });
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

  const downloadTemplate = () => {
    const headers = [
      "Email",
      "Password",
      "Role",
      "Nama",
      "NPM",
      "NIDN",
      "Jabatan",
      "Unit",
    ];

    const exampleData = [
      [
        "mahasiswa@example.com",
        "password123",
        "Mahasiswa",
        "Budi Santoso",
        "221106040001",
        "",
        "",
        "FT_TI",
      ],
      [
        "dosen@example.com",
        "password123",
        "Dosen",
        "Dr. Ahmad Fauzi",
        "",
        "0406116206",
        "",
        "FTS",
      ],
      [
        "pegawai@example.com",
        "password123",
        "Pegawai",
        "Siti Rahma",
        "",
        "",
        "Staf Akademik",
        "BAAK",
      ],
      [
        "pmm@example.com",
        "password123",
        "Mahasiswa",
        "John Doe PMM",
        "221106040002",
        "",
        "",
        "",
      ],
      [
        "dosenext@example.com",
        "password123",
        "Dosen_Ext",
        "Prof. Smith",
        "",
        "",
        "",
        "",
      ],
    ];

    const csvContent = [
      headers.join(","),
      ...exampleData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template-import-user.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return {
    exportUsers,
    isPendingExport,
    importUsers,
    isPendingImport,
    fileInputRef,
    handleImportClick,
    handleFileChange,
    downloadTemplate, // 👇 JANGAN LUPA DI-RETURN
  };
};

export default useExportImportUser;
