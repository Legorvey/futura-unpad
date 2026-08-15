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
        await joinTeam(joinCode);
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
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-amber-500/20">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-3xl font-bold tracking-tight">
            Registrasi Mechatura <span className="text-amber-500">2026</span>
          </DialogTitle>
          <DialogDescription>
            Lengkapi tahapan di bawah ini untuk memulai perjalanan kompetisi Anda.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 pb-4">
          {/* STEP 1: CATEGORY */}
          <div className="space-y-4 relative">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 font-bold text-sm">
                1
              </div>
              <h3 className="text-lg font-semibold">Pilih Kategori Lomba</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-11">
              <button
                type="button"
                onClick={() => setCategory("robot_sumo")}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left ${
                  category === "robot_sumo"
                    ? "border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    : "border-border hover:border-amber-500/50 hover:bg-amber-500/5"
                }`}
              >
                <div className={`p-3 rounded-lg ${category === "robot_sumo" ? "bg-amber-500 text-black" : "bg-muted text-muted-foreground"}`}>
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Robot Sumo</h4>
                  <p className="text-xs text-muted-foreground mt-1">Adu ketangkasan robot di arena</p>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setCategory("robot_transporter")}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left ${
                  category === "robot_transporter"
                    ? "border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    : "border-border hover:border-amber-500/50 hover:bg-amber-500/5"
                }`}
              >
                <div className={`p-3 rounded-lg ${category === "robot_transporter" ? "bg-amber-500 text-black" : "bg-muted text-muted-foreground"}`}>
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Robot Transporter</h4>
                  <p className="text-xs text-muted-foreground mt-1">Selesaikan misi pemindahan objek</p>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 2: ACTION */}
          <div className={`space-y-4 transition-all duration-500 ${!category ? "opacity-40 grayscale pointer-events-none blur-[1px]" : "opacity-100"}`}>
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-colors ${category ? "bg-amber-500/20 text-amber-500" : "bg-muted text-muted-foreground"}`}>
                2
              </div>
              <h3 className="text-lg font-semibold">Status Tim</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-11">
              <button
                type="button"
                onClick={() => setAction("create")}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left ${
                  action === "create"
                    ? "border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    : "border-border hover:border-amber-500/50 hover:bg-amber-500/5"
                }`}
              >
                <div className={`p-3 rounded-lg ${action === "create" ? "bg-amber-500 text-black" : "bg-muted text-muted-foreground"}`}>
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Buat Tim Baru</h4>
                  <p className="text-xs text-muted-foreground mt-1">Jadi ketua & undang anggota</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAction("join")}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left ${
                  action === "join"
                    ? "border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    : "border-border hover:border-amber-500/50 hover:bg-amber-500/5"
                }`}
              >
                <div className={`p-3 rounded-lg ${action === "join" ? "bg-amber-500 text-black" : "bg-muted text-muted-foreground"}`}>
                  <Link2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Bergabung</h4>
                  <p className="text-xs text-muted-foreground mt-1">Gunakan kode dari ketua tim</p>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 3: FORM */}
          <div className={`space-y-4 transition-all duration-500 ${!action || !category ? "opacity-40 grayscale pointer-events-none blur-[1px] h-0 overflow-hidden" : "opacity-100 h-auto"}`}>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 font-bold text-sm">
                3
              </div>
              <h3 className="text-lg font-semibold">Detail {action === "create" ? "Tim" : "Undangan"}</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6 pl-11">
              {action === "create" ? (
                <div className="space-y-2">
                  <Label htmlFor="teamName" className="font-medium text-muted-foreground">Nama Tim Anda</Label>
                  <Input
                    id="teamName"
                    placeholder="Masukkan nama tim yang keren..."
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                    className="h-12 bg-background focus-visible:ring-amber-500 text-lg"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="joinCode" className="font-medium text-muted-foreground">Kode Undangan</Label>
                  <Input
                    id="joinCode"
                    placeholder="Masukkan 6-karakter kode"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    required
                    className="h-12 bg-background focus-visible:ring-amber-500 text-lg tracking-widest uppercase font-mono"
                  />
                </div>
              )}
              
              <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>{action === "create" ? "Bentuk Tim & Lanjut" : "Gabung Tim"}</>
                )}
              </Button>
            </form>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
