// "use client";

import InActiveMenu from "@/components/default-pages/InActiveMenu";
import { cookieKeys } from "@/constants";
import { Env } from "@/env";
import { extractCampaignId, extractUTMParams } from "@/utils/analytics";
import { sdk } from "@/utils/graphqlClient";
import { CustomerRestaurant } from "@/utils/types";
import { isCrawlerUserAgent } from "@/utils/UtilFncs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import MyAccountPage from "./my-account-page";

export const dynamic = "force-dynamic";

async function getRestaurantDetails() {
  try {
    const cookieStore = await cookies();
    const restaurantDetailsResponse = await sdk.GetCustomerRestaurantDetails(
      {},
      { cookie: cookieStore.toString() }
    );

    if (!restaurantDetailsResponse?.getCustomerRestaurantDetails) {
      return null;
    }

    const Restaurant = restaurantDetailsResponse.getCustomerRestaurantDetails;

    return {
      name: Restaurant.name,
      _id: Restaurant._id,
      restaurantConfigs: {
        allowTips: Restaurant.restaurantConfigs?.allowTips,
        onlineOrdering: Restaurant.restaurantConfigs?.onlineOrdering,
        pickup: Restaurant.restaurantConfigs?.pickup,
        scheduleOrders: Restaurant.restaurantConfigs?.scheduleOrders,
      },
      fulfillmentConfig: {
        deliveryTime: Restaurant.fulfillmentConfig?.deliveryTime,
        prepTime: Restaurant.fulfillmentConfig?.prepTime,
        largeOrderTreshold: Restaurant.fulfillmentConfig?.largeOrderTreshold,
        largeOrderExtraTime: Restaurant.fulfillmentConfig?.largeOrderExtraTime,
      },
      deliveryConfig: {
        provideDelivery: Restaurant.deliveryConfig?.provideDelivery,
        deliveryZone: {
          minimumOrderValue:
            Restaurant.deliveryConfig?.deliveryZone?.[0]?.minimumOrderValue?.toFixed(
              2
            ),
        },
      },
      timezone: {
        timezoneName: Restaurant.timezone?.timezoneName,
      },
      onlineOrderTimingConfig: {
        startAfterMinutes:
          Restaurant.onlineOrderTimingConfig?.startAfterMinutes,
        endBeforeMinutes: Restaurant.onlineOrderTimingConfig?.endBeforeMinutes,
      },
      address: Restaurant.address
        ? {
            addressLine1: Restaurant.address.addressLine1,
            addressLine2: Restaurant.address.addressLine2 ?? undefined,
            state: {
              stateName: Restaurant.address.state.stateName,
              stateId: Restaurant.address.state.stateId,
            },
            city: Restaurant.address.city,
            zipcode: Restaurant.address.zipcode,
            coordinate: Restaurant.address.coordinate
              ? {
                  coordinates: Restaurant.address.coordinate.coordinates,
                }
              : undefined,
            place: Restaurant.address.place
              ? {
                  placeId: Restaurant.address.place.placeId,
                  displayName: Restaurant.address.place.displayName,
                }
              : undefined,
          }
        : undefined,
      brandingLogo: Restaurant.brandingLogo ?? undefined,
      website: Restaurant.website ?? undefined,
      socialInfo: Restaurant.socialInfo
        ? {
            facebook: Restaurant.socialInfo.facebook ?? undefined,
            instagram: Restaurant.socialInfo.instagram ?? undefined,
          }
        : undefined,
      availability: Restaurant.availability || undefined,
      category: Restaurant.category ?? undefined,
      beverageCategory: Restaurant.beverageCategory ?? undefined,
      foodType: Restaurant.foodType ?? undefined,
      dineInCapacity: Restaurant.dineInCapacity ?? undefined,
      type: Restaurant.type ?? undefined,
      meatType: Restaurant.meatType ?? undefined,
      taxRates: Restaurant.taxRates?.map((tx) => ({
        _id: tx._id,
        name: tx.name,
        salesTax: tx.salesTax,
      })),
    } as CustomerRestaurant;
  } catch (err) {
    console.error("Failed to fetch restaurant details:", err);
    return null;
  }
}

export default async function AcctPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const queryParams = await searchParams;
  const header = await headers();

  const userAgent = header.get("user-agent") || "";

  if (!isCrawlerUserAgent(userAgent)) {
    const cookieStore = await cookies();

    const restaurantCookie = await fetch(
      `${Env.NEXT_PUBLIC_SERVER_BASE_URL}/restaurant/check-cart-id`,
      {
        method: "POST",
        headers: {
          Authorization: cookieStore.get(cookieKeys.cartCookie)?.value ?? "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId:
            cookieStore.get(cookieKeys.restaurantCookie)?.value ?? "",
        }),
      }
    );

    const res = await restaurantCookie.json();
    if (res === false) {
      redirect("/cart-session");
    }

    const utm = extractUTMParams(queryParams);
    const campaignId = extractCampaignId(queryParams);
    const queryRecord = Object.fromEntries(
      Object.entries(queryParams).filter(
        ([key]) =>
          !key.startsWith("utm_") &&
          key.toLowerCase() !== "campaignid" &&
          key.toLowerCase() !== "itemid"
      )
    );

    if (utm || campaignId || Object.keys(queryRecord).length > 0) {
      await fetch(
        `${Env.NEXT_PUBLIC_SERVER_BASE_URL}/restaurant/session-update`,
        {
          method: "POST",
          body: JSON.stringify({
            restaurantId: Env.NEXT_PUBLIC_RESTAURANT_ID?.toString() ?? "",
            utm,
            campaignId,
            queryRecord:
              Object.keys(queryRecord).length > 0 ? queryRecord : null,
          }),
          headers: {
            Authorization: cookieStore.get(cookieKeys.cartCookie)?.value ?? "",
          },
        }
      );
    }
  }

  const [restaurant] = await Promise.all([getRestaurantDetails()]);

  if (!restaurant) {
    return <InActiveMenu />;
  }

  return <MyAccountPage restaurant={restaurant} />;
}
