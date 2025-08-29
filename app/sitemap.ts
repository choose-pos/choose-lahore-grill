import { Env } from "@/env";
import { cookieKeys } from "@/constants";
import { sdk } from "@/utils/graphqlClient";
import type { MetadataRoute } from "next";

export const revalidate = 3600; // an hour

async function getOfferLinks() {
  try {
    const cookieVal = `${cookieKeys.restaurantCookie}=${Env.NEXT_PUBLIC_RESTAURANT_ID}`;
    const res = await sdk.getCmsPromoNavItems({}, { cookie: cookieVal });
    return res.getCmsPromoNavItems || [];
  } catch (error) {
    console.error("Error fetching offer links for sitemap:", error);
    return [];
  }
}

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
    console.log("Error in generating sitemap.ts", error);
  }

  const staticRoutes: MetadataRoute.Sitemap = [
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
      url: `https://${domain}/catering`,
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
      url: `https://${domain}/event`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `https://${domain}/parties`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `https://${domain}/contact`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // fetch dynamic promo slugs with sdk
  const promoLinks = await getOfferLinks();
  const promoRoutes: MetadataRoute.Sitemap = promoLinks.map((item: any) => ({
    url: `https://${domain}/promotion/${item.link}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticRoutes, ...promoRoutes];
}
