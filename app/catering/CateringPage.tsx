// app/catering/CateringPageClient.tsx
"use client";

import React from "react";
import Catering from "@/components/Catering/Catering";
import Navbar from "@/components/theme_custom/components/Navbar";
import CateringOptions from "@/components/Catering/CateringOptions";
import CateringPackages from "@/components/Catering/CateringPackages";
import PartyPackage from "@/components/Catering/PartyPackage";
import PartyTrays from "@/components/Catering/PartyTrays";
import CateringForm from "@/components/Catering/CateringForm";
import CateringCard from "@/components/Catering/CateringCard";
import Footer from "@/components/theme_custom/components/Footer";
import { groupHoursByDays } from "@/utils/theme-utils";
import { ICateringPage } from "./page";

interface CateringPageClientProps {
  cateringPageData: ICateringPage; // Use the ICateringPage interface from the server component
  restaurantData: any; // Use appropriate type from your API
  navItems: { name: string; link: string }[];
  offerNavTitles?: { title: string; link: string }[];
}

export default function CateringPageClient({
  cateringPageData,
  restaurantData,
  navItems,
  offerNavTitles,
}: CateringPageClientProps) {
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
    <div>
      <Navbar
        email={email}
        phone={phone}
        navItems={navItems}
        logo={brandingLogo ?? ""}
        offerNavTitles={offerNavTitles?.map((e) => {
          return {
            title: e.title,
            link: `/offer-promotion/${e.link}`,
          };
        })}
      />
      <Catering
        sectionImage={cateringPageData.section1Image}
        sectionImageBlurHash={cateringPageData.section1ImageBlurHash}
        sectionTitle={cateringPageData.section1Title}
        sectionContent={cateringPageData.section1Content}
        Img2={cateringPageData.section2Image}
        ImgBH2={cateringPageData.section2ImageBlurHash}
        Img3={cateringPageData.section3Image}
        ImgBH3={cateringPageData.section3ImageBlurHash}
        Img4={cateringPageData.section4Image}
        ImgBH4={cateringPageData.section4ImageBlurHash}
      />
      {/* <CateringOptions
        sectionContent={cateringPageData.section2Content}
        sectionImage={cateringPageData.section2Image}
        sectionImageBlurHash={cateringPageData.section2ImageBlurHash}
        sectionTitle={cateringPageData.section2Title}
      />
      <PartyPackage
        sectionContent={cateringPageData.section4Content}
        sectionImage={cateringPageData.section4Image}
        sectionImageBlurHash={cateringPageData.section4ImageBlurHash}
        sectionTitle={cateringPageData.section4Title}
        Package1Content={cateringPageData.sec3Package1Content}
        Package1Subtitle={cateringPageData.sec3Package1Subtitle}
        Package1Title={cateringPageData.sec3Package1Title}
        Package2Content={cateringPageData.sec3Package2Content}
        Package2Subtitle={cateringPageData.sec3Package2Subtitle}
        Package2Title={cateringPageData.sec3Package2Title}
      />
      <CateringCard
        package1={cateringPageData.cateringPackage1}
        package2={cateringPageData.cateringPackage2}
        package3={cateringPageData.cateringPackage3}
      />
      <CateringPackages
        sectionContent={cateringPageData.section3Content}
        sectionImage={cateringPageData.section3Image}
        sectionImageBlurHash={cateringPageData.section3ImageBlurHash}
      />
      <PartyTrays
        partyTray1={cateringPageData.partyTray1}
        partyTray2={cateringPageData.partyTray2}
        partyTray3={cateringPageData.partyTray3}
        partyTray4={cateringPageData.partyTray4}
        partyTray1Image={cateringPageData.partyTray1Image}
        partyTray2Image={cateringPageData.partyTray2Image}
        partyTray3Image={cateringPageData.partyTray3Image}
        partyTray4Image={cateringPageData.partyTray4Image}
      /> */}
      <CateringForm />
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
