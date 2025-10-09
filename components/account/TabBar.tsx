import {
  DiscountType,
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
import { CustomerNew } from "@/store/meCustomer";
import { convertToRestoTimezone } from "@/utils/formattedTime";
import { refreshCartCount } from "@/utils/getCartCountData";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { refreshCartDetails } from "@/utils/refreshCartDetails";
import { getYear } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Icon from "../../assets/StarIcon2.svg";
import { DatePicker } from "../ui/date-picker";

interface TabProps {
  onTabChange: (tab: string) => void;
}

export const StickyTabbar: React.FC<TabProps> = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState("Rewards");

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onTabChange(tab);
  };
  const tabs = ["Rewards", "Profile", "Orders"];

  return (
    <div className="  sticky md:top-24 top-20 left-0 z-10 w-full md:w-auto">
      <div className="hidden md:block top-32 left-0 bg-white shadow-lg rounded-[40px] z-10 mb-4 w-[320px]">
        <div className="flex flex-col justify-between items-start py-4 px-4">
          <div className="flex flex-col items-start space-y-2 w-full mt-4">
            {tabs.map((tab, index) => (
              <div key={index} className="w-full">
                <button
                  onClick={() => handleTabClick(tab)}
                  className={`px-4 py-2 rounded-[40px] w-full text-start text-xl  ${
                    activeTab === tab
                      ? "bg-primaryColor text-white"
                      : "text-gray-500 hover:bg-bgGray"
                  }`}
                  style={
                    activeTab === tab
                      ? {
                          color: isContrastOkay(
                            Env.NEXT_PUBLIC_PRIMARY_COLOR,
                            "#ffffff"
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

      <div className="md:hidden font-online-ordering  z-20 bg-white border-b-[1px] border-gray-100  rounded-full mb-3 mx-auto">
        <div className="flex overflow-x-auto  items-center justify-between">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(tab)}
              className={`flex-shrink-0 px-7 py-2 rounded-full text-start ${
                activeTab === tab
                  ? "bg-primaryColor text-white"
                  : "text-gray-500 hover:bg-bgGray"
              }`}
              style={
                activeTab === tab
                  ? {
                      color: isContrastOkay(
                        Env.NEXT_PUBLIC_PRIMARY_COLOR,
                        "#ffffff"
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

  const [cartCount, setCartCount] = useState<number>(0);

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

  const handleSave = async (points: number, type: any) => {
    try {
      const res = await fetchWithAuth(() =>
        sdk.validateLoyaltyRedemptionOnCart({
          input: {
            loyaltyPointsRedeemed: points,
            redeemType: type,
          },
        })
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
          type === "item" ? LoyaltyRedeemType.Item : LoyaltyRedeemType.Discount
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
        <Card className="bg-white shadow-lg transition-all duration-300 h-auto sm:h-[180px] rounded-[20px]">
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
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 line-clamp-2">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {description}
                </p>
              </div>
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
        </Card>
      </motion.div>
    );
  };

  const allRewards = [
    ...(offers?.itemRedemptions ?? []).map((reward) => ({
      key: reward._id,
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
    <div className="py-4 sm:py-6 px-4 sm:px-6 lg:px-12 xl:px-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-lg p-4 sm:p-6 mb-6 sm:mb-10 shadow-md border-[1px] border-gray-100">
        <div className="w-full sm:w-auto mb-4 sm:mb-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 font-online-ordering">
            Your {name === "Points" ? "Reward Points" : name}
          </h2>
          <div className="flex items-center">
            <p className="text-base sm:text-lg text-gray-600">{desc}</p>
          </div>
        </div>
        <div className="flex items-center rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-inner bg-bgGray w-full sm:w-auto justify-center">
          <Image
            src={Icon}
            className="w-6 h-6 sm:w-8 sm:h-8 mr-2 object-cover"
            alt="icon"
          />
          <span className="text-2xl sm:text-3xl font-bold">{balance}</span>
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
            <p className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 font-online-ordering">
              No available rewards at the moment! please check back later.
            </p>
          </div>
        )}
      </div>
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

  // Initialize DOB from customer data when component mounts
  useEffect(() => {
    if (customerData?.dob) {
      setDob(customerData.dob);
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
        dob: dob.length === 0 ? null : dob,
      };
      const res = await fetchWithAuth(() =>
        sdk.UpdateCustomerDetails({ input: inputData })
      );
      if (res.updateCustomerDetails) {
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
    <div className="px-4 sm:px-6 lg:px-12 xl:px-20">
      <h2 className="text-3xl md:text-3xl font-bold mb-3 md:mb-4 font-online-ordering">
        Details
      </h2>
      <p className="mb-4 text-sm text-gray-600">
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
            className="block text-sm font-medium text-gray-700"
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
            className="mt-1 block w-full rounded-full border border-gray-300 shadow-sm py-2 px-3 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            value={profile.firstName || ""}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-full border border-gray-300 shadow-sm py-2 px-3 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            value={profile.lastName || ""}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-full border border-gray-300 shadow-sm py-2 px-3 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="dob"
            className="block text-sm font-medium text-gray-700"
          >
            Date of Birth
          </label>
          <DatePicker
            selectedDate={
              (profile?.dob ?? "").length === 0 ? null : new Date(profile.dob)
            }
            setDateFn={(date) => setDob(date.toISOString())}
            endYear={getYear(new Date()) - 18}
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            value={profile.phone}
            readOnly
            className="mt-1 block w-full rounded-full border border-gray-300 bg-gray-100 shadow-sm focus:ring-opacity-50 py-2 px-3 text-sm"
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
          <label htmlFor="emailOffers" className="text-sm text-gray-700">
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
          <label htmlFor="smsOffers" className="text-sm text-gray-700">
            Receive special offers by text
          </label>
        </div>
        <p className="text-xs text-gray-500">
          By joining, you agree to receive updates from {restaurantData?.name}{" "}
          and our technology partner Choose, and accept our{" "}
          <Link
            href={"https://www.choosepos.com/terms-conditions"}
            passHref
            className="inline-block"
          >
            <span className="underline font-semibold">{`Platform Terms`}</span>
          </Link>{" "}
          and{" "}
          <Link
            href={"https://www.choosepos.com/privacy-policy"}
            passHref
            className="inline-block"
          >
            <span className="underline font-semibold">{`Privacy Policy`}</span>
          </Link>
        </p>
        <br />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-1.5 md:py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/70 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            color: isContrastOkay(
              Env.NEXT_PUBLIC_PRIMARY_COLOR,
              Env.NEXT_PUBLIC_BACKGROUND_COLOR
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
type Item = {
  qty: number;
  itemPrice: number;
  itemId: {
    name: string;
    desc?: string | null | undefined;
  };
  modifierGroups: {
    selectedModifiers?: {
      modifierName: string;
      modifierPrice: number;
      qty: number;
    }[];
  }[];
};

export type Order = {
  createdAt: Date;
  orderType?: string | null;
  orderId: string | null;
  _id: string;
  taxRate?: number | null;
  totalAmount?: number;
  items: Item[];
  status?: string | null;
  systemRemark?: string;
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
};

export interface Modifier {
  modifierName: string;
  modifierPrice: number;
  qty: number;
}

export interface ModifierGroup {
  mgName: string;
  price?: number | null | undefined;
  selectedModifiers: Modifier[];
  pricingType: PriceTypeEnum
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

export const OrdersContent: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderById | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const { setToastData } = ToastStore();
  const { restaurantData } = RestaurantStore();
  const router = useRouter();
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 3;
  const { setSpecialRemarks } = useCartStore();

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        setIsLoading(true);
        const res = await fetchWithAuth(() => sdk.fetchCustomerOrders());
        setOrders(res.fetchCustomerOrders || []);
      } catch (error) {
        setError("Failed to fetch orders. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderHistory();
  }, []);

  const fetchOrderById = async (orderId: string) => {
    try {
      setModalLoading(true);
      const res = await fetchWithAuth(() =>
        sdk.fetchOrderById({ id: orderId })
      );
      setSelectedOrder(res.fetchCustomerOrderById);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setToastData({ message: extractErrorMessage(error), type: "error" });
    } finally {
      setModalLoading(false);
    }
  };

  const openModal = (orderId: string) => {
    fetchOrderById(orderId);
    setShowModal(true);
  };

  const reOrder = async (orderId: string) => {
    try {
      setModalLoading(true);
      const res = await fetchWithAuth(() =>
        sdk.reorderItemsToCart({ orderId: orderId })
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
      console.log("Error reordering items:", error);
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    } finally {
      setModalLoading(false);
    }
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  // Pagination calculations
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

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
    if (orders.length <= ordersPerPage) return null;

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
                      Env.NEXT_PUBLIC_BACKGROUND_COLOR
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

  if (orders.length === 0) {
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

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if the click is directly on the overlay
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const calcDiscountAmt = (): number => {
    if (!selectedOrder) {
      return 0;
    }

    if (selectedOrder.discountAmount && selectedOrder.discountAmount !== 0) {
      return selectedOrder.discountAmount;
    }

    return 0;
  };

  const OrderDetailsCardComponent: React.FC = () => {
    return (
      <div
        className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
        onClick={handleOverlayClick}
      >
        <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] mx-auto md:w-full max-w-lg relative max-h-[90vh] overflow-y-scroll">
          <button
            className="absolute top-4 right-2 text-gray-600 hover:text-gray-900 border rounded-full p-1 bg-gray-200"
            onClick={closeModal}
          >
            <FiX size={16} />
          </button>
          {modalLoading ? (
            <div className="w-full flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-3xl text-gray-600" />
            </div>
          ) : selectedOrder ? (
            <div className="font-online-ordering text-sm">
              <div className="text-center mb-4">
                <h3 className="text-xl md:text-2xl font-bold">
                  {selectedOrder.restaurantInfo.name}
                </h3>
                <p className="text-sm text-gray-700">
                  {selectedOrder.restaurantInfo.address.addressLine1}
                </p>
                <p className="text-sm text-gray-700">
                  Phone: +1{" "}
                  {formattedNumber(selectedOrder.restaurantInfo.phone)}
                </p>

                <hr className="my-4" />

                <div className="flex flex-row justify-between items-center">
                  <p className="text-gray-500">Order ID:</p>
                  <p className="text-gray-500">{selectedOrder.orderId}</p>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <p className="text-gray-500 text-left">Order Time:</p>
                  <p className="text-gray-500 text-right">
                    {convertToRestoTimezone(
                      restaurantData?.timezone?.timezoneName?.split(" ")[0] ??
                        "",
                      new Date(selectedOrder.createdAt)
                    )}
                  </p>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <p className="text-gray-500 text-left">
                    {selectedOrder.orderType === OrderType.Pickup
                      ? "Pickup Time"
                      : "Delivery Time"}
                    :
                  </p>
                  <p className="text-gray-500 text-right">
                    {convertToRestoTimezone(
                      restaurantData?.timezone?.timezoneName?.split(" ")[0] ??
                        "",
                      selectedOrder.orderType === OrderType.Pickup &&
                        selectedOrder.pickUpDateAndTime
                        ? new Date(selectedOrder.pickUpDateAndTime)
                        : new Date(selectedOrder.deliveryDateAndTime ?? "")
                    )}
                  </p>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <p className="text-gray-500 text-left">Payment Method:</p>
                  <p className="text-gray-500 text-right capitalize">
                    {selectedOrder.paymentMethod ?? "N/A"}
                  </p>
                </div>
                {/* <div className="flex flex-row justify-between items-center">
                  <p className="text-gray-500 text-left">Status:</p>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      getOrderStatusDisplay(selectedOrder.status).color
                    }`}
                  >
                    {getOrderStatusDisplay(selectedOrder.status).text}
                  </span>
                </div> */}
              </div>
              {/* Failure Reason in Modal */}
              {/* {selectedOrder.status === OrderStatus.Failed &&
                selectedOrder.systemRemark !== "" && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="text-sm font-medium text-red-800 mb-1">
                      Order Failed
                    </div>
                    <div className="text-sm text-red-700">
                      {selectedOrder.systemRemark}
                    </div>
                  </div>
                )} */}

              <div className="border-t border-b py-2 mb-4">
                <div className="grid grid-cols-12 font-bold">
                  <span className="col-span-9">Item</span>
                  {/* <span className="col-span-3 text-center">Qty</span> */}
                  <span className="col-span-3 text-right">Total</span>
                </div>
              </div>

              <ul className="space-y-4">
                {selectedOrder.appliedDiscount?.loyaltyData?.redeemItem ? (
                  <li>
                    <div className="grid grid-cols-12">
                      <span className="col-span-9">
                        {
                          selectedOrder.appliedDiscount?.loyaltyData?.redeemItem
                            ?.itemName
                        }{" "}
                        x 1
                      </span>
                      {/* <span className="col-span-3 text-center">{1}</span> */}
                      <span className="col-span-3 text-right">
                        $
                        {selectedOrder.appliedDiscount?.loyaltyData?.redeemItem?.itemPrice?.toFixed(
                          2
                        )}
                      </span>
                    </div>
                  </li>
                ) : null}

                {selectedOrder.appliedDiscount?.promoData?.discountItemName ? (
                  <li>
                    <div className="grid grid-cols-12">
                      <span className="col-span-9">
                        {
                          selectedOrder.appliedDiscount?.promoData
                            ?.discountItemName
                        }{" "}
                        x 1
                      </span>
                      {/* <span className="col-span-3 text-center">{1}</span> */}
                      <span className="col-span-3 text-right">
                        $
                        {selectedOrder.appliedDiscount?.promoData?.discountValue?.toFixed(
                          2
                        ) || "0.00"}
                      </span>
                    </div>
                  </li>
                ) : null}

                {selectedOrder.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <div className="grid grid-cols-12">
                      <span className="col-span-9">
                        {item.itemName} x {item.qty}
                      </span>

                      {/* <span className="col-span-3 text-center">{item.qty}</span> */}
                      <span className="col-span-3 text-right">
                        $
                        {(
                          (item.itemPrice +
                            calculateTotalModifiersPrice(item.modifierGroups)) *
                          item.qty
                        ).toFixed(2)}
                      </span>
                    </div>
                    {item.modifierGroups.map((group, groupIndex) => (
                      <div
                        key={groupIndex}
                        className="ml-2 text-xs text-gray-600"
                      >
                        {group.selectedModifiers.map((modifier, modIndex) => (
                          <div key={modIndex} className="grid grid-cols-12">
                            <span className="col-span-6">
                              {modifier.modifierName} x {modifier.qty}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                    {item.itemRemarks && (
                      <p className="text-gray-600  text-[12px] max-w-[300px]">
                        Remarks: {item.itemRemarks}
                      </p>
                    )}
                  </li>
                ))}
              </ul>

              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Gross Amount</span>
                  <span>${selectedOrder.subTotalAmount?.toFixed(2)}</span>
                </div>
                {selectedOrder.discountAmount &&
                selectedOrder.discountAmount !== 0 ? (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>-${selectedOrder.discountAmount.toFixed(2)}</span>
                  </div>
                ) : null}

                {calcDiscountAmt() > 0 ? (
                  <div className="flex justify-between">
                    <span>Net Amount</span>
                    <span>
                      $
                      {(
                        (selectedOrder.subTotalAmount ?? 0) - calcDiscountAmt()
                      ).toFixed(2)}
                    </span>
                  </div>
                ) : null}

                {selectedOrder.tipAmount !== null ||
                selectedOrder.tipAmount !== undefined ? (
                  <div className="flex justify-between">
                    {/* <span>{`Tip (${
                      selectedOrder.thirdPartyTip ? "3rd Party" : "In House"
                    })`}</span> */}
                    <span>{`Tip`}</span>
                    <span>
                      $
                      {selectedOrder.tipAmount !== null &&
                      selectedOrder.tipAmount !== undefined
                        ? selectedOrder.tipAmount.toFixed(2)
                        : Number(0).toFixed(2)}
                    </span>
                  </div>
                ) : null}

                {selectedOrder.taxAmount &&
                (selectedOrder.platformFees !== null ||
                  selectedOrder.platformFees !== undefined) ? (
                  <div className="flex justify-between">
                    <span>Taxes & Fees</span>
                    <span>
                      $
                      {(
                        parseFloat((selectedOrder.taxAmount ?? 0).toFixed(2)) +
                        parseFloat((selectedOrder.platformFees ?? 0).toFixed(2))
                      ).toFixed(2)}
                    </span>
                  </div>
                ) : null}

                {(selectedOrder.deliveryAmount ?? 0) > 0 ? (
                  <div className="flex justify-between">
                    <span>Delivery Fees</span>
                    <span>
                      ${(selectedOrder.deliveryAmount ?? 0).toFixed(2)}
                    </span>
                  </div>
                ) : null}

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${selectedOrder?.finalAmount?.toFixed(2)}</span>
                </div>

                {(selectedOrder?.refundAmount ?? 0) > 0 ? (
                  <div className="flex justify-between text-green-600">
                    <span>Refund</span>
                    <span>${selectedOrder?.refundAmount?.toFixed(2)}</span>
                  </div>
                ) : null}
              </div>

              {selectedOrder.appliedDiscount &&
                selectedOrder.appliedDiscount.discountType ===
                  OrderDiscountType.Promo && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-md">
                    <p>
                      You used code{" "}
                      {selectedOrder.appliedDiscount.promoData?.code} for{" "}
                      {selectedOrder.appliedDiscount.promoData?.discountValue &&
                      selectedOrder.appliedDiscount.promoData.discountType ===
                        PromoDiscountType.Free
                        ? `$${selectedOrder.appliedDiscount?.promoData?.discountValue} off`
                        : selectedOrder.appliedDiscount.promoData
                            ?.discountValue &&
                          selectedOrder.appliedDiscount.promoData
                            .discountType === PromoDiscountType.FreeDelivery
                        ? "free delivery"
                        : selectedOrder.appliedDiscount.promoData
                            ?.discountValue &&
                          selectedOrder.appliedDiscount.promoData
                            .discountType === PromoDiscountType.FixedAmount
                        ? `Discount: $${selectedOrder.appliedDiscount.promoData.discountValue.toFixed(
                            2
                          )} off`
                        : selectedOrder.appliedDiscount.promoData
                            ?.discountValue &&
                          selectedOrder.appliedDiscount.promoData
                            .discountType === PromoDiscountType.Percentage
                        ? `$${selectedOrder.appliedDiscount.discountAmount?.toFixed(
                            2
                          )} off`
                        : selectedOrder.appliedDiscount.promoData
                            ?.discountItemName &&
                          `Item: ${selectedOrder.appliedDiscount.promoData.discountItemName}`}
                    </p>
                  </div>
                )}

              {selectedOrder.appliedDiscount &&
                selectedOrder.appliedDiscount.discountType ===
                  OrderDiscountType.Loyalty && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-md">
                    <p>
                      You used your{" "}
                      {
                        selectedOrder.appliedDiscount.loyaltyData
                          ?.loyaltyPointsRedeemed
                      }{" "}
                      points for{" "}
                      {selectedOrder.appliedDiscount.loyaltyData
                        ?.redeemItem && (
                        <>
                          Item:{" "}
                          {
                            selectedOrder.appliedDiscount.loyaltyData
                              ?.redeemItem.itemName
                          }{" "}
                          (Value: $
                          {selectedOrder.appliedDiscount.loyaltyData?.redeemItem.itemPrice.toFixed(
                            2
                          )}
                          )
                        </>
                      )}
                      {selectedOrder.appliedDiscount.loyaltyData?.redeemDiscount
                        ?.discountValue &&
                        (selectedOrder.appliedDiscount.loyaltyData
                          ?.redeemDiscount.discountType ===
                          DiscountType.FixedAmount ||
                          selectedOrder.appliedDiscount.loyaltyData
                            ?.redeemDiscount.discountType ===
                            DiscountType.Percentage) && (
                          <>
                            Discount: $
                            {selectedOrder.appliedDiscount.loyaltyData?.redeemDiscount.discountValue.toFixed(
                              2
                            )}{" "}
                            off
                          </>
                        )}
                    </p>
                  </div>
                )}

              {selectedOrder?.loyaltyTransactions &&
                selectedOrder.loyaltyTransactions.length > 0 && (
                  <div>
                    {selectedOrder.loyaltyTransactions.map(
                      (transaction, index) => (
                        <div key={index}>
                          {transaction.transactionType ===
                            TransactionType.Earn && (
                            <p className="mt-4 bg-green-50 p-4 rounded-md">
                              You earned {transaction.points} points for this
                              order
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}

              {selectedOrder.specialRemark && (
                <div className="mt-4 bg-yellow-50 p-4 rounded-md">
                  <h4 className="font-bold mb-2">Restaurant Remarks</h4>
                  <p>{selectedOrder.specialRemark}</p>
                </div>
              )}

              <div className="mt-6 text-center text-gray-500 text-xs">
                <p>Thank you for your order!</p>
              </div>
            </div>
          ) : (
            <p className="text-red-500">Failed to load order details.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-12 xl:px-20">
      <div className="w-full">
        <div className="space-y-4 sm:space-y-6 w-full">
          {currentOrders.map((order, index) => (
            <div
              key={index}
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
                  <div className="text-base text-gray-600">Date:</div>
                  <span className="text-lg lg:text-xl font-semibold">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-base text-gray-600">Order Id:</div>
                  <span className="text-lg lg:text-xl font-semibold">
                    {order.orderId}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-base text-gray-600">Order Type:</div>
                  <span className="text-lg lg:text-xl font-semibold">
                    {order.orderType}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-base text-gray-600">Total Amount:</div>
                  <span className="text-lg lg:text-xl font-semibold">
                    ${order.totalAmount?.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Right Column - Items & Action */}
              <div className="flex-1 flex flex-col pl-0 lg:pl-8 border-l border-gray-200">
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
                  <div className="text-base font-medium text-gray-600 mb-2">
                    Items (
                    {order.items.length +
                      (order.appliedDiscount?.promoData?.discountItemName
                        ? 1
                        : 0) +
                      (order.appliedDiscount?.loyaltyData?.redeemItem?.itemName
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
                            Price
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.appliedDiscount?.promoData
                          ?.discountItemName ? (
                          <TableRow key={0}>
                              <TableCell className="py-3 w-1/2">
                                <span className="text-base font-medium">
                                  {order.appliedDiscount.promoData.discountItemName} (Promo Item)
                                </span>
                              </TableCell>
                              <TableCell className="text-center py-3 text-base">
                                1
                              </TableCell>
                              <TableCell className="text-right py-3 text-base">
                                ${(order.appliedDiscount.discountAmount ?? 0).toFixed(2)}
                              </TableCell>
                            </TableRow>
                        ) : null}
                        {order.appliedDiscount?.loyaltyData
                          ?.redeemItem?.itemName ? (
                          <TableRow key={1}>
                              <TableCell className="py-3 w-1/2">
                                <span className="text-base font-medium">
                                  {order.appliedDiscount.loyaltyData.redeemItem?.itemName} (Loyalty Redemption)
                                </span>
                              </TableCell>
                              <TableCell className="text-center py-3 text-base">
                                1
                              </TableCell>
                              <TableCell className="text-right py-3 text-base">
                                ${(order.appliedDiscount.discountAmount ?? 0).toFixed(2)}
                              </TableCell>
                            </TableRow>
                        ) : null}
                        {order.items.map((item, itemIndex) => {
                          const finalPrice = item.qty * item.itemPrice;
                          return (
                            <TableRow key={itemIndex}>
                              <TableCell className="py-3 w-1/2">
                                <span className="text-base font-medium">
                                  {item.itemId.name}
                                </span>
                              </TableCell>
                              <TableCell className="text-center py-3 text-base">
                                {item.qty}
                              </TableCell>
                              <TableCell className="text-right py-3 text-base">
                                ${item.itemPrice.toFixed(2)}
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
                  {(order?.totalAmount ?? 0) > 0 ? (
                    <button
                      className="px-6 py-2 bg-primary text-white rounded-full text-base transition-colors"
                      onClick={() => reOrder(order._id)}
                      style={{
                        color: isContrastOkay(
                          Env.NEXT_PUBLIC_PRIMARY_COLOR,
                          Env.NEXT_PUBLIC_BACKGROUND_COLOR
                        )
                          ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                          : Env.NEXT_PUBLIC_TEXT_COLOR,
                      }}
                    >
                      Reorder
                    </button>
                  ) : null}

                  <button
                    className="px-6 py-2 bg-primary text-white rounded-full text-base transition-colors"
                    onClick={() => openModal(order._id)}
                    style={{
                      color: isContrastOkay(
                        Env.NEXT_PUBLIC_PRIMARY_COLOR,
                        Env.NEXT_PUBLIC_BACKGROUND_COLOR
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
          ))}
        </div>
      </div>
      <PaginationControls />
      {showModal && <OrderDetailsCardComponent />}
    </div>
  );
};
