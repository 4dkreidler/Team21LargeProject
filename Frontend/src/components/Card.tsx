import React from "react";

interface CardProps {
  children: React.ReactNode; // ReactNode allows any valid React element (text, divs, buttons)
}

export const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
      {children}
    </div>
  );
};