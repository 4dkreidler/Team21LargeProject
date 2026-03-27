import React from "react";

export const Button = ({ children, ...props }) => {
  return (
    <button
      className="w-full bg-blue-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-2xl shadow"
      {...props}
    >
      {children}
    </button>
  );
};
