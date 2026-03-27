import React from "react";

export const Card = ({ children }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
      {children}
    </div>
  );
};
