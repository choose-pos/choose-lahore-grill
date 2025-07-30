import React from "react";
import dosa from "../../assets/dosa.png";
import Image from "next/image";
import { blurHashToDataURL } from "@/utils/blurhash";
import { RichText } from "@graphcms/rich-text-react-renderer";

interface ICateringOptions {
  sectionTitle: string;
  sectionImage: {
    url: string;
  };
  sectionImageBlurHash: string;
  sectionContent: {
    raw: any;
    text: string;
  };
  sectionSubTitle?: string;
}

const CateringOptions: React.FC<ICateringOptions> = ({
  sectionContent,
  sectionImage,
  sectionImageBlurHash,
  sectionTitle,
  sectionSubTitle,
}) => {
  return (
    <div className="lg:py-20 lg:px-24 xsm:px-12 px-6 py-10 bg-bg1 rounded-[60px] lg:rounded-[100px] z-10 overflow-hidden">
      <p className="xl:text-[90px] xsm:text-[60px]  text-[40px] font-secondary text-bg3  text-center">
        {sectionTitle}
      </p>
      <p className="xl:text-[75px] xsm:text-[45px] text-[30px] font-secondary text-bg3 text-center -mt-5">
        {sectionSubTitle}
      </p>
      <div className="relative flex flex-col custom-lg:flex-row items-center custom-lg:justify-evenly justify-center mt-10 ">
        <div className="">
          <Image
            src={sectionImage.url}
            alt="dosa"
            placeholder="blur"
            blurDataURL={blurHashToDataURL(sectionImageBlurHash)}
            className="rounded-[40px] md:min-w-[450px] w-[400px] md:h-[500px] h-[380px]"
            width={450}
            height={560}
          />
        </div>
        <div className="flex flex-col items-start text-bg3  custom-lg:max-w-[800px] w-full font-primary custom-lg:mt-0 mt-10 custom-lg:ml-10 ml-0  space-y-6">
          <RichText
            content={sectionContent.raw}
            renderers={{
              ul: ({ children }) => (
                <ul className="gap-y-2 font-primary text-xl list-disc pl-5">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="my-2 text-bg3">{children}</li>
              ),
              p: ({ children }) => <h5 className="text-xl mb-4">{children}</h5>,
              h3: ({ children }) => <h3 className="text-2xl ">{children}</h3>,
            }}
          />
          {/* <h2 className="text-xl mb-4 font-semibold">
            We offer live dosa counters with multiple types of dosa made by our
            own expert chefs on location. contact us for the package prices.
          </h2>
          <ul className="gap-y-2 font-primary text-xl font-bold list-disc pl-5">
            <li>Minimum 50 guests</li>
            <li>Chef will be onsite for 2 hours</li>
            <li>Additional hour $150</li>
          </ul> */}
        </div>
      </div>
    </div>
  );
};

export default CateringOptions;
