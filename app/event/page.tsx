// app/our-story/page.tsx
import { cookieKeys } from "@/constants";
import { Env } from "@/env";
import { graphQLClient } from "@/lib/graphqlClient";
import { sdk } from "@/utils/graphqlClient";
import { getCmsSectionIdHash } from "@/utils/theme-utils";
import { gql } from "graphql-request";
import { Metadata } from "next";
import PartyClient from "./EventClinet";
// import OurStoryClient from "./OurStoryClient";

export const revalidate = 86400; // 1 day

export const metadata: Metadata = {
  title:
    "Events in Marietta – Lahore Grill Pakistani, Indian & Halal Restaurant",
  description:
    "Plan your perfect event with Lahore Grill in Marietta, Atlanta. From mehndis to corporate parties, enjoy authentic halal Pakistani food and seamless event catering services.",
  openGraph: {
    title:
      "Events in Marietta – Lahore Grill Pakistani, Indian & Halal Restaurant",
    description:
      "Plan your perfect event with Lahore Grill in Marietta, Atlanta. From mehndis to corporate parties, enjoy authentic halal Pakistani food and seamless event catering services.",
    images: [{ url: "/LahoreGrill.jpg" }],
    type: "article",
  },
  twitter: {
    card: "summary",
    title:
      "Events in Marietta – Lahore Grill Pakistani, Indian & Halal Restaurant",
    description:
      "Plan your perfect event with Lahore Grill in Marietta, Atlanta. From mehndis to corporate parties, enjoy authentic halal Pakistani food and seamless event catering services.",
    images: ["/LahoreGrill.jpg"],
  },
  alternates: {
    canonical: "https://lahoregrill.com/event",
  },
};

export interface IPartyPage {
  section1Title: string;
  section1Image: {
    url: string;
  };
  hash: string;
  section2Image: {
    url: string;
  };
  hash2: string;
  section3Image: {
    url: string;
  };
  section1Content: {
    raw: any;
    text: string;
  };
  hash3: string;
}

async function getOurStoryData() {
  const query = gql`
    query EventPage {
      eventPages {
        section1Title
        section1Image {
          url
        }
        hash
        section2Image {
          url
        }
        hash2
        section3Image {
          url
        }
        section1Content {
          raw
          text
        }
        hash3
      }
    }
  `;

  try {
    const response = await graphQLClient.request<{
      eventPages: IPartyPage[];
    }>(query);

    return response.eventPages[0];
  } catch (error) {
    console.error("GraphQL query failed:", error);
    return null;
  }
}

async function getRestaurantData() {
  const cookieVal = `${cookieKeys.restaurantCookie}=${Env.NEXT_PUBLIC_RESTAURANT_ID}`;

  try {
    const [cmsData, restaurantData] = await Promise.all([
      sdk.GetCmsDetails(
        {},
        {
          cookie: cookieVal,
        }
      ),
      sdk.GetCmsRestaurantDetails(
        {},
        {
          cookie: cookieVal,
        }
      ),
    ]);

    return restaurantData?.getCmsRestaurantDetails;
  } catch (error) {
    console.error("Failed to fetch restaurant data:", error);
    return null;
  }
}

async function getRestaurtCmsData() {
  const cookieVal = `${cookieKeys.restaurantCookie}=${Env.NEXT_PUBLIC_RESTAURANT_ID}`;

  try {
    const [cmsData] = await Promise.all([
      sdk.GetCmsDetails(
        {},
        {
          cookie: cookieVal,
        }
      ),
    ]);

    return cmsData.getCmsDetails;
  } catch (error) {
    console.error("Failed to fetch restaurant data:", error);
    return null;
  }
}

async function getOfferLinks() {
  try {
    const cookieVal = `${cookieKeys.restaurantCookie}=${Env.NEXT_PUBLIC_RESTAURANT_ID}`;
    const res = await sdk.getCmsPromoNavItems({}, { cookie: cookieVal });
    return res.getCmsPromoNavItems;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default async function OurStoryPage() {
  const [partyData, restaurantData, cmsData] = await Promise.all([
    getOurStoryData(),
    getRestaurantData(),
    getRestaurtCmsData(),
  ]);

  const offerNavItems = await getOfferLinks();

  if (!restaurantData || !partyData) {
    return <div>Loading...</div>;
  }

  if (!cmsData) {
    return null;
  }

  const { reviewSection, menuSection } = cmsData;

  const navItems: { name: string; link: string }[] = [
    { name: "Home", link: "/" },
    { name: "Our Story", link: "/our-story" },
    { name: "Catering", link: "/catering" },
    { name: "Banquet Hall", link: "/parties" },
    { name: "Events", link: "/event" },
    // { name: "Reservations", link: "/reservations" },
    { name: "Contact us", link: "/contact" },
  ];

  if (menuSection.show) {
    navItems.splice(1, 0, {
      name: menuSection.navTitle,
      link: getCmsSectionIdHash(menuSection.navTitle),
    });
  }

  return (
    <PartyClient
      navItems={navItems}
      partyPageData={partyData}
      restaurantData={restaurantData}
      offerNavTitles={offerNavItems?.map((e) => {
        return {
          title: e.navTitle,
          link: `/promotion/${e.link}`,
        };
      })}
    />
  );
}
