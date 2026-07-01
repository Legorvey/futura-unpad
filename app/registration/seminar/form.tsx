"use client";

import { useRouter } from "next/navigation";

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
import StepProgress from "@/components/registration/step-progress";
import { useFormDraft } from "@/hooks/use-form-draft";
import {
  clientSeminarFormSchema,
  type ClientSeminarFormValues,
} from "@/lib/validation/seminar";
import { useRegistrationStep } from "@/hooks/use-registration-step";
import { seminarStatusOptions } from "../../../lib/seminar/seminar-options";
import {
  downloadSeminarTickets,
  type SeminarTicketRegistration,
} from "../../../lib/seminar/seminar-ticket-download";
import SeminarDetailsStep from "../../../components/registration/seminar/seminar-details-step";
import SeminarRegistrationOptionStep from "../../../components/registration/seminar/seminar-registration-option-step";
import SeminarTicketStep from "../../../components/registration/seminar/seminar-ticket-step";
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
    SeminarTicketRegistration[]
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
      setSubmitError(error instanceof Error ? error.message : "Registration failed. Please try again.");
      return null;
    });

    if (!responseData?.registration_id) {
      return;
    }

    setRegistrationId(responseData.registration_id);
    setAllRegistrations(responseData.registrations || []);
    setStep("ticket");
    setShowProfileDialog(true);
  });

  const downloadTicket = () =>
    downloadSeminarTickets({
      registrations: allRegistrations,
      registrationId,
      statusLabel,
      values: form.getValues(),
    });

  return (
    <>
      <AlertDialog
        open={!isLoading && !user && showAnonDialog}
        onOpenChange={setShowAnonDialog}
      >
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

      <AlertDialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registration Successful!</AlertDialogTitle>
            <AlertDialogDescription>
              {user ? "You can also view and download your ticket(s) at any time from your Profile page." : "If you create an account with this email later, you can view and download your ticket(s) at any time from your Profile page."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {user && (
              <AlertDialogCancel onClick={() => router.push("/profile")}>
                Go to Profile
              </AlertDialogCancel>
            )}
            <AlertDialogAction onClick={() => setShowProfileDialog(false)}>
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FormProvider {...form}>
        <section className="space-y-8">
          <StepProgress
            steps={steps}
            currentStep={step}
            ariaLabel="Seminar registration progress"
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
            <SeminarTicketStep
              registrations={allRegistrations}
              registrationId={registrationId}
              statusLabel={statusLabel}
              values={form.getValues()}
              onDownload={downloadTicket}
            />
          ) : null}
        </section>
      </FormProvider>
    </>
  );
}
