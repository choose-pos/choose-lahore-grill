import { sdk } from "@/utils/graphqlClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cookieKeys } from "@/constants";
import { Env } from "@/env";
import { Metadata } from "next";
import { generateGiftCardJsonLd } from "@/utils/jsonLdUtils";
import {
  getCmsSectionId,
  getCmsSectionIdHash,
  groupHoursByDays,
} from "@/utils/theme-utils";
import Footer from "@/components/theme_custom/components/Footer";
import Navbar from "@/components/theme_custom/components/Navbar";
import GiftCardPurchasePage from "@/components/giftCard/GiftCardPurchasePage";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const cookieVal = `${cookieKeys.restaurantCookie}=${Env.NEXT_PUBLIC_RESTAURANT_ID}`;
  const [cmsData, restaurantData] = await Promise.all([
    sdk.GetCmsDetails({}, { cookie: cookieVal }),
    sdk.GetCmsRestaurantDetails({}, { cookie: cookieVal }),
  ]);

  if (!cmsData?.getCmsDetails || !restaurantData?.getCmsRestaurantDetails) {
    return {
      title: "Gift Cards | Restaurant",
      description:
        "Purchase a gift card and give the gift of great food to friends and family.",
    };
  }

  const { domainConfig } = cmsData.getCmsDetails;
  const { website } = domainConfig;
  const { name, brandingLogo } = restaurantData.getCmsRestaurantDetails;

  const pageTitle = `eGift Cards | ${name}`;
  const metaDescription = `Purchase an eGift Card from ${name}. Give the gift of great food to friends and family.`;

  return {
    title: pageTitle,
    description: metaDescription,
    alternates: {
      canonical: "/gift-cards",
    },
    metadataBase: new URL("https://" + website),
    openGraph: {
      title: pageTitle,
      description: metaDescription,
      url: new URL("https://" + website + "/gift-cards"),
      images: [
        {
          url: brandingLogo ?? "",
          width: 1200,
          height: 630,
          alt: `${name} gift card`,
        },
      ],
    },
  };
}

async function getStripeId() {
  try {
    const cookieStore = await cookies();
    const data = await sdk.getStripeAccountId(
      {},
      { cookie: cookieStore.toString() },
    );
    return data.getStripeAccountId;
  } catch (error) {
    console.log(error);
    return "";
  }
}

async function getRestaurantFeeConfig() {
  try {
    const cookieStore = await cookies();
    const data = await sdk.GetCustomerRestaurantDetails(
      {},
      { cookie: cookieStore.toString() },
    );
    const r = data.getCustomerRestaurantDetails;
    return {
      processingConfig: r?.processingConfig
        ? {
            feePercent: r.processingConfig.feePercent ?? null,
            maxFeeAmount: r.processingConfig.maxFeeAmount ?? null,
          }
        : null,
      taxRates:
        r?.taxRates?.map((t) => ({
          _id: t._id,
          name: t.name,
          salesTax: t.salesTax,
        })) ?? [],
    };
  } catch (error) {
    console.log(error);
    return { processingConfig: null, taxRates: [] };
  }
}

