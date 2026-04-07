import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

import network from "@/utils/network.ts";
import {
    forgotPasswordSchema,
    resetPasswordSchema,
    type forgotPasswordForm,
    type resetPasswordForm
} from "@/validations/authValidation.ts";

export const useResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Deteksi mode berdasarkan URL
    const token = searchParams.get("token");
    const emailParam = searchParams.get("email");
    const isResetMode = !!token && !!emailParam;

    // State untuk UI "Cek Email Anda" di Mode 1
    const [isEmailSent, setIsEmailSent] = useState(false);

    // form link send email
    const {
        control: controlRequest,
        handleSubmit: handleSubmitRequest
    } = useForm<forgotPasswordForm>({
        resolver: zodResolver(forgotPasswordSchema)
    });

    // form reset password
    const {
        control: controlReset,
        handleSubmit: handleSubmitReset,
        watch
    } = useForm<resetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema)
    });

    // send link service
    const sendLinkService = async (payload: forgotPasswordForm) => {
        const response = await network.post("/password/email", payload);
        return response.data;
    };

    const { mutate: mutateSendLink, isPending: isPendingSendLink } = useMutation({
        mutationFn: sendLinkService,
        onSuccess: (data) => {
            if (data.status === 200) {
                toast.success(data.message || "Link berhasil dikirim!");
                setIsEmailSent(true);
            }
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "Email tidak ditemukan atau gagal dikirim.");
            } else {
                toast.error("Terjadi kesalahan sistem.");
            }
        }
    });

    const onRequestSubmit = (values: forgotPasswordForm) => {
        mutateSendLink(values);
    };

    // send reset password service
    const resetPasswordService = async (payload: any) => {
        const response = await network.post("/password/reset", payload);
        return response.data;
    };

    const { mutate: mutateResetPassword, isPending: isPendingReset } = useMutation({
        mutationFn: resetPasswordService,
        onSuccess: (data) => {
            if (data.status === 200) {
                toast.success(data.message || "Password berhasil diubah!");
                navigate("/login");
            }
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "Gagal mereset password. Token mungkin kedaluwarsa.");
            } else {
                toast.error("Terjadi kesalahan sistem.");
            }
        }
    });

    const onResetSubmit = (values: resetPasswordForm) => {
        const payload = {
            token: token,
            email: emailParam,
            password: values.password,
            password_confirmation: values.password_confirmation,
        };
        mutateResetPassword(payload);
    };

    return {
        isResetMode,
        emailParam,
        isEmailSent,

        // Form & State Mode 1
        controlRequest,
        handleSubmitRequest,
        onRequestSubmit,
        isPendingSendLink,

        // Form & State Mode 2
        controlReset,
        handleSubmitReset,
        onResetSubmit,
        isPendingReset,
        watch
    };
};