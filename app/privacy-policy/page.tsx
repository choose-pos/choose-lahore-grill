// app/our-story/page.tsx
import Footer from "@/components/theme_custom/components/Footer";
import Navbar from "@/components/theme_custom/components/Navbar";
import { cookieKeys } from "@/constants";
import { Env } from "@/env";
import { sdk } from "@/utils/graphqlClient";
import { getCmsSectionIdHash, groupHoursByDays } from "@/utils/theme-utils";

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
  const [restaurantData, cmsData] = await Promise.all([
    getRestaurantData(),
    getRestaurtCmsData(),
  ]);

  if (!restaurantData) {
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

  navItems.push(
    ...[{ name: "Reservation", link: "https://reserve.saffroncary.com/" }]
  );

  const {
    name,
    brandingLogo,
    address,
    availability,
    email,
    phone,
    socialInfo,
  } = restaurantData;

  return (
    <div className="bg-[#fdfdec] pt-40 min-h-screen">
      <Navbar
        email={email}
        phone={phone}
        navItems={navItems}
        logo={brandingLogo ?? ""}
      />
      <div className="max-w-3xl mx-auto w-11/12">
        <div>
          <h1 className={`text-2xl md:text-4xl font-bold text-center`}>
            {`Privacy policy`}
          </h1>
          <p className="text-center pt-4">Last updated on June 17, 2024</p>
        </div>
        {/* <h1>Privacy Policy for Himalayan Kitchen</h1> */}

        <div className="space-y-4 py-10">
          <p>
            {`At Saffron, accessible from`}{" "}
            <a href=" https://saffroncary.com/"> https://saffroncary.com</a>
          </p>
          <p>
            {`We always strive to serve fresh, delicious meals with strict standards of quality and accuracy. If for some reason we have provided you with an incorrect order, please contact us by telephone or by coming into the store as soon as you notice the discrepancy. We will do everything we can to quickly correct the issue. We also appreciate feedback if you are otherwise unsatisfied with your order. We strive to always take care of our customers and resolve any issues as best as we possibly can. We offer replacements when appropriate and, when that is not a suitable solution for a particular situation, we provide both full and partial refunds. Please note, when paying by credit card, refunds may take up to 5-7 business days to process to your account. If there is ever anything wrong with your order or you have a concern please return your meal just as it is. We strive to always take care of our customers and resolve any issues as best as we possibly can.`}
          </p>
        </div>
      </div>
      <Footer
        address={address?.addressLine1 ?? ""}
        coords={address?.coordinate?.coordinates ?? [0, 0]}
        contact={{ email: email, phone: phone }}
        hours={availability ? groupHoursByDays(availability) : []}
        socialInfo={{
          facebook: socialInfo?.facebook,
          instagram: socialInfo?.instagram,
        }}
        restaurantName={name}
        brandingLogo={brandingLogo ?? ""}
      />
    </div>
  );
}
