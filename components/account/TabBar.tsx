import {
  DiscountType,
  GiftCardDesign,
  OrderDiscountType,
  OrderStatus,
  OrderType,
  PriceTypeEnum,
  PromoDiscountType,
  TransactionType,
  UpdateCustomerDetailsInput,
} from "@/generated/graphql";
import RestaurantStore from "@/store/restaurant";
import ToastStore from "@/store/toast";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { PointsRedemption, RestaurantRedeemOffers } from "@/utils/types";
import React, { useEffect, useState } from "react";
import { FaExclamationCircle, FaShoppingCart, FaSpinner } from "react-icons/fa";
// import React, { useState, useEffect } from 'react';
// import { FaSpinner, FaExclamationCircle, FaShoppingCart } from 'react-icons/fa';
import { Card, CardContent } from "@/components/ui/card";
import {
  calculateTotalModifiersPrice,
  extractErrorMessage,
  formattedNumber,
  isRewardApplied,
} from "@/utils/UtilFncs";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoyaltyRedeemType } from "@/generated/graphql";

import { Env } from "@/env";
import { useCartStore } from "@/store/cart";
import { useModalStore } from "@/store/global";
import meCustomerStore, { CustomerNew } from "@/store/meCustomer";
import { convertToRestoTimezone } from "@/utils/formattedTime";
import LoyaltyPointHistory from "./LoyaltyPointHistory";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { refreshCartCount } from "@/utils/getCartCountData";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { refreshCartDetails } from "@/utils/refreshCartDetails";
import { format, getYear } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Icon from "../../assets/StarIcon2.svg";

interface TabProps {
  onTabChange: (tab: string) => void;
  showGiftCards?: boolean;
  initialTab?: string;
}

