"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, CheckCircle2, FileText, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { updateEsaiRegistration, removeEsaiFile } from "@/lib/essay/actions";
import { IdentitySchema, DocsSchema, PaymentSchema, type IdentityValues, type DocsValues, type PaymentValues } from "@/lib/validation/esai";

import { Button } from "@/components/ui/button";
import { FormTextField } from "@/components/form/form-text-field";
import { FormFileField } from "@/components/form/form-file-field";
import MechaturaProfileSidebar from "../mechatura/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  SchoolCombobox,
  PlainInstitutionInput,
  INSTITUTION_TYPE_OPTIONS,
  SEARCHABLE_TYPES,
  type InstitutionType,
} from "@/components/school-combobox";

function UploadedFileDisplay({ path, onRemove, label, description }: { path: string | null; onRemove?: () => void; label?: string; description?: string }) {
  if (!path) return null;
  const rawFileName = path.split('/').pop() || "file_terunggah";
  const fileName = decodeURIComponent(rawFileName).replace(/^(twibbon|ktm|essay|payment)_\d+_/, '');
  return (
    <div className="flex flex-col gap-2 w-full mb-1">
      {label && <label className="text-sm font-medium leading-none">{label}</label>}
      <div className="flex items-center gap-3 p-3 rounded-md border bg-muted/30 text-muted-foreground shadow-sm">
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
      {description && <p className="text-[0.8rem] text-muted-foreground">{description}</p>}
    </div>
  );
}

