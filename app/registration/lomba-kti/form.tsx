"use client";

import { useEffect, useMemo, useState } from "react";
import { PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

type FormStep = "details" | "verification" | "payment";

const steps: Array<{ id: FormStep; label: string }> = [
  { id: "details", label: "Details" },
  { id: "verification", label: "Verify" },
  { id: "payment", label: "Payment" },
];

const subThemeOptions = [
  {
    id: "teknologi",
    title: "Teknologi dan Inovasi",
    description: "Pengembangan teknologi tepat guna dan inovasi digital.",
  },
  {
    id: "kesehatan",
    title: "Kesehatan dan Lingkungan",
    description: "Isu kesehatan masyarakat dan kelestarian lingkungan hidup.",
  },
  {
    id: "ekonomi",
    title: "Ekonomi dan Bisnis",
    description: "Kewirausahaan, ekonomi kreatif, dan pemberdayaan UMKM.",
  },
  {
    id: "sosial",
    title: "Sosial dan Humaniora",
    description: "Permasalahan sosial, budaya, dan kebijakan publik.",
  },
  {
    id: "pendidikan",
    title: "Pendidikan",
    description: "Inovasi pembelajaran dan peningkatan kualitas pendidikan.",
  },
];

const initialForm = {
  team_name: "",
  institution: "",
  faculty: "",
  paper_title: "",
  leader_name: "",
  leader_nim: "",
  leader_email: "",
  leader_phone: "",
  member2_name: "",
  member2_nim: "",
  member3_name: "",
  member3_nim: "",
  sub_theme: "teknologi",
};

type FormField = keyof typeof initialForm;

export default function LKTIForm() {
  const { user } = useAuth();
  const [step, setStep] = useState<FormStep>("details");
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [registrationId, setRegistrationId] = useState("");

  const activeStepIndex = steps.findIndex((item) => item.id === step);
  const selectedSubTheme = useMemo(
    () => subThemeOptions.find((o) => o.id === form.sub_theme)?.title ?? "-",
    [form.sub_theme]
  );
  const memberCount = useMemo(
    () =>
      [form.leader_name, form.member2_name, form.member3_name].filter(Boolean)
        .length,
    [form.leader_name, form.member2_name, form.member3_name]
  );

  useEffect(() => {
    if (!user?.email) return;
    const timeout = window.setTimeout(() => {
      setForm((f) => ({
        ...f,
        leader_email: f.leader_email || user.email || "",
      }));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [user?.email]);

  const updateField = (field: FormField, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setIdentityConfirmed(false);
  };

  const goToVerification = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setStep("verification");
  };

  const submitRegistration = async () => {
    if (!identityConfirmed) {
      setErrorMessage(
        "Please confirm your data is correct before continuing to payment."
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    // Simulate API call — replace with real API when backend is ready
    setTimeout(() => {
      setRegistrationId(
        `LKTI-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      );
      setStep("payment");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="space-y-8">
      <nav aria-label="LKTI registration progress" className="space-y-3">
        <ol className="flex items-center justify-between gap-3 text-xs sm:text-sm">
          {steps.map((item, index) => {
            const isActive = index <= activeStepIndex;

            return (
              <li
                key={item.id}
                className={cn(
                  "flex items-center gap-2",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
                aria-current={index === activeStepIndex ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium",
                    isActive
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background"
                  )}
                >
                  {index + 1}
                </span>
                <span className="font-medium">{item.label}</span>
              </li>
            );
          })}
        </ol>

        <div
          className="h-2 rounded-full bg-muted"
          role="progressbar"
          aria-label="Registration completion"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={activeStepIndex + 1}
        >
          <div
            className="h-full rounded-full bg-foreground transition-all"
            style={{
              width: `${((activeStepIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </nav>

      {step === "details" ? (
        <form onSubmit={goToVerification}>
          <FieldGroup className="gap-8">
            <div className="rounded-[8px] border border-border bg-muted/30 p-4">
              <p className="text-sm font-medium">
                Lomba Karya Tulis Ilmiah registration
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Isi data tim, ketua, dan karya tulis dengan lengkap dan benar.
                Pastikan judul dan sub-tema sesuai sebelum melanjutkan.
              </p>
            </div>

            {/* Team information */}
            <section className="space-y-4" aria-labelledby="team-section-label">
              <div>
                <h2
                  id="team-section-label"
                  className="text-base font-semibold"
                >
                  Informasi Tim
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Satu tim dapat terdiri dari 1–3 orang peserta.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field className="gap-2">
                  <FieldLabel htmlFor="team_name">
                    Nama Tim <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    id="team_name"
                    className="h-11 rounded-[8px]"
                    placeholder="Contoh: Tim Riset Nusantara"
                    value={form.team_name}
                    onChange={(e) => updateField("team_name", e.target.value)}
                    required
                  />
                </Field>

                <Field className="gap-2">
                  <FieldLabel htmlFor="institution">
                    Asal Perguruan Tinggi <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    id="institution"
                    className="h-11 rounded-[8px]"
                    placeholder="Nama universitas atau institusi"
                    autoComplete="organization"
                    value={form.institution}
                    onChange={(e) =>
                      updateField("institution", e.target.value)
                    }
                    required
                  />
                </Field>

                <Field className="gap-2 sm:col-span-2">
                  <FieldLabel htmlFor="faculty">
                    Jurusan / Program Studi <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    id="faculty"
                    className="h-11 rounded-[8px]"
                    placeholder="Contoh: Teknik Informatika, S1"
                    value={form.faculty}
                    onChange={(e) => updateField("faculty", e.target.value)}
                    required
                  />
                </Field>
              </div>
            </section>

            {/* Paper information */}
            <section
              className="space-y-4"
              aria-labelledby="paper-section-label"
            >
              <div>
                <h2
                  id="paper-section-label"
                  className="text-base font-semibold"
                >
                  Karya Tulis
                </h2>
              </div>

              <Field className="gap-2">
                <FieldLabel htmlFor="paper_title">
                  Judul Karya Tulis <span aria-hidden="true">*</span>
                </FieldLabel>
                <Input
                  id="paper_title"
                  className="h-11 rounded-[8px]"
                  placeholder="Judul lengkap karya tulis ilmiah"
                  value={form.paper_title}
                  onChange={(e) => updateField("paper_title", e.target.value)}
                  required
                />
                <FieldDescription>
                  Judul dapat disesuaikan hingga batas akhir pengumpulan berkas.
                </FieldDescription>
              </Field>

              <Field className="gap-3">
                <FieldLabel>
                  Sub-Tema <span aria-hidden="true">*</span>
                </FieldLabel>
                <RadioGroup
                  value={form.sub_theme}
                  onValueChange={(value) => {
                    setForm((f) => ({ ...f, sub_theme: value }));
                    setIdentityConfirmed(false);
                  }}
                >
                  {subThemeOptions.map((option) => (
                    <FieldLabel
                      key={option.id}
                      htmlFor={`sub-theme-${option.id}`}
                      className="has-[>[data-slot=field]]:rounded-[8px]"
                    >
                      <Field orientation="horizontal" className="py-4">
                        <FieldContent>
                          <FieldTitle>{option.title}</FieldTitle>
                          <FieldDescription>
                            {option.description}
                          </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem
                          id={`sub-theme-${option.id}`}
                          value={option.id}
                        />
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
              </Field>
            </section>

            {/* Team leader */}
            <section
              className="space-y-4"
              aria-labelledby="leader-section-label"
            >
              <div>
                <h2
                  id="leader-section-label"
                  className="text-base font-semibold"
                >
                  Ketua Tim
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Ketua tim adalah penanggung jawab utama dan kontak panitia.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field className="gap-2">
                  <FieldLabel htmlFor="leader_name">
                    Nama Lengkap Ketua <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    id="leader_name"
                    className="h-11 rounded-[8px]"
                    placeholder="Nama sesuai identitas"
                    autoComplete="name"
                    value={form.leader_name}
                    onChange={(e) =>
                      updateField("leader_name", e.target.value)
                    }
                    required
                  />
                </Field>

                <Field className="gap-2">
                  <FieldLabel htmlFor="leader_nim">
                    NIM Ketua <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    id="leader_nim"
                    className="h-11 rounded-[8px]"
                    placeholder="Nomor Induk Mahasiswa"
                    value={form.leader_nim}
                    onChange={(e) => updateField("leader_nim", e.target.value)}
                    required
                  />
                </Field>

                <Field className="gap-2">
                  <FieldLabel htmlFor="leader_email">
                    Email Ketua <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    id="leader_email"
                    type="email"
                    className="h-11 rounded-[8px]"
                    placeholder="nama@email.com"
                    autoComplete="email"
                    value={form.leader_email}
                    onChange={(e) =>
                      updateField("leader_email", e.target.value)
                    }
                    required
                  />
                </Field>

                <Field className="gap-2">
                  <FieldLabel htmlFor="leader_phone">
                    WhatsApp Ketua <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    id="leader_phone"
                    className="h-11 rounded-[8px]"
                    placeholder="+62 8XX-XXXX-XXXX"
                    autoComplete="tel"
                    value={form.leader_phone}
                    onChange={(e) =>
                      updateField("leader_phone", e.target.value)
                    }
                    required
                  />
                </Field>
              </div>
            </section>

            {/* Team members */}
            <section
              className="space-y-4"
              aria-labelledby="members-section-label"
            >
              <div>
                <h2
                  id="members-section-label"
                  className="text-base font-semibold"
                >
                  Anggota Tim
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Opsional. Tambahkan hingga 2 anggota tambahan.
                </p>
              </div>

              <div className="rounded-[8px] border border-border p-4">
                <p className="mb-4 text-sm font-medium text-muted-foreground">
                  Anggota 2{" "}
                  <span className="font-normal">(opsional)</span>
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field className="gap-2">
                    <FieldLabel htmlFor="member2_name">Nama Lengkap</FieldLabel>
                    <Input
                      id="member2_name"
                      className="h-11 rounded-[8px]"
                      placeholder="Nama anggota 2"
                      value={form.member2_name}
                      onChange={(e) =>
                        updateField("member2_name", e.target.value)
                      }
                    />
                  </Field>
                  <Field className="gap-2">
                    <FieldLabel htmlFor="member2_nim">NIM</FieldLabel>
                    <Input
                      id="member2_nim"
                      className="h-11 rounded-[8px]"
                      placeholder="Nomor Induk Mahasiswa"
                      value={form.member2_nim}
                      onChange={(e) =>
                        updateField("member2_nim", e.target.value)
                      }
                    />
                  </Field>
                </div>
              </div>

              <div className="rounded-[8px] border border-border p-4">
                <p className="mb-4 text-sm font-medium text-muted-foreground">
                  Anggota 3{" "}
                  <span className="font-normal">(opsional)</span>
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field className="gap-2">
                    <FieldLabel htmlFor="member3_name">Nama Lengkap</FieldLabel>
                    <Input
                      id="member3_name"
                      className="h-11 rounded-[8px]"
                      placeholder="Nama anggota 3"
                      value={form.member3_name}
                      onChange={(e) =>
                        updateField("member3_name", e.target.value)
                      }
                    />
                  </Field>
                  <Field className="gap-2">
                    <FieldLabel htmlFor="member3_nim">NIM</FieldLabel>
                    <Input
                      id="member3_nim"
                      className="h-11 rounded-[8px]"
                      placeholder="Nomor Induk Mahasiswa"
                      value={form.member3_nim}
                      onChange={(e) =>
                        updateField("member3_nim", e.target.value)
                      }
                    />
                  </Field>
                </div>
              </div>
            </section>

            <Field>
              <Button type="submit" className="h-11 rounded-[8px]">
                Continue to identity check
              </Button>
            </Field>
          </FieldGroup>
        </form>
      ) : null}

      {step === "verification" ? (
        <FieldGroup className="gap-6">
          <div className="rounded-[8px] border border-border bg-card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Verify registration data
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Periksa kembali data tim, ketua, dan judul karya tulis
                  sebelum melanjutkan ke pembayaran.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit rounded-[8px]"
                onClick={() => setStep("details")}
              >
                <PencilLine className="h-4 w-4" />
                Edit
              </Button>
            </div>

            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Nama Tim</dt>
                <dd className="mt-1 font-medium">{form.team_name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Perguruan Tinggi</dt>
                <dd className="mt-1 font-medium">{form.institution}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Jurusan / Prodi</dt>
                <dd className="mt-1 font-medium">{form.faculty}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Sub-Tema</dt>
                <dd className="mt-1 font-medium">{selectedSubTheme}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Judul Karya Tulis</dt>
                <dd className="mt-1 font-medium">{form.paper_title}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Nama Ketua</dt>
                <dd className="mt-1 font-medium">{form.leader_name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">NIM Ketua</dt>
                <dd className="mt-1 font-medium">{form.leader_nim}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email Ketua</dt>
                <dd className="mt-1 break-all font-medium">
                  {form.leader_email}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">WhatsApp Ketua</dt>
                <dd className="mt-1 font-medium">{form.leader_phone}</dd>
              </div>
              {form.member2_name ? (
                <>
                  <div>
                    <dt className="text-muted-foreground">Anggota 2</dt>
                    <dd className="mt-1 font-medium">{form.member2_name}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">NIM Anggota 2</dt>
                    <dd className="mt-1 font-medium">
                      {form.member2_nim || "-"}
                    </dd>
                  </div>
                </>
              ) : null}
              {form.member3_name ? (
                <>
                  <div>
                    <dt className="text-muted-foreground">Anggota 3</dt>
                    <dd className="mt-1 font-medium">{form.member3_name}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">NIM Anggota 3</dt>
                    <dd className="mt-1 font-medium">
                      {form.member3_nim || "-"}
                    </dd>
                  </div>
                </>
              ) : null}
            </dl>
          </div>

          <Field
            orientation="horizontal"
            className="items-start rounded-[8px] border p-4"
          >
            <Checkbox
              id="identity-confirmed"
              checked={identityConfirmed}
              onCheckedChange={(checked) =>
                setIdentityConfirmed(checked === true)
              }
            />
            <FieldContent>
              <FieldLabel htmlFor="identity-confirmed">
                Saya menyatakan data yang diisi sudah benar.
              </FieldLabel>
              <FieldDescription>
                Nama, NIM, judul, dan sub-tema akan digunakan untuk proses
                seleksi dan publikasi hasil lomba.
              </FieldDescription>
            </FieldContent>
          </Field>

          {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-[8px]"
              onClick={() => setStep("details")}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="button"
              className="h-11 rounded-[8px]"
              onClick={submitRegistration}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Confirm and continue to payment"}
            </Button>
          </div>
        </FieldGroup>
      ) : null}

      {step === "payment" ? (
        <FieldGroup className="gap-6">
          <div className="rounded-[8px] border border-border bg-card p-6">
            <div className="mb-5 rounded-[8px] bg-muted p-3">
              <p className="text-xs text-muted-foreground">Registration ID</p>
              <p className="font-mono text-sm font-semibold">{registrationId}</p>
            </div>

            <p className="text-sm text-muted-foreground">Total pembayaran</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              Rp 50.000
            </p>

            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4 border-t pt-3">
                <dt className="text-muted-foreground">Event</dt>
                <dd className="font-medium">Lomba Karya Tulis Ilmiah</dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-3">
                <dt className="text-muted-foreground">Nama Tim</dt>
                <dd className="font-medium">{form.team_name}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-3">
                <dt className="text-muted-foreground">Ketua Tim</dt>
                <dd className="font-medium">{form.leader_name}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-3">
                <dt className="text-muted-foreground">Judul Karya Tulis</dt>
                <dd className="max-w-[55%] text-right font-medium">
                  {form.paper_title}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-3">
                <dt className="text-muted-foreground">Sub-Tema</dt>
                <dd className="font-medium">{selectedSubTheme}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-3">
                <dt className="text-muted-foreground">Jumlah Peserta</dt>
                <dd className="font-medium">{memberCount} orang</dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-3">
                <dt className="text-muted-foreground">Payment Status</dt>
                <dd className="font-medium">PENDING_PAYMENT</dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-3">
                <dt className="text-muted-foreground">Registration</dt>
                <dd className="font-medium">WAITING_PAYMENT</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[8px] border p-4 text-sm leading-6 text-muted-foreground">
            Setelah langkah ini, registrasi tim akan disimpan dan halaman
            pembayaran akan membuat atau membuka kembali invoice untuk tim ini.
          </div>

          {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-[8px]"
              onClick={() => setStep("verification")}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="h-11 rounded-[8px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving registration..." : "Open payment preview"}
            </Button>
          </div>
        </FieldGroup>
      ) : null}
    </section>
  );
}