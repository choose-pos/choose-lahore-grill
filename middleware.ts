// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookieKeys } from "./constants";
import { Env } from "./env";
import { isCrawlerUserAgent } from "./utils/UtilFncs";

export async function middleware(request: NextRequest) {
  const cartId = request.cookies.get(cookieKeys.cartCookie)?.value;
  const restaurantId = request.cookies.get(cookieKeys.restaurantCookie)?.value;

  const partnerId = Env.NEXT_PUBLIC_RESTAURANT_ID;
  const pathname = request.nextUrl.pathname;

  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const response = NextResponse.next();

  const userAgent = request.headers.get("user-agent") || "";

  if (isCrawlerUserAgent(userAgent)) {
    // Do not redirect. Let the crawler see the real content.
    return response;
  }

  // Extract UTM parameters
  const campaignId = {
    key: "campaignId",
    value: searchParams.get("campaignId"),
  };
  const utmParams = ["utm_source", "utm_medium", "utm_campaign"]
    .map((param) => ({ key: param, value: searchParams.get(param) }))
    .filter(({ value }) => value !== null);

  if (utmParams.length > 0) {
    utmParams.forEach(({ key, value }) => {
      response.cookies.set(key, value ?? "", { maxAge: 60 * 60 * 24 * 30 }); // 30 days
    });
  }

  const otherQueryParams = Array.from(searchParams.entries())
    .filter(
      ([key]) =>
        !key.startsWith("utm_") &&
        key.toLowerCase() !== "campaignid" &&
        key.toLowerCase() !== "itemid"
    )
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  if (campaignId.value) {
    response.cookies.set(campaignId.key, campaignId.value, {
      maxAge: 60 * 60 * 24 * 30,
    }); // 30 days
  }

  const itemId = searchParams.get("itemId");

  // Don't apply middleware to the cart-session page itself
  if (pathname == "/cart-session") {
    return response;
  }

    // Don't apply session validation for feedback-related routes
  // Allow users to access feedback pages without a session
  const isFeedbackRoute =
    pathname.includes("/feedback") ||
    pathname.includes("/payment-status") ||
    pathname.includes("/free-order");

  if (isFeedbackRoute) {
    // Still set UTM cookies and restaurant cookie, but don't redirect
    const resp = NextResponse.next();
    if (utmParams.length > 0) {
      utmParams.forEach(({ key, value }) => {
        resp.cookies.set(key, value ?? "", { maxAge: 60 * 60 * 24 * 30 });
      });
    }
    if (campaignId.value) {
      resp.cookies.set(campaignId.key, campaignId.value, {
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    resp.cookies.set(cookieKeys.restaurantCookie, partnerId);
    return resp;
  }
  
  // Only redirect if there's no cartId and we're not already on cart-session
  if ((!cartId || partnerId !== restaurantId) && pathname.includes("/menu")) {
    const utmString =
      utmParams.length > 0
        ? utmParams.map(({ key, value }) => `${key}=${value}`).join("&")
        : "";

    const campaignString = campaignId.value
      ? `campaignId=${campaignId.value}`
      : "";

    const itemString = itemId ? `itemId=${itemId}` : "";

    const queryString = [
      utmString,
      campaignString,
      itemString,
      otherQueryParams,
    ]
      .filter(Boolean)
      .join("&");

    const cartSessionUrl = `${Env.NEXT_PUBLIC_DOMAIN}/cart-session${
      queryString ? `?${queryString}` : ""
    }`;

    const response = NextResponse.redirect(cartSessionUrl);
    if (utmParams.length > 0) {
      utmParams.forEach(({ key, value }) => {
        response.cookies.set(key, value ?? "", { maxAge: 60 * 60 * 24 * 30 }); // 30 days
      });
    }
    if (campaignId.value) {
      response.cookies.set(campaignId.key, campaignId.value, {
        maxAge: 60 * 60 * 24 * 30,
      }); // 30 days
    }
    return response;
  }

  const resp = NextResponse.next();
  if (utmParams.length > 0) {
    utmParams.forEach(({ key, value }) => {
      resp.cookies.set(key, value ?? "", { maxAge: 60 * 60 * 24 * 30 }); // 30 days
    });
  }
  if (campaignId.value) {
    resp.cookies.set(campaignId.key, campaignId.value, {
      maxAge: 60 * 60 * 24 * 30,
    }); // 30 days
  }
  resp.cookies.set(cookieKeys.restaurantCookie, partnerId);

  return resp;
}
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|cart-session).*)",
  ],
};
