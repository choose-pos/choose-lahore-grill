import CustomThemeAbout from "@/components/theme_custom/components/About";
import CustomThemeBannerSection from "@/components/theme_custom/components/BannerSection";
import CustomThemeCardSection from "@/components/theme_custom/components/CardSection";
import Events from "@/components/theme_custom/components/Events";
import Footer from "@/components/theme_custom/components/Footer";
import HeroSection from "@/components/theme_custom/components/HeroSection";
import MenuSection from "@/components/theme_custom/components/MenuSection";
import Navbar from "@/components/theme_custom/components/Navbar";
import LunchSection from "@/components/theme_custom/components/Slider";
import Testimonials from "@/components/theme_custom/components/Testimonials";
import { cookieKeys } from "@/constants";
import { graphQLClient } from "@/lib/graphqlClient";
import { sdk } from "@/utils/graphqlClient";
import { generateRestaurantJsonLd } from "@/utils/jsonLdUtils";
import { getCmsSectionIdHash, groupHoursByDays } from "@/utils/theme-utils";
import { IHomePage } from "@/utils/types";
import { gql } from "graphql-request";
import { Metadata } from "next";
import Head from "next/head";
import { Env } from "../env";

// Add this function at the top level of your page component
export async function generateMetadata(): Promise<Metadata> {
  // Get restaurant data the same way as in your component
  const cookieVal = `${cookieKeys.restaurantCookie}=${Env.NEXT_PUBLIC_RESTAURANT_ID}`;

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

  if (!cmsData?.getCmsDetails) {
    return {
      title: "Best Restaurant in Your Area",
      description: "Discover the best restaurant in your area",
    };
  }

  if (!restaurantData?.getCmsRestaurantDetails) {
    return {
      title: "Best Restaurant in Your Area",
      description: "Discover the best restaurant in your area",
    };
  }

  // Destructuring the cmsData object
  const { websiteSeo, domainConfig, reviewSection } = cmsData.getCmsDetails;

  const { website } = domainConfig;

  const { pageTitle, metaDescription } = websiteSeo;

  // Destructuring the restaurantData object
  const { name, brandingLogo } = restaurantData.getCmsRestaurantDetails;

  return {
    title: pageTitle,
    description: metaDescription,
    alternates: {
      canonical: "./",
    },
    metadataBase: new URL("https://" + website),
    openGraph: {
      title: pageTitle,
      description: metaDescription,
      url: new URL("https://" + website),
      images: [
        {
          url: brandingLogo ?? "",
          width: 1200,
          height: 630,
          alt: `${name} logo`,
        },
      ],
    },
  };
}