export const StickyTabbar: React.FC<TabProps> = ({
  onTabChange,
  showGiftCards = false,
  initialTab = "Rewards",
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onTabChange(tab);
  };
  const tabs = ["Rewards", "Profile", "Orders", "eGift Card"];

  return (
    <div className="  sticky md:top-24 top-20 left-0 z-10 w-full md:w-auto">
      <div className="hidden md:block top-32 left-0 bg-white shadow-lg rounded-md z-10 mb-4 w-[320px]">
        <div className="flex flex-col justify-between items-start py-4 px-4">
          <div className="flex flex-col items-start space-y-2 w-full mt-4">
            {tabs.map((tab, index) => (
              <div key={index} className="w-full">
                <button
                  onClick={() => handleTabClick(tab)}
                  className={`px-4 py-2 rounded-md w-full text-start text-xl  ${
                    activeTab === tab
                      ? "bg-primaryColor text-white"
                      : "text-gray-500 hover:bg-bgGray"
                  }`}
                  style={
                    activeTab === tab
                      ? {
                          color: isContrastOkay(
                            Env.NEXT_PUBLIC_PRIMARY_COLOR,
                            "#ffffff",
                          )
                            ? "#ffffff"
                            : "#000000",
                        }
                      : {}
                  }
                >
                  {tab}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="md:hidden font-body-oo z-20 bg-white shadow-sm border border-gray-100 rounded-lg mb-3 mx-auto p-1">
        <div className="flex w-full items-center justify-between">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(tab)}
              className={`flex-1 py-2 text-center rounded-md font-semibold font-subheading-oo text-[15px] transition-colors ${
                activeTab === tab
                  ? "bg-primary border-primary shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 bg-transparent"
              }`}
              style={
                activeTab === tab
                  ? {
                      backgroundColor: Env.NEXT_PUBLIC_PRIMARY_COLOR,
                      color: isContrastOkay(
                        Env.NEXT_PUBLIC_PRIMARY_COLOR,
                        "#ffffff",
                      )
                        ? "#ffffff"
                        : "#000000",
                    }
                  : {}
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface RewardsProps {
  offers: RestaurantRedeemOffers | null;
  balance: number;
  name: string;
  desc: string;
}

export const RewardsContent: React.FC<RewardsProps> = ({
  offers,
  balance,
  name,
  desc,
}) => {
  const { setToastData } = ToastStore();
  const router = useRouter();
  const { cartDetails, setCartDetails, cartCountInfo } = useCartStore();
  const { setShowMenu, setClickState } = useModalStore();

  const [cartCount, setCartCount] = useState<number>(0);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await refreshCartDetails();
        const res2 = await refreshCartCount();
        if (res?.CartDetails) {
          setCartDetails(res.CartDetails);
        }
        if (res2) {
          setCartCount(res2);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetch();
  }, []);

  const isOrderTypeAndScheduleSet = (): boolean => {
    if (!cartDetails?.orderType) return false;

    const scheduleTime =
      cartDetails.orderType === OrderType.Pickup
        ? cartDetails.pickUpDateAndTime
        : cartDetails.deliveryDateAndTime;

    if (!scheduleTime) return false;

    // Schedule time has expired
    if (new Date() > new Date(scheduleTime)) return false;

    return true;
  };

  const handleSave = async (
    points: number,
    type: any,
    itemRedemptionId?: string,
  ) => {
    if (!isOrderTypeAndScheduleSet()) {
      setClickState({
        type: "loyalty",
        points,
        redeemType: type,
        itemRedemptionId,
      });
      setShowMenu(false);
      return;
    }

    try {
      const res = await fetchWithAuth(() =>
        sdk.validateLoyaltyRedemptionOnCart({
          input: {
            loyaltyPointsRedeemed: points,
            redeemType: type,
            itemRedemptionId,
          },
        }),
      );
      if (res.validateLoyaltyRedemptionOnCart) {
        router.push(`/menu/cart`);
      }
    } catch (error) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    }
  };

  const renderDiscount = (reward: PointsRedemption) => {
    if (reward.discountType === DiscountType.Percentage) {
      if (reward.uptoAmount) {
        return `${reward.discountValue}% off Upto $${reward.uptoAmount} for ${reward.pointsThreshold} ${name}`;
      }
      return `${reward.discountValue}% off for ${reward.pointsThreshold} ${name}`;
    } else {
      return `$${reward.discountValue} off for ${reward.pointsThreshold} ${name}`;
    }
  };

  const getRewardDescription = (reward: any) => {
    if (balance < reward.points)
      return `To avail, you need ${
        reward.points - balance
      } more ${name.toLowerCase()}.`;
    return "Congrats! You may redeem this offer at checkout.";
  };

  const RewardCard: React.FC<{
    title: string;
    points: number;
    description?: string;
    type: any;
    reward: any;
  }> = ({ title, points, description, type, reward }) => {
    const [isCurrentLoading, setIsCurrentLoading] = useState(false);

    const handleClick = async () => {
      setIsCurrentLoading(true);
      try {
        await handleSave(
          points,
          type === "item" ? LoyaltyRedeemType.Item : LoyaltyRedeemType.Discount,
          type === "item" ? reward.itemRedemptionId : undefined,
        );
      } finally {
        setIsCurrentLoading(false);
      }
    };

    return (
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="w-full"
      >
        {/* <Card className="bg-white shadow-lg transition-all duration-300 h-auto sm:h-[180px] rounded-[20px]">
          <CardContent className="py-5 px-5 relative h-full flex flex-col justify-between">
            <div className="flex flex-col items-start space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 line-clamp-2">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">{description}</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mt-2 gap-2">
              <div className="flex items-center space-x-2 bg-bgGray rounded-full px-3 py-1">
                <Image
                  src={Icon}
                  className="w-4 h-4 sm:w-5 sm:h-5 object-cover"
                  alt="icon"
                />
                <span className="text-base sm:text-lg font-semibold">
                  {points}
                </span>
              </div>
              {balance >= points ? (
                <p
                  onClick={handleClick}
                  className={`text-xs sm:text-sm px-2 py-1 flex items-center space-x-1 ${
                    isCurrentLoading
                      ? "opacity-50 cursor-default"
                      : "cursor-pointer hover:underline underline-offset-1"
                  }`}
                >
                  {isRewardApplied(
                    points,
                    type === "item"
                      ? LoyaltyRedeemType.Item
                      : LoyaltyRedeemType.Discount,
                    cartDetails
                  ) ? (
                    <>
                      <span>View cart</span>
                      <ArrowRight className="w-4" />
                    </>
                  ) : isCurrentLoading ? (
                    <span className="text-gray-600">Loading...</span>
                  ) : type === "item" ? (
                    <>
                      <span>redeem</span>
                      <ArrowRight className="w-4" />
                    </>
                  ) : (type === "FixedAmount" || type === "Percentage") &&
                    cartCount > 0 ? (
                    <>
                      <span>redeem</span>
                      <ArrowRight className="w-4" />
                    </>
                  ) : null}
                </p>
              ) : (
                <p className="text-xs sm:text-sm px-2 py-1 text-gray-600">
                  Not enough points
                </p>
              )}
            </div>
          </CardContent>
        </Card> */}
        <Card className="bg-white shadow-lg transition-all duration-300 h-auto sm:h-[180px] rounded-md">
          <CardContent className="py-5 px-5 relative h-full flex flex-col justify-between">
            <div className="flex items-start gap-3">
              {reward.image && (
                <div className="w-14 h-14 rounded-md overflow-hidden shrink-0 relative">
                  <Image
                    src={reward.image}
                    alt={title}
                    fill
                    sizes="48px"
                    style={{ objectFit: "cover" }}
                    priority
                  />
                </div>
              )}
              <div className="flex flex-col items-start space-y-2">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 line-clamp-2 font-subheading-oo">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 font-body-oo">
                  {description}
                </p>
              </div>
            </div>
            <div className="flex  justify-between items-start sm:items-center w-full mt-2 gap-2">
              <div className="flex items-center space-x-2 bg-bgGray rounded-md px-3 py-1">
                <Image
                  src={Icon}
                  className="w-4 h-4 sm:w-5 sm:h-5 object-cover"
                  alt="icon"
                />
                <span className="text-base sm:text-lg font-semibold font-subheading-oo">
                  {points}
                </span>
              </div>
              {balance >= points ? (
                <p
                  onClick={handleClick}
                  className={`text-xs sm:text-sm px-2 py-1 flex items-center space-x-1 ${
                    isCurrentLoading
                      ? "opacity-50 cursor-default"
                      : "cursor-pointer hover:underline underline-offset-1"
                  }`}
                >
                  {isRewardApplied(
                    points,
                    type === "item"
                      ? LoyaltyRedeemType.Item
                      : LoyaltyRedeemType.Discount,
                    cartDetails,
                    reward.itemName,
                  ) ? (
                    <>
                      <span>View cart</span>
                      <ArrowRight className="w-4" />
                    </>
                  ) : isCurrentLoading ? (
                    <span className="text-gray-600">Loading...</span>
                  ) : type === "item" ? (
                    <>
                      <span>redeem</span>
                      <ArrowRight className="w-4" />
                    </>
                  ) : (type === "FixedAmount" || type === "Percentage") &&
                    cartCount > 0 ? (
                    <>
                      <span>redeem</span>
                      <ArrowRight className="w-4" />
                    </>
                  ) : null}
                </p>
              ) : (
                <p className="text-xs sm:text-sm px-2 py-1 text-gray-600">
                  Not enough points
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const allRewards = [
    ...(offers?.itemRedemptions ?? []).map((reward) => ({
      key: reward._id,
      itemRedemptionId: reward._id,
      itemName: reward.item.name,
      title: `Free ${reward.item.name} for ${reward.pointsThreshold} ${name}`,
      points: reward.pointsThreshold,
      type: "item",
      discountValue: null,
      uptoAmount: null,
      image: reward.item.image ?? null,
    })),
    ...(offers?.pointsRedemptions ?? []).map((reward) => ({
      key: reward._id,
      title: renderDiscount(reward),
      points: reward.pointsThreshold,
      type: reward.discountType,
      discountValue: reward.discountValue,
      uptoAmount: reward.uptoAmount,
    })),
  ].sort((a, b) => a.points - b.points);

  return (
    <div className="py-4 sm:py-6 lg:px-12 xl:px-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-lg p-4 sm:p-6 mb-6 sm:mb-10 shadow-md border-[1px] border-gray-100">
        <div className="w-full sm:w-auto mb-4 sm:mb-0">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2 font-subheading-oo">
            Your {name === "Points" ? "Reward Points" : name}
          </h2>
          <div className="flex items-center">
            <p className="text-base sm:text-lg text-gray-600 font-body-oo">
              {desc}
            </p>
          </div>
          <button
            onClick={() => setShowHistory(true)}
            className="mt-2 text-sm font-semibold text-gray-800 underline underline-offset-2 hover:opacity-80 font-body-oo"
          >
            View points history
          </button>
        </div>
        <div className="flex items-center rounded-md px-4 sm:px-6 py-2 sm:py-3 shadow-inner bg-bgGray w-full sm:w-auto justify-center">
          <Image
            src={Icon}
            className="w-6 h-6 sm:w-8 sm:h-8 mr-2 object-cover"
            alt="icon"
          />
          <span className="text-2xl sm:text-3xl font-semibold font-subheading-oo">
            {balance}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {allRewards.length > 0 ? (
          <>
            {allRewards.map((reward) => (
              <RewardCard
                key={reward.key}
                title={reward.title}
                points={reward.points}
                description={getRewardDescription(reward)}
                type={reward.type}
                reward={reward}
              />
            ))}
          </>
        ) : (
          <div className="w-full flex justify-start items-center col-span-2">
            <p className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 font-subheading-oo">
              No available rewards at the moment! please check back later.
            </p>
          </div>
        )}
      </div>

      <LoyaltyPointHistory
        open={showHistory}
        onClose={() => setShowHistory(false)}
        pointsName={name}
      />
    </div>
  );
};

export default RewardsContent;

interface ProfileContentProps {
  customerData: CustomerNew;
}

export const ProfileContent: React.FC<ProfileContentProps> = ({
  customerData,
}) => {
  const [profile, setProfile] = useState<CustomerNew>(customerData);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const { restaurantData } = RestaurantStore();
  const { setToastData } = ToastStore();
  const [dob, setDob] = useState<string>("");
  const [dobLocked, setDobLocked] = useState<boolean>(false);

  // Initialize DOB from customer data when component mounts
  useEffect(() => {
    if (customerData?.dob) {
      setDob(customerData.dob);
      setDobLocked(true);
    }
  }, [customerData]);

  const handleEmail = () => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      accountPreferences: {
        ...prevProfile.accountPreferences,
        email: !prevProfile.accountPreferences?.email,
        sms: prevProfile.accountPreferences?.sms ?? false,
      },
    }));
  };

  const handleSms = () => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      accountPreferences: {
        ...prevProfile.accountPreferences,
        sms: !prevProfile.accountPreferences?.sms,
        email: prevProfile.accountPreferences?.email ?? false,
      },
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const fetchCustomerData = async () => {
    try {
      setInitialLoading(true);
      const apiResp = await fetchWithAuth(() => sdk.meCustomer());

      if (!apiResp.meCustomer) {
        setToastData({
          message: "Something went wrong, please try again later!",
          type: "error",
        });
        return;
      }
      setProfile(apiResp.meCustomer);
      if (apiResp.meCustomer.dob) {
        setDob(apiResp.meCustomer.dob);
        setDobLocked(true);
      }
    } catch (error: any) {
      const err = extractErrorMessage(error);
      setToastData({ message: err, type: "error" });
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const inputData: UpdateCustomerDetailsInput = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        accountPreferences: {
          sms: profile.accountPreferences?.sms ?? false,
          email: profile.accountPreferences?.email ?? false,
        },
      };
      if (!dobLocked && dob.length > 0) {
        inputData.dob = new Date(dob).toISOString();
      }
      const res = await fetchWithAuth(() =>
        sdk.UpdateCustomerDetails({ input: inputData }),
      );
      if (res.updateCustomerDetails) {
        if (!dobLocked && dob.length > 0) {
          setDobLocked(true);
        }
        setToastData({ type: "success", message: "Account details updated!" });
      }
    } catch (error) {
      setToastData({ message: extractErrorMessage(error), type: "error" });
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-12 xl:px-20 flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-3xl text-gray-600" />
      </div>
    );
  }

  return (
    <div className="px-0 sm:px-6 lg:px-12 xl:px-20">
      <h2 className="text-3xl md:text-3xl font-semibold mb-3 md:mb-4 font-subheading-oo">
        Details
      </h2>
      <p className="mb-4 text-sm text-gray-600 font-body-oo">
        We use this information for communications and to make ordering quick
        and easy.
      </p>
      <form
        onSubmit={updateProfile}
        className="space-y-3 md:space-y-4 mt-6 sm:mt-2"
      >
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700 font-subheading-oo"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={profile.email || ""}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-sm font-body-oo"
          />
        </div>
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-semibold text-gray-700 font-subheading-oo"
          >
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            value={profile.firstName || ""}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-sm font-body-oo"
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-semibold text-gray-700 font-subheading-oo"
          >
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            value={profile.lastName || ""}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-sm font-body-oo"
          />
        </div>
        <div>
          <label
            htmlFor="dob"
            className="block text-sm font-semibold text-gray-700 font-subheading-oo"
          >
            Date of Birth
          </label>
          {dobLocked ? (
            <input
              id="dob"
              name="dob"
              value={
                dob.length === 0 ? "" : format(new Date(dob), "MMMM do, yyyy")
              }
              readOnly
              className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 shadow-sm focus:ring-opacity-50 py-2 px-3 text-sm font-body-oo"
            />
          ) : (
            <div className="mt-1">
              <DatePicker
                selectedDate={dob.length === 0 ? null : new Date(dob)}
                setDateFn={(date) => setDob(date.toISOString())}
                endYear={getYear(new Date()) - 18}
              />
              <p className="mt-1 text-xs text-gray-500 font-body-oo">
                Your date of birth can only be set once.
              </p>
            </div>
          )}
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-semibold text-gray-700 font-subheading-oo"
          >
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            value={profile.phone}
            readOnly
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 shadow-sm focus:ring-opacity-50 py-2 px-3 text-sm font-body-oo"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="emailOffers"
            checked={profile.accountPreferences?.email}
            onChange={handleEmail}
            className="h-4 w-4 accent-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
          />
          <label
            htmlFor="emailOffers"
            className="text-sm text-gray-700 font-body-oo"
          >
            Receive exclusive offers in your inbox
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="smsOffers"
            checked={profile.accountPreferences?.sms}
            onChange={handleSms}
            className="h-4 w-4 accent-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
          />
          <label
            htmlFor="smsOffers"
            className="text-sm text-gray-700 font-body-oo"
          >
            Receive special offers by text
          </label>
        </div>
        <p className="text-xs text-gray-500">
          By joining, you agree to receive updates from {restaurantData?.name}{" "}
          and our technology partner Choose, and accept our{" "}
          <Link
            href={"/terms-policies"}
            passHref
            className="inline-block"
          >
            <span className="underline font-semibold font-subheading-oo">{`Platform Terms`}</span>
          </Link>{" "}
          and{" "}
          <Link
            href={"https://www.choosepos.com/privacy-policy"}
            passHref
            className="inline-block"
          >
            <span className="underline font-semibold font-subheading-oo">{`Privacy Policy`}</span>
          </Link>
        </p>
        <br />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-1.5 md:py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold font-subheading-oo text-white bg-primary hover:bg-primary/70 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            color: isContrastOkay(
              Env.NEXT_PUBLIC_PRIMARY_COLOR,
              Env.NEXT_PUBLIC_BACKGROUND_COLOR,
            )
              ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
              : Env.NEXT_PUBLIC_TEXT_COLOR,
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <span>Saving...</span>
            </div>
          ) : (
            "Save"
          )}
        </button>
      </form>
    </div>
  );
};

