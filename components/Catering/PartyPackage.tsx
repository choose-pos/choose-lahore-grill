import React from "react";
import Image from "next/image";
import { blurHashToDataURL } from "@/utils/blurhash";
import { RichText } from "@graphcms/rich-text-react-renderer";

interface IPartyPackage {
  sectionTitle: string;
  sectionImage: {
    url: string;
  };
  sectionImageBlurHash: string;
  sectionContent: {
    raw: any;
    text: string;
  };
  Package1Title: string;
  Package1Subtitle: string;
  Package1Content: string;
  Package2Title: string;
  Package2Subtitle: string;
  Package2Content: string;
}

const PartyPackage: React.FC<IPartyPackage> = ({
  sectionContent,
  sectionImage,
  sectionImageBlurHash,
  sectionTitle,
  Package1Content,
  Package1Subtitle,
  Package1Title,
  Package2Content,
  Package2Subtitle,
  Package2Title,
}) => {
  return (
    <div className="lg:px-24 py-10 xsm:px-12 px-6 bg-bg3 rounded-[60px] lg:rounded-[100px] z-10 overflow-hidden">
      <p className="xl:text-[90px] xsm:text-[60px] text-[40px] font-secondary text-bg1 text-center">
        {sectionTitle}
      </p>

      <div className="relative flex flex-col custom-lg:flex-row items-center justify-center max-w-8xl mx-auto">
        <div>
          <Image
            placeholder="blur"
            src={sectionImage.url}
            alt="Masala Dosa"
            className="rounded-[40px] w-[600px] md:h-[460px] h-[300px]"
            blurDataURL={blurHashToDataURL(sectionImageBlurHash)}
            width={600}
            height={460}
          />
        </div>
        <div className="flex flex-col items-start text-bg1 font-primary custom-lg:ml-10 ml-4">
          <ul className="gap-y-2 flex flex-col max-w-[610px] font-primary xsm:text-2xl text-xl text-bg1 font-medium list-disc custom-lg:pl-10 pl-0 h-full mt-10 custom-lg:mt-0">
            <RichText
              content={sectionContent.raw}
              renderers={{
                li: ({ children }) => (
                  <li className="my-2 text-bg1 list-disc font-normal">
                    {children}
                  </li>
                ),
              }}
            />
          </ul>
        </div>
      </div>

      <div className="bg-bg3 py-10">
        <div className="grid grid-cols-1 custom-lg:grid-cols-2 gap-6">
          {/* Gold Package */}
          <div className="bg-bg1 text-bg2 text-textColor flex flex-col py-10 px-6 lg:px-10 items-center gap-y-4 rounded-[40px]">
            <h2 className="text-3xl lg:text-5xl font-secondary text-center">
              {Package1Title}
            </h2>
            <h3 className="text-2xl lg:text-4xl font-secondary text-center">
              {Package1Subtitle}
            </h3>
            <p className="font-primary text-lg lg:text-2xl text-center flex-1">
              {Package1Content}
            </p>
          </div>

          {/* Platinum Package */}
          <div className="bg-bg1 text-bg2 flex flex-col py-10 px-6 lg:px-10 items-center gap-y-4 rounded-[40px]">
            <h2 className="text-3xl lg:text-5xl font-secondary text-center">
              {Package2Title}
            </h2>
            <h3 className="text-2xl lg:text-4xl font-secondary text-center">
              {Package2Subtitle}
            </h3>
            <p className="font-primary text-lg lg:text-2xl text-center flex-1">
              {Package2Content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyPackage;
