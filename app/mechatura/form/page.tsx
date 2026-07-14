import { redirect } from "next/navigation";

import {
    deleteMechaturaRegistration,
    findLatestMechaturaRegistrationForUser,
    getMechaturaRegistrationStepHref,
    isMechaturaPaymentExpired,
} from "@/lib/mechatura/registration";
import { getCachedAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import ExpiredRegistrationDialog from "./expired-registration-dialog";
import MechaturaRegistrationForm from "./form";

export default async function MechaturaPage() {
    const { user } = await getCachedAuth();

    if (!user) {
        redirect("/login?next=/mechatura/form");
    }

    const adminSupabase = createAdminClient();
    const latestRegistration = await findLatestMechaturaRegistrationForUser(
        adminSupabase,
        user.id
    );
    const expiredTeamName =
        latestRegistration && isMechaturaPaymentExpired(latestRegistration)
            ? latestRegistration.teamName
            : null;

    if (latestRegistration && expiredTeamName) {
        await deleteMechaturaRegistration(adminSupabase, latestRegistration.id);
    } else if (latestRegistration) {
        redirect(getMechaturaRegistrationStepHref(latestRegistration));
    }

    return (
        <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-3xl flex-col justify-center space-y-8 px-6 pb-32 pt-28 sm:px-8">
            <section>
                <div className="space-y-2">
                    <h1 className="max-w-xl text-3xl sm:text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                        Formulir Lomba Mechatura
                    </h1>
                    <p className="max-w-lg text-sm font-medium leading-relaxed text-neutral-500">
                        Register your team, upload the required documents,
                        verify the details, then continue to payment.
                    </p>
                </div>
            </section>

            <section>
                {expiredTeamName ? (
                    <ExpiredRegistrationDialog teamName={expiredTeamName} />
                ) : null}
                <MechaturaRegistrationForm />
            </section>
        </main>
    );
}


