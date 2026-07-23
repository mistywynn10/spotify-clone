"use client";

import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={twMerge(
          `
          w-full
          rounded-full
          bg-green-500
          border
          border-transparent
          px-3
          py-3
          text-black
          font-bold
          disabled:cursor-not-allowed
          disabled:opacity-50
          hover:opacity-75
          transition
          `,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;