"use client";

import { useCartStore } from "@/store/cart";

const CartRemarks = () => {
  const { specialRemarks, setSpecialRemarks } = useCartStore();
  return (
    <div className="w-full mt-4 lg:mt-6 px-6">
      <label
        htmlFor="special-request"
        className="mb-2 block font-semibold font-online-ordering text-xl"
      >
        Special Request
      </label>
      <textarea
        id="special-request"
        value={specialRemarks}
        onChange={(e) => setSpecialRemarks(e.target.value)}
        maxLength={150}
        placeholder="Enter any special request for restaurant..."
        className="w-full p-2 border rounded-[20px] font-online-ordering focus:outline-none focus:ring-0 border-black resize-none h-24 overflow-y-auto"
      />
      <p className="text-sm mt-1 text-right font-online-ordering">
        {specialRemarks.length}/150 characters
      </p>
    </div>
  );
};

export default CartRemarks;
