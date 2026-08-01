"use client";

import type { BaseSyntheticEvent } from "react";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import type { FieldPath } from "react-hook-form";
import { FormProvider, useForm } from "react-hook-form";

import MechaturaIdentityStep from "@/components/registration/mechatura/mechatura-identity-step";
import { clearFormDraft, useFormDraft } from "@/hooks/use-form-draft";
import { useCreateMechaturaRegistrationMutation } from "@/hooks/mutations/use-registration-mutations";
import { toast } from "sonner";
import { useRegistrationStep } from "@/hooks/use-registration-step";
import { ApiError } from "@/lib/query/fetch-json";
import { toInternalAppHref } from "@/lib/navigation";
import {
  createMechaturaSchema,
  MECHATURA_ATTACHMENT_FIELDS,
  MECHATURA_COMPETITION_FIELDS,
  MECHATURA_IDENTITY_FIELDS,
  MECHATURA_VERIFICATION_FIELDS,
  mechaturaIdentitySchema,
  type MechaturaFormValues,
} from "@/lib/validation/mechatura";
import KategoriLomba from "./kategori-lomba";
import MechaturaLampiranStep from "@/components/registration/mechatura/mechatura-lampiran-step";
import MechaturaVerificationStep from "@/components/registration/mechatura/mechatura-verification-step";
import MechaturaFormSidebar from "./sidebar";

const MECHATURA_DOCUMENT_MAX_SIZE_IN_BYTES = 2 * 1024 * 1024;
const MECHATURA_DRAFT_STORAGE_KEY = "futura:registration:mechatura:draft";

const mechaturaSchema = createMechaturaSchema({
  documentMaxSizeInBytes: MECHATURA_DOCUMENT_MAX_SIZE_IN_BYTES,
});

const mechaturaIdentityFields =
  MECHATURA_IDENTITY_FIELDS as FieldPath<MechaturaFormValues>[];
const mechaturaAttachmentFields =
  MECHATURA_ATTACHMENT_FIELDS as FieldPath<MechaturaFormValues>[];
const mechaturaCompetitionFields =
  MECHATURA_COMPETITION_FIELDS as FieldPath<MechaturaFormValues>[];
const mechaturaVerificationFields =
  MECHATURA_VERIFICATION_FIELDS as FieldPath<MechaturaFormValues>[];
const mechaturaDraftOmittedFields = [
  "member_document",
  "robot_document",
] as const satisfies readonly FieldPath<MechaturaFormValues>[];

