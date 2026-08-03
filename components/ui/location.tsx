"use client";

import { MapPin, ExternalLink, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationProps {
    id?: string;
    location: string;
    address: string;
    mapSrc: string;
    mapsUrl?: string;
    reverse?: boolean;
}

export default function Location({
    id,
    location,
    address,
    mapSrc,
    mapsUrl,
    reverse = false,
}: LocationProps) {
    return (
        <div
            id={id}
            className={cn(
                "w-full max-w-7xl mx-auto border border-white/10 bg-white/[0.03] backdrop-blur-md rounded-[2em] p-6",
                "flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center"
            )}
        >
            {/* Information Column */}
            <div
                className={cn(
                    "flex flex-col justify-center space-y-6 lg:col-span-5 text-left",
                    reverse ? "lg:order-2" : "lg:order-1"
                )}
            >
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[-0.06em] text-white leading-[1.15]">
                    {location}
                </h3>

                <div className="space-y-2   ">
                    <div className="flex items-start gap-3 text-white/70">
                        <p className="text-sm sm:text-base font-light tracking-tight leading-relaxed">
                            {address}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-white/70">
                        <a
                            href="mailto:unpad.futura@gmail.com"
                            className="text-sm sm:text-base text-amber-300/90 hover:text-amber-200 transition-colors font-medium tracking-tight"
                        >
                            unpad.futura@gmail.com
                        </a>
                    </div>
                </div>

                {mapsUrl && (
                    <div className="pt-2">
                        <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-medium tracking-tight transition-all duration-200 group w-fit"
                        >
                            <span>Buka di Google Maps</span>
                            <ExternalLink className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                    </div>
                )}
            </div>

            {/* Map Column */}
            <div
                className={cn(
                    "w-full lg:col-span-7 overflow-hidden rounded-2xl sm:rounded-[1rem] border border-white/10 bg-neutral-950/60 shadow-inner",
                    reverse ? "lg:order-1" : "lg:order-2"
                )}
            >
                <div className="relative aspect-square sm:aspect-[16/10] w-full overflow-hidden">
                    <iframe
                        className="absolute inset-0 h-full w-full border-0 opacity-90 hover:opacity-100 transition-opacity duration-500"
                        src={mapSrc}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Lokasi ${location}`}
                        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                    />
                </div>
            </div>
        </div>
    );
}