export default async function Home() {
  const cookieVal = `${cookieKeys.restaurantCookie}=${Env.NEXT_PUBLIC_RESTAURANT_ID}`;

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

  const query = gql`
    query HomePage {
      homePages {
        title
        subtitle
        isVideo
        heroBannerDesktop {
          url
        }
        heroBannerMobile {
          url
        }
        highlightSectionTitle
        highlightSectionContent
        highlightSectionImage {
          url
        }
        frameSectionTitle
        frameSectionImage1 {
          url
        }
        frameSectionImage2 {
          url
        }
        frameSectionImage3 {
          url
        }
        frameSectionImage4 {
          url
        }
        offerSectionTitle
        offerSectionContent
        offerSectionSubContent
        offerSectionImage {
          url
        }
        operationalHours {
          raw
          html
          text
        }
        contactDetail
        address
        ctaImage {
          url
        }
        imageSlider1 {
          url
        }
        imageSlider2 {
          url
        }
        imageSlider3 {
          url
        }
        eventSectionVideo {
          url
        }
        imageSliderBlurHash1
        imageSliderBlurHash2
        imageSliderBlurHash3
        frameSection1BlurHash
        frameSection2BlurHash
        frameSection3BlurHash
        frameSection4BlurHash
        ctaImageBlurHash
        aboutUsTitle
        aboutUsContent
        cateringSectionTitle
        cateringSectionContent
        eventsCatered
        eventSectionHash
        biryanisServed
        guestsServed
        heroBannerDesktop2 {
          url
        }
        heroBannerMobile2 {
          url
        }
        heroBannerDesktop3 {
          url
        }
        heroBannerMobile3 {
          url
        }
        titleSlider2
        titleSlider3
        instagramLink
        facebookLink
        orderNowLink
      }
    }
  `;

  const response = await graphQLClient.request<{ homePages: IHomePage[] }>(
    query
  );

  const homePageData = response.homePages[0];

  if (!response) {
    return null;
  }

  if (!cmsData?.getCmsDetails) {
    return null;
  }

  if (!restaurantData?.getCmsRestaurantDetails) {
    return null;
  }

  // Destructuring the cmsData object
  const { reviewSection, menuSection } = cmsData.getCmsDetails;

  // Destructuring the restaurantData object
  const {
    name,
    brandingLogo,
    address,
    availability,
    email,
    phone,
    socialInfo,
  } = restaurantData.getCmsRestaurantDetails;
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
    <>
      <Head>
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
          rel="dns-prefetch"
          href={`https://res.cloudinary.com`}
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href={`https://maps.google.com`}
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="image"
          href={brandingLogo ?? ""}
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              generateRestaurantJsonLd(restaurantData.getCmsRestaurantDetails)
            ),
          }}
        />
      </Head>
      <div className="flex flex-col min-h-screen overflow-hidden">
        {/* TODO: Need to fix the import for this component */}
        <Navbar
          email={email}
          phone={phone}
          navItems={navItems}
          logo={brandingLogo ?? ""}
        />
        <div>
          <HeroSection
            heroBannerDesktop={homePageData.heroBannerDesktop}
            heroBannerMobile={homePageData.heroBannerMobile}
            isVideo={homePageData.isVideo}
            title={homePageData.title}
            heroBannerDesktop2={homePageData.heroBannerDesktop2}
            heroBannerDesktop3={homePageData.heroBannerDesktop3}
            heroBannerMobile2={homePageData.heroBannerMobile2}
            heroBannerMobile3={homePageData.heroBannerMobile3}
            title2={homePageData.titleSlider2}
            title3={homePageData.titleSlider3}
            onlineOrderLink={homePageData.orderNowLink}
            address={address?.addressLine1}
            subtilte={homePageData.subtitle}
          />

          {menuSection.show && menuSection.items.length > 0 ? (
            <div className="block lg:hidden">
              <MenuSection
                id={`${getCmsSectionIdHash(menuSection.navTitle).replace(
                  "/#",
                  ""
                )}-mobile`}
                items={menuSection.items.map((e) => ({
                  id: e.item._id,
                  title: e.title,
                  description: e.description,
                  image: e.image,
                }))}
                sectionTitle={menuSection.sectionTitle}
              />
            </div>
          ) : null}

          {true ? (
            <CustomThemeAbout
              Img1={homePageData.imageSlider1}
              Img2={homePageData.imageSlider2}
              Img3={homePageData.imageSlider3}
              ImgBH1={homePageData.imageSliderBlurHash1}
              ImgBH2={homePageData.imageSliderBlurHash2}
              ImgBH3={homePageData.imageSliderBlurHash3}
              sectionContent={homePageData.aboutUsContent}
              sectionTitle={homePageData.aboutUsTitle}
            />
          ) : null}

          {menuSection.show && menuSection.items.length > 0 ? (
            <div className="hidden lg:block">
              <MenuSection
                id={getCmsSectionIdHash(menuSection.navTitle).replace("/#", "")}
                items={menuSection.items.map((e) => ({
                  id: e.item._id,
                  title: e.title,
                  description: e.description,
                  image: e.image,
                }))}
                sectionTitle={menuSection.sectionTitle}
              />
            </div>
          ) : null}

          {true ? <CustomThemeBannerSection /> : null}

          {reviewSection?.show && reviewSection.reviews.length > 0 ? (
            <div>
              <Testimonials
                id={getCmsSectionIdHash(reviewSection.navTitle).replace(
                  "/#",
                  ""
                )}
                reviews={reviewSection.reviews}
              />
            </div>
          ) : null}

          <Events
            eventReel={{
              url: homePageData.eventSectionVideo.url,
              blurhash: homePageData.eventSectionHash,
            }}
            eventContent={homePageData.cateringSectionContent}
            eventTitle={homePageData.cateringSectionTitle}
          />

          {true ? (
            <CustomThemeCardSection
              frameSectionImage1={homePageData.frameSectionImage1}
              frameSectionImage2={homePageData.frameSectionImage2}
              frameSectionImage3={homePageData.frameSectionImage3}
              frameSectionImage4={homePageData.frameSectionImage4}
              frameSectionTitle={homePageData.frameSectionTitle}
              frameSectionBlurHash1={homePageData.frameSection1BlurHash}
              frameSectionBlurHash2={homePageData.frameSection2BlurHash}
              frameSectionBlurHash3={homePageData.frameSection3BlurHash}
              frameSectionBlurHash4={homePageData.frameSection4BlurHash}
            />
          ) : null}

          {true ? (
            <LunchSection
              offerSectionContent={homePageData.offerSectionContent}
              offerSectionImage={homePageData.offerSectionImage}
              offerSectionSubContent={homePageData.offerSectionSubContent}
              offerSectionTitle={homePageData.offerSectionTitle}
            />
          ) : null}

          {/* <CustomThemeGetInTouch
            CTAImage={homePageData.ctaImage}
            CTABlurHash={homePageData.ctaImageBlurHash}
          /> */}
        </div>

        {/* TODO: Need to fix the import for this component */}
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
    </>
  );
}