export type Order = {
  createdAt: Date;
  orderType?: string | null;
  orderId: string | null;
  _id: string;
  taxRate?: number | null;
  totalAmount?: number;
  items: Items[];
  status?: string | null;
  systemRemark?: string;
  canBeReOrdered?: boolean;

  appliedDiscount?: {
    discountType: OrderDiscountType;
    discountAmount?: number | null;
    promoData?: {
      code: string;
      discountType: PromoDiscountType;
      discountValue?: number | null;
      uptoAmount?: number | null;
      discountItemName?: string | null;
    } | null;
    loyaltyData?: {
      loyaltyPointsRedeemed: number;
      redeemType: LoyaltyRedeemType;
      redeemItem?: {
        itemName: string;
        itemPrice: number;
        itemId: string;
      } | null;
      redeemDiscount?: {
        discountType: string;
        discountValue?: number | null;
      } | null;
    } | null;
  } | null;
  appliedGiftCard?: {
    giftCardCode: string;
    amountUsed: number;
  } | null;
};

export interface Modifier {
  modifierName: string;
  modifierPrice: number;
  qty: number;
  selectedNestedGroups?:
    | {
        nmgName: string;
        selectedNestedModifiers: {
          nestedModifierName: string;
          nestedModifierPrice: number;
          qty: number;
        }[];
      }[]
    | null;
}

