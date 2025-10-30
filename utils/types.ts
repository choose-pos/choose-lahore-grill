import {
  AddressInfo,
  ItemOptionsEnum,
  LoyaltyRedeemType,
  OnlineOrderTimingConfig,
  OrderType,
  PriceTypeEnum,
  PromoDiscountType,
} from "@/generated/graphql";

export interface Address {
  addressLine1: string;
  addressLine2?: string;
  state: {
    stateName: string;
    stateId: string;
  };
  city: string;
  zipcode: number;
  coordinate?: {
    coordinates: number[];
  };
  place?: {
    placeId: string;
    displayName: string;
  };
}

interface SocialInfo {
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

export interface Availability {
  // _id:string;
  day: string;
  hours: Hours[];
  active: boolean;
}

interface Hours {
  start: string; // Assuming these should be strings
  end: string; // Assuming these should be strings
}

export interface CustomerRestaurant {
  name: string;
  _id: string;
  onlineOrderTimingConfig: OnlineOrderTimingConfig;
  restaurantConfigs: {
    pickup?: boolean | null;
    allowTips?: boolean | null;
    onlineOrdering?: boolean | null;
    scheduleOrders?: boolean | null;
  };
     processingConfig?: {
    feePercent?: number | null;
    maxFeeAmount?: number | null;
  };
  fulfillmentConfig: {
    prepTime?: number;
    deliveryTime?: number;
    largeOrderTreshold?: number;
    largeOrderExtraTime?: number;
  };
  deliveryConfig: {
    provideDelivery?: boolean | null;
    deliveryZone: {
      minimumOrderValue?: number | null;
    };
  };
  timezone: {
    timezoneName?: string;
  };
  address?: Address;
  brandingLogo?: string;
  website?: string;
  socialInfo?: SocialInfo;
  availability?: Availability[];
  category?: string[];
  beverageCategory?: string[];
  foodType?: string[];
  dineInCapacity?: number;
  type?: string;
  meatType?: string;
  taxRates?: {
    name: string;
    _id: string;
    salesTax: number;
  }[];
}
interface Item {
  name: string;
  _id: string;
  desc?: string | null;
  image?: string | null;
  price: number;
  options: {
    _id: string;
    displayName: string;
    status: boolean;
    type: ItemOptionsEnum;
  }[];
  orderLimitTracker?: number | null;
  modifierGroup?: {
    name: string;
  }[];
}

export interface CustomerCategoryItem {
  _id: string;
  name: string;
  desc?: string | null;
  items: Item[];
  availability?: Availability[]; // Optional array of Availability
  createdAt: Date; // Required Date
  updatedAt: Date; // Required Date
}

// Updated interfaces to include _id fields
interface Modifier {
  modifierName: string;
  modifierId: string | null;
  modifierPrice: number;
  modifierGroup: string;
  modifierGroupId: string | null;
}

export interface CartItem {
  itemName: string;
  itemId: string;
  itemQuantity: number;
  itemPrice: number;
  itemComment: string;
  modifiers: Modifier[];
}

interface ModifierType {
  __typename?: "Modifier";
  _id: string; // Added _id field
  name: string;
  desc?: string | null;
  price: number;
}

interface ModifierGroupType {
  __typename?: "ModifierGroup";
  _id: string; // Added _id field
  name: string;
  desc?: string | null;
}

interface CartModifier {
  modifierId: ModifierType;
  modifierGroupId: ModifierGroupType;
}

interface CartResponseItem {
  itemid: {
    _id: string;
    name: string;
    desc?: string | null;
  };
  comment?: string | null;
  modifiers?: CartModifier[] | null;
}

export interface CartResponse {
  getCartDetails: {
    items: CartResponseItem[];
  };
}

export interface GroupedCartItem {
  itemName: string;
  itemPrice: number;
  itemId: string;
  itemImage?: string | null | undefined;
  qty: number;
  remarks: string;
  _id: string;
  modifierGroups?: {
    name: string;
    price: number | null | undefined;
    _id: string;
    pricingType: PriceTypeEnum;
    selectedModifiers?: {
      mid: {
        name: string;
        price: number;
        _id: string;
      };
      qty: number;
    }[];
  }[];
}

type DiscountType = "FixedAmount" | "Percentage";

export interface PointsRedemption {
  _id: string;
  pointsThreshold: number;
  discountType: DiscountType;
  discountValue: number;
  uptoAmount?: number | null;
}

interface RedemptionItem {
  _id: string;
  name: string;
  image?: string | null;
}

export interface ItemRedemption {
  _id: string;
  item: RedemptionItem;
  pointsThreshold: number;
  image?: string | null;
}

export interface RestaurantRedeemOffers {
  pointsRedemptions: PointsRedemption[];
  itemRedemptions: ItemRedemption[];
}

export interface PromoData {
  code?: string | null;
  description?: string | null;
  isActive: boolean;
  minCartValue?: number | null;
  promoCodeDiscountType: PromoDiscountType;
  discountValue?: number | null;
  uptoAmount?: number | null;
  discountItem?: {
    name?: string | null;
    desc?: string | null;
    price?: number;
  };
}

export interface FetchCartDetails {
  customerDetails: {
    firstName?: string | null;
  };
  orderType?: OrderType | null;
  delivery?: AddressInfo | null;
  amounts: {
    subTotalAmount?: number | null;
    discountAmount?: number | null;
    discountPercent?: number | null;
    discountUpto?: number | null;
    tipPercent?: number | null;
  };
  discountString?: string | null;
  pickUpDateAndTime: string;
  deliveryDateAndTime: string;
  discountCode?: string;
  loyaltyRedeemPoints?: number | null;
  loyaltyType?: LoyaltyRedeemType | null;
  discountItemImage?: string | null;
}

export type TAmounts = {
  subTotalAmt: number;
  discAmt: number;
  netAmt: number;
  taxAmt: number;
  tipAmt: number;
  platformFeeAmt: number;
  deliveryFeeAmt: number | null;
};

// types.ts

export interface BlogImage {
  url: string;
}

export interface BlogContent {
  raw: any;
  text: string;
}

export interface BlogNode {
  title: string;
  slug: string;
  shortDescription: string;
  image: BlogImage;
  content: BlogContent;
}

export interface BlogEdge {
  node: BlogNode;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: number;
}

export interface BlogsConnection {
  edges: BlogEdge[];
}

export interface BlogsConnectionResponse {
  blogsConnection: BlogsConnection;
}

export interface BlogImage {
  url: string;
}

export interface BlogContent {
  raw: any;
  text: string;
}

export interface BlogNode {
  title: string;
  slug: string;
  shortDescription: string;
  image: BlogImage;
  content: BlogContent;
  blurHash: string;
  featuredBlog: boolean;
}

export interface BlogEdge {
  node: BlogNode;
}

export interface BlogContentSectionProps {
  blogs: BlogEdge[];
}

export interface IHomePage {
  title: string;
  subtitle: string;
  titleSlider2: string;
  titleSlider3: string;
  isVideo: boolean;
  heroBannerDesktop: {
    url: string;
  };
  heroBannerMobile: {
    url: string;
  };
  highlightSectionTitle: string;
  highlightSectionContent: string;
  highlightSectionImage: {
    url: string;
  };
  frameSectionTitle: string;
  frameSectionImage1: {
    url: string;
  };
  frameSectionImage2: {
    url: string;
  };
  frameSectionImage3: {
    url: string;
  };
  frameSectionImage4: {
    url: string;
  };
  offerSectionTitle: string;
  offerSectionContent: string;
  offerSectionSubContent: string;
  offerSectionImage: {
    url: string;
  };
  operationalHours: {
    raw: string;
    html: string;
    text: string;
  };
  contactDetail: string;
  address: string;
  ctaImage: {
    url: string;
  };
  imageSlider1?: {
    url: string;
  };
  imageSlider2?: {
    url: string;
  };
  imageSlider3?: {
    url: string;
  };

  eventSectionVideo: {
    url: string;
  };
  imageSliderBlurHash1: string;
  imageSliderBlurHash2: string;
  imageSliderBlurHash3: string;
  frameSection1BlurHash: string;
  frameSection2BlurHash: string;
  frameSection3BlurHash: string;
  frameSection4BlurHash: string;
  ctaImageBlurHash: string;
  aboutUsTitle: string;
  aboutUsContent: string;
  cateringSectionTitle: string;
  cateringSectionContent: string;
  eventSectionHash: string;
  eventsCatered: number;
  biryanisServed: number;
  guestsServed: number;
  heroBannerDesktop2: {
    url: string;
  };
  heroBannerMobile2: {
    url: string;
  };
  heroBannerDesktop3: {
    url: string;
  };
  heroBannerMobile3: {
    url: string;
  };
  instagramLink: string;
  facebookLink: string;
  orderNowLink: string;
}
