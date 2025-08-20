interface TermsAndConditionSection {
  title: string;
  terms: string[];
}

interface CasualTermsAndConditionSectionProps {
  termsAndConditionSection: TermsAndConditionSection;
}

export default function PromoTermsAndCoditionsSection({
  termsAndConditionSection,
}: CasualTermsAndConditionSectionProps) {
  return (
    <section
      id="termsandconditions"
      className="w-full px-4 sm:px-8 md:px-12 xl:px-16 2xl:px-24 pb-10 bg-bgColor"
    >
      <div className="max-w-8xl mx-auto">
        {/* Title - Left aligned like other Casual theme sections */}
        <div className="mb-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold font-secondary text-center text-bg1">
            {termsAndConditionSection.title}
          </h2>
        </div>

        {/* Terms List - Simple and clean */}
        <div className="space-y-2 md:space-y-4">
          {termsAndConditionSection.terms.map((term, index) => (
            <div key={index} className="flex items-start gap-4">
              {/* Simple bullet point */}
              <div className="flex-shrink-0 w-2 h-2 rounded-full mt-3 font-primary bg-primaryColor" />

              {/* Term text */}
              <p className="text-sm sm:text-xl leading-8 sm:leading-9 font-normal font-primary text-bg1">
                {term}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
