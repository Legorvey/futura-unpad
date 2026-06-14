"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ReceiptData = {
  name: string;
  email: string;
  phone: string;
  institution: string;
  academicStatus: string;
  attendance: string;
  amount: string;
  paidAt: string;
  invoiceId: string;
  referenceId: string;
};

const rows = (receipt: ReceiptData) => [
  ["Name", receipt.name],
  ["Email", receipt.email],
  ["Phone", receipt.phone],
  ["Institution", receipt.institution],
  ["Academic Status", receipt.academicStatus],
  ["Attendance", receipt.attendance],
  ["Payment Date", receipt.paidAt],
  ["Invoice ID", receipt.invoiceId],
  ["Reference ID", receipt.referenceId],
];

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(nextLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += 34;
    } else {
      line = nextLine;
    }
  }

  ctx.fillText(line, x, currentY);
  return currentY;
}

export default function ReceiptImage({ receipt }: { receipt: ReceiptData }) {
  const saveReceipt = () => {
    const canvas = document.createElement("canvas");
    const width = 1080;
    const height = 1500;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 4;
    ctx.strokeRect(56, 56, width - 112, height - 112);

    ctx.fillStyle = "#111111";
    ctx.font = "700 64px Arial";
    ctx.fillText("Futura", 96, 150);

    ctx.font = "400 30px Arial";
    ctx.fillStyle = "#666666";
    ctx.fillText("Seminar Payment Receipt", 96, 200);

    ctx.fillStyle = "#111111";
    ctx.font = "700 88px Arial";
    ctx.fillText(receipt.amount, 96, 330);

    ctx.font = "400 28px Arial";
    ctx.fillStyle = "#666666";
    ctx.fillText("Payment confirmed", 96, 375);

    ctx.setLineDash([16, 14]);
    ctx.strokeStyle = "#d4d4d4";
    ctx.beginPath();
    ctx.moveTo(96, 445);
    ctx.lineTo(width - 96, 445);
    ctx.stroke();
    ctx.setLineDash([]);

    let y = 530;
    for (const [label, value] of rows(receipt)) {
      ctx.fillStyle = "#777777";
      ctx.font = "400 28px Arial";
      ctx.fillText(label, 96, y);

      ctx.fillStyle = "#111111";
      ctx.font = "600 32px Arial";
      const finalY = drawText(ctx, value || "-", 380, y, width - 476);
      y = finalY + 72;
    }

    ctx.setLineDash([16, 14]);
    ctx.strokeStyle = "#d4d4d4";
    ctx.beginPath();
    ctx.moveTo(96, height - 175);
    ctx.lineTo(width - 96, height - 175);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#666666";
    ctx.font = "400 26px Arial";
    ctx.fillText("Show this receipt to the committee for verification.", 96, height - 115);

    const link = document.createElement("a");
    link.download = `futura-receipt-${receipt.referenceId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-dashed border-border p-5">
          <p className="text-sm font-semibold">Receipt Preview</p>
          <p className="text-sm text-muted-foreground">
            Save this receipt and show it to the committee.
          </p>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-2xl font-semibold tracking-tight">Futura</p>
              <p className="text-sm text-muted-foreground">
                Seminar Payment Receipt
              </p>
            </div>
            <p className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
              Paid
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">
              {receipt.amount}
            </p>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            {rows(receipt).map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 break-words font-medium">{value || "-"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={saveReceipt} className="h-11 w-full rounded-xl">
        <Download className="h-4 w-4" />
        Save Receipt as Image
      </Button>
    </section>
  );
}
