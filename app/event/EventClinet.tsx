// app/our-story/OurStoryClient.tsx
"use client";

import PartyContent from "@/components/Parties/PartyContent";
import PartyForm from "@/components/Parties/PartyForm";
import Footer from "@/components/theme_custom/components/Footer";
import Navbar from "@/components/theme_custom/components/Navbar";
import { groupHoursByDays } from "@/utils/theme-utils";
import { IPartyPage } from "./page";
import EventForm from "./EventForm";

interface PartyProps {
  partyPageData: IPartyPage;
  restaurantData: any;
  navItems: { name: string; link: string }[];
}

export default function PartyClient({
  partyPageData,
  restaurantData,
  navItems,
}: PartyProps) {
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
      />
      <div className="mt-28">
        <PartyContent
          sectionContent={partyPageData.section1Content}
          sectionTitle={partyPageData.section1Title}
          Img1={partyPageData.section1Image}
          ImgBH1={partyPageData.hash}
          Img2={partyPageData.section2Image}
          ImgBH2={partyPageData.hash2}
          Img3={partyPageData.section3Image}
          ImgBH3={partyPageData.hash3}
        />
      </div>
      <EventForm isEvent={true} />

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
