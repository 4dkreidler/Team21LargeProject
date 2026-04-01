import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      className="w-full bg-[#7fb3d5] hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition-colors"
      {...props}
    >
      {children}
    </button>
  );
};