export interface ModifierGroup {
  mgName: string;
  price?: number | null | undefined;
  selectedModifiers: Modifier[];
  pricingType: PriceTypeEnum | string;
}

export interface Items {
  itemPrice: number;
  itemRemarks?: string | null | undefined;
  qty: number;
  itemName: string;
  modifierGroups: ModifierGroup[];
}

export interface OrderById {
  _id: string;
  orderId: string | null;
  orderType?: OrderType | null;
  specialRemark?: string | null;
  taxAmount?: number | null;
  tipAmount?: number | null;
  thirdPartyTip: boolean | null;
  restaurantRemarks?: string | null;
  deliveryAmount?: number | null;
  subTotalAmount?: number | null;
  discountAmount?: number;
  refundAmount?: number;
  grossAmount?: number | null;
  platformFees?: number | null;
  finalAmount?: number | null;
  paymentMethod?: string | null;
  status?: string;
  systemRemark?: string;
  createdAt: string;
  pickUpDateAndTime?: string | null;
  deliveryDateAndTime?: string | null;
  loyaltyTransactions?:
    | {
        points: number;
        transactionType: TransactionType;
      }[]
    | null;
  appliedDiscount?: {
    discountType: OrderDiscountType;
    discountAmount?: number | null;
    promoData?: {
      code: string;
      discountType: PromoDiscountType;
      discountValue?: number | null;
      uptoAmount?: number | null;
      discountItemName?: string | null;
    } | null;
    loyaltyData?: {
      loyaltyPointsRedeemed: number;
      redeemType: LoyaltyRedeemType;
      redeemItem?: {
        itemName: string;
        itemPrice: number;
        itemId: string;
      } | null;
      redeemDiscount?: {
        discountType: string;
        discountValue?: number | null;
      } | null;
    } | null;
  } | null;
  appliedGiftCard?: {
    giftCardCode: string;
    amountUsed: number;
  } | null;
  items: Items[];
  restaurantInfo: {
    name: string;
    address: {
      addressLine1: string;
    };
    phone: string;
  };
  guestData?: {
    phone: string;
  } | null;
  customerInfo?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
}

