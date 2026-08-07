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

export default function PembicaraSeminarPleno() {
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
            <div className="mx-auto max-w-[100rem] w-full px-6 md:px-12 lg:px-20 flex flex-col items-center">
                <div className="mb-14 md:mb-20 text-center flex flex-col items-center">
                    <h2 className="text-[3rem] sm:text-[4rem] md:text-[5rem] font-bold tracking-[-0.08em] text-white text-center text-balance leading-tight">
                        Seminar Pleno
                    </h2>
                    <p className="mt-2 text-lg md:text-xl text-foreground/60 leading-relaxed max-w-2xl text-center text-balance">
                        Seminar Nasional Futura adalah forum ilmiah yang mengkaji inovasi teknologi global. Acara ini menghadirkan akademisi, praktisi industri, dan perwakilan pemerintah untuk memaparkan tren teknologi terkini.
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
