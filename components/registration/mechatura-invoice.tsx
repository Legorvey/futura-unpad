"use client";

import type { ReactNode } from "react";
import { Download, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MechaturaTicketDownloadButton } from "@/components/registration/mechatura-ticket-download-button";
import type { MechaturaPaymentOrder } from "@/lib/mechatura/payment";

export type ReceiptData = {
  title: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  program: string;
  ticket: string;
  amount: string;
  paidAt: string;
  invoiceId: string;
  referenceId: string;
  mechaturaDetails?: {
    teamName: string;
    robotName: string;
    competitionType: string;
    coach?: { name: string; email: string; phone: string };
    members: Array<{ name: string; email: string; phone: string }>;
  };
};

const receiptRows = (receipt: ReceiptData) => [
  ["Name", receipt.name],
  ["Email", receipt.email],
  ["Phone", receipt.phone],
  ["Institution", receipt.institution],
  ["Program", receipt.program],
  ["Ticket", receipt.ticket],
  ["Payment Date", receipt.paidAt],
  ["Invoice ID", receipt.invoiceId],
  ["Reference ID", receipt.referenceId],
];

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number = 34
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
  return currentY;
}

function downloadInvoice(receipt: ReceiptData) {
  const canvas = document.createElement("canvas");
  const width = 2480; // A4 width at 300 DPI
  const height = 3508; // A4 height at 300 DPI
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Top Accent Bar
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, width, 40);

  // --- Header ---
  ctx.fillStyle = "#111111";
  ctx.font = "800 120px Inter, Arial, sans-serif";
  ctx.fillText("FUTURA", 160, 240);
  
  ctx.fillStyle = "#666666";
  ctx.font = "600 44px Inter, Arial, sans-serif";
  ctx.fillText("UNIVERSITAS PADJADJARAN", 160, 310);

  ctx.fillStyle = "#e5e7eb";
  ctx.font = "800 140px Inter, Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("INVOICE", width - 160, 240);
  ctx.textAlign = "left"; 

  ctx.fillStyle = "#4b5563";
  ctx.font = "500 40px Inter, Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`Invoice ID: ${receipt.invoiceId || "-"}`, width - 160, 310);
  ctx.textAlign = "left";

  // --- Separator ---
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(160, 420);
  ctx.lineTo(width - 160, 420);
  ctx.stroke();

  // --- Bill To & Details ---
  // Left Side: Bill To
  ctx.fillStyle = "#9ca3af";
  ctx.font = "600 36px Inter, Arial, sans-serif";
  ctx.fillText("BILLED TO:", 160, 520);

  ctx.fillStyle = "#111111";
  ctx.font = "700 52px Inter, Arial, sans-serif";
  ctx.fillText(receipt.name || "-", 160, 590);
  
  ctx.fillStyle = "#4b5563";
  ctx.font = "400 44px Inter, Arial, sans-serif";
  ctx.fillText(receipt.institution || "-", 160, 650);
  ctx.fillText(receipt.email || "-", 160, 710);
  ctx.fillText(receipt.phone || "-", 160, 770);

  // Right Side: Invoice Details
  ctx.fillStyle = "#9ca3af";
  ctx.font = "600 36px Inter, Arial, sans-serif";
  ctx.fillText("PAYMENT DETAILS:", 1400, 520);

  ctx.fillStyle = "#4b5563";
  ctx.font = "400 44px Inter, Arial, sans-serif";
  ctx.fillText("Date Paid:", 1400, 590);
  ctx.fillText("Reference:", 1400, 650);
  ctx.fillText("Status:", 1400, 710);

  ctx.fillStyle = "#111111";
  ctx.font = "600 44px Inter, Arial, sans-serif";
  ctx.fillText(receipt.paidAt || "-", 1650, 590);
  ctx.fillText(receipt.referenceId || "-", 1650, 650);
  
  // Paid Badge
  ctx.fillStyle = "#059669"; // Emerald 600
  ctx.font = "700 44px Inter, Arial, sans-serif";
  ctx.fillText("PAID", 1650, 710);

  // --- Optional Mechatura Details ---
  let currentY = 880;
  if (receipt.mechaturaDetails) {
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(160, currentY);
    ctx.lineTo(width - 160, currentY);
    ctx.stroke();

    currentY += 100;

    // Left Side: Team Details
    ctx.fillStyle = "#9ca3af";
    ctx.font = "600 36px Inter, Arial, sans-serif";
    ctx.fillText("TEAM DETAILS:", 160, currentY);
    
    ctx.fillStyle = "#4b5563";
    ctx.font = "400 44px Inter, Arial, sans-serif";
    ctx.fillText("Team Name:", 160, currentY + 70);
    ctx.fillText("Robot Name:", 160, currentY + 130);
    ctx.fillText("Competition:", 160, currentY + 190);
    if (receipt.mechaturaDetails.coach) {
      ctx.fillText("Coach:", 160, currentY + 250);
    }

    ctx.fillStyle = "#111111";
    ctx.font = "600 44px Inter, Arial, sans-serif";
    ctx.fillText(receipt.mechaturaDetails.teamName || "-", 480, currentY + 70);
    ctx.fillText(receipt.mechaturaDetails.robotName || "-", 480, currentY + 130);
    ctx.fillText(receipt.mechaturaDetails.competitionType || "-", 480, currentY + 190);
    if (receipt.mechaturaDetails.coach) {
      ctx.fillText(receipt.mechaturaDetails.coach.name || "-", 480, currentY + 250);
    }

    // Right Side: Team Members
    ctx.fillStyle = "#9ca3af";
    ctx.font = "600 36px Inter, Arial, sans-serif";
    ctx.fillText("TEAM MEMBERS:", 1400, currentY);

    let memberY = currentY + 70;
    receipt.mechaturaDetails.members.forEach((member, idx) => {
      ctx.fillStyle = "#111111";
      ctx.font = "600 40px Inter, Arial, sans-serif";
      ctx.fillText(`${idx + 1}. ${member.name}`, 1400, memberY);
      
      ctx.fillStyle = "#4b5563";
      ctx.font = "400 36px Inter, Arial, sans-serif";
      ctx.fillText(member.email, 1450, memberY + 50);
      
      memberY += 120;
    });

    currentY = Math.max(memberY + 40, currentY + 360);
  }

  // --- Table Header ---
  const tableTop = currentY + 80;
  ctx.fillStyle = "#f3f4f6";
  ctx.fillRect(160, tableTop, width - 320, 120);
  
  ctx.fillStyle = "#4b5563";
  ctx.font = "600 36px Inter, Arial, sans-serif";
  ctx.fillText("DESCRIPTION", 220, tableTop + 75);
  ctx.fillText("PROGRAM", 1100, tableTop + 75);
  ctx.fillText("TICKET", 1550, tableTop + 75);
  ctx.textAlign = "right";
  ctx.fillText("AMOUNT", width - 220, tableTop + 75);
  ctx.textAlign = "left";

  // --- Table Row ---
  const rowTop = tableTop + 200;
  ctx.fillStyle = "#111111";
  ctx.font = "600 48px Inter, Arial, sans-serif";
  
  // Use drawText for multiline description support
  const nextY = drawText(ctx, receipt.title || "Event Registration", 220, rowTop, 800, 60);
  
  ctx.font = "400 44px Inter, Arial, sans-serif";
  ctx.fillText(receipt.program || "-", 1100, rowTop);
  ctx.fillText(receipt.ticket || "-", 1550, rowTop);
  
  ctx.textAlign = "right";
  ctx.font = "600 48px Inter, Arial, sans-serif";
  ctx.fillText(receipt.amount || "-", width - 220, rowTop);
  ctx.textAlign = "left";

  const rowBottom = Math.max(nextY + 100, rowTop + 100);

  // Table Bottom Line
  ctx.beginPath();
  ctx.moveTo(160, rowBottom);
  ctx.lineTo(width - 160, rowBottom);
  ctx.stroke();

  // --- Total Section ---
  ctx.fillStyle = "#111111";
  ctx.textAlign = "right";
  ctx.font = "600 48px Inter, Arial, sans-serif";
  ctx.fillText("TOTAL PAID", width - 700, rowBottom + 160);
  
  ctx.font = "800 80px Inter, Arial, sans-serif";
  ctx.fillText(receipt.amount || "-", width - 160, rowBottom + 170);
  ctx.textAlign = "left";

  // --- Footer ---
  const footerY = height - 250;
  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(0, height - 400, width, 400);

  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, height - 400);
  ctx.lineTo(width, height - 400);
  ctx.stroke();

  ctx.fillStyle = "#6b7280";
  ctx.font = "400 40px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Thank you for your registration.", width / 2, footerY);
  ctx.fillText("For any inquiries, please contact us at futura@unpad.ac.id", width / 2, footerY + 60);
  
  ctx.font = "600 36px Inter, Arial, sans-serif";
  ctx.fillText("FUTURA UNPAD 2026", width / 2, footerY + 140);
  ctx.textAlign = "left";

  // Trigger Download
  const link = document.createElement("a");
  link.download = `futura-invoice-${receipt.referenceId || "download"}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

type ReceiptDownloadButtonProps = {
  receipt: ReceiptData;
  children?: ReactNode;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
};

export function ReceiptDownloadButton({
  receipt,
  children = "Save Invoice as Image",
  className,
  variant = "outline",
}: ReceiptDownloadButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={() => downloadInvoice(receipt)}
    >
      <Download className="h-4 w-4 mr-2" />
      {children}
    </Button>
  );
}

export function ReceiptImage({ receipt, mechaturaOrder }: { receipt: ReceiptData; mechaturaOrder?: MechaturaPaymentOrder }) {
  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-start gap-4 p-5 sm:p-6 border-b">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
            <CheckCircle2 className="h-5 w-5 text-foreground" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">
              Your Mechatura ticket is ready
            </h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-500">
              Your Mechatura registration is saved. Download your ticket or keep
              the registration ID for check-in.
            </p>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">
              {receipt.amount}
            </p>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            {receiptRows(receipt).map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 break-words font-medium">{value || "-"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {mechaturaOrder && receipt.program.toLowerCase().includes("mechatura") && (
          <MechaturaTicketDownloadButton
            registrationId={mechaturaOrder.id}
            teamName={mechaturaOrder.teamName || ""}
            institution={mechaturaOrder.institution || ""}
            competitionType={mechaturaOrder.competitionType || null}
            robotName={mechaturaOrder.robotName || ""}
            leaderName={mechaturaOrder.leader?.name || ""}
            className="h-11 w-full rounded-xl"
          />
        )}
        <ReceiptDownloadButton receipt={receipt} className="h-11 w-full rounded-xl" />
      </div>
    </section>
  );
}

