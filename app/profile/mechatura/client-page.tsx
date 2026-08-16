"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateMemberIdentity, submitPaymentProof, updateRobotDocuments, leaveTeam, transferLeadership, initiateTeamDeletion } from "@/lib/mechatura/actions";
import { toast } from "sonner";
import { Loader2, Copy, Check } from "lucide-react";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormTextField } from "@/components/form/form-text-field";
import { FieldGroup } from "@/components/ui/field";

const identitySchema = z.object({
  full_name: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  institution: z.string().min(2, "Institusi minimal 8 karakter"),
  city: z.string().min(2, "Kota minimal 2 karakter"),
  phone_number: z.string().min(10, "Nomor telepon minimal 10 digit").max(15, "Nomor telepon maksimal 15 digit"),
  instagram_username: z.string().optional(),
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

  return (
    <div className="space-y-8">
      {/* Team Header Info on Top */}
      <div className="p-6 md:p-8 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col md:flex-row md:items-start lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-semibold text-white">{team.name}</h2>
          <p className="text-white/60 capitalize mt-2 text-lg mb-6 md:mb-0">
            Category: {team.category.replace("_", " ")}
          </p>
          <div className="mt-6">
            <TeamManagementSection team={team} currentUserMembership={currentUserMembership} allMembers={allMembers} />
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="bg-[#00205B] p-5 rounded-xl border border-white/10 flex items-center gap-8 min-w-[300px] justify-between">
            <div>
              <p className="text-xs text-white/50 mb-1 uppercase tracking-wider font-semibold">Team Join Code</p>
              <p className="font-mono text-2xl font-bold tracking-widest text-white">{team.join_code}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={copyCode} className="text-white hover:bg-white/10 shrink-0">
              {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar - Sticky */}
        <div className="lg:col-span-4 sticky top-8 space-y-6">

        {/* Team Members Status */}
        <TeamMembersSection allMembers={allMembers} />

        {/* Payment Section */}
        <PaymentSection team={team} isLeader={isLeader} />
      </div>

      {/* Right Content - Forms */}
      <div className="lg:col-span-8 space-y-8">
        <IdentitySection currentUserMembership={currentUserMembership} />
        <RobotDocumentsSection team={team} isLeader={isLeader} />
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

  return (
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
      <div>
        <h3 className="text-xl font-medium text-white mb-2">Team Payment</h3>
        <p className="text-sm text-white/50">Status: <span className="text-white capitalize font-medium">{team.payment_status.replace("_", " ")}</span></p>
      </div>

      <div className="bg-white/5 rounded-xl aspect-square flex items-center justify-center border border-white/10 p-4">
        <p className="text-white/40 text-center text-sm">
          [Insert QRIS Image Here]<br/>
          Note: Admin will manually verify payments.
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
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-sm text-center font-medium">
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
    <div className="space-y-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-medium text-white">Your Details</h3>
          <p className="text-sm text-white/50">Please fill out your personal information.</p>
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
                label="Instagram Username"
              />
              <FormTextField<IdentityValues>
                name="student_id_link"
                label="Student ID (Google Drive Link)"
                type="url"
              />
            </FieldGroup>
            
            <Button type="submit" disabled={isSaving} className="mt-4">
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
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
      <h3 className="text-xl font-medium text-white">Team Members Status</h3>
      <div className="space-y-3">
        {allMembers.map((m: any) => {
          const isComplete = m.full_name && m.student_id_link;
          return (
            <div key={m.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">
                  {m.full_name || "Unnamed Member"}
                  {m.is_leader && <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">Leader</span>}
                </p>
              </div>
              <div>
                {isComplete ? (
                  <Check className="w-5 h-5 text-green-500" />
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
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-6">
      <div>
        <h3 className="text-xl font-medium text-white mb-2">Robot Documents</h3>
        <p className="text-sm text-white/50">Submit your team's robot design and specifications document.</p>
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
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-sm text-center font-medium">
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
          
          {showConfirmLeave && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
              <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/10 max-w-sm w-full mx-4">
                <h4 className="text-lg font-semibold text-white mb-2">Konfirmasi Keluar</h4>
                <p className="text-white/70 mb-6 text-sm">Apakah Anda yakin ingin keluar dari tim ini?</p>
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setShowConfirmLeave(false)} disabled={isProcessing}>Batal</Button>
                  <Button variant="destructive" onClick={handleLeave} disabled={isProcessing}>
                    {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Ya, Keluar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {isLeader && (
        <>
          <Button variant="outline" onClick={() => setShowTransfer(true)} disabled={otherMembers.length === 0} className="border-white/20 text-white hover:bg-white/10">
            Transfer Leadership
          </Button>
          <Button variant="destructive" onClick={() => setShowConfirmDelete(true)}>
            Hapus Tim
          </Button>

          {showTransfer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
              <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/10 max-w-sm w-full mx-4">
                <h4 className="text-lg font-semibold text-white mb-2">Transfer Leadership</h4>
                <p className="text-white/70 mb-4 text-sm">Pilih member untuk dijadikan leader baru:</p>
                <select 
                  className="w-full mb-6 bg-white/5 border border-white/10 rounded-lg p-2.5 text-white"
                  value={selectedNewLeader}
                  onChange={(e) => setSelectedNewLeader(e.target.value)}
                >
                  <option value="">Pilih Member...</option>
                  {otherMembers.map((m: any) => (
                    <option key={m.id} value={m.user_id}>{m.full_name || 'Unnamed Member'}</option>
                  ))}
                </select>
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setShowTransfer(false)} disabled={isProcessing}>Batal</Button>
                  <Button className="bg-[#307FE2] hover:bg-[#2060B2] text-white" onClick={handleTransfer} disabled={isProcessing || !selectedNewLeader}>
                    {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Transfer
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showConfirmDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
              <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/10 max-w-sm w-full mx-4 text-left">
                <h4 className="text-lg font-semibold text-white mb-2">Konfirmasi Hapus Tim</h4>
                <p className="text-white/70 mb-4 text-sm">
                  Ketik <strong>{team.name}</strong> untuk mengonfirmasi penghapusan tim. Seluruh data tim akan hilang dan tidak dapat dikembalikan.
                </p>
                <input
                  type="text"
                  value={confirmTeamName}
                  onChange={(e) => setConfirmTeamName(e.target.value)}
                  className="w-full mb-6 bg-white/5 border border-white/10 rounded-lg p-2.5 text-white"
                  placeholder="Nama Tim"
                />
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setShowConfirmDelete(false)} disabled={isProcessing}>Batal</Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={isProcessing || confirmTeamName !== team.name}>
                    {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Ya, Hapus Tim
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
