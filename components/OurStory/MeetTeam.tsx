import { RichText } from "@graphcms/rich-text-react-renderer";
import React from "react";

interface TeamProps {
  teamTitle: string;
  showTeamSection: boolean;
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

const TeamCard: React.FC<{
  name: string;
  description: any;
}> = ({ name, description }) => {
  return (
    <div
      className={`flex flex-col justify-start items-start w-full mt-5 custom-lg:mt-0 custom-lg:ml-5`}
    >
      <h2 className={`font-secondary mb-4 text-bg1 text-3xl md:text-4xl`}>
        {name}
      </h2>
      <RichText content={description} />
    </div>
  );
};

const MeetTeam: React.FC<TeamProps> = ({
  teamContent1,
  teamContent2,
  teamContent3,
  teamContent4,
  teamHash1,
  teamHash2,
  teamHash3,
  teamHash4,
  teamImage1,
  teamImage2,
  teamImage3,
  teamImage4,
  teamTitle,
  name1,
  name2,
  name3,
  name4,
  showTeamSection,
}) => {
  if (!showTeamSection) {
    return null;
  }

  return (
    <div className="w-full h-full bg-bg3">
      <h2 className="xl:text-[80px] xsm:text-[60px] xsm:leading-[55px] xl:leading-[75px] text-[50px] leading-[45px] font-secondary text-bg1 text-center md:pt-20 pt-10">
        {teamTitle}
      </h2>
      <div className="lg:py-20 lg:px-24 max-w-8xl mx-auto xsm:px-12 px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
        <TeamCard name={name1} description={teamContent1.raw} />
        <TeamCard name={name2} description={teamContent2.raw} />
        <TeamCard name={name3} description={teamContent3.raw} />
        <TeamCard name={name4} description={teamContent4.raw} />
      </div>
    </div>
  );
};

export default MeetTeam;
