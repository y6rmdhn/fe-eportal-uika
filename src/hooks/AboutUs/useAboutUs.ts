import admin from "@/services/api/admin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/apiError";

export interface AboutUsSettings {
  id: number;
  title: string;
  description: string | null;
  banner_photo: string | null;
}

export interface AboutUsContributor {
  id: number;
  app_module_id: number | null;
  name: string;
  type: "dosen" | "mahasiswa";
  angkatan: string | null;
  contribution: string | null;
  photo: string | null;
  order: number;
  is_active: boolean;
  app_module?: { id: number; name: string } | null;
}

export type AboutUsContributorForm = {
  name: string;
  type: "dosen" | "mahasiswa";
  angkatan: string;
  contribution: string;
  app_module_id: string;
  order: number;
  is_active: boolean;
  photo?: File | null;
};

const toFormData = (payload: Record<string, unknown>) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (value === undefined || value === null) {
      // Dilewati (bukan dikirim "null") — penting untuk field file seperti
      // photo/banner_photo, karena string "null" akan gagal validasi `image`.
      return;
    } else {
      // String kosong sengaja tetap dikirim: Laravel mengonversinya jadi
      // null (ConvertEmptyStringsToNull), sehingga field nullable seperti
      // app_module_id bisa dikosongkan lagi lewat update.
      formData.append(key, String(value));
    }
  });
  return formData;
};

/** Konten utama About Us (judul, deskripsi, banner) */
export const useAboutUsSettings = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["about-us-settings"],
    queryFn: async () => {
      const res = await admin.getAboutUsSettings();
      return res.data.data as AboutUsSettings;
    },
  });

  return { settings: data, isLoading };
};

export const useUpdateAboutUsSettings = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: {
      title: string;
      description: string;
      banner_photo?: File | null;
    }) => admin.updateAboutUsSettings(toFormData(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about-us-settings"] });
      toast.success("Konten About Us berhasil diperbarui");
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(getApiErrorMessage(error));
      } else {
        toast.error(error.message);
      }
    },
  });

  return { updateSettings: mutate, isUpdatingSettings: isPending };
};

/** Daftar seluruh kontributor untuk tabel admin (filter/search dilakukan di client) */
export const useAboutUsContributors = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["about-us-contributors"],
    queryFn: async () => {
      const res = await admin.getAboutUsContributors({ all: 1 });
      return res.data.data as AboutUsContributor[];
    },
  });

  return { contributors: data ?? [], isLoading };
};

export const useCreateAboutUsContributor = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: AboutUsContributorForm) =>
      admin.createAboutUsContributor(toFormData(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about-us-contributors"] });
      toast.success("Kontributor berhasil ditambahkan");
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(getApiErrorMessage(error));
      } else {
        toast.error(error.message);
      }
    },
  });

  return { createContributor: mutate, isCreatingContributor: isPending };
};

export const useUpdateAboutUsContributor = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: AboutUsContributorForm;
    }) => admin.updateAboutUsContributor(id, toFormData(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about-us-contributors"] });
      toast.success("Kontributor berhasil diperbarui");
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(getApiErrorMessage(error));
      } else {
        toast.error(error.message);
      }
    },
  });

  return { updateContributor: mutate, isUpdatingContributor: isPending };
};

export const useDeleteAboutUsContributor = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (id: number) => admin.deleteAboutUsContributor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about-us-contributors"] });
      toast.success("Kontributor berhasil dihapus");
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(getApiErrorMessage(error));
      } else {
        toast.error(error.message);
      }
    },
  });

  return { deleteContributor: mutate, isDeletingContributor: isPending };
};
