"use client";

import RestaurantStore from "@/store/restaurant";
import { useRouter } from "next/navigation";
import { IoMdArrowBack } from "react-icons/io";

const CartHeader = ({ text, route }: { text: string; route: string }) => {
  // Configs
  const { replace } = useRouter();

  // Stores
  const { restaurantData } = RestaurantStore();

  return (
    <div className="w-full max-w-7xl mx-auto px-6 pt-6 pb-5 space-y-3">
      <div
        onClick={() => {
          replace(route);
        }}
        className="flex items-center text-gray-500 hover:text-black cursor-pointer w-max"
      >
        <IoMdArrowBack size={16} />
        <p className="ml-2 text-base font-heading-oo">{text}</p>
      </div>

      <h3 className="text-2xl md:text-3xl font-heading-oo font-semibold">
        {restaurantData?.name}
      </h3>
    </div>
  );
};

export default CartHeader;
