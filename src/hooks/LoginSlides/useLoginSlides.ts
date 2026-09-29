import admin from "@/services/api/admin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/utils/apiError";

export interface LoginSlide {
  id: number;
  image: string;
  title: string;
  body: string | null;
  order: number;
  is_active: boolean;
}

export type LoginSlideForm = {
  title: string;
  body: string;
  order: number;
  is_active: boolean;
  image?: File | null;
};

const toFormData = (payload: Record<string, unknown>) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (value === undefined || value === null) {
      return;
    } else if (typeof value === "boolean") {
      formData.append(key, value ? "1" : "0");
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
};

export const useLoginSlides = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["login-slides"],
    queryFn: async () => {
      const res = await admin.getLoginSlides();
      return res.data.data as LoginSlide[];
    },
  });

  return { slides: data ?? [], isLoading };
};

export const useCreateLoginSlide = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: LoginSlideForm) =>
      admin.createLoginSlide(toFormData(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["login-slides"] });
      toast.success("Slide berhasil ditambahkan");
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(getApiErrorMessage(error));
      } else {
        toast.error(error.message);
      }
    },
  });

  return { createSlide: mutate, isCreatingSlide: isPending };
};

export const useUpdateLoginSlide = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LoginSlideForm }) =>
      admin.updateLoginSlide(id, toFormData(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["login-slides"] });
      toast.success("Slide berhasil diperbarui");
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(getApiErrorMessage(error));
      } else {
        toast.error(error.message);
      }
    },
  });

  return { updateSlide: mutate, isUpdatingSlide: isPending };
};

export const useDeleteLoginSlide = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (id: number) => admin.deleteLoginSlide(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["login-slides"] });
      toast.success("Slide berhasil dihapus");
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(getApiErrorMessage(error));
      } else {
        toast.error(error.message);
      }
    },
  });

  return { deleteSlide: mutate, isDeletingSlide: isPending };
};
