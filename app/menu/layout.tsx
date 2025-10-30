"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SignInSidebar from "@/components/SignInSidebar";
import meCustomerStore from "@/store/meCustomer";
import NavDataStore from "@/store/navData";
import RestaurantStore from "@/store/restaurant";
import { useSidebarStore } from "@/store/sidebar";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { getCmsSectionId } from "@/utils/theme-utils";
import { AnimatePresence } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode, Suspense, useEffect, useState } from "react";
import Loading from "./loading";
import ItemModal from "./modal/page";
import { useModalStore } from "@/store/global";
import { useCartStore } from "@/store/cart";
import { scheduleDaysList } from "@/utils/formattedTime";
import Modal from "@/components/Modal";

interface LayoutProps {
  children: ReactNode;
}

export const dynamic = "force-dynamic";

const RestaurantLayout = ({ children }: LayoutProps) => {
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const itemId = searchParams.get("itemId");
  const { restaurantData, selectedItem, setSelectedItem } = RestaurantStore();
  const { isSignInOpen, isCartOpen, setSignInOpen, setCartOpen, isSignUpOpen } =
    useSidebarStore();
  const { setShowMenu, showMenu, setDaysList } = useModalStore();
  const { cartCountInfo, setCartCountInfo, setCartDetails, cartDetails } =
    useCartStore();
  const { setMeCustomerData } = meCustomerStore();
  const { setNavData } = NavDataStore();
  const router = useRouter(); 

  useEffect(() => {
    const fetchInitialCustomer = async () => {
      setLoading(true);
      try {
        const customerData = await fetchWithAuth(() => sdk.meCustomer());
        if (customerData.meCustomer) {
          setMeCustomerData(customerData.meCustomer);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialCustomer();
  }, [setMeCustomerData]);

  // FIXED: Optimised useEffect
  useEffect(() => {
    const fetchFunc = async () => {
      try {
        setLoading(true);

        const [cmsDetails] = await Promise.all([sdk.GetCmsDetails()]);

        if (cmsDetails.getCmsDetails !== null) {
          const {
            menuSection,
            contentSection,
            gridSection,
            contentWithImageSection,
            reviewSection,
          } = cmsDetails.getCmsDetails!;

          const navItems: { name: string; link: string }[] = [
            { name: "Home", link: "/" },
          ];

          if (menuSection.show) {
            navItems.push({
              name: menuSection.navTitle,
              link: getCmsSectionId(menuSection.navTitle).replace("#", "/#"),
            });
          }

          if (contentSection?.show) {
            navItems.push({
              name: contentSection.navTitle,
              link: getCmsSectionId(contentSection.navTitle).replace("#", "/#"),
            });
          }

          if (gridSection?.show) {
            navItems.push({
              name: gridSection.navTitle,
              link: getCmsSectionId(gridSection.navTitle).replace("#", "/#"),
            });
          }

          if (contentWithImageSection?.show) {
            navItems.push({
              name: contentWithImageSection.navTitle,
              link: getCmsSectionId(contentWithImageSection.navTitle).replace(
                "#",
                "/#"
              ),
            });
          }

          if (reviewSection?.show) {
            navItems.push({
              name: reviewSection.navTitle,
              link: getCmsSectionId(reviewSection.navTitle).replace("#", "/#"),
            });
          }

          setNavData(navItems);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFunc();
  }, [setNavData, pathname]);

  useEffect(() => {
    if (itemId) {
      if (!cartDetails || cartDetails?.orderType === null) {
        setShowMenu(false);
      }
      setSelectedItem(itemId);
      router.replace("/menu")
    }
  }, [itemId, setShowMenu,setSelectedItem, cartDetails]);

  useEffect(() => {
    if (restaurantData) {
      const restaurantTimeZone =
        restaurantData.timezone.timezoneName?.split(" ")[0];
      const avl = restaurantData.availability ?? [];

      if (restaurantTimeZone && avl) {
        const days = scheduleDaysList(restaurantTimeZone ?? "", avl);
        setDaysList(days);
      }
    }
  }, [restaurantData, setDaysList, showMenu]);

  useEffect(() => {
    if (selectedItem || !showMenu) {
      document.body.classList.add("overflow-y-hidden");
    } else {
      document.body.classList.remove("overflow-y-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-y-hidden");
    };
  }, [showMenu, selectedItem]);

  return (
    <div className="relative flex flex-col">
      {!pathname.includes("checkout") &&
        !pathname.includes("payment-status") &&
        !pathname.includes("cart") &&
        !pathname.includes("order") &&
        !pathname.includes("free-order") && (
          <Navbar myaccount={pathname.includes("my-account")} />
        )}
      <Suspense fallback={<Loading />}>{children}</Suspense>
      <AnimatePresence>
        {!showMenu &&
          restaurantData &&
          restaurantData.address &&
          restaurantData.availability && (
            <Modal
              address={restaurantData.address}
              restaurantName={restaurantData.name}
              availability={restaurantData.availability}
            />
          )}
      </AnimatePresence>
      <SignInSidebar
        isOpen={isSignInOpen}
        onClose={() => setSignInOpen(false)}
        restaurantName={restaurantData?.name || ""}
        openSignUp={isSignUpOpen}
      />
      <AnimatePresence>
        {selectedItem !== null && <ItemModal />}
      </AnimatePresence>
      <Footer
        isProfile={
          [
            "/menu/my-account",
            "/menu",
            "/menu/redirect/payment-status",
            "/menu/redirect/free-order",
          ].includes(pathname)
            ? true
            : false
        }
      />
    </div>
  );
};

export default RestaurantLayout;
