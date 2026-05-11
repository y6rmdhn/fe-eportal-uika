import user from "@/services/api/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const updateProfileSchema = z.object({
  phone: z.coerce.string().max(20).optional().or(z.literal("")),
  location: z.string().max(255).optional().or(z.literal("")),
  about_me: z.string().optional().or(z.literal("")),
  image: z
    .any()
    .optional()
    .refine((file) => !file || file instanceof File, {
      message: "Format tidak valid!",
    })
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
      message: "Maksimal 5MB!",
    })
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type), {
      message: "Format harus .jpg, .jpeg, .png, atau .webp!",
    }),
});

export type updateProfileForm = z.infer<typeof updateProfileSchema>;

const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  const form = useForm<updateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: updateProfileForm) => {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value ?? "");
        }
      });
      const response = await user.updateProfile(formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile berhasil diupdate");
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

  const handleUpdateProfile = (payload: updateProfileForm) => mutate(payload);

  return { form, isPending, handleUpdateProfile };
};

export default useUpdateProfile;
