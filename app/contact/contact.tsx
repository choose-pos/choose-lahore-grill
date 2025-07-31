"use client";

import PartyContent from "@/components/Parties/PartyContent";
import PartyForm from "@/components/Parties/PartyForm";
import Footer from "@/components/theme_custom/components/Footer";
import Navbar from "@/components/theme_custom/components/Navbar";
import { groupHoursByDays } from "@/utils/theme-utils";
import { IPartyPage } from "./page";
import GetInTouch from "./GetInTouch";
// import EventForm from "./EventForm";

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
      <div className="mt-20">
        <GetInTouch
          addressLine1={address?.addressLine1 ?? ""}
          city={address?.city ?? ""}
          coords={address?.coordinate?.coordinates ?? [0, 0]}
          hours={availability ? groupHoursByDays(availability) : []}
          name={name}
          state={address?.state?.stateName ?? ""}
        />
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
