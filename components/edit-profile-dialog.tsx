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
          setFieldError("username", { message: "This username is already taken." });
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

    if (values.display_name !== initialDisplayName) {
      if (!updates.data) updates.data = {}
      updates.data.display_name = values.display_name
    }

    const emailChanged = values.email !== initialEmail
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
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile/account`
      })

      if (updateError) {
        throw updateError
      }

      if (emailChanged) {
        setSuccessMessage("A confirmation link has been sent to both your current and new email addresses. Please verify both to finalize the change.")
        // Do not close immediately so they can read the message
      } else {
        router.refresh()
        setOpen(false)
      }
    } catch (err: unknown) {
      let errorMessage =
        err instanceof Error ? err.message : "Failed to update profile."
      if (errorMessage.toLowerCase().includes("invalid email")) {
        errorMessage = "Please enter a valid email address."
      } else if (errorMessage.toLowerCase().includes("already registered") || errorMessage.toLowerCase().includes("already exists")) {
        errorMessage = "This email address is already in use by another account."
      } else if (errorMessage.toLowerCase().includes("same as the old email")) {
        errorMessage = "You are already using this email address."
      } else if (errorMessage.toLowerCase().includes("rate limit")) {
        errorMessage = "Too many attempts. Please try again later."
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
          <span className="hidden sm:inline">Edit Profile</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                placeholder="e.g. John Doe"
                aria-invalid={!!errors.display_name}
                {...register("display_name")}
              />
              {errors.display_name && (
                <p className="text-sm text-destructive">{errors.display_name.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="e.g. johndoe"
                aria-invalid={!!errors.username}
                {...register("username")}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Your unique username to log in with.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                A confirmation link will be sent to your current and new email addresses to verify the change.
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400">
                {successMessage}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
