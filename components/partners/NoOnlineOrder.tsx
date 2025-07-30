
import React from 'react';
import { MdOutlineStorefront } from "react-icons/md";
import { FaRegClock } from "react-icons/fa6";
import { BiSolidStore } from "react-icons/bi";

const NoOnlineOrder = () => {
  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="relative inline-block">
            <BiSolidStore className="text-6xl text-gray-400" />
            <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2">
              <FaRegClock className="text-white text-sm" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Online Ordering Unavailable
        </h2>

        <div className="flex items-center justify-center mb-6">
          <MdOutlineStorefront className="text-red-500 text-xl mr-2" />
          <p className="text-red-500 font-medium">
            Not Accepting Online Orders
          </p>
        </div>

       

        <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md">
          Please check back later for online ordering availability
        </div>
      </div>
    </div>
  );
};

export default NoOnlineOrder;