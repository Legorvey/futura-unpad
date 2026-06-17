"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-provider";

export default function RegisterForm() {
    const router = useRouter();
    const { refreshAuth } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [conPassword, setConPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (password !== conPassword) {
            alert("Passwords do not match.");
            setIsSubmitting(false);
            return;
        }

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
                confirmPassword: conPassword,
            }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
            alert(data?.error ?? "Registration failed.");
            setIsSubmitting(false);
            return;
        }

        if (data?.authenticated) {
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
            return;
        }

        alert("Registration successful. Please check your email if confirmation is required.");
        setIsSubmitting(false);
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
            </Field>

            <Field className="gap-1">
                <FieldLabel htmlFor="conpassword">Confirm Password</FieldLabel>
                <Input
                    id="conpassword"
                    type="password"
                    className="h-11 rounded-xl"
                    autoComplete="off"
                    placeholder="Confirm your password"
                    value={conPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setConPassword(e.target.value)
                    }
                    required
                />
            </Field>

            <Field className="gap-3">
                <Button
                    type="submit"
                    className="h-11 rounded-xl"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>
            </Field>
            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                    href={
                        typeof window !== "undefined" &&
                        new URL(window.location.href).searchParams.get("next")
                            ? `/login?next=${new URL(window.location.href).searchParams.get("next")}`
                            : "/login"
                    }
                    className="text-blue-600"
                >
                    Log in
                </Link>
            </p>
        </FieldGroup>
    </form>
  );
}
