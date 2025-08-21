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
        <Link href={"/"} aria-label="Back Link">
          <button
            aria-label="Back to home"
            className={`md:px-6 px-4 py-2 border-2 border-bg1 text-[20px] uppercase bg-bg3 font-primary font-medium rounded-[10px] text-bg1 transition-opacity duration-500`}
          >
            {`Back to Home`}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default OfferPromoNotFound;
