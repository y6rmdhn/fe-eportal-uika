import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type loginForm, loginSchema } from "@/validations/authValidation.ts";
import auth from "@/services/api/auth.ts";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import session from "@/utils/session";

export const useLogin = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<loginForm>({
    resolver: zodResolver(loginSchema),
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
    onSuccess: (data) => {
      if (data.status === 200) {
        if (data.data.uika_sso_token) {
          session.setToken(data.data.uika_sso_token);
        }
        setUser(data.data.user);

        toast.success("Login berhasil!");
        navigate("/");
        reset();
      }
    },
  });

  const handleLogin = (values: loginForm) => {
    mutateLogin(values);
  };

  return {
    control,
    handleSubmit,
    errors,
    handleLogin,
    isPendingLogin,
  };
};
