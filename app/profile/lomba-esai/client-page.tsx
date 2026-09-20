"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, CheckCircle2, FileText, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { updateEsaiRegistration } from "@/lib/essay/actions";

import { Button } from "@/components/ui/button";
import { FormTextField } from "@/components/form/form-text-field";
import MechaturaProfileSidebar from "../mechatura/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SchoolCombobox,
  PlainInstitutionInput,
  INSTITUTION_TYPE_OPTIONS,
  SEARCHABLE_TYPES,
  type InstitutionType,
} from "@/components/school-combobox";

const MAX_GENERAL_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const MAX_ESSAY_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const ALLOWED_PDF_TYPE = ["application/pdf"];

const IdentitySchema = z.object({
  full_name: z.string().trim().min(2, "Nama lengkap minimal 2 karakter"),
  institution_category: z.string().optional(),
  institution: z.string().trim().min(3, "Nama institusi minimal 3 karakter").max(255, "Nama institusi terlalu panjang"),
  city: z.string().trim().min(2, "Kota minimal 2 karakter"),
  phone_number: z.string().trim().min(10, "Nomor telepon minimal 10 digit").max(15, "Nomor telepon maksimal 15 digit"),
  instagram_twibbon_url: z.string().trim().url("Link post Instagram Twibbon tidak valid").optional().or(z.literal("")),
  identity_card_url: z.string().trim().url("Link Google Drive tidak valid")
});
type IdentityValues = z.infer<typeof IdentitySchema>;

const DocsSchema = z.object({
  twibbon: z.any().optional(),
  ktm: z.any().optional(),
  essay: z.any().optional(),
}).superRefine((val, ctx) => {
  if (val.twibbon && val.twibbon.length > 0) {
    const file = val.twibbon[0];
    if (file.size > MAX_GENERAL_FILE_SIZE) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Twibbon maksimal 3MB", path: ["twibbon"] });
    }
    if (![...ALLOWED_IMAGE_TYPES, ...ALLOWED_PDF_TYPE].includes(file.type)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Format tidak didukung", path: ["twibbon"] });
    }
  }
  if (val.ktm && val.ktm.length > 0) {
    const file = val.ktm[0];
    if (file.size > MAX_GENERAL_FILE_SIZE) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "KTM maksimal 3MB", path: ["ktm"] });
    }
    if (![...ALLOWED_IMAGE_TYPES, ...ALLOWED_PDF_TYPE].includes(file.type)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Format tidak didukung", path: ["ktm"] });
    }
  }
  if (val.essay && val.essay.length > 0) {
    const file = val.essay[0];
    if (file.size > MAX_ESSAY_FILE_SIZE) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Esai maksimal 2MB", path: ["essay"] });
    }
    if (!ALLOWED_PDF_TYPE.includes(file.type)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Hanya PDF yang didukung", path: ["essay"] });
    }
  }
});
type DocsValues = z.infer<typeof DocsSchema>;

const PaymentSchema = z.object({
  payment: z.any().optional(),
}).superRefine((val, ctx) => {
  if (val.payment && val.payment.length > 0) {
    const file = val.payment[0];
    if (file.size > MAX_GENERAL_FILE_SIZE) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bukti pembayaran maksimal 3MB", path: ["payment"] });
    }
    if (![...ALLOWED_IMAGE_TYPES, ...ALLOWED_PDF_TYPE].includes(file.type)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Format tidak didukung", path: ["payment"] });
    }
  }
});
type PaymentValues = z.infer<typeof PaymentSchema>;

function UploadedFileDisplay({ path, onRemove }: { path: string | null; onRemove?: () => void }) {
  if (!path) return null;
  const rawFileName = path.split('/').pop() || "file_terunggah";
  const fileName = decodeURIComponent(rawFileName);
  return (
    <div className="flex items-center gap-3 p-3 rounded-md border bg-muted/30 text-muted-foreground mb-3 shadow-sm">
      <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
      <div className="flex flex-col min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate" title={fileName}>{fileName}</p>
      </div>
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-1.5" />
          Ganti
        </Button>
      )}
    </div>
  );
}

