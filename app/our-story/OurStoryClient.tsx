// app/our-story/OurStoryClient.tsx
"use client";

import React from "react";
import Navbar from "@/components/theme_custom/components/Navbar";
import Footer from "@/components/theme_custom/components/Footer";
import OurStory from "@/components/OurStory/OurStory";
import StoryImage from "@/components/OurStory/StoryImage";
import StoryText from "@/components/OurStory/StoryText";
import { groupHoursByDays } from "@/utils/theme-utils";
import MeetTeam from "@/components/OurStory/MeetTeam";

interface IOurStoryPage {
  section1Title: string;
  showTeamSection: boolean;
  section1Image: {
    url: string;
  };
  section1ImageBlurHash: string;
  section1Content: {
    raw: any;
    text: string;
  };
  section2Title: string;
  section2Image: {
    url: string;
  };
  section2ImageBlurHash: string;
  section3Title: string;
  section3Content: {
    raw: any;
    text: string;
  };
  section3Image: {
    url: string;
  };
  section3ImageBlurHash: string;
  teamTitle: string;
  teamHash1: string;
  teamImage1: {
    url: string;
  };
  teamContent1: {
    raw: any;
    text: string;
  };
  teamHash2: string;
  teamImage2: {
    url: string;
  };
  teamContent2: {
    raw: any;
    text: string;
  };
  teamHash3: string;
  teamImage3: {
    url: string;
  };
  teamContent3: {
    raw: any;
    text: string;
  };
  teamHash4: string;
  teamImage4: {
    url: string;
  };
  teamContent4: {
    raw: any;
    text: string;
  };
  name1: string;
  name2: string;
  name3: string;
  name4: string;
}

interface OurStoryClientProps {
  ourStoryPageData: IOurStoryPage;
  restaurantData: any; // Use appropriate type from your API
  navItems: { name: string; link: string }[];
}

export default function OurStoryClient({
  ourStoryPageData,
  restaurantData,
  navItems,
}: OurStoryClientProps) {
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
      <OurStory
        sectionImage={ourStoryPageData.section1Image}
        sectionImageBlurHash={ourStoryPageData.section1ImageBlurHash}
        sectionTitle={ourStoryPageData.section1Title}
        sectionContent={ourStoryPageData.section1Content}
      />
      <StoryImage
        sectionImage={ourStoryPageData.section2Image}
        sectionImageBlurHash={ourStoryPageData.section2ImageBlurHash}
        sectionTitle={ourStoryPageData.section2Title}
      />
      {/* <OurStory
        sectionImage={ourStoryPageData.section3Image}
        sectionImageBlurHash={ourStoryPageData.section3ImageBlurHash}
        sectionTitle={ourStoryPageData.section3Title}
        sectionContent={ourStoryPageData.section3Content}
        isTop
      /> */}
      <MeetTeam
        teamContent1={ourStoryPageData.teamContent1}
        teamContent2={ourStoryPageData.teamContent2}
        teamContent3={ourStoryPageData.teamContent3}
        teamContent4={ourStoryPageData.teamContent4}
        teamHash1={ourStoryPageData.teamHash1}
        teamHash2={ourStoryPageData.teamHash2}
        teamHash3={ourStoryPageData.teamHash3}
        teamHash4={ourStoryPageData.teamHash4}
        teamImage1={ourStoryPageData.teamImage1}
        teamImage2={ourStoryPageData.teamImage2}
        teamImage3={ourStoryPageData.teamImage3}
        teamImage4={ourStoryPageData.teamImage4}
        teamTitle={ourStoryPageData.teamTitle}
        name1={ourStoryPageData.name1}
        name2={ourStoryPageData.name2}
        name3={ourStoryPageData.name3}
        name4={ourStoryPageData.name4}
        showTeamSection={ourStoryPageData.showTeamSection}
      />
      {/* <StoryText /> */}
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
