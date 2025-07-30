import React from "react";
import Image from "next/image";
import catering from "../../assets/catering.png";
import { blurHashToDataURL } from "@/utils/blurhash";
import { RichText } from "@graphcms/rich-text-react-renderer";

interface ICateringPackages {
  sectionImage: {
    url: string;
  };
  sectionImageBlurHash: string;
  sectionContent: {
    raw: any;
    text: string;
  };
}

const CateringPackages: React.FC<ICateringPackages> = ({
  sectionContent,
  sectionImage,
  sectionImageBlurHash,
}) => {
  return (
    <div className="lg:px-24 xsm:px-12 px-6 py-10 rounded-[60px] lg:rounded-[100px] z-10 overflow-hidden bg-bg3">
      <div className="relative flex flex-col custom-lg:flex-row items-center justify-center">
        <div>
          <Image
            src={sectionImage.url}
            alt="catering"
            className="rounded-[40px] w-[600px] md:h-[500px] h-[360px]"
            placeholder="blur"
            blurDataURL={blurHashToDataURL(sectionImageBlurHash)}
            width={600}
            height={500}
          />
        </div>
        <div className="flex flex-col items-start text-bg1  font-primary custom-lg:ml-10 ml-4">
          <ul className="gap-y-2 flex flex-col max-w-[600px] font-primary xsm:text-2xl text-bg1 font-normal custom-lg:pl-10 pl-0 h-full mt-10 custom-lg:mt-0 text-xl">
            <RichText
              content={sectionContent.raw}
              renderers={{
                li: ({ children }) => (
                  <li className="my-2 text-bg1 list-disc">{children}</li>
                ),
              }}
            />

            {/* <li>Prices are for 50 people & above</li>
            <li>
              All extra items will be charged. Delivery & Setup Charge Extra
            </li>
            <li>Menu available for take-out orders as per the tray</li>
            <li> We serve Halal Meat</li>
            <li>Additional $1 Extra - Goat / Paneer</li>
            <li>
              {" "}
              Additional $2 Extra - Goat Boneless / Fish, $3 Extra - Shrimp
            </li>
            <li>50% advance payments on all Catering orders </li> */}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CateringPackages;
