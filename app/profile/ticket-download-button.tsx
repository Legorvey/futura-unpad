"use client"

import { Button } from "@/components/ui/button"
import { Download, Eye } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import JSZip from "jszip"
import { statusLabels } from "@/lib/payment"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export type DownloadRegistrationData = {
    id: string
    nama_lengkap: string
    asal_institusi: string
    email?: string | null
    no_telepon?: string | null
    status_akademika: string | null
    registration_type: string | null
    group_name?: string | null
    is_main_contact?: boolean
    attended?: boolean
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word;

    if (ctx.measureText(nextLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = nextLine;
    }
  }

  ctx.fillText(line, x, currentY);
}

export function TicketDownloadButton({
    mainContact,
    members = []
}: {
    mainContact: DownloadRegistrationData
    members?: DownloadRegistrationData[]
}) {
    const [isDownloading, setIsDownloading] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [showDialog, setShowDialog] = useState(false)
    const [ticketImages, setTicketImages] = useState<string[]>([])
    
    const allRegistrations = [mainContact, ...members]
    const isGroup = mainContact.registration_type === "group"

    const statusLabel = mainContact.status_akademika 
        ? (statusLabels[mainContact.status_akademika as keyof typeof statusLabels] || "-")
        : "-"

    const generateTicketCanvas = async (reg: DownloadRegistrationData) => {
        const canvas = document.createElement("canvas");
        canvas.width = 1200;
        canvas.height = 720;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (reg.attended) {
            ctx.strokeStyle = "#22c55e"; // Green for checked in
        } else {
            ctx.strokeStyle = "#111111"; // Default black
        }
        ctx.lineWidth = 4;
        ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

        ctx.fillStyle = "#111111";
        ctx.font = "700 54px Arial";
        ctx.fillText(`Futura Seminar${isGroup && mainContact.group_name ? ` (${mainContact.group_name})` : ""}`, 90, 140);

        ctx.font = "400 24px Arial";
        ctx.fillStyle = "#666666";
        ctx.fillText("Futura Seminar", 90, 180);

        ctx.fillStyle = "#111111";
        ctx.font = "700 46px Arial";
        drawWrappedText(ctx, reg.nama_lengkap || "-", 90, 285, 680, 56);

        ctx.font = "400 24px Arial";
        ctx.fillStyle = "#666666";
        // Always use main contact's email/phone for all tickets
        ctx.fillText(mainContact.email || "-", 90, 350);
        ctx.fillText(mainContact.no_telepon || "-", 90, 388);

        ctx.strokeStyle = "#d4d4d4";
        ctx.setLineDash([12, 12]);
        ctx.beginPath();
        ctx.moveTo(820, 95);
        ctx.lineTo(820, canvas.height - 95);
        ctx.stroke();
        ctx.setLineDash([]);

        const rows = [
            ["Institution", reg.asal_institusi || mainContact.asal_institusi || "-"],
            ["Status", statusLabel],
            ["Registration ID", reg.id],
        ];

        if (isGroup) {
            rows.push(["Total Participants", `${allRegistrations.length} People`]);
        }

        let y = 150;
        for (const [label, value] of rows) {
            ctx.fillStyle = "#777777";
            ctx.font = "400 20px Arial";
            ctx.fillText(label, 870, y);

            ctx.fillStyle = "#111111";
            ctx.font = "700 24px Arial";
            drawWrappedText(ctx, value || "-", 870, y + 34, 245, 30);
            y += 110;
        }

        ctx.fillStyle = "#666666";
        ctx.font = "400 22px Arial";
        ctx.fillText("Show this ticket during seminar check-in.", 90, 650);

        const qrCanvas = document.getElementById(`qr-canvas-${reg.id}`) as HTMLCanvasElement;
        if (qrCanvas) {
            ctx.drawImage(qrCanvas, 90, 410, 200, 200);
        }

        return canvas;
    }

    const handleViewTickets = async () => {
        setIsGenerating(true)
        await new Promise(r => setTimeout(r, 50)) // Tick for UI
        try {
            const canvases = await Promise.all(allRegistrations.map(generateTicketCanvas))
            const urls = canvases.filter(Boolean).map(c => c!.toDataURL("image/png"))
            setTicketImages(urls)
            setShowDialog(true)
        } catch (e) {
            console.error("View ticket generation failed", e)
        } finally {
            setIsGenerating(false)
        }
    }

    const downloadTicket = async () => {
        setIsDownloading(true)
        await new Promise(r => setTimeout(r, 50)) // Tick for UI
        try {
            const canvases = await Promise.all(allRegistrations.map(generateTicketCanvas))
            const validCanvases = canvases.filter(Boolean) as HTMLCanvasElement[]

            if (isGroup && allRegistrations.length > 1) {
                const zip = new JSZip();
                
                await Promise.all(validCanvases.map(async (canvas, i) => {
                    const reg = allRegistrations[i]
                    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
                    if (blob) {
                        const groupSegment = (isGroup && mainContact.group_name) ? mainContact.group_name : "Individu";
                        const nameSegment = reg.nama_lengkap || "TICKET";
                        const instSegment = reg.asal_institusi || mainContact.asal_institusi || "Institusi";
                        const safeFileName = `${groupSegment}_${nameSegment}_${instSegment}_${reg.id}`.replace(/[^a-z0-9_]/gi, '_');
                        zip.file(`${safeFileName}.png`, blob);
                    }
                }))

                const zipBlob = await zip.generateAsync({ type: "blob" });
                const link = document.createElement("a");
                link.download = `Futura_Group_Tickets.zip`;
                link.href = URL.createObjectURL(zipBlob);
                link.click();
            } else {
                const canvas = validCanvases[0]
                const reg = allRegistrations[0]
                const groupSegment = (isGroup && mainContact.group_name) ? mainContact.group_name : "Individu";
                const nameSegment = reg.nama_lengkap || "TICKET";
                const instSegment = reg.asal_institusi || mainContact.asal_institusi || "Institusi";
                const safeFileName = `${groupSegment}_${nameSegment}_${instSegment}_${reg.id}`.replace(/[^a-z0-9_]/gi, '_');
                
                const link = document.createElement("a");
                link.download = `${safeFileName}.png`;
                link.href = canvas.toDataURL("image/png");
                link.click();
            }
        } catch (e) {
            console.error("Ticket generation failed", e)
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <div className="flex flex-col gap-3">
            <Button
                type="button"
                variant="outline"
                className="w-full shrink-0"
                onClick={handleViewTickets}
                disabled={isGenerating || isDownloading}
            >
                <Eye className="h-4 w-4 mr-2" />
                {isGenerating ? "Preparing..." : "View ticket(s)"}
            </Button>
            <Button
                type="button"
                className="w-full shrink-0 bg-black text-white hover:bg-zinc-800"
                onClick={downloadTicket}
                disabled={isDownloading || isGenerating}
            >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? "Preparing..." : (isGroup ? "Download group tickets (ZIP)" : "Download ticket")}
            </Button>
            
            {/* Hidden canvases for generating QR codes */}
            <div style={{ display: 'none' }}>
               {allRegistrations.map(reg => (
                 <QRCodeCanvas key={reg.id} id={`qr-canvas-${reg.id}`} value={reg.id} size={200} />
               ))}
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Your Ticket(s)</DialogTitle>
                        <DialogDescription>
                            Present this ticket during the event check-in. You can also download them directly to your device.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-6 py-4">
                        {ticketImages.map((img, i) => (
                            <div key={i} className="flex flex-col items-center justify-center border border-border rounded-lg overflow-hidden p-2 bg-muted/20">
                                <img src={img} alt={`Ticket ${i + 1}`} className="w-full h-auto object-contain rounded-md shadow-sm" />
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