function LocalImagePreview({ fileList }: { fileList?: any }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!fileList || fileList.length === 0) {
      setPreviewUrl(null);
      return;
    }
    const file = fileList[0] as File;
    if (!file.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [fileList]);

  if (!previewUrl) return null;
  return (
    <div className="mt-3 relative w-full flex justify-center rounded-lg overflow-hidden border border-border bg-muted/30 p-2">
      <img src={previewUrl} className="max-w-full max-h-48 object-contain rounded-md" alt="Preview" />
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
  const initialInstitutionType = (registration.institution_category && ["SMA", "SMK", "perguruan_tinggi"].includes(registration.institution_category))
    ? registration.institution_category as InstitutionType
    : "SMA";
  const [institutionType, setInstitutionType] = useState<InstitutionType>(initialInstitutionType);

  const identityForm = useForm<IdentityValues>({
    resolver: zodResolver(IdentitySchema),
    mode: "onChange",
    defaultValues: {
      full_name: registration.full_name || userName || "",
      institution_category: initialInstitutionType,
      institution: registration.institution || "",
      city: registration.city || "",
      phone_number: registration.phone_number || "",
    }
  });

  const isTwibbonOpen = new Date() >= new Date("2026-10-05T00:00:00+07:00");

  const docsForm = useForm<DocsValues>({
    resolver: zodResolver(DocsSchema),
    mode: "onChange"
  });

  const paymentForm = useForm<PaymentValues>({
    resolver: zodResolver(PaymentSchema),
    mode: "onChange"
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSubmitted) return;
      if (identityForm.formState.isDirty || docsForm.formState.isDirty || paymentForm.formState.isDirty) {
        e.preventDefault();
        e.returnValue = "Anda memiliki perubahan yang belum disimpan. Yakin ingin meninggalkan halaman ini?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [identityForm.formState.isDirty, docsForm.formState.isDirty, paymentForm.formState.isDirty, isSubmitted]);

  const { isValid: isIdentityValid } = identityForm.formState;
  const isIdentityComplete = Boolean(
    registration.full_name &&
    registration.institution &&
    registration.city &&
    registration.phone_number &&
    registration.identity_card_url &&
    (!isTwibbonOpen || registration.instagram_twibbon_url)
  );

  const twibbonWatch = identityForm.watch("twibbon");
  const ktmWatch = identityForm.watch("ktm");
  const essayWatch = docsForm.watch("essay");

  const isDocsComplete = Boolean(
    registration.essay_paper_url
  );

  const isDocsValid = docsForm.formState.isValid && Boolean(essayWatch?.length > 0);

  const paymentWatch = paymentForm.watch("payment");
  const isPaymentComplete = Boolean(registration.payment_proof_url);
  const isPaymentValid = paymentForm.formState.isValid && Boolean(paymentWatch?.length > 0);

  const canSubmitFinal = isIdentityComplete && isDocsComplete && isPaymentComplete;

  const handleFileUpload = async (file: File, path: string) => {
    const { error } = await supabase.storage.from("esai_documents").upload(path, file, { upsert: true });
    if (error) throw error;
    return path;
  };

  const handleRemoveFile = async (field: "instagram_twibbon_url" | "identity_card_url" | "essay_paper_url" | "payment_proof_url") => {
    try {
      const res = await removeEsaiFile(registration.id, field);
      if (!res.success) throw new Error(res.error || "Gagal menghapus file.");

      toast.success("File berhasil dihapus. Silakan unggah yang baru.");
    } catch (err: unknown) {
      if (err instanceof Error) { toast.error(err.message); } else { toast.error("Terjadi kesalahan."); }
    }
  };

  const onSaveIdentity = async (values: IdentityValues) => {
    setIsSavingIdentity(true);
    try {
      const twibbonFile = values.twibbon?.[0];
      const ktmFile = values.ktm?.[0];
      const userId = registration.user_id;

      const uploadPromises: Promise<string | null | undefined>[] = [];

      let twibbonUrlPromise = Promise.resolve(registration.instagram_twibbon_url);
      if (twibbonFile) twibbonUrlPromise = handleFileUpload(twibbonFile, `${userId}/twibbon_${Date.now()}_${twibbonFile.name}`);
      uploadPromises.push(twibbonUrlPromise);

      let ktmUrlPromise = Promise.resolve(registration.identity_card_url);
      if (ktmFile) ktmUrlPromise = handleFileUpload(ktmFile, `${userId}/ktm_${Date.now()}_${ktmFile.name}`);
      uploadPromises.push(ktmUrlPromise);

      const [twibbonUrl, ktmUrl] = await Promise.all(uploadPromises);

      const submitValues = {
        full_name: values.full_name,
        institution_category: values.institution_category,
        institution: values.institution,
        city: values.city,
        phone_number: values.phone_number,
        instagram_twibbon_url: twibbonUrl,
        identity_card_url: ktmUrl,
      };

      const res = await updateEsaiRegistration(registration.id, submitValues);
      if (!res.success) throw new Error(res.error || "Gagal menyimpan data.");

      identityForm.reset({
        full_name: submitValues.full_name,
        institution_category: submitValues.institution_category,
        institution: submitValues.institution,
        city: submitValues.city,
        phone_number: submitValues.phone_number,
        twibbon: undefined,
        ktm: undefined,
      });
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
      const userId = registration.user_id;

      let essayUrl = registration.essay_paper_url;
      if (essayFile) {
        essayUrl = await handleFileUpload(essayFile, `${userId}/essay_${Date.now()}_${essayFile.name}`);
      }

      const submitValues = {
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
        paymentUrl = await handleFileUpload(paymentFile, `${userId}/payment_${Date.now()}_${paymentFile.name}`);
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
      if (!isTwibbonOpen && !registration.instagram_twibbon_url) {
        throw new Error("Anda baru dapat melakukan final submit pada 5 Oktober 2026.");
      }

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

  const watchFullName = identityForm.watch("full_name");
  const displayName = watchFullName || registration.full_name || userName || registration.email || userEmail || "Peserta Esai";

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

          <div className="flex flex-col items-center justify-center w-full max-w-[240px] mx-auto mb-6 gap-3">
            <span className="text-xl font-bold text-foreground bg-muted/50 px-4 py-1.5 rounded-full border">Rp. 50.000</span>
            <Image
              src="/qris-mechatura.jpeg"
              alt="QRIS Pembayaran Lomba Esai"
              width={240}
              height={240}
              className="w-full h-auto object-contain mix-blend-multiply dark:mix-blend-normal rounded-xl"
            />
          </div>

          <FormProvider {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(onSavePayment)} className="space-y-4">
              <div className="space-y-2 p-4 border rounded-xl bg-muted/30">
                <UploadedFileDisplay
                  path={registration.payment_proof_url}
                  onRemove={!isSubmitted ? () => handleRemoveFile('payment_proof_url') : undefined}
                  label="Bukti Pembayaran"
                  description="Maksimal 3MB (JPG, PNG, PDF)"
                />
                {!isSubmitted && !registration.payment_proof_url && (
                  <>
                    <FormFileField
                      name="payment"
                      label="Bukti Pembayaran"
                      accept="image/jpeg, image/png, application/pdf"
                      disabled={isSavingPayment || isSubmittingFinal}
                      maxSizeInBytes={3 * 1024 * 1024}
                      variant="button"
                    />
                    <LocalImagePreview fileList={paymentWatch} />
                  </>
                )}
              </div>
              {!isSubmitted && !registration.payment_proof_url && (
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
                    Wajib mengunggah pindaian/foto KTM (mahasiswa), Kartu Pelajar, atau KTP resmi pada bagian ini.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Twibbon:</span><br />
                    Wajib mengunggah <b>screenshot</b> bukti post twibbon di Instagram pada bagian ini.
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
                        {INSTITUTION_TYPE_OPTIONS.filter(opt => ["SMA", "SMK", "perguruan_tinggi"].includes(opt.value)).map((opt) => (
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
                  <FormTextField name="city" label="Kota" disabled={isSubmitted} placeholder="Bandung, Jakarta..." />
                  <FormTextField name="phone_number" label="Nomor WhatsApp" disabled={isSubmitted} placeholder="081234567890" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Twibbon Upload */}
                  <div className="space-y-2 p-4 border rounded-xl bg-muted/30">
                    <UploadedFileDisplay
                      path={registration.instagram_twibbon_url}
                      onRemove={!isSubmitted ? () => handleRemoveFile('instagram_twibbon_url') : undefined}
                      label="Bukti Twibbon"
                      description="Maksimal 3MB (JPG, PNG, PDF)"
                    />
                    {!isSubmitted && !registration.instagram_twibbon_url && (
                      isTwibbonOpen ? (
                        <>
                          <FormFileField
                            name="twibbon"
                            label="Bukti Twibbon"
                            accept="image/jpeg, image/png, application/pdf"
                            disabled={isSavingIdentity}
                            maxSizeInBytes={3 * 1024 * 1024}
                            variant="button"
                          />
                          <LocalImagePreview fileList={twibbonWatch} />
                        </>
                      ) : (
                        <div className="flex flex-col gap-2 h-full">
                          <label className="text-sm font-medium leading-snug">
                            Bukti Twibbon
                          </label>
                          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex flex-1 items-center justify-center">
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium text-center text-balance">
                              Template Twibbon sedang disiapkan oleh panitia. Anda baru dapat mengunggah Twibbon mulai 5 Oktober 2026.
                            </p>
                          </div>
                          <div className="text-[0.8rem] text-muted-foreground mt-auto">Maksimal 3MB (JPG, PNG, PDF)</div>
                        </div>
                      )
                    )}
                  </div>

                  {/* KTM Upload */}
                  <div className="space-y-2 p-4 border rounded-xl bg-muted/30">
                    <UploadedFileDisplay
                      path={registration.identity_card_url}
                      onRemove={!isSubmitted ? () => handleRemoveFile('identity_card_url') : undefined}
                      label="KTM / Kartu Pelajar"
                      description="Maksimal 3MB (JPG, PNG, PDF)"
                    />
                    {!isSubmitted && !registration.identity_card_url && (
                      <>
                        <FormFileField
                          name="ktm"
                          label="KTM / Kartu Pelajar"
                          accept="image/jpeg, image/png, application/pdf"
                          disabled={isSavingIdentity}
                          maxSizeInBytes={3 * 1024 * 1024}
                          variant="button"
                        />
                        <LocalImagePreview fileList={ktmWatch} />
                      </>
                    )}
                  </div>
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
                <p>Silakan unggah dokumen naskah Karya Esai Anda. Pastikan karya yang dikumpulkan adalah <strong className="text-foreground">orisinal dan belum pernah dipublikasikan atau diikutsertakan dalam kompetisi lain.</strong></p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <a href="https://drive.google.com/file/d/1YOfJ3esuOJRetvg2dZTRCynaZoaVrl9b/view?usp=sharing" target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline underline-offset-4">
                    Baca Booklet Resmi
                  </a>
                </div>
              </div>
            </div>

            <FormProvider {...docsForm}>
              <form onSubmit={docsForm.handleSubmit(onSaveDocs)}>
                <div className="grid grid-cols-1 gap-6">
                  {/* Essay Paper Upload */}
                  <div className="space-y-2 p-4 border rounded-xl bg-muted/30">
                    <UploadedFileDisplay
                      path={registration.essay_paper_url}
                      onRemove={!isSubmitted ? () => handleRemoveFile('essay_paper_url') : undefined}
                      label="File Karya Esai"
                      description="Maksimal 2MB (Hanya PDF)"
                    />
                    {!isSubmitted && !registration.essay_paper_url && (
                      <FormFileField
                        name="essay"
                        label="File Karya Esai"
                        accept="application/pdf"
                        disabled={isSavingDocs}
                        maxSizeInBytes={2 * 1024 * 1024}
                      />
                    )}
                  </div>
                </div>

                {!isSubmitted && !registration.essay_paper_url && (
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
        {isSubmitted ? (
          <div className="p-5 md:p-6 rounded-2xl bg-primary/10 border border-primary/20 text-center space-y-3">
            <h3 className="text-lg font-medium text-primary">Formulir Telah Disubmit</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Data pendaftaran Anda telah dikirim dan sedang menunggu pengecekan dari panitia. Anda tidak dapat lagi mengubah data diri, bukti pembayaran, atau karya esai.
            </p>
            <div className="pt-2">
              <Button type="button" variant="outline" onClick={() => router.push("/profile")}>
                Kembali ke Profil Utama
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-5 md:p-6 rounded-2xl bg-card border border-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-foreground">Finalisasi Pendaftaran</h3>
                <p className="text-sm text-muted-foreground mt-1">Pastikan seluruh data dan dokumen sudah tersimpan. Data yang disubmit tidak dapat diubah kembali.</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" disabled={isSubmittingFinal || !canSubmitFinal} className="w-full md:w-auto">
                    {isSubmittingFinal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Final
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground">Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Data dan file yang sudah disubmit tidak dapat diubah kembali. Pastikan seluruh informasi sudah benar.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={onFinalSubmit}>Ya, Submit Final</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}

      </section>
    </div>
  );
}
