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
        redirect("/login?next=/registration/mechatura");
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
        <main className="mx-auto w-full max-w-3xl items-start space-y-12 px-6 py-16 sm:px-8">
            <section>
                <div className="space-y-2">
                    <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                        Formulir Lomba Mechatura
                    </h1>
                    <p className="max-w-lg text-sm leading-6 text-muted-foreground">
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