export function LombaEsaiClient({
  registration,
  userName,
  userEmail,
}: {
  registration: any;
  userName: string | null;
  userEmail: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isSubmitted = registration.submission_status === "submitted" || registration.submission_status === "approved";

  const [isSavingIdentity, setIsSavingIdentity] = useState(false);
  const [isSavingDocs, setIsSavingDocs] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [institutionType, setInstitutionType] = useState<InstitutionType>(
    (registration.institution_category as InstitutionType) || "SD"
  );

  const identityForm = useForm<IdentityValues>({
    resolver: zodResolver(IdentitySchema),
    mode: "onChange",
    defaultValues: {
      full_name: registration.full_name || userName || "",
      institution_category: registration.institution_category || "SD",
      institution: registration.institution || "",
      city: registration.city || "",
      phone_number: registration.phone_number || "",
      instagram_twibbon_url: registration.instagram_twibbon_url || "",
      identity_card_url: registration.identity_card_url || "",
    }
  });

  const docsForm = useForm<DocsValues>({
    resolver: zodResolver(DocsSchema),
    mode: "onChange"
  });

  const paymentForm = useForm<PaymentValues>({
    resolver: zodResolver(PaymentSchema),
    mode: "onChange"
  });

  const { isValid: isIdentityValid } = identityForm.formState;
  const isIdentityComplete = Boolean(
    registration.full_name &&
    registration.institution &&
    registration.city &&
    registration.phone_number &&
    registration.identity_card_url &&
    registration.instagram_twibbon_url
  );

  const essayWatch = docsForm.watch("essay");
  const twibbonWatch = docsForm.watch("twibbon");
  const ktmWatch = docsForm.watch("ktm");

  const isDocsComplete = Boolean(registration.essay_paper_url);

  const isDocsValid = docsForm.formState.isValid && (Boolean(essayWatch?.length > 0) || Boolean(twibbonWatch?.length > 0) || Boolean(ktmWatch?.length > 0));

  const paymentWatch = paymentForm.watch("payment");
  const isPaymentComplete = Boolean(registration.payment_proof_url);
  const isPaymentValid = paymentForm.formState.isValid && Boolean(paymentWatch?.length > 0);

  const canSubmitFinal = isIdentityComplete && isDocsComplete && isPaymentComplete;

  const handleFileUpload = async (file: File, path: string) => {
    const { error } = await supabase.storage.from("esai_documents").upload(path, file, { upsert: true });
    if (error) throw error;
    return path;
  };

  const handleRemoveFile = async (field: string) => {
    try {
      const res = await updateEsaiRegistration(registration.id, { [field]: null });
      if (!res.success) throw new Error(res.error || "Gagal menghapus file.");
      toast.success("File berhasil dihapus. Silakan unggah yang baru.");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) { toast.error(err.message); } else { toast.error("Terjadi kesalahan."); }
    }
  };

  const onSaveIdentity = async (values: IdentityValues) => {
    setIsSavingIdentity(true);
    try {
      const res = await updateEsaiRegistration(registration.id, values);
      if (!res.success) throw new Error(res.error || "Gagal menyimpan data.");
      toast.success("Data diri berhasil disimpan!");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) { toast.error(err.message); } else { toast.error("Terjadi kesalahan."); }
    } finally {
      setIsSavingIdentity(false);
    }
  };

  const onSaveDocs = async (values: DocsValues) => {
    setIsSavingDocs(true);
    try {
      const essayFile = values.essay?.[0];
      const twibbonFile = values.twibbon?.[0];
      const ktmFile = values.ktm?.[0];

      const userId = registration.user_id;
      const uploadPromises: Promise<string | null | undefined>[] = [];

      let twibbonUrlPromise = Promise.resolve(registration.instagram_twibbon_url);
      if (twibbonFile) twibbonUrlPromise = handleFileUpload(twibbonFile, `${userId}/${twibbonFile.name}`);
      uploadPromises.push(twibbonUrlPromise);

      let ktmUrlPromise = Promise.resolve(registration.identity_card_url);
      if (ktmFile) ktmUrlPromise = handleFileUpload(ktmFile, `${userId}/${ktmFile.name}`);
      uploadPromises.push(ktmUrlPromise);

      let essayUrlPromise = Promise.resolve(registration.essay_paper_url);
      if (essayFile) essayUrlPromise = handleFileUpload(essayFile, `${userId}/${essayFile.name}`);
      uploadPromises.push(essayUrlPromise);

      const [twibbonUrl, ktmUrl, essayUrl] = await Promise.all(uploadPromises);

      const submitValues = {
        instagram_twibbon_url: twibbonUrl,
        identity_card_url: ktmUrl,
        essay_paper_url: essayUrl,
      };

      const res = await updateEsaiRegistration(registration.id, submitValues);
      if (!res.success) throw new Error(res.error || "Gagal menyimpan dokumen.");

      docsForm.reset();
      toast.success("Dokumen berhasil disimpan!");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) { toast.error(err.message); } else { toast.error("Terjadi kesalahan."); }
    } finally {
      setIsSavingDocs(false);
    }
  };

  const onSavePayment = async (values: PaymentValues) => {
    setIsSavingPayment(true);
    try {
      const paymentFile = values.payment?.[0];
      const userId = registration.user_id;

      let paymentUrl = registration.payment_proof_url;
      if (paymentFile) {
        paymentUrl = await handleFileUpload(paymentFile, `${userId}/${paymentFile.name}`);
      }

      const submitValues = { payment_proof_url: paymentUrl };

      const res = await updateEsaiRegistration(registration.id, submitValues);
      if (!res.success) throw new Error(res.error || "Gagal menyimpan pembayaran.");

      paymentForm.reset();
      toast.success("Bukti pembayaran berhasil disimpan!");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) { toast.error(err.message); } else { toast.error("Terjadi kesalahan."); }
    } finally {
      setIsSavingPayment(false);
    }
  };

  const onFinalSubmit = async () => {
    setIsSubmittingFinal(true);
    try {
      if (!canSubmitFinal) {
        throw new Error("Mohon lengkapi dan simpan Data Diri, Dokumen, serta Bukti Pembayaran terlebih dahulu.");
      }

      const res = await updateEsaiRegistration(registration.id, { submission_status: "submitted" });
      if (!res.success) throw new Error(res.error || "Gagal mensubmit pendaftaran.");

      toast.success("Pendaftaran berhasil disubmit secara final!");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) { toast.error(err.message); } else { toast.error("Terjadi kesalahan."); }
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  const displayName = registration.full_name || userName || registration.email || userEmail || "Peserta Esai";

  return (
    <div className="flex flex-col lg:flex-row items-stretch gap-0 relative lg:-mx-8 lg:-my-8 h-full rounded-[inherit]">
      <MechaturaProfileSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <div className="p-5 md:p-6 rounded-2xl bg-card border border-border space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              Pembayaran Pendaftaran
            </h3>
          </div>

          <div className="flex flex-col items-center justify-center w-full max-w-[240px] mx-auto mb-6">
            <Image
              src="/qris-mechatura.jpeg"
              alt="QRIS Pembayaran Lomba Esai"
              width={240}
              height={240}
              className="w-full h-auto object-contain mix-blend-multiply dark:mix-blend-normal"
            />
          </div>

          <FormProvider {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(onSavePayment)} className="space-y-4">
              <div className="space-y-2 p-4 border rounded-xl bg-muted/30">
                <UploadedFileDisplay path={registration.payment_proof_url} onRemove={!isSubmitted ? () => handleRemoveFile('payment_proof_url') : undefined} />
                {!isSubmitted && !registration.payment_proof_url && (
                  <FormTextField
                    type="file"
                    name="payment"
                    label="Unggah Bukti Pembayaran"
                    accept="image/jpeg, image/png, application/pdf"
                    disabled={isSavingPayment || isSubmittingFinal}
                    description="Maksimal 3MB (JPG, PNG, PDF)"
                  />
                )}
              </div>
              {!isSubmitted && (
                <Button type="submit" disabled={isSavingPayment || !isPaymentValid} className="w-full">
                  {isSavingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Bukti
                </Button>
              )}
            </form>
          </FormProvider>
        </div>
      </MechaturaProfileSidebar>

      <section className="flex-1 space-y-6 p-6 sm:p-8 lg:p-10 transition-all duration-300 min-w-0 bg-background/50 rounded-2xl lg:rounded-l-none lg:rounded-r-2xl">

        <div className="p-5 md:p-6 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">{displayName}</h2>
              {isSubmitted ? (
                <span className="text-[11px] font-semibold tracking-wide uppercase text-green-500">
                  ● SUBMITTED
                </span>
              ) : (
                <span className="text-[11px] font-semibold tracking-wide uppercase text-muted-foreground">
                  ● DRAFT
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Data Diri Section */}
        <div className="space-y-6 p-5 md:p-6 rounded-2xl bg-card border border-border">
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-medium text-foreground flex items-center gap-2">Data Diri</h3>
              <div className="text-sm text-muted-foreground mt-2 space-y-3">
                <p>Lengkapi informasi pribadi Anda untuk keperluan pendaftaran.</p>
                <ul className="list-none space-y-2 text-xs opacity-90 border-l-2 border-primary/20 pl-3">
                  <li>
                    <span className="font-medium text-foreground">Student ID / Identitas:</span><br />
                    Wajib mengunggah KTM (mahasiswa), Kartu Pelajar, atau KTP/identitas resmi via Google Drive.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Twibbon:</span><br />
                    Wajib mengunggah twibbon di Instagram publik & follow <a href="https://instagram.com/futuraunpad.hmte" target="_blank" rel="noreferrer" className="text-primary hover:underline">@futuraunpad.hmte</a>
                  </li>
                </ul>
              </div>
            </div>

            <FormProvider {...identityForm}>
              <form onSubmit={identityForm.handleSubmit(onSaveIdentity)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormTextField name="full_name" label="Nama Lengkap" disabled={isSubmitted} />

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium leading-snug">
                      Jenjang / Kategori Institusi
                    </label>
                    <Select
                      value={institutionType}
                      onValueChange={(v) => {
                        setInstitutionType(v as InstitutionType);
                        identityForm.setValue("institution_category", v, { shouldValidate: true });
                        identityForm.setValue("institution", "");
                      }}
                      disabled={isSubmitted}
                    >
                      <SelectTrigger className="h-11 data-[size=default]:h-11 w-full rounded-[8px] bg-slate-100/50 dark:bg-input/30">
                        <SelectValue placeholder="Pilih jenjang..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-white dark:text-slate-900">
                        {INSTITUTION_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="font-medium">{opt.label}</span>
                            <span className="ml-1.5 text-muted-foreground text-xs">
                              — {opt.sublabel}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="institution" className="text-sm font-medium leading-snug">
                    Institusi / Asal Sekolah
                  </label>
                  {SEARCHABLE_TYPES.includes(institutionType) ? (
                    <SchoolCombobox
                      id="institution"
                      value={identityForm.watch("institution")}
                      onChange={(v) => identityForm.setValue("institution", v, { shouldValidate: true })}
                      institutionType={institutionType}
                      disabled={isSubmitted}
                      aria-invalid={!!identityForm.formState.errors.institution}
                      aria-describedby={identityForm.formState.errors.institution ? "institution-error" : undefined}
                    />
                  ) : institutionType === "perguruan_tinggi" ? (
                    <PlainInstitutionInput
                      id="institution"
                      value={identityForm.watch("institution")}
                      onChange={(v) => identityForm.setValue("institution", v, { shouldValidate: true })}
                      disabled={isSubmitted}
                      placeholder="Tulis nama lengkap universitas (Contoh: Universitas Padjadjaran, bukan UNPAD)"
                      aria-invalid={!!identityForm.formState.errors.institution}
                      aria-describedby={identityForm.formState.errors.institution ? "institution-error" : undefined}
                    />
                  ) : (
                    <PlainInstitutionInput
                      id="institution"
                      value={identityForm.watch("institution")}
                      onChange={(v) => identityForm.setValue("institution", v, { shouldValidate: true })}
                      disabled={isSubmitted}
                      placeholder="Nama instansi / komunitas / ketik 'Individu'"
                      aria-invalid={!!identityForm.formState.errors.institution}
                      aria-describedby={identityForm.formState.errors.institution ? "institution-error" : undefined}
                    />
                  )}
                  {identityForm.formState.errors.institution && (
                    <div role="alert" id="institution-error" className="flex items-start gap-1.5 text-sm font-normal text-destructive">
                      <span>{String(identityForm.formState.errors.institution.message)}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormTextField name="city" label="Kota" disabled={isSubmitted} />
                  <FormTextField name="phone_number" label="Nomor WhatsApp" disabled={isSubmitted} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormTextField name="instagram_twibbon_url" label="Link Post Instagram (Twibbon)" type="url" disabled={isSubmitted} />
                  <FormTextField name="identity_card_url" label="Identitas/KTM (Link Google Drive)" type="url" disabled={isSubmitted} />
                </div>
                {!isSubmitted && (
                  <Button type="submit" disabled={isSavingIdentity || !isIdentityValid} className="mt-2">
                    {isSavingIdentity && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Data Diri
                  </Button>
                )}
              </form>
            </FormProvider>
          </div>
        </div>

        {/* Dokumen Section */}
        <div className="space-y-6 p-5 md:p-6 rounded-2xl bg-card border border-border">
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-medium text-foreground flex items-center gap-2">Karya Esai</h3>
              <div className="text-sm text-muted-foreground mt-2 space-y-3">
                <p>Unggah Karya Esai Anda.</p>
              </div>
            </div>

            <FormProvider {...docsForm}>
              <form onSubmit={docsForm.handleSubmit(onSaveDocs)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Twibbon Upload */}
                  <div className="space-y-2 p-4 border rounded-xl bg-muted/30">
                    <UploadedFileDisplay path={registration.instagram_twibbon_url} onRemove={!isSubmitted ? () => handleRemoveFile('instagram_twibbon_url') : undefined} />
                    {!isSubmitted && !registration.instagram_twibbon_url && (
                      <FormTextField
                        type="file"
                        name="twibbon"
                        label="Bukti Twibbon & Follow Instagram"
                        accept="image/jpeg, image/png, application/pdf"
                        disabled={isSavingDocs}
                        description="Maksimal 3MB (JPG, PNG, PDF)"
                      />
                    )}
                  </div>

                  {/* KTM Upload */}
                  <div className="space-y-2 p-4 border rounded-xl bg-muted/30">
                    <UploadedFileDisplay path={registration.identity_card_url} onRemove={!isSubmitted ? () => handleRemoveFile('identity_card_url') : undefined} />
                    {!isSubmitted && !registration.identity_card_url && (
                      <FormTextField
                        type="file"
                        name="ktm"
                        label="KTM / Kartu Pelajar"
                        accept="image/jpeg, image/png, application/pdf"
                        disabled={isSavingDocs}
                        description="Maksimal 3MB (JPG, PNG, PDF)"
                      />
                    )}
                  </div>

                  {/* Essay Paper Upload */}
                  <div className="space-y-2 p-4 border rounded-xl bg-muted/30 md:col-span-2">
                    <UploadedFileDisplay path={registration.essay_paper_url} onRemove={!isSubmitted ? () => handleRemoveFile('essay_paper_url') : undefined} />
                    {!isSubmitted && !registration.essay_paper_url && (
                      <FormTextField
                        type="file"
                        name="essay"
                        label="File Karya Esai"
                        accept="application/pdf"
                        disabled={isSavingDocs}
                        description="Maksimal 2MB (Hanya PDF)"
                      />
                    )}
                  </div>
                </div>

                {!isSubmitted && (
                  <Button type="submit" disabled={isSavingDocs || !isDocsValid} className="mt-6">
                    {isSavingDocs && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Dokumen
                  </Button>
                )}
              </form>
            </FormProvider>
          </div>
        </div>

        {/* Finalize Section */}
        <div className="p-5 md:p-6 rounded-2xl bg-card border border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium text-foreground">Finalisasi Pendaftaran</h3>
              <p className="text-sm text-muted-foreground mt-1">Pastikan seluruh data dan dokumen sudah tersimpan. Data yang disubmit tidak dapat diubah kembali.</p>
            </div>
            {!isSubmitted ? (
              <Button type="button" onClick={onFinalSubmit} disabled={isSubmittingFinal || !canSubmitFinal} className="w-full md:w-auto">
                {isSubmittingFinal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Final
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-lg font-medium text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Pendaftaran Selesai
              </div>
            )}
          </div>
        </div>

      </section>
    </div>
  );
}
