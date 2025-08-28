"use client";

import FloatingCartButton from "@/components/cart/FloatingCartButton";
import Modal from "@/components/Modal";
import CategoryListing from "@/components/partners/CategoryListing";
import FilterDropdown from "@/components/partners/FilterDropdown";
import LoyaltyOffers from "@/components/partners/LoyaltyOffers";
import NoOnlineOrder from "@/components/partners/NoOnlineOrder";
import OrderOptions from "@/components/partners/OrderOptions";
import PromoCodes from "@/components/partners/PromoCodes";
import SignInSidebar from "@/components/SignInSidebar";
import { Env } from "@/env";
import { ItemOptionsEnum, OrderType } from "@/generated/graphql";
import { sendAnalyticsEvent } from "@/hooks/useAnalytics";
import { useCartStore } from "@/store/cart";
import { useModalStore } from "@/store/global";
import RestaurantStore from "@/store/restaurant";
import { useSidebarStore } from "@/store/sidebar";
import ToastStore from "@/store/toast";
import { getOrCreateUserHash } from "@/utils/analytics";
import { scheduleDaysList } from "@/utils/formattedTime";
import { sdk } from "@/utils/graphqlClient";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { fadeIn } from "@/utils/motion";
import { debounce } from "lodash";
import {
  CustomerCategoryItem,
  CustomerRestaurant,
  FetchCartDetails,
  RestaurantRedeemOffers,
} from "@/utils/types";
import { extractFreeDiscountItemDetails } from "@/utils/UtilFncs";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaCartShopping } from "react-icons/fa6";
import { FiSearch, FiX } from "react-icons/fi";
import { MdMenuBook } from "react-icons/md";
import Loading from "./loading";
import RecentOrders from "@/components/partners/RecentOrders";

interface RestaurantDetailsProps {
  restaurant: CustomerRestaurant;
  // categories: CustomerCategoryItem[];
  loyaltyRule: { value: number; name: string; signUpValue: number } | null;
  loyaltyOffers: RestaurantRedeemOffers | null;
  mismatch: boolean | null;
  isLoggedIn: boolean;

}

