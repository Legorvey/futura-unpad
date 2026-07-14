"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { useState } from "react"
import { downloadMechaturaTicket } from "@/lib/mechatura/mechatura-ticket-download"

type MechaturaTicketProps = {
    registrationId: string
    teamName: string
    institution: string
    competitionType: string | null
    robotName: string
    leaderName: string
    variant?: "default" | "secondary" | "outline"
    className?: string
}

export function MechaturaTicketDownloadButton({
    registrationId,
    teamName,
    institution,
    competitionType,
    robotName,
    leaderName,
    variant = "default",
    className
}: MechaturaTicketProps) {
    const [isDownloading, setIsDownloading] = useState(false)

    const handleDownload = async () => {
        setIsDownloading(true)
        // Give UI time to update state if necessary
        await new Promise(r => setTimeout(r, 50))
        try {
            await downloadMechaturaTicket({
                registrationId,
                teamName,
                institution,
                competitionType,
                robotName,
                leaderName
            })
        } catch (error) {
            console.error("Failed to download ticket", error)
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <>
            <div style={{ display: 'none' }}>
                <QRCodeCanvas
                    id={`qr-canvas-${registrationId}`}
                    value={`mechatura:${registrationId}`}
                    size={200}
                />
            </div>
            <Button
                type="button"
                variant={variant}
                className={className || (variant === "default" ? "w-full shrink-0 bg-black text-white hover:bg-zinc-800" : "w-full")}
                onClick={handleDownload}
                disabled={isDownloading}
            >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? "Preparing..." : "Download Ticket"}
            </Button>
        </>
    )
}

