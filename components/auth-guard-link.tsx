"use client"

import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useState } from "react"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button"

export function AuthGuardLink({
    href,
    className,
    children,
    onClick,
    requireAuth = false,
    prefetch,
}: {
    href: string,
    className?: string,
    children: React.ReactNode,
    onClick?: (e: React.MouseEvent) => void,
    requireAuth?: boolean,
    prefetch?: boolean | null,
}) {
    const { user, isLoading } = useAuth()
    const [open, setOpen] = useState(false)
    const linkPrefetch = prefetch ?? (requireAuth ? false : undefined)

    const handleClick = (e: React.MouseEvent) => {
        if (onClick) onClick(e)

        if (requireAuth) {
            if (isLoading) {
                e.preventDefault()
                return
            }
            if (!user) {
                e.preventDefault()
                setOpen(true)
            }
        }
    }

    return (
        <>
            <Link href={href} prefetch={linkPrefetch} onClick={handleClick} className={className}>
                {children}
            </Link>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sign in Required</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please log in or create a new account to continue to this registration form.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-4">
                        <Button variant="outline" asChild>
                            <Link href={`/login?next=${encodeURIComponent(href)}`} prefetch={false} onClick={() => setOpen(false)}>Log in</Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/register?next=${encodeURIComponent(href)}`} prefetch={false} onClick={() => setOpen(false)}>Register</Link>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
