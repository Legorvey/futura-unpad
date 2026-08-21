"use client";

import { useState, useEffect, useRef } from "react";
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
import { updateMemberIdentity, submitPaymentProof, updateRobotDocuments, leaveTeam, transferLeadership, initiateTeamDeletion, finalizeSubmission } from "@/lib/mechatura/actions";
import { toast } from "sonner";
import { Loader2, Copy, Check, AlertTriangle, FileText } from "lucide-react";
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

const robotSchema = z.object({
  robotLink: z.string().trim().url("Link dokumen robot tidak valid")
});

type IdentityValues = z.infer<typeof identitySchema>;
type PaymentValues = z.infer<typeof paymentSchema>;
type RobotValues = z.infer<typeof robotSchema>;

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
        <TeamMembersSection allMembers={allMembers} isSubmitted={isSubmitted} team={team} />
        <PaymentSection team={team} isLeader={isLeader} isSubmitted={isSubmitted} />
      </MechaturaProfileSidebar>

      <section className="flex-1 space-y-6 p-6 sm:p-8 lg:p-10 transition-all duration-300 min-w-0 bg-background/50 rounded-2xl lg:rounded-l-none lg:rounded-r-2xl">
        {team.admin_approval_status === "revision" && team.admin_rejection_reason && (
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 flex items-start gap-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800">Pendaftaran Perlu Direvisi</h4>
              <p className="text-sm mt-1 leading-relaxed opacity-90">{team.admin_rejection_reason}</p>
            </div>
          </div>
        )}
        <TeamHeaderSection team={team} currentUserMembership={currentUserMembership} allMembers={allMembers} copyCode={copyCode} copied={copied} isSubmitted={isSubmitted} />
        <IdentitySection currentUserMembership={currentUserMembership} isSubmitted={isSubmitted} />
        <RobotDocumentsSection team={team} isLeader={isLeader} isSubmitted={isSubmitted} />
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
          Kategori: {team.category.replace("_", " ")}
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

function PaymentSection({ team, isLeader, isSubmitted }: any) {
  const [isSavingPayment, setIsSavingPayment] = useState(false);

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

  const statusColors: Record<string, string> = {
    verified: "text-green-500",
    pending: "text-amber-500",
    unpaid: "text-muted-foreground",
  };
  
  let statusColor = statusColors[team.payment_status] || "text-muted-foreground";
  let statusText = team.payment_status === "verified" ? "Terverifikasi" : team.payment_status === "pending" ? "Menunggu Verifikasi" : "Belum Dibayar";

  if (team.admin_approval_status === "revision") {
    statusColor = "text-amber-500";
    statusText = "Perlu Direvisi";
  }

  return (
    <div className="p-5 md:p-6 rounded-2xl bg-card border border-border space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Pembayaran Tim</h3>
        <span className={`text-xs font-semibold tracking-wide uppercase ${statusColor}`}>
          • {statusText}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center p-6 bg-muted/30 border-2 border-dashed border-border/60 rounded-2xl w-full max-w-[220px] aspect-square mx-auto">
        <p className="text-xs text-muted-foreground text-center font-medium">Gambar QRIS / Panduan Pembayaran<br/><span className="text-[10px] font-normal opacity-70 mt-1 block">(Placeholder)</span></p>
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

function IdentitySection({ currentUserMembership, isSubmitted }: any) {
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

  return (
    <div className="space-y-6 p-5 md:p-6 rounded-2xl bg-card border border-border">
      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-medium text-foreground">Data Diri</h3>
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
                label="Nama Lengkap"
                disabled={isSubmitted}
              />

              {/* Jenjang / Kategori Institusi */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium leading-snug">
                  Jenjang / Kategori Institusi
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
                Institusi / Asal Sekolah
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
                label="Kota"
                disabled={isSubmitted}
              />
              <FormTextField<IdentityValues>
                name="phone_number"
                label="Nomor WhatsApp"
                disabled={isSubmitted}
              />
            </div>

            {/* ── Row 4: Instagram | Student ID ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormTextField<IdentityValues>
                name="instagram_username"
                label="Link Post Instagram (Twibbon)"
                type="url"
                disabled={isSubmitted}
              />
              <FormTextField<IdentityValues>
                name="student_id_link"
                label="Identitas/KTM (Link Google Drive)"
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

function TeamMembersSection({ allMembers }: any) {
  return (
    <div className="p-5 md:p-6 rounded-2xl bg-card border border-border space-y-4">
      <div>
        <h3 className="text-lg font-medium text-foreground">Status Anggota Tim</h3>
      </div>
      <div className="space-y-0.5">
        {allMembers.map((m: any, index: number) => {
          const isComplete = m.full_name && m.student_id_link;
          return (
            <div key={m.id} className={`py-3 flex items-start justify-between gap-3 ${index !== allMembers.length - 1 ? 'border-b border-border/50' : ''}`}>
              <div className="min-w-0 flex-1">
                <p className="text-foreground font-medium text-sm leading-snug flex items-center gap-1.5 min-w-0">
                  <span className="truncate" title={m.full_name || m.fallback_name || "Anggota Belum Bernama"}>{m.full_name || m.fallback_name || "Anggota Belum Bernama"}</span>
                  {m.is_leader && (
                    <span className="inline-flex items-center justify-center text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                      Ketua
                    </span>
                  )}
                </p>
              </div>
              <div className="shrink-0 mt-0.5">
                {isComplete ? (
                  <span className="text-xs font-semibold text-emerald-500 whitespace-nowrap">Tersimpan</span>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Belum Lengkap</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

function RobotDocumentsSection({ team, isLeader, isSubmitted }: any) {
  const [isSavingRobot, setIsSavingRobot] = useState(false);

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
    <div className="p-5 md:p-6 rounded-2xl bg-card border border-border space-y-5">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-1">Dokumen & Spesifikasi Robot</h3>
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
