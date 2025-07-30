// app/our-story/page.tsx
import { cookieKeys } from "@/constants";
import { Env } from "@/env";
import { graphQLClient } from "@/lib/graphqlClient";
import { sdk } from "@/utils/graphqlClient";
import { getCmsSectionIdHash } from "@/utils/theme-utils";
import { gql } from "graphql-request";
import { Metadata } from "next";
import PartyClient from "./PartyClient";
// import OurStoryClient from "./OurStoryClient";

export const revalidate = 86400; // 1 day

export const metadata: Metadata = {
  title: "Groups and Parties | Saffron",
  description:
    "Host unforgettable gatherings with Saffron’s authentic Indian cuisine and elegant ambiance, perfect for any celebration.",
  openGraph: {
    title: "Groups and Parties | Saffron",
    description:
      "Host unforgettable gatherings with Saffron’s authentic Indian cuisine and elegant ambiance, perfect for any celebration.",
    images: [{ url: "/Saffron.jpg" }],
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Groups and Parties | Saffron",
    description:
      "Host unforgettable gatherings with Saffron’s authentic Indian cuisine and elegant ambiance, perfect for any celebration.",
    images: ["/Saffron.jpg"],
  },
  alternates: {
    canonical: "https://saffroncary.com/parties",
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
    query PartyPage {
      partyPages {
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
      partyPages: IPartyPage[];
    }>(query);
    return response.partyPages[0];
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

export default async function OurStoryPage() {
  const [partyData, restaurantData, cmsData] = await Promise.all([
    getOurStoryData(),
    getRestaurantData(),
    getRestaurtCmsData(),
  ]);

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
    { name: "Reservations", link: "/reservations" },
    { name: "Contact us", link: "/contact" },
  ];

  if (menuSection.show) {
    navItems.push({
      name: menuSection.navTitle,
      link: getCmsSectionIdHash(menuSection.navTitle),
    });
  }

  // if (reviewSection?.show) {
  //   navItems.push({
  //     name: reviewSection.navTitle,
  //     link: getCmsSectionIdHash(reviewSection.navTitle),
  //   });
  // }

  return (
    <PartyClient
      navItems={navItems}
      partyPageData={partyData}
      restaurantData={restaurantData}
    />
  );
}
