"use server";

import { cookies } from "next/headers";
import { cookieKeys } from "@/constants";

export async function getCartId() {
  const cookieStore = await cookies();
  return cookieStore.get(cookieKeys.cartCookie)?.value ?? null;
}