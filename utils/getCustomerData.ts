// utils/getCustomerData.js
import { sdk } from "@/utils/graphqlClient";
import { cookies } from "next/headers";

export async function getCustomerData() {
  const cookieHeader = cookies().toString();
  if (!cookieHeader.includes("accessToken=")) {
    return null;
  }

  try {
    const { meCustomer } = await sdk.meCustomer({}, { cookie: cookieHeader });
    return meCustomer;
  } catch (error) {
    console.error("Something went wrong:", error);
    return null;
  }
}