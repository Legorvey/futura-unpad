import { NextResponse } from "next/server";

import { authSessionSchema } from "@/lib/api/auth-session";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, adminAccess } = await requireAdmin();
  const session = authSessionSchema.parse({
    user: user
      ? {
          id: user.id,
          email: user.email ?? null,
          user_metadata: user.user_metadata,
        }
      : null,
    adminAccess,
  });

  return NextResponse.json(session);
}
