// app/catering/page.tsx
import { cookieKeys } from "@/constants";
import { Env } from "@/env";
import { graphQLClient } from "@/lib/graphqlClient";
import { sdk } from "@/utils/graphqlClient";
import { getCmsSectionIdHash } from "@/utils/theme-utils";
import { gql } from "graphql-request";
import { Metadata } from "next";
import CateringPageClient from "./CateringPage";

export const revalidate = 86400; // 1 day

export const metadata: Metadata = {
  title:
    "Catering in Marietta –  Lahore Grill Pakistani, Indian & Halal Restaurant",
  description:
    "Bring the bold flavors of Pakistan to your event with Lahore Grill’s halal catering in Marietta, Atlanta. Perfect for weddings, mehndis, office lunches & more. Freshly cooked, custom packages, and timely delivery.",
  openGraph: {
    title:
      "Catering in Marietta –  Lahore Grill Pakistani, Indian & Halal Restaurant",
    description:
      "Bring the bold flavors of Pakistan to your event with Lahore Grill’s halal catering in Marietta, Atlanta. Perfect for weddings, mehndis, office lunches & more. Freshly cooked, custom packages, and timely delivery.",
    images: [{ url: "/LahoreGrill.jpg" }],
    type: "article",
  },
  twitter: {
    card: "summary",
    title:
      "Catering in Marietta –  Lahore Grill Pakistani, Indian & Halal Restaurant",
    description:
      "Bring the bold flavors of Pakistan to your event with Lahore Grill’s halal catering in Marietta, Atlanta. Perfect for weddings, mehndis, office lunches & more. Freshly cooked, custom packages, and timely delivery.",
    images: ["/LahoreGrill.jpg"],
  },
  alternates: {
    canonical: "https://lahoregrill.com/catering",
  },
};

export interface ICateringPage {
  section1Title: string;
  section1Content: {
    raw: any;
    text: string;
  };
  section1ImageBlurHash: string;
  section1Image: {
    url: string;
  };
  section2Title: string;
  section2Image: {
    url: string;
  };
  section2Content: {
    raw: any;
    text: string;
  };
  section2ImageBlurHash: string;
  section3Image: {
    url: string;
  };
  section3Content: {
    raw: any;
    text: string;
  };
  section3ImageBlurHash: string;
  section4Title: string;
  section4Image: {
    url: string;
  };
  section4Content: {
    raw: any;
    text: string;
  };
  section4ImageBlurHash: string;
  sec3Package1Title: string;
  sec3Package1Subtitle: string;
  sec3Package1Content: string;
  sec3Package2Title: string;
  sec3Package2Subtitle: string;
  sec3Package2Content: string;
  cateringPackage1: {
    text: string;
    raw: any;
  };
  cateringPackage2: {
    text: string;
    raw: any;
  };
  cateringPackage3: {
    text: string;
    raw: any;
  };
  partyTray1: {
    raw: any;
    text: string;
  };
  partyTray2: {
    raw: any;
    text: string;
  };
  partyTray3: {
    raw: any;
    text: string;
  };
  partyTray4: {
    raw: any;
    text: string;
  };
  partyTray1Image: {
    url: string;
  };
  partyTray2Image: {
    url: string;
  };
  partyTray3Image: {
    url: string;
  };
  partyTray4Image: {
    url: string;
  };
}

async function getCateringData() {
  const query = gql`
    query CateringPage {
      caterings {
        section1Title
        section1Content {
          raw
          text
        }
        section1ImageBlurHash
        section1Image {
          url
        }
        section2Title
        section2Image {
          url
        }
        section2Content {
          raw
          text
        }
        section2ImageBlurHash
        section4Title
        section4Image {
          url
        }
        section4Content {
          raw
          text
        }
        section4ImageBlurHash
        section3Image {
          url
        }
        section3Content {
          raw
          text
        }
        section3ImageBlurHash
        sec3Package1Title
        sec3Package1Subtitle
        sec3Package1Content
        sec3Package2Title
        sec3Package2Subtitle
        sec3Package2Content
        cateringPackage1 {
          text
          raw
        }
        cateringPackage2 {
          text
          raw
        }
        cateringPackage3 {
          text
          raw
        }
        partyTray1 {
          raw
          text
        }
        partyTray2 {
          raw
          text
        }
        partyTray3 {
          raw
          text
        }
        partyTray4 {
          raw
          text
        }
        partyTray1Image {
          url
        }
        partyTray2Image {
          url
        }
        partyTray3Image {
          url
        }
        partyTray4Image {
          url
        }
      }
    }
  `;

  try {
    const response = await graphQLClient.request<{
      caterings: ICateringPage[];
    }>(query);
    return response.caterings[0];
  } catch (error) {
    console.error("GraphQL query failed:", error);
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

export default async function CateringPage() {
  const [cateringData, restaurantData, cmsData] = await Promise.all([
    getCateringData(),
    getRestaurantData(),
    getRestaurtCmsData(),
  ]);

  const offerNavItems = await getOfferLinks();
  if (!restaurantData || !cateringData) {
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
    <CateringPageClient
      navItems={navItems}
      cateringPageData={cateringData}
      restaurantData={restaurantData}
      offerNavTitles={offerNavItems?.map((e) => {
        return {
          title: e.navTitle,
          link: e.link,
        };
      })}
    />
  );
}
