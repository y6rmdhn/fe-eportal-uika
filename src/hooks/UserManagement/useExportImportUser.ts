import admin from "@/services/api/admin";
import auth from "@/services/api/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRef } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

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
      const imported = data.data?.imported ?? 0;
      const failed = data.data?.failed ?? [];

      if (failed.length > 0) {
        // Tampilkan sukses dulu
        if (imported > 0) {
          toast.success(`${imported} data berhasil diimport.`);
        }
        // Tampilkan detail yang gagal
        failed.forEach((f: { email: string; reason: string }) => {
          toast.error(`${f.email}: ${f.reason}`, { duration: 6000 });
        });
      } else {
        toast.success(`${imported} data berhasil diimport.`);
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

  const downloadTemplate = async () => {
    // ── Sheet 1: Data User ──
    const dataSheet = XLSX.utils.aoa_to_sheet([
      ["Email", "Password", "Role", "Nama", "NPM", "NIDN", "Jabatan", "Unit"],
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
    ]);
    dataSheet["!cols"] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
    ];

    // ── Sheet 2: Referensi Jabatan ──
    const jabatanRes = await auth.getPublicJabatans();
    const jabatanList = jabatanRes.data?.data ?? [];
    const jabatanRows = jabatanList.map((j: any) => {
      return [j.nama_jabatan];
    });
    const jabatanSheet = XLSX.utils.aoa_to_sheet([
      ["Nama Jabatan (salin ke kolom Jabatan)"],
      ...jabatanRows,
    ]);
    jabatanSheet["!cols"] = [{ wch: 40 }];

    // ── Sheet 3: Referensi Unit ──
    const unitRes = await auth.getPublicUnits();
    const unitList = unitRes.data?.data ?? [];
    const unitRows = unitList.map((u: any) => [u.code, u.nama_unit]);
    const unitSheet = XLSX.utils.aoa_to_sheet([
      ["Kode Unit (isi di kolom Unit)", "Nama Unit"],
      ...unitRows,
    ]);
    unitSheet["!cols"] = [{ wch: 20 }, { wch: 40 }];

    // ── Buat workbook & download ──
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, dataSheet, "Data User");
    XLSX.utils.book_append_sheet(wb, jabatanSheet, "Referensi Jabatan");
    XLSX.utils.book_append_sheet(wb, unitSheet, "Referensi Unit");
    XLSX.writeFile(wb, "template-import-user.xlsx");
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
