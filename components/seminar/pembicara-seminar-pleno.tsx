"use client"

import PembicaraCards from "../ui/pembicara-cards";
import ModeratorCards from "../ui/moderator-cards";
import { Variants } from "motion/react";

const moderatorsData = [
    {
        id: 1,
        name: "Aditya Cakti C.",
        imageSrc: "https://avatars.githubusercontent.com/u/1024025?v=4",
        job: "Kepala Bidang Komunikasi dan Informasi",
        experience: "2023 - Sekarang",
        description: "Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum "
    }
]

const pembicarasData = [
    {
        id: 1,
        description:
            "Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum ",
        name: "Linus Torvalds",
        position: "Linux Foundation",
        imageSrc: "https://avatars.githubusercontent.com/u/1024025?v=4",
    },
    {
        id: 2,
        description:
            "Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum ",
        name: "Linus Torvalds",
        position: "Linux Foundation",
        imageSrc: "https://avatars.githubusercontent.com/u/1024025?v=4",
    },
    {
        id: 3,
        description:
            "Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum ",
        name: "Linus Torvalds",
        position: "Linux Foundation",
        imageSrc: "https://avatars.githubusercontent.com/u/1024025?v=4",
    },
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
        <main className="max-w-7xl mx-auto px-2">
            <PembicaraCards
                title="Pembicara Seminar Pleno"
                subtitle="Berikut merupakan pembicara-pembicara yang akan hadir dalam seminar pleno"
                pembicaras={pembicarasData}
            />
            <ModeratorCards moderators={moderatorsData} />
        </main>

    );
}
