import React, { ReactNode } from "react";
import { Navbar } from "./Navbar"; // Import your existing Navbar

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-16"> 
      {/* pt-16 adds padding at the top so content doesn't hide under the fixed navbar */}
      <Navbar /> 
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
};