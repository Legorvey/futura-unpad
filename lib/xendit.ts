export type XenditInvoice = {
  id: string;
  external_id: string;
  status: string;
  invoice_url?: string;
  paid_at?: string;
};

export const getXenditInvoice = async (
  invoiceId: string
): Promise<XenditInvoice | null> => {
  if (!process.env.XENDIT_SECRET_KEY) {
    return null;
  }

  const res = await fetch(`https://api.xendit.co/v2/invoices/${invoiceId}`, {
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${process.env.XENDIT_SECRET_KEY}:`).toString("base64"),
    },
    cache: "no-store",
  });

  const invoice = await res.json().catch(() => null);

  if (
    !res.ok ||
    typeof invoice?.id !== "string" ||
    typeof invoice?.external_id !== "string" ||
    typeof invoice?.status !== "string"
  ) {
    return null;
  }

  return {
    id: invoice.id,
    external_id: invoice.external_id,
    status: invoice.status,
    invoice_url:
      typeof invoice.invoice_url === "string" ? invoice.invoice_url : undefined,
    paid_at: typeof invoice.paid_at === "string" ? invoice.paid_at : undefined,
  };
};
