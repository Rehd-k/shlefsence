import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "link";
  size?: "xs" | "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      icon,
      iconPosition = "left",
      isLoading = false,
      fullWidth = false,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-900/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed select-none cursor-pointer";

    const variants = {
      primary:
        "bg-slate-900 text-white hover:bg-slate-800 shadow-xs border border-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200",
      secondary:
        "bg-slate-100 text-slate-800 hover:bg-slate-200/80 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
      outline:
        "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800",
      danger:
        "bg-red-600 text-white hover:bg-red-700 shadow-xs border border-red-700 dark:bg-red-600 dark:hover:bg-red-500",
      ghost:
        "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
      link: "text-indigo-600 hover:underline p-0 h-auto dark:text-indigo-400",
    };

    const sizes = {
      xs: "text-xs px-2.5 py-1 gap-1.5 h-7",
      sm: "text-xs px-3 py-1.5 gap-1.5 h-8 font-semibold",
      md: "text-sm px-4 py-2 gap-2 h-9",
      lg: "text-base px-5 py-2.5 gap-2.5 h-11",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], fullWidth && "w-full", className))}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block animate-spin border-2 border-current border-t-transparent rounded-full w-4 h-4 mr-2" />
        ) : icon && iconPosition === "left" ? (
          <span className="shrink-0">{icon}</span>
        ) : null}

        {children}

        {!isLoading && icon && iconPosition === "right" ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = "Button";
