import { ButtonV3 } from "@/components/ui/button-v3";
import { MechaturaRegistrationButton } from "./RegistrationButton";

export function MechaturaCTA() {
  return (
    <section className="relative w-full max-w-6xl mx-auto px-6 md:px-12 py-24 my-16 z-10">

      {/* Outer wrapper for border gradient and shadow depth */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-b from-white/20 via-white/5 to-transparent p-[1px] shadow-[0_30px_100px_-15px_rgba(0,10,30,0.8)] overflow-hidden">

        {/* Inner glass container */}
        <div className="relative bg-[#001030]/40 backdrop-blur-2xl rounded-[2.5rem] px-8 py-24 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden">

          {/* Subtle overhead ambient light for depth */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-blue-400/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-full max-w-xl h-64 bg-amber-400/10 blur-[100px] rounded-full pointer-events-none" />

          {/* Massive, bold typography with lighting/gradient depth */}
          <h2 className="relative z-10 text-6xl md:text-8xl lg:text-[7.5rem] font-black tracking-tighter mb-16 leading-none select-none">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/30 drop-shadow-xl">
              Ready to Win?
            </span>
          </h2>

          <div className="relative z-10 group">
            {/* Button backdrop shadow for extra pop */}
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 group-hover:bg-blue-500/40 transition-colors duration-500" />
            <MechaturaRegistrationButton className="scale-110 md:scale-125" />
          </div>

        </div>
      </div>

    </section>
  );
}
