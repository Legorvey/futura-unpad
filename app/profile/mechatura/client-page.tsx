"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
import { Button } from "@/components/ui/button";
import { updateMemberIdentity, submitPaymentProof, updateRobotDocuments, leaveTeam, transferLeadership, initiateTeamDeletion, finalizeSubmission, removeTeamMember, updatePembinaData, clearPembinaData } from "@/lib/mechatura/actions";
import { toast } from "sonner";
import { Loader2, Copy, Check, AlertTriangle, FileText, UserMinus, UserCheck, ChevronDown, ChevronUp } from "lucide-react";
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
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormTextField } from "@/components/form/form-text-field";
import { FieldGroup } from "@/components/ui/field";
import MechaturaProfileSidebar from "./sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";


const identitySchema = z.object({
  full_name: z.string().trim().min(2, "Nama lengkap minimal 2 karakter"),
  institution: z.string().trim().min(3, "Nama institusi minimal 3 karakter").max(255, "Nama institusi terlalu panjang"),
  city: z.string().trim().min(2, "Kota minimal 2 karakter"),
  phone_number: z.string().trim().min(10, "Nomor telepon minimal 10 digit").max(15, "Nomor telepon maksimal 15 digit"),
  instagram_username: z.string().trim().url("Link post Instagram Twibbon tidak valid").optional().or(z.literal("")),
  student_id_link: z.string().trim().url("Link Google Drive tidak valid")
});

const paymentSchema = z.object({
  paymentLink: z.string().trim().url("Link bukti pembayaran tidak valid")
});

const pembinaSchema = z.object({
  pembina_name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  pembina_institution: z.string().trim().min(3, "Asal institusi/sekolah minimal 3 karakter").max(255, "Nama institusi terlalu panjang"),
  pembina_city: z.string().trim().min(2, "Kota minimal 2 karakter"),
  pembina_phone: z.string().trim().min(10, "Nomor telepon minimal 10 digit").max(15, "Nomor telepon maksimal 15 digit"),
  pembina_id_link: z.string().trim().url("Link Google Drive tidak valid"),
  pembina_relationship: z.string().trim().min(2, "Hubungan dengan tim minimal 2 karakter"),
});

const robotSchema = z.object({
  robotLink: z.string().trim().url("Link dokumen robot tidak valid")
});

type IdentityValues = z.infer<typeof identitySchema>;
type PaymentValues = z.infer<typeof paymentSchema>;
type RobotValues = z.infer<typeof robotSchema>;
type PembinaValues = z.infer<typeof pembinaSchema>;

