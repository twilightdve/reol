import React, { useEffect } from "react";
import { initFlowbite } from "flowbite";

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  useEffect(() => {
    initFlowbite();
  }, []);

  return <>{children}</>;
};

export default Layout;
