import { RichText } from "@graphcms/rich-text-react-renderer";
import React from "react";
import Image from "next/image";

interface IPartyTrays {
  partyTray1: {
    raw: any;
    text: string;
  };
  partyTray2: {
    raw: any;
    text: string;
  };
  partyTray3: {
    raw: any;
    text: string;
  };
  partyTray4: {
    raw: any;
    text: string;
  };
  partyTray1Image: {
    url: string;
  };
  partyTray2Image: {
    url: string;
  };
  partyTray3Image: {
    url: string;
  };
  partyTray4Image: {
    url: string;
  };
}

const PartyTrays: React.FC<IPartyTrays> = ({
  partyTray1,
  partyTray2,
  partyTray3,
  partyTray4,
  partyTray1Image,
  partyTray2Image,
  partyTray3Image,
  partyTray4Image,
}) => {
  const partyTrays = [
    { content: partyTray1, image: partyTray1Image },
    { content: partyTray2, image: partyTray2Image },
    { content: partyTray3, image: partyTray3Image },
    { content: partyTray4, image: partyTray4Image },
  ];

  return (
    <div className="lg:pt-10 lg:px-24 pb-20 xsm:px-12 px-6 py-10 rounded-[60px] lg:rounded-[100px] z-10 overflow-hidden bg-bg3">
      <p className="xl:text-[90px] xsm:text-[60px] text-[40px] font-secondary text-bg1 text-center">
        Party Trays
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 justify-center">
        {partyTrays.map(({ content, image }, index) => (
          <div
            key={index}
            className="bg-bg1 text-bg2 rounded-[40px] overflow-hidden"
          >
            <div className="w-full relative h-48">
              <Image
                src={image.url}
                alt={`Party Tray ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="py-6 px-6">
              <RichText
                content={content.raw}
                renderers={{
                  p: ({ children }) => (
                    <p className="text-[12px] font-primary font-medium mt-2">
                      {children}
                    </p>
                  ),
                  h6: ({ children }) => (
                    <h3 className="font-primary text-xl">{children}</h3>
                  ),
                  h2: ({ children }) => (
                    <h3 className="text-4xl font-secondary text-center mb-4">
                      {children}
                    </h3>
                  ),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartyTrays;
