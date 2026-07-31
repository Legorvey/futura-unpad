"use client";

import { useEffect, useState, useRef } from "react";

function calculateTimeLeft(targetDate: number) {
  const difference = targetDate - new Date().getTime();
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

const FlipDigit = ({ value, label }: { value: number; label: string }) => {
  const [prev, setPrev] = useState(value);
  const [current, setCurrent] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  if (value !== current) {
    setPrev(current);
    setCurrent(value);
    setIsFlipping(true);
  }

  useEffect(() => {
    if (isFlipping) {
      const timer = setTimeout(() => {
        setIsFlipping(false);
      }, 600); // Wait for animation to finish
      return () => clearTimeout(timer);
    }
  }, [isFlipping]);

  const currentStr = String(current).padStart(2, "0");
  const prevStr = String(prev).padStart(2, "0");

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative w-16 h-20 sm:w-20 sm:h-28 md:w-28 md:h-36 lg:w-32 lg:h-40 rounded-xl md:rounded-2xl shadow-xl font-sans" 
        style={{ perspective: "1000px" }}
      >
        {/* Split Line */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-black/10 z-50 -translate-y-1/2" />
        
        {/* Top Static (Next value) */}
        <div className="absolute top-0 left-0 w-full h-[50%] bg-[#E8EAEF] rounded-t-xl md:rounded-t-2xl overflow-hidden flex justify-center items-end border border-black/5 border-b-0">
          <span className="text-[#0033A0] font-black text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-none translate-y-[50%] block pb-0">
            {currentStr}
          </span>
          <div className="absolute inset-0 bg-gradient-to-b from-black/[0.02] to-black/[0.08]" />
        </div>

        {/* Bottom Static (Current value until flip ends) */}
        <div className="absolute bottom-0 left-0 w-full h-[50%] bg-[#E8EAEF] rounded-b-xl md:rounded-b-2xl overflow-hidden flex justify-center items-start border border-black/5 border-t-0">
          <span className="text-[#0033A0] font-black text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-none -translate-y-[50%] block pt-0">
            {isFlipping ? prevStr : currentStr}
          </span>
        </div>

        {/* Flipping Top Flap (Old value flipping down) */}
        {isFlipping && (
          <div 
            className="absolute top-0 left-0 w-full h-[50%] bg-[#E8EAEF] rounded-t-2xl overflow-hidden flex justify-center items-end border border-black/5 border-b-0 origin-bottom animate-flip-top z-20"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="text-[#0033A0] font-black text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-none translate-y-[50%] block pb-0">
              {prevStr}
            </span>
            <div className="absolute inset-0 bg-gradient-to-b from-black/[0.02] to-black/[0.08]" />
          </div>
        )}

        {/* Flipping Bottom Flap (New value flipping down to reveal) */}
        {isFlipping && (
          <div 
            className="absolute bottom-0 left-0 w-full h-[50%] bg-[#E8EAEF] rounded-b-2xl overflow-hidden flex justify-center items-start border border-black/5 border-t-0 origin-top animate-flip-bottom z-20"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateX(90deg)' }}
          >
            <span className="text-[#0033A0] font-black text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-none -translate-y-[50%] block pt-0">
              {currentStr}
            </span>
          </div>
        )}
      </div>
      <span className="mt-3 md:mt-4 font-bold text-[10px] sm:text-xs md:text-sm tracking-wide md:tracking-widest uppercase">
        {label}
      </span>
    </div>
  );
};

export default function FlipCountdown({ targetDate }: { targetDate: number }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) return <div className="h-40" />;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flip-top {
          0% { transform: rotateX(0deg); }
          100% { transform: rotateX(-90deg); }
        }
        @keyframes flip-bottom {
          0% { transform: rotateX(90deg); }
          100% { transform: rotateX(0deg); }
        }
        .animate-flip-top {
          animation: flip-top 0.3s cubic-bezier(0.4, 0.0, 1, 1) forwards;
        }
        .animate-flip-bottom {
          animation: flip-bottom 0.3s cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
          animation-delay: 0.3s;
        }
      `}} />
      <div className="flex items-center justify-center gap-2 sm:gap-4 lg:gap-8">
        <FlipDigit label="Days" value={timeLeft.days} />
        <div className="text-[#E8EAEF] text-2xl sm:text-4xl md:text-6xl font-black mb-6 md:mb-8">/</div>
        <FlipDigit label="Hours" value={timeLeft.hours} />
        <div className="text-[#E8EAEF] text-2xl sm:text-4xl md:text-6xl font-black mb-6 md:mb-8">/</div>
        <FlipDigit label="Seconds" value={timeLeft.seconds} />
      </div>
    </>
  );
}
