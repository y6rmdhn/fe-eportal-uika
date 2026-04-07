import {useEffect, useRef, useState} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthLayout from "@/components/layouts/AuthLayout";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field.tsx";
import { Controller } from "react-hook-form";
import FormSelect from "@/components/commons/FormSelect";
import { useRegister } from "@/hooks/Auth/useRegister.ts";
import {useSearchParams} from "react-router-dom";
import toast from "react-hot-toast";

const BG_IMAGE = "https://gpm.ppsuika.ac.id/wp-content/uploads/2023/06/uika-bogor.jpg";
const SIDE_IMAGE = "https://uika-bogor.ac.id/uploads/files/surat-keterangan-semester-gasal-2023-2024.jpg";
const LOGO = "/assets/img/favicon.png";

export default function Register() {
    const { control, handleRegister, isPendingRegister, handleSubmit, errors, setValue } = useRegister();
    const [searchParams] = useSearchParams();

    const hasToasted = useRef(false);

    useEffect(() => {
        const socialData = searchParams.get("social_data");

        if (socialData && !hasToasted.current) {
            try {
                const decoded = JSON.parse(atob(socialData));

                setValue("name", decoded.name);
                setValue("email", decoded.email);

                toast.success("Berhasil mengambil data Google! Silakan lengkapi data lainnya.");

                hasToasted.current = true;
            } catch (error) {
                console.error("Failed to decode social data", error);
            }
        }
    }, [searchParams, setValue]);


    return (
        <AuthLayout title="E-Portal UIKA — Sign Up">
            <section
                className="relative flex items-center justify-center min-h-screen w-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${BG_IMAGE})` }}
            >
                <div className="absolute inset-0 bg-black/60" />

                <div className="relative z-10 container mx-auto px-4 py-10 sm:p-0">
                    <div className="backdrop-blur-2xl bg-black/40 rounded-2xl overflow-hidden max-w-5xl mx-auto shadow-2xl border border-white/10">
                        <div className="grid lg:grid-cols-2">

                            {/* ── LEFT PANEL (FORM) ── */}
                            <div className="flex flex-col h-full p-10">
                                <div className="pb-2 flex justify-center">
                                    <a href="/">
                                        <img src={LOGO} alt="Logo UIKA" className="h-16 object-contain" />
                                    </a>
                                </div>

                                <div className="my-auto w-full max-w-md mx-auto">
                                    <div className="text-center mb-6">
                                        <h4 className="text-2xl font-bold text-white mb-1">
                                            Create an Account
                                        </h4>
                                        <p className="text-gray-300 text-sm">
                                            Register to get Single Sign-On access.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit(handleRegister)} className="space-y-4 text-left">
                                        <FieldGroup>
                                            {/* NAMA FIELD */}
                                            <Controller
                                                name="name"
                                                control={control}
                                                render={({ field, fieldState }) => (
                                                    <Field data-invalid={fieldState.invalid}>
                                                        <FieldLabel htmlFor="name">Full Name</FieldLabel>
                                                        <Input
                                                            {...field}
                                                            id="name"
                                                            type="text"
                                                            aria-invalid={fieldState.invalid}
                                                            placeholder="Enter your full name"
                                                            autoComplete="off"
                                                        />
                                                        {fieldState.invalid && (
                                                            <FieldError errors={[fieldState.error]} />
                                                        )}
                                                    </Field>
                                                )}
                                            />

                                            {/* EMAIL FIELD */}
                                            <Controller
                                                name="email"
                                                control={control}
                                                render={({ field, fieldState }) => (
                                                    <Field data-invalid={fieldState.invalid}>
                                                        <FieldLabel htmlFor="email">Email</FieldLabel>
                                                        <Input
                                                            {...field}
                                                            id="email"
                                                            type="email"
                                                            aria-invalid={fieldState.invalid}
                                                            placeholder="example@uika-bogor.ac.id"
                                                            autoComplete="off"
                                                        />
                                                        {fieldState.invalid && (
                                                            <FieldError errors={[fieldState.error]} />
                                                        )}
                                                    </Field>
                                                )}
                                            />

                                            {/* ROLE SELECT */}
                                            <div data-invalid={!!errors.role_id}>
                                                <FormSelect
                                                    control={control}
                                                    name="role_id"
                                                    label="User Role"
                                                    placeholder="Please select a role"
                                                    selectItem={[
                                                        { label: "Student", value: "1" },
                                                        { label: "Lecturer", value: "2" },
                                                    ]}
                                                />

                                            </div>

                                            {/* PASSWORD FIELD */}
                                            <Controller
                                                name="password"
                                                control={control}
                                                render={({ field, fieldState }) => (
                                                    <Field data-invalid={fieldState.invalid}>
                                                        <FieldLabel htmlFor="password">Password</FieldLabel>
                                                        <Input
                                                            {...field}
                                                            id="password"
                                                            type="password"
                                                            aria-invalid={fieldState.invalid}
                                                            placeholder="Minimum 8 characters"
                                                        />
                                                        {fieldState.invalid && (
                                                            <FieldError errors={[fieldState.error]} />
                                                        )}
                                                    </Field>
                                                )}
                                            />

                                            {/* KONFIRMASI PASSWORD FIELD */}
                                            <Controller
                                                name="password_confirmation"
                                                control={control}
                                                render={({ field, fieldState }) => (
                                                    <Field data-invalid={fieldState.invalid}>
                                                        <FieldLabel htmlFor="password_confirmation">Confirm Password</FieldLabel>
                                                        <Input
                                                            {...field}
                                                            id="password_confirmation"
                                                            type="password"
                                                            aria-invalid={fieldState.invalid}
                                                            placeholder="Repeat your password"
                                                        />
                                                        {fieldState.invalid && (
                                                            <FieldError errors={[fieldState.error]} />
                                                        )}
                                                    </Field>
                                                )}
                                            />
                                        </FieldGroup>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            disabled={isPendingRegister}
                                            className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm transition-all duration-300 font-semibold"
                                        >
                                            {isPendingRegister ? "Signing up..." : "Sign Up"}
                                        </Button>
                                    </form>
                                </div>

                                {/* Footer */}
                                <div className="w-full text-center mt-6">
                                    <p className="text-gray-300 text-sm">
                                        Already have an account?{" "}
                                        <a
                                            href="/login"
                                            className="text-blue-400 font-semibold hover:text-blue-300 transition-colors ml-1"
                                        >
                                            Log In here
                                        </a>
                                    </p>
                                </div>
                            </div>

                            {/* ── RIGHT PANEL ── */}
                            <div className="hidden lg:block relative overflow-hidden">
                                <img
                                    src={SIDE_IMAGE}
                                    alt="UIKA"
                                    className="w-full h-full object-cover transform -scale-x-100"
                                />
                                <div className="absolute inset-0 bg-black/70 flex items-end justify-center pb-10 px-6">
                                    <Announcements />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AuthLayout>
    );
}

// ── Announcement carousel ──
const announcements = [
    {
        title: "Identity Center (SSO)",
        body: "One E-Portal account to access various services and information systems at Universitas Ibn Khaldun Bogor.",
    },
    {
        title: "Account Security",
        body: "Ensure you use an active email address and a strong password to keep your academic data secure.",
    },
];

function Announcements() {
    const [current, setCurrent] = useState(0);

    return (
        <div className="text-center max-w-xs">
            <h5 className="text-lg font-bold text-white mb-2">
                {announcements[current].title}
            </h5>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {announcements[current].body}
            </p>
            <div className="flex justify-center gap-2">
                {announcements.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            i === current ? "bg-white w-4" : "bg-white/40"
                        }`}
                        aria-label={`Slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}