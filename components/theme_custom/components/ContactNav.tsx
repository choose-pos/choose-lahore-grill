"use client";

import { formatUSAPhoneNumber } from "@/utils/UtilFncs";
import { Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";

interface ContactStripProps {
  email?: string;
  phone?: string;
}

export default function ContactNav({ email, phone }: ContactStripProps) {
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

  // Don't render if no contact info
  if (!email && !phone) return null;

  return (
    <div
      className={`hidden md:block bg-primaryColor w-full text-white backdrop-blur-lg h-8 text-sm transition-all px-2 sm:px-16 xl:px-24 lg:px-12 duration-300 fixed top-0 left-0 right-0 z-50 ${
        isAtTop ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="w-full px-4 h-full flex items-center justify-center md:justify-between space-x-6">
        <div className="items-center space-x-2 hidden md:flex">
          <FaLocationDot className="text-white" />
          <p className="transition-colors text-xs">{`Marietta, Atlanta`}</p>
        </div>
        <div className="flex items-center space-x-2">
          {email && (
            <div className="flex items-center space-x-2">
              <Mail size={14} />
              <a href={`mailto:${email}`} className="transition-colors text-xs">
                {email}
              </a>
            </div>
          )}
          <span className="px-2">|</span>
          {phone && (
            <div className="flex items-center space-x-2">
              <Phone size={14} />
              <a href={`tel:${phone}`} className="transition-colors text-xs">
                {formatUSAPhoneNumber(phone)}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
