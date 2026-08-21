"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText: string
  cancelText?: string
  variant?: "default" | "destructive" | "amber"
  isLoading?: boolean
  contentClassName?: string
  onConfirm: () => Promise<void> | void
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
  contentClassName,
  onConfirm,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false)
  const [error, setError] = useState("")
  const loading = isLoading || internalLoading

  const handleConfirm = async () => {
    setError("")
    setInternalLoading(true)

    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      setError(
        error instanceof Error
          ? error.message
          : "Action failed. Please try again."
      )
    } finally {
      setInternalLoading(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!loading) {
          setError("")
          onOpenChange(nextOpen)
        }
      }}
    >
      <AlertDialogContent className={contentClassName}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className={contentClassName ? "text-slate-500" : undefined}>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} className={contentClassName ? "text-slate-900 border-slate-300 hover:bg-slate-100 hover:text-slate-900" : undefined}>{cancelText}</AlertDialogCancel>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            className={variant === "amber" ? "bg-amber-500 hover:bg-amber-600 text-white border-0" : ""}
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? "Please wait..." : confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
