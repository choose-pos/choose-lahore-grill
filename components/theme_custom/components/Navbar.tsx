"use client";

import NavDataStore from "@/store/navData";
import { fadeIn } from "@/utils/motion";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { HiMenu } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import ContactNav from "./ContactNav";
import { ChevronDown } from "lucide-react";
import Button from "@/components/common/Button";
import { cookieKeys } from "@/constants";
import meCustomerStore from "@/store/meCustomer";
import { sdk } from "@/utils/graphqlClient";

interface INavProps {
  logo?: string;
  navItems: { name: string; link: string }[];
  email?: string;
  phone?: string;
  offerNavTitles?: { title: string; link: string }[];
  giftCardEnabled: boolean;
}

const Navbar: React.FC<INavProps> = ({
  logo,
  navItems,
  email,
  phone,
  offerNavTitles,
  giftCardEnabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showOffersMobileMenu, setShowOffersMobileMenu] = useState(false);
  const [showMoreMobileMenu, setShowMoreMobileMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isButtonVisible, setIsButtonVisible] = useState<boolean>(false);
  const observerTargetRef = useRef<HTMLDivElement>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLLIElement>(null);
  const giftMoreMenuRef = useRef<HTMLLIElement>(null);
  const { setNavData } = NavDataStore();
  const { meCustomerData } = meCustomerStore();
  const [showBottomButton, setShowBottomButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setIsAtTop(scrollTop === 0);
    };

    // Set initial state
    handleScroll();

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleWindowScroll = () => {
      // Show bottom button if we have scrolled past 400px (approx height of mobile hero section)
      if (window.scrollY > 400) {
        setShowBottomButton(true);
      } else {
        setShowBottomButton(false);
      }
    };

    // Initial check
    handleWindowScroll();

    window.addEventListener("scroll", handleWindowScroll);

    return () => {
      window.removeEventListener("scroll", handleWindowScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setShowMoreMenu(false);
      }
      if (
        giftMoreMenuRef.current &&
        !giftMoreMenuRef.current.contains(event.target as Node)
      ) {
        setShowMoreMobileMenu(false);
      }
    };

    if (showMoreMenu || showMoreMobileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMoreMenu]);

  useEffect(() => {
    const handleScroll = () => {
      const target = observerTargetRef.current;
      if (target) {
        const isPast120vh = window.scrollY > window.innerHeight * 0.5;
        setIsButtonVisible(isPast120vh);
      }
    };

    if (pathname === "/") {
      window.addEventListener("scroll", handleScroll);
    } else {
      setIsButtonVisible(true);
    }

    return () => {
      if (pathname === "/") {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [pathname]);

  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    setNavData(navItems);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowOffersMobileMenu(false); // Reset mobile offers menu when opening sidebar
    }
  };

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

  return (
    <>
      <div
        className={`fixed ${isAtTop ? "md:top-8" : "top-0"} top-0 left-0 w-full px-2 !z-50 font-primary
       h-20 md:h-24 grid place-items-center transition-all duration-300 ${isButtonVisible ? "bg-primaryColor" : "bg-transparent"} `}
      >
        <ContactNav email={email} phone={phone} />
        <div className="flex justify-between items-center px-2 sm:px-16 xl:px-24 lg:px-12 w-full max-w-8xl mx-auto">
          {logo !== "" ? (
            <Link
              href={"/"}
              prefetch={false}
              passHref
              className="relative w-24 md:!w-[170px] !h-[53px] min-w-[115px] min-h-[53px]"
            >
              <Image
                src={logo || ""}
                alt="logo"
                fill
                sizes={""}
                className="w-full h-full object-contain"
              />
            </Link>
          ) : null}
          <div className="h-full hidden lg:block ">
            <ul className="flex text-xl text-gray-300">
              {navItems.map((item, index) =>
                item.name === "Gallery" ? null : (
                  <li
                    key={index}
                    className="justify-between flex flex-col text-lg items-center space-y-8 font-medium"
                  >
                    <Link href={item.link}>
                      <span className="block px-4 py-2 text-sm xl:text-lg transition-all duration-300 cursor-pointer w-full uppercasetext-bg3 hover:text-white">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                ),
              )}
              {offerNavTitles && offerNavTitles?.length > 0 && (
                <li ref={moreMenuRef} className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMoreMenu(!showMoreMenu);
                      setShowMoreMobileMenu(false);
                    }}
                    className="flex items-center gap-1 px-4 py-2 text-sm xl:text-lg text-gray-300 hover:text-white font-medium"
                  >
                    Promotions
                    <ChevronDown
                      className={`transition-transform duration-300 text-gray-300 hover:text-white ${
                        showMoreMenu ? "rotate-180" : ""
                      }`}
                      size={18}
                    />
                  </button>
                  <AnimatePresence>
                    {showMoreMenu && (
                      <motion.ul
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        className="absolute right-0 mt-2 bg-bg1 border border-gray-700 rounded-md shadow-md z-50 w-48 py-2"
                      >
                        {offerNavTitles.map((item, index) => (
                          <motion.li
                            key={index}
                            variants={staggerItem}
                            className="w-full"
                          >
                            <Link href={item.link}>
                              <span
                                className="block px-4 py-2 text-sm text-gray-300 hover:text-white transition-all"
                                onClick={() => setShowMoreMenu(false)}
                              >
                                {item.title}
                              </span>
                            </Link>
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              )}
              <li ref={giftMoreMenuRef} className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoreMobileMenu(!showMoreMobileMenu);
                    setShowMoreMenu(false);
                  }}
                  className="flex items-center gap-1 px-4 py-2 text-sm xl:text-lg text-gray-300 hover:text-white font-medium"
                >
                  More
                  <ChevronDown
                    className={`transition-transform duration-300 text-gray-300 hover:text-white ${
                      showMoreMobileMenu ? "rotate-180" : ""
                    }`}
                    size={18}
                  />
                </button>
                <AnimatePresence>
                  {showMoreMobileMenu && (
                    <motion.ul
                      variants={staggerContainer}
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                      className="absolute right-0 mt-2 bg-primaryColor border border-gray-700 rounded-md shadow-md z-50 w-48 py-2"
                    >
                      <motion.li variants={staggerItem} className="w-full">
                        <Link
                          href={
                            meCustomerData
                              ? "/menu/my-account?tab=giftcards"
                              : "/gift-cards"
                          }
                        >
                          <span
                            className="block px-4 py-2 text-sm text-gray-300 hover:text-white transition-all"
                            onClick={() => setShowMoreMobileMenu(false)}
                          >
                            Gift Card
                          </span>
                        </Link>
                      </motion.li>
                      <motion.li variants={staggerItem} className="w-full">
                        <Link href="/contact">
                          <span
                            className="block px-4 py-2 text-sm text-gray-300 hover:text-white transition-all"
                            onClick={() => setShowMoreMobileMenu(false)}
                          >
                            Contact Us
                          </span>
                        </Link>
                      </motion.li>
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            </ul>
          </div>

          {/* Menu Button and Order Now grouped together */}
          <div className="flex items-center gap-4">
            <Link href="/menu" aria-label="Order Now Link">
              <button
                aria-label="Order Now"
                className={`hidden lg:block md:px-6 px-4 py-2 md:h-12  md:w-[180px] text-[20px] bg-bg3 font-rubik font-medium  border rounded-[10px] text-bg1 transition-opacity duration-500`}
              >
                ORDER NOW
              </button>
            </Link>
            <div
              className="text-3xl lg:hidden cursor-pointer z-50"
              onClick={toggleMenu}
            >
              {!isOpen && <HiMenu color="white" />}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMenu}
        />
      )}

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-primaryColor font-primary shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close button positioned in top right corner - Fixed */}
        <div className="absolute top-6 right-6 text-3xl cursor-pointer z-10">
          <IoMdClose color="white" onClick={toggleMenu} />
        </div>

        <div className="flex flex-col h-full pt-20 overflow-y-auto">
          <motion.ul
            className="flex flex-col text-xl text-[#959090] pb-4"
            variants={fadeIn("up", "tween", 0.2, 0.2)}
            initial="hidden"
            whileInView="show"
          >
            {navItems.map((item, index) => (
              <li
                key={index}
                className="justify-between flex flex-col text-lg items-center  space-y-4 font-medium"
              >
                <Link
                  href={
                    item.name === "Best Sellers"
                      ? "/#our-specialities-mobile"
                      : item.link
                  }
                >
                  <span
                    className="block px-6 py-4 cursor-pointer w-full uppercase hover:text-bg3"
                    onClick={toggleMenu}
                  >
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}

            {giftCardEnabled && (
              <li className="justify-between flex flex-col text-lg items-center font-medium">
                <Link
                  href={
                    meCustomerData
                      ? "/menu/my-account?tab=giftcards"
                      : "/gift-cards"
                  }
                  className="w-full"
                >
                  <span
                    className="block px-6 py-4 cursor-pointer w-full uppercase hover:text-bg3 text-center"
                    onClick={toggleMenu}
                  >
                    Gift Card
                  </span>
                </Link>
              </li>
            )}

            {offerNavTitles && offerNavTitles.length > 0 && (
              <li className="justify-between flex flex-col text-lg items-center font-medium pb-16">
                <button
                  onClick={() => setShowOffersMobileMenu(!showOffersMobileMenu)}
                  className="flex items-center justify-center gap-1 px-6 py-4 cursor-pointer w-full uppercase hover:text-bg3 transition-all duration-300"
                >
                  Promotions
                  <ChevronDown
                    className={`transition-transform duration-300 ${
                      showOffersMobileMenu ? "rotate-180" : ""
                    }`}
                    size={18}
                  />
                </button>

                <AnimatePresence>
                  {showOffersMobileMenu && (
                    <motion.ul
                      variants={staggerContainer}
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                      className="w-full"
                    >
                      {offerNavTitles.map((offer, index) => (
                        <motion.li
                          key={index}
                          variants={staggerItem}
                          className="w-full flex justify-center"
                        >
                          <Link href={offer.link} className="w-full">
                            <span
                              className="block px-6 py-4 text-center cursor-pointer w-full uppercase hover:text-bg3 transition-all duration-300 text-base opacity-80"
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
          </motion.ul>
        </div>
      </div>
      <div ref={observerTargetRef} style={{ height: "1px" }} />
      {(showBottomButton || isOpen) && pathname !== "/gift-cards" && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] lg:hidden bg-white px-4 py-3">
          <Button text="Order Now" url="/menu" fullWidth={true} />
        </div>
      )}
    </>
  );
};

export default Navbar;
