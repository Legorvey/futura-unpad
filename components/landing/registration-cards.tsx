/* eslint-disable */
// import Image from "next/image";
// import Link from "next/link";

// import { FollowerPointerCard } from "../ui/following-pointer";

// const registrationCardStyles = {
//   section:
//     "bg-background px-6 py-6 [--registration-card-image-ratio:16/10] [--registration-card-min-height:28rem] [--registration-card-width:22rem]",
//   inner:
//     "mx-auto grid w-full max-w-6xl grid-cols-[repeat(auto-fit,minmax(min(100%,var(--registration-card-width)),var(--registration-card-width)))] justify-center gap-5",
//   follower:
//     "h-full w-full rounded-2xl focus-within:ring-2 focus-within:ring-purple-400/50",
//   card:
//     "group relative flex h-full min-h-[var(--registration-card-min-height)] w-full flex-col overflow-hidden rounded-md border border-white/10 bg-neutral-950/95 shadow-[0_22px_70px_rgba(0,0,0,0.32)] transition duration-500 hover:-translate-y-1 hover:border-purple-300/45 hover:shadow-purple-500/20",
//   imageWrap:
//     "relative w-full overflow-hidden border-b border-white/10 bg-black [aspect-ratio:var(--registration-card-image-ratio)]",
//   image:
//     "object-cover transition duration-700 group-hover:scale-105 group-hover:saturate-125",
//   imageShade:
//     "absolute inset-0 bg-linear-to-t from-black/75 via-transparent to-white/5",
//   imageFallback:
//     "absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:24px_24px]",
//   body: "flex flex-1 flex-col gap-4 p-5",
//   accent: "mb-5 h-1 w-11 rounded-full",
//   title:
//     "text-2xl font-medium leading-tight tracking-tight text-white",
//   description: "text-sm leading-6 text-neutral-300",
//   cta:
//     "mt-auto inline-flex h-10 w-fit items-center justify-center rounded-sm border border-purple-300/30 bg-white px-5 text-sm font-medium text-black transition duration-300 hover:bg-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
//   pointer:
//     "stroke-purple-300 text-purple-300 drop-shadow-[0_0_16px_rgba(216,180,254,0.55)]",
//   pointerActive:
//     "stroke-white text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.7)]",
//   pointerLabel:
//     "border-purple-300/30 bg-neutral-950/90 text-purple-100 shadow-[0_0_32px_rgba(168,85,247,0.25)]",
//   pointerLabelActive:
//     "border-purple-200/50 bg-purple-500/90 text-white shadow-[0_0_38px_rgba(168,85,247,0.36)]",
// } as const;

// const registrationCards = [
//   {
//     title: "Seminar Nasional",
//     description:
//       "Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum",
//     href: "/seminar-nasional",
//     image: "",
//     imageAlt: "Seminar Nasional registration visual",
//     accentClassName: "bg-amber-300",
//   },
//   {
//     title: "Mechatura",
//     description:
//       "Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum",
//     href: "/mechatura",
//     image: "",
//     imageAlt: "Mechatura robotics registration visual",
//     accentClassName: "bg-purple-300",
//   },
//   {
//     title: "Lomba Essay",
//     description:
//       "Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum",
//     href: "/lomba-essay",
//     image: "",
//     imageAlt: "Lomba Essay registration visual",
//     accentClassName: "bg-fuchsia-300",
//   },
// ];

