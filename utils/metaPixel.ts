type MetaPixelStandardEvent = "AddToCart" | "InitiateCheckout" | "Purchase";

type MetaPixelValue =
  | string
  | number
  | boolean
  | null
  | MetaPixelValue[]
  | { [key: string]: MetaPixelValue };

type MetaPixelParams = Record<string, MetaPixelValue>;

type MetaPixelPayload = {
  eventName: MetaPixelStandardEvent;
  params: MetaPixelParams;
  eventID?: string;
};

type AnalyticsEventPayload = {
  eventType?: unknown;
  metadata?: unknown;
};

type CartAmounts = {
  subTotalAmt?: unknown;
  discAmt?: unknown;
  netAmt?: unknown;
  taxAmt?: unknown;
  tipAmt?: unknown;
  platformFeeAmt?: unknown;
  deliveryFeeAmt?: unknown;
  giftCardAmt?: unknown;
};

type MetaPixelOrderItem = {
  itemName?: string | null;
  itemPrice?: number | null;
  modifierGroups?: unknown;
  qty?: number | null;
};

type MetaPixelOrder = {
  _id?: string | null;
  orderId?: string | null;
  finalAmount?: number | null;
  grossAmount?: number | null;
  subTotalAmount?: number | null;
  discountAmount?: number | null;
  taxAmount?: number | null;
  tipAmount?: number | null;
  platformFees?: number | null;
  deliveryAmount?: number | null;
  refundAmount?: number | null;
  items?: MetaPixelOrderItem[] | null;
  status?: string | null;
};

