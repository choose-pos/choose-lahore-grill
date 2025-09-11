import { cookieKeys } from "@/constants";
import { sdk } from "@/utils/graphqlClient";
import {
  getCmsSectionId,
  getCmsSectionIdHash,
  groupHoursByDays,
} from "@/utils/theme-utils";
import { Metadata } from "next";
import Head from "next/head";
import { notFound } from "next/navigation";
import { Env } from "../../../env";
import Navbar from "@/components/theme_custom/components/Navbar";
import Footer from "@/components/theme_custom/components/Footer";
import PromoHeroSection from "@/components/theme_custom/components/promopages/PromoHeroSection";
import ImageSection from "@/components/theme_custom/components/promopages/PromoImageSection";
import PromoCtaSection from "@/components/theme_custom/components/promopages/PromoCtaSection";
import PromoTermsAndCoditionsSection from "@/components/theme_custom/components/promopages/PromoTermsAndConditionsSection";
import OfferPromoNotFound from "@/components/theme_custom/components/promopages/OfferPromoNotFound";

interface PromoPageProps {
  params: Promise<{
    slugName: string;
  }>;
}

export async function generateMetadata({
  params,
}: PromoPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const cookieVal = `${cookieKeys.restaurantCookie}=${Env.NEXT_PUBLIC_RESTAURANT_ID}`;

  if (!resolvedParams.slugName) {
    return {
      title: "Offer Not Found",
      description:
        "The offer you are looking for does not exist or is no longer available",
    };
  }

  try {
    const [promoData, restaurantData] = await Promise.all([
      sdk.getCmsPromoRouteDetails(
        { slug: resolvedParams.slugName },
        { cookie: cookieVal }
      ),
      sdk.GetCmsRestaurantDetails({}, { cookie: cookieVal }),
    ]);

    if (
      !promoData?.getCmsPromoRouteDetails ||
      !restaurantData?.getCmsRestaurantDetails
    ) {
      return {
        title: "Offer Not Found",
        description:
          "The offer you are looking for does not exist or is no longer available",
      };
    }

    const { name, brandingLogo } = restaurantData.getCmsRestaurantDetails;
    const { websiteSeo, heroTitle, PromoImageSection } =
      promoData.getCmsPromoRouteDetails;

    const promoImage = PromoImageSection?.[0]?.desktop || brandingLogo || "";

    return {
      title: websiteSeo?.pageTitle || `${heroTitle} - ${name}`,
      description:
        websiteSeo?.metaDescription || `Special promotion at ${name}`,
      alternates: {
        canonical: `/promotion/${resolvedParams.slugName}`,
      },
      openGraph: {
        title: websiteSeo?.pageTitle || `${heroTitle} - ${name}`,
        description:
          websiteSeo?.metaDescription || `Special promotion at ${name}`,
        images: [
          {
            url: promoImage,
            width: 1200,
            height: 630,
            alt: `${heroTitle} promotion`,
          },
        ],
      },
    };
  } catch (error) {
    console.error("Error generating metadata for promo page:", error);
    return {
      title: "Offer Not Found",
      description:
        "The offer you are looking for does not exist or is no longer available",
    };
  }
}

export async function generateStaticParams() {
  const cookieVal = `${cookieKeys.restaurantCookie}=${Env.NEXT_PUBLIC_RESTAURANT_ID}`;

  const response = await sdk.getCmsPromoNavItems({}, { cookie: cookieVal });
  const routes = response.getCmsPromoNavItems;
  return routes.map((service) => ({
    slugName: service.link,
  }));
}

