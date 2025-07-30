import React from "react";
import Image from "next/image";
import { blurHashToDataURL } from "@/utils/blurhash";
import texture from "@/assets/Texture.png";

interface IStoryImage {
  sectionTitle: string;
  sectionImage: {
    url: string;
  };
  sectionImageBlurHash: string;
}

const StoryImage: React.FC<IStoryImage> = ({
  sectionImage,
  sectionImageBlurHash,
  sectionTitle,
}) => {
  return (
    <div className="bg-primaryColor lg:rounded-[60px] relative mb-5">
      <Image
        src={texture}
        alt="Texture Frame"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none mix-blend-multiply z-50 rounded-lg"
      />
      <div className="lg:py-10 lg:px-24 xsm:px-12 px-6 relative flex flex-col custom-lg:flex-row items-center custom-lg:justify-evenly justify-center z-10 overflow-hidden max-w-8xl mx-auto">
        <div className="flex flex-col custom-lg:items-start items-center w-full custom-lg:w-[80%]">
          <h1 className="text-lg font-primary text-textColor custom-lg:mt-0 mt-10">
            {sectionTitle}
          </h1>
        </div>
        <div className="custom-lg:ml-10 lg:w-[45%] custom-lg:w-1/3 custom-lg:mr-5 custom-lg:mb-0 mb-10  w-full flex items-start justify-end custom-lg:mt-0 mt-10">
          <Image
            src={sectionImage.url}
            alt="reviews"
            className="w-full md:w-[400px] h-[380px] md:h-[430px] rounded-[20px] md:rounded-[30px] object-cover"
            blurDataURL={blurHashToDataURL(sectionImageBlurHash)}
            placeholder="blur"
            width={500}
            height={630}
          />
        </div>
      </div>
    </div>
  );
};

export default StoryImage;
