"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { editProfileSchema, type EditProfileFormValues } from "@/lib/validation"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "nextjs-toploader/app"

type EditProfileDialogProps = {
  initialDisplayName: string
  initialUsername?: string
  initialEmail: string
  className?: string
}

type ProfileUpdates = {
  email?: string
  data?: {
    username?: string
    display_name?: string
  }
}

export function EditProfileDialog({ initialDisplayName, initialUsername = "", initialEmail, className }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    setError: setFieldError,
    formState: { errors },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      display_name: initialDisplayName,
      username: initialUsername,
      email: initialEmail,
    },
  })

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset state when closed
      reset({ display_name: initialDisplayName, username: initialUsername, email: initialEmail })
      setError(null)
      setSuccessMessage(null)
    }
  }

  const onSubmit = async (values: EditProfileFormValues) => {
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    const supabase = createClient()
    const updates: ProfileUpdates = {}

    // Check username uniqueness
    if (values.username !== undefined && values.username !== initialUsername) {
      if (values.username !== "") {
        const lowercaseUsername = values.username.toLowerCase();
        const { data: isTaken, error: takenError } = await supabase.rpc('is_username_taken', { p_username: lowercaseUsername });
        if (isTaken || takenError) {
          setFieldError("username", { message: "Username ini sudah digunakan." });
          setIsLoading(false);
          return;
        }
        if (!updates.data) updates.data = {}
        updates.data.username = lowercaseUsername;
      } else {
        if (!updates.data) updates.data = {}
        updates.data.username = "";
      }
    }

    if (values.display_name !== undefined && values.display_name !== initialDisplayName) {
      if (!updates.data) updates.data = {}
      updates.data.display_name = values.display_name
    }

    const emailChanged = values.email !== undefined && values.email !== "" && values.email !== initialEmail
    if (emailChanged) {
      updates.email = values.email
    }

    if (Object.keys(updates).length === 0) {
      setOpen(false)
      setIsLoading(false)
      return
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser(updates, {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile`
      })

      if (updateError) {
        throw updateError
      }

      if (emailChanged) {
        setSuccessMessage("Tautan konfirmasi telah dikirim ke alamat email lama dan baru Anda. Harap verifikasi keduanya untuk menyelesaikan perubahan.")
        // Do not close immediately so they can read the message
      } else {
        router.refresh()
        setOpen(false)
      }
    } catch (err: unknown) {
      let errorMessage =
        err instanceof Error ? err.message : "Gagal memperbarui profil."
      if (errorMessage.toLowerCase().includes("invalid email")) {
        errorMessage = "Harap masukkan alamat email yang valid."
      } else if (errorMessage.toLowerCase().includes("already registered") || errorMessage.toLowerCase().includes("already exists")) {
        errorMessage = "Alamat email ini sudah digunakan oleh akun lain."
      } else if (errorMessage.toLowerCase().includes("same as the old email")) {
        errorMessage = "Anda sudah menggunakan alamat email ini."
      } else if (errorMessage.toLowerCase().includes("rate limit")) {
        errorMessage = "Terlalu banyak percobaan. Harap coba lagi nanti."
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className || "absolute top-4 right-4 h-8 gap-2"}>
          <Pencil className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Edit Profil</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white text-slate-900 border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Edit Profil</DialogTitle>
          <DialogDescription className="text-slate-500">
            Lakukan perubahan pada profil Anda di sini. Klik simpan setelah selesai.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="display_name" className="text-slate-900">Nama Tampilan</Label>
              <Input
                id="display_name"
                placeholder="cth. Budi Santoso"
                aria-invalid={!!errors.display_name}
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500/30 focus-visible:ring-offset-0 focus-visible:outline-none"
                {...register("display_name")}
              />
              {errors.display_name && (
                <p className="text-sm text-red-500">{errors.display_name.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username" className="text-slate-900">Username</Label>
              <Input
                id="username"
                placeholder="cth. budisantoso"
                aria-invalid={!!errors.username}
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500/30 focus-visible:ring-offset-0 focus-visible:outline-none"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Username unik Anda untuk masuk ke akun.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-900">Email</Label>
              <Input
                id="email"
                type="email"
                aria-invalid={!!errors.email}
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500/30 focus-visible:ring-offset-0 focus-visible:outline-none"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Tautan konfirmasi akan dikirim ke alamat email lama dan baru Anda untuk memverifikasi perubahan ini.
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
                {successMessage}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="bg-amber-500 hover:bg-amber-600 text-white border-transparent">
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
