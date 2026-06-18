"use client";

import { useRouter } from "next/navigation";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Download, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  clientSeminarFormSchema,
  type ClientSeminarFormValues,
} from "@/lib/validation";
import { cn } from "@/lib/utils";

type SeminarStep = "details" | "verification" | "ticket";

const steps: Array<{ id: SeminarStep; label: string }> = [
  { id: "details", label: "Details" },
  { id: "verification", label: "Verify" },
  { id: "ticket", label: "Ticket" },
];

const statusOptions = [
  {
    id: "mahasiswa" as const,
    title: "Mahasiswa",
    description: "Peserta dari perguruan tinggi.",
  },
  {
    id: "siswa" as const,
    title: "Siswa",
    description: "Peserta dari sekolah menengah.",
  },
  {
    id: "dosen" as const,
    title: "Dosen",
    description: "Tenaga pendidik perguruan tinggi.",
  },
  {
    id: "umum" as const,
    title: "Umum",
    description: "Peserta umum atau profesional.",
  },
];

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word;

    if (ctx.measureText(nextLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = nextLine;
    }
  }

  ctx.fillText(line, x, currentY);
}

export default function SeminarRegistrationForm() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [step, setStep] = useState<SeminarStep>("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [flashDoneButton, setFlashDoneButton] = useState(false);
  const [registrationId, setRegistrationId] = useState("");
  const [showAnonDialog, setShowAnonDialog] = useState(false);

  const activeStepIndex = steps.findIndex((item) => item.id === step);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ClientSeminarFormValues>({
    resolver: zodResolver(clientSeminarFormSchema),
    mode: "onChange",
    defaultValues: {
      nama: "",
      email: "",
      telp: "",
      institusi: "",
      status_akademika: "mahasiswa",
      identity_confirmed: false,
    },
  });

  const watchedValues = watch();
  const statusLabel = useMemo(
    () =>
      statusOptions.find((o) => o.id === watchedValues.status_akademika)
        ?.title ?? "-",
    [watchedValues.status_akademika]
  );

  // Pre-fill email from logged-in user
  useEffect(() => {
    if (!user?.email) return;
    const timeout = window.setTimeout(() => {
      const current = watchedValues.email;
      if (!current) {
        setValue("email", user.email ?? "", { shouldValidate: false });
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [user?.email, setValue, watchedValues.email]);

  // Show anonymous dialog if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      setShowAnonDialog(true);
    }
  }, [isLoading, user]);

  const goToVerification = async (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    const isValid = await trigger(["nama", "email", "telp", "institusi", "status_akademika"]);
    if (isValid) {
      setSubmitError("");
      setStep("verification");
    }
  };

  const submitRegistration = handleSubmit(async (data) => {
    setIsSubmitting(true);
    setSubmitError("");

    const res = await fetch("/api/seminar-registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama_lengkap: data.nama,
        email: data.email,
        no_telepon: data.telp,
        asal_institusi: data.institusi,
        status_akademika: data.status_akademika,
        identity_confirmed: data.identity_confirmed,
      }),
    });

    const responseData = await res.json().catch(() => null);

    if (!res.ok || !responseData?.registration_id) {
      setSubmitError(responseData?.error ?? "Registration failed. Please try again.");
      setIsSubmitting(false);
      return;
    }

    setRegistrationId(responseData.registration_id);
    setStep("ticket");
    setIsSubmitting(false);
  });

  const downloadTicket = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 4;
    ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

    ctx.fillStyle = "#111111";
    ctx.font = "700 54px Arial";
    ctx.fillText("Futura Seminar", 90, 140);

    ctx.font = "400 24px Arial";
    ctx.fillStyle = "#666666";
    ctx.fillText("Futura Seminar", 90, 180);

    ctx.fillStyle = "#111111";
    ctx.font = "700 46px Arial";
    drawWrappedText(ctx, watchedValues.nama, 90, 285, 680, 56);

    ctx.font = "400 24px Arial";
    ctx.fillStyle = "#666666";
    ctx.fillText(watchedValues.email, 90, 350);
    ctx.fillText(watchedValues.telp, 90, 388);

    ctx.strokeStyle = "#d4d4d4";
    ctx.setLineDash([12, 12]);
    ctx.beginPath();
    ctx.moveTo(820, 95);
    ctx.lineTo(820, canvas.height - 95);
    ctx.stroke();
    ctx.setLineDash([]);

    const rows = [
      ["Institution", watchedValues.institusi],
      ["Status", statusLabel],
      ["Registration ID", registrationId],
    ];

    let y = 150;
    for (const [label, value] of rows) {
      ctx.fillStyle = "#777777";
      ctx.font = "400 20px Arial";
      ctx.fillText(label, 870, y);

      ctx.fillStyle = "#111111";
      ctx.font = "700 24px Arial";
      drawWrappedText(ctx, value || "-", 870, y + 34, 245, 30);
      y += 110;
    }

    ctx.fillStyle = "#666666";
    ctx.font = "400 22px Arial";
    ctx.fillText("Show this ticket during seminar check-in.", 90, 620);

    const link = document.createElement("a");
    link.download = `futura-seminar-ticket-${registrationId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <>
      <AlertDialog open={showAnonDialog} onOpenChange={setShowAnonDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Register as Anonymous?</AlertDialogTitle>
            <AlertDialogDescription>
              You are not logged in. Do you want to continue registering for the
              seminar as an anonymous user? We recommend logging in to keep
              track of your tickets easily.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowAnonDialog(false)}>
              Continue Anonymous
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/login?next=/registration/seminar")}>
              Log In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <section className="space-y-8">
        <nav aria-label="Seminar registration progress" className="space-y-3">
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
            aria-label="Seminar registration completion"
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
            <FieldGroup className="gap-6">

              {/* Nama Lengkap */}
              <Field className="gap-2">
                <FieldLabel htmlFor="nama">
                  Nama Lengkap <span aria-hidden="true">*</span>
                </FieldLabel>
                <Input
                  id="nama"
                  className="h-11 rounded-[8px]"
                  placeholder="Nama sesuai identitas"
                  autoComplete="name"
                  aria-describedby={errors.nama ? "nama-error" : undefined}
                  aria-invalid={!!errors.nama}
                  {...register("nama")}
                />
                {errors.nama ? (
                  <FieldError id="nama-error">{errors.nama.message}</FieldError>
                ) : null}
              </Field>

              {/* Email */}
              <Field className="gap-2">
                <FieldLabel htmlFor="email">
                  Email <span aria-hidden="true">*</span>
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  className="h-11 rounded-[8px]"
                  placeholder="nama@email.com"
                  autoComplete="email"
                  aria-describedby={errors.email ? "email-error" : undefined}
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                {errors.email ? (
                  <FieldError id="email-error">{errors.email.message}</FieldError>
                ) : null}
              </Field>

              {/* Nomor WhatsApp */}
              <Field className="gap-2">
                <FieldLabel htmlFor="telp">
                  Nomor WhatsApp <span aria-hidden="true">*</span>
                </FieldLabel>
                <Input
                  id="telp"
                  className="h-11 rounded-[8px]"
                  placeholder="+62 8XX-XXXX-XXXX"
                  autoComplete="tel"
                  aria-describedby={errors.telp ? "telp-error" : undefined}
                  aria-invalid={!!errors.telp}
                  {...register("telp")}
                />
                {errors.telp ? (
                  <FieldError id="telp-error">{errors.telp.message}</FieldError>
                ) : null}
              </Field>

              {/* Asal Institusi */}
              <Field className="gap-2">
                <FieldLabel htmlFor="institusi">
                  Asal Institusi <span aria-hidden="true">*</span>
                </FieldLabel>
                <Input
                  id="institusi"
                  className="h-11 rounded-[8px]"
                  placeholder="Nama sekolah, kampus, instansi, atau komunitas"
                  autoComplete="organization"
                  aria-describedby={
                    errors.institusi ? "institusi-error" : undefined
                  }
                  aria-invalid={!!errors.institusi}
                  {...register("institusi")}
                />
                {errors.institusi ? (
                  <FieldError id="institusi-error">
                    {errors.institusi.message}
                  </FieldError>
                ) : null}
              </Field>

              {/* Status Akademika */}
              <Field className="gap-3">
                <FieldLabel>
                  Status Akademika <span aria-hidden="true">*</span>
                </FieldLabel>
                <Controller
                  name="status_akademika"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      {statusOptions.map((option) => (
                        <FieldLabel
                          key={option.id}
                          htmlFor={`status-${option.id}`}
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
                              id={`status-${option.id}`}
                              value={option.id}
                            />
                          </Field>
                        </FieldLabel>
                      ))}
                    </RadioGroup>
                  )}
                />
                {errors.status_akademika ? (
                  <FieldError>{errors.status_akademika.message}</FieldError>
                ) : null}
              </Field>

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
                    Verify certificate identity
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Your name and institution will be used for seminar records and
                    certificate preparation. Check spelling and capitalization
                    carefully.
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
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field className="gap-2">
                    <FieldLabel htmlFor="verify-nama">Nama Lengkap</FieldLabel>
                    <Input
                      id="verify-nama"
                      className="h-9 rounded-[8px]"
                      aria-invalid={!!errors.nama}
                      aria-describedby={errors.nama ? "verify-nama-error" : undefined}
                      {...register("nama")}
                    />
                    {errors.nama ? <FieldError id="verify-nama-error">{errors.nama.message}</FieldError> : null}
                  </Field>
                  <Field className="gap-2">
                    <FieldLabel htmlFor="verify-email">Email</FieldLabel>
                    <Input
                      id="verify-email"
                      type="email"
                      className="h-9 rounded-[8px]"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "verify-email-error" : undefined}
                      {...register("email")}
                    />
                    {errors.email ? <FieldError id="verify-email-error">{errors.email.message}</FieldError> : null}
                  </Field>
                  <Field className="gap-2">
                    <FieldLabel htmlFor="verify-telp">Nomor WhatsApp</FieldLabel>
                    <Input
                      id="verify-telp"
                      className="h-9 rounded-[8px]"
                      aria-invalid={!!errors.telp}
                      aria-describedby={errors.telp ? "verify-telp-error" : undefined}
                      {...register("telp")}
                    />
                    {errors.telp ? <FieldError id="verify-telp-error">{errors.telp.message}</FieldError> : null}
                  </Field>
                  <Field className="gap-2">
                    <FieldLabel htmlFor="verify-institusi">Asal Institusi</FieldLabel>
                    <Input
                      id="verify-institusi"
                      className="h-9 rounded-[8px]"
                      aria-invalid={!!errors.institusi}
                      aria-describedby={errors.institusi ? "verify-institusi-error" : undefined}
                      {...register("institusi")}
                    />
                    {errors.institusi ? <FieldError id="verify-institusi-error">{errors.institusi.message}</FieldError> : null}
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
                        const isValid = await trigger(["nama", "email", "telp", "institusi"]);
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
                    <dt className="text-muted-foreground">Nama Lengkap</dt>
                    <dd className="mt-1 font-medium">{watchedValues.nama}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="mt-1 break-all font-medium">
                      {watchedValues.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Nomor WhatsApp</dt>
                    <dd className="mt-1 font-medium">{watchedValues.telp}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Asal Institusi</dt>
                    <dd className="mt-1 font-medium">{watchedValues.institusi}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status Akademika</dt>
                    <dd className="mt-1 font-medium">{statusLabel}</dd>
                  </div>
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
                    aria-describedby={
                      errors.identity_confirmed
                        ? "identity-confirmed-error"
                        : undefined
                    }
                  />
                )}
              />
              <FieldContent>
                <FieldLabel htmlFor="identity-confirmed">
                  I confirm these details are correct for certificate records.
                </FieldLabel>
                <FieldDescription>
                  If the name or institution is misspelled here, the certificate
                  may use the same spelling.
                </FieldDescription>
              </FieldContent>
            </Field>

            {errors.identity_confirmed ? (
              <FieldError id="identity-confirmed-error">
                {errors.identity_confirmed.message}
              </FieldError>
            ) : null}
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
                {isSubmitting ? "Saving..." : "Confirm and get ticket"}
              </Button>
            </div>
          </FieldGroup>
        ) : null}

        {step === "ticket" ? (
          <FieldGroup className="gap-6">
            <section className="rounded-[8px] border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
                  <CheckCircle2 className="h-5 w-5 text-foreground" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold">
                    Your seminar ticket is ready
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Your Futura seminar registration is saved. Download your
                    ticket or keep the registration ID for check-in.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-[8px] border border-dashed border-border p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Futura Seminar
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                      {watchedValues.nama}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {watchedValues.institusi} / {statusLabel}
                    </p>
                  </div>
                  <div className="rounded-[8px] bg-muted p-3 text-sm">
                    <p className="text-muted-foreground">Ticket</p>
                    <p className="mt-1 font-mono text-xs font-medium">
                      {registrationId}
                    </p>
                  </div>
                </div>
                <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="mt-1 break-all font-medium">
                      {watchedValues.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">WhatsApp</dt>
                    <dd className="mt-1 font-medium">{watchedValues.telp}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Fee</dt>
                    <dd className="mt-1 font-medium">—</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="mt-1 font-medium">Registered</dd>
                  </div>
                </dl>
              </div>
            </section>

            <Button
              type="button"
              className="h-11 rounded-[8px]"
              onClick={downloadTicket}
            >
              <Download className="h-4 w-4" />
              Download ticket
            </Button>
          </FieldGroup>
        ) : null}
      </section>
    </>
  );
}
