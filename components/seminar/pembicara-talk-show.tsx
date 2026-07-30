"use client"

import { PembicaraItem } from "../ui/pembicara-cards";
import { ModeratorItem } from "../ui/moderator-cards";
import { Variants } from "motion/react";

const moderatorsData = [
    {
        id: 1,
        name: "To Be Announced",
        imageSrc: "/seminar/mystery-pembicara-moderator.png",
        job: "",
        experience: "",
        description: ""
    }
]

const pembicarasData = [
    {
        id: 1,
        description:
            "",
        name: "To Be Announced",
        position: "",
        imageSrc: "/seminar/mystery-pembicara-moderator.png",
    }
];

export default function PembicaraTalkshow() {
    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
            },
        },
    };

    return (
        <section className="w-full py-16 md:py-24 relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 flex flex-col items-center">
                <div className="text-center mb-16 md:mb-24 flex flex-col items-center">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.05em] text-white leading-none">
                        Talkshow
                    </h2>
                    <p className="mt-2 text-base md:text-lg font-light tracking-tight text-white/50 max-w-5xl">
                        Talkshow Futura merupakan rangkaian acara yang berfokus pada pertukaran wawasan melalui diskusi interaktif antara peserta dan narasumber. Acara ini menghadirkan influencer maupun individu yang telah memiliki pengalaman, prestasi, atau kontribusi di bidangnya untuk berbagi pengetahuan, pengalaman, serta perspektif mengenai isu dan perkembangan terkini.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 w-full justify-items-center items-start">
                    <PembicaraItem pembicara={pembicarasData[0]} />
                    <ModeratorItem moderator={moderatorsData[0]} />
                </div>
            </div>
        </section>

    );
}