type MetaPixelGiftCardPurchase = {
  _id?: string | null;
  code?: string | null;
  amount?: number | null;
  customerPaidAmount?: number | null;
  status?: string | null;
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const META_PIXEL_CURRENCY = "USD";
const PURCHASE_PENDING_KEY = "meta_pixel_pending_purchase_order_ids";
const PURCHASE_TRACKED_KEY = "meta_pixel_tracked_purchase_order_ids";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getString = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const getNumber = (value: unknown): number | undefined => {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return value;
};

const roundMoney = (value: number): number =>
  Number(Math.max(0, value).toFixed(2));

const isMetaPixelConfigured = (): boolean =>
  /^\d+$/.test(process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "");

const readStorageSet = (
  storage: Storage | undefined,
  key: string,
): Set<string> => {
  if (!storage) return new Set();

  try {
    const parsed = JSON.parse(storage.getItem(key) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter(Boolean) : []);
  } catch {
    return new Set();
  }
};

const writeStorageSet = (
  storage: Storage | undefined,
  key: string,
  values: Set<string>,
): void => {
  if (!storage) return;

  try {
    storage.setItem(key, JSON.stringify([...values]));
  } catch {
    // Tracking must not block checkout UX if storage is unavailable.
  }
};

const getStorage = (kind: "local" | "session"): Storage | undefined => {
  if (typeof window === "undefined") return undefined;
  return kind === "local" ? window.localStorage : window.sessionStorage;
};

const resolveCartValue = (amounts: CartAmounts): number | undefined => {
  const netAmt =
    getNumber(amounts.netAmt) ??
    ((getNumber(amounts.subTotalAmt) ?? 0) - (getNumber(amounts.discAmt) ?? 0));

  const total =
    netAmt +
    (getNumber(amounts.taxAmt) ?? 0) +
    (getNumber(amounts.tipAmt) ?? 0) +
    (getNumber(amounts.platformFeeAmt) ?? 0) +
    (getNumber(amounts.deliveryFeeAmt) ?? 0) -
    (getNumber(amounts.giftCardAmt) ?? 0);

  return Number.isFinite(total) ? roundMoney(total) : undefined;
};

const resolveOrderValue = (order: MetaPixelOrder): number => {
  const explicitValue =
    getNumber(order.finalAmount) ?? getNumber(order.grossAmount);
  if (explicitValue !== undefined) return roundMoney(explicitValue);

  const calculated =
    (getNumber(order.subTotalAmount) ?? 0) -
    (getNumber(order.discountAmount) ?? 0) +
    (getNumber(order.taxAmount) ?? 0) +
    (getNumber(order.tipAmount) ?? 0) +
    (getNumber(order.platformFees) ?? 0) +
    (getNumber(order.deliveryAmount) ?? 0) -
    (getNumber(order.refundAmount) ?? 0);

  return roundMoney(calculated);
};

const buildOrderContents = (items: MetaPixelOrderItem[] | null | undefined) =>
  (items ?? [])
    .map((item) => {
      const id = getString(item.itemName);
      if (!id) return null;

      return {
        id,
        quantity: Math.max(1, getNumber(item.qty) ?? 1),
        item_price: roundMoney(getNumber(item.itemPrice) ?? 0),
      };
    })
    .filter((item): item is { id: string; quantity: number; item_price: number } =>
      Boolean(item),
    );

export const buildMetaPixelPayloadFromAnalyticsEvent = (
  data: AnalyticsEventPayload,
): MetaPixelPayload | null => {
  if (!isRecord(data.metadata)) return null;

  if (data.eventType === "add_to_cart") {
    const id = getString(data.metadata.id) ?? getString(data.metadata.itemId);
    const name = getString(data.metadata.name);
    const contentId = id ?? name;
    if (!contentId) return null;

    const quantity = Math.max(
      1,
      getNumber(data.metadata.quantity) ?? getNumber(data.metadata.qty) ?? 1,
    );
    const value =
      getNumber(data.metadata.value) ??
      (() => {
        const price = getNumber(data.metadata.price);
        return price === undefined ? undefined : roundMoney(price * quantity);
      })();

    return {
      eventName: "AddToCart",
      params: {
        content_ids: [contentId],
        ...(name ? { content_name: name } : {}),
        content_type: "product",
        contents: [{ id: contentId, quantity }],
        currency: META_PIXEL_CURRENCY,
        ...(value !== undefined ? { value } : {}),
      },
    };
  }

  if (data.eventType === "checkout_started") {
    const cartAmounts = isRecord(data.metadata.cartAmounts)
      ? data.metadata.cartAmounts
      : {};
    const value = resolveCartValue(cartAmounts);
    const itemCount = getNumber(data.metadata.itemCount);

    return {
      eventName: "InitiateCheckout",
      params: {
        currency: META_PIXEL_CURRENCY,
        ...(itemCount !== undefined ? { num_items: itemCount } : {}),
        ...(value !== undefined ? { value } : {}),
      },
    };
  }

  return null;
};

export const buildMetaPixelPurchasePayload = (
  order: MetaPixelOrder,
): MetaPixelPayload => {
  const contents = buildOrderContents(order.items);
  const contentIds = contents.map((item) => item.id);
  const numItems = contents.reduce((total, item) => total + item.quantity, 0);

  return {
    eventName: "Purchase",
    params: {
      ...(contentIds.length > 0 ? { content_ids: contentIds } : {}),
      content_type: "product",
      ...(contents.length > 0 ? { contents } : {}),
      currency: META_PIXEL_CURRENCY,
      ...(numItems > 0 ? { num_items: numItems } : {}),
      value: resolveOrderValue(order),
    },
    eventID:
      getString(order._id ?? undefined) ?? getString(order.orderId ?? undefined),
  };
};

export const buildMetaPixelGiftCardPurchasePayload = (
  giftCard: MetaPixelGiftCardPurchase,
): MetaPixelPayload => {
  const value = roundMoney(
    getNumber(giftCard.customerPaidAmount) ?? getNumber(giftCard.amount) ?? 0,
  );

  return {
    eventName: "Purchase",
    params: {
      content_ids: ["gift_card"],
      content_name: "Gift Card",
      content_type: "product",
      contents: [{ id: "gift_card", quantity: 1, item_price: value }],
      currency: META_PIXEL_CURRENCY,
      num_items: 1,
      value,
    },
    eventID:
      getString(giftCard._id ?? undefined) ??
      getString(giftCard.code ?? undefined),
  };
};

export const trackMetaPixelEvent = ({
  eventName,
  params,
  eventID,
}: MetaPixelPayload): boolean => {
  if (typeof window === "undefined" || !isMetaPixelConfigured()) {
    return false;
  }

  const args = eventID
    ? (["track", eventName, params, { eventID }] as const)
    : (["track", eventName, params] as const);

  if (typeof window.fbq === "function") {
    window.fbq(...args);
    return true;
  }

  window.setTimeout(() => {
    if (typeof window.fbq === "function") {
      window.fbq?.(...args);
    }
  }, 500);

  return true;
};

export const trackMetaPixelFromAnalyticsEvent = (
  data: AnalyticsEventPayload,
): boolean => {
  const payload = buildMetaPixelPayloadFromAnalyticsEvent(data);
  return payload ? trackMetaPixelEvent(payload) : false;
};

export const markMetaPixelPurchasePending = (
  orderId: string | null | undefined,
): void => {
  const normalizedOrderId = getString(orderId);
  if (!normalizedOrderId) return;

  const storage = getStorage("session");
  const pendingOrders = readStorageSet(storage, PURCHASE_PENDING_KEY);
  pendingOrders.add(normalizedOrderId);
  writeStorageSet(storage, PURCHASE_PENDING_KEY, pendingOrders);
};

export const trackMetaPixelPurchase = (order: MetaPixelOrder): boolean => {
  const status = getString(order.status)?.toLowerCase();
  if (status?.includes("failed") || status?.includes("cancelled")) {
    return false;
  }

  const orderKeys = [
    getString(order._id ?? undefined),
    getString(order.orderId ?? undefined),
  ].filter((key): key is string => Boolean(key));
  if (orderKeys.length === 0) return false;

  const sessionStorage = getStorage("session");
  const localStorage = getStorage("local");
  const pendingOrders = readStorageSet(sessionStorage, PURCHASE_PENDING_KEY);
  const trackedOrders = readStorageSet(localStorage, PURCHASE_TRACKED_KEY);

  if (orderKeys.some((orderKey) => trackedOrders.has(orderKey))) return false;
  if (!orderKeys.some((orderKey) => pendingOrders.has(orderKey))) return false;

  const tracked = trackMetaPixelEvent(buildMetaPixelPurchasePayload(order));
  if (!tracked) return false;

  orderKeys.forEach((orderKey) => {
    pendingOrders.delete(orderKey);
    trackedOrders.add(orderKey);
  });
  writeStorageSet(sessionStorage, PURCHASE_PENDING_KEY, pendingOrders);
  writeStorageSet(localStorage, PURCHASE_TRACKED_KEY, trackedOrders);

  return true;
};

export const trackMetaPixelGiftCardPurchase = (
  giftCard: MetaPixelGiftCardPurchase,
): boolean => {
  const status = getString(giftCard.status)?.toLowerCase();
  if (status?.includes("failed") || status?.includes("cancelled")) {
    return false;
  }

  const purchaseKey =
    getString(giftCard._id ?? undefined) ??
    getString(giftCard.code ?? undefined);
  if (!purchaseKey) return false;

  const localStorage = getStorage("local");
  const trackedPurchases = readStorageSet(localStorage, PURCHASE_TRACKED_KEY);
  const storageKey = `gift_card:${purchaseKey}`;

  if (trackedPurchases.has(storageKey)) return false;

  const tracked = trackMetaPixelEvent(
    buildMetaPixelGiftCardPurchasePayload(giftCard),
  );
  if (!tracked) return false;

  trackedPurchases.add(storageKey);
  writeStorageSet(localStorage, PURCHASE_TRACKED_KEY, trackedPurchases);

  return true;
};
