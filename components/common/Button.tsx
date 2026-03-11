"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";

interface ButtonProps {
  text: string;
  url: string;
  submit?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  text,
  url,
  submit,
  fullWidth = false,
}) => {
  const searchParams = useSearchParams();

  if (submit) {
    return (
      <div className={fullWidth ? "w-full px-4" : `inline-block`}>
        <p
          className={` px-6 py-2 h-12 hidden md:block w-[180px] text-[20px] bg-textColor font-primary font-medium mr-10 border rounded-lg text-primaryColor transition-opacity duration-500 
        `}
        >
          {text}
        </p>
      </div>
    );
  }

  return (
    <div className={fullWidth ? "w-full" : "inline-block"}>
      <Link
        href={{ pathname: url, query: searchParams?.toString() }}
        className={`bg-primaryColor text-white hover:opacity-90 rounded-lg text-base sm:text-lg md:text-[20px] px-6 sm:px-8 py-2 sm:py-3 flex items-center justify-center font-medium font-primary ${
          fullWidth ? "w-full" : ""
        }`}
      >
        {text}
      </Link>
    </div>
  );
};

export default Button;
