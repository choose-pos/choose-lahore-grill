"use client";

import { sdk } from "./graphqlClient";
import { FetchCartDetails } from "./types";

type RefreshCartResult = {
  CartDetails: FetchCartDetails;
};

export const refreshCartDetails =
  async (): Promise<RefreshCartResult | null> => {
    try {
      const data = await sdk.fetchCartDetails();
      if (data.fetchCartDetails) {
        const groupedCart: FetchCartDetails = {
          customerDetails: {
            firstName: data.fetchCartDetails.customerDetails.firstName,
          },
          orderType: data.fetchCartDetails.orderType,
          delivery: data.fetchCartDetails.delivery,
          amounts: {
            subTotalAmount: data.fetchCartDetails.amounts.subTotalAmount,
            discountAmount: data.fetchCartDetails.amounts.discountAmount,
            discountPercent: data.fetchCartDetails.amounts.discountPercent,
            discountUpto: data.fetchCartDetails.amounts.discountUpto,
            tipPercent: data.fetchCartDetails.amounts.tipPercent,
          },
          pickUpDateAndTime: data.fetchCartDetails.pickUpDateAndTime,
          deliveryDateAndTime: data.fetchCartDetails.deliveryDateAndTime,
          discountString: data.fetchCartDetails.discountString,
          loyaltyType: data.fetchCartDetails.loyaltyType,
          loyaltyRedeemPoints: data.fetchCartDetails.loyaltyRedeemPoints,
          discountItemImage: data.fetchCartDetails.discountItemImage,
        };
        return { CartDetails: groupedCart };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error refreshing cart:", error);
      return null;
    }
  };
