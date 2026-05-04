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

  const userAgent = request.headers.get("user-agent") || "";

  if (isCrawlerUserAgent(userAgent)) {
    // Do not redirect or initialize visitor tracking for bots/crawlers.
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Call /visitor/init on the first request so the server-assigned visitor
  // hash is set before any page renders — including promotional pages and the
  // homepage — and before cart creation. The hash persists for 30 days via the
  // choose_oos_uh cookie set by the ordering server. If the fetch fails, the
  // client-side fallback in analytics.ts handles the missing hash gracefully.
  const visitorHashCookie = request.cookies.get(cookieKeys.userHash)?.value;
  let visitorInitSetCookie: string | null = null;
  if (!visitorHashCookie) {
    try {
      const visitorInitRes = await fetch(
        `${Env.NEXT_PUBLIC_SERVER_BASE_URL}/visitor/init`,
        { headers: { cookie: request.headers.get("cookie") ?? "" } },
      );
      visitorInitSetCookie = visitorInitRes.headers.get("set-cookie");
      if (visitorInitSetCookie) {
        response.headers.append("set-cookie", visitorInitSetCookie);
      }
    } catch {
      // Silent — client-side fallback in analytics.ts handles missing hash
    }
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
        key.toLowerCase() !== "itemid",
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
    if (visitorInitSetCookie) {
      resp.headers.append("set-cookie", visitorInitSetCookie);
    }
    return resp;
  }

  // Only redirect if there's no cartId and we're not already on cart-session
  if (
    (!cartId || partnerId !== restaurantId) &&
    (pathname.includes("/menu") || pathname === "/gift-cards")
  ) {
    const utmString =
      utmParams.length > 0
        ? utmParams.map(({ key, value }) => `${key}=${value}`).join("&")
        : "";

    const campaignString = campaignId.value
      ? `campaignId=${campaignId.value}`
      : "";

    const itemString = itemId ? `itemId=${itemId}` : "";

    const redirectParam =
      pathname === "/gift-cards" ? `redirect=/gift-cards` : "";

    const queryString = [
      utmString,
      campaignString,
      itemString,
      otherQueryParams,
      redirectParam,
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
    if (visitorInitSetCookie) {
      response.headers.append("set-cookie", visitorInitSetCookie);
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
  if (visitorInitSetCookie) {
    resp.headers.append("set-cookie", visitorInitSetCookie);
  }

  return resp;
}
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|cart-session).*)",
  ],
};
