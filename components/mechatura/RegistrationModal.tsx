"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTeam, joinTeam } from "@/lib/mechatura/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Bot, Car, Users, UserPlus, Plus, Link2 } from "lucide-react";

interface MechaturaRegistrationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MechaturaRegistrationModal({ isOpen, onOpenChange }: MechaturaRegistrationModalProps) {
  const router = useRouter();
  const [category, setCategory] = useState<string | null>(null);
  const [action, setAction] = useState<"create" | "join" | null>(null);
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (action === "create") {
        if (!category) throw new Error("Kategori belum dipilih");
        await createTeam(category, teamName);
        toast.success("Tim berhasil dibuat!");
      } else {
        if (!category) throw new Error("Kategori belum dipilih");
        await joinTeam(joinCode, category);
        toast.success("Berhasil bergabung dengan tim!");
      }
      onOpenChange(false);
      router.push("/profile/mechatura");
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setCategory(null);
      setAction(null);
      setTeamName("");
      setJoinCode("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Registrasi Mechatura 2026
          </DialogTitle>
          <DialogDescription>
            Pilih kategori lomba dan bentuk tim Anda untuk melanjutkan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pb-2">
          {/* STEP 1: CATEGORY */}
          <div className="space-y-3 relative">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground font-semibold text-xs">
                1
              </div>
              <h3 className="text-base font-medium">Pilih Kategori Lomba</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
              <button
                type="button"
                onClick={() => setCategory("robot_sumo")}
                className={`flex items-center gap-3 p-4 rounded-md border transition-all text-left ${
                  category === "robot_sumo"
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-500/10 ring-1 ring-amber-500"
                    : "border-border hover:border-amber-500/50 hover:bg-muted/50"
                }`}
              >
                <div className={`p-2 rounded-md ${category === "robot_sumo" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground"}`}>
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">Robot Sumo</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Adu ketangkasan robot di arena</p>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setCategory("robot_transporter")}
                className={`flex items-center gap-3 p-4 rounded-md border transition-all text-left ${
                  category === "robot_transporter"
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-500/10 ring-1 ring-amber-500"
                    : "border-border hover:border-amber-500/50 hover:bg-muted/50"
                }`}
              >
                <div className={`p-2 rounded-md ${category === "robot_transporter" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground"}`}>
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">Robot Transporter</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Selesaikan misi pemindahan objek</p>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 2: ACTION */}
          <div className={`space-y-3 transition-opacity duration-300 ${!category ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground font-semibold text-xs">
                2
              </div>
              <h3 className="text-base font-medium">Status Tim</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
              <button
                type="button"
                onClick={() => setAction("create")}
                className={`flex items-center gap-3 p-4 rounded-md border transition-all text-left ${
                  action === "create"
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-500/10 ring-1 ring-amber-500"
                    : "border-border hover:border-amber-500/50 hover:bg-muted/50"
                }`}
              >
                <div className={`p-2 rounded-md ${action === "create" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground"}`}>
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">Buat Tim Baru</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Jadi ketua & undang anggota</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAction("join")}
                className={`flex items-center gap-3 p-4 rounded-md border transition-all text-left ${
                  action === "join"
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-500/10 ring-1 ring-amber-500"
                    : "border-border hover:border-amber-500/50 hover:bg-muted/50"
                }`}
              >
                <div className={`p-2 rounded-md ${action === "join" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground"}`}>
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">Bergabung</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Gunakan kode dari ketua tim</p>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 3: FORM */}
          <div className={`space-y-3 transition-opacity duration-300 ${!action || !category ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground font-semibold text-xs">
                3
              </div>
              <h3 className="text-base font-medium">Detail {action === "create" ? "Tim" : "Undangan"}</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5 pl-8">
              {action === "create" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="teamName" className="text-sm font-medium">Nama Tim Anda</Label>
                  <Input
                    id="teamName"
                    placeholder="Masukkan nama tim..."
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                    className="max-w-sm"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="joinCode" className="text-sm font-medium">Kode Undangan</Label>
                  <Input
                    id="joinCode"
                    placeholder="Masukkan 6 karakter kode..."
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    required
                    className="max-w-sm uppercase font-mono tracking-widest"
                  />
                </div>
              )}
              
              <Button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {action === "create" ? "Bentuk Tim & Lanjut" : "Gabung Tim"}
              </Button>
            </form>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
