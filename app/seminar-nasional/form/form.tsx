"use client";

import { useRouter } from "nextjs-toploader/app";

import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useAuth } from "@/components/auth-provider";
import { useCreateSeminarRegistrationMutation } from "@/hooks/mutations/use-registration-mutations";
import { toast } from "sonner";
import StepProgress from "@/components/registration/step-progress";
import { useFormDraft } from "@/hooks/use-form-draft";
import {
  clientSeminarFormSchema,
  type ClientSeminarFormValues,
} from "@/lib/validation/seminar";
import { useRegistrationStep } from "@/hooks/use-registration-step";
import { seminarStatusOptions } from "../../../lib/seminar/seminar-options";
import SeminarDetailsStep from "../../../components/registration/seminar/seminar-details-step";
import SeminarRegistrationOptionStep from "../../../components/registration/seminar/seminar-registration-option-step";
import SeminarSuccessStep from "../../../components/registration/seminar/seminar-success-step";
import SeminarVerificationStep from "../../../components/registration/seminar/seminar-verification-step";

const SEMINAR_DRAFT_STORAGE_KEY = "futura:registration:seminar:draft";

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

  const form = useForm<ClientSeminarFormValues>({
    resolver: zodResolver(clientSeminarFormSchema),
    mode: "onChange",
    defaultValues: {
      registration_type: "individu",
      is_same_institution: true,
      nama: "",
      email: "",
      telp: "",
      institusi: "",
      status_akademika: "mahasiswa",
      identity_confirmed: false,
      members: [],
    },
  });
  useFormDraft({
    form,
    storageKey: SEMINAR_DRAFT_STORAGE_KEY,
  });
  const { getValues, handleSubmit, setValue, trigger } = form;

  const statusAkademika = useWatch({
    control: form.control,
    name: "status_akademika",
  });
  const statusLabel = useMemo(
    () =>
      seminarStatusOptions.find((o) => o.id === statusAkademika)
        ?.title ?? "-",
    [statusAkademika]
  );

  const hasPrefilled = useRef(false);

  // Pre-fill email from logged-in user
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
      setStep("details");
    }
  };

  const goToVerification = async (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    const isValid = await trigger(["nama", "email", "telp", "institusi", "status_akademika", "members"]);
    if (isValid) {
      setSubmitError("");
      setStep("verification");
    }
  };

  const submitRegistration = handleSubmit(async (data) => {
    setSubmitError("");

    const responseData = await createRegistration.mutateAsync({
        registration_type: data.registration_type === "grup" ? "group" : "individual",
        nama_lengkap: data.nama,
        email: data.email,
        no_telepon: data.telp,
        asal_institusi: data.institusi,
        status_akademika: data.status_akademika,
        identity_confirmed: true,
        group_name: data.registration_type === "grup" ? data.group_name : null,
        members: data.members?.map((m: { nama: string; institusi?: string }) => ({
          nama_lengkap: m.nama,
          asal_institusi: data.is_same_institution ? data.institusi : m.institusi
        })),
    }).catch((error) => {
      setSubmitError(error instanceof Error ? error.message : "Pendaftaran gagal. Silakan coba lagi.");
      toast.error("Pendaftaran gagal", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan tak terduga."
      });
      return null;
    });

    if (!responseData?.registration_id) {
      return;
    }

    setRegistrationId(responseData.registration_id);
    setAllRegistrations(responseData.registrations || []);
    setStep("ticket");
    setShowProfileDialog(true);
    toast.success("Pendaftaran berhasil!");
  });

  return (
    <>
      <AlertDialog
        open={!isLoading && !user && showAnonDialog}
        onOpenChange={setShowAnonDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Daftar sebagai Anonim?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda belum masuk. Apakah Anda ingin melanjutkan pendaftaran seminar sebagai pengguna anonim?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowAnonDialog(false)}>
              Lanjut Anonim
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/login?next=/seminar-nasional/form")}>
              Masuk
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pendaftaran Berhasil!</AlertDialogTitle>
            <AlertDialogDescription>
              {user ? "Anda juga dapat melihat pendaftaran Anda kapan saja dari halaman Profil Anda." : "Jika Anda membuat akun dengan email ini nanti, Anda dapat melihat pendaftaran Anda kapan saja dari halaman Profil Anda."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {user && (
              <AlertDialogCancel onClick={() => router.push("/profile")}>
                Ke Profil
              </AlertDialogCancel>
            )}
            <AlertDialogAction onClick={() => setShowProfileDialog(false)}>
              Mengerti
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FormProvider {...form}>
        <section className="space-y-8">
          <StepProgress
            steps={steps}
            currentStep={step}
            ariaLabel="Progres pendaftaran seminar"
          />

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
              onBack={() => setStep("details")}
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
      </FormProvider>
    </>
  );
}
