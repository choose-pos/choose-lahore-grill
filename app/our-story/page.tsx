// app/our-story/page.tsx
import { cookieKeys } from "@/constants";
import { Env } from "@/env";
import { graphQLClient } from "@/lib/graphqlClient";
import { sdk } from "@/utils/graphqlClient";
import { getCmsSectionIdHash } from "@/utils/theme-utils";
import { gql } from "graphql-request";
import { Metadata } from "next";
import OurStoryClient from "./OurStoryClient";

export const revalidate = 86400; // 1 day

export const metadata: Metadata = {
  title:
    "Our Story – Lahore Grill Marietta | Authentic Pakistani Cuisine Since 2008",
  description:
    "Discover the journey of Lahore Grill – bringing traditional Lahori flavors to Marietta, Atlanta since 2008. Rooted in heritage, crafted with love, and served with halal authenticity.",
  openGraph: {
    title:
      "Our Story – Lahore Grill Marietta | Authentic Pakistani Cuisine Since 2008",
    description:
      "Discover the journey of Lahore Grill – bringing traditional Lahori flavors to Marietta, Atlanta since 2008. Rooted in heritage, crafted with love, and served with halal authenticity.",
    images: [{ url: "/LahoreGrill.jpg" }],
    type: "article",
  },
  twitter: {
    card: "summary",
    title:
      "Our Story – Lahore Grill Marietta | Authentic Pakistani Cuisine Since 2008",
    description:
      "Discover the journey of Lahore Grill – bringing traditional Lahori flavors to Marietta, Atlanta since 2008. Rooted in heritage, crafted with love, and served with halal authenticity.",
    images: ["/LahoreGrill.jpg"],
  },
  alternates: {
    canonical: "https://lahoregrill.com/our-story",
  },
};

interface IOurStoryPage {
  section1Title: string;
  showTeamSection: boolean;
  section1Image: {
    url: string;
  };
  section1ImageBlurHash: string;
  section1Content: {
    raw: any;
    text: string;
  };
  section2Title: string;
  section2Image: {
    url: string;
  };
  section2ImageBlurHash: string;
  section3Title: string;
  section3Content: {
    raw: any;
    text: string;
  };
  section3Image: {
    url: string;
  };
  section3ImageBlurHash: string;
  teamTitle: string;
  teamHash1: string;
  teamImage1: {
    url: string;
  };
  teamContent1: {
    raw: any;
    text: string;
  };
  teamHash2: string;
  teamImage2: {
    url: string;
  };
  teamContent2: {
    raw: any;
    text: string;
  };
  teamHash3: string;
  teamImage3: {
    url: string;
  };
  teamContent3: {
    raw: any;
    text: string;
  };
  teamHash4: string;
  teamImage4: {
    url: string;
  };
  teamContent4: {
    raw: any;
    text: string;
  };
  name1: string;
  name2: string;
  name3: string;
  name4: string;
}

async function getOurStoryData() {
  const query = gql`
    query OurStoryPage {
      ourStoryPages {
        section1Title
        showTeamSection
        section1Image {
          url
        }
        section1Content {
          raw
          text
        }
        section1ImageBlurHash
        section2Title
        section2Image {
          url
        }
        section2ImageBlurHash
        section3Title
        section3Content {
          raw
          text
        }
        section3Image {
          url
        }
        section3ImageBlurHash
        teamTitle
        teamHash1
        teamImage1 {
          url
        }
        teamContent1 {
          raw
          text
        }
        teamHash2
        teamImage2 {
          url
        }
        teamContent2 {
          raw
          text
        }
        teamHash3
        teamImage3 {
          url
        }
        teamContent3 {
          raw
          text
        }
        teamHash4
        teamImage4 {
          url
        }
        teamContent4 {
          raw
          text
        }
        name1
        name2
        name3
        name4
      }
    }
  `;

  try {
    const response = await graphQLClient.request<{
      ourStoryPages: IOurStoryPage[];
    }>(query);
    return response.ourStoryPages[0];
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
  const [ourStoryData, restaurantData, cmsData] = await Promise.all([
    getOurStoryData(),
    getRestaurantData(),
    getRestaurtCmsData(),
  ]);

  const offerNavItems = await getOfferLinks();

  if (!restaurantData || !ourStoryData) {
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
    <OurStoryClient
      ourStoryPageData={ourStoryData}
      restaurantData={restaurantData}
      navItems={navItems}
      offerNavTitles={offerNavItems?.map((e) => {
        return {
          title: e.navTitle,
          link: `/promotion/${e.link}`,
        };
      })}
    />
  );
}
