import Footer from "@/components/theme_custom/components/Footer";
import Navbar from "@/components/theme_custom/components/Navbar";
import { cookieKeys } from "@/constants";
import { Env } from "@/env";
import { GetCmsRestaurantDetailsQuery } from "@/generated/graphql";
import { sdk } from "@/utils/graphqlClient";
import { getCmsSectionIdHash, groupHoursByDays } from "@/utils/theme-utils";
import { formatUSAPhoneNumber } from "@/utils/UtilFncs";
import { Metadata } from "next";
import Link from "next/link";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Terms & Policies | Lahore Grill",
  description:
    "Review Lahore Grill order cancellation, refund, delivery, rewards, email, and platform policies.",
  alternates: {
    canonical: "https://lahoregrill.com/terms-policies",
  },
};

type CmsRestaurant = NonNullable<
  GetCmsRestaurantDetailsQuery["getCmsRestaurantDetails"]
>;

const restaurantName = "Lahore Grill";
const lastUpdated = "June 2026";
const introText =
  'Lahore Grill ("we," "us," "our") operates this website using the Choose online ordering platform, provided by Choose Technologies LLC ("Choose"). This page describes Lahore Grill\'s policies for orders placed through this website. For details on how your personal information is collected and used, see Choose\'s Privacy Policy and Terms & Conditions, linked at the bottom of this page.';
const orderCancellationText =
  "You may edit or cancel your order at any time before completing payment at checkout. Once your order is confirmed and payment is processed, we begin preparing it right away, so we are unable to accept cancellations after that point.";
const thirdPartyDeliveryPartnerText =
  "Some delivery orders may be fulfilled by Uber Direct, an independent third-party delivery service integrated with our ordering platform. Lahore Grill is not responsible for delays, mishandling, or other issues once your order has been handed off to the delivery partner, but we're happy to help coordinate a resolution if something goes wrong — just contact us.";
const rewardsProgramText =
  "Lahore Grill offers a rewards program where you can earn points on qualifying purchases made through this website. Points accumulate at a rate of 10 points per $1 spent and can be redeemed for free menu items. Rewards points have no cash value, cannot be exchanged for cash, transferred to another account, or redeemed at other restaurants. We may modify, suspend, or discontinue the rewards program, or adjust point balances, at any time.";
const alcoholText =
  "If your order includes alcoholic beverages, you must be at least 21 years old, and you may be asked to show valid government-issued ID at pickup or delivery. We may refuse to provide alcohol, without refund for the affected items, if you or the recipient appear underage or intoxicated.";
const privacyPlatformTermsText =
  "Orders placed through this website are processed using the Choose online ordering platform. Personal information you provide is collected and used in accordance with Choose's Privacy Policy below, and your use of the ordering platform is governed by Choose's Terms & Conditions.";

function formatAddress(address: CmsRestaurant["address"]) {
  if (!address) {
    return "[Restaurant Address]";
  }

  const cityStateZip = [
    address.city,
    address.state?.stateName,
    address.zipcode,
  ]
    .filter(Boolean)
    .join(", ");

  return [address.addressLine1, address.addressLine2, cityStateZip]
    .filter(Boolean)
    .join(", ");
}

async function getPageData() {
  const cookieVal = `${cookieKeys.restaurantCookie}=${Env.NEXT_PUBLIC_RESTAURANT_ID}`;

  try {
    const [cmsData, restaurantData, giftCardEnabled, promoNavItems] =
      await Promise.all([
        sdk.GetCmsDetails({}, { cookie: cookieVal }),
        sdk.GetCmsRestaurantDetails({}, { cookie: cookieVal }),
        sdk.getGiftCardEnabled({}, { cookie: cookieVal }),
        sdk.getCmsPromoNavItems({}, { cookie: cookieVal }),
      ]);

    return {
      cmsData: cmsData.getCmsDetails,
      giftCardEnabled: giftCardEnabled.getGiftCardEnabled ?? false,
      offerNavItems: promoNavItems.getCmsPromoNavItems,
      restaurantData: restaurantData.getCmsRestaurantDetails,
    };
  } catch (error) {
    console.error("Failed to fetch terms page data:", error);

    return {
      cmsData: null,
      giftCardEnabled: false,
      offerNavItems: null,
      restaurantData: null,
    };
  }
}

function Section({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="border-t border-bg1/10 py-8 first:border-t-0 first:pt-0">
      <h2 className="font-secondary text-3xl tracking-wide text-bg1 md:text-4xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-8 text-bg1/80">
        {children}
      </div>
    </section>
  );
}

