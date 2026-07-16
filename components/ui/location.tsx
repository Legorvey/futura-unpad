interface LocationProps {
    id?: string;
    location: string;
    address: string;
    mapSrc: string;
}

export default function Location({ id, location, address, mapSrc }: LocationProps) {
    return (
        <section id={id} className="relative mx-auto max-w-7xl">
            <div className="flex flex-col gap-8 text-center lg:grid lg:grid-cols-[1fr_1.5fr] lg:items-center lg:text-left">
                <div className="space-y-8">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                        {location}
                    </h2>
                    <div className="flex flex-col gap-1 mx-auto w-3/4 lg:w-full">
                        <p className="text-balance text-md md:text-lg text-neutral-400">
                            {address}
                        </p>
                        <p className="text-blue-400 hover:underline cursor-pointer">unpad.futura@gmail.com</p>
                    </div>
                </div>

                <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-md">
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl sm:aspect-video">
                        <iframe
                            className="absolute inset-0 h-full w-full border-0"
                            src={mapSrc}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Location Map"
                            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
                        />
                    </div>
                </div>
            </div>

        </section>
    );
}