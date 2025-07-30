"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";

interface ButtonProps {
  text: string;
  url: string;
  submit?: boolean;
}

const Button: React.FC<ButtonProps> = ({ text, url, submit }) => {
  const searchParams = useSearchParams();

  if (submit) {
    return (
      <button type="submit" className={`inline-block`}>
        <p
          className={` 
         px-6 py-2 h-12 hidden md:block w-[180px] text-[20px] bg-textColor font-primary font-medium mr-10 border rounded-lg text-primaryColor transition-opacity duration-500 
        `}
        >
          {text}
        </p>
      </button>
    );
  }

  return (
    <div className={`inline-block`}>
      <Link
        href={{ pathname: url, query: searchParams?.toString() }}
        className={` 
          bg-bg3 text-bg1 hover:to-buttonHoverColor rounded-lg text-lg sm:text-[20px] px-8 py-2   block font-medium font-primary 
        `}
      >
        {text}
      </Link>
    </div>
  );
};

export default Button;
