interface PromoHeroSectionProps {
  heroTitle: string;
}

export default function PromoHeroSection({ heroTitle }: PromoHeroSectionProps) {
  return (
    <div className="lg:px-24 mt-20 xsm:px-12 px-6 flex flex-col items-center bg-bg3">
      <h1
        className="xl:text-[90px] xsm:text-[60px] xsm:leading-[55px] xl:leading-[80px] 
          text-[40px] leading-[40px] font-secondary xsm:mb-10 mb-5 text-bg1 text-center"
      >
        {heroTitle}
      </h1>
    </div>
  );
}
