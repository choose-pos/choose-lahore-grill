"use client";

import { ItemOptionsEnum } from "@/generated/graphql";
import { CustomerCategoryItem } from "@/utils/types";

import { Env } from "@/env";
import { sendAnalyticsEvent } from "@/hooks/useAnalytics";
import { useCartStore } from "@/store/cart";
import { useModalStore } from "@/store/global";
import RestaurantStore from "@/store/restaurant";
import ToastStore from "@/store/toast";
import { getOrCreateUserHash } from "@/utils/analytics";
import { refreshCartCount } from "@/utils/getCartCountData";
import { sdk } from "@/utils/graphqlClient";
import { refreshCartDetails } from "@/utils/refreshCartDetails";
import {
  extractErrorMessage,
  extractFreeDiscountItemDetails,
} from "@/utils/UtilFncs";
import { Loader2, Plus } from "lucide-react";
import Image from "next/image";
import { forwardRef, useEffect, useState } from "react";
import spicyImage from "../../assets/spicy-solid.svg";
import Leaf from "../../assets/vegan-solid.svg";

interface CategoryListingProps {
  category: CustomerCategoryItem;
  restaurantSlug: string;
}

const CategoryListing = forwardRef<HTMLDivElement, CategoryListingProps>(
  function MainFunc({ category, restaurantSlug }, ref) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const CHARACTER_LIMIT = 200;
    const shouldShowMore = (category.desc?.length || 0) > CHARACTER_LIMIT;
    const { setSelectedItem, setSelectedCategoryId } = RestaurantStore();
    const { setToastData } = ToastStore();

    const { setCartCountInfo, setCartDetails, cartDetails } = useCartStore();
    const { setShowMenu, clickState, setClickState, loadingItem } =
      useModalStore();
    const displayText =
      shouldShowMore && !isExpanded
        ? `${category.desc?.slice(0, CHARACTER_LIMIT)}...`
        : category.desc;

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const handleAddToCart = async (itemId: string) => {
      setLoadingItemId(itemId);
      try {
        const res = await sdk.AddToCart({
          items: {
            itemId: itemId,
            qty: 1,
            categoryId: category._id,
          },
        });
        if (res.addToCart) {
          // Track event
          const userHash = getOrCreateUserHash(); // Generate or retrieve persistent user hash

          sendAnalyticsEvent({
            restaurant: Env.NEXT_PUBLIC_RESTAURANT_ID,
            pagePath: "/menu",
            pageQuery: null, // Include query only if present
            source: document.referrer || "direct", // Fallback to 'direct' if no referrer
            utm: null, // Extract UTM parameters from the query
            userHash, // Attach the user identifier
            eventType: "add_to_cart",
            metadata: {
              id: itemId,
              name: category?.name ?? "",
            },
          });

          // setItemData(formattedCartItem);
          try {
            const res = await refreshCartCount();
            const res2 = await refreshCartDetails();
            if (res2?.CartDetails) {
              // Check if we have a free item
              const currentFreeItem = extractFreeDiscountItemDetails(
                res2.CartDetails.discountString ?? ""
              );

              // Set cart count including free item if it exists
              if (res) {
                setCartCountInfo(res + (currentFreeItem ? 1 : 0));
              }

              setCartDetails(res2.CartDetails);
            }
          } catch (error) {
            setToastData({
              message: extractErrorMessage(error),
              type: "error",
            });
          }
          if (!isMobile) {
            setToastData({
              type: "success",
              message: "Item added successfuly!",
            });
          }
        }
      } catch (error) {
        setToastData({ message: extractErrorMessage(error), type: "error" });
        console.error("Failed to add item to cart:", error);
      } finally {
        setLoadingItemId(null);
      }
    };

    return (
      <div className="rounded-lg py-4 w-full">
        <div
          ref={ref}
          data-category-id={category._id}
          data-category-name={category.name}
          className="scroll-mt-96"
        >
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 font-online-ordering">
            {category.name}
          </h2>
          <div className="mb-4 flex items-center">
            <p className="text-gray-600 text-base italic md:text-lg font-online-ordering">
              {displayText}
            </p>
            {shouldShowMore && (
              <p
                onClick={() => setIsExpanded(!isExpanded)}
                className=" text-sm mt-1 font-medium cursor-pointer ml-1"
              >
                {isExpanded ? "Show less" : "Read more"}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 w-full">
          {category.items.map((item) => {
            const isOutOfStock =
              typeof item.orderLimitTracker === "number" &&
              item.orderLimitTracker <= 0;

            const ItemContent = (
              <div
                id={category.name}
                className={`bg-white border font-online-ordering rounded-[20px] flex flex-row w-full transition-all duration-300 h-full min-h-[8rem] relative
                ${
                  isOutOfStock
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer bg-grayscale"
                }`}
              >
                {/* Image section - moves to top on small screens */}
                {item?.image ? (
                  <div className="relative w-[8rem] h-full aspect-square order-last rounded-t-none rounded-r-[20px] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item?.name || "Menu item"}
                      fill
                      sizes=""
                      className="rounded-r-[20px] object-cover"
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-grayscale flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="relative w-[8rem] h-full aspect-square order-last rounded-t-none rounded-r-[20px] overflow-hidden item-image-placeholder border-l border-l-gray-100"
                    data-text={Array(200).fill(`${item.name} `).join("")}
                  />
                )}

                {/* Content section */}
                <div className="flex-1 flex flex-col px-4 py-[1px] pb-2 relative">
                  <div className="flex w-full items-center justify-between py-2 gap-1">
                    <div
                      className={`${
                        item.options
                          .filter(
                            (option) =>
                              option.status === true &&
                              option.type !== ItemOptionsEnum.IsSpicy &&
                              option.type !== ItemOptionsEnum.UpSellItem &&
                              option.type !== ItemOptionsEnum.IsVegan
                          )
                          .slice(0, 2).length > 0
                          ? ""
                          : "hidden"
                      }`}
                    >
                      {item.options
                        .filter(
                          (option) =>
                            option.status === true &&
                            option.type !== ItemOptionsEnum.IsSpicy &&
                            option.type !== ItemOptionsEnum.UpSellItem &&
                            option.type !== ItemOptionsEnum.IsVegan
                        )
                        .slice(0, 2)
                        .map((option) => (
                          <span
                            key={option.displayName}
                            className="font-online-ordering items-center text-center font-semibold inline-block px-2 py-1 mr-1.5 text-[8px] rounded-full bg-gray-50 text-gray-700 border border-gray-200"
                          >
                            {option.displayName}
                          </span>
                        ))}

                      {item.options.filter(
                        (option) =>
                          option.status === true &&
                          option.type !== ItemOptionsEnum.IsSpicy &&
                          option.type !== ItemOptionsEnum.UpSellItem &&
                          option.type !== ItemOptionsEnum.IsVegan
                      ).length > 2 && (
                        <span className="font-online-ordering items-center text-center font-semibold inline-block px-2 py-1 mr-1.5 text-[8px] rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                          ...
                        </span>
                      )}
                    </div>
                    <div
                      className={`flex items-center space-x-1 absolute top-3.5 ${
                        item?.image ? "right-0.5" : "right-2"
                      }`}
                    >
                      {item.options.some(
                        (option) =>
                          option.type === ItemOptionsEnum.IsSpicy &&
                          option.status === true
                      ) && (
                        <Image
                          src={spicyImage}
                          alt="Spicy"
                          width={12}
                          height={12}
                          className="flex-shrink-0"
                        />
                      )}
                      {item.options.some(
                        (option) =>
                          option.type === ItemOptionsEnum.IsVegan &&
                          option.status === true
                      ) && (
                        <Image
                          src={Leaf}
                          alt="Spicy"
                          width={12}
                          height={12}
                          className="flex-shrink-0"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <p className="font-semibold text-lg md:text-lg items-center">
                      {item.name}
                    </p>
                  </div>
                  {/* <p className="flex-1 h-full">
                    <span className="line-clamp-2 text-base">{item.desc}</span>
                  </p> */}
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <p className="font-bold text-lg md:text-lg font-online-ordering">
                      ${item.price.toFixed(2)}
                    </p>
                    {!isOutOfStock && (
                      <button
                        disabled={
                          loadingItemId === item._id || loadingItem === item._id
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          if (cartDetails?.orderType === null) {
                            setClickState({
                              id: item._id,
                              type:
                                item.modifierGroup &&
                                item.modifierGroup.length === 0
                                  ? "add"
                                  : "view",
                            });
                            setShowMenu(false);
                            return;
                          }
                          if (
                            item.modifierGroup &&
                            item.modifierGroup?.length === 0
                          ) {
                            handleAddToCart(item._id);
                          } else {
                            setSelectedItem(item._id);
                            setSelectedCategoryId(category._id);
                          }
                        }}
                        className="flex items-center absolute right-2.5 bottom-2 shadow-sm border border-gray-300  hover:shadow-lg justify-center p-1 rounded-lg bg-white text-black hover:bg-opacity-95 hover:-translate-y-0.5 disabled:bg-opacity-95 disabled:hover:translate-y-0 transition-all duration-200"
                        aria-label="Add to cart"
                      >
                        {loadingItemId === item._id ||
                        loadingItem === item._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <div className="flex items-center">
                            <p className="text-sm pl-1">Add</p>
                            <Plus size={12} className="ml-1" />
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                  {isOutOfStock && !item?.image && (
                    <div className="absolute right-4 top-4">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );

            return isOutOfStock ? (
              <div key={item._id} className="block">
                {ItemContent}
              </div>
            ) : (
              <div
                key={item._id}
                // href={`/menu/?itemId=${item._id}`}
                // scroll={false}
                onClick={() => {
                  if (cartDetails?.orderType === null) {
                    setClickState({
                      id: item._id,
                      type: "view",
                    });
                    setShowMenu(false);
                    return;
                  }
                  setSelectedItem(item._id);
                  setSelectedCategoryId(category._id);
                }}
                className="block"
              >
                {ItemContent}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

export default CategoryListing;
