import React from "react";

export const Button = ({ onClick, className, children }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-white rounded ${className}`}
    >
      {children}
    </button>
  );
};