const calculateModifierPrice = (modifier: Modifier): number => {
  return modifier.modifierPrice * modifier.qty;
};

// const getOrderStatusDisplay = (status?: string) => {
//   switch (status) {
//     case OrderStatus.Placed:
//       return { text: "Placed", color: "text-blue-600 bg-blue-100" };
//     case OrderStatus.Processing:
//       return { text: "Processing", color: "text-yellow-600 bg-yellow-100" };
//     case OrderStatus.Fulfilled:
//       return { text: "Fulfilled", color: "text-green-600 bg-green-100" };
//     case OrderStatus.Scheduled:
//       return { text: "Scheduled", color: "text-purple-600 bg-purple-100" };
//     case OrderStatus.Failed:
//       return { text: "Failed", color: "text-red-600 bg-red-100" };
//     case OrderStatus.CancelledFullRefund:
//       return {
//         text: "Cancelled (Full Refund)",
//         color: "text-gray-600 bg-gray-100",
//       };
//     case OrderStatus.CancelledPartialRefund:
//       return {
//         text: "Cancelled (Partial Refund)",
//         color: "text-gray-600 bg-gray-100",
//       };
//     case OrderStatus.CancelledLoyaltyRefund:
//       return {
//         text: "Cancelled (Loyalty Refund)",
//         color: "text-gray-600 bg-gray-100",
//       };
//     default:
//       return { text: "Unknown", color: "text-gray-600 bg-gray-100" };
//   }
// };

export type OwnedGiftCard = {
  _id: string;
  code: string;
  amount: number;
  remainingAmount?: number | null;
  design: GiftCardDesign;
  recipientInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  sendToSelf: boolean;
  note?: string | null;
  expiryDate?: string | null;
  scheduledSendAt?: string | null;
  createdAt: string;
  isActive: boolean;
  status: string;
  loyaltyPointsEarned?: number | null;
  usageHistory: Array<{
    shortOrderId?: string | null;
    amountUsed: number;
    usedAt?: string | null;
  }>;
};

type UnifiedOrderItem = { type: "order"; data: Order; createdAt: Date };

