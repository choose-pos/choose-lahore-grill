import RestaurantStore from "@/store/restaurant";
import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import Logo from "../assets/logoDark.png";

interface FooterProps {
  isProfile?: boolean;
}

const Footer: React.FC<FooterProps> = ({ isProfile }) => {
  const { restaurantData } = RestaurantStore();

  return (
    <div
      className={`flex items-center justify-center w-full py-6 bg-gray-100 mt-auto font-subheading-oo`}
    >
      <div
        className={`max-w-8xl flex flex-col w-full px-6 md:px-20 lg:px-28 gap-4`}
      >
        {/* Top Row */}
        <div className="flex justify-between items-center w-full">
          {/* Social Icons */}
          <div className="flex items-center space-x-4">
            {restaurantData?.socialInfo?.instagram && (
              <Link target="_blank" href={restaurantData.socialInfo.instagram}>
                <FaInstagram className="h-5 w-5 cursor-pointer text-black hover:opacity-85 transition-opacity" />
              </Link>
            )}
            {restaurantData?.socialInfo?.facebook && (
              <Link target="_blank" href={restaurantData.socialInfo.facebook}>
                <FaFacebook className="h-5 w-5 cursor-pointer text-black hover:opacity-85 transition-opacity" />
              </Link>
            )}
          </div>

          {/* Powered By */}
          <div className="flex items-center">
            <span className="text-black text-xs sm:text-sm mr-2 font-medium">
              Powered by
            </span>
            <Link
              href={`https://www.choosepos.com/?utm_source=${restaurantData?.name}&utm_medium=restaurant&utm_campaign=partner`}
              target="_blank"
            >
              <Image
                src={Logo}
                alt="LOGO"
                className="w-20 sm:w-24 h-5 sm:h-6"
              />
            </Link>
          </div>
        </div>

        {/* Divider Line */}
        <hr className="w-full border-black/20" />

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-2 sm:gap-0">
          <Link
            href="/terms-policies"
            className="text-xs sm:text-sm text-black hover:underline underline-offset-4"
          >
            Terms & Policies
          </Link>
          <p className="text-xs sm:text-sm text-black text-center">
            {restaurantData?.name} {new Date().getFullYear()} All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
