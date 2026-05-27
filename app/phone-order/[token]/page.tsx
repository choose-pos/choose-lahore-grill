/**
 * Phone order token page — server component.
 * Fetches Navbar / Footer data (same pattern as gift-cards/page.tsx) and renders
 * PhoneOrderClient which handles the full OTP regeneration flow.
 */
import { Env } from "@/env";
import { sdk } from "@/utils/graphqlClient";
import { getCmsSectionId, groupHoursByDays } from "@/utils/theme-utils";
import { cookieKeys } from "@/constants";
import PhoneOrderClient from "./PhoneOrderClient";
import Navbar from "@/components/theme_custom/components/Navbar";
import Footer from "@/components/theme_custom/components/Footer";

export const dynamic = "force-dynamic";

export default async function PhoneOrderTokenPage() {
  const cookieVal = `${cookieKeys.restaurantCookie}=${Env.NEXT_PUBLIC_RESTAURANT_ID}`;

  // Fetch restaurant + CMS data for Navbar/Footer (same as gift-cards page)
  const [restaurantData, cmsData, promoNavItems, giftCardEnabled] =
    await Promise.all([
      sdk.GetCmsRestaurantDetails({}, { cookie: cookieVal }).catch(() => null),
      sdk.GetCmsDetails({}, { cookie: cookieVal }).catch(() => null),
      sdk.getCmsPromoNavItems({}, { cookie: cookieVal }).catch(() => null),
      sdk.getGiftCardEnabled({}, { cookie: cookieVal }).catch(() => null),
    ]);

  const rDetails = restaurantData?.getCmsRestaurantDetails;
  const promoNavItemsData: any[] = promoNavItems?.getCmsPromoNavItems || [];
  const giftCardEnabledData: boolean =
    giftCardEnabled?.getGiftCardEnabled || false;

  // Build nav items (same logic as gift-cards page)
  const navItems: { name: string; link: string }[] = [];
  if (cmsData?.getCmsDetails) {
    const {
      menuSection,
      contentSection,
      gridSection,
      contentWithImageSection,
      reviewSection,
    } = cmsData.getCmsDetails;
    navItems.push({ name: "Home", link: "/" });
    if (menuSection?.show)
      navItems.push({
        name: menuSection.navTitle,
        link: `/${getCmsSectionId(menuSection.navTitle)}`,
      });
    if (contentSection?.show)
      navItems.push({
        name: contentSection.navTitle,
        link: `/${getCmsSectionId(contentSection.navTitle)}`,
      });
    if (gridSection?.show)
      navItems.push({
        name: gridSection.navTitle,
        link: `/${getCmsSectionId(gridSection.navTitle)}`,
      });
    if (contentWithImageSection?.show)
      navItems.push({
        name: contentWithImageSection.navTitle,
        link: `/${getCmsSectionId(contentWithImageSection.navTitle)}`,
      });
    if (reviewSection?.show)
      navItems.push({
        name: reviewSection.navTitle,
        link: `/${getCmsSectionId(reviewSection.navTitle)}`,
      });
    navItems.push({ name: "Contact", link: "/#contact" });
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {rDetails && (
        <Navbar
          navItems={navItems}
          logo={rDetails.brandingLogo ?? ""}
          giftCardEnabled={giftCardEnabledData}
          offerNavTitles={promoNavItemsData.map((e) => ({
            title: e.navTitle,
            link: `/promotion/${e.link}`,
          }))}
        />
      )}

      <div className="pt-20 flex-grow">
        <PhoneOrderClient />
      </div>

      {rDetails && (
        <Footer
          address={rDetails.address?.addressLine1 ?? ""}
          coords={rDetails.address?.coordinate?.coordinates ?? [0, 0]}
          contact={{ email: rDetails.email, phone: rDetails.phone }}
          hours={
            rDetails.availability ? groupHoursByDays(rDetails.availability) : []
          }
          brandingLogo={rDetails.brandingLogo ?? ""}
          socialInfo={{
            facebook: rDetails.socialInfo?.facebook,
            instagram: rDetails.socialInfo?.instagram,
            googleMapsLink: rDetails.socialInfo?.googleMapsLink,
          }}
          restaurantName={rDetails.name}
        />
      )}
    </div>
  );
}
