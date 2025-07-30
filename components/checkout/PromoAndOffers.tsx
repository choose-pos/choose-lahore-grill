import { PromoCode } from "@/store/promocode"
import { offer } from '@/store/loyalty';
import React from 'react';
import { FiX } from 'react-icons/fi';


interface PromoBannersProps {
  promo: PromoCode | null;
  offerSelected: offer | null;
  onPromoChange: () => void;
  onPromoRemove: () => void;
  onOfferChange: () => void;
  onOfferRemove: () => void;
}

const PromoBanner: React.FC<{
  promo: PromoCode;
  onChange: () => void;
  onRemove: () => void;
}> = ({ promo, onChange, onRemove }) => (
  <div className="flex items-center justify-between p-2 rounded-md bg-green-50">
    <div className="flex items-center">
      <span className="text-green-700 font-medium mr-6">
        Promo code applied!
        {promo.uptoAmount && (
          <p>{promo.discountValue}% discount up to ${promo.uptoAmount.toFixed(2)}</p>
        )}
      </span>
      <button
        onClick={onChange}
        className="text-green-700 hover:text-green-800 text-sm underline focus:outline-none"
      >
        Change
      </button>
    </div>
    <button
      onClick={onRemove}
      className="text-gray-500 hover:text-gray-700 focus:outline-none"
    >
      <FiX className="w-5 h-5" />
    </button>
  </div>
);

const OfferBanner: React.FC<{
  offer: offer;
  onChange: () => void;
  onRemove: () => void;
}> = ({ offer, onChange, onRemove }) => (
  <div className="bg-green-50 p-4 rounded-md shadow-sm flex items-center justify-between">
    <div className="flex items-center">
      <div className="text-green-700 font-medium mr-6">
        <p>Offer applied!</p>
        {offer.uptoAmount && (
          <p>
            {offer.discountValue}% discount up to ${offer.uptoAmount.toFixed(2)}
          </p>
        )}
      </div>
      <button
        onClick={onChange}
        className="text-green-700 hover:text-green-800 text-sm underline focus:outline-none"
      >
        Change
      </button>
    </div>
    <button
      onClick={onRemove}
      className="text-gray-500 hover:text-gray-700 focus:outline-none"
    >
      <FiX className="w-5 h-5" />
    </button>
  </div>
);

const PromoBanners: React.FC<PromoBannersProps> = ({
  promo,
  offerSelected,
  onPromoChange,
  onPromoRemove,
  onOfferChange,
  onOfferRemove,
}) => {
  return (
    <div className="space-y-2 mb-2">
      {promo && (
        <PromoBanner
          promo={promo}
          onChange={onPromoChange}
          onRemove={onPromoRemove}
        />
      )}
      {offerSelected && (
        <OfferBanner
          offer={offerSelected}
          onChange={onOfferChange}
          onRemove={onOfferRemove}
        />
      )}
    </div>
  );
};

export default PromoBanners;