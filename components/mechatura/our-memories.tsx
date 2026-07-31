"use client";

import { useEffect, useState } from "react";
import { CardStack, CardStackItem } from "@/components/ui/card-stack";

const items: CardStackItem[] = [
    {
        id: 1,
        title: "",
        description: "",
        imageSrc: "/mechatura/_DSC0665.JPG",
        href: "",
    },
    {
        id: 2,
        title: "",
        description: "",
        imageSrc: "/mechatura/_DSC0757.JPG",
        href: "",
    },
    {
        id: 3,
        title: "",
        description: "",
        imageSrc: "/mechatura/_DSC0762.JPG",
        href: "",
    },
    {
        id: 4,
        title: "",
        description: "",
        imageSrc: "/mechatura/IMG_3931.JPG",
        href: "",
    },
    {
        id: 5,
        title: "",
        description: "",
        imageSrc: "/mechatura/IMG_3939.JPG",
        href: "",
    },
];

export default function OurMemories() {
    const [mounted, setMounted] = useState(false);
    const [config, setConfig] = useState({
        width: 520,
        height: 320,
        maxVisible: 7,
        overlap: 0.48,
        spreadDeg: 48
    });

    useEffect(() => {
        setMounted(true);
        const handleResize = () => {
            if (window.innerWidth < 640) {
                // Mobile
                const width = Math.min(window.innerWidth - 32, 320);
                setConfig({
                    width,
                    height: width * (320 / 520),
                    maxVisible: 3,
                    overlap: 0.7,
                    spreadDeg: 25
                });
            } else if (window.innerWidth < 1024) {
                // Tablet
                setConfig({
                    width: 420,
                    height: 420 * (320 / 520),
                    maxVisible: 5,
                    overlap: 0.55,
                    spreadDeg: 35
                });
            } else {
                // Desktop
                setConfig({
                    width: 520,
                    height: 320,
                    maxVisible: 7,
                    overlap: 0.48,
                    spreadDeg: 48
                });
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="w-full flex flex-col items-center justify-center space-y-4 px-4 overflow-hidden py-12">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-center">Our Memories</h1>
            <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 text-center max-w-2xl">
                Berikut adalah sorotan dokumentasi dari rangkaian kompetisi robotika Mechatura 2025.
            </p>
            <div className="mx-auto w-full max-w-5xl p-4 md:p-8 flex justify-center">
                {mounted ? (
                    <CardStack
                        items={items}
                        initialIndex={0}
                        autoAdvance
                        intervalMs={2500}
                        pauseOnHover
                        showDots
                        cardWidth={config.width}
                        cardHeight={config.height}
                        maxVisible={config.maxVisible}
                        overlap={config.overlap}
                        spreadDeg={config.spreadDeg}
                    />
                ) : (
                    <div style={{ height: Math.max(380, config.height + 80) }} className="w-full" />
                )}
            </div>
        </div>
    );
}
