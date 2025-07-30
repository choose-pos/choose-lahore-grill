import { fetchWithAuth, sdk } from "./graphqlClient";

export const getMeCustomer = async () => {
  try {
    const customerData = await fetchWithAuth(() => sdk.meCustomer());
    if (customerData.meCustomer) {
      return customerData.meCustomer;
    }
    return null;
  } catch (error) {
    console.error(error);
  }
};
