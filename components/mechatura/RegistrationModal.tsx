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
      await createTeam(category, values.teamName);
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
      await joinTeam(values.joinCode, category);
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
            <div className="pl-8 pt-2">
              {action === "create" && (
                <div className="text-xs text-muted-foreground bg-blue-500/10 text-blue-600 dark:text-blue-400 p-3 rounded-lg border border-blue-500/20">
                  <strong>Ketentuan Tim Baru:</strong> Satu tim terdiri dari 1-3 anggota (1 ketua) dengan pembimbing opsional. Bebas lintas institusi (pelajar, mahasiswa, umum). Satu peserta hanya boleh terdaftar pada satu tim. Pastikan nama tim tidak mengandung unsur SARA atau pornografi.
                </div>
              )}
              {action === "join" && (
                <div className="text-xs text-muted-foreground bg-amber-500/10 text-amber-600 dark:text-amber-400 p-3 rounded-lg border border-amber-500/20">
                  <strong>Ketentuan Bergabung:</strong> Anda hanya dapat bergabung ke dalam 1 tim. Pastikan kode undangan (join code) yang Anda masukkan benar dan tim yang dituju belum mencapai batas maksimal (3 anggota).
                </div>
              )}
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
            
            <div className="pl-8">
              {action === "create" ? (
                <FormProvider {...createForm}>
                  <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} noValidate className="space-y-5">
                    <FieldGroup>
                      <FormTextField<CreateTeamValues>
                        name="teamName"
                        label="Nama Tim Anda"
                        placeholder="Masukkan nama tim..."
                        className="max-w-sm"
                      />
                    </FieldGroup>
                    <Button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
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
                        label="Kode Undangan"
                        placeholder="Masukkan 6 karakter kode..."
                        className="max-w-sm uppercase font-mono tracking-widest"
                      />
                    </FieldGroup>
                    <Button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
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
