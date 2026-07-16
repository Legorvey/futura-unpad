/* eslint-disable */
"use client";
import { cn } from "@/lib/utils";
import { isInternalAppHref } from "@/lib/navigation";
import { IconMenu2, IconX } from "@tabler/icons-react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";

import React, { useRef, useState } from "react";

type AppLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

function AppLink({ href, children, ...props }: AppLinkProps) {
  if (isInternalAppHref(href)) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

const navbarSettings = {
  scrollTrigger: 100,
  desktop: {
    restingWidth: "min(calc(100vw - 2rem), 96rem)",
    scrolledWidth: "min(calc(100vw - 2rem), 86rem)",
    scrolledY: 16,
  },
  mobile: {
    scrolledWidth: "90%",
    scrolledY: 5,
    scrolledPaddingX: "18px",
    restingRadius: "2rem",
    scrolledRadius: "12px",
    menuTop: "4rem",
  },
  classes: {
    scrolledSurface:
      "bg-white/70 backdrop-blur-xl dark:bg-neutral-950/70",
    navText:
      "text-zinc-600 hover:text-zinc-800 dark:text-neutral-300 dark:hover:text-white",
    itemText: "text-neutral-600 dark:text-neutral-300",
    hoverPill: "bg-gray-100 dark:bg-neutral-800",
  },
  motion: {
    surface: {
      type: "spring",
      stiffness: 120,
      damping: 30,
      mass: 0.9,
    },
    hoverPill: {
      type: "spring",
      stiffness: 400,
      damping: 32,
      mass: 0.6,
    },
    mobileMenu: {
      duration: 0.36,
      ease: [0.16, 1, 0.3, 1],
    },
  },
} as const;

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

type NavbarButtonProps = React.HTMLAttributes<HTMLElement> & {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
  disabled?: boolean;
  download?: boolean | string;
  rel?: string;
  target?: string;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
};

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > navbarSettings.scrollTrigger) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      // IMPORTANT: Change this to class of `fixed` if you want the navbar to be fixed
      className={cn("fixed inset-x-0 top-4 z-40 w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(16px)" : "blur(0px)",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible
          ? navbarSettings.desktop.scrolledWidth
          : navbarSettings.desktop.restingWidth,
        y: visible ? navbarSettings.desktop.scrolledY : 0,
      }}
      transition={navbarSettings.motion.surface}
      style={{
        WebkitBackdropFilter: visible ? "blur(16px)" : "blur(0px)",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden flex-row items-center justify-between self-start -mt-2 rounded-full bg-transparent px-3 py-3 lg:flex dark:bg-transparent",
        visible && navbarSettings.classes.scrolledSurface,
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium transition-all duration-500 ease-out lg:flex lg:space-x-2",
        navbarSettings.classes.navText,
        className,
      )}
    >
      {items.map((item, idx) => (
        <AppLink
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className={cn(
            "relative px-4 py-2 transition-colors duration-500 ease-out",
            navbarSettings.classes.itemText,
          )}
          key={item.name}
          href={item.link}
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              transition={navbarSettings.motion.hoverPill}
              className={cn(
                "absolute inset-0 h-full w-full rounded-full",
                navbarSettings.classes.hoverPill,
              )}
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </AppLink>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(16px)" : "blur(0px)",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? navbarSettings.mobile.scrolledWidth : "100%",
        paddingRight: visible ? navbarSettings.mobile.scrolledPaddingX : "0px",
        paddingLeft: visible ? navbarSettings.mobile.scrolledPaddingX : "0px",
        borderRadius: visible
          ? navbarSettings.mobile.scrolledRadius
          : navbarSettings.mobile.restingRadius,
        y: visible ? navbarSettings.mobile.scrolledY : 0,
      }}
      transition={navbarSettings.motion.surface}
      style={{
        WebkitBackdropFilter: visible ? "blur(16px)" : "blur(0px)",
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden",
        visible && navbarSettings.classes.scrolledSurface,
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, scale: 0.985, filter: "blur(4px)" }}
          transition={navbarSettings.motion.mobileMenu}
          style={{ top: navbarSettings.mobile.menuTop }}
          className={cn(
            "absolute inset-x-0 z-50 flex w-full origin-top flex-col items-start justify-start gap-4 rounded-lg bg-white px-6 py-8 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] dark:bg-neutral-950",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return isOpen ? (
    <IconX className="text-black dark:text-white" onClick={onClick} />
  ) : (
    <IconMenu2 className="text-black dark:text-white" onClick={onClick} />
  );
};

export const NavbarLogo = () => {
  return (
    <AppLink
      href="/"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
    >
      <span className="font-medium text-xl text-black dark:text-white">Futura</span>
    </AppLink>
  );
};

export const NavbarButton = ({
  href,
  as,
  children,
  className,
  variant = "primary",
  ...props
}: NavbarButtonProps) => {
  const baseStyles =
    "px-4 py-2 rounded-md bg-white button bg-white text-black text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-500 ease-out inline-block text-center";

  const variantStyles = {
    primary:
      "shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
    secondary: "bg-transparent shadow-none dark:text-white",
    dark: "bg-black text-white shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
    gradient:
      "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]",
  };

  const classes = cn(baseStyles, variantStyles[variant], className);

  if (as) {
    const Component = as;

    return (
      // @ts-ignore - dynamic component children injection
      <Component href={href || undefined} className={classes} {...props}>
        {children}
      </Component>
    );
  }

  if (href) {
    return (
      <AppLink
        href={href}
        className={classes}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </AppLink>
    );
  }

  return (
    <button
      className={classes}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
};
