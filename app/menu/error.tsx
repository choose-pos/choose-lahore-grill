"use client";

import { Env } from "@/env";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-online-ordering">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button
        className="px-4 py-2 bg-primary text-white rounded-full"
        style={{
          color: isContrastOkay(
            Env.NEXT_PUBLIC_PRIMARY_COLOR,
            Env.NEXT_PUBLIC_BACKGROUND_COLOR
          )
            ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
            : Env.NEXT_PUBLIC_TEXT_COLOR,
        }}
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </button>
    </div>
  );
}
