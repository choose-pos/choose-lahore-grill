import { sdk } from "./graphqlClient";

export const refreshCartCount = async (): Promise<number | null> => {
  try {
    const data = await sdk.fetchCartCount();
    if (data.fetchCartCount !== null) {
      return data.fetchCartCount;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error refreshing cart:", error);
    return null;
  }
};
