"use client";

import { Env } from "@/env";

const PhoneOrderNotFound = () => {
  const textColor = Env.NEXT_PUBLIC_TEXT_COLOR;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-body-oo gap-4 px-6 text-center">
      <div className="text-5xl">🔗</div>
      <h1
        className="text-2xl font-semibold font-subheading-oo"
        style={{ color: textColor }}
      >
        Link Not Found
      </h1>
      <p className="text-base opacity-80" style={{ color: textColor }}>
        This payment link is invalid or has been removed. Please contact the
        restaurant for a new link.
      </p>
    </div>
  );
};

export default PhoneOrderNotFound;