export default function RestaurantDetails({
  restaurant,
  // categories,
  loyaltyOffers,
  loyaltyRule,
  mismatch,
  isLoggedIn,
}: // cartStore,
// cartCount,
// slug,
RestaurantDetailsProps) {
  const [filteredCategories, setFilteredCategories] = useState<
    CustomerCategoryItem[] | null
  >(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategoriesPopupOpen, setIsCategoriesPopupOpen] =
    useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<
    ItemOptionsEnum[] | null
  >(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [categoryType, setCategoryType] = useState<ItemOptionsEnum[] | null>(
    null
  );
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const { setRestaurantData } = RestaurantStore();
  const { setShowMenu, setDaysList } = useModalStore();
  const {
    cartCountInfo,
    setCartCountInfo,
    setCartDetails,
    fetchTrigger,
    setFetchTrigger,
  } = useCartStore();
  const searchParams = useSearchParams();
  // const { cartCountInfo } = useCartStore();
  const { setCartOpen } = useSidebarStore();
  const { setToastData } = ToastStore();
  const [showButton, setShowButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const {setSignInOpen, setIsSignUpOpen } = useSidebarStore();

  // const IntialCategory = categories;

  const isDelivery = restaurant.deliveryConfig.provideDelivery;
  const isPickUp = restaurant.restaurantConfigs.pickup;
  const isOnlineOrdering = restaurant.restaurantConfigs.onlineOrdering;

  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const mobileCategoryBarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  const filterRef = useRef<HTMLDivElement>(null);
   const router = useRouter();
  useEffect(() => {
    if (mismatch) {
      setShowMenu(false);
    }
  }, [mismatch]);

  useEffect(() => {
    const queryParam = searchParams.get("delivery");
    if (queryParam) {
      setToastData({
        type: "error",
        message: `For delivery minimum order value should $${restaurant.deliveryConfig.deliveryZone.minimumOrderValue}`,
      });
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("delivery");

      // Update URL without reloading the page
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${
          newSearchParams.toString() ? "?" + newSearchParams.toString() : ""
        }`
      );
    }
  }, [searchParams]);

  useEffect(() => {
    const signup = searchParams.get("signup");
    if (!signup) return;
    if (isLoggedIn) {
      // router.replace('/menu', { shallow: true });
      router.replace("/menu/my-account");
    } else {
      router.replace("/menu");
      setSignInOpen(true);
      setIsSignUpOpen(true);
    }
  }, [isLoggedIn]);

  // Fetching cart count and cart details
  useEffect(() => {
    const fetchCartDets = async () => {
      const [cartCountReq, cartStoreReq] = await Promise.all([
        sdk.fetchCartCount(),
        sdk.fetchCartDetails(),
      ]);

      const cartCount = cartCountReq.fetchCartCount;
      const cartStore = cartStoreReq.fetchCartDetails;

      if (cartStore) {
        const groupedCart: FetchCartDetails = {
          customerDetails: {
            firstName: cartStore.customerDetails.firstName,
          },
          orderType: cartStore.orderType,
          delivery: cartStore.delivery,
          amounts: {
            subTotalAmount: cartStore.amounts.subTotalAmount,
            discountAmount: cartStore.amounts.discountAmount,
            discountPercent: cartStore.amounts.discountPercent,
            discountUpto: cartStore.amounts.discountUpto,
            tipPercent: cartStore.amounts.tipPercent,
          },
          pickUpDateAndTime: cartStore.pickUpDateAndTime,
          deliveryDateAndTime: cartStore.deliveryDateAndTime,
          discountString: cartStore.discountString,
          loyaltyType: cartStore.loyaltyType,
          loyaltyRedeemPoints: cartStore.loyaltyRedeemPoints,
        };
        setCartDetails(groupedCart);
        if (groupedCart) {
          // Check if we have a free item
          const currentFreeItem = extractFreeDiscountItemDetails(
            groupedCart.discountString ?? ""
          );

          // Set cart count including free item if it exists
          setCartCountInfo(cartCount + (currentFreeItem ? 1 : 0));
        } else {
          setCartCountInfo(cartCount);
        }

        if (cartStore.orderType === null) {
          // setShowMenu(false);
        } else {
          const scheduleTime: string =
            (cartStore.orderType === OrderType.Pickup
              ? cartStore.pickUpDateAndTime
              : cartStore.deliveryDateAndTime) ?? "";

          if (scheduleTime.length > 0) {
            const d = new Date(scheduleTime);

            if (new Date() > d) {
              setShowMenu(false);
            }
          } else {
            setShowMenu(false);
          }
        }
      }
    };
    fetchCartDets();
  }, [setCartCountInfo, setCartDetails, setShowMenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        if (showFilter) toggleFilter();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilter, toggleFilter]);

  useEffect(() => {
    if (categoryType) {
      const params = new URLSearchParams(window.location.search);
      params.set("filters", categoryType.join(","));
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [categoryType]);

  useEffect(() => {
    const filterParam = searchParams.get("filters");
    if (filterParam) {
      const filters = filterParam.split(",") as ItemOptionsEnum[];
      setSelectedCategories(filters);
      setCategoryType(filters);
    }
  }, []);

  const searchHandler = (searchValue: string) => {
    setSearchQuery(searchValue.trim());
  };

  const debounceSearch = debounce(searchHandler, 600);

  const handleClearAllFilters = () => {
    setSelectedCategories(null);
    setCategoryType(null);
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }

    const params = new URLSearchParams(window.location.search);
    params.delete("filters");
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  };

  // Handle checkbox changes
  const handleCheckboxChange = (option: ItemOptionsEnum) => {
    setSelectedCategories((prevCategories) => {
      if (!prevCategories) {
        const newCategories = [option];
        setCategoryType(newCategories);
        return newCategories;
      }

      if (prevCategories.includes(option)) {
        const updatedCategories = prevCategories.filter(
          (category) => category !== option
        );
        setCategoryType(updatedCategories.length ? updatedCategories : null);
        return updatedCategories.length ? updatedCategories : null;
      } else {
        const updatedCategories = [...prevCategories, option];
        setCategoryType(updatedCategories);
        return updatedCategories;
      }
    });

    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  };

  // Effect to update visible categories based on filters
  // useEffect(() => {
  //   if (!categoryType) {
  //     // setVisibleCategories(IntialCategory);
  //     setFilteredCategories(IntialCategory);
  //   }
  // }, [categoryType, categories, IntialCategory]);

  // Effect to set restaurant data
  useEffect(() => {
    setRestaurantData(restaurant);
  }, [restaurant, setRestaurantData]);

  useEffect(() => {
    const getRestaurantCategories = async () => {
      try {
        setLoading(true);
        const itemsResponse = await sdk.getCustomerCategoriesAndItems({
          ItemOptionSelected: categoryType,
          searchText: searchQuery,
        });
        const categories: CustomerCategoryItem[] =
          itemsResponse.getCustomerCategoriesAndItems.map((category) => ({
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
            availability: category.availability
              ? category.availability.map((avail) => ({
                  day: avail.day,
                  active: avail.active,
                  hours: avail.hours.map((hour) => ({
                    start: hour.start,
                    end: hour.end,
                  })),
                }))
              : undefined, // Make sure to map correctly
            createdAt: new Date(category.createdAt),
            updatedAt: new Date(category.updatedAt),
          }));
        setFilteredCategories(categories);
        setLoading(false);
      } catch (err) {
        console.log("Failed to fetch restaurant categories", err);
      } finally {
        setLoading(false);
      }
    };

    getRestaurantCategories();
  }, [restaurant, categoryType, searchQuery, fetchTrigger]);

  // Intersection Observer for category tracking
  useEffect(() => {
    let categoriesVisited = new Set<string>();
    if (typeof window !== "undefined") {
      categoriesVisited = new Set(
        JSON.parse(sessionStorage.getItem("categoriesVisited") || "[]")
      );
    }

    // Simpler observer options with better thresholds
    const observerOptions = {
      rootMargin: isMobile ? "-80px 0px -20% 0px" : "-150px 0px -40% 0px",
      threshold: [0.1, 0.5], // Multiple thresholds for better detection
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Find the first intersecting entry with the highest intersection ratio
      const intersectingEntries = entries.filter(
        (entry) => entry.isIntersecting
      );

      if (intersectingEntries.length > 0) {
        // Sort by intersection ratio (highest first)
        intersectingEntries.sort(
          (a, b) => b.intersectionRatio - a.intersectionRatio
        );
        const entry = intersectingEntries[0];

        const categoryId = entry.target.getAttribute("data-category-id");
        const categoryName = entry.target.getAttribute("data-category-name");

        if (categoryId) {
          // Update analytics
          if (!categoriesVisited.has(categoryId)) {
            categoriesVisited.add(categoryId);
            sessionStorage.setItem(
              "categoriesVisited",
              JSON.stringify([...categoriesVisited])
            );

            const userHash = getOrCreateUserHash();
            sendAnalyticsEvent({
              restaurant: Env.NEXT_PUBLIC_RESTAURANT_ID,
              pagePath: "/menu",
              pageQuery: null,
              source: document.referrer || "direct",
              utm: null,
              userHash,
              eventType: "category_view",
              metadata: {
                id: categoryId,
                name: categoryName,
              },
            });
          }

          // Update active category
          setActiveCategory(categoryId);

          // Improved mobile category bar scrolling
          if (mobileCategoryBarRef.current) {
            setTimeout(() => {
              // Re-check if mobileCategoryBarRef is still valid after timeout
              if (mobileCategoryBarRef.current) {
                const categoryButton = Array.from(
                  mobileCategoryBarRef.current.querySelectorAll("button")
                ).find(
                  (btn) => btn.getAttribute("data-category-id") === categoryId
                );

                if (categoryButton) {
                  categoryButton.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                  });
                }
              }
            }, 100); // Small delay to ensure DOM is updated
          }
        }
      }
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    // Make sure all category refs have proper data attributes
    Object.values(categoryRefs.current).forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [filteredCategories, isMobile]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Check on resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.pageYOffset;
      const viewportHeight = window.innerHeight * 0.1; // 10vh
      setShowButton(scrollPosition > viewportHeight);
    };

    // Only add scroll listener for desktop devices
    if (!isMobile) {
      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [isMobile]);

  const shouldShow = showButton;

  const scrollToCategory = (
    categoryId: string,
    categoryName: string,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    const element = categoryRefs.current[categoryId];

    if (element) {
      const offset = isMobile ? 90 : 150;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setTimeout(() => {
        setActiveCategory(categoryId);
      }, 500);
    }
  };

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    // setSearchQuery(e.target.value);
    debounceSearch(e.target.value);
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  };

  // Schedule Configs Effect
  useEffect(() => {
    if (restaurant) {
      const restaurantTimeZone =
        restaurant.timezone.timezoneName?.split(" ")[0];
      const avl = restaurant.availability ?? [];

      if (restaurantTimeZone && avl) {
        const days = scheduleDaysList(restaurantTimeZone ?? "", avl);
        setDaysList(days);
      }
    }
  }, [restaurant, setDaysList]);

  // No online ordering check
  if (!isOnlineOrdering) {
    return <NoOnlineOrder />;
  }

  return (
    <div className="w-full min-h-screen">
      <main className="h-auto bg-white py-4 z-40">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center max-w-8xl mx-auto px-6 md:px-20 lg:px-28">
          <div>
            <h2 className="md:text-3xl text-2xl mb-1 font-online-ordering">
              <span className=" font-online-ordering ">{restaurant.name}</span>
            </h2>
            <div className="text-sm sm:text-base font-online-ordering">
              <p>{restaurant.address?.addressLine1}</p>
            </div>
          </div>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <OrderOptions
              isDelivery={isDelivery}
              isPickUp={isPickUp}
              setShowMenu={setShowMenu}
            />
          </div>
        </div>
      </main>

      <div className="flex flex-col bg-white w-full mx-auto relative">
        {/* Categories at top, Sticky */}
        <div
          ref={mobileCategoryBarRef}
          className="w-full bg-white font-online-ordering sticky top-0 border-t z-10 mb-4 py-2 border-b border-b-gray-100 shadow-md"
        >
          <div className="bg-white w-full mobile-category-bar max-w-8xl mx-auto px-6 md:px-20 lg:px-28">
            <div className="relative flex items-center mb-2 md:mb-5 pt-2 w-full">
              <FiSearch className="absolute left-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search menu items..."
                className="w-full pl-10 pr-4 py-2 rounded-[40px] border border-gray-300 focus:outline-none"
                // value={searchQuery}
                onChange={handleSearch}
              />
              <FilterDropdown
                selectedCategories={selectedCategories}
                handleCheckboxChange={handleCheckboxChange}
                onClearAll={handleClearAllFilters}
              />
              {shouldShow && !isMobile && cartCountInfo > 0 ? (
                <Link href={`/menu/cart`} passHref>
                  <button
                    className={`bg-white font-online-ordering border border-primaryColor ml-2 px-6 py-2  rounded-full flex items-center justify-center text-base z-40 space-x-2 whitespace-nowrap`}
                    style={{
                      color: isContrastOkay(
                        "#ffffff",
                        Env.NEXT_PUBLIC_PRIMARY_COLOR
                      )
                        ? Env.NEXT_PUBLIC_PRIMARY_COLOR
                        : "#000000",
                    }}
                  >
                    <FaCartShopping size={18} className="mr-2" />
                    VIEW CART ({cartCountInfo})
                  </button>
                </Link>
              ) : null}
            </div>

            {!isMobile ? (
              <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
                {filteredCategories && filteredCategories.map((category) => (
                  <button
                    key={category._id}
                    data-category-id={category._id}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-start hover:bg-gray-300`}
                    style={{
                      backgroundColor:
                        activeCategory === category._id
                          ? Env.NEXT_PUBLIC_PRIMARY_COLOR
                          : "transparent",
                      color:
                        activeCategory === category._id
                          ? isContrastOkay(
                              Env.NEXT_PUBLIC_PRIMARY_COLOR,
                              Env.NEXT_PUBLIC_BACKGROUND_COLOR
                            )
                            ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                            : Env.NEXT_PUBLIC_TEXT_COLOR
                          : "black",
                    }}
                    onClick={(e) =>
                      scrollToCategory(category._id, category.name, e)
                    }
                  >
                    {category.name.length > 35
                      ? `${category.name.slice(0, 35)}...`
                      : category.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center bg-white my-40 w-[95vw] space-x-2">
            <span className="sr-only">Loading...</span>
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full bg-primary animate-bounce-flash opacity-40`}
                style={{
                  animationDelay: `${index * 0.3}s`,
                  animationDuration: "1.2s",
                }}
              ></div>
            ))}
          </div>
        ) : (
          <div className="flex items-start w-full font-online-ordering">
            {/* Main Content */}
            <div className="w-full max-w-8xl mx-auto xl:overflow-y-auto overflow-scroll px-6 md:px-20 lg:px-28">
              {!searchQuery && <RecentOrders />}
              {!searchQuery && <PromoCodes />}
              {!searchQuery && (
                <LoyaltyOffers
                  loyaltyRule={loyaltyRule}
                  loyaltyOffers={loyaltyOffers}
                />
              )}
              <div className="space-y-10  mb-8 md:mb-0 ">
                {filteredCategories && filteredCategories.length === 0 ? (
                  <div className="py-4 h-[40rem]">
                    {!searchQuery && !categoryType ? (
                      // No search query and no filters - show store message
                      <>
                        <h1 className="md:text-4xl text-2xl font-bold">
                          Restaurant is not taking any orders for today
                        </h1>

                        <p className="md:text-lg text-base mt-4">
                          Please schedule your order to view menu items.{" "}
                        </p>
                        <button
                          onClick={() => setShowMenu(false)}
                          className={`flex bg-black text-white items-center mt-2 space-x-2 px-3 py-2 rounded-[40px] border border-gray-300 transition-all duration-200 `}
                          type="button"
                        >
                          <span className="font-medium font-online-ordering">
                            Schedule Order
                          </span>
                        </button>
                      </>
                    ) : (
                      // Has search query or filters - show no results found
                      <>
                        <h1 className="md:text-4xl text-2xl font-bold">
                          No result found
                        </h1>
                        <p className="md:text-lg text-base">
                          {`Sorry, we couldn't find any available item. Please refine your search or try changing your filters.`}
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  // Show categories when available
                  filteredCategories && filteredCategories.map((category) => (
                    <div key={category._id}>
                      {category.items.length > 0 && (
                        <CategoryListing
                          ref={(element: HTMLDivElement | null) => {
                            categoryRefs.current[category._id] = element;
                          }}
                          category={category}
                          restaurantSlug={Env.NEXT_PUBLIC_RESTAURANT_ID}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
              <br />
              <br />
            </div>
          </div>
        )}
      </div>

      {loading ? null : (
        <div>
          <button
            onClick={() => {
              setIsCategoriesPopupOpen(!isCategoriesPopupOpen);
            }}
            className={`${cartCountInfo > 0 ? "bottom-20" : "bottom-10"} font-online-ordering flex-col text-white px-3 py-3 rounded-full flex items-center justify-center text-base fixed right-6 w-fit z-10 shadow-lg bg-primary md:hidden`}
            style={{
              color: isContrastOkay(
                Env.NEXT_PUBLIC_PRIMARY_COLOR,
                Env.NEXT_PUBLIC_BACKGROUND_COLOR
              )
                ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                : Env.NEXT_PUBLIC_TEXT_COLOR,
            }}
          >
            <MdMenuBook size={18} />
            <span className="text-sm">Menu</span>
          </button>
        </div>
      )}
      {cartCountInfo > 0 ? <FloatingCartButton count={cartCountInfo} /> : null}
      <AnimatePresence>
        {isMobile && isCategoriesPopupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end md:items-center z-40 p-4"
          >
            <motion.div
              variants={fadeIn("up", "tween", 0, 0.3)}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="relative bg-bgGray rounded-[20px] shadow-xl w-full max-w-3xl overflow-auto scrollbar-hide flex flex-col max-h-[70vh]"
            >
              <>
                <div className="flex items-center justify-between font-online-ordering py-2 px-3 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Categories</h2>
                  <button
                    onClick={() => setIsCategoriesPopupOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="overflow-y-scroll pb-3">
                  <div className="space-y-2">
                    {filteredCategories && filteredCategories.map((category) => (
                      <button
                        key={category._id}
                        data-category-id={category._id}
                        className={`w-full text-left py-1.5 px-3 text-sm rounded-lg hover:bg-gray-100 font-online-ordering`}
                        style={{
                          color:
                            activeCategory === category._id
                              ? Env.NEXT_PUBLIC_PRIMARY_COLOR
                              : "#000000",
                        }}
                        onClick={(e) => {
                          scrollToCategory(category._id, category.name, e);
                          setIsCategoriesPopupOpen(false);
                        }}
                      >
                        <div className="w-full flex justify-between">
                          <p>{category.name}</p>
                          <p>{category.items.length}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SignInSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        restaurantName={restaurant.name}
      />
    </div>
  );
}