export default async function TermsPoliciesPage() {
  const { cmsData, giftCardEnabled, offerNavItems, restaurantData } =
    await getPageData();

  const menuSection = cmsData?.menuSection;
  const navItems: { name: string; link: string }[] = [
    { name: "Home", link: "/" },
    { name: "Our Story", link: "/our-story" },
    { name: "Catering", link: "/catering" },
    { name: "Banquet Hall", link: "/parties" },
    { name: "Events", link: "/event" },
  ];

  if (menuSection?.show) {
    navItems.splice(1, 0, {
      name: menuSection.navTitle,
      link: getCmsSectionIdHash(menuSection.navTitle),
    });
  }

  const address = formatAddress(restaurantData?.address ?? null);
  const phone = restaurantData?.phone
    ? formatUSAPhoneNumber(restaurantData.phone)
    : "[Restaurant Phone]";
  const email = restaurantData?.email ?? "[Restaurant Email]";

  return (
    <div className="min-h-screen bg-bg3 text-bg1">
      <Navbar
        email={restaurantData?.email}
        phone={restaurantData?.phone}
        navItems={navItems}
        logo={restaurantData?.brandingLogo ?? ""}
        offerNavTitles={offerNavItems?.map((item) => ({
          title: item.navTitle,
          link: `/promotion/${item.link}`,
        }))}
      />

      <main className="pt-28 md:pt-36">
        <header className="mx-auto max-w-5xl px-6 pb-10 pt-8 md:px-10 md:pb-14">
          <p className="font-primary text-sm font-semibold uppercase tracking-[0.28em] text-bg2">
            Lahore Grill
          </p>
          <h1 className="mt-4 font-secondary text-5xl leading-none text-bg1 md:text-7xl">
            Terms & Policies
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-bg1/70">
            {introText}
          </p>
        </header>

        <div className="mx-auto grid max-w-5xl gap-10 px-6 pb-16 md:grid-cols-[180px_1fr] md:px-10 md:pb-24">
          <aside className="hidden md:block">
            <div className="sticky top-32 border-l-2 border-bg2 pl-4 font-primary text-sm uppercase tracking-[0.18em] text-bg1/60">
              Last updated
              <span className="mt-2 block font-secondary text-3xl normal-case tracking-normal text-bg1">
                {lastUpdated}
              </span>
            </div>
          </aside>

          <article className="space-y-0 bg-bg3">
            <Section title="Order Cancellation">
              <p>{orderCancellationText}</p>
            </Section>

            <Section title="Refunds & Returns">
              <p>
                {
                  "If your order arrives with missing items, incorrect items, or items that don't meet your expectations, please contact us at "
                }
                {phone} or {email}
                {
                  " within 24 hours of receiving your order. At our discretion, we may offer a replacement, a credit toward a future order, or a partial or full refund to your original payment method."
                }
              </p>
            </Section>

            <Section title="Delivery Policy">
              <ul className="list-disc space-y-3 pl-6">
                <li>
                  <strong>Availability:</strong>{" "}
                  {
                    "All delivery orders are subject to product availability and our current delivery area."
                  }
                </li>
                <li>
                  <strong>Delivery Area:</strong>{" "}
                  {`We deliver within approximately 8 miles of ${address}. Enter your address at checkout to confirm you're within our delivery zone.`}
                </li>
                <li>
                  <strong>Delivery Time:</strong>{" "}
                  {
                    "An estimated delivery time is provided when you place your order. We do our best to meet this estimate, though actual times may vary due to weather, traffic, or order volume."
                  }
                </li>
                <li>
                  <strong>Delivery Fee:</strong>{" "}
                  {
                    "A delivery fee may apply and will be shown at checkout before you complete your order."
                  }
                </li>
                <li>
                  <strong>Delivery Instructions:</strong>{" "}
                  {"You can add special delivery instructions during checkout."}
                </li>
                <li>
                  <strong>Third-Party Delivery Partner:</strong>{" "}
                  {thirdPartyDeliveryPartnerText}
                </li>
              </ul>
            </Section>

            <Section title="Rewards Program">
              <p>{rewardsProgramText}</p>
            </Section>

            <Section title="Email Communications">
              <p>
                {
                  'If you begin an order on our website but don\'t complete checkout, you may receive a follow-up email reminding you to complete your purchase. We may also send you promotional emails about offers, new menu items, or other updates. You can unsubscribe from these at any time by clicking "unsubscribe" in any marketing email, or by contacting us at '
                }
                {email}
                {
                  ". We do not currently send marketing text messages (SMS); any texts you receive relate solely to fulfilling your order (e.g., order-ready or delivery updates)."
                }
              </p>
            </Section>

            <Section title="Alcohol">
              <p>{alcoholText}</p>
            </Section>

            <Section title="Contact Us">
              <address className="not-italic">
                <strong className="text-bg1">Lahore Grill</strong>
                <br />
                {address}
                <br />
                {phone}
                <br />
                {email}
              </address>
            </Section>

            <Section title="Privacy & Platform Terms">
              <p>{privacyPlatformTermsText}</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <Link
                    href="https://www.choosepos.com/privacy-policy"
                    target="_blank"
                    className="font-semibold underline underline-offset-4"
                  >
                    Choose Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.choosepos.com/terms-conditions"
                    target="_blank"
                    className="font-semibold underline underline-offset-4"
                  >
                    Choose Terms & Conditions
                  </Link>
                </li>
              </ul>
              <p className="pt-2 italic">Last updated: {lastUpdated}</p>
            </Section>
          </article>
        </div>
      </main>

      <Footer
        address={restaurantData?.address?.addressLine1 ?? ""}
        coords={restaurantData?.address?.coordinate?.coordinates ?? [0, 0]}
        contact={{
          email: restaurantData?.email ?? "",
          phone: restaurantData?.phone ?? "",
        }}
        hours={
          restaurantData?.availability
            ? groupHoursByDays(restaurantData.availability)
            : []
        }
        socialInfo={{
          facebook: restaurantData?.socialInfo?.facebook,
          instagram: restaurantData?.socialInfo?.instagram,
          googleMapsLink: restaurantData?.socialInfo?.googleMapsLink,
        }}
        restaurantName={restaurantData?.name ?? restaurantName}
        brandingLogo={restaurantData?.brandingLogo ?? ""}
      />
    </div>
  );
}
