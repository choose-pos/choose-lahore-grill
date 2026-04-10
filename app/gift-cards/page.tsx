import { sdk } from "@/utils/graphqlClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cookieKeys } from "@/constants";
import { Env } from "@/env";
import { getCmsSectionId, groupHoursByDays } from "@/utils/theme-utils";
import Footer from "@/components/theme_custom/components/Footer";
import Navbar from "@/components/theme_custom/components/Navbar";
import GiftCardPurchasePage from "@/components/giftCard/GiftCardPurchasePage";

export const dynamic = "force-dynamic";

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
    restaurantData,
    promoNavItems,
    giftCardEnabled,
    loyaltyRule,
  ] = await Promise.all([
    getStripeId(),
    getRestaurantFeeConfig(),
    sdk.GetCmsRestaurantDetails({}, { cookie: cookieVal }),
    sdk.getCmsPromoNavItems({}, { cookie: cookieVal }),
    sdk.getGiftCardEnabled({}, { cookie: cookieVal }),
    getLoyaltyRule(),
  ]);

  const rDetails = restaurantData?.getCmsRestaurantDetails;

  if (rDetails?.giftCardEnabled === false) {
    redirect("/menu");
  }

    const navItems: { name: string; link: string }[] = [
    { name: "Home", link: "/" },
    { name: "Our Story", link: "/our-story" },
    { name: "Catering", link: "/catering" },
    { name: "Banquet Hall", link: "/parties" },
    { name: "Events", link: "/event" },
    // { name: "Reservations", link: "/reservations" },
    // { name: "Contact us", link: "/contact" },
  ];
  const promoNavItemsData: any[] = promoNavItems?.getCmsPromoNavItems || [];
  const giftCardEnabledData: boolean =
    giftCardEnabled?.getGiftCardEnabled || false;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {rDetails && (
        <Navbar
          navItems={navItems}
          logo={rDetails.brandingLogo ?? ""}
          email={rDetails.email}
          phone={rDetails.phone}
          giftCardEnabled={giftCardEnabledData ?? false}
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
  );
}
