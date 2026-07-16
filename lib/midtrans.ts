import "server-only";

import { createHash, timingSafeEqual } from "crypto";

type SnapTransactionInput = {
  orderId: string;
  amount: number;
  itemName: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  finishUrl: string;
  errorUrl: string;
  pendingUrl: string;
};

export type MidtransPaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled"
  | "settled";

type MidtransSnapResponse = {
  token: string;
  redirect_url: string;
};

type MidtransStatusResponse = {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
  payment_type?: string;
};

type MidtransEnvironment = "sandbox" | "production";

const readMidtransErrorMessage = async (response: Response) => {
  const body = await response.text().catch(() => "");

  if (!body) {
    return response.statusText;
  }

  try {
    const data = JSON.parse(body) as {
      status_message?: string;
      error_messages?: string[];
    };

    return (
      data.error_messages?.join(", ") ??
      data.status_message ??
      body.slice(0, 200)
    );
  } catch {
    return body.slice(0, 200);
  }
};

const getServerKey = () => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim();

  if (!serverKey) {
    throw new Error("MIDTRANS_SERVER_KEY is not configured");
  }

  return serverKey;
};

const getEnvironment = (): MidtransEnvironment => {
  const environment = process.env.MIDTRANS_ENVIRONMENT?.trim().toLowerCase();

  if (environment === "sandbox" || environment === "production") {
    return environment;
  }

  if (environment) {
    throw new Error("MIDTRANS_ENVIRONMENT must be sandbox or production");
  }

  return "sandbox";
};

const assertServerKey = (serverKey: string) => {
  if (!serverKey.toLowerCase().includes("-server-")) {
    throw new Error("MIDTRANS_SERVER_KEY must be a Midtrans server key");
  }
};

const getMidtransBaseUrls = () => {
  const serverKey = getServerKey();
  const environment = getEnvironment();
  assertServerKey(serverKey);
  const isSandbox = environment === "sandbox";

  return {
    serverKey,
    environment,
    apiBaseUrl: isSandbox
      ? "https://api.sandbox.midtrans.com"
      : "https://api.midtrans.com",
    snapBaseUrl: isSandbox
      ? "https://app.sandbox.midtrans.com"
      : "https://app.midtrans.com",
  };
};

export function getMidtransEnvironment() {
  return getMidtransBaseUrls().environment;
}

const createAuthorizationHeader = (serverKey: string) =>
  `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;

export function mapMidtransPaymentStatus(
  transactionStatus?: string,
  fraudStatus?: string
): MidtransPaymentStatus {
  if (transactionStatus === "settlement") {
    return "paid";
  }

  if (transactionStatus === "capture") {
    return fraudStatus === "challenge" ? "pending" : "paid";
  }

  if (transactionStatus === "pending") {
    return "pending";
  }

  if (transactionStatus === "expire") {
    return "expired";
  }

  if (transactionStatus === "cancel") {
    return "cancelled";
  }

  if (
    transactionStatus === "deny" ||
    transactionStatus === "failure" ||
    transactionStatus === "refund" ||
    transactionStatus === "partial_refund"
  ) {
    return "failed";
  }

  return "pending";
}

export async function createMidtransSnapTransaction({
  orderId,
  amount,
  itemName,
  customer,
  finishUrl,
  errorUrl,
  pendingUrl,
}: SnapTransactionInput) {
  const { serverKey, snapBaseUrl } = getMidtransBaseUrls();
  const response = await fetch(`${snapBaseUrl}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      Authorization: createAuthorizationHeader(serverKey),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      item_details: [
        {
          id: "mechatura-registration",
          price: amount,
          quantity: 1,
          name: itemName,
        },
      ],
      customer_details: {
        first_name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      callbacks: {
        finish: finishUrl,
        error: errorUrl,
        pending: pendingUrl,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await readMidtransErrorMessage(response);

    throw new Error(
      `Midtrans Snap request failed: ${response.status} ${message}`
    );
  }

  return (await response.json()) as MidtransSnapResponse;
}

export async function getMidtransTransactionStatus(orderId: string) {
  const { serverKey, apiBaseUrl } = getMidtransBaseUrls();
  const response = await fetch(
    `${apiBaseUrl}/v2/${encodeURIComponent(orderId)}/status`,
    {
      headers: {
        Authorization: createAuthorizationHeader(serverKey),
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as MidtransStatusResponse;
}

export function isValidMidtransSignature({
  orderId,
  statusCode,
  grossAmount,
  signatureKey,
}: {
  orderId?: string;
  statusCode?: string;
  grossAmount?: string;
  signatureKey?: string;
}) {
  if (!orderId || !statusCode || !grossAmount || !signatureKey) {
    return false;
  }

  const serverKey = getServerKey();
  const expectedSignature = createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");

  if (expectedSignature.length !== signatureKey.length) {
    return false;
  }
  return timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signatureKey)
  );
}
