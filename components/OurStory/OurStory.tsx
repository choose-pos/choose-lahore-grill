import { blurHashToDataURL } from "@/utils/blurhash";
import { RichText } from "@graphcms/rich-text-react-renderer";
import Image from "next/image";
import type React from "react";

interface IOurStory {
  sectionTitle?: string;
  sectionImage: {
    url: string;
  };
  sectionImageBlurHash: string;
  sectionContent: {
    raw: any;
    text: string;
  };
  isTop?: boolean;
  mTop?: boolean;
  name?: string;
}

const OurStory: React.FC<IOurStory> = ({
  sectionImage,
  sectionTitle,
  sectionImageBlurHash,
  sectionContent,
  isTop = false,
  mTop = false,
  name,
}) => {
  return (
    <div className={` bg-bg3 ${!mTop ? "mt-28" : ""}`}>
      <div className="lg:py-20 lg:px-24 max-w-8xl mx-auto xsm:px-12 px-6 py-10 relative flex flex-col items-center z-10 overflow-hidden">
        {sectionTitle ? (
          <h2 className="xl:text-[80px] xsm:text-[60px] xsm:leading-[55px] xl:leading-[75px] text-[50px] leading-[45px] font-secondary xsm:mb-10 mb-10 text-bg1 text-center">
            {sectionTitle}
          </h2>
        ) : null}
        <div
          className={`w-full flex flex-col custom-lg:flex-row items-center ${
            isTop ? "custom-lg:flex-row-reverse" : ""
          }`}
        >
          <div
            className={` flex items-start w-full lg:w-[45%] custom-lg:w-1/3 ${
              isTop
                ? "custom-lg:flex-row-reverse justify-start md:ml-5"
                : "justify-start"
            }`}
          >
            <div className="relative w-full md:w-[450px] h-[380px] md:h-[430px]">
              <Image
                src={sectionImage.url}
                placeholder="blur"
                blurDataURL={blurHashToDataURL(sectionImageBlurHash)}
                alt={`${sectionTitle} Image`}
                className="rounded-[20px] md:rounded-[30px] object-cover h-full"
                fill
                priority
              />
            </div>
          </div>

          <div
            className={`flex flex-col w-full mt-5 custom-lg:mt-0
          ${!isTop ? "custom-lg:ml-5 items-end" : "custom-lg:mr-5 items-start"}
        `}
          >
            <div className="text-base font-primary custom-lg:w-[90%] w-full space-y-3 md:space-y-6 text-bg1">
              {name ? (
                <h2
                  className={`font-secondary mb-4 text-bg1 text-3xl md:text-4xl`}
                >
                  {name}
                </h2>
              ) : null}
              <RichText content={sectionContent.raw} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurStory;