export default async function PromoPage({ params }: PromoPageProps) {
  const resolvedParams = await params;
  const cookieVal = `${cookieKeys.restaurantCookie}=${Env.NEXT_PUBLIC_RESTAURANT_ID}`;

  let restaurantData: any = null;
  let cmsData: any = null;
  let promoNavItems: any = null;
  let showNotFound = false;

  try {
    // First, always fetch restaurant data, CMS data, and nav items for navbar/footer
    [restaurantData, cmsData, promoNavItems] = await Promise.all([
      sdk.GetCmsRestaurantDetails({}, { cookie: cookieVal }),
      sdk.GetCmsDetails({}, { cookie: cookieVal }),
      sdk.getCmsPromoNavItems({}, { cookie: cookieVal }),
    ]);

    // Then try to fetch promo data
    const promoData = await sdk.getCmsPromoRouteDetails(
      { slug: resolvedParams.slugName },
      { cookie: cookieVal }
    );

    if (!promoData?.getCmsPromoRouteDetails) {
      showNotFound = true;
    } else {
      // If we have promo data, continue with the original logic
      const {
        name: promoName,
        websiteSeo,
        heroTitle,
        PromoImageSection,
        ctaSection,
        termsAndConditionSection,
      } = promoData.getCmsPromoRouteDetails;

      if (!cmsData?.getCmsDetails || !restaurantData?.getCmsRestaurantDetails) {
        showNotFound = true;
      } else {
        const { menuSection, reviewSection } = cmsData.getCmsDetails;

        const {
          name,
          brandingLogo,
          address,
          availability,
          email,
          phone,
          socialInfo,
        } = restaurantData.getCmsRestaurantDetails;

        const promoNavItemsData: any[] =
          promoNavItems?.getCmsPromoNavItems || [];

        const navItems: { name: string; link: string }[] = [
          { name: "Home", link: "/" },
          { name: "Our Story", link: "/our-story" },
          { name: "Catering", link: "/catering" },
          { name: "Banquet Hall", link: "/parties" },
          { name: "Events", link: "/event" },
          // { name: "Reservations", link: "/reservations" },
          { name: "Contact us", link: "/contact" },
        ];

        if (menuSection?.show) {
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
          <>
            <Head>
              <title>{websiteSeo?.pageTitle || `${heroTitle} - ${name}`}</title>
              <meta
                name="description"
                content={
                  websiteSeo?.metaDescription || `Special promotion at ${name}`
                }
              />
              <link
                rel="preconnect"
                href={`https://fonts.gstatic.com`}
                crossOrigin="anonymous"
              />
              <link
                rel="preconnect"
                href={`https://res.cloudinary.com`}
                crossOrigin="anonymous"
              />
              <link
                rel="preload"
                as="image"
                href={PromoImageSection?.[0]?.desktop || brandingLogo || ""}
                crossOrigin="anonymous"
              />
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Offer",
                    name: heroTitle,
                    description: websiteSeo?.metaDescription,
                    offeredBy: {
                      "@type": "Restaurant",
                      name: name,
                      address: {
                        "@type": "PostalAddress",
                        streetAddress: address?.addressLine1,
                        addressLocality: address?.city,
                        addressRegion: address?.state?.stateName,
                      },
                    },
                  }),
                }}
              />
            </Head>

            <div className="flex flex-col min-h-screen bg-bgColor overflow-hidden">
              <Navbar
                navItems={navItems}
                logo={brandingLogo ?? ""}
                email={email}
                phone={phone}
                offerNavTitles={promoNavItemsData.map((e) => {
                  return {
                    title: e.navTitle,
                    link: `/promotion/${e.link}`,
                  };
                })}
              />
              {showNotFound ? (
                <div className="pt-5 md:pt-20">
                  <OfferPromoNotFound />
                </div>
              ) : (
                <div className="pt-5 md:pt-20">
                  {/* Hero Section */}
                  <PromoHeroSection heroTitle={heroTitle} />

                  {/* Promo Image Section */}
                  {PromoImageSection && PromoImageSection.length > 0 && (
                    <ImageSection PromoImageSection={PromoImageSection} />
                  )}

                  {/* CTA Section */}
                  {ctaSection && (
                    <PromoCtaSection
                      ctaSection={ctaSection}
                      pageName={promoData.getCmsPromoRouteDetails.name}
                    />
                  )}

                  {/* Terms and Conditions Section */}
                  {termsAndConditionSection && (
                    <PromoTermsAndCoditionsSection
                      termsAndConditionSection={termsAndConditionSection}
                    />
                  )}
                </div>
              )}
              <Footer
                brandingLogo={brandingLogo}
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
          </>
        );
      }
    }
  } catch (error) {
    console.error("Error loading promo page:", error);
    showNotFound = true;
  }

  // Show not found page with navbar and footer
  if (showNotFound) {
    if (!restaurantData?.getCmsRestaurantDetails) {
      // If we can't even get restaurant data, use notFound()
      notFound();
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
    const promoNavItemsData: any[] = promoNavItems?.getCmsPromoNavItems || [];

    // Build basic nav items for not found page
    const navItems: { name: string; link: string }[] = [
      { name: "Home", link: "/" },
      { name: "Our Story", link: "/our-story" },
      { name: "Catering", link: "/catering" },
      { name: "Banquet Hall", link: "/parties" },
      { name: "Events", link: "/event" },
      // { name: "Reservations", link: "/reservations" },
      { name: "Contact us", link: "/contact" },
    ];

    return (
      <div className="flex flex-col min-h-screen bg-bgColor overflow-hidden">
        <Navbar
          navItems={navItems}
          email={email}
          phone={phone}
          logo={brandingLogo ?? ""}
          offerNavTitles={promoNavItemsData.map((e) => {
            return {
              title: e.navTitle,
              link: `/promotion/${e.link}`,
            };
          })}
        />

        <div className="pt-20 flex-grow">
          <OfferPromoNotFound />
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
          brandingLogo={brandingLogo}
        />
      </div>
    );
  }

  return null;
}
