"use client";

import Link from "next/link";
import GoogleLoginButton from "./google-login";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-provider";

export default function LoginForm() {
    const router = useRouter();
    const { refreshAuth } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => null);
            alert(data?.error ?? "Login failed.");
            setIsSubmitting(false);
            return;
        }

        const currentUrl = new URL(window.location.href);
        const next = currentUrl.searchParams.get("next");
        const safeNext =
            next &&
            next.startsWith("/") &&
            !next.startsWith("//") &&
            !next.startsWith("/login") &&
            !next.startsWith("/register") &&
            !next.startsWith("/auth/callback")
                ? next
                : "/admin";

        await refreshAuth();
        router.replace(safeNext);
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-6">
                <Field className="gap-1">
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        className="h-11 rounded-xl"
                        autoComplete="off"
                        placeholder="e.g. johndoe@gmail.com"
                        value={email}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setEmail(e.target.value)
                        }
                        required
                    />
                </Field>

                <Field className="gap-1">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                        id="password"
                        type="password"
                        className="h-11 rounded-xl"
                        autoComplete="off"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setPassword(e.target.value)
                        }
                        required
                    />
                    <Link href="/forgot-password" className="text-right text-sm text-muted-foreground hover:text-black transition">Forgot password?</Link>
                </Field>

                <Field className="gap-2 ">
                    <Button
                        type="submit"
                        className="h-11 rounded-xl cursor-pointer"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Signing in..." : "Log in"}
                    </Button>
                    <GoogleLoginButton />
                </Field>
                <p className="text-center text-sm text-muted-foreground">
                    Do not have an account?{" "}
                    <Link
                        href={
                            typeof window !== "undefined" &&
                            new URL(window.location.href).searchParams.get("next")
                                ? `/register?next=${new URL(window.location.href).searchParams.get("next")}`
                                : "/register"
                        }
                        className="text-blue-600"
                    >
                        Register
                    </Link>
                </p>
            </FieldGroup>
        </form>
    );
}