// export function RegistrationCards() {
//   return (
//     <section id="registrations" className={registrationCardStyles.section}>
//       <div className={registrationCardStyles.inner}>
//         {registrationCards.map((card) => (
//           <FollowerPointerCard
//             key={card.title}
//             title={<PointerLabel title={card.title} />}
//             className={registrationCardStyles.follower}
//             pointerClassName={registrationCardStyles.pointer}
//             pointerActiveClassName={registrationCardStyles.pointerActive}
//             labelClassName={registrationCardStyles.pointerLabel}
//             labelActiveClassName={registrationCardStyles.pointerLabelActive}
//           >
//             <article className={registrationCardStyles.card}>
//               <div className={registrationCardStyles.imageWrap}>
//                 {card.image ? (
//                   <Image
//                     src={card.image}
//                     alt={card.imageAlt}
//                     fill
//                     sizes="22rem"
//                     className={registrationCardStyles.image}
//                   />
//                 ) : (
//                   <div className={registrationCardStyles.imageFallback} />
//                 )}
//                 <div className={registrationCardStyles.imageShade} />
//               </div>
//               <div className={registrationCardStyles.body}>
//                 <div className={`${registrationCardStyles.accent} ${card.accentClassName}`} />
//                 <h2 className={registrationCardStyles.title}>{card.title}</h2>
//                 <p className={registrationCardStyles.description}>
//                   {card.description}
//                 </p>
//                 <Link href={card.href} className={registrationCardStyles.cta}>
//                   Register now
//                 </Link>
//               </div>
//             </article>
//           </FollowerPointerCard>
//         ))}
//       </div>
//     </section>
//   );
// }

// function PointerLabel({ title }: { title: string }) {
//   return (
//     <span className="flex items-center gap-2">
//       <span className="h-1.5 w-1.5 rounded-full bg-purple-300" />
//       <span>{title}</span>
//     </span>
//   );
// }

"use client";
import React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export function RegistrationCards({ title = "I'm static and I know it.", image, speaker }: { title?: string; image?: string; speaker?: string }) {

  return (
    <div className="border border-black/[0.2] group/canvas-card flex items-center justify-center dark:border-white/[0.2] max-w-xs md:w-64 lg:w-72 xl:w-80 md:max-w-none w-full p-4 relative h-[22rem] sm:h-[26rem] md:h-[26rem] lg:h-[30rem] bg-white dark:bg-black">
      <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black z-30" />
      <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black z-30" />
      <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black z-30" />
      <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black z-30" />

      {image && (
        <Image 
          src={image} 
          alt={speaker || title || "Image"} 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover z-10 group-hover/canvas-card:opacity-0 transition duration-500" 
        />
      )}

      <div className="relative z-20">
        <div className="text-center group-hover/canvas-card:-translate-y-4 group-hover/canvas-card:opacity-0 transition duration-200 w-full  mx-auto flex items-center justify-center">
          {!image && <AceternityIcon />}
        </div>
        <h2 className="dark:text-white text-xl opacity-0 group-hover/canvas-card:opacity-100 relative z-10 text-black mt-4 font-bold group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200 text-center">
          {speaker || title}
        </h2>
      </div>
    </div>
  );
}

const Card = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
}) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="border border-black/[0.2] group/canvas-card flex items-center justify-center dark:border-white/[0.2]  max-w-sm w-full mx-auto p-4 relative h-[30rem] relative"
    >
      <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full w-full absolute inset-0"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20">
        <div className="text-center group-hover/canvas-card:-translate-y-4 group-hover/canvas-card:opacity-0 transition duration-200 w-full  mx-auto flex items-center justify-center">
          {icon}
        </div>
        <h2 className="dark:text-white text-xl opacity-0 group-hover/canvas-card:opacity-100 relative z-10 text-black mt-4  font-bold group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200">
          {title}
        </h2>
      </div>
    </div>
  );
};

const AceternityIcon = () => {
  return (
    <svg
      width="66"
      height="65"
      viewBox="0 0 66 65"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-10 w-10 text-black dark:text-white group-hover/canvas-card:text-white "
    >
      <path
        d="M8 8.06C8 8.06 54.90 18.18 57.87 30.06C60.84 41.95 9.05 57.47 9.05 57.47"
        stroke="currentColor"
        strokeWidth="15"
        strokeMiterlimit="3.87"
        strokeLinecap="round"
        style={{ mixBlendMode: "darken" }}
      />
    </svg>
  );
};

const Icon = ({ className, ...rest }: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
};

