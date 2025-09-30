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
      className={`flex items-center justify-center w-full md:h-16 bg-gray-100 mt-auto font-online-ordering`}
    >
      <div
        className={`max-w-8xl flex flex-col items-center justify-center w-full px-6 md:px-20 lg:px-28`}
      >
        {/* Footer Bottom Section */}
        <div
          className={`flex flex-col md:flex-row justify-between items-center w-full h-full gap-4 sm:gap-0
          ${isProfile ? "md:pb-0 pb-5" : "md:pb-0 pb-5"}
          `}
        >
          {/* Social Icons */}
          <div className="flex items-center space-x-4 pt-2 md:pt-0">
            {restaurantData?.socialInfo?.facebook && (
              <Link target="_blank" href={restaurantData.socialInfo.facebook}>
                <FaFacebook className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer text-gray-700 hover:text-gray-900 transition-colors duration-200" />
              </Link>
            )}
            {restaurantData?.socialInfo?.instagram && (
              <Link target="_blank" href={restaurantData.socialInfo.instagram}>
                <FaInstagram className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer text-gray-700 hover:text-gray-900 transition-colors duration-200" />
              </Link>
            )}
          </div>

          <p className="text-sm lg:py-0 text-center">
            {restaurantData?.name} {new Date().getFullYear()} All Rights
            Reserved
          </p>

          <div className="flex items-center">
            <span className="text-gray-700 text-xs sm:text-lg mr-2 font-online-ordering">
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
      </div>
    </div>
  );
};

export default Footer;
