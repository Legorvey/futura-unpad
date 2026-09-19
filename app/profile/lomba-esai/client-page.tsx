"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { updateEsaiRegistration } from "@/lib/essay/actions";

import { Button } from "@/components/ui/button";
import { FormTextField } from "@/components/form/form-text-field";
import MechaturaProfileSidebar from "../mechatura/sidebar";

const MAX_GENERAL_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const MAX_ESSAY_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const ALLOWED_PDF_TYPE = ["application/pdf"];

const IdentitySchema = z.object({
  full_name: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  institution: z.string().min(3, "Asal instansi minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  phone_number: z.string().min(10, "Nomor WA minimal 10 karakter"),
});
type IdentityValues = z.infer<typeof IdentitySchema>;

const FileListSchema = (allowedTypes: string[], maxSize: number, sizeLabel: string) => z.any()
  .refine(val => {
    if (!val || val.length === 0) return true;
    return val[0].size <= maxSize;
  }, `Ukuran file maksimal ${sizeLabel}.`)
  .refine(val => {
    if (!val || val.length === 0) return true;
    return allowedTypes.includes(val[0].type);
  }, "Tipe file tidak diizinkan.");

const DocsSchema = z.object({
  twibbon: FileListSchema([...ALLOWED_IMAGE_TYPES, ...ALLOWED_PDF_TYPE], MAX_GENERAL_FILE_SIZE, "3MB"),
  ktm: FileListSchema([...ALLOWED_IMAGE_TYPES, ...ALLOWED_PDF_TYPE], MAX_GENERAL_FILE_SIZE, "3MB"),
  essay: FileListSchema(ALLOWED_PDF_TYPE, MAX_ESSAY_FILE_SIZE, "2MB"),
});
type DocsValues = z.infer<typeof DocsSchema>;

const PaymentSchema = z.object({
  payment: FileListSchema([...ALLOWED_IMAGE_TYPES, ...ALLOWED_PDF_TYPE], MAX_GENERAL_FILE_SIZE, "3MB"),
});
type PaymentValues = z.infer<typeof PaymentSchema>;

interface EsaiRegistration {
  id: string;
  user_id: string;
  full_name?: string | null;
  institution?: string | null;
  email?: string | null;
  phone_number?: string | null;
  instagram_twibbon_url?: string | null;
  identity_card_url?: string | null;
  essay_paper_url?: string | null;
  payment_proof_url?: string | null;
  payment_status?: string | null;
  submission_status: string;
}

interface LombaEsaiClientProps {
  registration: EsaiRegistration;
  userEmail?: string;
  userName?: string;
}

export function LombaEsaiClient({ registration, userEmail, userName }: LombaEsaiClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const isSubmitted = registration.submission_status === "submitted" || registration.submission_status === "approved";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSavingIdentity, setIsSavingIdentity] = useState(false);
  const [isSavingDocs, setIsSavingDocs] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);

  // Signed URLs for viewing
  const [twibbonSignedUrl, setTwibbonSignedUrl] = useState<string | null>(null);
  const [ktmSignedUrl, setKtmSignedUrl] = useState<string | null>(null);
  const [essaySignedUrl, setEssaySignedUrl] = useState<string | null>(null);
  const [paymentSignedUrl, setPaymentSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSidebarOpen(true);
    }
  }, []);

  const identityForm = useForm<IdentityValues>({
    resolver: zodResolver(IdentitySchema),
    mode: "onChange",
    defaultValues: {
      full_name: registration.full_name || userName || "",
      institution: registration.institution || "",
      email: registration.email || userEmail || "",
      phone_number: registration.phone_number || "",
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
  const isIdentityComplete = Boolean(registration.full_name && registration.institution && registration.email && registration.phone_number) || isIdentityValid;
  
  const twibbonWatch = docsForm.watch("twibbon");
  const ktmWatch = docsForm.watch("ktm");
  const essayWatch = docsForm.watch("essay");
  
  const isDocsComplete = Boolean(
    (twibbonWatch?.length > 0 || registration.instagram_twibbon_url) && 
    (ktmWatch?.length > 0 || registration.identity_card_url) && 
    (essayWatch?.length > 0 || registration.essay_paper_url)
  );
  
  const isDocsValid = docsForm.formState.isValid && Boolean(twibbonWatch?.length > 0 || ktmWatch?.length > 0 || essayWatch?.length > 0);

  const paymentWatch = paymentForm.watch("payment");
  const isPaymentComplete = Boolean(paymentWatch?.length > 0 || registration.payment_proof_url);
  const isPaymentValid = paymentForm.formState.isValid && Boolean(paymentWatch?.length > 0);

  const canSubmitFinal = isIdentityComplete && isDocsComplete && isPaymentComplete;

  const loadSignedUrls = useCallback(async () => {
    if (registration.instagram_twibbon_url) {
      const { data } = await supabase.storage.from("esai_documents").createSignedUrl(registration.instagram_twibbon_url, 3600);
      if (data) setTwibbonSignedUrl(data.signedUrl);
    }
    if (registration.identity_card_url) {
      const { data } = await supabase.storage.from("esai_documents").createSignedUrl(registration.identity_card_url, 3600);
      if (data) setKtmSignedUrl(data.signedUrl);
    }
    if (registration.essay_paper_url) {
      const { data } = await supabase.storage.from("esai_documents").createSignedUrl(registration.essay_paper_url, 3600);
      if (data) setEssaySignedUrl(data.signedUrl);
    }
    if (registration.payment_proof_url) {
      const { data } = await supabase.storage.from("esai_documents").createSignedUrl(registration.payment_proof_url, 3600);
      if (data) setPaymentSignedUrl(data.signedUrl);
    }
  }, [registration, supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSignedUrls();
  }, [loadSignedUrls]);

  const getExtensionFromType = (type: string) => {
    if (type === "image/jpeg") return "jpg";
    if (type === "image/png") return "png";
    if (type === "application/pdf") return "pdf";
    return "bin"; 
  };

  const handleFileUpload = async (file: File, path: string) => {
    const { error } = await supabase.storage.from("esai_documents").upload(path, file, { upsert: true });
    if (error) throw error;
    return path;
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
      const twibbonFile = values.twibbon?.[0];
      const ktmFile = values.ktm?.[0];
      const essayFile = values.essay?.[0];

      const userId = registration.user_id;
      const uploadPromises: Promise<string | null | undefined>[] = [];
      
      let twibbonUrlPromise = Promise.resolve(registration.instagram_twibbon_url);
      if (twibbonFile) twibbonUrlPromise = handleFileUpload(twibbonFile, `${userId}/twibbon.${getExtensionFromType(twibbonFile.type)}`);
      uploadPromises.push(twibbonUrlPromise);

      let ktmUrlPromise = Promise.resolve(registration.identity_card_url);
      if (ktmFile) ktmUrlPromise = handleFileUpload(ktmFile, `${userId}/ktm.${getExtensionFromType(ktmFile.type)}`);
      uploadPromises.push(ktmUrlPromise);

      let essayUrlPromise = Promise.resolve(registration.essay_paper_url);
      if (essayFile) essayUrlPromise = handleFileUpload(essayFile, `${userId}/essay.${getExtensionFromType(essayFile.type)}`);
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
        paymentUrl = await handleFileUpload(paymentFile, `${userId}/payment.${getExtensionFromType(paymentFile.type)}`);
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
              priority
            />
          </div>

          <FormProvider {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(onSavePayment)} className="space-y-4 mt-4">
              <div className="space-y-2">
                {paymentSignedUrl && (
                  <div className="mb-2">
                    <a href={paymentSignedUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                      Lihat File Terunggah
                    </a>
                  </div>
                )}
                {!isSubmitted && (
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
                  • DISETUJUI / DISUBMIT
                </span>
              ) : (
                <span className="text-[11px] font-semibold tracking-wide uppercase text-muted-foreground">
                  • DRAFT
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
              </div>
            </div>

            <FormProvider {...identityForm}>
              <form onSubmit={identityForm.handleSubmit(onSaveIdentity)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormTextField name="full_name" label="Nama Lengkap" disabled={isSubmitted} />
                  <FormTextField name="institution" label="Asal Instansi" disabled={isSubmitted} />
                  <FormTextField name="email" label="Alamat Email" type="email" disabled={isSubmitted} />
                  <FormTextField name="phone_number" label="Nomor WhatsApp" disabled={isSubmitted} />
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
              <h3 className="text-lg font-medium text-foreground flex items-center gap-2">Dokumen Pendukung & Esai</h3>
              <div className="text-sm text-muted-foreground mt-2 space-y-3">
                <p>Unggah file KTM/Kartu Pelajar, Twibbon, dan Karya Esai Anda.</p>
              </div>
            </div>

            <FormProvider {...docsForm}>
              <form onSubmit={docsForm.handleSubmit(onSaveDocs)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Twibbon Upload */}
                  <div className="space-y-2 p-4 border rounded-xl bg-muted/30">
                    {twibbonSignedUrl && (
                      <div className="mb-2"><a href={twibbonSignedUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">Lihat File Terunggah</a></div>
                    )}
                    {!isSubmitted && (
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
                    {ktmSignedUrl && (
                      <div className="mb-2"><a href={ktmSignedUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">Lihat File Terunggah</a></div>
                    )}
                    {!isSubmitted && (
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
                    {essaySignedUrl && (
                      <div className="mb-2"><a href={essaySignedUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">Lihat File Terunggah</a></div>
                    )}
                    {!isSubmitted && (
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
