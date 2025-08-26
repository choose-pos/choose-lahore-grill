import { Env } from "@/env";
import { useCartStore } from "@/store/cart";
import meCustomerStore from "@/store/meCustomer";
import NavDataStore from "@/store/navData";
import RestaurantStore from "@/store/restaurant";
import { useSidebarStore } from "@/store/sidebar";
import ToastStore from "@/store/toast";
import { extractErrorMessage } from "@/utils/UtilFncs";
import { sdk } from "@/utils/graphqlClient";
import { isContrastOkay } from "@/utils/isContrastOkay";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaCartShopping } from "react-icons/fa6";
import { HiMenu, HiX } from "react-icons/hi";
import { MdAccountCircle } from "react-icons/md";
import { getNavItems } from "../data/nav-items"; // Assuming you have a types folder
import { FiChevronDown } from "react-icons/fi";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface NavbarProps {
  myaccount: boolean;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: -10 },
  show: { opacity: 1, y: 0 },
};

const Navbar: React.FC<NavbarProps> = ({ myaccount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const [isMobileOffersOpen, setIsMobileOffersOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [offerNavitems, setOfferNavItems] = useState<
    { title: string; link: string }[]
  >([]);
  const { restaurantData } = RestaurantStore();
  const { cartCountInfo } = useCartStore();
  const { setCartOpen, setSignInOpen } = useSidebarStore();
  const { setToastData } = ToastStore();
  const { meCustomerData, setMeCustomerData } = meCustomerStore();
  const { NavData } = NavDataStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogOut = async (): Promise<void> => {
    try {
      const data = await sdk.customerLogout();
      if (data.customerLogout) {
        setMeCustomerData(null);
        setToastData({
          type: "success",
          message: "You have been logged out successfully!",
        });

        router.replace(`/menu/cart-session`);
        // router.back();
      }
    } catch (error) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    }
  };

  const navItems = getNavItems(
    restaurantData?._id ?? "",
    restaurantData?.website ?? "/"
  );

  const closeMenu = (): void => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const fetchNavItems = async () => {
      try {
        const nav = await sdk.getCmsPromoNavItems();
        const items =
          nav?.getCmsPromoNavItems?.map((e) => ({
            title: e.navTitle,
            link: `./offer-promotion/${e.link}`,
          })) || [];

        setOfferNavItems(items);
      } catch (error) {
        console.error("Error fetching promo nav items:", error);
        setOfferNavItems([]);
      }
    };

    fetchNavItems();
  }, []);

  const toggleOffersDropdown = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setIsOffersOpen(!isOffersOpen);
  };
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header
      className={`${
        pathname === "/menu" ? "" : "sticky top-0"
      } bg-white z-20 shadow-sm border-b border-b-black/20   font-online-ordering`}
    >
      <div className="max-w-8xl mx-auto px-6 md:px-20 lg:px-28">
        <div className="flex justify-between items-center h-16 md:h-24">
          {/* Logo */}
          <div className="flex items-center ">
            <div className="w-24 md:h-[85px] h-[70px] relative">
              {restaurantData?.brandingLogo ? (
                <Link href={"/"}>
                  <Image
                    src={restaurantData?.brandingLogo ?? ""}
                    alt={`${restaurantData?.name} Logo`}
                    fill
                    sizes=""
                    // quality={100}
                    className="rounded-lg object-contain w-full h-full"
                    // priority // Add this if it's above the fold
                  />
                </Link>
              ) : null}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navItems?.map((item) => (
              <Link key={item.href} href={item.href} passHref>
                <p className="  px-4 py-2 rounded-md text-2xl md:text-lg font-medium ">
                  {item.label}
                </p>
              </Link>
            ))}
            {offerNavitems.length > 0 && (
              <div
                className=" relative px-4 py-2 rounded-md text-2xl md:text-lg font-medium "
                onMouseEnter={() => setIsOffersOpen(true)}
                onMouseLeave={() => setIsOffersOpen(false)}
              >
                <div
                  className="flex items-center space-x-1 cursor-pointer hover:text-primaryColor transition-colors duration-200"
                  onClick={toggleOffersDropdown}
                >
                  <span>Promotions</span>
                  <FiChevronDown
                    className={`transition-transform duration-200 ${
                      isOffersOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Desktop Dropdown - improved positioning and interaction */}
                {isOffersOpen && (
                  <div className="absolute top-full left-0 pt-2 z-60">
                    <div className="w-64 bg-white border border-primaryColor rounded-lg cursor-pointer shadow-lg py-2">
                      {offerNavitems.map((offer, index) => (
                        <Link key={index} href={`/${offer.link}`}>
                          <div className="px-4 py-3  hover:text-primaryColor transition-all duration-200 cursor-pointer border-b border-gray-100 last:border-b-0">
                            {offer.title}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Desktop Right Side Actions */}
          <div className="hidden lg:flex items-center space-x-6">
            {myaccount ? (
              <>
                <button
                  onClick={handleLogOut}
                  className="flex items-center space-x-2 text-gray-600"
                >
                  <MdAccountCircle size={28} />
                  <span>Log Out</span>
                </button>
                {cartCountInfo > 0 ? (
                  <Link href={`/menu/cart`}>
                    <button
                      className="bg-primary text-white px-6 py-2 rounded-full flex items-center space-x-2"
                      style={{
                        color: isContrastOkay(
                          Env.NEXT_PUBLIC_PRIMARY_COLOR,
                          Env.NEXT_PUBLIC_BACKGROUND_COLOR
                        )
                          ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                          : Env.NEXT_PUBLIC_TEXT_COLOR,
                      }}
                    >
                      <FaCartShopping
                        size={18}
                        style={{
                          color: isContrastOkay(
                            Env.NEXT_PUBLIC_PRIMARY_COLOR,
                            Env.NEXT_PUBLIC_BACKGROUND_COLOR
                          )
                            ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                            : Env.NEXT_PUBLIC_TEXT_COLOR,
                        }}
                      />
                      <span
                        className="font-online-ordering"
                        style={{
                          color: isContrastOkay(
                            Env.NEXT_PUBLIC_PRIMARY_COLOR,
                            Env.NEXT_PUBLIC_BACKGROUND_COLOR
                          )
                            ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                            : Env.NEXT_PUBLIC_TEXT_COLOR,
                        }}
                      >
                        VIEW CART{" "}
                        {cartCountInfo > 0 ? `(${cartCountInfo})` : "(0)"}
                      </span>
                    </button>
                  </Link>
                ) : null}
              </>
            ) : (
              <>
                {meCustomerData ? (
                  <Link href={`/menu/my-account`} passHref>
                    <div className="flex items-center space-x-2 text-gray-600 ">
                      <MdAccountCircle size={28} />
                      <span>{meCustomerData.firstName}</span>
                    </div>
                  </Link>
                ) : (
                  <button
                    onClick={() => setSignInOpen(true)}
                    className="text-gray-600 font-medium"
                  >
                    Sign In
                  </button>
                )}
                {cartCountInfo > 0 ? (
                  <Link href={`/menu/cart`} passHref>
                    <div
                      className="bg-primary text-white px-6 py-2 rounded-full flex items-center space-x-2"
                      style={{
                        color: isContrastOkay(
                          Env.NEXT_PUBLIC_PRIMARY_COLOR,
                          Env.NEXT_PUBLIC_BACKGROUND_COLOR
                        )
                          ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                          : Env.NEXT_PUBLIC_TEXT_COLOR,
                      }}
                    >
                      <FaCartShopping
                        size={18}
                        style={{
                          color: isContrastOkay(
                            Env.NEXT_PUBLIC_PRIMARY_COLOR,
                            Env.NEXT_PUBLIC_BACKGROUND_COLOR
                          )
                            ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                            : Env.NEXT_PUBLIC_TEXT_COLOR,
                        }}
                      />
                      <span
                        className="font-online-ordering"
                        style={{
                          color: isContrastOkay(
                            Env.NEXT_PUBLIC_PRIMARY_COLOR,
                            Env.NEXT_PUBLIC_BACKGROUND_COLOR
                          )
                            ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                            : Env.NEXT_PUBLIC_TEXT_COLOR,
                        }}
                      >
                        VIEW CART{" "}
                        {cartCountInfo > 0 ? `(${cartCountInfo})` : "(0)"}
                      </span>
                    </div>
                  </Link>
                ) : null}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="">
              {meCustomerData ? (
                <Link href={`/menu/my-account`} passHref>
                  <div className="flex items-center space-x-1 text-gray-600 ">
                    <MdAccountCircle size={24} />
                    <span className="truncate max-w-[100px]">
                      {meCustomerData.firstName}
                    </span>
                  </div>
                </Link>
              ) : (
                <button
                  onClick={() => setSignInOpen(true)}
                  className="text-gray-800 font-medium"
                >
                  Sign In
                </button>
              )}
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600  hover:bg-gray-100"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            <div className="px-4 border-b border-gray-200">
              <div className="flex items-center justify-between h-16 py-2">
                <div className="flex items-center pl-2">
                  <div className="w-24 md:h-[85px] h-[70px] relative">
                    {restaurantData?.brandingLogo ? (
                      <Link href={"/"}>
                        <Image
                          src={restaurantData?.brandingLogo ?? ""}
                          alt={`${restaurantData?.name} Logo`}
                          fill
                          sizes=""
                          className="rounded-lg object-contain w-full h-full"
                        />
                      </Link>
                    ) : null}
                  </div>
                </div>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <HiX size={24} />
                </button>
              </div>
            </div>

            <nav className="flex-1 flex flex-col items-center justify-center px-4 py-6 space-y-3 overflow-y-auto">
              {navItems?.map((item) => (
                <Link key={item.href} href={item.href} passHref>
                  <p
                    className="  px-4 py-2 rounded-md text-lg sm:text-xl font-medium "
                    onClick={closeMenu}
                  >
                    {item.label}
                  </p>
                </Link>
              ))}
              {offerNavitems && offerNavitems.length > 0 && (
                <li className="justify-between flex flex-col text-lg items-center font-medium">
                  <button
                    onClick={() => setIsMobileOffersOpen(!isMobileOffersOpen)}
                    className="flex items-center justify-center gap-1 px-4 py-2 cursor-pointer w-full  transition-all duration-300"
                  >
                    Promotions
                    <ChevronDown
                      className={`transition-transform duration-300 ${
                        isMobileOffersOpen ? "rotate-180" : ""
                      }`}
                      size={18}
                    />
                  </button>

                  <AnimatePresence>
                    {isMobileOffersOpen && (
                      <motion.ul
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        className="w-full"
                      >
                        {offerNavitems.map((offer, index) => (
                          <motion.li
                            key={index}
                            variants={staggerItem}
                            className="w-full flex justify-center"
                          >
                            <Link href={offer.link} className="w-full">
                              <span
                                className="block px-4 py-2 text-center cursor-pointer w-full transition-all duration-300 text-base opacity-80"
                                onClick={toggleMenu}
                              >
                                {offer.title}
                              </span>
                            </Link>
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              )}
            </nav>

            <div className="px-4 py-6 font-online-ordering">
              {myaccount ? (
                <>
                  <button
                    onClick={() => {
                      handleLogOut();
                      closeMenu();
                    }}
                    className="w-full flex items-center justify-center space-x-2 text-gray-600 py-3"
                  >
                    <MdAccountCircle size={28} />
                    <span>Log Out</span>
                  </button>
                  {cartCountInfo > 0 ? (
                    <Link href={`/menu/cart`} passHref>
                      <button
                        className="w-full bg-primary text-white px-4 py-3 rounded-full flex items-center justify-center space-x-2"
                        style={{
                          color: isContrastOkay(
                            Env.NEXT_PUBLIC_PRIMARY_COLOR,
                            Env.NEXT_PUBLIC_BACKGROUND_COLOR
                          )
                            ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                            : Env.NEXT_PUBLIC_TEXT_COLOR,
                        }}
                      >
                        <FaCartShopping
                          size={18}
                          style={{
                            color: isContrastOkay(
                              Env.NEXT_PUBLIC_PRIMARY_COLOR,
                              Env.NEXT_PUBLIC_BACKGROUND_COLOR
                            )
                              ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                              : Env.NEXT_PUBLIC_TEXT_COLOR,
                          }}
                        />
                        <span
                          style={{
                            color: isContrastOkay(
                              Env.NEXT_PUBLIC_PRIMARY_COLOR,
                              Env.NEXT_PUBLIC_BACKGROUND_COLOR
                            )
                              ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                              : Env.NEXT_PUBLIC_TEXT_COLOR,
                          }}
                        >
                          {cartCountInfo > 0
                            ? `${cartCountInfo} items`
                            : "VIEW CART (0)"}
                        </span>
                      </button>
                    </Link>
                  ) : null}
                </>
              ) : (
                <div className="space-y-4">
                  {meCustomerData ? (
                    <Link href={`/menu/my-account`} passHref>
                      <div
                        className="flex items-center justify-center space-x-2 text-gray-600 py-3"
                        onClick={closeMenu}
                      >
                        <MdAccountCircle size={28} />
                        <span>{meCustomerData.firstName}</span>
                      </div>
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setSignInOpen(true);
                        closeMenu();
                      }}
                      className="w-full font-online-ordering text-xl font-medium py-3"
                    >
                      Sign In
                    </button>
                  )}
                  {cartCountInfo > 0 ? (
                    <Link href={`/menu/cart`} passHref>
                      <button
                        className="w-full bg-primary text-white px-4 py-3 rounded-full flex items-center justify-center space-x-2"
                        style={{
                          color: isContrastOkay(
                            Env.NEXT_PUBLIC_PRIMARY_COLOR,
                            Env.NEXT_PUBLIC_BACKGROUND_COLOR
                          )
                            ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                            : Env.NEXT_PUBLIC_TEXT_COLOR,
                        }}
                      >
                        <FaCartShopping
                          size={18}
                          style={{
                            color: isContrastOkay(
                              Env.NEXT_PUBLIC_PRIMARY_COLOR,
                              Env.NEXT_PUBLIC_BACKGROUND_COLOR
                            )
                              ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                              : Env.NEXT_PUBLIC_TEXT_COLOR,
                          }}
                        />
                        <span
                          style={{
                            color: isContrastOkay(
                              Env.NEXT_PUBLIC_PRIMARY_COLOR,
                              Env.NEXT_PUBLIC_BACKGROUND_COLOR
                            )
                              ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                              : Env.NEXT_PUBLIC_TEXT_COLOR,
                          }}
                        >
                          {cartCountInfo > 0
                            ? `${cartCountInfo} items`
                            : "VIEW CART (0)"}
                        </span>
                      </button>
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
