

import Footer from "@/components/theme_custom/components/Footer";
import Navbar from "@/components/theme_custom/components/Navbar";
import { cookieKeys } from "@/constants";
import { Env } from "@/env";
import { sdk } from "@/utils/graphqlClient";
import { groupHoursByDays } from "@/utils/theme-utils";
import Link from "next/link";
import { FiHome } from "react-icons/fi";

export default async function NotFound() {
  const cookieVal = `${cookieKeys.restaurantCookie}=${Env.NEXT_PUBLIC_RESTAURANT_ID}`;

  const [cmsData, restaurantData, promoNavItems] = await Promise.all([
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
    sdk.getCmsPromoNavItems({}, { cookie: cookieVal }),
  ]);
  if (!cmsData?.getCmsDetails) {
    return null;
  }

  if (!restaurantData?.getCmsRestaurantDetails) {
    return null;
  }

  const {
    name,
    brandingLogo,
    address,
    availability,
    email,
    phone,
    socialInfo,
  } = restaurantData.getCmsRestaurantDetails;

  return (

        <div
      className="min-h-screen font-online-ordering"
      style={{
        backgroundColor: Env.NEXT_PUBLIC_BACKGROUND_COLOR,
        color: Env.NEXT_PUBLIC_TEXT_COLOR,
      }}
    >
      <Navbar navItems={[]} logo={brandingLogo ?? ""} offerNavTitles={[]} email={email} phone={phone} />

    <div className="min-h-[85vh] mt-16 flex items-center justify-center  px-6 font-online-ordering bg-bg2 text-subtext">
      <div className="max-w-md w-full text-center ">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold font-online-ordering text-primaryColor">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 font-online-ordering">
            Page Not Found
          </h2>
          <p className="text-lg mb-2 font-online-ordering opacity-80">
            Oops! The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <p className="text-base font-online-ordering opacity-60">
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row gap-4 justify-center">
          <Link href="/">
            <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-200 font-online-ordering font-medium bg-primaryColor text-bg2 hover:opacity-90">
              <FiHome size={20} />
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
    <Footer
        brandingLogo={brandingLogo ?? ""}
        address={address?.addressLine1 ?? ""}
        coords={address?.coordinate?.coordinates ?? [0, 0]}
        contact={{ email: email, phone: phone }}
        hours={availability ? groupHoursByDays(availability) : []}
        socialInfo={{
          facebook: socialInfo?.facebook,
          instagram: socialInfo?.instagram,
        }}
        restaurantName={name}
      />
    </div>
  );
}
