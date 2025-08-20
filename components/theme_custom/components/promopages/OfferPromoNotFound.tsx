"use client";
import Link from "next/link";
// import Button from "./Button";

const OfferPromoNotFound = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-secondary font-bold text-gray-800 mb-6">
          {`The offer you are currently looking for does not exist`}
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl font-primary text-gray-600 mb-8 leading-relaxed">
          {`We're sorry, but the promotional offer you're trying to access is no longer available or may have expired. This could be because the offer has ended, the link is incorrect, or the promotion has been removed. Please check our current offers or return to our homepage to explore other exciting deals and promotions.`}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* <Button text="Back to Homepage" url="/" /> */}
        </div>
      </div>
    </div>
  );
};

export default OfferPromoNotFound;
