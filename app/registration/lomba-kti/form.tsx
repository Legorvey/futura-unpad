"use client";

import { useEffect, useMemo, useState } from "react";
import { PencilLine } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientLombaKtiFormSchema, type ClientLombaKtiFormValues } from "@/lib/validation";

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
import { AlertCircle } from "lucide-react";

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

export default function LKTIForm() {
  const { user } = useAuth();
  const [step, setStep] = useState<FormStep>("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [registrationId, setRegistrationId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [flashDoneButton, setFlashDoneButton] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ClientLombaKtiFormValues>({
    resolver: zodResolver(clientLombaKtiFormSchema),
    mode: "onChange",
    defaultValues: {
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
      identity_confirmed: false,
    },
  });

  const watchedValues = watch();

  const activeStepIndex = steps.findIndex((item) => item.id === step);
  const selectedSubTheme = useMemo(
    () => subThemeOptions.find((o) => o.id === watchedValues.sub_theme)?.title ?? "-",
    [watchedValues.sub_theme]
  );
  const memberCount = useMemo(
    () =>
      [watchedValues.leader_name, watchedValues.member2_name, watchedValues.member3_name].filter(Boolean)
        .length,
    [watchedValues.leader_name, watchedValues.member2_name, watchedValues.member3_name]
  );

  useEffect(() => {
    if (!user?.email) return;
    const timeout = window.setTimeout(() => {
      const current = watchedValues.leader_email;
      if (!current) {
        setValue("leader_email", user.email ?? "", { shouldValidate: false });
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [user?.email, setValue, watchedValues.leader_email]);

  const goToVerification = async (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    const isValid = await trigger([
      "team_name", "institution", "faculty", "paper_title", "sub_theme",
      "leader_name", "leader_nim", "leader_email", "leader_phone",
      "member2_name", "member2_nim", "member3_name", "member3_nim"
    ]);
    if (isValid) {
      setSubmitError("");
      setStep("verification");
    }
  };

  const submitRegistration = handleSubmit(async (data) => {
    setIsSubmitting(true);
    setSubmitError("");

    // Simulate API call — replace with real API when backend is ready
    setTimeout(() => {
      setRegistrationId(
        `LKTI-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      );
      setStep("payment");
      setIsSubmitting(false);
    }, 1000);
  });

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
        <form onSubmit={goToVerification} noValidate>
          <FieldGroup className="gap-8">
            <div className="rounded-[8px] border-1 border-red-300 bg-red-100 p-4">
              <p className="text-sm font-medium text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Disclaimer
              </p>
              <p className="mt-1 text-sm leading-6 text-red-500">
                Input yang ada di sini masih dummy dan ga berfungsi. Soalnya website masih dalam tahap development.
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
                    aria-invalid={!!errors.team_name}
                    aria-describedby={errors.team_name ? "team-name-error" : undefined}
                    {...register("team_name")}
                  />
                  {errors.team_name && <FieldError id="team-name-error">{errors.team_name.message}</FieldError>}
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
                    aria-invalid={!!errors.institution}
                    aria-describedby={errors.institution ? "institution-error" : undefined}
                    {...register("institution")}
                  />
                  {errors.institution && <FieldError id="institution-error">{errors.institution.message}</FieldError>}
                </Field>

                <Field className="gap-2 sm:col-span-2">
                  <FieldLabel htmlFor="faculty">
                    Jurusan / Program Studi <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    id="faculty"
                    className="h-11 rounded-[8px]"
                    placeholder="Contoh: Teknik Informatika, S1"
                    aria-invalid={!!errors.faculty}
                    aria-describedby={errors.faculty ? "faculty-error" : undefined}
                    {...register("faculty")}
                  />
                  {errors.faculty && <FieldError id="faculty-error">{errors.faculty.message}</FieldError>}
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
                  aria-invalid={!!errors.paper_title}
                  aria-describedby={errors.paper_title ? "paper-title-error" : undefined}
                  {...register("paper_title")}
                />
                <FieldDescription>
                  Judul dapat disesuaikan hingga batas akhir pengumpulan berkas.
                </FieldDescription>
                {errors.paper_title && <FieldError id="paper-title-error">{errors.paper_title.message}</FieldError>}
              </Field>

              <Field className="gap-3">
                <FieldLabel>
                  Sub-Tema <span aria-hidden="true">*</span>
                </FieldLabel>
                <Controller
                  name="sub_theme"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
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
                  )}
                />
                {errors.sub_theme && <FieldError>{errors.sub_theme.message}</FieldError>}
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
                    aria-invalid={!!errors.leader_name}
                    aria-describedby={errors.leader_name ? "leader-name-error" : undefined}
                    {...register("leader_name")}
                  />
                  {errors.leader_name && <FieldError id="leader-name-error">{errors.leader_name.message}</FieldError>}
                </Field>

                <Field className="gap-2">
                  <FieldLabel htmlFor="leader_nim">
                    NIM Ketua <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    id="leader_nim"
                    className="h-11 rounded-[8px]"
                    placeholder="Nomor Induk Mahasiswa"
                    aria-invalid={!!errors.leader_nim}
                    aria-describedby={errors.leader_nim ? "leader-nim-error" : undefined}
                    {...register("leader_nim")}
                  />
                  {errors.leader_nim && <FieldError id="leader-nim-error">{errors.leader_nim.message}</FieldError>}
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
                    aria-invalid={!!errors.leader_email}
                    aria-describedby={errors.leader_email ? "leader-email-error" : undefined}
                    {...register("leader_email")}
                  />
                  {errors.leader_email && <FieldError id="leader-email-error">{errors.leader_email.message}</FieldError>}
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
                    aria-invalid={!!errors.leader_phone}
                    aria-describedby={errors.leader_phone ? "leader-phone-error" : undefined}
                    {...register("leader_phone")}
                  />
                  {errors.leader_phone && <FieldError id="leader-phone-error">{errors.leader_phone.message}</FieldError>}
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
                      aria-invalid={!!errors.member2_name}
                      aria-describedby={errors.member2_name ? "member2-name-error" : undefined}
                      {...register("member2_name")}
                    />
                    {errors.member2_name && <FieldError id="member2-name-error">{errors.member2_name.message}</FieldError>}
                  </Field>
                  <Field className="gap-2">
                    <FieldLabel htmlFor="member2_nim">NIM</FieldLabel>
                    <Input
                      id="member2_nim"
                      className="h-11 rounded-[8px]"
                      placeholder="Nomor Induk Mahasiswa"
                      aria-invalid={!!errors.member2_nim}
                      aria-describedby={errors.member2_nim ? "member2-nim-error" : undefined}
                      {...register("member2_nim")}
                    />
                    {errors.member2_nim && <FieldError id="member2-nim-error">{errors.member2_nim.message}</FieldError>}
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
                      aria-invalid={!!errors.member3_name}
                      aria-describedby={errors.member3_name ? "member3-name-error" : undefined}
                      {...register("member3_name")}
                    />
                    {errors.member3_name && <FieldError id="member3-name-error">{errors.member3_name.message}</FieldError>}
                  </Field>
                  <Field className="gap-2">
                    <FieldLabel htmlFor="member3_nim">NIM</FieldLabel>
                    <Input
                      id="member3_nim"
                      className="h-11 rounded-[8px]"
                      placeholder="Nomor Induk Mahasiswa"
                      aria-invalid={!!errors.member3_nim}
                      aria-describedby={errors.member3_nim ? "member3-nim-error" : undefined}
                      {...register("member3_nim")}
                    />
                    {errors.member3_nim && <FieldError id="member3-nim-error">{errors.member3_nim.message}</FieldError>}
                  </Field>
                </div>
              </div>
            </section>

            <Button type="submit" className="h-11 w-full rounded-[8px]">
              Continue to verification
            </Button>
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
              {isEditing ? null : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit rounded-[8px]"
                  onClick={() => {
                    setIsEditing(true);
                    setSubmitError("");
                  }}
                >
                  <PencilLine className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <Field className="gap-2">
                  <FieldLabel htmlFor="verify-team_name">Nama Tim</FieldLabel>
                  <Input
                    id="verify-team_name"
                    className="h-9 text-sm rounded-[8px]"
                    aria-invalid={!!errors.team_name}
                    aria-describedby={errors.team_name ? "verify-team-name-error" : undefined}
                    {...register("team_name")}
                  />
                  {errors.team_name && <FieldError id="verify-team-name-error">{errors.team_name.message}</FieldError>}
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="verify-institution">Perguruan Tinggi</FieldLabel>
                  <Input
                    id="verify-institution"
                    className="h-9 text-sm rounded-[8px]"
                    aria-invalid={!!errors.institution}
                    aria-describedby={errors.institution ? "verify-institution-error" : undefined}
                    {...register("institution")}
                  />
                  {errors.institution && <FieldError id="verify-institution-error">{errors.institution.message}</FieldError>}
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="verify-faculty">Jurusan / Prodi</FieldLabel>
                  <Input
                    id="verify-faculty"
                    className="h-9 text-sm rounded-[8px]"
                    aria-invalid={!!errors.faculty}
                    aria-describedby={errors.faculty ? "verify-faculty-error" : undefined}
                    {...register("faculty")}
                  />
                  {errors.faculty && <FieldError id="verify-faculty-error">{errors.faculty.message}</FieldError>}
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="verify-sub_theme">Sub-Tema</FieldLabel>
                  <Controller
                    name="sub_theme"
                    control={control}
                    render={({ field }) => (
                      <select
                        id="verify-sub_theme"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        {subThemeOptions.map(o => (
                          <option key={o.id} value={o.id}>{o.title}</option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.sub_theme && <FieldError>{errors.sub_theme.message}</FieldError>}
                </Field>
                <Field className="gap-2 sm:col-span-2">
                  <FieldLabel htmlFor="verify-paper_title">Judul Karya Tulis</FieldLabel>
                  <Input
                    id="verify-paper_title"
                    className="h-9 text-sm rounded-[8px]"
                    aria-invalid={!!errors.paper_title}
                    aria-describedby={errors.paper_title ? "verify-paper-title-error" : undefined}
                    {...register("paper_title")}
                  />
                  {errors.paper_title && <FieldError id="verify-paper-title-error">{errors.paper_title.message}</FieldError>}
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="verify-leader_name">Nama Ketua</FieldLabel>
                  <Input
                    id="verify-leader_name"
                    className="h-9 text-sm rounded-[8px]"
                    aria-invalid={!!errors.leader_name}
                    aria-describedby={errors.leader_name ? "verify-leader-name-error" : undefined}
                    {...register("leader_name")}
                  />
                  {errors.leader_name && <FieldError id="verify-leader-name-error">{errors.leader_name.message}</FieldError>}
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="verify-leader_nim">NIM Ketua</FieldLabel>
                  <Input
                    id="verify-leader_nim"
                    className="h-9 text-sm rounded-[8px]"
                    aria-invalid={!!errors.leader_nim}
                    aria-describedby={errors.leader_nim ? "verify-leader-nim-error" : undefined}
                    {...register("leader_nim")}
                  />
                  {errors.leader_nim && <FieldError id="verify-leader-nim-error">{errors.leader_nim.message}</FieldError>}
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="verify-leader_email">Email Ketua</FieldLabel>
                  <Input
                    id="verify-leader_email"
                    className="h-9 text-sm rounded-[8px]"
                    type="email"
                    aria-invalid={!!errors.leader_email}
                    aria-describedby={errors.leader_email ? "verify-leader-email-error" : undefined}
                    {...register("leader_email")}
                  />
                  {errors.leader_email && <FieldError id="verify-leader-email-error">{errors.leader_email.message}</FieldError>}
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="verify-leader_phone">WhatsApp Ketua</FieldLabel>
                  <Input
                    id="verify-leader_phone"
                    className="h-9 text-sm rounded-[8px]"
                    aria-invalid={!!errors.leader_phone}
                    aria-describedby={errors.leader_phone ? "verify-leader-phone-error" : undefined}
                    {...register("leader_phone")}
                  />
                  {errors.leader_phone && <FieldError id="verify-leader-phone-error">{errors.leader_phone.message}</FieldError>}
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="verify-member2_name">Anggota 2 <span className="font-normal">(opsional)</span></FieldLabel>
                  <Input
                    id="verify-member2_name"
                    className="h-9 text-sm rounded-[8px]"
                    placeholder="Nama Anggota 2"
                    aria-invalid={!!errors.member2_name}
                    aria-describedby={errors.member2_name ? "verify-member2-name-error" : undefined}
                    {...register("member2_name")}
                  />
                  {errors.member2_name && <FieldError id="verify-member2-name-error">{errors.member2_name.message}</FieldError>}
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="verify-member2_nim">NIM Anggota 2</FieldLabel>
                  <Input
                    id="verify-member2_nim"
                    className="h-9 text-sm rounded-[8px]"
                    placeholder="NIM Anggota 2"
                    aria-invalid={!!errors.member2_nim}
                    aria-describedby={errors.member2_nim ? "verify-member2-nim-error" : undefined}
                    {...register("member2_nim")}
                  />
                  {errors.member2_nim && <FieldError id="verify-member2-nim-error">{errors.member2_nim.message}</FieldError>}
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="verify-member3_name">Anggota 3 <span className="font-normal">(opsional)</span></FieldLabel>
                  <Input
                    id="verify-member3_name"
                    className="h-9 text-sm rounded-[8px]"
                    placeholder="Nama Anggota 3"
                    aria-invalid={!!errors.member3_name}
                    aria-describedby={errors.member3_name ? "verify-member3-name-error" : undefined}
                    {...register("member3_name")}
                  />
                  {errors.member3_name && <FieldError id="verify-member3-name-error">{errors.member3_name.message}</FieldError>}
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="verify-member3_nim">NIM Anggota 3</FieldLabel>
                  <Input
                    id="verify-member3_nim"
                    className="h-9 text-sm rounded-[8px]"
                    placeholder="NIM Anggota 3"
                    aria-invalid={!!errors.member3_nim}
                    aria-describedby={errors.member3_nim ? "verify-member3-nim-error" : undefined}
                    {...register("member3_nim")}
                  />
                  {errors.member3_nim && <FieldError id="verify-member3-nim-error">{errors.member3_nim.message}</FieldError>}
                </Field>
                <div className="sm:col-span-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className={cn(
                      "rounded-[8px] transition-colors duration-300",
                      flashDoneButton &&
                      "bg-destructive/80 text-white hover:bg-destructive/90"
                    )}
                    onClick={async () => {
                      const isValid = await trigger(["team_name", "institution", "faculty", "paper_title", "sub_theme", "leader_name", "leader_nim", "leader_email", "leader_phone", "member2_name", "member2_nim", "member3_name", "member3_nim"]);
                      if (isValid) setIsEditing(false);
                    }}
                  >
                    Done Editing
                  </Button>
                </div>
              </div>
            ) : (
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Nama Tim</dt>
                  <dd className="mt-1 font-medium">{watchedValues.team_name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Perguruan Tinggi</dt>
                  <dd className="mt-1 font-medium">{watchedValues.institution}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Jurusan / Prodi</dt>
                  <dd className="mt-1 font-medium">{watchedValues.faculty}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Sub-Tema</dt>
                  <dd className="mt-1 font-medium">{selectedSubTheme}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Judul Karya Tulis</dt>
                  <dd className="mt-1 font-medium">{watchedValues.paper_title}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Nama Ketua</dt>
                  <dd className="mt-1 font-medium">{watchedValues.leader_name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">NIM Ketua</dt>
                  <dd className="mt-1 font-medium">{watchedValues.leader_nim}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email Ketua</dt>
                  <dd className="mt-1 break-all font-medium">
                    {watchedValues.leader_email}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">WhatsApp Ketua</dt>
                  <dd className="mt-1 font-medium">{watchedValues.leader_phone}</dd>
                </div>
                {watchedValues.member2_name ? (
                  <>
                    <div>
                      <dt className="text-muted-foreground">Anggota 2</dt>
                      <dd className="mt-1 font-medium">{watchedValues.member2_name}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">NIM Anggota 2</dt>
                      <dd className="mt-1 font-medium">
                        {watchedValues.member2_nim || "-"}
                      </dd>
                    </div>
                  </>
                ) : null}
                {watchedValues.member3_name ? (
                  <>
                    <div>
                      <dt className="text-muted-foreground">Anggota 3</dt>
                      <dd className="mt-1 font-medium">{watchedValues.member3_name}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">NIM Anggota 3</dt>
                      <dd className="mt-1 font-medium">
                        {watchedValues.member3_nim || "-"}
                      </dd>
                    </div>
                  </>
                ) : null}
              </dl>
            )}
          </div>

          <Field
            orientation="horizontal"
            className="items-start rounded-[8px] border p-4"
          >
            <Controller
              name="identity_confirmed"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="identity-confirmed"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={!!errors.identity_confirmed}
                  aria-describedby={errors.identity_confirmed ? "identity-confirmed-error" : undefined}
                />
              )}
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

          {errors.identity_confirmed && <FieldError id="identity-confirmed-error">{errors.identity_confirmed.message}</FieldError>}
          {submitError ? <FieldError>{submitError}</FieldError> : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-[8px]"
              onClick={() => {
                if (isEditing) {
                  setFlashDoneButton(true);
                  setTimeout(() => setFlashDoneButton(false), 500);
                } else {
                  setSubmitError("");
                  setStep("details");
                }
              }}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="button"
              className="h-11 rounded-[8px]"
              onClick={submitRegistration}
              disabled={isSubmitting || isEditing}
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
                <dd className="font-medium">{watchedValues.team_name}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-3">
                <dt className="text-muted-foreground">Ketua Tim</dt>
                <dd className="font-medium">{watchedValues.leader_name}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-3">
                <dt className="text-muted-foreground">Judul Karya Tulis</dt>
                <dd className="max-w-[55%] text-right font-medium">
                  {watchedValues.paper_title}
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

          {submitError ? <FieldError>{submitError}</FieldError> : null}

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