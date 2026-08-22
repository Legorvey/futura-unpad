"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createTeam, joinTeam } from "@/lib/mechatura/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Bot, Car, Plus, Link2 } from "lucide-react";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormTextField } from "@/components/form/form-text-field";
import { FieldGroup } from "@/components/ui/field";

const createTeamSchema = z.object({
  teamName: z.string().min(3, "Nama tim minimal 3 karakter").max(50, "Nama tim maksimal 50 karakter")
});

const joinTeamSchema = z.object({
  joinCode: z.string().length(6, "Kode undangan harus 6 karakter")
});

type CreateTeamValues = z.infer<typeof createTeamSchema>;
type JoinTeamValues = z.infer<typeof joinTeamSchema>;

interface MechaturaRegistrationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MechaturaRegistrationModal({ isOpen, onOpenChange }: MechaturaRegistrationModalProps) {
  const router = useRouter();
  const [category, setCategory] = useState<string | null>(null);
  const [action, setAction] = useState<"create" | "join" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createForm = useForm<CreateTeamValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: { teamName: "" }
  });

  const joinForm = useForm<JoinTeamValues>({
    resolver: zodResolver(joinTeamSchema),
    defaultValues: { joinCode: "" }
  });

  const handleCreateSubmit = async (values: CreateTeamValues) => {
    setIsSubmitting(true);
    try {
      if (!category) throw new Error("Kategori belum dipilih");
      const res = await createTeam(category, values.teamName);
      if (res && !res.success) {
        if (res.error?.includes("logged in")) {
          toast.info("Silakan login terlebih dahulu untuk mendaftar.");
          router.push("/login?next=/mechatura");
          return;
        }
        throw new Error(res.error || "Gagal membuat tim.");
      }
      toast.success("Tim berhasil dibuat!");
      onOpenChange(false);
      router.push("/profile/mechatura");
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinSubmit = async (values: JoinTeamValues) => {
    setIsSubmitting(true);
    try {
      if (!category) throw new Error("Kategori belum dipilih");
      const res = await joinTeam(values.joinCode, category);
      if (res && !res.success) {
        if (res.error?.includes("logged in")) {
          toast.info("Silakan login terlebih dahulu untuk bergabung.");
          router.push("/login?next=/mechatura");
          return;
        }
        throw new Error(res.error || "Gagal bergabung dengan tim.");
      }
      toast.success("Berhasil bergabung dengan tim!");
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
      createForm.reset();
      joinForm.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white text-slate-900 border-slate-200 shadow-xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900">
            Registrasi Mechatura 2026
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Pilih kategori kompetisi dan bentuk tim Anda untuk memulai perjalanan di Mechatura.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-2">
          
          {/* STEP 1: CATEGORY */}
          <div className="space-y-3 relative">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-semibold text-xs">
                1
              </div>
              <h3 className="text-base font-medium text-slate-900">Pilih Kategori Lomba</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
              <button
                type="button"
                onClick={() => setCategory("robot_sumo")}
                className={`flex items-center gap-3 p-4 rounded-md border transition-all text-left ${
                  category === "robot_sumo"
                    ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500"
                    : "border-slate-200 hover:border-amber-500/50 hover:bg-slate-50"
                }`}
              >
                <div className={`p-2 rounded-md ${category === "robot_sumo" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}>
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 text-sm">Robot Sumo</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Adu ketangkasan robot di arena</p>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setCategory("robot_transporter")}
                className={`flex items-center gap-3 p-4 rounded-md border transition-all text-left ${
                  category === "robot_transporter"
                    ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500"
                    : "border-slate-200 hover:border-amber-500/50 hover:bg-slate-50"
                }`}
              >
                <div className={`p-2 rounded-md ${category === "robot_transporter" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}>
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 text-sm">Robot Transporter</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Selesaikan misi pemindahan objek</p>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 2: ACTION */}
          <div className={`space-y-3 transition-opacity duration-300 ${!category ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-semibold text-xs">
                2
              </div>
              <h3 className="text-base font-medium text-slate-900">Status Tim</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
              <button
                type="button"
                onClick={() => setAction("create")}
                className={`flex items-center gap-3 p-4 rounded-md border transition-all text-left ${
                  action === "create"
                    ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500"
                    : "border-slate-200 hover:border-amber-500/50 hover:bg-slate-50"
                }`}
              >
                <div className={`p-2 rounded-md ${action === "create" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}>
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 text-sm">Buat Tim Baru</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Jadi ketua & undang anggota</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAction("join")}
                className={`flex items-center gap-3 p-4 rounded-md border transition-all text-left ${
                  action === "join"
                    ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500"
                    : "border-slate-200 hover:border-amber-500/50 hover:bg-slate-50"
                }`}
              >
                <div className={`p-2 rounded-md ${action === "join" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}>
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 text-sm">Bergabung</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Gunakan kode dari ketua tim</p>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 3: FORM */}
          <div className={`space-y-3 transition-opacity duration-300 ${!action || !category ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-semibold text-xs">
                3
              </div>
              <h3 className="text-base font-medium text-slate-900">Detail {action === "create" ? "Tim" : "Undangan"}</h3>
            </div>
            
            <div className="pl-8">
              {action === "create" ? (
                <FormProvider {...createForm}>
                  <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} noValidate className="space-y-5">
                    <FieldGroup>
                      <FormTextField<CreateTeamValues>
                        name="teamName"
                        label={<span className="text-slate-900">Nama Tim Anda</span>}
                        placeholder="Masukkan nama tim..."
                        className="max-w-sm"
                        inputClassName="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                      />
                    </FieldGroup>
                    <Button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Bentuk Tim & Lanjut
                    </Button>
                  </form>
                </FormProvider>
              ) : action === "join" ? (
                <FormProvider {...joinForm}>
                  <form onSubmit={joinForm.handleSubmit(handleJoinSubmit)} noValidate className="space-y-5">
                    <FieldGroup>
                      <FormTextField<JoinTeamValues>
                        name="joinCode"
                        label={<span className="text-slate-900">Kode Undangan</span>}
                        placeholder="Masukkan 6 karakter kode..."
                        className="max-w-sm uppercase font-mono tracking-widest"
                        inputClassName="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                      />
                    </FieldGroup>
                    <Button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Gabung Tim
                    </Button>
                  </form>
                </FormProvider>
              ) : null}
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