export const OrdersContent: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const { setToastData } = ToastStore();
  const { restaurantData } = RestaurantStore();
  const { meCustomerData } = meCustomerStore();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 3;
  const { setSpecialRemarks } = useCartStore();

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        setIsLoading(true);
        const ordersRes = await fetchWithAuth(() => sdk.fetchCustomerOrders());
        setOrders(ordersRes.fetchCustomerOrders || []);
      } catch (error) {
        setError("Failed to fetch orders. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderHistory();
  }, []);

  const unifiedItems: UnifiedOrderItem[] = orders
    .map(
      (o): UnifiedOrderItem => ({
        type: "order",
        data: o,
        createdAt: new Date(o.createdAt),
      }),
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const openModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowModal(true);
  };

  const reOrder = async (orderId: string) => {
    try {
      setModalLoading(true);
      const res = await fetchWithAuth(() =>
        sdk.reorderItemsToCart({ orderId: orderId }),
      );

      if (res.reorderItemsToCart?.success) {
        if (res.reorderItemsToCart?.specialMessage) {
          setSpecialRemarks(res.reorderItemsToCart.specialMessage);
        }
        setToastData({
          type: "success",
          message: "Successfully added items to cart",
        });
        router.push("/menu/cart");
      }
    } catch (error) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    } finally {
      setModalLoading(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(unifiedItems.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentUnifiedItems = unifiedItems.slice(
    indexOfFirstOrder,
    indexOfLastOrder,
  );

  const changePage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const PaginationControls = () => {
    if (unifiedItems.length <= ordersPerPage) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`p-2 rounded-full ${
            currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          aria-label="Previous page"
        >
          <IoIosArrowBack size={20} />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => changePage(1)}
              className="px-3 py-1 rounded-md hover:bg-gray-100"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
          </>
        )}

        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => changePage(number)}
            className={`px-3 py-1 rounded-md ${
              currentPage === number
                ? "bg-primary text-white"
                : "hover:bg-gray-100"
            }`}
            style={
              currentPage === number
                ? {
                    color: isContrastOkay(
                      Env.NEXT_PUBLIC_PRIMARY_COLOR,
                      Env.NEXT_PUBLIC_BACKGROUND_COLOR,
                    )
                      ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                      : Env.NEXT_PUBLIC_TEXT_COLOR,
                    backgroundColor: Env.NEXT_PUBLIC_PRIMARY_COLOR,
                  }
                : undefined
            }
          >
            {number}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-2 text-gray-500">...</span>
            )}
            <button
              onClick={() => changePage(totalPages)}
              className="px-3 py-1 rounded-md hover:bg-gray-100"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-full ${
            currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          aria-label="Next page"
        >
          <IoIosArrowForward size={20} />
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-12 xl:px-20 flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-3xl text-gray-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-12 xl:px-20 flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <FaExclamationCircle className="mx-auto text-3xl mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (unifiedItems.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-12 xl:px-20 flex items-center justify-center h-64">
        <div className="text-center text-gray-600">
          <FaShoppingCart className="mx-auto text-3xl mb-2" />
          <p className="text-sm">
            No orders yet. Start shopping to see your order history!
          </p>
        </div>
      </div>
    );
  }



  return (
    <div className="lg:px-12 xl:px-20">
      <div className="w-full">
        <div className="space-y-4 sm:space-y-6 w-full">
          {currentUnifiedItems.map((item, index) => {
            // Regular order
            const order = item.data;
            return (
              <div
                key={`order-${order._id}`}
                className="flex flex-col lg:flex-row gap-4 transition-shadow duration-300 relative bg-white border rounded-lg shadow-md border-gray-300 sm:p-6 p-4"
              >
                {/* Status Badge - Top Right */}
                {/* <div
                className={`absolute  ${
                  order.status === OrderStatus.Failed &&
                  order.systemRemark !== ""
                    ? "top-4 right-4 md:top-7 md:right-7"
                    : "top-4 right-4 "
                }`}
              >
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                    getOrderStatusDisplay(order.status ?? "").color
                  }`}
                >
                  {getOrderStatusDisplay(order.status ?? "").text}
                </span>
              </div> */}

                {/* Left Column - Order Info */}
                <div className="w-full lg:w-1/4 grid grid-cols-2  sm:grid-cols-2 lg:grid-cols-1 gap-4 pr-4">
                  <div className="space-y-2">
                    <div className="text-base text-gray-600 font-body-oo">
                      Date:
                    </div>
                    <span className="text-base lg:text-lg font-semibold font-subheading-oo">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-base text-gray-600 font-body-oo">
                      Order Id:
                    </div>
                    <span className="text-base lg:text-lg font-semibold font-subheading-oo">
                      {order.orderId}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-base text-gray-600 font-body-oo">
                      Order Type:
                    </div>
                    <span className="text-base lg:text-lg font-semibold font-subheading-oo">
                      {order.orderType}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-base text-gray-600 font-body-oo">
                      Total Amount:
                    </div>
                    <span className="text-base lg:text-lg font-semibold font-subheading-oo">
                      ${(order.totalAmount ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Right Column - Items & Action */}
                <div className="flex-1 flex flex-col pl-0 lg:pl-8 lg:border-l border-gray-200">
                  {/* Failure Reason Display */}
                  {/* {order.status === OrderStatus.Failed &&
                  order.systemRemark !== "" && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="text-sm font-medium text-red-800 mb-1">
                        Order Failed
                      </div>
                      <div className="text-sm text-red-700">
                        Reason: {order.systemRemark}
                      </div>
                    </div>
                  )} */}
                  {/* Items Section with Scroll */}
                  <div className="flex-1 mb-4">
                    <div className="text-base font-semibold text-gray-600 mb-2 font-subheading-oo">
                      Items (
                      {order.items.length +
                        (order.appliedDiscount?.promoData?.discountItemName
                          ? 1
                          : 0) +
                        (order.appliedDiscount?.loyaltyData?.redeemItem
                          ?.itemName
                          ? 1
                          : 0)}
                      )
                    </div>
                    <div className=" md:max-h-40 overflow-y-auto rounded-md border border-gray-100">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-1/2 py-3 text-base">
                              Item Name
                            </TableHead>
                            <TableHead className="text-center py-3 text-base">
                              Qty
                            </TableHead>
                            <TableHead className="text-right py-3 text-base">
                              Total
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.appliedDiscount?.promoData
                            ?.discountItemName ? (
                            <TableRow key={0}>
                              <TableCell className="py-3 w-1/2">
                                <span className="text-base font-semibold font-subheading-oo">
                                  {
                                    order.appliedDiscount.promoData
                                      .discountItemName
                                  }{" "}
                                  (Promo Item)
                                </span>
                              </TableCell>
                              <TableCell className="text-center py-3 text-base">
                                1
                              </TableCell>
                              <TableCell className="text-right py-3 text-base">
                                $
                                {(
                                  order.appliedDiscount.discountAmount ?? 0
                                ).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ) : null}
                          {order.appliedDiscount?.loyaltyData?.redeemItem
                            ?.itemName ? (
                            <TableRow key={1}>
                              <TableCell className="py-3 w-1/2">
                                <span className="text-base font-semibold font-subheading-oo">
                                  {
                                    order.appliedDiscount.loyaltyData.redeemItem
                                      ?.itemName
                                  }{" "}
                                  (Loyalty Redemption)
                                </span>
                              </TableCell>
                              <TableCell className="text-center py-3 text-base">
                                1
                              </TableCell>
                              <TableCell className="text-right py-3 text-base">
                                $
                                {(
                                  order.appliedDiscount.discountAmount ?? 0
                                ).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ) : null}
                          {order.items.map((item, itemIndex) => {
                            const finalPrice = item.qty * item.itemPrice;
                            return (
                              <TableRow key={itemIndex}>
                                <TableCell className="py-3 w-1/2">
                                  <span className="text-base font-semibold font-subheading-oo">
                                    {item.itemName}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center py-3 text-base">
                                  {item.qty}
                                </TableCell>
                                <TableCell className="text-right py-3 text-base">
                                  $
                                  {(
                                    (item.itemPrice +
                                      calculateTotalModifiersPrice(
                                        item.modifierGroups,
                                      )) *
                                    item.qty
                                  ).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-2 justify-end mt-auto">
                    {order.canBeReOrdered &&
                    (order?.totalAmount ?? 0) > 0 &&
                    order.items.length > 0 ? (
                      <button
                        className="px-6 py-2 bg-primary text-white rounded-md text-base transition-colors"
                        onClick={() => reOrder(order._id)}
                        style={{
                          color: isContrastOkay(
                            Env.NEXT_PUBLIC_PRIMARY_COLOR,
                            Env.NEXT_PUBLIC_BACKGROUND_COLOR,
                          )
                            ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                            : Env.NEXT_PUBLIC_TEXT_COLOR,
                        }}
                      >
                        Reorder
                      </button>
                    ) : null}

                    <button
                      className="px-6 py-2 bg-primary text-white rounded-md text-base transition-colors"
                      onClick={() => openModal(order._id)}
                      style={{
                        color: isContrastOkay(
                          Env.NEXT_PUBLIC_PRIMARY_COLOR,
                          Env.NEXT_PUBLIC_BACKGROUND_COLOR,
                        )
                          ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                          : Env.NEXT_PUBLIC_TEXT_COLOR,
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <PaginationControls />
      <OrderDetailsModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedOrderId(null);
        }}
        orderId={selectedOrderId}
      />
    </div>
  );
};

export const GiftCardsContent: React.FC = () => {
  const [giftCards, setGiftCards] = useState<OwnedGiftCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setToastData } = ToastStore();
  const { restaurantData } = RestaurantStore();
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 3;

  // Gift card usage modal state
  const [showGcModal, setShowGcModal] = useState(false);
  const [selectedGc, setSelectedGc] = useState<OwnedGiftCard | null>(null);

  const openGcModal = (gc: OwnedGiftCard) => {
    setSelectedGc(gc);
    setShowGcModal(true);
  };

  const closeGcModal = () => {
    setShowGcModal(false);
    setSelectedGc(null);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const res = await fetchWithAuth(() =>
          sdk
            .GetAllOwnedGiftCards()
            .catch(() => ({ getAllOwnedGiftCards: [] })),
        );
        setGiftCards(res.getAllOwnedGiftCards || []);
      } catch {
        setError("Failed to fetch gift cards. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const sortedCards = [...giftCards].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const totalPages = Math.ceil(sortedCards.length / cardsPerPage);
  const currentCards = sortedCards.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage,
  );

  const PaginationControls = () => {
    if (sortedCards.length <= cardsPerPage) return null;
    const pageNumbers: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pageNumbers.push(i);
    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={`p-2 rounded-full ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
        >
          <IoIosArrowBack size={20} />
        </button>
        {start > 1 && (
          <>
            <button
              onClick={() => setCurrentPage(1)}
              className="px-3 py-1 rounded-md hover:bg-gray-100"
            >
              1
            </button>
            {start > 2 && <span className="px-2 text-gray-500">...</span>}
          </>
        )}
        {pageNumbers.map((n) => (
          <button
            key={n}
            onClick={() => setCurrentPage(n)}
            className={`px-3 py-1 rounded-md ${currentPage === n ? "bg-primary text-white" : "hover:bg-gray-100"}`}
            style={
              currentPage === n
                ? {
                    backgroundColor: Env.NEXT_PUBLIC_PRIMARY_COLOR,
                    color: isContrastOkay(
                      Env.NEXT_PUBLIC_PRIMARY_COLOR,
                      Env.NEXT_PUBLIC_BACKGROUND_COLOR,
                    )
                      ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                      : Env.NEXT_PUBLIC_TEXT_COLOR,
                  }
                : undefined
            }
          >
            {n}
          </button>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && (
              <span className="px-2 text-gray-500">...</span>
            )}
            <button
              onClick={() => setCurrentPage(totalPages)}
              className="px-3 py-1 rounded-md hover:bg-gray-100"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-full ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
        >
          <IoIosArrowForward size={20} />
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-12 xl:px-20 flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-3xl text-gray-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-12 xl:px-20 flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <FaExclamationCircle className="mx-auto text-3xl mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (sortedCards.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-12 xl:px-20 flex items-center justify-center h-64">
        <div className="text-center text-gray-600">
          <p className="text-sm">No gift cards yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4 sm:space-y-6 w-full">
        {currentCards.map((gc) => (
          <div
            key={gc._id}
            className="flex flex-col lg:flex-row gap-4 transition-shadow duration-300 relative bg-white border rounded-lg shadow-md border-gray-300 sm:p-6 p-4"
          >
            {/* Left Column */}
            <div className="w-full lg:w-1/4 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-4 pr-4">
              <div className="space-y-2">
                <div className="text-base text-gray-600 font-body-oo">
                  Date:
                </div>
                <span className="text-base lg:text-lg font-semibold font-subheading-oo">
                  {new Date(gc.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="space-y-2">
                <div className="text-base text-gray-600 font-body-oo">
                  Gift Card Code:
                </div>
                <span className="text-base lg:text-lg font-semibold font-subheading-oo">
                  {gc.code}
                </span>
              </div>
              <div className="space-y-2">
                <div className="text-base text-gray-600 font-body-oo">
                  Type:
                </div>
                <span className="text-base lg:text-lg font-semibold font-subheading-oo">
                  {gc.sendToSelf ? "Self" : "Gift"}
                </span>
                {gc.scheduledSendAt && (
                  <p className="text-sm text-gray-500 font-body-oo">
                    Scheduled:{" "}
                    {new Date(gc.scheduledSendAt).toLocaleDateString()}
                  </p>
                )}
                {gc.expiryDate && (
                  <p className="text-sm text-gray-500 font-body-oo">
                    Expires: {new Date(gc.expiryDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="flex-1 flex flex-col pl-0 lg:pl-8 lg:border-l border-gray-200">
              <div className="flex-1 mb-4">
                <div className="text-base font-semibold text-gray-600 mb-2 font-subheading-oo">
                  eGift Card Details
                </div>
                <div className="md:max-h-40 overflow-y-auto rounded-md border border-gray-100">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/2 py-3 text-base">
                          Detail
                        </TableHead>
                        <TableHead className="text-right py-3 text-base">
                          Value
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="py-3 w-1/2">
                          <span className="text-base font-semibold font-subheading-oo">
                            Amount
                          </span>
                        </TableCell>
                        <TableCell className="text-right py-3 text-base">
                          ${gc.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      {gc.sendToSelf && (
                        <TableRow>
                          <TableCell className="py-3 w-1/2">
                            <span className="text-base font-semibold font-subheading-oo">
                              Remaining
                            </span>
                          </TableCell>
                          <TableCell className="text-right py-3 text-base">
                            ${(gc.remainingAmount ?? gc.amount).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      )}
                      {!gc.sendToSelf && (
                        <TableRow>
                          <TableCell className="py-3 w-1/2">
                            <span className="text-base font-semibold font-subheading-oo">
                              Recipient
                            </span>
                          </TableCell>
                          <TableCell className="text-right py-3 text-base">
                            {gc.recipientInfo.firstName}{" "}
                            {gc.recipientInfo.lastName}
                          </TableCell>
                        </TableRow>
                      )}
                      {(gc.loyaltyPointsEarned ?? 0) > 0 && (
                        <TableRow>
                          <TableCell className="py-3 w-1/2">
                            <span className="text-base font-semibold font-subheading-oo">
                              Loyalty Points Earned
                            </span>
                          </TableCell>
                          <TableCell className="text-right py-3 text-base text-green-600 font-semibold font-subheading-oo">
                            +{gc.loyaltyPointsEarned}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className="flex justify-end mt-auto pt-2">
                {gc.sendToSelf && (
                  <button
                    className="px-6 py-2 bg-primary text-white rounded-md text-base transition-colors"
                    onClick={() => openGcModal(gc)}
                    style={{
                      color: isContrastOkay(
                        Env.NEXT_PUBLIC_PRIMARY_COLOR,
                        Env.NEXT_PUBLIC_BACKGROUND_COLOR,
                      )
                        ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                        : Env.NEXT_PUBLIC_TEXT_COLOR,
                    }}
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <PaginationControls />

      {/* Gift Card Usage Modal */}
      {showGcModal && selectedGc && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeGcModal();
          }}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] mx-auto md:w-full max-w-lg relative max-h-[90vh] overflow-y-scroll">
            <button
              className="absolute top-4 right-2 text-gray-600 hover:text-gray-900 border rounded-full p-1 bg-gray-200"
              onClick={closeGcModal}
            >
              <FiX size={16} />
            </button>
            <div className="font-body-oo text-sm">
              <div className="text-start mb-4">
                {/* <h3 className="text-xl md:text-2xl font-semibold font-subheading-oo">
                  Gift Card Details
                </h3> */}
                <p className="text-sm  mt-1 tracking-widest font-subheading-oo font-semibold">
                  {selectedGc.code}
                </p>
              </div>

              <div className="rounded-md border border-gray-100 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="py-3 text-xs w-1/3">
                        Order ID
                      </TableHead>
                      <TableHead className="py-3 text-xs text-center w-1/3">
                        Amount Used
                      </TableHead>
                      <TableHead className="py-3 text-xs text-right w-1/3">
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedGc.usageHistory.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="py-6 text-center text-gray-500"
                        >
                          No usage yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedGc.usageHistory.map((u, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="py-3 text-xs font-subheading-oo font-semibold">
                            {u.shortOrderId ?? "—"}
                          </TableCell>
                          <TableCell className="py-3 text-xs text-center text-green-600 font-semibold font-subheading-oo">
                            {u.amountUsed > 0
                              ? `-$${u.amountUsed.toFixed(2)}`
                              : "—"}
                          </TableCell>
                          <TableCell className="py-3 text-xs text-right">
                            {u.usedAt
                              ? new Date(u.usedAt).toLocaleDateString()
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// GiftCardChecker — check a gift card code's balance and details
export const PromoCodeChecker: React.FC = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    valid: boolean;
    amount?: number | null;
    remainingAmount?: number | null;
    message?: string | null;
  } | null>(null);

  const primaryColor = Env.NEXT_PUBLIC_PRIMARY_COLOR;
  const btnTextColor = isContrastOkay(primaryColor, "#ffffff")
    ? "#ffffff"
    : "#000000";

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await sdk.ValidateGiftCardCode({ code: code.trim() });
      if (!res.validateGiftCardCode.valid) {
        setError(res.validateGiftCardCode.message ?? "Invalid gift card code");
      } else {
        setResult(res.validateGiftCardCode);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const usedAmount =
    result?.amount != null && result?.remainingAmount != null
      ? result.amount - result.remainingAmount
      : null;

  const pct =
    result?.amount && result.amount > 0
      ? ((result.remainingAmount ?? 0) / result.amount) * 100
      : 0;

  return (
    <div className="px-0 sm:px-6 lg:px-12 xl:px-20 py-4 max-w-lg">
      <h2 className="text-xl font-semibold mb-1 font-subheading-oo">
        Check Gift Card
      </h2>
      <p className="text-sm text-gray-500 mb-6 font-body-oo">
        Enter a code to see its balance and details.
      </p>

      <form onSubmit={handleCheck} className="flex gap-2 mb-6">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
            setResult(null);
          }}
          placeholder="e.g. G-ABCD1234"
          className="flex-1 rounded-lg border border-gray-200 py-2.5 px-4 text-sm font-body-oo uppercase tracking-widest outline-none focus:ring-2 transition-all"
          style={{ ["--tw-ring-color" as string]: `${primaryColor}40` }}
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold font-subheading-oo disabled:opacity-50 transition-opacity hover:opacity-85 whitespace-nowrap"
          style={{ backgroundColor: primaryColor, color: btnTextColor }}
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-body-oo">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="px-5 py-4 bg-gray-900 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-body-oo mb-0.5">
                Gift Card Code
              </p>
              <p className="text-base font-bold font-subheading-oo tracking-widest text-white">
                {code}
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 font-semibold font-subheading-oo">
              Active
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100">
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: primaryColor }}
            />
          </div>

          {/* Stats */}
          <div className="p-5 grid grid-cols-2 gap-3 bg-white">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-400 font-body-oo mb-1">
                Card Value
              </p>
              <p className="text-xl font-bold font-subheading-oo text-gray-800">
                ${result.amount?.toFixed(2) ?? "—"}
              </p>
            </div>
            <div
              className="p-3 rounded-xl border border-gray-100"
              style={{ backgroundColor: `${primaryColor}0d` }}
            >
              <p className="text-xs text-gray-400 font-body-oo mb-1">
                Remaining
              </p>
              <p
                className="text-xl font-bold font-subheading-oo"
                style={{ color: primaryColor }}
              >
                ${result.remainingAmount?.toFixed(2) ?? "—"}
              </p>
            </div>
            {usedAmount !== null && usedAmount > 0 && (
              <div className="col-span-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 font-body-oo mb-1">
                  Amount Used
                </p>
                <p className="text-base font-semibold font-subheading-oo text-gray-600">
                  ${usedAmount.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};