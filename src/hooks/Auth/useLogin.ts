import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type loginForm, loginSchema } from "@/validations/authValidation.ts";
import auth from "@/services/api/auth.ts";
import { AxiosError } from "axios";
import toast from 'react-hot-toast';
import Cookies from "js-cookie";
import session from "@/utils/session";

export const useLogin = () => {
    const navigate = useNavigate();

    const { control, handleSubmit, formState: { errors }, reset } = useForm<loginForm>({
        resolver: zodResolver(loginSchema)
    });

    const loginService = async (payload: loginForm) => {
        const result = await auth.login(payload);
        return result.data;
    };

    const { mutate: mutateLogin, isPending: isPendingLogin } = useMutation({
        mutationFn: loginService,
        onError(error) {
            if (error instanceof AxiosError) {
                const message = error.response?.data?.message || "Login gagal";
                toast.error(message);
            } else {
                toast.error(error.message);
            }
        },
        onSuccess: async (data, variables) => {
            if (data.status === 200) {
                // Cookies.set('token', data.data.token_portal, { expires: 1 });


                session.setSession(data.data.user);

                Cookies.set('tias', JSON.stringify(data.data.user), { expires: 1 });

                const usrTias = {
                    email: variables.email,
                    password: variables.password
                };
                Cookies.set('user_tias', JSON.stringify(usrTias), { expires: 1 });

                toast.success("Login berhasil!");
                reset();

                navigate("/");
            } else {
                toast.error(data.message || "Mohon cek kembali email atau password anda!");
            }
        }
    });

    const handleLogin = (values: loginForm) => {
        mutateLogin(values);
    };

    return {
        control,
        handleSubmit,
        errors,
        handleLogin,
        isPendingLogin
    };
};