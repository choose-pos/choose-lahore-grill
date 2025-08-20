import Image from "next/image";

interface PromoImageItem {
  desktop: string;
  mobile?: string | null;
}

interface PromoImageSectionProps {
  PromoImageSection: PromoImageItem[];
}

export default function ImageSection({
  PromoImageSection,
}: PromoImageSectionProps) {
  return (
    <section
      id="promoimages"
      className="lg:px-24 xsm:px-12 px-6 flex flex-col items-center max-w-8xl mx-auto justify-center"
    >
      <div className="w-full space-y-0">
        {PromoImageSection.map((image, index) => (
          <div key={index} className="w-full justify-center flex">
            <Image
              src={image.desktop}
              alt="Promo"
              width={1240}
              height={800}
              className="md:rounded-[70px] max-h-screen min-h-[300px] hidden md:block rounded-[10px] object-cover"
            />

            {image.mobile ? (
              <Image
                src={image.mobile}
                alt={`Promo ${index + 1} Mobile`}
                width={1240}
                height={800}
                className="md:rounded-[70px] max-h-[300px] md:hidden block rounded-[10px] object-cover"
              />
            ) : (
              <Image
                src={image.desktop}
                alt={`Promo ${index + 1}`}
                width={1240}
                height={800}
                className="md:rounded-[70px] max-h-[300px] md:hidden block rounded-[10px] object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
