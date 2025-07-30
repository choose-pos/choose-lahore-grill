"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";

interface ButtonProps {
  text: string;
  url: string;
  boundary?: boolean;
}

const Button: React.FC<ButtonProps> = ({ text, url, boundary }) => {
  const searchParams = useSearchParams();

  return (
    <div className={`inline-block`}>
      <Link
        href={{ pathname: url, query: searchParams?.toString() }}
        className={`
         mt-4 px-8 py-3 text-sm xsm:text-lg md:text-xl font-medium font-primary uppercase tracking-wide  text-white bg-primaryColor rounded-[15px] shadow-xl
        ${boundary ? "border-2 border-white" : ""}`}
      >
        {text}
      </Link>
    </div>
  );
};

export default Button;
