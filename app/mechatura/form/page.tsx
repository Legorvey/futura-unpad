import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Form Pendaftaran Mechatura 2026",
};

export default async function MechaturaPage() {
  // SECURITY & HARDENING (Defense-in-depth): Fallback redirect in case middleware is bypassed.
  // Registration for Mechatura is officially closed.
  redirect("/mechatura");
}
