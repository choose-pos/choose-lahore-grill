"use client";

import { Env } from "@/env";
import { extractCampaignId, extractUTMParams } from "@/utils/analytics";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { extractErrorMessage } from "@/utils/UtilFncs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const InitializeSession = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const id = Env.NEXT_PUBLIC_RESTAURANT_ID;
    const searchParams = new URLSearchParams(window.location.search);
    const pageQuery = Object.fromEntries(searchParams.entries());

    const utmParams = extractUTMParams(pageQuery);
    const campaignId = extractCampaignId(pageQuery);
    const itemId = searchParams.get("itemId");

    const queryRecord = Object.fromEntries(
      Object.entries(pageQuery).filter(
        ([key]) =>
          !key.startsWith("utm_") &&
          key.toLowerCase() !== "campaignid" &&
          key.toLowerCase() !== "cid" &&
          key.toLowerCase() !== "itemid"
      )
    );

    const initializeSession = async () => {
      if (!id) {
        setError("Invalid Link");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${Env.NEXT_PUBLIC_SERVER_BASE_URL}/restaurant/session`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              restaurantId: id,
              utm: utmParams,
              campaignId,
              queryRecord:
                Object.keys(queryRecord).length > 0 ? queryRecord : null,
            }),
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to initialize session");
        }

        // Construct menu URL with parameters
        const menuParams = new URLSearchParams();

        // Add UTM parameters if they exist
        Object.entries(utmParams || {}).forEach(([key, value]) => {
          if (value) menuParams.append(key, value);
        });

        // Add campaign ID if it exists
        if (campaignId) {
          menuParams.append("campaignId", campaignId);
        }

        // Add item ID if it exists
        if (itemId) {
          menuParams.append("itemId", itemId);
        }

        // Add other query parameters to the redirect URL if needed
        Object.entries(queryRecord).forEach(([key, value]) => {
          menuParams.append(key, value);
        });

        // Construct the final URL
        const menuUrl = `/menu${
          menuParams.toString() ? `?${menuParams.toString()}` : ""
        }`;

        if (typeof window !== "undefined") {
          window.location.href = menuUrl;
        }
      } catch (err) {
        extractErrorMessage(err);
        setError(
          "An unexpected error occurred, please close this tab and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    initializeSession();

    // Disable only for router variable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Please wait...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen font-online-ordering">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <button
          style={{
            color: isContrastOkay(
              Env.NEXT_PUBLIC_PRIMARY_COLOR,
              Env.NEXT_PUBLIC_BACKGROUND_COLOR
            )
              ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
              : Env.NEXT_PUBLIC_TEXT_COLOR,
          }}
          className="px-4 py-2 bg-primary text-white rounded-full"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return null;
};

export default InitializeSession;
