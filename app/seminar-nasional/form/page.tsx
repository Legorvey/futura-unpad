export const runtime = 'edge';
import SeminarRegistrationForm from "./form";
import { getCachedAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import SeminarSuccessStep from "@/components/registration/seminar/seminar-success-step";
import { seminarStatusOptions } from "@/lib/seminar/seminar-options";
import Countdown from "@/components/countdown";
import { TARGET_DATE } from "@/lib/landing/helper";
import StepProgress from "@/components/registration/step-progress";
import { seminarRegistrationSteps } from "@/lib/registration-steps";

export default async function SeminarRegistrationPage() {
    const { user } = await getCachedAuth();
    let latestRegistration: any = null;
    let allRegistrations: any[] = [];
    let statusLabel = "-";

    if (user) {
        const adminSupabase = createAdminClient();
        const { data } = await adminSupabase
            .from("seminar_registrations")
            .select("id,nama_lengkap,email,no_telepon,asal_institusi,status_akademika,registration_type,group_id,group_name")
            .eq("user_id", user.id)
            .eq("is_main_contact", true)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        latestRegistration = data;

        if (latestRegistration) {
            statusLabel = seminarStatusOptions.find((o) => o.id === latestRegistration.status_akademika)?.title ?? "-";
            
            if ((latestRegistration.registration_type === "group" || latestRegistration.registration_type === "grup") && latestRegistration.group_id) {
                const { data: membersData } = await adminSupabase
                  .from("seminar_registrations")
                  .select("id,nama_lengkap,asal_institusi,is_main_contact")
                  .eq("group_id", latestRegistration.group_id)
                  .order("created_at", { ascending: true });
                  
                allRegistrations = membersData || [];
            }
        }
    }

    return (
        <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl flex-col justify-center space-y-8 px-6 pb-32 pt-28 sm:px-8">
            <section>
                <div className="space-y-2">
                    <h1 className="max-w-xl text-3xl sm:text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                        Formulir Seminar Nasional
                    </h1>
                    <p className="max-w-lg text-sm font-medium leading-relaxed text-neutral-500">
                        {latestRegistration 
                           ? "You have already registered for the seminar. Your registration details are below." 
                           : "Register for the seminar by providing your details below."}
                    </p>
                </div>
            </section>
            <section>
                {latestRegistration ? (
                    <div className="space-y-8">
                        <StepProgress
                            steps={seminarRegistrationSteps}
                            currentStep="ticket"
                            ariaLabel="Seminar registration progress"
                        />
                        <SeminarSuccessStep 
                            registrations={allRegistrations}
                            registrationId={latestRegistration.id}
                            statusLabel={statusLabel}
                            values={{
                                nama: latestRegistration.nama_lengkap,
                                email: latestRegistration.email,
                                telp: latestRegistration.no_telepon,
                                institusi: latestRegistration.asal_institusi,
                                registration_type: (latestRegistration.registration_type === "group" || latestRegistration.registration_type === "grup") ? "grup" : "individu",
                                status_akademika: latestRegistration.status_akademika,
                                is_same_institution: true,
                                identity_confirmed: true,
                                members: []
                            } as any}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col space-y-8 items-center">
                        <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Seminar Registration Closed</h1>
                        <Countdown
                            targetDate={TARGET_DATE({
                                date: 21,
                                month: 11,
                                year: 2026,
                            })}
                        />
                    </div>
                )}
            </section>
        </main>
    );
}
