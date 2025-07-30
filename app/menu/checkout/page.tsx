import { cookieKeys } from "@/constants";
import { Env } from "@/env";
import { OrderType } from "@/generated/graphql";
import { extractCampaignId, extractUTMParams } from "@/utils/analytics";
import { sdk } from "@/utils/graphqlClient";
import {
  CustomerRestaurant,
  FetchCartDetails,
  RestaurantRedeemOffers,
} from "@/utils/types";
import {
  extractFreeDiscountItemDetails,
  isCrawlerUserAgent,
} from "@/utils/UtilFncs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import CheckoutPage from "./_components/CheckoutPage";

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

async function getCartDetails() {
  try {
    const cookieStore = await cookies();
    const data = await sdk.fetchCartDetails(
      {},
      { cookie: cookieStore.toString() }
    );
    if (data.fetchCartDetails) {
      return {
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
        discountItemImage: data.fetchCartDetails.discountItemImage,
      } as FetchCartDetails;
    }
  } catch (error) {
    console.log(error);
  }
}

async function getCartCount() {
  try {
    const cookieStore = await cookies();
    const data = await sdk.fetchCartCount(
      {},
      { cookie: cookieStore.toString() }
    );
    return data.fetchCartCount;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

async function getPlatformFee() {
  try {
    const cookieStore = await cookies();
    const data = await sdk.fetchProcessingFee(
      {},
      { cookie: cookieStore.toString() }
    );
    return data.fetchProcessingFee;
  } catch (error) {
    console.log(error);
  }
}

async function getDeliveryFee() {
  try {
    const cookieStore = await cookies();
    const data = await sdk.fetchDeliveryFee(
      {},
      { cookie: cookieStore.toString() }
    );
    if (data.fetchDeliveryFee) {
      return data.fetchDeliveryFee;
    }
    return null;
  } catch (error) {
    console.log(error);
  }
}

async function getLoyaltyRule() {
  try {
    const cookieStore = await cookies();
    const data = await sdk.fetchLoyaltyCustomerRules(
      {},
      { cookie: cookieStore.toString() }
    );
    const rules = data.fetchLoyaltyCustomerRules;
    if (rules.onOrderRewardActive && rules.signUpRewardActive) {
      return {
        value: rules.onOrderRewardValue,
        name: rules.programName,
        signUpValue: rules.signUpRewardValue,
      };
    } else if (rules.onOrderRewardActive) {
      return {
        value: rules.onOrderRewardValue,
        name: rules.programName,
        signUpValue: 0,
      };
    }

    return null;
  } catch (error) {
    console.log(error);
  }
}

async function getLoyaltyOffers() {
  try {
    const cookieStore = await cookies();
    const res = await sdk.fetchRestaurantRedeemOffers(
      {},
      { cookie: cookieStore.toString() }
    );

    if (res.fetchRestaurantRedeemOffers) {
      const formattedOffers: RestaurantRedeemOffers = {
        pointsRedemptions:
          res.fetchRestaurantRedeemOffers.pointsRedemptions.map(
            (redemption) => ({
              _id: redemption._id,
              pointsThreshold: redemption.pointsThreshold,
              discountType: redemption.discountType,
              discountValue: redemption.discountValue,
              uptoAmount: redemption.uptoAmount,
            })
          ),
        itemRedemptions: res.fetchRestaurantRedeemOffers.itemRedemptions.map(
          (itemRedemption) => ({
            _id: itemRedemption._id,
            item: {
              _id: itemRedemption.item._id,
              name: itemRedemption.item.name,
              price: itemRedemption.item.price,
            },
            pointsThreshold: itemRedemption.pointsThreshold,
          })
        ),
      };

      return formattedOffers;
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function getStripeId() {
  try {
    const cookieStore = await cookies();
    const data = await sdk.getStripeAccountId(
      {},
      { cookie: cookieStore.toString() }
    );
    return data.getStripeAccountId;
  } catch (error) {
    console.log(error);
  }
}

export default async function Page({
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

  let DeliveryFee: number | null = null;

  const [
    RestaurantInfo,
    CartDetails,
    CartCount,
    platformFee,
    loyaltyRule,
    loyaltyOffers,
    stripeId,
  ] = await Promise.all([
    getRestaurantDetails(),
    getCartDetails(),
    getCartCount(),
    getPlatformFee(),
    getLoyaltyRule(),
    getLoyaltyOffers(),
    getStripeId(),
  ]);

  if (CartDetails?.orderType === OrderType.Delivery) {
    DeliveryFee = (await getDeliveryFee()) ?? null;
  }

  if (!RestaurantInfo) {
    redirect("/");
  }

  let count = CartCount;

  const freeItem = extractFreeDiscountItemDetails(
    CartDetails?.discountString ?? ""
  );
  if (freeItem !== null) {
    count += 1;
  }

  if (count === 0) {
    redirect("/menu");
  }

  return (
    <CheckoutPage
      loyaltyRule={loyaltyRule ?? null}
      loyaltyOffers={loyaltyOffers ?? null}
      restaurantInfo={RestaurantInfo}
      platformFee={platformFee ?? 0}
      deliveryFee={DeliveryFee}
      stripeId={stripeId ?? ""}
    />
  );
}
