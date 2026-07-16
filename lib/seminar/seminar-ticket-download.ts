import JSZip from "jszip";

import type { ClientSeminarFormValues } from "@/lib/validation";

export type SeminarTicketRegistration = {
  id: string;
  nama_lengkap: string;
  asal_institusi: string;
  is_main_contact: boolean;
};

type DownloadSeminarTicketsArgs = {
  registrations: SeminarTicketRegistration[];
  registrationId: string;
  statusLabel: string;
  values: ClientSeminarFormValues;
};

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

function getSafeTicketFileName(parts: string[]) {
  return parts.join("_").replace(/[^a-z0-9_]/gi, "_");
}

function renderTicketBase(ctx: CanvasRenderingContext2D, title: string) {
  const { canvas } = ctx;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

  ctx.fillStyle = "#111111";
  ctx.font = "700 54px Arial";
  ctx.fillText(title, 90, 140);

  ctx.font = "400 24px Arial";
  ctx.fillStyle = "#666666";
  ctx.fillText("Futura Seminar", 90, 180);

  ctx.strokeStyle = "#d4d4d4";
  ctx.setLineDash([12, 12]);
  ctx.beginPath();
  ctx.moveTo(820, 95);
  ctx.lineTo(820, canvas.height - 95);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#666666";
  ctx.font = "400 22px Arial";
  ctx.fillText("Show this ticket during seminar check-in.", 90, 650);
}

function renderTicketRows(
  ctx: CanvasRenderingContext2D,
  rows: Array<[string, string]>
) {
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
}

function createTicketCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 720;
  return canvas;
}

export async function downloadSeminarTickets({
  registrations,
  registrationId,
  statusLabel,
  values,
}: DownloadSeminarTicketsArgs) {
  if (registrations.length > 1) {
    const zip = new JSZip();

    await Promise.all(
      registrations.map(async (registration) => {
        const canvas = createTicketCanvas();
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        renderTicketBase(
          ctx,
          `Futura Seminar (${values.group_name || "Group"})`
        );

        ctx.fillStyle = "#111111";
        ctx.font = "700 46px Arial";
        drawWrappedText(ctx, registration.nama_lengkap, 90, 285, 680, 56);

        ctx.font = "400 24px Arial";
        ctx.fillStyle = "#666666";
        ctx.fillText(values.email, 90, 350);
        ctx.fillText(values.telp, 90, 388);

        renderTicketRows(ctx, [
          ["Institution", registration.asal_institusi || "-"],
          ["Status", statusLabel],
          ["Registration ID", registration.id],
          ["Total Participants", `${registrations.length} People`],
        ]);

        const qrCanvas = document.getElementById(
          `qr-canvas-${registration.id}`
        ) as HTMLCanvasElement | null;
        if (qrCanvas) {
          ctx.drawImage(qrCanvas, 90, 410, 200, 200);
        }

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
        if (blob) {
          const groupSegment =
            values.registration_type === "grup" && values.group_name
              ? values.group_name
              : "Individu";
          const fileName = getSafeTicketFileName([
            groupSegment,
            registration.nama_lengkap || "TICKET",
            registration.asal_institusi || values.institusi || "Institusi",
            registration.id,
          ]);
          zip.file(`${fileName}.png`, blob);
        }
      })
    );

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.download = "Futura_Group_Tickets.zip";
    link.href = URL.createObjectURL(zipBlob);
    link.click();
    return;
  }

  const canvas = createTicketCanvas();
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  renderTicketBase(ctx, "Futura Seminar");

  ctx.fillStyle = "#111111";
  ctx.font = "700 46px Arial";
  drawWrappedText(ctx, values.nama, 90, 285, 680, 56);

  ctx.font = "400 24px Arial";
  ctx.fillStyle = "#666666";
  ctx.fillText(values.email, 90, 350);
  ctx.fillText(values.telp, 90, 388);

  renderTicketRows(ctx, [
    ["Institution", values.institusi],
    ["Status", statusLabel],
    ["Registration ID", registrationId],
  ]);

  const qrCanvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
  if (qrCanvas) {
    ctx.drawImage(qrCanvas, 90, 410, 200, 200);
  }

  const link = document.createElement("a");
  const fileName = getSafeTicketFileName([
    "Individu",
    values.nama || "TICKET",
    values.institusi || "Institusi",
    registrationId,
  ]);
  link.download = `${fileName}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