export default function MechaturaRegistrationForm() {
  const router = useRouter();
  const { step, setStep, steps } = useRegistrationStep("mechatura");
  const createRegistration = useCreateMechaturaRegistrationMutation();
  const [submitError, setSubmitError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);
  const form = useForm<MechaturaFormValues>({
    resolver: zodResolver(mechaturaSchema),
    mode: "onChange",
    defaultValues: {
      team_name: "",
      competition_type: "sumo",
      institution: "",
      province: "",
      leader_name: "",
      leader_email: "",
      leader_phone: "",
      member_count: 0,
      member2_name: "",
      member2_email: "",
      member2_phone: "",
      member3_name: "",
      member3_email: "",
      member3_phone: "",
      has_coach: false,
      coach_name: "",
      coach_email: "",
      coach_phone: "",
      robot_name: "",
      identity_confirmed: false,
    },
  });
  useFormDraft({
    form,
    storageKey: MECHATURA_DRAFT_STORAGE_KEY,
    omitFields: mechaturaDraftOmittedFields,
  });

  const validateIdentityStep = () => {
    form.clearErrors(mechaturaIdentityFields);

    const result = mechaturaIdentitySchema.safeParse(form.getValues());

    if (result.success) {
      return true;
    }

    for (const issue of result.error.issues) {
      const field = issue.path[0];

      if (typeof field !== "string") {
        continue;
      }

      form.setError(field as FieldPath<MechaturaFormValues>, {
        type: "manual",
        message: issue.message,
      });
    }

    return false;
  };

  const goToIdentity = async () => {
    const isValid = await form.trigger(mechaturaCompetitionFields);

    if (isValid) {
      setStep("identitas");
    }
  };

  const goToLampiran = async (event?: BaseSyntheticEvent) => {
    event?.preventDefault();

    if (validateIdentityStep()) {
      setStep("lampiran");
    }
  };

  const goToVerification = async (event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    const isValid = await form.trigger(mechaturaAttachmentFields);
    
    if (isValid) {
      setStep("verifikasi");
    }
  };

  const submitVerification = async () => {
    const isValid = await form.trigger(mechaturaVerificationFields);

    if (!isValid) {
      return;
    }

    const values = form.getValues();
    const formData = new FormData();
    const memberDocument = values.member_document?.[0];
    const robotDocument = values.robot_document?.[0];

    for (const field of mechaturaVerificationFields) {
      const value = values[field];

      if (field === "member_document" || field === "robot_document") {
        continue;
      }

      formData.append(field, String(value ?? ""));
    }

    if (memberDocument) {
      formData.append("member_document", memberDocument);
    }

    if (robotDocument) {
      formData.append("robot_document", robotDocument);
    }

    setSubmitError("");

    const data = await createRegistration.mutateAsync(formData).catch((error) => {
      if (error instanceof ApiError) {
        const body = error.body;

        if (
          body &&
          typeof body === "object" &&
          "payment_url" in body &&
          typeof body.payment_url === "string"
        ) {
          return { payment_url: body.payment_url, isExisting: error.status === 409 };
        }

        if (error.status === 401) {
          router.push("/login?next=/mechatura/form");
          return null;
        }
      }

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Pendaftaran gagal. Silakan periksa data Anda dan coba lagi."
      );
      toast.error("Pendaftaran gagal", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan yang tidak terduga."
      });
      return null;
    });

    if (data?.payment_url) {
      if ("isExisting" in data && data.isExisting) {
        toast.info("Pendaftaran aktif ditemukan", {
          description: "Mengarahkan Anda ke halaman pembayaran...",
        });
      } else {
        toast.success("Pendaftaran berhasil", {
          description: "Mengarahkan ke pembayaran...",
        });
      }
      clearFormDraft(MECHATURA_DRAFT_STORAGE_KEY);

      const appHref = toInternalAppHref(data.payment_url, window.location.origin);

      if (appHref) {
        router.push(appHref);
        return;
      }

      window.location.assign(data.payment_url);
    }
  };

  return (
    <FormProvider {...form}>
      <div className="flex flex-col lg:flex-row items-stretch gap-0 relative lg:-mx-12 lg:-my-12 h-full rounded-[inherit] overflow-clip">
        <MechaturaFormSidebar 
          currentStep={step} 
          steps={steps} 
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <section className="flex-1 space-y-6 p-4 sm:p-8 lg:p-12 transition-all duration-300 min-w-0">
          {step === "tipe-robot" ? (
            <KategoriLomba onContinue={goToIdentity} />
          ) : null}

          {step === "identitas" ? (
            <MechaturaIdentityStep
              isSubmitting={form.formState.isSubmitting}
              onSubmit={goToLampiran}
              onBack={() => setStep("tipe-robot")}
            />
          ) : null}

          {step === "lampiran" ? (
            <MechaturaLampiranStep
              documentMaxSizeInBytes={MECHATURA_DOCUMENT_MAX_SIZE_IN_BYTES}
              onBack={() => setStep("identitas")}
              onSubmit={goToVerification}
            />
          ) : null}

          {step === "verifikasi" ? (
            <MechaturaVerificationStep
              documentMaxSizeInBytes={MECHATURA_DOCUMENT_MAX_SIZE_IN_BYTES}
              isSubmitting={createRegistration.isPending}
              onBack={() => setStep("lampiran")}
              onSubmit={submitVerification}
              submitError={submitError}
            />
          ) : null}
        </section>
      </div>
    </FormProvider>
  );
}
