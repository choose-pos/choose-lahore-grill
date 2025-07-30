"use client";

import RestaurantStore from "@/store/restaurant";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { RestaurantRedeemOffers } from "@/utils/types";
import { useEffect, useState } from "react";

import { IoMdArrowBack } from "react-icons/io";
import {
  OrdersContent,
  ProfileContent,
  RewardsContent,
  StickyTabbar,
} from "./TabBar";
// import { useRouter } from "next/router";
import { CustomerNew } from "@/store/meCustomer";
import { useRouter } from "next/navigation";
// import { IoMdArrowBack } from 'react-icons/io';

interface AccountDetailsProps {
  customerData: CustomerNew | null;
}

export default function AccountDetails({ customerData }: AccountDetailsProps) {
  const { restaurantData } = RestaurantStore();
  const [customerBalance, setCustomerBalance] = useState<number>(0);
  const [offers, setOffers] = useState<RestaurantRedeemOffers | null>(null);
  const [pointsRequire, setPointsRequire] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("Rewards");
  const [programName, setProgramName] = useState<string>("points");
  const [programDesc, setProgramDesc] = useState<string>(
    "Earn more points with every purchase!"
  );
  const router = useRouter();

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await sdk.fetchLoyaltyCustomerRules();
        if (res.fetchLoyaltyCustomerRules.programName) {
          setProgramName(res.fetchLoyaltyCustomerRules.programName);
        }
        if (res.fetchLoyaltyCustomerRules.programDesc) {
          setProgramDesc(res.fetchLoyaltyCustomerRules.programDesc);
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
      }
    };

    fetchRules();
  }, []);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await sdk.fetchRestaurantRedeemOffers();
        if (res.fetchRestaurantRedeemOffers) {
          const offers: RestaurantRedeemOffers = {
            pointsRedemptions:
              res.fetchRestaurantRedeemOffers.pointsRedemptions.map(
                (redemption) => ({
                  _id: redemption._id,
                  pointsThreshold: redemption.pointsThreshold,
                  discountType: redemption.discountType,
                  discountValue: redemption.discountValue,
                  uptoAmount: redemption.uptoAmount,
                })
              ),
            itemRedemptions:
              res.fetchRestaurantRedeemOffers.itemRedemptions.map(
                (itemRedemption) => ({
                  _id: itemRedemption._id,
                  item: {
                    _id: itemRedemption.item._id,
                    name: itemRedemption.item.name,
                    price: itemRedemption.item.price,
                    image: itemRedemption.item.image,
                  },
                  pointsThreshold: itemRedemption.pointsThreshold,
                })
              ),
          };
          setOffers(offers);
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
      }
    };

    fetchOffers();
  }, []);

  useEffect(() => {
    const fetchCustomerBalance = async () => {
      try {
        const res = await fetchWithAuth(() => sdk.fetchCustomerLoyaltyWallet());
        if (res.fetchCustomerLoyaltyWallet) {
          setCustomerBalance(res.fetchCustomerLoyaltyWallet.balance);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchCustomerBalance();
  }, [offers, pointsRequire]);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (offers) {
          const combinedRedemptions = [
            ...offers.pointsRedemptions,
            ...offers.itemRedemptions,
          ];

          const lowestThreshold = combinedRedemptions.reduce((prev, current) =>
            prev.pointsThreshold < current.pointsThreshold ? prev : current
          );
          const res = await sdk.fetchCustomerLoyaltyWallet();
          if (res.fetchCustomerLoyaltyWallet) {
            setCustomerBalance(res.fetchCustomerLoyaltyWallet.balance);
            if (
              res.fetchCustomerLoyaltyWallet.balance <
              lowestThreshold.pointsThreshold
            ) {
              setPointsRequire(
                lowestThreshold.pointsThreshold - customerBalance
              );
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchBalance();
  }, [offers, customerBalance]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (!customerData)
    return <div>Something went wrong, please try again later!</div>;

  if (!restaurantData) return <div>Loading!!</div>;

  const renderTabContent = () => {
    switch (activeTab) {
      case "Rewards":
        return (
          <RewardsContent
            offers={offers}
            balance={customerBalance || 0}
            name={programName}
            desc={programDesc}
          />
        );
      case "Profile":
        return <ProfileContent customerData={customerData} />;
      case "Orders":
        return <OrdersContent />;
      default:
        return null;
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex flex-col font-online-ordering bg-bgGray">
      <main className="flex-grow py-8 sm:py-12 lg:py-16 max-w-8xl w-full mx-auto px-6 md:px-20 ">
        <div
          onClick={handleBack}
          className="flex items-center text-gray-500 hover:text-black cursor-pointer mb-6 px-4 sm:px-6  xl:px-10 w-max"
        >
          <IoMdArrowBack size={16} />
          <p className="ml-2 text-base sm:text-lg font-online-ordering">Menu</p>
        </div>
        <div className="flex flex-col md:flex-row items-start xl:px-10 w-full  font-online-ordering">
          <StickyTabbar onTabChange={handleTabChange} />

          <div className="w-full">
            <div className="w-full flex flex-col justify-between">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
