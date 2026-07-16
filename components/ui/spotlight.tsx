/* eslint-disable */
"use client";
import React from "react";
import { motion } from "motion/react";

type SpotlightProps = {
    gradientFirst?: string;
    gradientSecond?: string;
    gradientThird?: string;
    translateY?: number | string;
    width?: number | string;
    height?: number | string;
    smallWidth?: number | string;
    duration?: number;
    xOffset?: number | string;
};

const getStyleValue = (val: number | string) => (typeof val === "number" ? `${val}px` : val);

export const Spotlight = ({
    gradientFirst = "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(210, 100%, 85%, .08) 0, hsla(210, 100%, 55%, .02) 50%, hsla(210, 100%, 45%, 0) 80%)",
    gradientSecond = "radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .06) 0, hsla(210, 100%, 55%, .02) 80%, transparent 100%)",
    gradientThird = "radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, .04) 0, hsla(210, 100%, 45%, .02) 80%, transparent 100%)",
    translateY = "clamp(-350px, -30vh, -200px)",
    width = "clamp(280px, 50vw, 560px)",
    height = "clamp(800px, 120vh, 1380px)",
    smallWidth = "clamp(120px, 20vw, 240px)",
    duration = 7,
    xOffset = "clamp(50px, 10vw, 100px)",
}: SpotlightProps = {}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="pointer-events-none absolute inset-0 h-full w-full"
        >
            <motion.div
                animate={{
                    x: [0, typeof xOffset === "number" ? xOffset : `calc(${xOffset})`, 0],
                }}
                transition={{
                    duration,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                }}
                className="absolute top-0 left-0 w-screen h-screen z-40 pointer-events-none"
            >
                <div
                    style={{
                        transform: `translateY(${getStyleValue(translateY)}) rotate(-45deg)`,
                        background: gradientFirst,
                        width: getStyleValue(width),
                        height: getStyleValue(height),
                    }}
                    className="absolute top-0 left-0"
                />

                <div
                    style={{
                        transform: "rotate(-45deg) translate(5%, -50%)",
                        background: gradientSecond,
                        width: getStyleValue(smallWidth),
                        height: getStyleValue(height),
                    }}
                    className="absolute top-0 left-0 origin-top-left"
                />

                <div
                    style={{
                        transform: "rotate(-45deg) translate(-180%, -70%)",
                        background: gradientThird,
                        width: getStyleValue(smallWidth),
                        height: getStyleValue(height),
                    }}
                    className="absolute top-0 left-0 origin-top-left"
                />
            </motion.div>

            <motion.div
                animate={{
                    x: [0, typeof xOffset === "number" ? -xOffset : `calc(-1 * (${xOffset}))`, 0],
                }}
                transition={{
                    duration,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                }}
                className="absolute top-0 right-0 w-screen h-screen z-40 pointer-events-none hidden md:block"
            >
                <div
                    style={{
                        transform: `translateY(${getStyleValue(translateY)}) rotate(45deg)`,
                        background: gradientFirst,
                        width: getStyleValue(width),
                        height: getStyleValue(height),
                    }}
                    className="absolute top-0 right-0"
                />

                <div
                    style={{
                        transform: "rotate(45deg) translate(-5%, -50%)",
                        background: gradientSecond,
                        width: getStyleValue(smallWidth),
                        height: getStyleValue(height),
                    }}
                    className="absolute top-0 right-0 origin-top-right"
                />

                <div
                    style={{
                        transform: "rotate(45deg) translate(180%, -70%)",
                        background: gradientThird,
                        width: getStyleValue(smallWidth),
                        height: getStyleValue(height),
                    }}
                    className="absolute top-0 right-0 origin-top-right"
                />
            </motion.div>
        </motion.div>
    );
};
