import { Env } from "@/env";
import { getSdk } from "@/generated/graphql";
import { GraphQLClient } from "graphql-request";

const BASE_URL = `${Env.NEXT_PUBLIC_SERVER_BASE_URL}`;
const GRAPHQL_ENDPOINT = `${BASE_URL}/graphql`;

// Function to create a new GraphQLClient instance with optional headers
const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  credentials: "include",
});

export const fetchWithAuth = async <T>(
  requestFn: () => Promise<T>
): Promise<T> => {
  try {
    return await requestFn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Refresh the token on 401 error
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Ensure cookies are included in the refresh request
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      // Retry the original request with the new token
      return await requestFn();
    }
    throw error;
  }
};

export const sdk = getSdk(graphqlClient);