async function getLoyaltyRule() {
  try {
    const cookieStore = await cookies();
    const data = await sdk.fetchLoyaltyCustomerRules(
      {},
      { cookie: cookieStore.toString() },
    );
    const rules = data.fetchLoyaltyCustomerRules;
    if (rules.onOrderRewardActive && rules.signUpRewardActive) {
      return {
        value: rules.onOrderRewardValue,
        name: rules.programName,
        signUpValue: rules.signUpRewardValue,
      };
    } else if (rules.onOrderRewardActive) {
      return {
        value: rules.onOrderRewardValue,
        name: rules.programName,
        signUpValue: 0,
      };
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default async function GiftCardsPage() {
  const cookieStore = await cookies();
  const serverIsLoggedIn = !!cookieStore.get("choose_ordering_at")?.value;

  const cookieVal = `${cookieKeys.restaurantCookie}=${Env.NEXT_PUBLIC_RESTAURANT_ID}`;

  const [
    stripeId,
    feeConfig,
    cmsData,
    restaurantData,
    promoNavItems,
    giftCardEnabled,
    loyaltyRule,
  ] = await Promise.all([
    getStripeId(),
    getRestaurantFeeConfig(),
    sdk.GetCmsDetails({}, { cookie: cookieVal }),
    sdk.GetCmsRestaurantDetails({}, { cookie: cookieVal }),
    sdk.getCmsPromoNavItems({}, { cookie: cookieVal }),
    sdk.getGiftCardEnabled({}, { cookie: cookieVal }),
    getLoyaltyRule(),
  ]);

  const rDetails = restaurantData?.getCmsRestaurantDetails;

  // if (rDetails?.giftCardEnabled === false) {
  //   redirect("/menu");
  // }

  const navItems: { name: string; link: string }[] = [
    { name: "Home", link: "/" },
    { name: "Our Story", link: "/our-story" },
    { name: "Catering", link: "/catering" },
    { name: "Banquet Hall", link: "/parties" },
    { name: "Events", link: "/event" },
    // { name: "Reservations", link: "/reservations" },
    // { name: "Contact us", link: "/contact" },
  ];

  const { reviewSection, menuSection } = cmsData?.getCmsDetails ?? {};

  if (menuSection?.show) {
    navItems.splice(1, 0, {
      name: menuSection.navTitle,
      link: getCmsSectionIdHash(menuSection.navTitle),
    });
  }

  if (reviewSection?.show) {
    navItems.push({
      name: reviewSection.navTitle,
      link: getCmsSectionIdHash(reviewSection.navTitle),
    });
  }
  const promoNavItemsData: any[] = promoNavItems?.getCmsPromoNavItems || [];
  const giftCardEnabledData: boolean =
    giftCardEnabled?.getGiftCardEnabled || false;

  const jsonLd = rDetails
    ? generateGiftCardJsonLd(
        {
          _id: "",
          name: rDetails.name,
          brandingLogo: rDetails.brandingLogo ?? null,
          email: rDetails.email,
          phone: rDetails.phone,
          address: rDetails.address
            ? {
                addressLine1: rDetails.address.addressLine1 ?? "",
                city: rDetails.address.city ?? "",
                zipcode: rDetails.address.zipcode ?? 0,
                state: { stateName: rDetails.address.state?.stateName ?? "" },
                coordinate: rDetails.address.coordinate ?? null,
              }
            : null,
          availability: rDetails.availability ?? null,
          socialInfo: rDetails.socialInfo ?? null,
        },
        cmsData?.getCmsDetails?.domainConfig?.website ?? "",
      )
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div className="flex flex-col min-h-screen bg-white">
      {rDetails && (
        <Navbar
          navItems={navItems}
          logo={rDetails.brandingLogo ?? ""}
          email={rDetails.email}
          phone={rDetails.phone}
          offerNavTitles={promoNavItemsData.map((e) => ({
            title: e.navTitle,
            link: `/promotion/${e.link}`,
          }))}
        />
      )}

      <div className="pt-20 flex-grow">
        <GiftCardPurchasePage
          stripeId={stripeId}
          processingConfig={feeConfig.processingConfig}
          loyaltyRule={loyaltyRule}
          serverIsLoggedIn={serverIsLoggedIn}
          giftCardEnabled={rDetails?.giftCardEnabled !== false}
        />
      </div>

      {rDetails && (
        <Footer
          address={rDetails.address?.addressLine1 ?? ""}
          coords={rDetails.address?.coordinate?.coordinates ?? [0, 0]}
          contact={{ email: rDetails.email, phone: rDetails.phone }}
          hours={
            rDetails.availability ? groupHoursByDays(rDetails.availability) : []
          }
          socialInfo={{
            facebook: rDetails.socialInfo?.facebook,
            instagram: rDetails.socialInfo?.instagram,
            googleMapsLink: rDetails.socialInfo?.googleMapsLink,
          }}
          brandingLogo={rDetails.brandingLogo ?? ""}
          restaurantName={rDetails.name}
        />
      )}
    </div>
    </>
  );
}
