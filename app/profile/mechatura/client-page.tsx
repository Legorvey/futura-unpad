"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { updateMemberIdentity, submitPaymentProof, updateRobotDocuments, leaveTeam, transferLeadership, initiateTeamDeletion } from "@/lib/mechatura/actions";
import { toast } from "sonner";
import { Loader2, Copy, Check, AlertTriangle } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const identitySchema = z.object({
  full_name: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  institution: z.string().min(2, "Institusi minimal 8 karakter"),
  city: z.string().min(2, "Kota minimal 2 karakter"),
  phone_number: z.string().min(10, "Nomor telepon minimal 10 digit").max(15, "Nomor telepon maksimal 15 digit"),
  instagram_username: z.string().url("Link post Instagram Twibbon tidak valid").optional().or(z.literal("")),
  student_id_link: z.string().url("Link Google Drive tidak valid")
});

const paymentSchema = z.object({
  paymentLink: z.string().url("Link bukti pembayaran tidak valid")
});

const robotSchema = z.object({
  robotLink: z.string().url("Link dokumen robot tidak valid")
});

type IdentityValues = z.infer<typeof identitySchema>;
type PaymentValues = z.infer<typeof paymentSchema>;
type RobotValues = z.infer<typeof robotSchema>;

export function MechaturaProfileClient({ currentUserMembership, team, allMembers }: any) {
  const [copied, setCopied] = useState(false);
  const copyCode = () => {
    navigator.clipboard.writeText(team.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLeader = currentUserMembership?.is_leader;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        <TeamMembersSection allMembers={allMembers} />
        <PaymentSection team={team} isLeader={isLeader} />
      </MechaturaProfileSidebar>

      <section className="flex-1 space-y-6 p-6 sm:p-8 lg:p-10 transition-all duration-300 min-w-0 bg-background/50 rounded-2xl lg:rounded-l-none lg:rounded-r-2xl">
        <TeamHeaderSection team={team} currentUserMembership={currentUserMembership} allMembers={allMembers} copyCode={copyCode} copied={copied} />
        <IdentitySection currentUserMembership={currentUserMembership} />
        <RobotDocumentsSection team={team} isLeader={isLeader} />
      </section>
    </div>
  );
}

function TeamHeaderSection({ team, currentUserMembership, allMembers, copyCode, copied }: any) {
  return (
    <div className="p-5 md:p-6 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-start lg:items-center justify-between gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{team.name}</h2>
        <p className="text-muted-foreground capitalize mt-2 text-base mb-6 md:mb-0">
          Category: {team.category.replace("_", " ")}
        </p>
        <div className="mt-6">
          <TeamManagementSection team={team} currentUserMembership={currentUserMembership} allMembers={allMembers} />
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="bg-muted p-4 rounded-xl border border-border/50 flex items-center gap-6 min-w-[260px] justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Team Join Code</p>
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

function PaymentSection({ team, isLeader }: any) {
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  const paymentForm = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { paymentLink: team.payment_proof_link || "" }
  });

  const handlePaymentSubmit = async (values: PaymentValues) => {
    setIsSavingPayment(true);
    try {
      await submitPaymentProof(team.id, values.paymentLink);
      toast.success("Payment proof submitted for verification!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit payment");
    } finally {
      setIsSavingPayment(false);
    }
  };

  const statusColors: Record<string, string> = {
    verified: "bg-green-500/10 text-green-600 border-green-500/20",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    unpaid: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  };
  const statusColor = statusColors[team.payment_status] || "bg-muted text-muted-foreground border-border";

  return (
    <div className="p-5 md:p-6 rounded-2xl bg-card border border-border space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Team Payment</h3>
        <span className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-wide capitalize ${statusColor}`}>
          {team.payment_status.replace("_", " ")}
        </span>
      </div>

      <div className="space-y-3">
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-1.5">
            <span className="text-sm font-semibold text-primary">Transfer / QRIS</span>
            <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-[240px]">
              [Insert Rekening/QRIS detail here]<br/>
              Admin will verify manually.
            </p>
        </div>

        <p className="text-[10px] text-center text-muted-foreground/60 italic">
          *Peserta yang mundur/diskualifikasi tidak mendapat refund.
        </p>
      </div>

      {isLeader ? (
        <FormProvider {...paymentForm}>
          <form onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)} noValidate className="space-y-4">
            <FieldGroup>
              <FormTextField<PaymentValues>
                name="paymentLink"
                label="Payment Proof (Google Drive Link)"
                type="url"
                disabled={team.payment_status === "verified"}
              />
            </FieldGroup>
            <Button 
              type="submit" 
              disabled={isSavingPayment || team.payment_status === "verified"} 
              className="w-full"
            >
              {isSavingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Proof
            </Button>
          </form>
        </FormProvider>
      ) : (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-lg text-sm text-center font-medium">
          Hanya ketua tim yang dapat mengunggah bukti pembayaran.
        </div>
      )}
    </div>
  );
}

function IdentitySection({ currentUserMembership }: any) {
  const [isSaving, setIsSaving] = useState(false);

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
      toast.success("Identity details saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save details");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-5 md:p-6 rounded-2xl bg-card border border-border">
      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-medium text-foreground">Your Details</h3>
          <div className="text-sm text-muted-foreground mt-1 space-y-2">
            <p>Lengkapi informasi pribadi Anda untuk keperluan pendaftaran.</p>
            <ul className="list-disc pl-5 space-y-0.5">
              <li><strong>Student ID / Identitas:</strong> Wajib upload KTM (mahasiswa), Kartu Pelajar, atau KTP/identitas resmi (umum) via Google Drive.</li>
              <li><strong>Twibbon:</strong> Wajib unggah twibbon di Instagram publik & follow <a href="https://instagram.com/futuraunpad.hmte" target="_blank" rel="noreferrer" className="text-primary hover:underline">@futuraunpad.hmte</a></li>
            </ul>
          </div>
        </div>
        
        <FormProvider {...identityForm}>
          <form onSubmit={identityForm.handleSubmit(handleIdentitySubmit)} noValidate className="space-y-4">
            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormTextField<IdentityValues>
                name="full_name"
                label="Full Name"
              />
              <FormTextField<IdentityValues>
                name="institution"
                label="Institution"
              />
              <FormTextField<IdentityValues>
                name="city"
                label="City"
              />
              <FormTextField<IdentityValues>
                name="phone_number"
                label="Phone Number"
              />
              <FormTextField<IdentityValues>
                name="instagram_username"
                label="Instagram Post Link (Twibbon)"
                type="url"
                description="Harus berupa link postingan Instagram twibbon pribadi Anda (contoh: https://instagram.com/p/...)"
              />
              <FormTextField<IdentityValues>
                name="student_id_link"
                label="Student ID (Google Drive Link)"
                type="url"
              />
            </FieldGroup>
            
            <Button type="submit" disabled={isSaving} className="mt-2">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Details
            </Button>
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
        <h3 className="text-lg font-medium text-foreground">Team Members Status</h3>
      </div>
      <div className="space-y-3">
        {allMembers.map((m: any) => {
          const isComplete = m.full_name && m.student_id_link;
          return (
            <div key={m.id} className="p-3.5 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium text-sm">
                  {m.full_name || "Unnamed Member"}
                  {m.is_leader && <span className="ml-2 text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full font-semibold">Leader</span>}
                </p>
              </div>
              <div>
                {isComplete ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-yellow-500" title="Incomplete" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

function RobotDocumentsSection({ team, isLeader }: any) {
  const [isSavingRobot, setIsSavingRobot] = useState(false);

  const robotForm = useForm<RobotValues>({
    resolver: zodResolver(robotSchema),
    defaultValues: { robotLink: team.robot_document_link || "" }
  });

  const handleRobotSubmit = async (values: RobotValues) => {
    setIsSavingRobot(true);
    try {
      await updateRobotDocuments(team.id, values.robotLink);
      toast.success("Robot documents saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save robot docs");
    } finally {
      setIsSavingRobot(false);
    }
  };

  return (
    <div className="p-5 md:p-6 rounded-2xl bg-card border border-border space-y-5">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-1">Robot Documents & Spesifikasi</h3>
        <div className="text-sm text-muted-foreground mt-2 space-y-2">
          <p>Kumpulkan dokumen desain dan spesifikasi robot. Robot <strong>wajib buatan sendiri</strong> (bukan kit pabrikan).</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li><strong>Semua Robot:</strong> Kendali manual (tanpa fitur otomatis). Maksimal tegangan 12.6 Volt.</li>
            <li><strong>Sumo:</strong> Maks 20x20 cm. Berat maks 3 kg.</li>
            <li><strong>Transporter:</strong> Maks 20x20 cm (panjang x lebar). Tinggi dan berat tidak dibatasi. Dilarang menggunakan magnet.</li>
          </ul>
        </div>
      </div>

      {isLeader ? (
        <FormProvider {...robotForm}>
          <form onSubmit={robotForm.handleSubmit(handleRobotSubmit)} noValidate className="space-y-4">
            <FieldGroup>
              <FormTextField<RobotValues>
                name="robotLink"
                label="Document (Google Drive Link)"
                type="url"
                description="Make sure the link is set to 'Anyone with the link can view'."
              />
            </FieldGroup>
            <Button type="submit" disabled={isSavingRobot}>
              {isSavingRobot && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Documents
            </Button>
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

function TeamManagementSection({ team, currentUserMembership, allMembers }: any) {
  const isLeader = currentUserMembership?.is_leader;
  const otherMembers = allMembers.filter((m: any) => m.id !== currentUserMembership.id);

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
            Transfer Leadership
          </Button>
          <Button variant="destructive" onClick={() => setShowConfirmDelete(true)}>
            Hapus Tim
          </Button>

          <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
            <DialogContent className="sm:max-w-[425px] mechatura-wrapper bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Transfer Leadership</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Pilih member untuk dijadikan leader baru:
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Select value={selectedNewLeader} onValueChange={setSelectedNewLeader}>
                  <SelectTrigger className="w-full bg-background border-border text-foreground">
                    <SelectValue placeholder="Pilih Member..." />
                  </SelectTrigger>
                  <SelectContent className="mechatura-wrapper bg-card border-border">
                    {otherMembers.map((m: any) => (
                      <SelectItem key={m.id} value={m.user_id} className="text-foreground focus:bg-muted focus:text-foreground">
                        {m.full_name || 'Unnamed Member'}
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
