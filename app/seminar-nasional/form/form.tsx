"use client";

import { useRouter } from "nextjs-toploader/app";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PanelLeftOpen } from "lucide-react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { useCreateSeminarRegistrationMutation } from "@/hooks/mutations/use-registration-mutations";
import { clearFormDraft, useFormDraft } from "@/hooks/use-form-draft";
import { useRegistrationStep } from "@/hooks/use-registration-step";
import {
  clientSeminarFormSchema,
  type ClientSeminarFormValues,
} from "@/lib/validation/seminar";
import { seminarStatusOptions } from "@/lib/seminar/seminar-options";
import { SEMINAR_VERIFICATION_FIELDS } from "@/lib/seminar/seminar-verification-fields";
import SeminarDetailsStep from "@/components/registration/seminar/seminar-details-step";
import SeminarRegistrationOptionStep from "@/components/registration/seminar/seminar-registration-option-step";
import SeminarSuccessStep from "@/components/registration/seminar/seminar-success-step";
import SeminarVerificationStep from "@/components/registration/seminar/seminar-verification-step";
import SeminarFormSidebar from "./sidebar";

const SEMINAR_DRAFT_STORAGE_KEY = "futura:registration:seminar:draft";
const SEMINAR_DRAFT_OMITTED_FIELDS = [
  "identity_confirmed",
] as const satisfies readonly FieldPath<ClientSeminarFormValues>[];

function scrollToFormTop() {
  if (typeof window === "undefined") return;
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  window.scrollTo({
    top: 0,
    behavior: prefersReduced ? "auto" : "smooth",
  });
}

