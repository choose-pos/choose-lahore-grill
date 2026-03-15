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
          const userHash = getOrCreateUserHash();
          sendAnalyticsEvent({
            restaurant: Env.NEXT_PUBLIC_RESTAURANT_ID,
            pagePath: "/menu",
            pageQuery: null,
            source: document.referrer || "direct",
            utm: null,
            userHash,
            eventType: "add_to_cart",
            metadata: {
              id: itemId,
              name: category?.name ?? "",
            },
          });
          try {
            const res = await refreshCartCount();
            const res2 = await refreshCartDetails();
            if (res2?.CartDetails) {
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
      <div className="rounded-md w-full pt-2 pb-2 lg:pt-0 lg:pb-0 lg:py-4">
        <div
          ref={ref}
          data-category-id={category._id}
          data-category-name={category.name}
          className="scroll-mt-96"
        >
          <h2 className="text-lg md:text-xl lg:text-2xl font-semibold mb-1 lg:mb-1 font-subheading-oo">
            {category.name}
          </h2>
          <div className="mb-3 lg:mb-4 flex items-center">
            <p className="text-gray-600 text-base italic md:text-lg font-body-oo">
              {displayText}
            </p>
            {shouldShowMore && (
              <p
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm mt-1 font-medium cursor-pointer ml-1"
              >
                {isExpanded ? "Show less" : "Read more"}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 lg:gap-x-4 lg:gap-y-3 w-full">
          {category.items.map((item, index) => {
            const isOutOfStock =
              typeof item.orderLimitTracker === "number" &&
              item.orderLimitTracker <= 0;

            const ItemContent = (
              <div
                id={category.name}
                className={[
                  "bg-white flex flex-row w-full transition-all duration-300 h-full relative  border-gray-200",
                  // mobile
                  "items-center min-h-[140px] py-5",
                  index !== 0 ? "border-t border-gray-200" : "",
                  category.items.length === 1 ? "border-b border-gray-200" : "",
                  // desktop
                  "lg:border lg:rounded-xl lg:m-1 lg:p-4 lg:py-4 lg:items-start lg:min-h-[8rem] lg:hover:bg-gray-50",
                  isOutOfStock
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer",
                ].join(" ")}
              >
                {/* Image */}
                {item?.image ? (
                  <div
                    className="relative order-last flex-shrink-0
                    w-[7.5rem] aspect-square my-auto rounded-md overflow-hidden
                    lg:w-[7rem] lg:h-[7rem]  lg:ml-4"
                  >
                    <Image
                      src={item.image}
                      alt={item?.name || "Menu item"}
                      fill
                      sizes=""
                      className="object-cover rounded-md "
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
                    className="relative order-last flex-shrink-0 my-auto
                      w-[7.5rem] aspect-square rounded-2xl overflow-hidden item-image-placeholder border border-gray-100
                      lg:w-[7rem] lg:h-[7rem] lg:rounded-xl lg:ml-4 lg:border-gray-200"
                    data-text={Array(200).fill(`${item.name} `).join("")}
                  />
                )}

                {/* Content */}
                <div className="flex-1 flex flex-col relative min-w-0 pr-3 self-stretch justify-start gap-y-1 lg:gap-y-0 lg:pr-0 lg:px-0 lg:py-0">
                  {/* Best Seller badge - shown on both mobile and desktop */}
                  {item.options.some(
                    (o) =>
                      o.type === ItemOptionsEnum.PopularItem &&
                      o.status === true,
                  ) && (
                    <span className="inline-block mb-1 px-2 py-0.5 text-xs font-normal font-body-oo rounded-md bg-green-600 text-white w-fit">
                      Best Seller
                    </span>
                  )}

                  {/* badges row - desktop only */}
                  <div className="hidden lg:flex w-full items-center justify-between lg:py-1 gap-1">
                    <div
                      className={`${
                        item.options
                          .filter(
                            (o) =>
                              o.status === true &&
                              o.type !== ItemOptionsEnum.IsSpicy &&
                              o.type !== ItemOptionsEnum.UpSellItem &&
                              o.type !== ItemOptionsEnum.IsVegan &&
                              o.type !== ItemOptionsEnum.PopularItem,
                          )
                          .slice(0, 2).length > 0
                          ? ""
                          : "hidden"
                      }`}
                    >
                      {item.options
                        .filter(
                          (o) =>
                            o.status === true &&
                            o.type !== ItemOptionsEnum.IsSpicy &&
                            o.type !== ItemOptionsEnum.UpSellItem &&
                            o.type !== ItemOptionsEnum.IsVegan &&
                            o.type !== ItemOptionsEnum.PopularItem,
                        )
                        .slice(0, 2)
                        .map((option) => (
                          <span
                            key={option.displayName}
                            className="font-body-oo items-center text-center font-semibold  inline-block px-2 py-1 mr-1.5 text-[8px] rounded-md bg-gray-50 text-gray-700 border border-gray-200"
                          >
                            {option.displayName}
                          </span>
                        ))}
                      {item.options.filter(
                        (o) =>
                          o.status === true &&
                          o.type !== ItemOptionsEnum.IsSpicy &&
                          o.type !== ItemOptionsEnum.UpSellItem &&
                          o.type !== ItemOptionsEnum.IsVegan &&
                          o.type !== ItemOptionsEnum.PopularItem,
                      ).length > 2 && (
                        <span className="font-body-oo items-center text-center font-semibold inline-block px-2 py-1 mr-1.5 text-[8px] rounded-md bg-gray-50 text-gray-700 border border-gray-200">
                          ...
                        </span>
                      )}
                    </div>
                    <div
                      className={`flex items-center space-x-1 absolute top-3.5 ${item?.image ? "right-0.5" : "right-2"}`}
                    >
                      {item.options.some(
                        (o) =>
                          o.type === ItemOptionsEnum.IsSpicy &&
                          o.status === true,
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
                        (o) =>
                          o.type === ItemOptionsEnum.IsVegan &&
                          o.status === true,
                      ) && (
                        <Image
                          src={Leaf}
                          alt="Vegan"
                          width={12}
                          height={12}
                          className="flex-shrink-0"
                        />
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <p className="text-base font-subheading-oo font-semibold">
                    {item.name}
                  </p>

                  {/* Description */}
                  {item.desc && (
                    <p className="line-clamp-2 text-sm text-gray-400 font-body-oo">
                      {item.desc}
                    </p>
                  )}

                  {/* Price */}
                  <p className="text-base leading-tight pb-2 mt-auto lg:pt-2 font-subheading-oo font-semibold">
                    ${item.price.toFixed(2)}
                  </p>

                  {isOutOfStock && !item?.image && (
                    <div className="absolute right-4 top-4">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

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
                    className="flex items-center absolute right-2.5 bottom-2 shadow-sm border z-10 border-gray-300 hover:shadow-lg justify-center p-1 rounded-lg bg-white text-black hover:bg-opacity-95 hover:-translate-y-0.5 disabled:bg-opacity-95 disabled:hover:translate-y-0 transition-all duration-200"
                    aria-label="Add to cart"
                  >
                    {loadingItemId === item._id || loadingItem === item._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <div className="flex items-center">
                        <p className="text-sm pl-1 font-body-oo">Add</p>
                        <Plus size={12} className="ml-1" />
                      </div>
                    )}
                  </button>
                )}
              </div>
            );

            return isOutOfStock ? (
              <div key={item._id} className="block">
                {ItemContent}
              </div>
            ) : (
              <div
                key={item._id}
                onClick={() => {
                  if (cartDetails?.orderType === null) {
                    setClickState({ id: item._id, type: "view" });
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
  },
);

export default CategoryListing;