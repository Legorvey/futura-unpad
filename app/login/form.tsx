"use client";

import Link from "next/link";
import GoogleLoginButton from "./google-login";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";;
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

import { useAuth } from "@/components/auth-provider";
import { useLoginMutation } from "@/hooks/mutations/use-auth-mutations";
import { toast } from "sonner";
import { loginSchema, type LoginFormValues } from "@/lib/validation";
import { FormTextField } from "@/components/form/form-text-field";

const safeRedirect = (value: string | null) => {
    return value &&
        value.startsWith("/") &&
        !value.startsWith("//") &&
        !value.startsWith("/\\") &&
        !value.startsWith("/login") &&
        value !== "/register" &&
        !value.startsWith("/register?") &&
        !value.startsWith("/auth/callback")
        ? value
        : null;
};

export default function LoginForm({ isVerified }: { isVerified?: boolean }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const login = useLoginMutation();
    const [submitError, setSubmitError] = useState("");

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: "",
            password: "",
            keepSignedIn: true,
        },
    });

    useEffect(() => {
        if (isVerified) {
            const channel = new window.BroadcastChannel('auth-sync');
            channel.postMessage('email_verified');
            channel.close();
        }
    }, [isVerified]);

    const keepSignedIn = form.watch("keepSignedIn");
    const setKeepSignedIn = (value: boolean) => form.setValue("keepSignedIn", value);
    const { handleSubmit } = form;

    const safeNext = safeRedirect(searchParams.get("next"));

    const onSubmit = async (values: LoginFormValues) => {
        setSubmitError("");

        let result;
        try {
            result = await login.mutateAsync({ ...values, keepSignedIn });
            toast.success("Berhasil masuk");
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "Gagal masuk.");
            toast.error("Gagal masuk", { 
                description: error instanceof Error ? error.message : "Silakan periksa kredensial Anda dan coba lagi." 
            });
            return;
        }

        const nextUrl = result.adminAccess
            ? (safeNext?.startsWith("/admin") ? safeNext : "/admin")
            : (safeNext || "/profile");
            
        router.replace(nextUrl);
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <FieldGroup className="gap-8">
                    <FormTextField<LoginFormValues>
                        name="identifier"
                        label="Email atau Username"
                        placeholder="contoh: johndoe@gmail.com atau johndoe"
                        autoComplete="username"
                    />

                    <Field className="gap-2">
                        <FormTextField<LoginFormValues>
                            name="password"
                            label={
                                <div className="flex justify-between w-full">
                                    <span>Kata Sandi</span>
                                    <Link href="/forgot-password" prefetch={false} className="text-right text-sm text-muted-foreground hover:text-white transition">Lupa kata sandi?</Link>
                                </div>
                            }
                            type="password"
                            placeholder="Masukkan kata sandi Anda"
                            autoComplete="current-password"
                            fieldClassName="gap-2 w-full"
                        />
                        
                        <Field orientation="horizontal" className="items-center gap-2">
                            <Checkbox
                                id="keepSignedIn"
                                checked={keepSignedIn}
                                disabled={login.isPending}
                                onCheckedChange={(checked) => setKeepSignedIn(checked === true)}
                            />
                            <FieldLabel
                                htmlFor="keepSignedIn"
                                className="cursor-pointer text-sm font-normal text-muted-foreground"
                            >
                                Biarkan saya tetap masuk
                            </FieldLabel>
                        </Field>
                    </Field>

                    {submitError && <FieldError>{submitError}</FieldError>}

                    <Field className="gap-2">
                        <Button
                            type="submit"
                            className="h-11 rounded-[8px]"
                            disabled={login.isPending}
                        >
                            {login.isPending ? "Sedang masuk..." : "Masuk"}
                        </Button>

                        <div className="relative my-0.5">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-sm lowercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Atau
                                </span>
                            </div>
                        </div>

                        <GoogleLoginButton keepSignedIn={keepSignedIn} />
                    </Field>
                    <p className="text-center text-sm text-muted-foreground">
                        Belum punya akun?{" "}
                        <Link
                            href={
                                safeNext
                                    ? `/register?next=${safeNext}`
                                    : "/register"
                            }
                            prefetch={false}
                            className="text-blue-600"
                        >
                            Daftar
                        </Link>
                    </p>
                </FieldGroup>
            </form>
        </FormProvider>
    );
}
