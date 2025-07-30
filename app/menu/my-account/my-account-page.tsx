"use client";

import AccountDetails from "@/components/account/AccountDetails";
import FullScreenLoader from "@/components/Loder";
import { CustomerNew } from "@/store/meCustomer";
import RestaurantStore from "@/store/restaurant";
import ToastStore from "@/store/toast";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { CustomerRestaurant } from "@/utils/types";
import { extractErrorMessage } from "@/utils/UtilFncs";
import { useEffect, useState } from "react";

interface RestaurantDetailsProps {
  restaurant: CustomerRestaurant;
}

export default function MyAccountPage({ restaurant }: RestaurantDetailsProps) {
  const { setToastData } = ToastStore();
  const { setRestaurantData } = RestaurantStore();

  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState<CustomerNew | null>(null);

  useEffect(() => {
    setRestaurantData(restaurant);
  }, [restaurant, setRestaurantData]);

  useEffect(() => {
    setLoading(true);
    const fetchFunc = async () => {
      try {
        const apiResp = await fetchWithAuth(() => sdk.meCustomer());

        if (!apiResp.meCustomer) {
          setLoading(false);
          setToastData({
            message: "Something went wrong, please try again later!",
            type: "error",
          });
          return;
        }

        setCustomerData(apiResp.meCustomer);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        const err = extractErrorMessage(error);
        setToastData({ message: err, type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchFunc();
  }, [setToastData]);

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!customerData && !loading) {
    return <div>Please log in to view your account details.</div>;
  }

  return (
    <div className="bg-bgGray">
      <AccountDetails customerData={customerData} />;
    </div>
  );
}
