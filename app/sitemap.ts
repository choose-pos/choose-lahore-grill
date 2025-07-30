import { Env } from "@/env";
import type { MetadataRoute } from "next";

export const revalidate = 3600; // an hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  return [
    {
      url: `https://${domain}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `https://${domain}/menu`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `https://${domain}/blogs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `https://${domain}/catering`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `https://${domain}/gallery`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `https://${domain}/our-story`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `https://${domain}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
