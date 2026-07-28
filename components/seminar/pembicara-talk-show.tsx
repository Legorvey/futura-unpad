"use client"

import { motion } from "framer-motion";
import Image from "next/image";

export default function PembicaraTalkshow() {
    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
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
        <section className="w-full bg-background py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground lg:text-6xl">
                    Talkshow
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                    Berikut merupakan pembicara-pembicara yang akan hadir dalam talkshow
                </p>

                <motion.div
                    className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 max-w-5xl mx-auto"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {/* Speaker Card (Left) */}
                    <motion.div variants={itemVariants} className="group relative flex min-h-[420px] flex-col overflow-hidden rounded-xl bg-card shadow-sm">
                        <div className="absolute inset-0 z-0">
                            <Image
                                src="https://avatars.githubusercontent.com/u/1024025?v=4"
                                alt="Pembicara"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent md:opacity-80" />
                            <div className="absolute inset-0 bg-black/80 opacity-0 transition-opacity duration-500 md:group-hover:opacity-100" />
                        </div>

                        <div className="absolute top-6 left-6 z-20">
                            <span className="text-lg font-bold tracking-wide text-white drop-shadow-md uppercase">
                                Pembicara
                            </span>
                        </div>

                        <div className="relative z-10 flex flex-1 flex-col p-6">
                            <div className="mt-auto flex flex-col text-left font-semibold transition-all duration-500 ease-out md:group-hover:-translate-y-4 md:group-hover:opacity-0">
                                <p className="text-2xl tracking-tight text-white sm:text-3xl">
                                    To Be Announced
                                </p>
                                <span className="text-base text-white/70 sm:text-lg">
                                    To Be Announced
                                </span>
                            </div>

                            <div className="pointer-events-auto mt-4 flex flex-col opacity-100 transition-all duration-500 ease-out md:pointer-events-none md:absolute md:inset-0 md:mt-0 md:-translate-y-4 md:overflow-y-auto md:p-8 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100">
                                <p className="text-left text-sm leading-relaxed text-white/90 md:mb-auto md:mt-auto md:text-base">
                                    Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Moderator Card (Right) */}
                    <motion.div variants={itemVariants} className="group relative flex aspect-3/4 flex-col overflow-hidden rounded-xl bg-card shadow-sm">
                        <div className="absolute inset-0 z-0">
                            <Image
                                src="https://avatars.githubusercontent.com/u/1024025?v=4"
                                alt="Moderator"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent md:opacity-80" />
                            <div className="absolute inset-0 bg-black/80 opacity-0 transition-opacity duration-500 md:group-hover:opacity-100" />
                        </div>

                        <div className="absolute top-6 left-6 z-20">
                            <span className="text-lg font-bold tracking-wide text-white drop-shadow-md uppercase">
                                Moderator
                            </span>
                        </div>

                        <div className="relative z-10 flex flex-1 flex-col p-6">
                            <div className="mt-auto flex flex-col text-left font-semibold transition-all duration-500 ease-out md:group-hover:-translate-y-4 md:group-hover:opacity-0">
                                <p className="text-2xl tracking-tight text-white sm:text-3xl">
                                    To Be Announced
                                </p>
                                <span className="text-base text-white/70 sm:text-lg">
                                    To Be Announced
                                </span>
                            </div>

                            <div className="pointer-events-auto mt-4 flex flex-col opacity-100 transition-all duration-500 ease-out md:pointer-events-none md:absolute md:inset-0 md:mt-0 md:-translate-y-4 md:overflow-y-auto md:p-8 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100">
                                <p className="text-left text-sm leading-relaxed text-white/90 md:mb-auto md:mt-auto md:text-base">
                                    Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
