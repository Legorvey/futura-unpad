import Image from "next/image";

export interface ModeratorCardProps {
    id: number;
    name: string;
    imageSrc: string;
    job?: string;
    experience?: string;
    description?: string;
}

export default function ModeratorCards({ moderators }: { moderators: ModeratorCardProps[] }) {
    if (!moderators || moderators.length === 0) return null;

    return (
        <section className="">
            <div className="mx-auto flex max-w-5xl flex-col gap-12">
                {moderators.map((moderator) => (
                    <div
                        key={moderator.id}
                        className="flex flex-col items-center gap-8 md:flex-row"
                    >
                        <div className="shrink-0">
                            <Image
                                className="rounded-md object-cover"
                                src={moderator.imageSrc}
                                alt={moderator.name}
                                width={256}
                                height={288}
                            />
                        </div>
                        <div className="flex flex-col text-center md:text-left">
                            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
                                Moderator Seminar Pleno
                            </h1>
                            <h2 className="text-xl md:text-2xl font-semibold text-muted-foreground">
                                {moderator.name}
                            </h2>

                            {moderator.job && (
                                <p className="mt-8 text-lg text-primary">
                                    {moderator.job}
                                </p>
                            )}

                            {moderator.experience && (
                                <p className="text-lg text-muted-foreground">
                                    {moderator.experience}
                                </p>
                            )}

                            {moderator.description && (
                                <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
                                    {moderator.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}