export default function SeminarRegistrationForm() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { step, setStep, steps } = useRegistrationStep("seminar");
  const createRegistration = useCreateSeminarRegistrationMutation();
  const [submitError, setSubmitError] = useState("");
  const [registrationId, setRegistrationId] = useState("");
  const [allRegistrations, setAllRegistrations] = useState<
    { id: string; nama_lengkap: string; asal_institusi: string }[]
  >([]);
  const [showAnonDialog, setShowAnonDialog] = useState(true);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const form = useForm<ClientSeminarFormValues>({
    resolver: zodResolver(clientSeminarFormSchema),
    mode: "onChange",
    defaultValues: {
      registration_type: "individu",
      is_same_institution: true,
      group_name: "",
      nama: "",
      email: "",
      telp: "",
      institusi: "",
      status_akademika: "mahasiswa",
      school_jenjang: "SMA",
      identity_confirmed: false,
      members: [],
    },
  });

  useFormDraft({
    form,
    storageKey: SEMINAR_DRAFT_STORAGE_KEY,
    omitFields: SEMINAR_DRAFT_OMITTED_FIELDS,
  });

  const { getValues, handleSubmit, setValue, trigger } = form;

  const statusAkademika = useWatch({
    control: form.control,
    name: "status_akademika",
  });
  const statusLabel = useMemo(
    () =>
      seminarStatusOptions.find((o) => o.id === statusAkademika)?.title ?? "-",
    [statusAkademika]
  );

  const activeStepIndex = Math.max(
    0,
    steps.findIndex((item) => item.id === step)
  );
  const activeStepLabel = steps[activeStepIndex]?.label ?? "Opsi Pendaftaran";

  const hasPrefilled = useRef(false);

  // Pre-fill email once from the signed-in account if no draft email exists.
  useEffect(() => {
    if (!user?.email || hasPrefilled.current) return;

    if (!getValues("email")) {
      setValue("email", user.email, { shouldValidate: false });
    }

    hasPrefilled.current = true;
  }, [getValues, user?.email, setValue]);

  const goToDetails = async (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    const isValid = await trigger(["registration_type"]);
    if (isValid) {
      const registrationType = getValues("registration_type");
      const currentMembers = getValues("members") ?? [];
      if (registrationType === "grup" && currentMembers.length === 0) {
        setValue("members", [{ nama: "", institusi: "" }]);
      } else if (registrationType === "individu" && currentMembers.length > 0) {
        setValue("members", []);
      }
      setStep("details");
      scrollToFormTop();
    }
  };

  const goToVerification = async (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    const isValid = await trigger(SEMINAR_VERIFICATION_FIELDS);
    if (isValid) {
      setSubmitError("");
      setStep("verification");
      scrollToFormTop();
    }
  };

  const submitRegistration = handleSubmit(async (data) => {
    setSubmitError("");

    const responseData = await createRegistration
      .mutateAsync({
        registration_type:
          data.registration_type === "grup" ? "group" : "individual",
        nama_lengkap: data.nama,
        email: data.email,
        no_telepon: data.telp,
        asal_institusi: data.institusi,
        status_akademika: data.status_akademika,
        identity_confirmed: true,
        group_name: data.registration_type === "grup" ? data.group_name : null,
        members:
          data.registration_type === "grup"
            ? data.members?.map((m: { nama: string; institusi?: string }) => ({
                nama_lengkap: m.nama,
                asal_institusi: data.is_same_institution
                  ? data.institusi
                  : m.institusi,
              }))
            : undefined,
      })
      .catch((error) => {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Pendaftaran gagal. Silakan coba lagi."
        );
        toast.error("Pendaftaran gagal", {
          description:
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan tak terduga.",
        });
        return null;
      });

    if (!responseData?.registration_id) {
      return;
    }

    clearFormDraft(SEMINAR_DRAFT_STORAGE_KEY);
    setRegistrationId(responseData.registration_id);
    setAllRegistrations(responseData.registrations || []);
    setStep("ticket");
    setShowProfileDialog(true);
    scrollToFormTop();
    toast.success("Pendaftaran berhasil!");
  });

  return (
    <>
      <AlertDialog
        open={!isLoading && !user && showAnonDialog}
        onOpenChange={setShowAnonDialog}
      >
        <AlertDialogContent className="seminar-wrapper bg-card text-card-foreground border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Masuk Terlebih Dahulu</AlertDialogTitle>
            <AlertDialogDescription>
              Anda belum masuk. Masuk ke akun Futura Anda agar pendaftaran seminar tersimpan di halaman Profil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="h-11 rounded-[8px]"
              onClick={() => setShowAnonDialog(false)}
            >
              Tutup
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-11 rounded-[8px]"
              onClick={() => router.push("/login?next=/seminar-nasional/form")}
            >
              Masuk
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <AlertDialogContent className="seminar-wrapper bg-card text-card-foreground border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Pendaftaran Berhasil</AlertDialogTitle>
            <AlertDialogDescription>
              {user
                ? "Tiket Seminar Nasional Anda sudah tersimpan. Anda dapat melihat detail pendaftaran kapan saja melalui halaman Profil."
                : "Pendaftaran Seminar Nasional Anda telah tersimpan. Anda dapat melihat detail pendaftaran kapan saja dari halaman Profil."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {user && (
              <AlertDialogCancel
                className="h-11 rounded-[8px]"
                onClick={() => router.push("/profile")}
              >
                Ke Profil
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              className="h-11 rounded-[8px]"
              onClick={() => setShowProfileDialog(false)}
            >
              Lihat Tiket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FormProvider {...form}>
        <div className="flex flex-col lg:flex-row items-stretch gap-0 relative lg:-mx-12 lg:-my-12 h-full rounded-[inherit] overflow-clip">
          <SeminarFormSidebar
            currentStep={step}
            steps={steps}
            isOpen={isSidebarOpen}
            onToggle={toggleSidebar}
          />

          <section className="flex-1 space-y-6 p-4 sm:p-8 lg:p-12 transition-all duration-300 min-w-0">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/80 px-4 py-2.5 lg:hidden">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Langkah {activeStepIndex + 1} dari {steps.length}
                </p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {activeStepLabel}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="min-h-11 rounded-[8px] shrink-0"
                onClick={toggleSidebar}
                aria-expanded={isSidebarOpen}
                aria-controls="seminar-sidebar-content"
              >
                <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
                <span>Panduan</span>
              </Button>
            </div>

            {step === "registration-option" ? (
              <SeminarRegistrationOptionStep onSubmit={goToDetails} />
            ) : null}

            {step === "details" ? (
              <SeminarDetailsStep
                isSubmitting={createRegistration.isPending}
                onSubmit={goToVerification}
                onBack={() => {
                  setSubmitError("");
                  setStep("registration-option");
                  scrollToFormTop();
                }}
              />
            ) : null}

            {step === "verification" ? (
              <SeminarVerificationStep
                isSubmitting={createRegistration.isPending}
                statusLabel={statusLabel}
                submitError={submitError}
                submitRegistration={submitRegistration}
                onClearSubmitError={() => setSubmitError("")}
                onBack={() => {
                  setStep("details");
                  scrollToFormTop();
                }}
              />
            ) : null}

            {step === "ticket" ? (
              <SeminarSuccessStep
                registrations={allRegistrations}
                registrationId={registrationId}
                statusLabel={statusLabel}
                values={form.getValues()}
              />
            ) : null}
          </section>
        </div>
      </FormProvider>
    </>
  );
}
