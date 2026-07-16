import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import type { ClientSeminarFormValues } from "@/lib/validation/seminar";

type SeminarSuccessStepProps = {
  registrations: { id: string; nama_lengkap: string; asal_institusi: string }[];
  registrationId: string;
  statusLabel: string;
  values: ClientSeminarFormValues;
};

export default function SeminarSuccessStep({
  registrations,
  registrationId,
  statusLabel,
  values,
}: SeminarSuccessStepProps) {
  return (
    <FieldGroup className="gap-6">
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-start gap-4 p-5 sm:p-6 border-b">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
            <CheckCircle2 className="h-5 w-5 text-foreground" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">
              Your registration is complete
            </h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-500">
              Your Futura seminar registration is saved. You can view your registration details below.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                {values.nama}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {values.institusi} / {statusLabel}
              </p>
            </div>
          </div>
          <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="mt-1 break-all font-medium">{values.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">WhatsApp</dt>
              <dd className="mt-1 font-medium">{values.telp}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Registration ID</dt>
              <dd className="mt-1 font-mono text-sm font-semibold">
                {registrationId}
              </dd>
            </div>
            {values.registration_type === "grup" && (
              <div>
                <dt className="text-muted-foreground">Total Peserta</dt>
                <dd className="mt-1 font-medium">
                  {registrations.length} orang
                </dd>
              </div>
            )}
          </dl>

          {values.registration_type === "grup" && registrations.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <h3 className="text-sm font-medium mb-3">Group Members</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {registrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="rounded-[8px] border border-border p-4 flex flex-col justify-center"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {registration.nama_lengkap}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {registration.asal_institusi}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-1">
                        {registration.id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button type="button" variant="outline" className="h-11 rounded-[8px]" asChild>
          <Link href="/">Go to Home Page</Link>
        </Button>
        <Button type="button" className="h-11 rounded-[8px]" asChild>
          <Link href="/profile">Go to Profile</Link>
        </Button>
      </div>
    </FieldGroup>
  );
}
