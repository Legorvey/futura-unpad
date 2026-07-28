"use client"

import PembicaraCards from "../ui/pembicara-cards";
import ModeratorCards from "../ui/moderator-cards";

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
            "",
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

export default function PembicaraTalkshow() {
    return (
        <main className="max-w-7xl mx-auto">
            <PembicaraCards
                title="Pembicara Talkshow"
                subtitle="Berikut merupakan pembicara-pembicara yang akan hadir dalam talkshow"
                pembicaras={pembicarasData}
            />
            <ModeratorCards moderators={moderatorsData} />
        </main>

    );
};
