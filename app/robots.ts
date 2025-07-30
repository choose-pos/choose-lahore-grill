import { Env } from "@/env";
import type { MetadataRoute } from "next";

export const revalidate = 3600; // an hour

export default async function robots(): Promise<MetadataRoute.Robots> {
  let domain = "";
  try {
    const restaurantDetails = await fetch(
      `${Env.NEXT_PUBLIC_SERVER_BASE_URL}/restaurant/details`,
      { headers: { Authorization: Env.NEXT_PUBLIC_RESTAURANT_ID } }
    );

    const data = await restaurantDetails.json();
    domain = data.domain;
  } catch (error) {
    console.log("Error in generating robots.ts", error);
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/menu/cart",
        "/menu/checkout",
        "/menu/redirect/payment-status",
      ],
    },
    sitemap: `https://${domain}/sitemap.xml`,
  };
}
