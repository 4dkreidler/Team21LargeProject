import React from "react";

export const PageTitle = ({ title, subtitle }) => {
  return (
    <div className="text-center color  mb-6 px-4 py-2   bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
    </div>
  );
};
