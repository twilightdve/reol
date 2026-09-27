import React from "react";

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

// flowbite の initFlowbite()(data-* 属性ベースのJS)は、該当する属性を使う箇所が
// 無いため呼ばない(flowbite 本体を全ページ共通JSに含めないため)。
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return <>{children}</>;
};

export default Layout;
