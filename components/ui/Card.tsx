import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          "bg-white rounded-xl border border-slate-200/90 shadow-2xs transition-all duration-150 dark:bg-slate-900 dark:border-slate-800",
          hoverable && "hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx("p-5 pb-3 border-b border-slate-100 flex items-center justify-between dark:border-slate-800/80", className)
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return <div className={twMerge(clsx("p-5", className))} {...props}>{children}</div>;
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx("p-4 bg-slate-50/50 rounded-b-xl border-t border-slate-100 flex items-center justify-between dark:bg-slate-900/50 dark:border-slate-800/80", className)
      )}
      {...props}
    >
      {children}
    </div>
  );
};