export function MechaturaProfileClient({ currentUserMembership, team, allMembers }: any) {
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const copyCode = () => {
    navigator.clipboard.writeText(team.join_code);
    setCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const isLeader = currentUserMembership?.is_leader;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isSubmitted = team.submission_status === 'submitted' || team.submission_status === 'approved';

  let revisionNotes = "";
  let revisionFields: string[] = [];
  if (team.admin_approval_status === "revision" && team.admin_rejection_reason) {
    try {
      const parsed = JSON.parse(team.admin_rejection_reason);
      if (parsed && typeof parsed === 'object') {
        revisionNotes = parsed.reason || "";
        revisionFields = parsed.fields || [];
      } else {
        revisionNotes = team.admin_rejection_reason;
      }
    } catch (e) {
      revisionNotes = team.admin_rejection_reason;
    }
  }

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  return (
    <div className="flex flex-col lg:flex-row items-stretch gap-0 relative lg:-mx-8 lg:-my-8 h-full rounded-[inherit]">
      <MechaturaProfileSidebar 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <TeamMembersSection allMembers={allMembers} isLeader={isLeader} isSubmitted={isSubmitted} team={team} revisionFields={revisionFields} />
        <PaymentSection team={team} isLeader={isLeader} isSubmitted={isSubmitted} revisionFields={revisionFields} />
      </MechaturaProfileSidebar>

      <section className="flex-1 space-y-6 p-6 sm:p-8 lg:p-10 transition-all duration-300 min-w-0 bg-background/50 rounded-2xl lg:rounded-l-none lg:rounded-r-2xl">
        {team.admin_approval_status === "revision" && (
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 flex items-start gap-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800">Pendaftaran Perlu Direvisi</h4>
              {revisionFields.length > 0 && <p className="text-sm font-medium mt-1">Ada beberapa data yang perlu diperbaiki. Periksa indikator <span className="inline-flex items-center justify-center bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-[10px] font-bold mx-1">REVISI</span> pada kolom isian di bawah.</p>}
              {revisionNotes && <p className="text-sm mt-1 leading-relaxed opacity-90">{revisionNotes}</p>}
            </div>
          </div>
        )}
        <TeamHeaderSection team={team} currentUserMembership={currentUserMembership} allMembers={allMembers} copyCode={copyCode} copied={copied} isSubmitted={isSubmitted} />
        <IdentitySection currentUserMembership={currentUserMembership} isSubmitted={isSubmitted} revisionFields={revisionFields} />
        {isLeader && <PembinaSection team={team} isSubmitted={isSubmitted} revisionFields={revisionFields} />}
        <RobotDocumentsSection team={team} isLeader={isLeader} isSubmitted={isSubmitted} revisionFields={revisionFields} />
        <FinalizeSection team={team} isLeader={isLeader} isSubmitted={isSubmitted} allMembers={allMembers} />
      </section>
    </div>
  );
}

function TeamHeaderSection({ team, currentUserMembership, allMembers, copyCode, copied, isSubmitted }: any) {
  const adminStatusColors: Record<string, string> = {
    pending: "text-amber-500",
    approved: "text-green-500",
    revision: "text-amber-500",
  };
  const adminStatusColor = adminStatusColors[team.admin_approval_status || "pending"];

  return (
    <div className="p-5 md:p-6 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-start lg:items-center justify-between gap-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">{team.name}</h2>
          {team.admin_approval_status === "revision" ? (
            <span className={`text-[11px] font-semibold tracking-wide uppercase ${adminStatusColor}`}>
              • REVISI
            </span>
          ) : isSubmitted ? (
            <span className={`text-[11px] font-semibold tracking-wide uppercase ${adminStatusColor}`}>
              • {team.admin_approval_status === "approved" ? "DISETUJUI" : "PENDING"}
            </span>
          ) : (
            <span className="text-[11px] font-semibold tracking-wide uppercase text-muted-foreground">
              • DRAFT
            </span>
          )}
        </div>
        <p className="text-muted-foreground capitalize text-base mb-6 md:mb-0">
          Kategori: {typeof team.category === 'string' ? team.category.replace(/_/g, " ") : "Unknown"}
        </p>
        <div className="mt-6">
          <TeamManagementSection team={team} currentUserMembership={currentUserMembership} allMembers={allMembers} isSubmitted={isSubmitted} />
        </div>
      </div>
      
      <div className="flex flex-col gap-4 shrink-0">
        <div className="bg-muted/50 p-4 rounded-xl border border-border/50 flex items-center gap-6 min-w-[260px] justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Kode Bergabung</p>
            <p className="font-mono text-xl font-bold tracking-widest text-foreground">{team.join_code}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={copyCode} className="text-foreground hover:bg-background shrink-0">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PaymentSection({ team, isLeader, isSubmitted, revisionFields = [] }: any) {
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const needsRevision = revisionFields.includes("payment_proof");

  const paymentForm = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { paymentLink: team.payment_proof_link || "" }
  });

  const handlePaymentSubmit = async (values: PaymentValues) => {
    setIsSavingPayment(true);
    try {
      await submitPaymentProof(team.id, values.paymentLink);
      toast.success("Bukti pembayaran berhasil dikirim untuk verifikasi!");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirim bukti pembayaran");
    } finally {
      setIsSavingPayment(false);
    }
  };

  return (
    <div className={`p-5 md:p-6 rounded-2xl bg-card border ${needsRevision ? 'border-red-300 bg-red-50/30' : 'border-border'} space-y-5`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
          Pembayaran Tim
          {needsRevision && <span className="inline-flex items-center justify-center bg-red-100 text-red-700 border border-red-200 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">Revisi</span>}
        </h3>
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-[240px] mx-auto mb-2">
        <Image
          src="/images/mechatura-qris.png"
          alt="QRIS Pembayaran Mechatura"
          width={240}
          height={240}
          className="w-full h-auto object-contain mix-blend-multiply dark:mix-blend-normal"
          priority
        />
        <p className="text-lg text-center font-medium mt-3">
          Batch 1: Rp175.000
        </p><p className="text-xs text-muted-foreground text-center font-medium mb-6">
          Bank Digital BCA <br /> a.n. Kenzie Asadel Dhabantha
        </p>
      </div>

      {isLeader ? (
        <FormProvider {...paymentForm}>
          <form onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)} noValidate className="space-y-4">
            <FieldGroup>
              <FormTextField<PaymentValues>
                name="paymentLink"
                label="Bukti Pembayaran (Link Google Drive)"
                type="url"
                disabled={team.payment_status === "verified" || isSubmitted}
              />
            </FieldGroup>
            {!isSubmitted && (
              <Button 
                type="submit" 
                disabled={isSavingPayment || team.payment_status === "verified"} 
                className="w-full"
              >
                {isSavingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Bukti
              </Button>
            )}
          </form>
        </FormProvider>
      ) : (
        <div className="p-4 bg-muted/50 border border-border rounded-lg text-sm text-center text-muted-foreground">
          Hanya ketua tim yang dapat mengunggah bukti pembayaran.
        </div>
      )}
    </div>
  );
}

function IdentitySection({ currentUserMembership, isSubmitted, revisionFields = [] }: any) {
  const [isSaving, setIsSaving] = useState(false);
  const [institutionType, setInstitutionType] = useState<InstitutionType>("SD");

  const identityForm = useForm<IdentityValues>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      full_name: currentUserMembership.full_name || "",
      institution: currentUserMembership.institution || "",
      city: currentUserMembership.city || "",
      phone_number: currentUserMembership.phone_number || "",
      instagram_username: currentUserMembership.instagram_username || "",
      student_id_link: currentUserMembership.student_id_link || "",
    }
  });

  const handleIdentitySubmit = async (values: IdentityValues) => {
    setIsSaving(true);
    try {
      await updateMemberIdentity(currentUserMembership.id, values);
      toast.success("Data diri berhasil disimpan!");
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan data diri");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTypeChange = (type: InstitutionType) => {
    setInstitutionType(type);
    // Reset institution value when category changes
    identityForm.setValue("institution", "");
  };

  const institutionValue = identityForm.watch("institution");
  const institutionError = identityForm.formState.errors.institution;
  const isSearchable = SEARCHABLE_TYPES.includes(institutionType);

  const getLabelWithRevision = (fieldName: string, defaultLabel: string) => {
    const isRevision = revisionFields.includes(`member_${currentUserMembership.id}_${fieldName}`);
    return (
      <span className="flex items-center gap-2">
        {defaultLabel}
        {isRevision && <span className="inline-flex items-center justify-center bg-red-100 text-red-700 border border-red-200 rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase">Revisi</span>}
      </span>
    );
  };

  const hasAnyRevision = [
    "full_name", "institution_category", "institution", "city", "phone_number", "instagram_username", "student_id_link"
  ].some(f => revisionFields.includes(`member_${currentUserMembership.id}_${f}`));

  return (
    <div className={`space-y-6 p-5 md:p-6 rounded-2xl bg-card border ${hasAnyRevision ? 'border-red-300 bg-red-50/10' : 'border-border'}`}>
      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
            Data Diri
            {hasAnyRevision && <span className="inline-flex items-center justify-center bg-red-100 text-red-700 border border-red-200 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">Revisi</span>}
          </h3>
          <div className="text-sm text-muted-foreground mt-2 space-y-3">
            <p>Lengkapi informasi pribadi Anda untuk keperluan pendaftaran.</p>
            <ul className="list-none space-y-2 text-xs opacity-90 border-l-2 border-primary/20 pl-3">
              <li>
                <span className="font-medium text-foreground">Student ID / Identitas:</span><br/>
                Wajib mengunggah KTM (mahasiswa), Kartu Pelajar, atau KTP/identitas resmi via Google Drive.
              </li>
              <li>
                <span className="font-medium text-foreground">Twibbon:</span><br/>
                Wajib mengunggah twibbon di Instagram publik & follow <a href="https://instagram.com/futuraunpad.hmte" target="_blank" rel="noreferrer" className="text-primary hover:underline">@futuraunpad.hmte</a>
              </li>
            </ul>
          </div>
        </div>

        <FormProvider {...identityForm}>
          <form onSubmit={identityForm.handleSubmit(handleIdentitySubmit)} noValidate className="space-y-4">

            {/* ── Row 1: Nama Lengkap | Jenjang ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormTextField<IdentityValues>
                name="full_name"
                label={getLabelWithRevision("full_name", "Nama Lengkap") as any}
                disabled={isSubmitted}
              />

              {/* Jenjang / Kategori Institusi */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium leading-snug">
                  {getLabelWithRevision("institution_category", "Jenjang / Kategori Institusi")}
                </label>
                <Select
                  value={institutionType}
                  onValueChange={(v) => handleTypeChange(v as InstitutionType)}
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

            {/* ── Row 2: Institution (full-width, dynamic) ── */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="institution"
                className="text-sm font-medium leading-snug"
              >
                {getLabelWithRevision("institution", "Institusi / Asal Sekolah")}
              </label>
              {isSearchable ? (
                <SchoolCombobox
                  id="institution"
                  value={institutionValue}
                  onChange={(v) => identityForm.setValue("institution", v, { shouldValidate: true })}
                  institutionType={institutionType}
                  disabled={isSubmitted}
                  aria-invalid={!!institutionError}
                  aria-describedby={institutionError ? "institution-error" : undefined}
                />
              ) : institutionType === "perguruan_tinggi" ? (
                <PlainInstitutionInput
                  id="institution"
                  value={institutionValue}
                  onChange={(v) => identityForm.setValue("institution", v, { shouldValidate: true })}
                  disabled={isSubmitted}
                  placeholder="Tulis nama lengkap universitas (Contoh: Universitas Padjadjaran, bukan UNPAD)"
                  aria-invalid={!!institutionError}
                  aria-describedby={institutionError ? "institution-error" : undefined}
                />
              ) : (
                <PlainInstitutionInput
                  id="institution"
                  value={institutionValue}
                  onChange={(v) => identityForm.setValue("institution", v, { shouldValidate: true })}
                  disabled={isSubmitted}
                  placeholder="Nama instansi / komunitas / ketik 'Individu'"
                  aria-invalid={!!institutionError}
                  aria-describedby={institutionError ? "institution-error" : undefined}
                />
              )}
              {institutionError && (
                <div role="alert" id="institution-error" className="flex items-start gap-1.5 text-sm font-normal text-destructive">
                  <span>{String(institutionError.message)}</span>
                </div>
              )}
            </div>

            {/* ── Row 3: Kota | Nomor WhatsApp ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormTextField<IdentityValues>
                name="city"
                label={getLabelWithRevision("city", "Kota") as any}
                disabled={isSubmitted}
              />
              <FormTextField<IdentityValues>
                name="phone_number"
                label={getLabelWithRevision("phone_number", "Nomor WhatsApp") as any}
                disabled={isSubmitted}
              />
            </div>

            {/* ── Row 4: Instagram | Student ID ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormTextField<IdentityValues>
                name="instagram_username"
                label={getLabelWithRevision("instagram_username", "Link Post Instagram (Twibbon)") as any}
                type="url"
                disabled={isSubmitted}
              />
              <FormTextField<IdentityValues>
                name="student_id_link"
                label={getLabelWithRevision("student_id_link", "Identitas/KTM (Link Google Drive)") as any}
                type="url"
                disabled={isSubmitted}
              />
            </div>

            {!isSubmitted && (
              <Button type="submit" disabled={isSaving} className="mt-2">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Data
              </Button>
            )}
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

function PembinaSection({ team, isSubmitted, revisionFields = [] }: any) {
  const hasPembinaData = team.pembina_name || team.pembina_institution || team.pembina_city || team.pembina_phone || team.pembina_id_link || team.pembina_relationship;
  const [isExpanded, setIsExpanded] = useState(!!hasPembinaData);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [institutionType, setInstitutionType] = useState<InstitutionType>(
    team.pembina_institution_category || "SD"
  );

  const pembinaForm = useForm<PembinaValues>({
    resolver: zodResolver(pembinaSchema),
    defaultValues: {
      pembina_name: team.pembina_name || "",
      pembina_institution: team.pembina_institution || "",
      pembina_city: team.pembina_city || "",
      pembina_phone: team.pembina_phone || "",
      pembina_id_link: team.pembina_id_link || "",
      pembina_relationship: team.pembina_relationship || "",
    }
  });

  const handlePembinaSubmit = async (values: PembinaValues) => {
    setIsSaving(true);
    try {
      await updatePembinaData(team.id, values);
      toast.success("Data pembina berhasil disimpan!");
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan data pembina");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearPembina = async () => {
    setIsClearing(true);
    try {
      await clearPembinaData(team.id);
      pembinaForm.reset({
        pembina_name: "",
        pembina_institution: "",
        pembina_city: "",
        pembina_phone: "",
        pembina_id_link: "",
        pembina_relationship: "",
      });
      setIsExpanded(false);
      toast.success("Data pembina berhasil dihapus!");
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus data pembina");
    } finally {
      setIsClearing(false);
    }
  };

  const handleTypeChange = (type: InstitutionType) => {
    setInstitutionType(type);
    pembinaForm.setValue("pembina_institution", "");
  };

  const institutionValue = pembinaForm.watch("pembina_institution");
  const institutionError = pembinaForm.formState.errors.pembina_institution;
  const isSearchable = SEARCHABLE_TYPES.includes(institutionType);

  const getLabelWithRevision = (fieldName: string, defaultLabel: string) => {
    const isRevision = revisionFields.includes(`pembina_${fieldName}`);
    return (
      <span className="flex items-center gap-2">
        {defaultLabel}
        {isRevision && <span className="inline-flex items-center justify-center bg-red-100 text-red-700 border border-red-200 rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase">Revisi</span>}
      </span>
    );
  };

  const hasAnyRevision = [
    "name", "institution", "city", "phone", "id_link", "relationship"
  ].some(f => revisionFields.includes(`pembina_${f}`));

  return (
    <div className={`space-y-6 p-5 md:p-6 rounded-2xl bg-card border ${hasAnyRevision ? 'border-red-300 bg-red-50/10' : 'border-border'} transition-all duration-300`}>
      <div className="space-y-5">
        <div 
          className="cursor-pointer group flex items-start justify-between select-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div>
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              Data Pembina <span className="text-sm font-normal text-muted-foreground ml-2">(Opsional namun direkomendasikan)</span>
              {hasAnyRevision && <span className="inline-flex items-center justify-center bg-red-100 text-red-700 border border-red-200 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">Revisi</span>}
            </h3>
            {isExpanded && (
              <div className="text-sm text-muted-foreground mt-2 space-y-3">
                <p>Khusus ketua tim, silakan lengkapi data pembina jika tim Anda didampingi oleh Guru, Orang Tua, atau Wali.</p>
                <ul className="list-none space-y-2 text-xs opacity-90 border-l-2 border-primary/20 pl-3">
                  <li>
                    <span className="font-medium text-foreground">Identitas Penanggung Jawab:</span><br/>
                    Bagi peserta di bawah 18 tahun, wajib menyertakan identitas Orang Tua/Wali/Guru Pembina.
                  </li>
                </ul>
              </div>
            )}
          </div>
          <div className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 mt-0.5">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </div>
        </div>

        {isExpanded && (
          <FormProvider {...pembinaForm}>
            <form onSubmit={pembinaForm.handleSubmit(handlePembinaSubmit)} noValidate className="space-y-4 animate-in fade-in duration-300">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField<PembinaValues>
                  name="pembina_name"
                  label={getLabelWithRevision("name", "Nama Lengkap Pembina") as any}
                  disabled={isSubmitted}
                />
                <FormTextField<PembinaValues>
                  name="pembina_relationship"
                  label={getLabelWithRevision("relationship", "Hubungan dengan Tim") as any}
                  placeholder="Contoh: Guru Pembina, Orang Tua, dll"
                  disabled={isSubmitted}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium leading-snug">
                    {getLabelWithRevision("institution_category", "Jenjang / Kategori Institusi")}
                  </label>
                  <Select
                    value={institutionType}
                    onValueChange={(v) => handleTypeChange(v as InstitutionType)}
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

                <div className="flex flex-col gap-2">
                  <label htmlFor="pembina_institution" className="text-sm font-medium leading-snug">
                    {getLabelWithRevision("institution", "Institusi / Asal Sekolah")}
                  </label>
                  {isSearchable ? (
                    <SchoolCombobox
                      id="pembina_institution"
                      value={institutionValue}
                      onChange={(v) => pembinaForm.setValue("pembina_institution", v, { shouldValidate: true })}
                      institutionType={institutionType}
                      disabled={isSubmitted}
                      aria-invalid={!!institutionError}
                      aria-describedby={institutionError ? "pembina-institution-error" : undefined}
                    />
                  ) : institutionType === "perguruan_tinggi" ? (
                    <PlainInstitutionInput
                      id="pembina_institution"
                      value={institutionValue}
                      onChange={(v) => pembinaForm.setValue("pembina_institution", v, { shouldValidate: true })}
                      disabled={isSubmitted}
                      placeholder="Tulis nama lengkap universitas"
                      aria-invalid={!!institutionError}
                      aria-describedby={institutionError ? "pembina-institution-error" : undefined}
                    />
                  ) : (
                    <PlainInstitutionInput
                      id="pembina_institution"
                      value={institutionValue}
                      onChange={(v) => pembinaForm.setValue("pembina_institution", v, { shouldValidate: true })}
                      disabled={isSubmitted}
                      placeholder="Nama instansi / komunitas / ketik 'Individu'"
                      aria-invalid={!!institutionError}
                      aria-describedby={institutionError ? "pembina-institution-error" : undefined}
                    />
                  )}
                  {institutionError && (
                    <div role="alert" id="pembina-institution-error" className="flex items-start gap-1.5 text-sm font-normal text-destructive">
                      <span>{String(institutionError.message)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField<PembinaValues>
                  name="pembina_city"
                  label={getLabelWithRevision("city", "Kota") as any}
                  disabled={isSubmitted}
                />
                <FormTextField<PembinaValues>
                  name="pembina_phone"
                  label={getLabelWithRevision("phone", "Nomor WhatsApp") as any}
                  disabled={isSubmitted}
                />
              </div>

              <div className="grid grid-cols-1">
                <FormTextField<PembinaValues>
                  name="pembina_id_link"
                  label={getLabelWithRevision("id_link", "Identitas KTP/SIM Pembina (Link Google Drive)") as any}
                  type="url"
                  disabled={isSubmitted}
                />
              </div>

              {!isSubmitted && (
                <div className="flex items-center gap-3 mt-2">
                  <Button type="submit" disabled={isSaving || isClearing}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Data Pembina
                  </Button>
                  
                  {hasPembinaData && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="outline" disabled={isSaving || isClearing} className="text-destructive hover:bg-destructive/10 border-destructive/20">
                          {isClearing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Hapus Data
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Data Pembina?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini akan menghapus seluruh data pembina tim Anda. Anda yakin?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={handleClearPembina} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            Ya, Hapus Data
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              )}
            </form>
          </FormProvider>
        )}
      </div>
    </div>
  );
}

function TeamMembersSection({ allMembers, isLeader, isSubmitted, revisionFields = [] }: any) {
  const [kickingMemberId, setKickingMemberId] = useState<string | null>(null);

  const handleKick = async (memberId: string) => {
    setKickingMemberId(memberId);
    try {
      await removeTeamMember(memberId);
      toast.success("Anggota berhasil dikeluarkan.");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengeluarkan anggota.");
    } finally {
      setKickingMemberId(null);
    }
  };

  return (
    <div className="p-5 md:p-6 rounded-2xl bg-card border border-border space-y-4">
      <div>
        <h3 className="text-lg font-medium text-foreground">Status Anggota Tim</h3>
      </div>
      <div className="space-y-0.5">
        {[...allMembers].sort((a, b) => (a.is_leader ? -1 : b.is_leader ? 1 : 0)).map((m: any, index: number) => {
          const hasRevision = [
            "full_name", "institution_category", "institution", "city", "phone_number", "instagram_username", "student_id_link"
          ].some(f => revisionFields.includes(`member_${m.id}_${f}`));

          const isDataComplete = m.full_name && m.institution && m.city && m.phone_number && m.student_id_link;
          const isActuallyComplete = isDataComplete && !hasRevision;

          return (
            <div key={m.id} tabIndex={0} className={`group py-3 flex items-start justify-between gap-3 focus:outline-none ${index !== allMembers.length - 1 ? 'border-b border-border/50' : ''}`}>
              <div className="min-w-0 flex-1">
                <p className="text-foreground font-medium text-sm leading-snug flex items-center gap-1.5 min-w-0">
                  <span className="truncate" title={m.full_name || m.fallback_name || "Anggota Belum Bernama"}>{m.full_name || m.fallback_name || "Anggota Belum Bernama"}</span>
                  {m.is_leader ? (
                    <span className="inline-flex items-center justify-center text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                      Ketua
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                      Anggota
                    </span>
                  )}
                  {hasRevision && (
                    <span className="inline-flex items-center justify-center text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                      Revisi
                    </span>
                  )}
                </p>
              </div>
              <div className="shrink-0 mt-0.5 flex items-center">
                {isActuallyComplete ? (
                  <span className="text-xs font-semibold text-emerald-500 whitespace-nowrap">Lengkap</span>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Belum Lengkap</span>
                )}
                {isLeader && !isSubmitted && !m.is_leader && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-0 ml-0 px-0 opacity-0 overflow-hidden group-hover:w-6 group-hover:ml-3 group-hover:opacity-100 group-focus:w-6 group-focus:ml-3 group-focus:opacity-100 transition-all duration-300 ease-in-out text-muted-foreground hover:text-destructive hover:bg-destructive/10" disabled={kickingMemberId === m.id}>
                        {kickingMemberId === m.id ? <Loader2 className="w-3 h-3 animate-spin shrink-0" /> : <UserMinus className="w-3.5 h-3.5 shrink-0" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Keluarkan Anggota?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin mengeluarkan <strong>{m.full_name || m.fallback_name || "anggota ini"}</strong> dari tim? Mereka harus bergabung kembali menggunakan kode jika ini adalah sebuah kesalahan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={() => handleKick(m.id)}>
                          Ya, Keluarkan
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

function RobotDocumentsSection({ team, isLeader, isSubmitted, revisionFields = [] }: any) {
  const [isSavingRobot, setIsSavingRobot] = useState(false);
  const needsRevision = revisionFields.includes("robot_document");

  const robotForm = useForm<RobotValues>({
    resolver: zodResolver(robotSchema),
    defaultValues: { robotLink: team.robot_document_link || "" }
  });

  const handleRobotSubmit = async (values: RobotValues) => {
    setIsSavingRobot(true);
    try {
      await updateRobotDocuments(team.id, values.robotLink);
      toast.success("Dokumen robot berhasil disimpan!");
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan dokumen robot");
    } finally {
      setIsSavingRobot(false);
    }
  };

  return (
    <div className={`p-5 md:p-6 rounded-2xl bg-card border ${needsRevision ? 'border-red-300 bg-red-50/30' : 'border-border'} space-y-5`}>
      <div>
        <h3 className="text-lg font-medium text-foreground mb-1 flex items-center gap-2">
          Dokumen & Spesifikasi Robot
          {needsRevision && <span className="inline-flex items-center justify-center bg-red-100 text-red-700 border border-red-200 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">Revisi</span>}
        </h3>
        <div className="text-sm text-muted-foreground mt-2 space-y-3">
          <p>Unggah dokumen desain dan spesifikasi teknis robot Anda. <strong className="text-foreground">Robot wajib buatan sendiri (bukan kit pabrikan).</strong></p>
          
          <ul className="list-none space-y-2 text-xs opacity-90 border-l-2 border-primary/20 pl-3">
            <li>
              <span className="font-medium text-foreground">Semua Kategori:</span> Kendali manual (tanpa fitur otomatis). Maksimal tegangan 12.6 Volt.
            </li>
            <li>
              <span className="font-medium text-foreground">Sumo:</span> Dimensi maks 20x20 cm. Berat maks 3 kg.
            </li>
            <li>
              <span className="font-medium text-foreground">Transporter:</span> Dimensi maks 20x20 cm (P x L). Tinggi & berat bebas. Dilarang menggunakan magnet.
            </li>
          </ul>

          <div className="flex flex-wrap gap-3 pt-2">
            <a href="https://drive.google.com/file/d/1ZrAl8yhVDBqf2Yo4GCoYwWAz-kv7-Zyo/view?usp=sharing" target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline underline-offset-4">
              Baca Booklet Resmi
            </a>
            {team.category === "robot_sumo" ? (
              <a href="https://drive.google.com/file/d/1Zz5PUCJeUzT4mAvQmtyfP6tVSQFobZ3B/view?usp=sharing" target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline underline-offset-4">
                Baca Juklak Robot Sumo
              </a>
            ) : (
              <a href="https://drive.google.com/file/d/1krsXNkqPjHsvQmkj9DoSleJ1S-MQD2is/view?usp=sharing" target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline underline-offset-4">
                Baca Juklak Robot Transporter
              </a>
            )}
          </div>
        </div>
      </div>

      {isLeader ? (
        <FormProvider {...robotForm}>
          <form onSubmit={robotForm.handleSubmit(handleRobotSubmit)} noValidate className="space-y-4">
            <FieldGroup>
              <FormTextField<RobotValues>
                name="robotLink"
                label="Dokumen Robot (Link Google Drive)"
                type="url"
                description="Pastikan akses link diatur ke 'Anyone with the link can view'."
                disabled={isSubmitted}
              />
            </FieldGroup>
            {!isSubmitted && (
              <Button type="submit" disabled={isSavingRobot}>
                {isSavingRobot && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Dokumen
              </Button>
            )}
          </form>
        </FormProvider>
      ) : (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-lg text-sm text-center font-medium">
          Hanya ketua tim yang dapat mengunggah dokumen robot.
        </div>
      )}
    </div>
  );
}

function TeamManagementSection({ team, currentUserMembership, allMembers, isSubmitted }: any) {
  const isLeader = currentUserMembership?.is_leader;
  const otherMembers = allMembers.filter((m: any) => m.id !== currentUserMembership.id);

  if (isSubmitted) {
    return null;
  }

  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [selectedNewLeader, setSelectedNewLeader] = useState<string>("");
  const [confirmTeamName, setConfirmTeamName] = useState("");

  const handleLeave = async () => {
    setIsProcessing(true);
    try {
      await leaveTeam(team.id);
      toast.success("Berhasil keluar dari tim.");
      window.location.href = "/mechatura";
    } catch (err: any) {
      toast.error(err.message || "Gagal keluar dari tim.");
    } finally {
      setIsProcessing(false);
      setShowConfirmLeave(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedNewLeader) {
      toast.error("Pilih member baru untuk menjadi leader.");
      return;
    }
    setIsProcessing(true);
    try {
      await transferLeadership(team.id, selectedNewLeader);
      toast.success("Kepemimpinan berhasil ditransfer.");
      setShowTransfer(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Gagal mentransfer kepemimpinan.");
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await initiateTeamDeletion(team.id);
      toast.success("Tim berhasil dihapus.");
      window.location.href = "/mechatura";
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus tim.");
      setIsProcessing(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {!isLeader && (
        <>
          <Button variant="destructive" onClick={() => setShowConfirmLeave(true)}>
            Keluar dari Tim
          </Button>
          
          <Dialog open={showConfirmLeave} onOpenChange={setShowConfirmLeave}>
            <DialogContent className="sm:max-w-[425px] mechatura-wrapper bg-card border-border">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-foreground">
                  <AlertTriangle className="h-5 w-5 text-destructive" /> Konfirmasi Keluar
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Apakah Anda yakin ingin keluar dari tim ini?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <Button variant="ghost" className="text-foreground hover:bg-muted" onClick={() => setShowConfirmLeave(false)} disabled={isProcessing}>Batal</Button>
                <Button onClick={handleLeave} disabled={isProcessing}>
                  {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Ya, Keluar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {isLeader && (
        <>
          <Button variant="outline" onClick={() => setShowTransfer(true)} disabled={otherMembers.length === 0} className="border-border text-foreground hover:bg-muted">
            Transfer Kepemimpinan
          </Button>
          <Button variant="destructive" onClick={() => setShowConfirmDelete(true)}>
            Hapus Tim
          </Button>

          <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
            <DialogContent className="sm:max-w-[425px] mechatura-wrapper bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Transfer Kepemimpinan</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Pilih anggota untuk dijadikan ketua baru:
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Select value={selectedNewLeader} onValueChange={setSelectedNewLeader}>
                  <SelectTrigger className="w-full bg-background border-border text-foreground">
                    <SelectValue placeholder="Pilih Anggota..." />
                  </SelectTrigger>
                  <SelectContent className="mechatura-wrapper bg-card border-border">
                    {otherMembers.map((m: any) => (
                      <SelectItem key={m.id} value={m.user_id} className="text-foreground focus:bg-muted focus:text-foreground">
                        {m.full_name || m.fallback_name || 'Anggota Belum Bernama'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="ghost" className="text-foreground hover:bg-muted" onClick={() => setShowTransfer(false)} disabled={isProcessing}>Batal</Button>
                <Button onClick={handleTransfer} disabled={isProcessing || !selectedNewLeader}>
                  {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Transfer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
            <DialogContent className="sm:max-w-[425px] mechatura-wrapper bg-card border-border">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-foreground">
                  <AlertTriangle className="h-5 w-5 text-destructive" /> Hapus Tim
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Ketik <strong className="text-foreground">{team.name}</strong> untuk mengonfirmasi penghapusan tim. Seluruh data tim akan hilang dan tidak dapat dikembalikan.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  value={confirmTeamName}
                  onChange={(e) => setConfirmTeamName(e.target.value)}
                  placeholder="Nama Tim"
                  className="w-full bg-background border-border text-foreground"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" className="text-foreground hover:bg-muted" onClick={() => setShowConfirmDelete(false)} disabled={isProcessing}>Batal</Button>
                <Button onClick={handleDelete} disabled={isProcessing || confirmTeamName !== team.name}>
                  {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Ya, Hapus Tim
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

function FinalizeSection({ team, isLeader, isSubmitted, allMembers }: any) {
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isSubmitted) {
    return (
      <div className="p-5 md:p-6 rounded-2xl bg-primary/10 border border-primary/20 text-center space-y-3">
        <h3 className="text-lg font-medium text-primary">Formulir Telah Disubmit</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Data pendaftaran tim Anda telah dikirim dan sedang menunggu pengecekan dari panitia. Anda tidak dapat lagi mengubah data, bukti pembayaran, atau dokumen robot.
        </p>
      </div>
    );
  }

  if (!isLeader) {
    return null;
  }

  const isComplete = team.payment_proof_link && team.robot_document_link && allMembers?.every((m: any) => 
    m.full_name && m.institution && m.city && m.phone_number && m.student_id_link
  );

  const handleFinalize = async () => {
    setIsFinalizing(true);
    try {
      await finalizeSubmission(team.id);
      toast.success("Pendaftaran berhasil disubmit!");
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Gagal melakukan submit.");
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <>
      <div className="p-5 md:p-6 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-medium text-foreground">Finalisasi Pendaftaran</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Pastikan seluruh data anggota, bukti pembayaran, dan dokumen telah benar. 
            Data tidak dapat diubah setelah disubmit.
          </p>
        </div>
        <div className="w-full sm:w-auto shrink-0 space-y-2">
          <Button size="lg" className="w-full" disabled={!isComplete} onClick={() => setIsDialogOpen(true)}>
            {team.admin_approval_status === "revision" ? 'Ajukan Revisi' : 'Submit Pendaftaran'}
          </Button>
          {!isComplete && (
            <p className="text-xs text-amber-500 text-center max-w-[200px]">
              Lengkapi data anggota, bukti bayar, & robot untuk mensubmit.
            </p>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="mechatura-wrapper sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {team.admin_approval_status === "revision" ? 'Ajukan Revisi Tim?' : 'Submit Pendaftaran Tim?'}
            </DialogTitle>
            <DialogDescription>
              {team.admin_approval_status === "revision" 
                ? 'Anda yakin ingin mengajukan revisi? Pastikan semua perbaikan sesuai catatan panitia telah dilakukan. Setelah diajukan, Anda tidak dapat mengubah data hingga dicek kembali.' 
                : 'Anda yakin ingin submit sekarang? Setelah disubmit, Anda tidak dapat lagi mengubah biodata anggota, mengganti bukti pembayaran, atau memperbarui dokumen robot.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isFinalizing}>
              Batal
            </Button>
            <Button onClick={handleFinalize} disabled={isFinalizing}>
              {isFinalizing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {team.admin_approval_status === "revision" ? 'Ya, Ajukan Revisi' : 'Ya, Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
