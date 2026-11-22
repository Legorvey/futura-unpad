"use client"

import { PembicaraItem } from "../ui/pembicara-cards";
import { ModeratorItem } from "../ui/moderator-cards";
import {
    SEMINAR_FORUM_DESCRIPTION,
    SEMINAR_MODERATORS,
    SEMINAR_SPEAKERS,
    SEMINAR_WORKSHOP_PRSI_DESCRIPTION,
    SEMINAR_WORKSHOP_TITLE,
} from "@/lib/seminar/config";

export default function PembicaraSeminarPleno() {
    return (
        <section className="w-full py-16 md:py-24 relative overflow-hidden">
            <div className="mx-auto max-w-[100rem] w-full px-6 md:px-12 lg:px-20 flex flex-col items-center">
                <div className="mb-12 md:mb-16 text-center flex flex-col items-center w-full">
                    <h2 className="text-[3rem] sm:text-[4rem] md:text-[5rem] font-bold tracking-[-0.08em] text-white text-center text-balance leading-tight">
                        {SEMINAR_WORKSHOP_TITLE}
                    </h2>
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-6xl text-left">
                        <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between">
                            <div>
                                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-300 mb-3">
                                    Forum Ilmiah
                                </span>
                                <p className="text-sm sm:text-base text-white/75 leading-relaxed font-light">
                                    {SEMINAR_FORUM_DESCRIPTION}
                                </p>
                            </div>
                        </div>
                        <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between">
                            <div>
                                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-300 mb-3">
                                    Workshop Praktis × PRSI
                                </span>
                                <p className="text-sm sm:text-base text-white/75 leading-relaxed font-light">
                                    {SEMINAR_WORKSHOP_PRSI_DESCRIPTION}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 w-full justify-items-center items-start">
                    {SEMINAR_SPEAKERS.map((pembicara) => (
                        <PembicaraItem key={pembicara.id} pembicara={pembicara} />
                    ))}
                    {SEMINAR_MODERATORS.map((moderator) => (
                        <ModeratorItem key={moderator.id} moderator={moderator} />
                    ))}
                </div>
            </div>
        </section>

    );
}
