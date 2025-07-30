import { RichText } from "@graphcms/rich-text-react-renderer";
import React from "react";

interface ICateringCard {
  package1: {
    raw: any;
    text: string;
  };
  package2: {
    raw: any;
    text: string;
  };
  package3: {
    raw: any;
    text: string;
  };
}

const CateringCard: React.FC<ICateringCard> = ({
  package1,
  package2,
  package3,
}) => {
  return (
    <div className="lg:px-24 px-6 py-10 flex flex-col items-center rounded-[80px] bg-bg3">
      <p className="xl:text-[90px] xsm:text-[60px] text-[40px] font-secondary text-bg1 text-center custom-lg:mb-10">
        CATERING OPTIONS
      </p>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
        {[
          { content: package1, additionalClasses: "" },
          {
            content: package2,
            additionalClasses: "xl:-translate-y-[50px]",
          },
          { content: package3, additionalClasses: "" },
        ].map(({ content, additionalClasses }, index) => (
          <div
            key={index}
            className={`bg-bg1 text-bg2 w-full rounded-[40px] p-6 flex flex-col gap-y-2 ${additionalClasses}`}
          >
            <RichText
              content={content.raw}
              renderers={{
                ul: ({ children }) => (
                  <ul className="font-primary text-xl md:text-2xl list-disc pl-6 flex flex-col gap-y-2">
                    {children}
                  </ul>
                ),
                li: ({ children }) => <li>{children}</li>,
                p: ({ children }) => <p className="text-sm mt-2">{children}</p>,
                h2: ({ children }) => (
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-secondary text-center">
                    {children}
                  </h3>
                ),
                h3: ({ children }) => (
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-secondary text-center">
                    {children}
                  </h3>
                ),
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CateringCard;
