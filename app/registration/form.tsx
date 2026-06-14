"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/components/auth-provider";

type RegistrationField = "nama" | "email" | "telp" | "institusi";

const initialUser = {
    nama: "",
    email: "",
    telp: "",
    institusi: "",
    status_akademika: "mahasiswa",
    kehadiran: "luring",
};

const fields: Array<{
    id: RegistrationField;
    label: string;
    placeholder: string;
    type?: string;
}> = [
    {
        id: "nama",
        label: "Nama Lengkap",
        placeholder: "e.g. John Doe",
    },
    {
        id: "email",
        label: "Email",
        placeholder: "e.g. johndoe@gmail.com",
        type: "email",
    },
    {
        id: "telp",
        label: "No. Telepon",
        placeholder: "+62 8XX-XXXX-XXXX",
    },
    {
        id: "institusi",
        label: "Asal Institusi",
        placeholder: "Universitas Padjadjaran",
    },
];

const attendanceOptions = [
    {
        id: "luring",
        title: "Luring",
        description: "Graha Sanusi Hardjadinata",
    },
    {
        id: "daring",
        title: "Daring",
        description: "Akan diberikan link Zoom Meeting",
    },
];

const statusOptions = [
    {
        id: "mahasiswa",
        title: "Mahasiswa",
        description: "Hadir seminar sebagai Mahasiswa",
    },
    {
        id: "dosen",
        title: "Dosen",
        description: "Hadir seminar sebagai Dosen",
    }
]

export default function RegistrationForm() {
    const { user } = useAuth();
    const [newUser, setNewUser] = useState(initialUser);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!user?.email) {
            return;
        }

        const timeout = window.setTimeout(() => {
            setNewUser((currentUser) => ({
                ...currentUser,
                email: currentUser.email || user.email || "",
            }));
        }, 0);

        return () => window.clearTimeout(timeout);
    }, [user?.email]);

    const updateField = (field: RegistrationField, value: string) => {
        setNewUser((user) => ({
            ...user,
            [field]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const res = await fetch("/api/seminar-registrations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                nama_lengkap: newUser.nama,
                email: newUser.email,
                no_telepon: newUser.telp,
                asal_institusi: newUser.institusi,
                status_akademika: newUser.status_akademika,
                presentasi_riset: newUser.kehadiran,
            }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.order_id) {
            alert(data?.error ?? "Registration failed. Please try again.");
            setIsSubmitting(false);
            return;
        }

        router.push(`/payment?order_id=${encodeURIComponent(data.order_id)}`);
    };

    return (
        <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-5">
                {fields.map((field) => (
                    <Field key={field.id} className="gap-2">
                        <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
                        <Input
                            id={field.id}
                            type={field.type ?? "text"}
                            className="h-11 rounded-xl"
                            placeholder={field.placeholder}
                            autoComplete={field.id === "email" ? "email" : "off"}
                            value={newUser[field.id]}
                            onChange={(e) => updateField(field.id, e.target.value)}
                            required
                        />
                    </Field>
                ))}

                <Field className="gap-3">
                    <FieldLabel>Status Civitas Akademika</FieldLabel>
                    <RadioGroup
                        value={newUser.status_akademika}
                        onValueChange={(value) =>
                            setNewUser((user) => ({
                                ...user,
                                status_akademika: value,
                            }))
                        }
                    >
                        {statusOptions.map((option) => (
                            <FieldLabel
                                key={option.id}
                                htmlFor={option.id}
                                className="has-[>[data-slot=field]]:rounded-xl"
                            >
                                <Field orientation="horizontal" className="py-4">
                                    <FieldContent>
                                        <FieldTitle>{option.title}</FieldTitle>
                                        <FieldDescription>{option.description}</FieldDescription>
                                    </FieldContent>
                                    <RadioGroupItem id={option.id} value={option.id} />
                                </Field>
                            </FieldLabel>
                        ))}
                    </RadioGroup>
                </Field>

                <Field className="gap-3">
                    <FieldLabel>Metode Kehadiran</FieldLabel>
                    <RadioGroup
                        value={newUser.kehadiran}
                        onValueChange={(value) =>
                            setNewUser((user) => ({
                                ...user,
                                kehadiran: value,
                            }))
                        }
                    >
                        {attendanceOptions.map((option) => (
                            <FieldLabel
                                key={option.id}
                                htmlFor={option.id}
                                className="has-[>[data-slot=field]]:rounded-xl"
                            >
                                <Field orientation="horizontal" className="py-4">
                                    <FieldContent>
                                        <FieldTitle>{option.title}</FieldTitle>
                                        <FieldDescription>{option.description}</FieldDescription>
                                    </FieldContent>
                                    <RadioGroupItem id={option.id} value={option.id} />
                                </Field>
                            </FieldLabel>
                        ))}
                    </RadioGroup>
                </Field>

                <Field>
                    <Button
                        type="submit"
                        className="h-11 rounded-xl"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Preparing payment..." : "Continue"}
                    </Button>
                </Field>
            </FieldGroup>
        </form>
    );
}
