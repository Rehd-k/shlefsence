import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const sizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
} as const;

export interface BrandLogoProps {
  size?: keyof typeof sizes;
  /** auto = theme-aware; onDark = white logo; onLight = black logo */
  surface?: "auto" | "onDark" | "onLight";
  className?: string;
  imgClassName?: string;
  alt?: string;
}

export function BrandLogo({
  size = "md",
  surface = "auto",
  className,
  imgClassName,
  alt = "ShelfSense",
}: BrandLogoProps) {
  const frame = twMerge(
    clsx(
      "relative shrink-0 overflow-hidden rounded-xl bg-white/5",
      sizes[size],
      className
    )
  );
  const img = twMerge(clsx("h-full w-full object-contain p-1", imgClassName));

  if (surface === "onDark") {
    return (
      <div className={frame}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/logo_white.png" alt={alt} className={img} />
      </div>
    );
  }

  if (surface === "onLight") {
    return (
      <div className={frame}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/logo_black.png" alt={alt} className={img} />
      </div>
    );
  }

  return (
    <div className={frame}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo/logo_black.png"
        alt={alt}
        className={twMerge(clsx(img, "dark:hidden"))}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo/logo_white.png"
        alt={alt}
        className={twMerge(clsx(img, "hidden dark:block"))}
      />
    </div>
  );
}
