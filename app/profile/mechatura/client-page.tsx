"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMemberIdentity, submitPaymentProof, updateRobotDocuments } from "@/lib/mechatura/actions";
import { toast } from "sonner";
import { Loader2, Copy, Check } from "lucide-react";

export function MechaturaProfileClient({ currentUserMembership, team, allMembers }: any) {
  const [activeView, setActiveView] = useState<"identity" | "robot">("identity");
  
  // For copying code
  const [copied, setCopied] = useState(false);
  const copyCode = () => {
    navigator.clipboard.writeText(team.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Team Header Info */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">{team.name}</h2>
          <p className="text-white/60 capitalize mt-1">
            Category: {team.category.replace("_", " ")}
          </p>
        </div>
        
        <div className="bg-[#00205B] p-4 rounded-xl border border-white/10 flex items-center gap-4">
          <div>
            <p className="text-xs text-white/50 mb-1">Team Join Code</p>
            <p className="font-mono text-xl font-bold tracking-widest text-white">{team.join_code}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={copyCode}>
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <Button 
          variant={activeView === "identity" ? "default" : "ghost"} 
          onClick={() => setActiveView("identity")}
        >
          Identity Documents
        </Button>
        <Button 
          variant={activeView === "robot" ? "default" : "ghost"} 
          onClick={() => setActiveView("robot")}
        >
          Robot Documents & Payment
        </Button>
      </div>

      {/* Views */}
      <div className="pt-4">
        {activeView === "identity" && (
          <IdentityView currentUserMembership={currentUserMembership} allMembers={allMembers} />
        )}
        {activeView === "robot" && (
          <RobotAndPaymentView team={team} currentUserMembership={currentUserMembership} />
        )}
      </div>
    </div>
  );
}

function IdentityView({ currentUserMembership, allMembers }: any) {
  const [formData, setFormData] = useState({
    full_name: currentUserMembership.full_name || "",
    institution: currentUserMembership.institution || "",
    city: currentUserMembership.city || "",
    phone_number: currentUserMembership.phone_number || "",
    instagram_username: currentUserMembership.instagram_username || "",
    student_id_link: currentUserMembership.student_id_link || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateMemberIdentity(currentUserMembership.id, formData);
      toast.success("Identity details saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save details");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Current User Form */}
      <div className="md:col-span-2 space-y-6">
        <div>
          <h3 className="text-xl font-medium text-white">Your Details</h3>
          <p className="text-sm text-white/50">Please fill out your personal information.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input 
                value={formData.full_name} 
                onChange={e => setFormData({...formData, full_name: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Institution</Label>
              <Input 
                value={formData.institution} 
                onChange={e => setFormData({...formData, institution: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input 
                value={formData.city} 
                onChange={e => setFormData({...formData, city: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input 
                value={formData.phone_number} 
                onChange={e => setFormData({...formData, phone_number: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Instagram Username</Label>
              <Input 
                value={formData.instagram_username} 
                onChange={e => setFormData({...formData, instagram_username: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Student ID (Google Drive Link)</Label>
              <Input 
                type="url"
                value={formData.student_id_link} 
                onChange={e => setFormData({...formData, student_id_link: e.target.value})} 
                required 
              />
            </div>
          </div>
          
          <Button type="submit" disabled={isSaving} className="mt-4">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Details
          </Button>
        </form>
      </div>

      {/* Other Members Status */}
      <div>
        <h3 className="text-xl font-medium text-white mb-4">Team Members</h3>
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
    </div>
  );
}

function RobotAndPaymentView({ team, currentUserMembership }: any) {
  const isLeader = currentUserMembership?.is_leader;
  const [paymentLink, setPaymentLink] = useState(team.payment_proof_link || "");
  const [robotLink, setRobotLink] = useState(team.robot_document_link || "");
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [isSavingRobot, setIsSavingRobot] = useState(false);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPayment(true);
    try {
      await submitPaymentProof(team.id, paymentLink);
      toast.success("Payment proof submitted for verification!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit payment");
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleRobotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingRobot(true);
    try {
      await updateRobotDocuments(team.id, robotLink);
      toast.success("Robot documents saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save robot docs");
    } finally {
      setIsSavingRobot(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Payment Section */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
        <div>
          <h3 className="text-xl font-medium text-white mb-2">Team Payment</h3>
          <p className="text-sm text-white/50">Status: <span className="text-white capitalize font-medium">{team.payment_status.replace("_", " ")}</span></p>
        </div>

        <div className="bg-white/5 rounded-xl aspect-square flex items-center justify-center border border-white/10 p-4">
          <p className="text-white/40 text-center">
            [Insert QRIS Image Here]<br/>
            Note: Admin will manually verify payments.
          </p>
        </div>

        {isLeader ? (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Proof (Google Drive Link)</Label>
              <Input 
                type="url"
                value={paymentLink} 
                onChange={e => setPaymentLink(e.target.value)} 
                required 
                disabled={team.payment_status === "verified"}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSavingPayment || team.payment_status === "verified"} 
              className="w-full"
            >
              {isSavingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Proof
            </Button>
          </form>
        ) : (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-sm text-center font-medium">
            Hanya ketua tim yang dapat mengunggah bukti pembayaran.
          </div>
        )}
      </div>

      {/* Robot Documents Section */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
        <div>
          <h3 className="text-xl font-medium text-white mb-2">Robot Documents</h3>
          <p className="text-sm text-white/50">Submit your team's robot design and specifications document.</p>
        </div>

        {isLeader ? (
          <form onSubmit={handleRobotSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Document (Google Drive Link)</Label>
              <Input 
                type="url"
                value={robotLink} 
                onChange={e => setRobotLink(e.target.value)} 
                required 
              />
              <p className="text-xs text-white/40 mt-1">Make sure the link is set to "Anyone with the link can view".</p>
            </div>
            <Button type="submit" disabled={isSavingRobot}>
              {isSavingRobot && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Documents
            </Button>
          </form>
        ) : (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-sm text-center font-medium">
            Hanya ketua tim yang dapat mengunggah dokumen robot.
          </div>
        )}
      </div>
    </div>
  );
}
