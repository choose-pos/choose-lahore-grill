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

  // ---------------------------------------------------------------------------
  // VISITOR HASH — resolve once at the top, apply to every response branch.
  //
  // WHY: Previously we forwarded the raw Set-Cookie header from /visitor/init
  // via response.headers.append("set-cookie", rawHeader). That header contains
  // SameSite=Strict (set by ServerCookies on the ordering server). Instagram's
  // in-app browser and other strict WebViews silently drop SameSite=Strict
  // cookies when they arrive on a redirect response, because the navigation is
  // treated as a cross-site entry point (Meta ad click → your domain).
  //
  // FIX: Parse the hash value from the JSON response body and set the cookie
  // ourselves using response.cookies.set() with sameSite: "lax". This means:
  // - We control the cookie attributes — no more forwarding a raw header string
  // - SameSite=Lax allows the cookie to survive top-level cross-site navigations
  //   (ad clicks, redirects) while still blocking third-party iframe contexts
  // - The cookie is set on the current domain (bawarchiatlanta.com) correctly
  //   by Next.js, not on the API subdomain
  //
  // cartId works fine without this because it is set by the browser hitting
  // the ordering server directly — not forwarded through middleware.
  // ---------------------------------------------------------------------------
  const visitorHashCookie = request.cookies.get(cookieKeys.userHash)?.value;
  let resolvedVisitorHash: string | null = visitorHashCookie ?? null;

  if (!visitorHashCookie) {
    try {
      const visitorInitRes = await fetch(
        `${Env.NEXT_PUBLIC_SERVER_BASE_URL}/visitor/init`,
        { headers: { cookie: request.headers.get("cookie") ?? "" } },
      );
      const data = await visitorInitRes.json();
      resolvedVisitorHash = data?.visitorHash ?? null;
    } catch {
      // Silent — client-side fallback in analytics.ts handles missing hash
    }
  }

  // Helper: sets the visitorHash cookie on any NextResponse object.
  // Only sets it when we just resolved a new hash (visitorHashCookie was absent).
  // When the cookie already existed we don't need to re-set it — the browser
  // already has it. This avoids unnecessary Set-Cookie headers on every request.
  //
  // domain: The ordering server sets its cookies via determineCookieDomain() which
  // returns ".bawarchiatlanta.com" (dot-prefixed apex domain). Without a domain
  // attribute here, Next.js scopes this cookie to the exact host only — it is never
  // sent to api.bawarchiatlanta.com on cross-origin fetches. Setting the same
  // dot-prefixed apex domain makes the cookie visible to all subdomains, matching
  // the ordering server's scope and allowing ServerCookies.getCookie to find it.
  const host = request.headers.get("host") ?? "";
  const apexDomain =
    process.env.NODE_ENV === "production"
      ? `.${host.replace(/:\d+$/, "").replace(/^www\./, "")}`
      : undefined;

  const setVisitorHashCookie = (res: NextResponse): void => {
    if (resolvedVisitorHash && !visitorHashCookie) {
      res.cookies.set(cookieKeys.userHash, resolvedVisitorHash, {
        maxAge: 60 * 60 * 24 * 30, // 30 days — matches cart cookie expiry
        path: "/",
        httpOnly: false, // must be false — useAnalytics reads it client-side
        sameSite: "lax", // lax survives cross-site navigations and redirects
        secure: process.env.NODE_ENV === "production",
        domain: apexDomain,
      });
    }
  };

  // ENTRY SOURCE — capture the original external referrer once per visitor.
  //
  // After cart-session does window.location.replace('/menu'), document.referrer
  // on /menu becomes the cart-session URL (same-origin), losing the original
  // Instagram/Meta/Google referrer. The hard nav is required to break the
  // cookie-race redirect loop, so we persist the entry referrer in a cookie
  // here and let useAnalytics prefer it whenever document.referrer is internal.
  //
  // Set once and only once — on the request that carries an external Referer.
  // Subsequent requests on the same site don't overwrite (otherwise the cookie
  // would flip to the previous internal page on every navigation).
  const entrySourceCookie = request.cookies.get("entry_source")?.value;
  let resolvedEntrySource: string | null = entrySourceCookie ?? null;
  if (!entrySourceCookie) {
    const refererHeader = request.headers.get("referer");
    if (refererHeader) {
      try {
        const refHost = new URL(refererHeader).hostname;
        if (refHost && refHost !== request.nextUrl.hostname) {
          resolvedEntrySource = refererHeader;
        }
      } catch {
        // Malformed referer — ignore.
      }
    }
  }

  const setEntrySourceCookie = (res: NextResponse): void => {
    if (resolvedEntrySource && !entrySourceCookie) {
      res.cookies.set("entry_source", resolvedEntrySource, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        httpOnly: false, // useAnalytics + cart-session read it client-side
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        domain: apexDomain,
      });
    }
  };

  // Extract UTM parameters
  const campaignId = {
    key: "campaignId",
    value: searchParams.get("campaignId"),
  };
  const utmParams = ["utm_source", "utm_medium", "utm_campaign"]
    .map((param) => ({ key: param, value: searchParams.get(param) }))
    .filter(({ value }) => value !== null);

  const otherQueryParams = Array.from(searchParams.entries())
    .filter(
      ([key]) =>
        !key.startsWith("utm_") &&
        key.toLowerCase() !== "campaignid" &&
        key.toLowerCase() !== "itemid",
    )
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const itemId = searchParams.get("itemId");

  // Don't apply middleware to the cart-session page itself.
  // Still set UTM cookies and visitorHash on this response so they are
  // available when cart-session/page.tsx runs.
  if (pathname === "/cart-session") {
    const response = NextResponse.next();
    if (utmParams.length > 0) {
      utmParams.forEach(({ key, value }) => {
        response.cookies.set(key, value ?? "", { maxAge: 60 * 60 * 24 * 30 });
      });
    }
    if (campaignId.value) {
      response.cookies.set(campaignId.key, campaignId.value, {
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    setVisitorHashCookie(response);
    setEntrySourceCookie(response);
    return response;
  }

  // Feedback routes — set UTM and visitor cookies but never redirect
  const isFeedbackRoute =
    pathname.includes("/feedback") ||
    pathname.includes("/payment-status") ||
    pathname.includes("/free-order") ||
    pathname.includes("/phone-order");

  if (isFeedbackRoute) {
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
    setVisitorHashCookie(resp);
    setEntrySourceCookie(resp);
    return resp;
  }

  // Redirect to /cart-session when no cartId on menu/gift-cards routes
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
        response.cookies.set(key, value ?? "", { maxAge: 60 * 60 * 24 * 30 });
      });
    }
    if (campaignId.value) {
      response.cookies.set(campaignId.key, campaignId.value, {
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    // Critical: visitorHash must survive this redirect.
    // Previously used headers.append("set-cookie", rawHeader) with SameSite=Strict
    // which Instagram's browser drops. setVisitorHashCookie uses sameSite:"lax".
    setVisitorHashCookie(response);
    setEntrySourceCookie(response);
    return response;
  }

  // Default — all other routes
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
  setVisitorHashCookie(resp);
  setEntrySourceCookie(resp);
  return resp;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|cart-session).*)",
  ],
};
