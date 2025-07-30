import InActiveMenu from "@/components/default-pages/InActiveMenu";
import { cookieKeys } from "@/constants";
import { Env } from "@/env";
import { extractCampaignId, extractUTMParams } from "@/utils/analytics";
import { sdk } from "@/utils/graphqlClient";
import {
  CustomerCategoryItem,
  CustomerRestaurant,
  RestaurantRedeemOffers,
} from "@/utils/types";
import { isCrawlerUserAgent } from "@/utils/UtilFncs";
import { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import RestaurantDetails from "./RestaurantDetails";

export const dynamic = "force-dynamic";

async function getRestaurantDetails() {
  try {
    const cookieVal = `${cookieKeys.restaurantCookie}=${Env.NEXT_PUBLIC_RESTAURANT_ID}`;
    const restaurantDetailsResponse = await sdk.GetCustomerRestaurantDetails(
      {},
      { cookie: cookieVal }
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
    console.log("Failed to fetch restaurant details:", err);
    return null;
  }
}

async function getRestaurantCategories() {
  try {
    const cookieVal = `${cookieKeys.restaurantCookie}=${Env.NEXT_PUBLIC_RESTAURANT_ID}`;
    const itemsResponse = await sdk.getCustomerCategoriesAndItems(
      {},
      { cookie: cookieVal }
    );

    return itemsResponse.getCustomerCategoriesAndItems.map((category) => ({
      _id: category._id,
      name: category.name,
      desc: category.desc ?? null,
      items: category.items.map((item) => ({
        name: item.name,
        _id: item._id,
        desc: item.desc,
        image: item.image,
        price: item.price,
        orderLimitTracker: item.orderLimitTracker,
        options: item.options,
        modifierGroup: item.modifierGroup,
      })),
      availability: category.availability?.map((avail) => ({
        day: avail.day,
        active: avail.active,
        hours: avail.hours.map((hour) => ({
          start: hour.start,
          end: hour.end,
        })),
      })),
      createdAt: new Date(category.createdAt),
      updatedAt: new Date(category.updatedAt),
    })) as CustomerCategoryItem[];
  } catch (err) {
    console.error("Failed to fetch restaurant categories:", err);
    return null;
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
              image: itemRedemption?.item?.image ?? null,
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

export async function generateMetadata(): Promise<Metadata> {
  // Get restaurant data the same way as in your component
  const cookieVal = `${cookieKeys.restaurantCookie}=${Env.NEXT_PUBLIC_RESTAURANT_ID}`;

  const [cmsData, restaurantData, categories] = await Promise.all([
    sdk.GetCmsDetails(
      {},
      {
        cookie: cookieVal,
      }
    ),
    sdk.GetCmsRestaurantDetails(
      {},
      {
        cookie: cookieVal,
      }
    ),
    sdk.getCustomerCategoriesAndItems({}, { cookie: cookieVal }),
  ]);

  if (!categories?.getCustomerCategoriesAndItems) {
    return {
      title: "Best Restaurant in Your Area",
      description: "Discover the best restaurant in your area",
    };
  }

  if (!cmsData?.getCmsDetails) {
    return {
      title: "Best Restaurant in Your Area",
      description: "Discover the best restaurant in your area",
    };
  }

  if (!restaurantData?.getCmsRestaurantDetails) {
    return {
      title: "Best Restaurant in Your Area",
      description: "Discover the best restaurant in your area",
    };
  }

  // Destructuring the cmsData object
  const { domainConfig } = cmsData.getCmsDetails;

  const { website } = domainConfig;

  const pageTitle = `Online Ordering Menu | ${restaurantData.getCmsRestaurantDetails.name}`;
  const metaDescription =
    `${
      restaurantData.getCmsRestaurantDetails.name
    } serving ${categories.getCustomerCategoriesAndItems
      .map((e) => e.name)
      .join(", ")}`.slice(0, 150) + "...";

  // Destructuring the restaurantData object
  const { name, brandingLogo } = restaurantData.getCmsRestaurantDetails;

  return {
    title: pageTitle,
    description: metaDescription,
    alternates: {
      canonical: "./",
    },
    metadataBase: new URL("https://" + website),
    openGraph: {
      title: pageTitle,
      description: metaDescription,
      url: new URL("https://" + website),
      images: [
        {
          url: brandingLogo ?? "",
          width: 1200,
          height: 630,
          alt: `${name} logo`,
        },
      ],
    },
  };
}

async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const queryParams = await searchParams;
  const header = await headers();
  let mismatch = null;

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

    if (res.data === "timing mismatch") {
      mismatch = true;
    }

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

  const [restaurant, categories, loyaltyRule, loyaltyOffers] =
    await Promise.all([
      getRestaurantDetails(),
      getRestaurantCategories(),
      getLoyaltyRule(),
      getLoyaltyOffers(),
    ]);

  if (!restaurant || !categories) {
    return <InActiveMenu />;
  }

  return (
    <RestaurantDetails
      restaurant={restaurant}
      categories={categories}
      loyaltyRule={loyaltyRule ?? null}
      loyaltyOffers={loyaltyOffers ?? null}
      mismatch={mismatch}
    />
  );
}

export default Page;
