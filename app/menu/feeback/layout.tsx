"use client";

import { ReactNode, Suspense } from "react";

interface LayoutProps {
  children: ReactNode;
}

const RedirectLayout = ({ children }: LayoutProps) => {
  return <Suspense fallback={<></>}>{children}</Suspense>;
};

export default RedirectLayout;