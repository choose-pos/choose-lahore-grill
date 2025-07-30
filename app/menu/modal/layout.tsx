"use client";

// import Footer from "@/components/Footer";
// import { sdk } from "@/utils/graphqlClient";
// import { CustomerRestaurant } from "@/utils/types";
import { ReactNode, Suspense } from "react";
import Loading from "../loading";

interface LayoutProps {
  children: ReactNode;
}

const ItemModalLayout = ({ children }: LayoutProps) => {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
};

export default ItemModalLayout;
