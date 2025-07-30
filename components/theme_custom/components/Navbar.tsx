"use client";

import NavDataStore from "@/store/navData";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { HiMenu } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import ContactNav from "./ContactNav";

interface INavProps {
  logo?: string;
  navItems: { name: string; link: string }[];
  email?: string;
  phone?: string;
}

const Navbar: React.FC<INavProps> = ({ logo, navItems, email, phone }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isButtonVisible, setIsButtonVisible] = useState<boolean>(false);
  const observerTargetRef = useRef<HTMLDivElement>(null);
  const { setNavData } = NavDataStore();

  const [isAtTop, setIsAtTop] = useState(true);

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
    const handleScroll = () => {
      const target = observerTargetRef.current;
      if (target) {
        const isPast120vh = window.scrollY > window.innerHeight * 0.45;
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
  };

  return (
    <>
      <div
        className={`fixed ${isAtTop ? "md:top-8" : "top-0"}  left-0 w-full px-2 !z-50  font-primary 
       h-20 md:h-24 grid place-items-center transition-all duration-300 ${isButtonVisible ? "bg-bg1" : "bg-transparent"}`}
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
                className={`w-full h-full object-contain`}
              />
            </Link>
          ) : null}

          <div className="h-full hidden xl:block">
            <ul className="flex text-xl text-gray-300">
              {navItems.map((item, index) => (
                <li
                  key={index}
                  className="justify-between flex flex-col text-xs items-center space-y-8 font-medium"
                >
                  <Link href={item.link}>
                    <span
                      className="block px-4 py-2 transition-all duration-300 cursor-pointer w-full hover:text-primaryColor/80 uppercasetext-bg3 hover:text-white"
                      // onClick={toggleMenu}
                    >
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Menu Button and Order Now grouped together */}
          <div className="flex items-center gap-4">
            <Link href="/menu" aria-label="Order Now Link">
              <button
                aria-label="Order Now"
                className={`md:px-6 px-4 py-1.5 md:py-2 text-base md:text-lg md:h-12 md:w-[180px] text-[20px] bg-primaryColor font-rubik font-medium  border rounded-[10px] text-white transition-opacity duration-500 ${
                  isButtonVisible ? "opacity-100" : "opacity-100"
                }`}
                // style={{ visibility: isButtonVisible ? "visible" : "hidden" }}
              >
                ORDER NOW
              </button>
            </Link>
            <div
              className="text-3xl cursor-pointer z-50 block xl:hidden"
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
        {/* Close button positioned in top right corner */}
        <div className="absolute top-6 right-6 text-3xl cursor-pointer">
          <IoMdClose color="white" onClick={toggleMenu} />
        </div>

        <div className="flex flex-col h-full pt-24">
          <ul className="flex flex-col text-xl text-gray-300">
            {navItems.map((item, index) => (
              <li
                key={index}
                className="justify-between flex flex-col text-lg items-center space-y-8 font-medium"
              >
                <Link
                  href={
                    item.name === "Our Specialities"
                      ? "/#our-specialities-mobile"
                      : item.link
                  }
                  target={item.name == "Bar Menu" ? "_blank" : "_self"}
                >
                  <span
                    className="block px-4 py-2 transition-all duration-300 cursor-pointer w-full hover:text-primaryColor/80 uppercasetext-bg3 hover:text-white"
                    onClick={toggleMenu}
                  >
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div ref={observerTargetRef} style={{ height: "1px" }} />
    </>
  );
};

export default Navbar;
