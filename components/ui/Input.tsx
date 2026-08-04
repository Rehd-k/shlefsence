import React, { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      icon,
      iconPosition = "left",
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && iconPosition === "left" && (
            <span className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none shrink-0 flex items-center justify-center">
              {icon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={twMerge(
              clsx(
                "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all duration-150 shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-400 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-slate-100/10 dark:focus:border-slate-500",
                icon && iconPosition === "left" && "pl-9",
                icon && iconPosition === "right" && "pr-9",
                error
                  ? "border-red-500 focus:ring-red-500/20 focus:border-red-500 dark:border-red-500"
                  : "border-slate-200 dark:border-slate-700",
                className
              )
            )}
            {...props}
          />
          {icon && iconPosition === "right" && (
            <span className="absolute right-3 text-slate-400 dark:text-slate-500 pointer-events-none shrink-0 flex items-center justify-center">
              {icon}
            </span>
          )}
        </div>
        {error && <span className="text-xs font-medium text-red-500">{error}</span>}
        {helperText && !error && (
          <span className="text-xs text-slate-500 dark:text-slate-400">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
