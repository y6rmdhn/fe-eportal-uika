import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { type createUserForm, createUserSchema } from "@/validations/authValidation.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import auth from "@/services/api/auth.ts";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

export const useRegister = () => {
    const navigate = useNavigate();

    const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<createUserForm>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            email: "",
            role_id: "",
            password: "",
            password_confirmation: "",
        }
    });


    const registerService = async (payload: Omit<createUserForm, "password_confirmation">) => {
        const result = await auth.register(payload);
        return result.data;
    };

    const { mutate: mutateRegister, isPending: isPendingRegister } = useMutation({
        mutationFn: registerService,
        onError(error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data?.message || "Registrasi gagal";
                toast.error(message);
            } else {
                toast.error(error.message);
            }
        },
        onSuccess: async (data) => {
            if (data.status === 200 || data.status === 201) {
                toast.success("Registrasi berhasil! Silakan login.");
                reset();
                navigate("/login");
            } else {
                toast.error(data.message || "Terjadi kesalahan saat registrasi");
            }
        }
    });

    const handleRegister = (values: createUserForm) => {
        const { password_confirmation, ...payload } = values;
        mutateRegister(payload);
    };

    return {
        control,
        setValue,
        handleSubmit,
        errors,
        handleRegister,
        isPendingRegister
    };
};