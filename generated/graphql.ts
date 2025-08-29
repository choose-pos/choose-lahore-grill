import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTimeISO: { input: any; output: any; }
  JSONObject: { input: any; output: any; }
};

export type AccessHistory = {
  __typename?: 'AccessHistory';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['DateTimeISO']['output'];
  device: DeviceInfo;
};

export type AccountPreference = {
  __typename?: 'AccountPreference';
  email: Scalars['Boolean']['output'];
  sms: Scalars['Boolean']['output'];
};

export type AccountPreferenceInput = {
  email: Scalars['Boolean']['input'];
  sms: Scalars['Boolean']['input'];
};

export type AddressInfo = {
  __typename?: 'AddressInfo';
  _id: Scalars['ID']['output'];
  addressLine1: Scalars['String']['output'];
  addressLine2?: Maybe<Scalars['String']['output']>;
  city: Scalars['String']['output'];
  coordinate?: Maybe<LocationCommon>;
  place?: Maybe<Places>;
  state: StateData;
  zipcode: Scalars['Float']['output'];
};

export type AddressInfoInput = {
  addressLine1: Scalars['String']['input'];
  addressLine2?: InputMaybe<Scalars['String']['input']>;
  city: Scalars['String']['input'];
  coordinate: LocationCommonInput;
  place: PlaceInput;
  state: StateDataInput;
  zipcode: Scalars['Float']['input'];
};

export type Admin = {
  __typename?: 'Admin';
  _id: Scalars['ID']['output'];
  accessHistory?: Maybe<Array<AccessHistory>>;
  blockedBy: Admin;
  createdAt: Scalars['DateTimeISO']['output'];
  createdBy: Admin;
  email: Scalars['String']['output'];
  lastLoggedIn?: Maybe<Scalars['DateTimeISO']['output']>;
  lastLoggedOut?: Maybe<Scalars['DateTimeISO']['output']>;
  name: Scalars['String']['output'];
  role: AdminRole;
  status: AdminStatus;
  unBlockedBy: Admin;
  updatedAt: Scalars['DateTimeISO']['output'];
  updatedBy: Admin;
};

/** Types of Admin Roles */
export enum AdminRole {
  Admin = 'Admin',
  Master = 'Master',
  Normal = 'Normal'
}

/** Types of status for Admin */
export enum AdminStatus {
  Active = 'active',
  Blocked = 'blocked'
}

export type Alerts = {
  __typename?: 'Alerts';
  email?: Maybe<Scalars['String']['output']>;
  status: Scalars['Boolean']['output'];
};

export type AmountDetails = {
  __typename?: 'AmountDetails';
  discountAmount?: Maybe<Scalars['Float']['output']>;
  discountPercent?: Maybe<Scalars['Float']['output']>;
  discountUpto?: Maybe<Scalars['Float']['output']>;
  subTotalAmount?: Maybe<Scalars['Float']['output']>;
  tipPercent: Scalars['Float']['output'];
};

export type AmountDetailsInput = {
  deliveryAmount?: InputMaybe<Scalars['Float']['input']>;
  discountAmount?: InputMaybe<Scalars['Float']['input']>;
  discountPercent?: InputMaybe<Scalars['Float']['input']>;
  discountUpto?: InputMaybe<Scalars['Float']['input']>;
  subTotalAmount?: InputMaybe<Scalars['Float']['input']>;
  tipAmount?: InputMaybe<Scalars['Float']['input']>;
  tipPercent?: InputMaybe<Scalars['Float']['input']>;
};

export type Availability = {
  __typename?: 'Availability';
  _id: Scalars['ID']['output'];
  active: Scalars['Boolean']['output'];
  day: Scalars['String']['output'];
  hours: Array<Hours>;
};

/** Restaurant beverage category type enum. */
export enum BeverageCategory {
  Alcohol = 'Alcohol',
  NonAlcohol = 'NonAlcohol'
}

export type Business = {
  __typename?: 'Business';
  _id: Scalars['ID']['output'];
  address?: Maybe<AddressInfo>;
  businessName?: Maybe<Scalars['String']['output']>;
  businessType?: Maybe<BusinessTypeEnum>;
  createdAt: Scalars['DateTimeISO']['output'];
  employeeSize?: Maybe<StaffCountEnum>;
  estimatedRevenue?: Maybe<EstimatedRevenueEnum>;
  identifierInfo?: Maybe<IdentifierInfo>;
  updatedAt: Scalars['DateTimeISO']['output'];
  updatedBy?: Maybe<User>;
  user: UserInfo;
};

/** Business type enum */
export enum BusinessTypeEnum {
  CCorp = 'CCorp',
  Llc = 'LLC',
  Partnership = 'Partnership',
  SCorp = 'SCorp',
  SolePartnership = 'SolePartnership'
}

export type CampaignDetails = {
  __typename?: 'CampaignDetails';
  campaignId?: Maybe<Scalars['String']['output']>;
  setAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export type Cart = {
  __typename?: 'Cart';
  _id: Scalars['ID']['output'];
  abandonmentCheckScheduled: Scalars['DateTimeISO']['output'];
  abandonmentEmailSent: Scalars['Boolean']['output'];
  amounts: AmountDetails;
  campaignDetails: CampaignDetails;
  createdAt: Scalars['DateTimeISO']['output'];
  customerDetails: CustomerDetails;
  delivery?: Maybe<AddressInfo>;
  deliveryDateAndTime?: Maybe<Scalars['DateTimeISO']['output']>;
  deliveryPartnerType?: Maybe<DeliveryPartnerTypeEnum>;
  discountCode?: Maybe<Scalars['String']['output']>;
  discountItemImage?: Maybe<Scalars['String']['output']>;
  discountString?: Maybe<Scalars['String']['output']>;
  isTimingAsap: Scalars['Boolean']['output'];
  items: Array<CartItem>;
  itemsHash: Scalars['String']['output'];
  itemsUpdatedAt: Scalars['DateTimeISO']['output'];
  loyaltyRedeemPoints?: Maybe<Scalars['Float']['output']>;
  loyaltyType?: Maybe<LoyaltyRedeemType>;
  orderType?: Maybe<OrderType>;
  pickUpDateAndTime?: Maybe<Scalars['DateTimeISO']['output']>;
  queryRecord?: Maybe<Scalars['JSONObject']['output']>;
  restaurant: Restaurant;
  updatedAt: Scalars['DateTimeISO']['output'];
  utmDetails: UtmDetails;
};

export type CartItem = {
  __typename?: 'CartItem';
  _id: Scalars['ID']['output'];
  categoryId?: Maybe<Scalars['ID']['output']>;
  itemId: Item;
  modifierGroups: Array<CartModifierGroups>;
  qty: Scalars['Float']['output'];
  remarks?: Maybe<Scalars['String']['output']>;
};

export type CartItemInput = {
  categoryId?: InputMaybe<Scalars['String']['input']>;
  itemId: Scalars['ID']['input'];
  modifierGroups?: Array<CartModifierGroupsInput>;
  qty?: Scalars['Float']['input'];
  remarks?: InputMaybe<Scalars['String']['input']>;
};

export type CartModifierGroups = {
  __typename?: 'CartModifierGroups';
  _id: Scalars['ID']['output'];
  mgId: ModifierGroup;
  selectedModifiers: Array<CartModifiers>;
};

export type CartModifierGroupsInput = {
  mgId: Scalars['ID']['input'];
  selectedModifiers?: Array<CartModifiersInput>;
};

export type CartModifiers = {
  __typename?: 'CartModifiers';
  _id: Scalars['ID']['output'];
  mid: Modifier;
  qty: Scalars['Float']['output'];
};

export type CartModifiersInput = {
  mid: Scalars['ID']['input'];
  qty?: Scalars['Float']['input'];
};

export type Category = {
  __typename?: 'Category';
  _id: Scalars['ID']['output'];
  availability?: Maybe<Array<Availability>>;
  createdAt: Scalars['DateTimeISO']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  items: Array<ItemInfo>;
  menu?: Maybe<Array<Menu>>;
  name: Scalars['String']['output'];
  posId?: Maybe<Scalars['String']['output']>;
  restaurantId: Restaurant;
  status: StatusEnum;
  upSellCategories?: Maybe<Array<Category>>;
  updatedAt: Scalars['DateTimeISO']['output'];
  updatedBy?: Maybe<User>;
  user: User;
  visibility: Array<Visibility>;
};

export type CategoryInfo = {
  __typename?: 'CategoryInfo';
  _id: Category;
  id: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  order: Scalars['Float']['output'];
  status: StatusEnum;
};

export type CategoryItem = {
  __typename?: 'CategoryItem';
  _id: Scalars['ID']['output'];
  availability?: Maybe<Array<Availability>>;
  createdAt: Scalars['DateTimeISO']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  items: Array<Item>;
  menu?: Maybe<Array<Menu>>;
  name: Scalars['String']['output'];
  restaurantId: Restaurant;
  status: StatusEnum;
  upSellCategories?: Maybe<Array<Category>>;
  updatedAt: Scalars['DateTimeISO']['output'];
  updatedBy?: Maybe<User>;
  user: User;
  visibility: Array<Visibility>;
};

export type CmsButton = {
  __typename?: 'CmsButton';
  link?: Maybe<Scalars['String']['output']>;
  textColor?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type CmsContactInput = {
  details: Scalars['String']['input'];
  email: Scalars['String']['input'];
  enquiryType: Scalars['String']['input'];
  name: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export type CmsContentSection = {
  __typename?: 'CmsContentSection';
  navTitle: Scalars['String']['output'];
  sectionContent: Scalars['String']['output'];
  sectionTitle: Scalars['String']['output'];
  show: Scalars['Boolean']['output'];
};

export type CmsContentWithImageItem = {
  __typename?: 'CmsContentWithImageItem';
  _id: Scalars['ID']['output'];
  image: CmsImage;
  sectionContent: Scalars['String']['output'];
  sectionTitle: Scalars['String']['output'];
  side: CmsSectionSideEnum;
};

export type CmsContentWithImageSection = {
  __typename?: 'CmsContentWithImageSection';
  contentItems: Array<CmsContentWithImageItem>;
  navTitle: Scalars['String']['output'];
  show: Scalars['Boolean']['output'];
};

export type CmsDomainConfig = {
  __typename?: 'CmsDomainConfig';
  customDomain: Scalars['Boolean']['output'];
  customDomainApproved: Scalars['Boolean']['output'];
  customDomainwebsite?: Maybe<Scalars['String']['output']>;
  website: Scalars['String']['output'];
};

export type CmsGridItem = {
  __typename?: 'CmsGridItem';
  description: Scalars['String']['output'];
  image: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type CmsGridSection = {
  __typename?: 'CmsGridSection';
  grid1: CmsGridItem;
  grid2: CmsGridItem;
  grid3: CmsGridItem;
  navTitle: Scalars['String']['output'];
  sectionTitle: Scalars['String']['output'];
  show: Scalars['Boolean']['output'];
};

export type CmsHeroItem = {
  __typename?: 'CmsHeroItem';
  _id: Scalars['ID']['output'];
  button: CmsButton;
  caption: Scalars['String']['output'];
  image: CmsImage;
  title: Scalars['String']['output'];
};

export type CmsHeroSection = {
  __typename?: 'CmsHeroSection';
  heroItems: Array<CmsHeroItem>;
  navTitle: Scalars['String']['output'];
  show: Scalars['Boolean']['output'];
};

export type CmsImage = {
  __typename?: 'CmsImage';
  desktop: Scalars['String']['output'];
  mobile?: Maybe<Scalars['String']['output']>;
};

export type CmsMenuItem = {
  __typename?: 'CmsMenuItem';
  description: Scalars['String']['output'];
  image: Scalars['String']['output'];
  item: Item;
  title: Scalars['String']['output'];
};

export type CmsMenuSection = {
  __typename?: 'CmsMenuSection';
  items: Array<CmsMenuItem>;
  navTitle: Scalars['String']['output'];
  sectionTitle: Scalars['String']['output'];
  show: Scalars['Boolean']['output'];
};

export type CmsOnlineOrderingConfig = {
  __typename?: 'CmsOnlineOrderingConfig';
  primaryTextColor: Scalars['String']['output'];
  websiteLink: Scalars['String']['output'];
};

export type CmsPopupContent = {
  __typename?: 'CmsPopupContent';
  button: PromoCmsButton;
  description: Scalars['String']['output'];
  image?: Maybe<CmsImage>;
  isVerticallyAligned: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
};

export type CmsPromoPopup = {
  __typename?: 'CmsPromoPopup';
  _id: Scalars['ID']['output'];
  content: CmsPopupContent;
  createdAt: Scalars['DateTimeISO']['output'];
  restaurant: Restaurant;
  status: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTimeISO']['output'];
  updatedBy?: Maybe<User>;
  user: User;
};

export type CmsPromoRoutes = {
  __typename?: 'CmsPromoRoutes';
  PromoImageSection: Array<CmsImage>;
  _id: Scalars['ID']['output'];
  createdAt: Scalars['DateTimeISO']['output'];
  ctaSection: CtaSection;
  heroTitle: Scalars['String']['output'];
  name: Scalars['String']['output'];
  restaurant: Restaurant;
  slug: Scalars['String']['output'];
  status: Scalars['Boolean']['output'];
  termsAndConditionSection: TermsAndConditionSection;
  updatedAt: Scalars['DateTimeISO']['output'];
  updatedBy?: Maybe<User>;
  user: User;
  websiteSeo: CmsWebsiteSeoConfig;
};

export type CmsRestaurant = {
  __typename?: 'CmsRestaurant';
  _id: Scalars['ID']['output'];
  contentSection?: Maybe<CmsContentSection>;
  contentWithImageSection: CmsContentWithImageSection;
  createdAt: Scalars['DateTimeISO']['output'];
  domainConfig: CmsDomainConfig;
  favicon?: Maybe<Scalars['String']['output']>;
  gridSection: CmsGridSection;
  heroSection: CmsHeroSection;
  isCustom: Scalars['Boolean']['output'];
  menuSection: CmsMenuSection;
  onlineOrderingConfig: CmsOnlineOrderingConfig;
  restaurant: Restaurant;
  reviewSection: CmsReviewSection;
  themeConfig: CmsThemeConfig;
  updatedAt: Scalars['DateTimeISO']['output'];
  updatedBy?: Maybe<User>;
  user: User;
  websiteSeo: CmsWebsiteSeoConfig;
};

export type CmsReviewItem = {
  __typename?: 'CmsReviewItem';
  _id: Scalars['ID']['output'];
  content: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type CmsReviewSection = {
  __typename?: 'CmsReviewSection';
  navTitle: Scalars['String']['output'];
  reviews: Array<CmsReviewItem>;
  show: Scalars['Boolean']['output'];
};

/** Enum for diffferent sides of a section */
export enum CmsSectionSideEnum {
  Left = 'left',
  Right = 'right'
}

export type CmsThemeConfig = {
  __typename?: 'CmsThemeConfig';
  background: Scalars['String']['output'];
  primary: Scalars['String']['output'];
  secondary: Scalars['String']['output'];
  text: Scalars['String']['output'];
  theme: WebsiteThemeEnum;
};

export type CmsWebsiteSeoConfig = {
  __typename?: 'CmsWebsiteSeoConfig';
  metaDescription: Scalars['String']['output'];
  pageTitle: Scalars['String']['output'];
};

export type Contact = {
  __typename?: 'Contact';
  name: Scalars['String']['output'];
  phoneNumber: Scalars['String']['output'];
};

/** Types of Usage Filters for Promo Codes */
export enum CouponUsageType {
  DeliveryOrder = 'DeliveryOrder',
  EntireSale = 'EntireSale',
  SpecificCategory = 'SpecificCategory',
  SpecificItem = 'SpecificItem'
}

export type Courier = {
  __typename?: 'Courier';
  location: Location;
  name: Scalars['String']['output'];
  phoneNumber: Scalars['String']['output'];
  vehicleType?: Maybe<Scalars['String']['output']>;
};

export type CreateOrderInput = {
  discount?: InputMaybe<DiscountInput>;
  guestCustomerDetails?: InputMaybe<CustomerDetailsInput>;
  paymentIntentId: Scalars['String']['input'];
  specialRemark?: InputMaybe<Scalars['String']['input']>;
};

export type CreateOrderWihoutPaymentInput = {
  discount?: InputMaybe<DiscountInput>;
  guestCustomerDetails?: InputMaybe<CustomerDetailsInput>;
  specialRemark?: InputMaybe<Scalars['String']['input']>;
};

export type CtaSection = {
  __typename?: 'CtaSection';
  button: PromoCmsButton;
  description: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type CuisineData = {
  __typename?: 'CuisineData';
  cuisineId: Scalars['String']['output'];
  cuisineName: Scalars['String']['output'];
};

export type Customer = {
  __typename?: 'Customer';
  _id: Scalars['ID']['output'];
  accountPreferences?: Maybe<AccountPreference>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  dob?: Maybe<Scalars['DateTimeISO']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  loyaltyWallet?: Maybe<CustomerLoyaltyWallet>;
  orderHistory?: Maybe<Array<Order>>;
  phone: Scalars['String']['output'];
  restaurant?: Maybe<Restaurant>;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export type CustomerBehavior = {
  __typename?: 'CustomerBehavior';
  _id: Scalars['ID']['output'];
  customerBehaviorAmount: Scalars['Float']['output'];
  customerBehaviorType: CustomerBehaviorType;
  points: Scalars['Float']['output'];
};

export enum CustomerBehaviorType {
  Aipo = 'AIPO',
  Aov = 'AOV',
  Ltv = 'LTV',
  OfferTake = 'OFFER_TAKE'
}

export type CustomerCart = {
  __typename?: 'CustomerCart';
  cartData: Array<CartItem>;
  message?: Maybe<Scalars['String']['output']>;
};

export type CustomerDetails = {
  __typename?: 'CustomerDetails';
  customer?: Maybe<Customer>;
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  isGuest: Scalars['Boolean']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['Float']['output']>;
};

export type CustomerDetailsInput = {
  accountPreferences?: AccountPreferenceInput;
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  otp: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export type CustomerLoginVerificationInput = {
  contact: Scalars['String']['input'];
  otp: Scalars['String']['input'];
};

export type CustomerLoyaltyWallet = {
  __typename?: 'CustomerLoyaltyWallet';
  Transaction: Array<LoyaltyPointsTransaction>;
  _id: Scalars['ID']['output'];
  balance: Scalars['Float']['output'];
  createdAt: Scalars['DateTimeISO']['output'];
  customer: Customer;
  lifeTimePointsEarned: Scalars['Float']['output'];
  restaurant: Restaurant;
  updatedAt: Scalars['DateTimeISO']['output'];
};

export type CustomerReceiptInfo = {
  __typename?: 'CustomerReceiptInfo';
  email?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
};

export type CustomerSignupInput = {
  accountPreferences?: AccountPreferenceInput;
  dob: Scalars['DateTimeISO']['input'];
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export type CustomerSignupVerificationInput = {
  accountPreferences?: AccountPreferenceInput;
  dob: Scalars['DateTimeISO']['input'];
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  otp: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

/** The day */
export enum Day {
  Friday = 'Friday',
  Monday = 'Monday',
  Saturday = 'Saturday',
  Sunday = 'Sunday',
  Thursday = 'Thursday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday'
}

export type Delivery = {
  __typename?: 'Delivery';
  _id: Scalars['ID']['output'];
  courier?: Maybe<Courier>;
  createdAt: Scalars['DateTimeISO']['output'];
  currency: Scalars['String']['output'];
  deliveryId: Scalars['String']['output'];
  dropoff: Dropoff;
  fee: Scalars['Float']['output'];
  order?: Maybe<Order>;
  pickup: Pickup;
  quoteId: Scalars['String']['output'];
  restaurant: Restaurant;
  status: DeliveryStatusEnum;
  trackingUrl: Scalars['String']['output'];
  updatedAt: Scalars['DateTimeISO']['output'];
};

export type DeliveryAddress = {
  __typename?: 'DeliveryAddress';
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  state: Scalars['String']['output'];
  streetAddress1: Scalars['String']['output'];
  streetAddress2?: Maybe<Scalars['String']['output']>;
  zipCode: Scalars['String']['output'];
};

export type DeliveryConfig = {
  __typename?: 'DeliveryConfig';
  deliveryZone?: Maybe<Array<DeliveryZone>>;
  provideDelivery?: Maybe<Scalars['Boolean']['output']>;
};

export type DeliveryEvent = {
  __typename?: 'DeliveryEvent';
  meta?: Maybe<Scalars['JSONObject']['output']>;
  status: DeliveryStatusOrder;
  timestamp?: Maybe<Scalars['DateTimeISO']['output']>;
  value: Scalars['Boolean']['output'];
};

export enum DeliveryPartnerTypeEnum {
  Doordash = 'doordash',
  Grubhub = 'grubhub',
  Ubereats = 'ubereats'
}

export enum DeliveryStatusEnum {
  Canceled = 'Canceled',
  Delivered = 'Delivered',
  Dropoff = 'Dropoff',
  Pending = 'Pending',
  Pickup = 'Pickup',
  PickupComplete = 'PickupComplete',
  Returned = 'Returned'
}

/** Type of DeliveryStatusOrder of the order */
export enum DeliveryStatusOrder {
  DeliveryDriverAssigned = 'DELIVERY_DRIVER_ASSIGNED',
  DeliveryDriverComingForPickup = 'DELIVERY_DRIVER_COMING_FOR_PICKUP',
  DeliveryDriverLeftForDropoff = 'DELIVERY_DRIVER_LEFT_FOR_DROPOFF',
  DeliveryRequestRaised = 'DELIVERY_REQUEST_RAISED',
  OrderCancelled = 'ORDER_CANCELLED',
  OrderDelivered = 'ORDER_DELIVERED'
}

export type DeliveryZone = {
  __typename?: 'DeliveryZone';
  _id: Scalars['ID']['output'];
  costCovered?: Maybe<Scalars['Float']['output']>;
  minimumOrderValue?: Maybe<Scalars['Float']['output']>;
  provider?: Maybe<Scalars['String']['output']>;
  radius?: Maybe<Scalars['Float']['output']>;
};

export type DeviceInfo = {
  __typename?: 'DeviceInfo';
  _id: Scalars['ID']['output'];
  deviceName: Scalars['String']['output'];
  deviceOS: Scalars['String']['output'];
  type: Scalars['String']['output'];
  uniqueId: Scalars['String']['output'];
};

export type DiscountData = {
  __typename?: 'DiscountData';
  discountAmount: Scalars['Float']['output'];
  discountType: OrderDiscountType;
  loyaltyData?: Maybe<LoyaltyRedeemData>;
  promoData?: Maybe<PromoCodeData>;
};

export type DiscountInput = {
  discountType: OrderDiscountType;
  loyaltyInput?: InputMaybe<LoyaltyInput>;
  promoCode?: InputMaybe<Scalars['String']['input']>;
};

/** Types of Discount */
export enum DiscountType {
  FixedAmount = 'FixedAmount',
  Percentage = 'Percentage'
}

export type Dropoff = {
  __typename?: 'Dropoff';
  address: DeliveryAddress;
  contact: Contact;
  location: Location;
  notes?: Maybe<Scalars['String']['output']>;
};

/** Enum used for storing static values of Estimated Revenue */
export enum EstimatedRevenueEnum {
  Above1500K = 'Above1500K',
  From100Kto300K = 'From100Kto300K',
  From301Kto500K = 'From301Kto500K',
  From501Kto750K = 'From501Kto750K',
  From751Kto1500K = 'From751Kto1500K',
  PreRevenue = 'PreRevenue'
}

/** Restaurant food type enum. */
export enum FoodType {
  Jain = 'Jain',
  NonVegetarian = 'NonVegetarian',
  Vegan = 'Vegan',
  Vegetarian = 'Vegetarian'
}

export type FulfillmentConfig = {
  __typename?: 'FulfillmentConfig';
  deliveryTime?: Maybe<Scalars['Float']['output']>;
  largeOrderExtraTime?: Maybe<Scalars['Float']['output']>;
  largeOrderTreshold?: Maybe<Scalars['Float']['output']>;
  prepTime?: Maybe<Scalars['Float']['output']>;
};

export type GuestData = {
  __typename?: 'GuestData';
  accountPreferences?: Maybe<AccountPreference>;
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  phone: Scalars['String']['output'];
};

export type Hours = {
  __typename?: 'Hours';
  end: Scalars['String']['output'];
  start: Scalars['String']['output'];
};

export type IdentifierInfo = {
  __typename?: 'IdentifierInfo';
  createdAt: Scalars['DateTimeISO']['output'];
  description: Scalars['String']['output'];
  identifier: Scalars['String']['output'];
  identifierType: IdentifierTypeEnum;
  updatedBy?: Maybe<User>;
};

/** Enum used for storing Types of identifiers */
export enum IdentifierTypeEnum {
  Ein = 'EIN',
  Others = 'OTHERS',
  Ssn = 'SSN'
}

export type Integration = {
  __typename?: 'Integration';
  _id: Scalars['ID']['output'];
  connectionStatus: IntegrationConnectionStatusEnum;
  createdAt: Scalars['DateTimeISO']['output'];
  platform: IntegrationPlatformEnum;
  restaurantId: Restaurant;
  updatedAt: Scalars['DateTimeISO']['output'];
  updatedBy?: Maybe<User>;
  user: User;
};

/** IntegrationConnection Status enum type  */
export enum IntegrationConnectionStatusEnum {
  Connected = 'Connected',
  Error = 'Error',
  Expired = 'Expired',
  NotConnected = 'NotConnected'
}

export type IntegrationInfo = {
  __typename?: 'IntegrationInfo';
  _id: Integration;
  connectionStatus: IntegrationConnectionStatusEnum;
  id: Scalars['String']['output'];
  platform: IntegrationPlatformEnum;
};

/** Integration Platform enum type  */
export enum IntegrationPlatformEnum {
  Clover = 'Clover',
  Shift4You = 'Shift4You',
  Square = 'Square',
  Toast = 'Toast',
  TouchBistro = 'TouchBistro'
}

export type Item = {
  __typename?: 'Item';
  _id: Scalars['ID']['output'];
  availability?: Maybe<Array<Availability>>;
  category?: Maybe<Array<Category>>;
  createdAt: Scalars['DateTimeISO']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  modifierGroup: Array<ModifierGroupInfo>;
  name: Scalars['String']['output'];
  options: Array<Options>;
  orderLimit?: Maybe<Scalars['Float']['output']>;
  orderLimitTracker?: Maybe<Scalars['Float']['output']>;
  posId?: Maybe<Scalars['String']['output']>;
  posTag?: Maybe<Array<PosItemTag>>;
  price: Scalars['Float']['output'];
  priceOptions: Array<PriceOptions>;
  restaurantId: Restaurant;
  status: StatusEnum;
  subCategory?: Maybe<ItemSubCategory>;
  upSellItems?: Maybe<Array<UpSellItem>>;
  updatedAt: Scalars['DateTimeISO']['output'];
  updatedBy?: Maybe<User>;
  user: User;
  visibility: Array<Visibility>;
};

export type ItemInfo = {
  __typename?: 'ItemInfo';
  _id: Item;
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  order: Scalars['Float']['output'];
  price: Scalars['Float']['output'];
  status: StatusEnum;
};

/** Enum to store the options for menu items */
export enum ItemOptionsEnum {
  ContainsDairy = 'ContainsDairy',
  HasNuts = 'HasNuts',
  IsGlutenFree = 'IsGlutenFree',
  IsHalal = 'IsHalal',
  IsSpicy = 'IsSpicy',
  IsVegan = 'IsVegan',
  PopularItem = 'PopularItem',
  UpSellItem = 'UpSellItem'
}

export type ItemSubCategory = {
  __typename?: 'ItemSubCategory';
  desc?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type ItemWithModifiersResponse = {
  __typename?: 'ItemWithModifiersResponse';
  availability?: Maybe<Array<Availability>>;
  desc?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  modifierGroups: Array<ModifierGroupResponse>;
  name: Scalars['String']['output'];
  options: Array<Options>;
  price: Scalars['Float']['output'];
  upSellItems?: Maybe<Array<UpSellReturnItem>>;
};

export type Location = {
  __typename?: 'Location';
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
};

export type LocationCommon = {
  __typename?: 'LocationCommon';
  coordinates: Array<Scalars['Float']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type LocationCommonInput = {
  coordinates: Array<Scalars['Float']['input']>;
};

export type LoyaltyConfig = {
  __typename?: 'LoyaltyConfig';
  _id: Scalars['ID']['output'];
  alerts: Alerts;
  createdAt: Scalars['DateTimeISO']['output'];
  itemRedemptions: Array<LoyaltyItemRedemption>;
  loyaltyRules: Array<LoyaltyRule>;
  pointsRedemptions: Array<LoyaltyPointsRedemption>;
  programSettings: ProgramSettings;
  restaurant: Restaurant;
  updatedAt: Scalars['DateTimeISO']['output'];
};

export type LoyaltyInput = {
  loyaltyPointsRedeemed: Scalars['Float']['input'];
  redeemType: LoyaltyRedeemType;
};

export type LoyaltyItemRedemption = {
  __typename?: 'LoyaltyItemRedemption';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['DateTimeISO']['output'];
  item: Item;
  pointsThreshold: Scalars['Float']['output'];
  restaurant: Restaurant;
  updatedAt: Scalars['DateTimeISO']['output'];
};

export type LoyaltyPointsRedemption = {
  __typename?: 'LoyaltyPointsRedemption';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['DateTimeISO']['output'];
  discountType: DiscountType;
  discountValue: Scalars['Float']['output'];
  pointsThreshold: Scalars['Float']['output'];
  restaurant: Restaurant;
  updatedAt: Scalars['DateTimeISO']['output'];
  uptoAmount?: Maybe<Scalars['Float']['output']>;
};

export type LoyaltyPointsTransaction = {
  __typename?: 'LoyaltyPointsTransaction';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['DateTimeISO']['output'];
  customer?: Maybe<Customer>;
  order?: Maybe<Order>;
  points: Scalars['Float']['output'];
  restaurant?: Maybe<Restaurant>;
  transactionType: TransactionType;
};

export type LoyaltyRedeemData = {
  __typename?: 'LoyaltyRedeemData';
  loyaltyPointsRedeemed: Scalars['Float']['output'];
  redeemDiscount?: Maybe<RedeemDiscount>;
  redeemItem?: Maybe<RedeemItem>;
  redeemType: LoyaltyRedeemType;
};

/** Type of redeem(Item or discount) */
export enum LoyaltyRedeemType {
  Discount = 'DISCOUNT',
  Item = 'ITEM'
}

export type LoyaltyRule = {
  __typename?: 'LoyaltyRule';
  _id: Scalars['ID']['output'];
  customerBehaviorConfig?: Maybe<Array<CustomerBehavior>>;
  isLoyaltyTypeActive: Scalars['Boolean']['output'];
  milestones?: Maybe<Array<MilestoneConfig>>;
  rewardPoints?: Maybe<Scalars['Float']['output']>;
  type: LoyaltyRuleType;
};

/** Types of Loyalty Rules */
export enum LoyaltyRuleType {
  PointsForBirthday = 'PointsForBirthday',
  PointsForCustomerBehavior = 'PointsForCustomerBehavior',
  PointsForMilestones = 'PointsForMilestones',
  PointsForSignup = 'PointsForSignup',
  PointsPerOrder = 'PointsPerOrder'
}

export type LoyaltyRules = {
  __typename?: 'LoyaltyRules';
  onBirthdayRewardActive: Scalars['Boolean']['output'];
  onBirthdayRewardValue: Scalars['Float']['output'];
  onOrderRewardActive: Scalars['Boolean']['output'];
  onOrderRewardValue: Scalars['Float']['output'];
  programDesc: Scalars['String']['output'];
  programName: Scalars['String']['output'];
  signUpRewardActive: Scalars['Boolean']['output'];
  signUpRewardValue: Scalars['Float']['output'];
};

export type LoyaltyTransactionSummary = {
  __typename?: 'LoyaltyTransactionSummary';
  points: Scalars['Float']['output'];
  transactionType: TransactionType;
};

/** Restaurant Meat type enum. */
export enum MeatType {
  Halal = 'Halal',
  NonHalal = 'NonHalal'
}

export type Menu = {
  __typename?: 'Menu';
  _id: Scalars['ID']['output'];
  availability?: Maybe<Array<Availability>>;
  categories: Array<CategoryInfo>;
  createdAt: Scalars['DateTimeISO']['output'];
  name: Scalars['String']['output'];
  restaurantId: Restaurant;
  status: StatusEnum;
  taxes?: Maybe<TaxRateInfo>;
  type: MenuTypeEnum;
  updatedAt: Scalars['DateTimeISO']['output'];
  updatedBy?: Maybe<User>;
  user: User;
};

export type MenuInfo = {
  __typename?: 'MenuInfo';
  _id: Menu;
  id: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  type: MenuTypeEnum;
};

/** Menu type enum */
export enum MenuTypeEnum {
  Catering = 'Catering',
  DineIn = 'DineIn',
  OnlineOrdering = 'OnlineOrdering'
}

export type MilestoneConfig = {
  __typename?: 'MilestoneConfig';
  milestoneThreshold: Scalars['Float']['output'];
  numberOfPoints: Scalars['Float']['output'];
};

export type Modifier = {
  __typename?: 'Modifier';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['DateTimeISO']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  isItem: Scalars['Boolean']['output'];
  modifierGroup?: Maybe<Array<ModifierGroup>>;
  name: Scalars['String']['output'];
  posId: Scalars['String']['output'];
  preSelect: Scalars['Boolean']['output'];
  price: Scalars['Float']['output'];
  restaurantId: Restaurant;
  updatedAt: Scalars['DateTimeISO']['output'];
  updatedBy?: Maybe<User>;
  user: User;
};

export type ModifierGroup = {
  __typename?: 'ModifierGroup';
  _id: Scalars['ID']['output'];
  allowMultiSelctSingleModsInGroup: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTimeISO']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  isMaxSelctSingleModsInGroupUnlimited: Scalars['Boolean']['output'];
  item?: Maybe<Array<Item>>;
  maxSelctSingleModsInGroup: Scalars['Float']['output'];
  maxSelections: Scalars['Float']['output'];
  minSelections: Scalars['Float']['output'];
  modifiers: Array<ModifierInfo>;
  multiSelect: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  optional: Scalars['Boolean']['output'];
  price?: Maybe<Scalars['Float']['output']>;
  pricingType: PriceTypeEnum;
  restaurantId: Restaurant;
  updatedAt: Scalars['DateTimeISO']['output'];
  updatedBy?: Maybe<User>;
  user: User;
};

export type ModifierGroupInfo = {
  __typename?: 'ModifierGroupInfo';
  _id: ModifierGroup;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Float']['output'];
  pricingType: PriceTypeEnum;
};

export type ModifierGroupResponse = {
  __typename?: 'ModifierGroupResponse';
  allowMultiSelctSingleModsInGroup: Scalars['Boolean']['output'];
  desc?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isMaxSelctSingleModsInGroupUnlimited: Scalars['Boolean']['output'];
  maxSelctSingleModsInGroup: Scalars['Float']['output'];
  maxSelections: Scalars['Float']['output'];
  minSelections: Scalars['Float']['output'];
  modifiers: Array<ModifierInfoResponse>;
  multiSelect: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  optional: Scalars['Boolean']['output'];
  price?: Maybe<Scalars['Float']['output']>;
  pricingType: PriceTypeEnum;
};

export type ModifierInfo = {
  __typename?: 'ModifierInfo';
  _id: Modifier;
  desc?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isItem: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Float']['output'];
  preSelect: Scalars['Boolean']['output'];
  price: Scalars['Float']['output'];
};

export type ModifierInfoResponse = {
  __typename?: 'ModifierInfoResponse';
  desc?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isItem: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  preSelect: Scalars['Boolean']['output'];
  price: Scalars['Float']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addToCart: Scalars['String']['output'];
  clearCart: Scalars['Boolean']['output'];
  cmsContactUs: Scalars['Boolean']['output'];
  createOrder: OrderPlacedInfo;
  createOrderWithoutPayment: OrderPlacedInfo;
  decreaseItemQty: Scalars['Boolean']['output'];
  deleteCartItem: Scalars['Boolean']['output'];
  increaseItemQty: Scalars['Boolean']['output'];
  reorderItemsToCart: ReorderOrderResponse;
  updateCartDetails: Scalars['Boolean']['output'];
  updateCartItem: Scalars['Boolean']['output'];
  updateCustomerDetails: Customer;
  validateLoyaltyRedemptionOnCart: Scalars['Boolean']['output'];
  validatePromoCode: PromoCode;
};


export type MutationAddToCartArgs = {
  items: Array<CartItemInput>;
};


export type MutationCmsContactUsArgs = {
  input: CmsContactInput;
};


export type MutationCreateOrderArgs = {
  input: CreateOrderInput;
};


export type MutationCreateOrderWithoutPaymentArgs = {
  input: CreateOrderWihoutPaymentInput;
};


export type MutationDecreaseItemQtyArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteCartItemArgs = {
  id: Scalars['String']['input'];
};


export type MutationIncreaseItemQtyArgs = {
  id: Scalars['String']['input'];
};


export type MutationReorderItemsToCartArgs = {
  orderId: Scalars['String']['input'];
};


export type MutationUpdateCartDetailsArgs = {
  input: UpdateCartDetailsInput;
};


export type MutationUpdateCartItemArgs = {
  input: UpdateCartItemInput;
};


export type MutationUpdateCustomerDetailsArgs = {
  input: UpdateCustomerDetailsInput;
};


export type MutationValidateLoyaltyRedemptionOnCartArgs = {
  input: LoyaltyInput;
};


export type MutationValidatePromoCodeArgs = {
  code: Scalars['String']['input'];
};

export type OnlineOrderTimingConfig = {
  __typename?: 'OnlineOrderTimingConfig';
  endBeforeMinutes?: Maybe<Scalars['Float']['output']>;
  startAfterMinutes?: Maybe<Scalars['Float']['output']>;
};

export type Options = {
  __typename?: 'Options';
  _id: Scalars['ID']['output'];
  desc: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  status: Scalars['Boolean']['output'];
  type: ItemOptionsEnum;
};

export type Order = {
  __typename?: 'Order';
  LoyaltyEarned?: Maybe<Scalars['Float']['output']>;
  _id: Scalars['ID']['output'];
  appliedDiscount?: Maybe<DiscountData>;
  campaignDetails: CampaignDetails;
  campaignTarget: Array<Scalars['String']['output']>;
  createdAt: Scalars['DateTimeISO']['output'];
  customer?: Maybe<Customer>;
  customerPaidAmount: Scalars['Float']['output'];
  delivery?: Maybe<Delivery>;
  deliveryAddress?: Maybe<AddressInfo>;
  deliveryAmount?: Maybe<Scalars['Float']['output']>;
  deliveryDateAndTime?: Maybe<Scalars['DateTimeISO']['output']>;
  deliveryPartnerType?: Maybe<DeliveryPartnerTypeEnum>;
  delivery_events: Array<DeliveryEvent>;
  grossAmount: Scalars['Float']['output'];
  guestData?: Maybe<GuestData>;
  isAsap?: Maybe<Scalars['Boolean']['output']>;
  items: Array<OrderItem>;
  loyaltyRedeemed?: Maybe<Scalars['Float']['output']>;
  orderId: Scalars['String']['output'];
  orderType?: Maybe<OrderType>;
  payment?: Maybe<PaymentIntent>;
  paymentMethod?: Maybe<Scalars['String']['output']>;
  pickUpDateAndTime?: Maybe<Scalars['DateTimeISO']['output']>;
  /** This field stores the guest details entered by customer when placing a guest order but the number is already registered with restaurant */
  placedAsGuestData?: Maybe<GuestData>;
  platformFeePercent: Scalars['Float']['output'];
  queryRecord?: Maybe<Scalars['JSONObject']['output']>;
  refundAmount: Scalars['Float']['output'];
  refundLoyalty: Scalars['Float']['output'];
  restaurant: Restaurant;
  specialRemark?: Maybe<Scalars['String']['output']>;
  status: OrderStatus;
  subTotal: Scalars['Float']['output'];
  taxName?: Maybe<Scalars['String']['output']>;
  taxPercent: Scalars['Float']['output'];
  thirdPartyTip: Scalars['Boolean']['output'];
  tipPercent?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTimeISO']['output'];
  utmDetails: UtmDetails;
};

export type OrderItem = {
  __typename?: 'OrderItem';
  category?: Maybe<OrderItemCategory>;
  itemId: Item;
  itemName: Scalars['String']['output'];
  itemPrice: Scalars['Float']['output'];
  itemRemarks?: Maybe<Scalars['String']['output']>;
  modifierGroups: Array<OrderModifierGroups>;
  qty: Scalars['Float']['output'];
};

export type OrderItemCategory = {
  __typename?: 'OrderItemCategory';
  categoryId: Category;
  categoryName: Scalars['String']['output'];
};

export type OrderModifierGroups = {
  __typename?: 'OrderModifierGroups';
  mgId: ModifierGroup;
  mgName: Scalars['String']['output'];
  price?: Maybe<Scalars['Float']['output']>;
  pricingType: PriceTypeEnum;
  selectedModifiers: Array<OrderModifiers>;
};

export type OrderModifiers = {
  __typename?: 'OrderModifiers';
  modifierName: Scalars['String']['output'];
  modifierPrice: Scalars['Float']['output'];
  qty: Scalars['Float']['output'];
  selectedModifier: Modifier;
};

export type OrderPlacedInfo = {
  __typename?: 'OrderPlacedInfo';
  message?: Maybe<Scalars['String']['output']>;
  orderId?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

/** Status of the order */
export enum OrderStatus {
  CancelledFullRefund = 'CancelledFullRefund',
  CancelledLoyaltyRefund = 'CancelledLoyaltyRefund',
  CancelledPartialRefund = 'CancelledPartialRefund',
  Fulfilled = 'Fulfilled',
  Placed = 'Placed',
  Processing = 'Processing',
  Scheduled = 'Scheduled'
}

/** Type of the order */
export enum OrderType {
  Delivery = 'Delivery',
  Pickup = 'Pickup'
}

export type OrderWithTotals = {
  __typename?: 'OrderWithTotals';
  LoyaltyEarned?: Maybe<Scalars['Float']['output']>;
  _id: Scalars['ID']['output'];
  appliedDiscount?: Maybe<DiscountData>;
  campaignDetails: CampaignDetails;
  campaignTarget: Array<Scalars['String']['output']>;
  createdAt: Scalars['DateTimeISO']['output'];
  customer?: Maybe<Customer>;
  customerInfo: CustomerReceiptInfo;
  customerPaidAmount: Scalars['Float']['output'];
  delivery?: Maybe<Delivery>;
  deliveryAddress?: Maybe<AddressInfo>;
  deliveryAmount?: Maybe<Scalars['Float']['output']>;
  deliveryDateAndTime?: Maybe<Scalars['DateTimeISO']['output']>;
  deliveryPartnerType?: Maybe<DeliveryPartnerTypeEnum>;
  delivery_events: Array<DeliveryEvent>;
  discountAmount: Scalars['Float']['output'];
  finalAmount: Scalars['Float']['output'];
  grossAmount: Scalars['Float']['output'];
  guestData?: Maybe<GuestData>;
  isAsap?: Maybe<Scalars['Boolean']['output']>;
  items: Array<OrderItem>;
  loyaltyRedeemed?: Maybe<Scalars['Float']['output']>;
  loyaltyTransactions: Array<LoyaltyTransactionSummary>;
  orderId: Scalars['String']['output'];
  orderType?: Maybe<OrderType>;
  payment?: Maybe<PaymentIntent>;
  paymentMethod?: Maybe<Scalars['String']['output']>;
  pickUpDateAndTime?: Maybe<Scalars['DateTimeISO']['output']>;
  /** This field stores the guest details entered by customer when placing a guest order but the number is already registered with restaurant */
  placedAsGuestData?: Maybe<GuestData>;
  platformFeePercent: Scalars['Float']['output'];
  platformFees: Scalars['Float']['output'];
  queryRecord?: Maybe<Scalars['JSONObject']['output']>;
  refundAmount: Scalars['Float']['output'];
  refundLoyalty: Scalars['Float']['output'];
  restaurant: Restaurant;
  restaurantInfo: RestaurantReceiptInfo;
  specialRemark?: Maybe<Scalars['String']['output']>;
  status: OrderStatus;
  subTotal: Scalars['Float']['output'];
  subTotalAmount: Scalars['Float']['output'];
  taxAmount: Scalars['Float']['output'];
  taxName?: Maybe<Scalars['String']['output']>;
  taxPercent: Scalars['Float']['output'];
  thirdPartyTip: Scalars['Boolean']['output'];
  tipAmount: Scalars['Float']['output'];
  tipPercent?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTimeISO']['output'];
  utmDetails: UtmDetails;
};

export type PaymentIntent = {
  __typename?: 'PaymentIntent';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['DateTimeISO']['output'];
  paymentIntentId: Scalars['String']['output'];
  restaurant: Restaurant;
  status: PaymentIntentStatusEnum;
  updatedAt: Scalars['DateTimeISO']['output'];
};

export type PaymentIntentResponse = {
  __typename?: 'PaymentIntentResponse';
  cs: Scalars['String']['output'];
  id: Scalars['String']['output'];
};

export enum PaymentIntentStatusEnum {
  Canceled = 'canceled',
  Failed = 'failed',
  Processing = 'processing',
  Succeeded = 'succeeded'
}

/** Enum to store the types of permissions that can be given to sub-users */
export enum PermissionTypeEnum {
  AddRestaurant = 'AddRestaurant',
  Cms = 'CMS',
  Customers = 'Customers',
  Dashboard = 'Dashboard',
  DownloadReports = 'DownloadReports',
  Integrations = 'Integrations',
  Marketing = 'Marketing',
  Menu = 'Menu',
  Offers = 'Offers',
  Orders = 'Orders',
  PaymentManagement = 'PaymentManagement',
  Reports = 'Reports',
  Rewards = 'Rewards',
  UpdateBusiness = 'UpdateBusiness',
  UpdateRestaurant = 'UpdateRestaurant',
  UpdateTax = 'UpdateTax',
  UserManagement = 'UserManagement'
}

export type Pickup = {
  __typename?: 'Pickup';
  address: DeliveryAddress;
  contact: Contact;
  location: Location;
  notes?: Maybe<Scalars['String']['output']>;
};

export type PlaceDetail = {
  __typename?: 'PlaceDetail';
  address?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  state?: Maybe<Scalars['String']['output']>;
  zipcode?: Maybe<Scalars['String']['output']>;
};

export type PlaceInput = {
  displayName: Scalars['String']['input'];
  placeId: Scalars['String']['input'];
};

export type Places = {
  __typename?: 'Places';
  displayName: Scalars['String']['output'];
  placeId: Scalars['String']['output'];
};

export type PopulatedOrder = {
  __typename?: 'PopulatedOrder';
  _id: Scalars['String']['output'];
  appliedDiscount?: Maybe<DiscountData>;
  createdAt: Scalars['DateTimeISO']['output'];
  customerInfo: CustomerReceiptInfo;
  items: Array<PopulatedOrderItem>;
  loyaltyTransactions?: Maybe<Array<LoyaltyPointsTransaction>>;
  orderId: Scalars['String']['output'];
  orderType?: Maybe<Scalars['String']['output']>;
  paymentMethod?: Maybe<Scalars['String']['output']>;
  refundAmount: Scalars['Float']['output'];
  specialRemark?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  taxRatePercent: Scalars['Float']['output'];
  tipAmount: Scalars['Float']['output'];
  totalAmount: Scalars['Float']['output'];
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export type PopulatedOrderItem = {
  __typename?: 'PopulatedOrderItem';
  itemId: Item;
  itemName: Scalars['String']['output'];
  itemPrice: Scalars['Float']['output'];
  itemRemarks?: Maybe<Scalars['String']['output']>;
  modifierGroups: Array<PopulatedOrderModifierGroup>;
  qty: Scalars['Float']['output'];
};

export type PopulatedOrderModifier = {
  __typename?: 'PopulatedOrderModifier';
  modifierName: Scalars['String']['output'];
  modifierPrice: Scalars['Float']['output'];
  qty: Scalars['Float']['output'];
  selectedModifier: Modifier;
};

export type PopulatedOrderModifierGroup = {
  __typename?: 'PopulatedOrderModifierGroup';
  mgId: ModifierGroup;
  mgName: Scalars['String']['output'];
  price?: Maybe<Scalars['Float']['output']>;
  pricingType: Scalars['String']['output'];
  selectedModifiers: Array<PopulatedOrderModifier>;
};

export type PosItemTag = {
  __typename?: 'PosItemTag';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type PriceOptions = {
  __typename?: 'PriceOptions';
  menuType: MenuTypeEnum;
  price: Scalars['Float']['output'];
};

/** Price type enum  */
export enum PriceTypeEnum {
  FreeOfCharge = 'FreeOfCharge',
  IndividualPrice = 'IndividualPrice',
  SamePrice = 'SamePrice'
}

export type ProgramSettings = {
  __typename?: 'ProgramSettings';
  desc: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type PromoCmsButton = {
  __typename?: 'PromoCmsButton';
  isExternalLink: Scalars['Boolean']['output'];
  link?: Maybe<Scalars['String']['output']>;
  textColor?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type PromoCode = {
  __typename?: 'PromoCode';
  _id: Scalars['ID']['output'];
  applicableCategory?: Maybe<Category>;
  applicableDays?: Maybe<Array<Day>>;
  applicableItem?: Maybe<Item>;
  code: Scalars['String']['output'];
  couponUsageSalesLimit?: Maybe<Scalars['Float']['output']>;
  couponUsageType: CouponUsageType;
  createdAt: Scalars['DateTimeISO']['output'];
  createdBy: User;
  description?: Maybe<Scalars['String']['output']>;
  discountItem?: Maybe<Item>;
  discountValue?: Maybe<Scalars['Float']['output']>;
  endDate: Scalars['DateTimeISO']['output'];
  isActive: Scalars['Boolean']['output'];
  maxUsage?: Maybe<Scalars['Float']['output']>;
  maxUsagePerCustomer?: Maybe<Scalars['Float']['output']>;
  minCartValue?: Maybe<Scalars['Float']['output']>;
  promoCodeDiscountType: PromoDiscountType;
  restaurant: Restaurant;
  showToCustomers?: Maybe<Scalars['Boolean']['output']>;
  startDate: Scalars['DateTimeISO']['output'];
  updatedAt: Scalars['DateTimeISO']['output'];
  uptoAmount?: Maybe<Scalars['Float']['output']>;
  usage: Array<Usage>;
};

export type PromoCodeData = {
  __typename?: 'PromoCodeData';
  applicableCategory?: Maybe<Category>;
  applicableDays?: Maybe<Array<Day>>;
  applicableItem?: Maybe<Item>;
  code: Scalars['String']['output'];
  discountItemId?: Maybe<Scalars['String']['output']>;
  discountItemName?: Maybe<Scalars['String']['output']>;
  discountType: PromoDiscountType;
  discountValue?: Maybe<Scalars['Float']['output']>;
  uptoAmount?: Maybe<Scalars['Float']['output']>;
};

/** Types of Discount for Promo Codes */
export enum PromoDiscountType {
  FixedAmount = 'FixedAmount',
  Free = 'Free',
  FreeDelivery = 'FreeDelivery',
  Item = 'Item',
  Percentage = 'Percentage'
}

export type PromoNavItem = {
  __typename?: 'PromoNavItem';
  link: Scalars['String']['output'];
  navTitle: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  calculateFinalAmount: Scalars['Float']['output'];
  checkDeliveryAvailable: Scalars['Boolean']['output'];
  createCheckoutPaymentIntent: PaymentIntentResponse;
  customerLogin: Scalars['Boolean']['output'];
  customerLoginVerification: Scalars['Boolean']['output'];
  customerLogout: Scalars['Boolean']['output'];
  customerSignUp: Scalars['Boolean']['output'];
  customerSignUpVerification: Scalars['Boolean']['output'];
  fetchCartCount: Scalars['Float']['output'];
  fetchCartDetails: Cart;
  fetchCartItems: CustomerCart;
  fetchCustomerLoyaltyWallet: CustomerLoyaltyWallet;
  fetchCustomerOrderById: OrderWithTotals;
  fetchCustomerOrders: Array<PopulatedOrder>;
  fetchDeliveryFee: Scalars['Float']['output'];
  fetchLoyaltyCustomerRules: LoyaltyRules;
  fetchLoyaltyPointsTransactions: Array<LoyaltyPointsTransaction>;
  fetchProcessingFee: Scalars['Float']['output'];
  fetchRestaurantRedeemOffers: RestaurantRedeemOffers;
  fetchVisiblePromoCodes: Array<PromoCode>;
  getCmsDetails?: Maybe<CmsRestaurant>;
  getCmsPromoNavItems: Array<PromoNavItem>;
  getCmsPromoPopUp?: Maybe<CmsPromoPopup>;
  getCmsPromoRouteDetails?: Maybe<CmsPromoRoutes>;
  getCmsRestaurantDetails?: Maybe<Restaurant>;
  getCustomerCategoriesAndItems: Array<CategoryItem>;
  getCustomerItem?: Maybe<ItemWithModifiersResponse>;
  getCustomerRestaurantDetails: Restaurant;
  getPaymentStatus?: Maybe<Scalars['String']['output']>;
  getPlaceDetails?: Maybe<PlaceDetail>;
  getPlacesList: Array<Places>;
  getStripeAccountId: Scalars['String']['output'];
  meCustomer?: Maybe<Customer>;
  sendOTPGuestOrder: Scalars['Boolean']['output'];
  updateCartTip: Scalars['Boolean']['output'];
  validateDelivery: Scalars['Boolean']['output'];
  verifyOTPGuestOrder: VerifyOtpGuestOrderResponse;
  verifyPaymentIntent: PaymentIntentResponse;
};


export type QueryCustomerLoginArgs = {
  input: Scalars['String']['input'];
};


export type QueryCustomerLoginVerificationArgs = {
  input: CustomerLoginVerificationInput;
};


export type QueryCustomerSignUpArgs = {
  input: CustomerSignupInput;
};


export type QueryCustomerSignUpVerificationArgs = {
  input: CustomerSignupVerificationInput;
};


export type QueryFetchCustomerOrderByIdArgs = {
  orderId: Scalars['ID']['input'];
};


export type QueryFetchCustomerOrdersArgs = {
  lastThreeOrders?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryGetCmsPromoRouteDetailsArgs = {
  slug: Scalars['String']['input'];
};


export type QueryGetCustomerCategoriesAndItemsArgs = {
  ItemOptionSelected?: InputMaybe<Array<ItemOptionsEnum>>;
  searchText?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetCustomerItemArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetPaymentStatusArgs = {
  paymentCs: Scalars['String']['input'];
  paymentIntentId: Scalars['String']['input'];
};


export type QueryGetPlaceDetailsArgs = {
  placeId: Scalars['String']['input'];
};


export type QueryGetPlacesListArgs = {
  input: Scalars['String']['input'];
};


export type QuerySendOtpGuestOrderArgs = {
  input: VerifyGuestOrderInput;
};


export type QueryUpdateCartTipArgs = {
  tipPercent: Scalars['Float']['input'];
};


export type QueryValidateDeliveryArgs = {
  input: ValidateDeliveryInput;
};


export type QueryVerifyOtpGuestOrderArgs = {
  input: CustomerDetailsInput;
};


export type QueryVerifyPaymentIntentArgs = {
  paymentIntentId: Scalars['String']['input'];
};

export type RedeemDiscount = {
  __typename?: 'RedeemDiscount';
  discountType: Scalars['String']['output'];
  discountValue?: Maybe<Scalars['Float']['output']>;
  uptoAmount?: Maybe<Scalars['Float']['output']>;
};

export type RedeemItem = {
  __typename?: 'RedeemItem';
  itemId: Scalars['ID']['output'];
  itemName: Scalars['String']['output'];
  itemPrice: Scalars['Float']['output'];
};

export type RejectRecord = {
  __typename?: 'RejectRecord';
  admin: Admin;
  createdAt: Scalars['DateTimeISO']['output'];
  name: Scalars['String']['output'];
  reason: Scalars['String']['output'];
};

export type ReorderOrderResponse = {
  __typename?: 'ReorderOrderResponse';
  specialMessage?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type Restaurant = {
  __typename?: 'Restaurant';
  _id: Scalars['ID']['output'];
  address?: Maybe<AddressInfo>;
  availability?: Maybe<Array<Availability>>;
  beverageCategory?: Maybe<Array<BeverageCategory>>;
  brandingLogo?: Maybe<Scalars['String']['output']>;
  category?: Maybe<Array<RestaurantCategory>>;
  createdAt: Scalars['DateTimeISO']['output'];
  cuisine?: Maybe<Array<CuisineData>>;
  deliveryConfig?: Maybe<DeliveryConfig>;
  dineInCapacity?: Maybe<Scalars['Float']['output']>;
  email: Scalars['String']['output'];
  foodType?: Maybe<Array<FoodType>>;
  fulfillmentConfig?: Maybe<FulfillmentConfig>;
  integrations: Array<IntegrationInfo>;
  loyaltyConfig?: Maybe<LoyaltyConfig>;
  meatType?: Maybe<MeatType>;
  menus?: Maybe<Array<MenuInfo>>;
  name: Scalars['String']['output'];
  onlineOrderTimingConfig?: Maybe<OnlineOrderTimingConfig>;
  phone: Scalars['String']['output'];
  restaurantConfigs?: Maybe<RestaurantConfigs>;
  socialInfo?: Maybe<SocialInfo>;
  status: RestaurantStatus;
  taxRates?: Maybe<Array<TaxRateInfo>>;
  timezone?: Maybe<TimezoneData>;
  type?: Maybe<RestaurantType>;
  updatedAt: Scalars['DateTimeISO']['output'];
  updatedBy?: Maybe<User>;
  user: User;
  website?: Maybe<Scalars['String']['output']>;
};

/** Restaurant category type enum. */
export enum RestaurantCategory {
  CloudKitchen = 'CloudKitchen',
  DineIn = 'DineIn',
  PremiumDineIn = 'PremiumDineIn',
  Qsr = 'QSR',
  Takeout = 'Takeout'
}

export type RestaurantConfigs = {
  __typename?: 'RestaurantConfigs';
  allowTips?: Maybe<Scalars['Boolean']['output']>;
  onlineOrdering?: Maybe<Scalars['Boolean']['output']>;
  pickup?: Maybe<Scalars['Boolean']['output']>;
  scheduleOrders?: Maybe<Scalars['Boolean']['output']>;
};

export type RestaurantInfo = {
  __typename?: 'RestaurantInfo';
  _id: Restaurant;
  city?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: RestaurantStatus;
};

export type RestaurantReceiptInfo = {
  __typename?: 'RestaurantReceiptInfo';
  address: AddressInfo;
  brandingLogo?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
};

export type RestaurantRedeemOffers = {
  __typename?: 'RestaurantRedeemOffers';
  itemRedemptions: Array<LoyaltyItemRedemption>;
  pointsRedemptions: Array<LoyaltyPointsRedemption>;
};

/** Restaurant status enum. */
export enum RestaurantStatus {
  Active = 'active',
  Blocked = 'blocked',
  BlockedBySystem = 'blockedBySystem',
  Inactive = 'inactive',
  OnboardingPending = 'onboardingPending',
  PaymentPending = 'paymentPending'
}

/** Restaurant type enum. */
export enum RestaurantType {
  Independent = 'Independent',
  PartOfChain = 'PartOfChain'
}

export type SocialInfo = {
  __typename?: 'SocialInfo';
  _id: Scalars['ID']['output'];
  facebook?: Maybe<Scalars['String']['output']>;
  instagram?: Maybe<Scalars['String']['output']>;
};

/** Enum used for storing static values of Staff Size */
export enum StaffCountEnum {
  Above40 = 'Above40',
  From1To10 = 'From1To10',
  From11to25 = 'From11to25',
  From26to40 = 'From26to40'
}

export type StateData = {
  __typename?: 'StateData';
  stateId: Scalars['String']['output'];
  stateName: Scalars['String']['output'];
};

export type StateDataInput = {
  stateId?: InputMaybe<Scalars['String']['input']>;
  stateName: Scalars['String']['input'];
};

/** Status enum  */
export enum StatusEnum {
  Active = 'active',
  Inactive = 'inactive'
}

export type TaxRateInfo = {
  __typename?: 'TaxRateInfo';
  _id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  salesTax: Scalars['Float']['output'];
};

export type TermsAndConditionSection = {
  __typename?: 'TermsAndConditionSection';
  terms: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type TimezoneData = {
  __typename?: 'TimezoneData';
  timezoneId: Scalars['String']['output'];
  timezoneName: Scalars['String']['output'];
};

export enum TransactionType {
  Earn = 'EARN',
  Redeem = 'REDEEM',
  RefundLoyalty = 'REFUND_LOYALTY',
  ReversalEarn = 'REVERSAL_EARN',
  ReversalRedeem = 'REVERSAL_REDEEM'
}

export type UtmDetails = {
  __typename?: 'UTMDetails';
  campaign?: Maybe<Scalars['String']['output']>;
  medium?: Maybe<Scalars['String']['output']>;
  setAt?: Maybe<Scalars['DateTimeISO']['output']>;
  source?: Maybe<Scalars['String']['output']>;
};

export type UpdateCartDetailsInput = {
  amounts?: InputMaybe<AmountDetailsInput>;
  delivery?: InputMaybe<AddressInfoInput>;
  deliveryDateAndTime?: InputMaybe<Scalars['DateTimeISO']['input']>;
  discountString?: InputMaybe<Scalars['String']['input']>;
  isAsap?: InputMaybe<Scalars['Boolean']['input']>;
  orderType?: InputMaybe<OrderType>;
  pickUpDateAndTime?: InputMaybe<Scalars['DateTimeISO']['input']>;
};

export type UpdateCartItemInput = {
  _id: Scalars['ID']['input'];
  modifierGroups?: InputMaybe<Array<CartModifierGroupsInput>>;
  remarks?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCustomerDetailsInput = {
  accountPreferences?: InputMaybe<AccountPreferenceInput>;
  dob?: InputMaybe<Scalars['DateTimeISO']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type Usage = {
  __typename?: 'Usage';
  customer?: Maybe<Customer>;
  email?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  orderId?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['Float']['output']>;
  usedAt: Scalars['DateTimeISO']['output'];
};

export type User = {
  __typename?: 'User';
  _id: Scalars['ID']['output'];
  accessHistory?: Maybe<Array<AccessHistory>>;
  accountPreferences?: Maybe<AccountPreference>;
  businessInfo?: Maybe<Business>;
  createdAt: Scalars['DateTimeISO']['output'];
  creatorUser?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  enable2FA: Scalars['Boolean']['output'];
  firstName: Scalars['String']['output'];
  lastLoggedIn: Scalars['DateTimeISO']['output'];
  lastLoggedOut: Scalars['DateTimeISO']['output'];
  lastName: Scalars['String']['output'];
  permissions: Array<UserPermission>;
  phone: Scalars['String']['output'];
  restaurants?: Maybe<Array<RestaurantInfo>>;
  role: UserRole;
  status: UserStatus;
  statusUpdatedBy?: Maybe<Admin>;
  updatedAt: Scalars['DateTimeISO']['output'];
  updatedBy?: Maybe<User>;
  verificationRejections?: Maybe<Array<RejectRecord>>;
  walkthroughStates: Array<UserWalkthroughStates>;
};

export type UserInfo = {
  __typename?: 'UserInfo';
  _id: User;
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  status: UserStatus;
};

export type UserPermission = {
  __typename?: 'UserPermission';
  id: Scalars['ID']['output'];
  status: Scalars['Boolean']['output'];
  type: PermissionTypeEnum;
};

/** User roles  */
export enum UserRole {
  Manager = 'Manager',
  MarketingPartner = 'MarketingPartner',
  Owner = 'Owner',
  Staff = 'Staff'
}

/** UserStatus type enum  */
export enum UserStatus {
  Active = 'active',
  Blocked = 'blocked',
  InternalVerificationPending = 'internalVerificationPending',
  OnboardingPending = 'onboardingPending',
  RestaurantOnboardingPending = 'restaurantOnboardingPending',
  SubUserEmailVerificationPending = 'subUserEmailVerificationPending'
}

export type UserWalkthroughStates = {
  __typename?: 'UserWalkthroughStates';
  status: Scalars['Boolean']['output'];
  walkthrough: WalkthroughStates;
};

export type ValidateDeliveryInput = {
  delivery: AddressInfoInput;
  deliveryDateAndTime: Scalars['DateTimeISO']['input'];
  isAsap?: InputMaybe<Scalars['Boolean']['input']>;
};

export type VerifyGuestOrderInput = {
  accountPreferences?: AccountPreferenceInput;
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export type VerifyOtpGuestOrderResponse = {
  __typename?: 'VerifyOTPGuestOrderResponse';
  customer?: Maybe<Customer>;
  success: Scalars['Boolean']['output'];
};

export type Visibility = {
  __typename?: 'Visibility';
  menuType: MenuTypeEnum;
  status: StatusEnum;
};

/** WalkthroughStates type enum  */
export enum WalkthroughStates {
  Campaign = 'Campaign',
  Loyalty = 'Loyalty',
  Main = 'Main',
  Menu = 'Menu',
  Offers = 'Offers',
  Payments = 'Payments',
  Teams = 'Teams'
}

/** Enum for diffferent website themes */
export enum WebsiteThemeEnum {
  Casual = 'casual',
  Family = 'family',
  Upscale = 'upscale'
}

/** Type of redeemption during orders */
export enum OrderDiscountType {
  Giftcard = 'GIFTCARD',
  Loyalty = 'LOYALTY',
  Promo = 'PROMO'
}

export type UpSellItem = {
  __typename?: 'upSellItem';
  desc?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  itemId: Item;
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
};

export type UpSellReturnItem = {
  __typename?: 'upSellReturnItem';
  desc?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  itemId: Scalars['String']['output'];
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
};

export type AddToCartMutationVariables = Exact<{
  items: Array<CartItemInput> | CartItemInput;
}>;


export type AddToCartMutation = { __typename?: 'Mutation', addToCart: string };

export type DeleteCartItemMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteCartItemMutation = { __typename?: 'Mutation', deleteCartItem: boolean };

export type IncreaseItemQtyMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type IncreaseItemQtyMutation = { __typename?: 'Mutation', increaseItemQty: boolean };

export type DecreaseItemQtyMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DecreaseItemQtyMutation = { __typename?: 'Mutation', decreaseItemQty: boolean };

export type UpdateCartItemMutationVariables = Exact<{
  input: UpdateCartItemInput;
}>;


export type UpdateCartItemMutation = { __typename?: 'Mutation', updateCartItem: boolean };

export type ClearCartMutationVariables = Exact<{ [key: string]: never; }>;


export type ClearCartMutation = { __typename?: 'Mutation', clearCart: boolean };

export type FetchCartItemsQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchCartItemsQuery = { __typename?: 'Query', fetchCartItems: { __typename?: 'CustomerCart', message?: string | null, cartData: Array<{ __typename?: 'CartItem', _id: string, qty: number, remarks?: string | null, itemId: { __typename?: 'Item', image?: string | null, _id: string, name: string, price: number, priceOptions: Array<{ __typename?: 'PriceOptions', menuType: MenuTypeEnum, price: number }> }, modifierGroups: Array<{ __typename?: 'CartModifierGroups', mgId: { __typename?: 'ModifierGroup', name: string, pricingType: PriceTypeEnum, price?: number | null, _id: string }, selectedModifiers: Array<{ __typename?: 'CartModifiers', qty: number, mid: { __typename?: 'Modifier', name: string, price: number, _id: string } }> }> }> } };

export type UpdateCartDetailsMutationVariables = Exact<{
  input: UpdateCartDetailsInput;
}>;


export type UpdateCartDetailsMutation = { __typename?: 'Mutation', updateCartDetails: boolean };

export type CalculateFinalAmountQueryVariables = Exact<{ [key: string]: never; }>;


export type CalculateFinalAmountQuery = { __typename?: 'Query', calculateFinalAmount: number };

export type FetchCartDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchCartDetailsQuery = { __typename?: 'Query', fetchCartDetails: { __typename?: 'Cart', _id: string, orderType?: OrderType | null, discountString?: string | null, discountItemImage?: string | null, discountCode?: string | null, loyaltyType?: LoyaltyRedeemType | null, loyaltyRedeemPoints?: number | null, pickUpDateAndTime?: any | null, deliveryDateAndTime?: any | null, customerDetails: { __typename?: 'CustomerDetails', firstName?: string | null }, delivery?: { __typename?: 'AddressInfo', _id: string, addressLine1: string, addressLine2?: string | null, city: string, zipcode: number, state: { __typename?: 'StateData', stateId: string, stateName: string }, coordinate?: { __typename?: 'LocationCommon', type?: string | null, coordinates: Array<number> } | null, place?: { __typename?: 'Places', placeId: string, displayName: string } | null } | null, amounts: { __typename?: 'AmountDetails', subTotalAmount?: number | null, discountAmount?: number | null, discountPercent?: number | null, discountUpto?: number | null, tipPercent: number } } };

export type FetchCartCountQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchCartCountQuery = { __typename?: 'Query', fetchCartCount: number };

export type GetCmsDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCmsDetailsQuery = { __typename?: 'Query', getCmsDetails?: { __typename?: 'CmsRestaurant', _id: string, themeConfig: { __typename?: 'CmsThemeConfig', theme: WebsiteThemeEnum, background: string, primary: string, secondary: string, text: string }, domainConfig: { __typename?: 'CmsDomainConfig', website: string }, onlineOrderingConfig: { __typename?: 'CmsOnlineOrderingConfig', websiteLink: string, primaryTextColor: string }, heroSection: { __typename?: 'CmsHeroSection', show: boolean, navTitle: string, heroItems: Array<{ __typename?: 'CmsHeroItem', _id: string, title: string, caption: string, image: { __typename?: 'CmsImage', desktop: string, mobile?: string | null }, button: { __typename?: 'CmsButton', title: string, link?: string | null, textColor?: string | null } }> }, menuSection: { __typename?: 'CmsMenuSection', show: boolean, navTitle: string, sectionTitle: string, items: Array<{ __typename?: 'CmsMenuItem', title: string, description: string, image: string, item: { __typename?: 'Item', _id: string } }> }, contentSection?: { __typename?: 'CmsContentSection', show: boolean, navTitle: string, sectionTitle: string, sectionContent: string } | null, gridSection: { __typename?: 'CmsGridSection', show: boolean, navTitle: string, sectionTitle: string, grid1: { __typename?: 'CmsGridItem', title: string, image: string, description: string }, grid2: { __typename?: 'CmsGridItem', title: string, image: string, description: string }, grid3: { __typename?: 'CmsGridItem', title: string, image: string, description: string } }, contentWithImageSection: { __typename?: 'CmsContentWithImageSection', show: boolean, navTitle: string, contentItems: Array<{ __typename?: 'CmsContentWithImageItem', _id: string, sectionTitle: string, sectionContent: string, side: CmsSectionSideEnum, image: { __typename?: 'CmsImage', desktop: string, mobile?: string | null } }> }, reviewSection: { __typename?: 'CmsReviewSection', show: boolean, navTitle: string, reviews: Array<{ __typename?: 'CmsReviewItem', _id: string, content: string, name: string }> }, websiteSeo: { __typename?: 'CmsWebsiteSeoConfig', pageTitle: string, metaDescription: string } } | null };

export type GetCmsRestaurantDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCmsRestaurantDetailsQuery = { __typename?: 'Query', getCmsRestaurantDetails?: { __typename?: 'Restaurant', _id: string, name: string, brandingLogo?: string | null, email: string, phone: string, address?: { __typename?: 'AddressInfo', addressLine1: string, addressLine2?: string | null, city: string, zipcode: number, state: { __typename?: 'StateData', stateName: string }, coordinate?: { __typename?: 'LocationCommon', coordinates: Array<number> } | null, place?: { __typename?: 'Places', displayName: string } | null } | null, availability?: Array<{ __typename?: 'Availability', day: string, active: boolean, hours: Array<{ __typename?: 'Hours', start: string, end: string }> }> | null, socialInfo?: { __typename?: 'SocialInfo', facebook?: string | null, instagram?: string | null } | null } | null };

export type CmsContactUsMutationVariables = Exact<{
  input: CmsContactInput;
}>;


export type CmsContactUsMutation = { __typename?: 'Mutation', cmsContactUs: boolean };

export type ValidatePromoCodeMutationVariables = Exact<{
  code: Scalars['String']['input'];
}>;


export type ValidatePromoCodeMutation = { __typename?: 'Mutation', validatePromoCode: { __typename?: 'PromoCode', _id: string, code: string, discountValue?: number | null, promoCodeDiscountType: PromoDiscountType, startDate: any, uptoAmount?: number | null, endDate: any, discountItem?: { __typename?: 'Item', name: string, price: number, image?: string | null } | null } };

export type FetchVisiblePromoCodesQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchVisiblePromoCodesQuery = { __typename?: 'Query', fetchVisiblePromoCodes: Array<{ __typename?: 'PromoCode', _id: string, code: string, description?: string | null, isActive: boolean, minCartValue?: number | null, promoCodeDiscountType: PromoDiscountType, discountValue?: number | null, couponUsageType: CouponUsageType, uptoAmount?: number | null, discountItem?: { __typename?: 'Item', name: string, desc?: string | null, price: number, priceOptions: Array<{ __typename?: 'PriceOptions', menuType: MenuTypeEnum, price: number }> } | null }> };

export type AllPlacesQueryVariables = Exact<{
  input: Scalars['String']['input'];
}>;


export type AllPlacesQuery = { __typename?: 'Query', getPlacesList: Array<{ __typename?: 'Places', placeId: string, displayName: string }> };

export type PlaceDetailsQueryVariables = Exact<{
  placeId: Scalars['String']['input'];
}>;


export type PlaceDetailsQuery = { __typename?: 'Query', getPlaceDetails?: { __typename?: 'PlaceDetail', latitude: number, longitude: number, city?: string | null, state?: string | null, address?: string | null, zipcode?: string | null } | null };

export type FetchLoyaltyCustomerRulesQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchLoyaltyCustomerRulesQuery = { __typename?: 'Query', fetchLoyaltyCustomerRules: { __typename?: 'LoyaltyRules', signUpRewardActive: boolean, signUpRewardValue: number, onOrderRewardActive: boolean, onOrderRewardValue: number, onBirthdayRewardActive: boolean, onBirthdayRewardValue: number, programName: string, programDesc: string } };

export type FetchRestaurantRedeemOffersQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchRestaurantRedeemOffersQuery = { __typename?: 'Query', fetchRestaurantRedeemOffers: { __typename?: 'RestaurantRedeemOffers', pointsRedemptions: Array<{ __typename?: 'LoyaltyPointsRedemption', _id: string, pointsThreshold: number, discountType: DiscountType, discountValue: number, uptoAmount?: number | null }>, itemRedemptions: Array<{ __typename?: 'LoyaltyItemRedemption', _id: string, pointsThreshold: number, item: { __typename?: 'Item', image?: string | null, name: string, _id: string, price: number } }> } };

export type FetchCustomerLoyaltyWalletQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchCustomerLoyaltyWalletQuery = { __typename?: 'Query', fetchCustomerLoyaltyWallet: { __typename?: 'CustomerLoyaltyWallet', _id: string, balance: number, lifeTimePointsEarned: number } };

export type ValidateLoyaltyRedemptionOnCartMutationVariables = Exact<{
  input: LoyaltyInput;
}>;


export type ValidateLoyaltyRedemptionOnCartMutation = { __typename?: 'Mutation', validateLoyaltyRedemptionOnCart: boolean };

export type SendOtpGuestOrderQueryVariables = Exact<{
  verify: VerifyGuestOrderInput;
}>;


export type SendOtpGuestOrderQuery = { __typename?: 'Query', sendOTPGuestOrder: boolean };

export type VerifyOtpGuestOrderQueryVariables = Exact<{
  verify: CustomerDetailsInput;
}>;


export type VerifyOtpGuestOrderQuery = { __typename?: 'Query', verifyOTPGuestOrder: { __typename?: 'VerifyOTPGuestOrderResponse', success: boolean, customer?: { __typename?: 'Customer', firstName?: string | null, lastName?: string | null, email?: string | null, phone: string } | null } };

export type CreateOrderMutationVariables = Exact<{
  createOrder: CreateOrderInput;
}>;


export type CreateOrderMutation = { __typename?: 'Mutation', createOrder: { __typename?: 'OrderPlacedInfo', success: boolean, message?: string | null, orderId?: string | null } };

export type FetchCustomerOrdersQueryVariables = Exact<{
  lastThreeOrders?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type FetchCustomerOrdersQuery = { __typename?: 'Query', fetchCustomerOrders: Array<{ __typename?: 'PopulatedOrder', _id: string, createdAt: any, orderType?: string | null, orderId: string, totalAmount: number, items: Array<{ __typename?: 'PopulatedOrderItem', qty: number, itemPrice: number, itemId: { __typename?: 'Item', name: string, desc?: string | null }, modifierGroups: Array<{ __typename?: 'PopulatedOrderModifierGroup', selectedModifiers: Array<{ __typename?: 'PopulatedOrderModifier', modifierName: string, modifierPrice: number, qty: number }> }> }> }> };

export type FetchOrderByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type FetchOrderByIdQuery = { __typename?: 'Query', fetchCustomerOrderById: { __typename?: 'OrderWithTotals', _id: string, orderId: string, orderType?: OrderType | null, taxPercent: number, specialRemark?: string | null, tipPercent?: number | null, tipAmount: number, thirdPartyTip: boolean, deliveryAmount?: number | null, refundAmount: number, paymentMethod?: string | null, createdAt: any, pickUpDateAndTime?: any | null, deliveryDateAndTime?: any | null, taxAmount: number, grossAmount: number, subTotalAmount: number, finalAmount: number, discountAmount: number, platformFees: number, status: OrderStatus, deliveryAddress?: { __typename?: 'AddressInfo', addressLine1: string, city: string, zipcode: number, state: { __typename?: 'StateData', stateId: string, stateName: string }, coordinate?: { __typename?: 'LocationCommon', coordinates: Array<number> } | null, place?: { __typename?: 'Places', placeId: string, displayName: string } | null } | null, appliedDiscount?: { __typename?: 'DiscountData', discountType: OrderDiscountType, discountAmount: number, loyaltyData?: { __typename?: 'LoyaltyRedeemData', loyaltyPointsRedeemed: number, redeemType: LoyaltyRedeemType, redeemItem?: { __typename?: 'RedeemItem', itemName: string, itemPrice: number, itemId: string } | null, redeemDiscount?: { __typename?: 'RedeemDiscount', discountType: string, discountValue?: number | null } | null } | null, promoData?: { __typename?: 'PromoCodeData', code: string, discountType: PromoDiscountType, discountValue?: number | null, discountItemId?: string | null, discountItemName?: string | null, uptoAmount?: number | null } | null } | null, items: Array<{ __typename?: 'OrderItem', itemPrice: number, itemRemarks?: string | null, qty: number, itemName: string, modifierGroups: Array<{ __typename?: 'OrderModifierGroups', mgName: string, price?: number | null, selectedModifiers: Array<{ __typename?: 'OrderModifiers', modifierName: string, modifierPrice: number, qty: number }> }> }>, guestData?: { __typename?: 'GuestData', phone: string } | null, customerInfo: { __typename?: 'CustomerReceiptInfo', name?: string | null, email?: string | null, phone?: string | null }, restaurantInfo: { __typename?: 'RestaurantReceiptInfo', name: string, email?: string | null, phone: string, address: { __typename?: 'AddressInfo', addressLine1: string, city: string, zipcode: number, state: { __typename?: 'StateData', stateName: string }, place?: { __typename?: 'Places', displayName: string } | null } }, loyaltyTransactions: Array<{ __typename?: 'LoyaltyTransactionSummary', transactionType: TransactionType, points: number }> } };

export type CreateCheckoutPaymentIntentQueryVariables = Exact<{ [key: string]: never; }>;


export type CreateCheckoutPaymentIntentQuery = { __typename?: 'Query', createCheckoutPaymentIntent: { __typename?: 'PaymentIntentResponse', cs: string, id: string } };

export type ValidateDeliveryQueryVariables = Exact<{
  input: ValidateDeliveryInput;
}>;


export type ValidateDeliveryQuery = { __typename?: 'Query', validateDelivery: boolean };

export type FetchDeliveryFeeQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchDeliveryFeeQuery = { __typename?: 'Query', fetchDeliveryFee: number };

export type GetStripeAccountIdQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStripeAccountIdQuery = { __typename?: 'Query', getStripeAccountId: string };

export type FetchProcessingFeeQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchProcessingFeeQuery = { __typename?: 'Query', fetchProcessingFee: number };

export type UpdateCartTipQueryVariables = Exact<{
  tipPercent: Scalars['Float']['input'];
}>;


export type UpdateCartTipQuery = { __typename?: 'Query', updateCartTip: boolean };

export type GetPaymentStatusQueryVariables = Exact<{
  paymentIntentId: Scalars['String']['input'];
  paymentCs: Scalars['String']['input'];
}>;


export type GetPaymentStatusQuery = { __typename?: 'Query', getPaymentStatus?: string | null };

export type CreateOrderWithoutPaymentMutationVariables = Exact<{
  createOrder: CreateOrderWihoutPaymentInput;
}>;


export type CreateOrderWithoutPaymentMutation = { __typename?: 'Mutation', createOrderWithoutPayment: { __typename?: 'OrderPlacedInfo', success: boolean, message?: string | null, orderId?: string | null } };

export type CheckDeliveryAvailableQueryVariables = Exact<{ [key: string]: never; }>;


export type CheckDeliveryAvailableQuery = { __typename?: 'Query', checkDeliveryAvailable: boolean };

export type ReorderItemsToCartMutationVariables = Exact<{
  orderId: Scalars['String']['input'];
}>;


export type ReorderItemsToCartMutation = { __typename?: 'Mutation', reorderItemsToCart: { __typename?: 'ReorderOrderResponse', success: boolean, specialMessage?: string | null } };

export type GetCmsPromoRouteDetailsQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type GetCmsPromoRouteDetailsQuery = { __typename?: 'Query', getCmsPromoRouteDetails?: { __typename?: 'CmsPromoRoutes', name: string, heroTitle: string, websiteSeo: { __typename?: 'CmsWebsiteSeoConfig', pageTitle: string, metaDescription: string }, PromoImageSection: Array<{ __typename?: 'CmsImage', desktop: string, mobile?: string | null }>, ctaSection: { __typename?: 'CtaSection', title: string, description: string, button: { __typename?: 'PromoCmsButton', title: string, isExternalLink: boolean, link?: string | null, textColor?: string | null } }, termsAndConditionSection: { __typename?: 'TermsAndConditionSection', title: string, terms: Array<string> } } | null };

export type GetCmsPromoNavItemsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCmsPromoNavItemsQuery = { __typename?: 'Query', getCmsPromoNavItems: Array<{ __typename?: 'PromoNavItem', navTitle: string, link: string }> };

export type GetCmsPromoPopUpQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCmsPromoPopUpQuery = { __typename?: 'Query', getCmsPromoPopUp?: { __typename?: 'CmsPromoPopup', _id: string, status: boolean, content: { __typename?: 'CmsPopupContent', title: string, description: string, isVerticallyAligned: boolean, image?: { __typename?: 'CmsImage', desktop: string, mobile?: string | null } | null, button: { __typename?: 'PromoCmsButton', title: string, link?: string | null } }, updatedBy?: { __typename?: 'User', creatorUser?: string | null } | null } | null };

export type GetCustomerRestaurantDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCustomerRestaurantDetailsQuery = { __typename?: 'Query', getCustomerRestaurantDetails: { __typename?: 'Restaurant', name: string, _id: string, brandingLogo?: string | null, website?: string | null, category?: Array<RestaurantCategory> | null, beverageCategory?: Array<BeverageCategory> | null, foodType?: Array<FoodType> | null, dineInCapacity?: number | null, type?: RestaurantType | null, meatType?: MeatType | null, restaurantConfigs?: { __typename?: 'RestaurantConfigs', pickup?: boolean | null, allowTips?: boolean | null, onlineOrdering?: boolean | null, scheduleOrders?: boolean | null } | null, fulfillmentConfig?: { __typename?: 'FulfillmentConfig', prepTime?: number | null, deliveryTime?: number | null, largeOrderTreshold?: number | null, largeOrderExtraTime?: number | null } | null, deliveryConfig?: { __typename?: 'DeliveryConfig', provideDelivery?: boolean | null, deliveryZone?: Array<{ __typename?: 'DeliveryZone', minimumOrderValue?: number | null, _id: string, provider?: string | null, costCovered?: number | null, radius?: number | null }> | null } | null, timezone?: { __typename?: 'TimezoneData', timezoneName: string } | null, onlineOrderTimingConfig?: { __typename?: 'OnlineOrderTimingConfig', startAfterMinutes?: number | null, endBeforeMinutes?: number | null } | null, address?: { __typename?: 'AddressInfo', addressLine1: string, addressLine2?: string | null, city: string, zipcode: number, state: { __typename?: 'StateData', stateName: string, stateId: string }, coordinate?: { __typename?: 'LocationCommon', coordinates: Array<number> } | null, place?: { __typename?: 'Places', placeId: string, displayName: string } | null } | null, socialInfo?: { __typename?: 'SocialInfo', facebook?: string | null, instagram?: string | null } | null, availability?: Array<{ __typename?: 'Availability', day: string, active: boolean, hours: Array<{ __typename?: 'Hours', start: string, end: string }> }> | null, taxRates?: Array<{ __typename?: 'TaxRateInfo', name: string, _id: string, salesTax: number }> | null } };

export type GetCustomerCategoriesAndItemsQueryVariables = Exact<{
  ItemOptionSelected?: InputMaybe<Array<ItemOptionsEnum> | ItemOptionsEnum>;
  searchText?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetCustomerCategoriesAndItemsQuery = { __typename?: 'Query', getCustomerCategoriesAndItems: Array<{ __typename?: 'CategoryItem', _id: string, name: string, desc?: string | null, createdAt: any, updatedAt: any, availability?: Array<{ __typename?: 'Availability', day: string, active: boolean, hours: Array<{ __typename?: 'Hours', start: string, end: string }> }> | null, items: Array<{ __typename?: 'Item', desc?: string | null, name: string, image?: string | null, price: number, orderLimitTracker?: number | null, _id: string, status: StatusEnum, options: Array<{ __typename?: 'Options', displayName: string, type: ItemOptionsEnum, _id: string, status: boolean }>, modifierGroup: Array<{ __typename?: 'ModifierGroupInfo', name: string }>, priceOptions: Array<{ __typename?: 'PriceOptions', menuType: MenuTypeEnum, price: number }>, visibility: Array<{ __typename?: 'Visibility', menuType: MenuTypeEnum, status: StatusEnum }>, availability?: Array<{ __typename?: 'Availability', day: string, active: boolean, hours: Array<{ __typename?: 'Hours', start: string, end: string }> }> | null }> }> };

export type GetCustomerItemQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetCustomerItemQuery = { __typename?: 'Query', getCustomerItem?: { __typename?: 'ItemWithModifiersResponse', id: string, name: string, desc?: string | null, price: number, image?: string | null, upSellItems?: Array<{ __typename?: 'upSellReturnItem', itemId: string, name: string, desc?: string | null, price: number, image?: string | null }> | null, options: Array<{ __typename?: 'Options', displayName: string, _id: string, type: ItemOptionsEnum, desc: string, status: boolean }>, availability?: Array<{ __typename?: 'Availability', _id: string, day: string, active: boolean, hours: Array<{ __typename?: 'Hours', start: string, end: string }> }> | null, modifierGroups: Array<{ __typename?: 'ModifierGroupResponse', id: string, name: string, optional: boolean, multiSelect: boolean, desc?: string | null, price?: number | null, minSelections: number, maxSelections: number, pricingType: PriceTypeEnum, allowMultiSelctSingleModsInGroup: boolean, maxSelctSingleModsInGroup: number, isMaxSelctSingleModsInGroupUnlimited: boolean, modifiers: Array<{ __typename?: 'ModifierInfoResponse', id: string, name: string, desc?: string | null, preSelect: boolean, price: number, isItem: boolean }> }> } | null };

export type MeCustomerQueryVariables = Exact<{ [key: string]: never; }>;


export type MeCustomerQuery = { __typename?: 'Query', meCustomer?: { __typename?: 'Customer', _id: string, firstName?: string | null, lastName?: string | null, email?: string | null, phone: string, dob?: any | null, accountPreferences?: { __typename?: 'AccountPreference', sms: boolean, email: boolean } | null, loyaltyWallet?: { __typename?: 'CustomerLoyaltyWallet', balance: number } | null } | null };

export type UpdateCustomerDetailsMutationVariables = Exact<{
  input: UpdateCustomerDetailsInput;
}>;


export type UpdateCustomerDetailsMutation = { __typename?: 'Mutation', updateCustomerDetails: { __typename?: 'Customer', _id: string } };

export type CustomerSignUpQueryVariables = Exact<{
  input: CustomerSignupInput;
}>;


export type CustomerSignUpQuery = { __typename?: 'Query', customerSignUp: boolean };

export type CustomerSignUpVerificationQueryVariables = Exact<{
  input: CustomerSignupVerificationInput;
}>;


export type CustomerSignUpVerificationQuery = { __typename?: 'Query', customerSignUpVerification: boolean };

export type CustomerLoginQueryVariables = Exact<{
  input: Scalars['String']['input'];
}>;


export type CustomerLoginQuery = { __typename?: 'Query', customerLogin: boolean };

export type CustomerLoginVerificationQueryVariables = Exact<{
  contact: Scalars['String']['input'];
  otp: Scalars['String']['input'];
}>;


export type CustomerLoginVerificationQuery = { __typename?: 'Query', customerLoginVerification: boolean };

export type CustomerLogoutQueryVariables = Exact<{ [key: string]: never; }>;


export type CustomerLogoutQuery = { __typename?: 'Query', customerLogout: boolean };


export const AddToCartDocument = gql`
    mutation AddToCart($items: [CartItemInput!]!) {
  addToCart(items: $items)
}
    `;
export const DeleteCartItemDocument = gql`
    mutation DeleteCartItem($id: String!) {
  deleteCartItem(id: $id)
}
    `;
export const IncreaseItemQtyDocument = gql`
    mutation IncreaseItemQty($id: String!) {
  increaseItemQty(id: $id)
}
    `;
export const DecreaseItemQtyDocument = gql`
    mutation DecreaseItemQty($id: String!) {
  decreaseItemQty(id: $id)
}
    `;
export const UpdateCartItemDocument = gql`
    mutation UpdateCartItem($input: UpdateCartItemInput!) {
  updateCartItem(input: $input)
}
    `;
export const ClearCartDocument = gql`
    mutation ClearCart {
  clearCart
}
    `;
export const FetchCartItemsDocument = gql`
    query FetchCartItems {
  fetchCartItems {
    message
    cartData {
      _id
      qty
      itemId {
        image
        _id
        name
        price
        priceOptions {
          menuType
          price
        }
      }
      qty
      remarks
      modifierGroups {
        mgId {
          name
          pricingType
          price
          _id
        }
        selectedModifiers {
          qty
          mid {
            name
            price
            _id
          }
        }
      }
    }
  }
}
    `;
export const UpdateCartDetailsDocument = gql`
    mutation updateCartDetails($input: UpdateCartDetailsInput!) {
  updateCartDetails(input: $input)
}
    `;
export const CalculateFinalAmountDocument = gql`
    query CalculateFinalAmount {
  calculateFinalAmount
}
    `;
export const FetchCartDetailsDocument = gql`
    query fetchCartDetails {
  fetchCartDetails {
    _id
    customerDetails {
      firstName
    }
    orderType
    delivery {
      _id
      addressLine1
      addressLine2
      state {
        stateId
        stateName
      }
      city
      zipcode
      coordinate {
        type
        coordinates
      }
      place {
        placeId
        displayName
      }
    }
    amounts {
      subTotalAmount
      discountAmount
      discountPercent
      discountUpto
      tipPercent
    }
    discountString
    discountItemImage
    discountCode
    loyaltyType
    loyaltyRedeemPoints
    pickUpDateAndTime
    deliveryDateAndTime
  }
}
    `;
export const FetchCartCountDocument = gql`
    query fetchCartCount {
  fetchCartCount
}
    `;
export const GetCmsDetailsDocument = gql`
    query GetCmsDetails {
  getCmsDetails {
    _id
    themeConfig {
      theme
      background
      primary
      secondary
      text
    }
    domainConfig {
      website
    }
    onlineOrderingConfig {
      websiteLink
      primaryTextColor
    }
    heroSection {
      show
      navTitle
      heroItems {
        _id
        image {
          desktop
          mobile
        }
        title
        caption
        button {
          title
          link
          textColor
        }
      }
    }
    menuSection {
      show
      navTitle
      sectionTitle
      items {
        item {
          _id
        }
        title
        description
        image
      }
    }
    contentSection {
      show
      navTitle
      sectionTitle
      sectionContent
    }
    gridSection {
      show
      navTitle
      sectionTitle
      grid1 {
        title
        image
        description
      }
      grid2 {
        title
        image
        description
      }
      grid3 {
        title
        image
        description
      }
    }
    contentWithImageSection {
      show
      navTitle
      contentItems {
        _id
        sectionTitle
        sectionContent
        image {
          desktop
          mobile
        }
        side
      }
    }
    reviewSection {
      show
      navTitle
      reviews {
        _id
        content
        name
      }
    }
    websiteSeo {
      pageTitle
      metaDescription
    }
  }
}
    `;
export const GetCmsRestaurantDetailsDocument = gql`
    query GetCmsRestaurantDetails {
  getCmsRestaurantDetails {
    _id
    name
    brandingLogo
    address {
      addressLine1
      addressLine2
      city
      state {
        stateName
      }
      city
      zipcode
      coordinate {
        coordinates
      }
      place {
        displayName
      }
    }
    availability {
      day
      hours {
        start
        end
      }
      active
    }
    email
    phone
    socialInfo {
      facebook
      instagram
    }
  }
}
    `;
export const CmsContactUsDocument = gql`
    mutation cmsContactUs($input: CmsContactInput!) {
  cmsContactUs(input: $input)
}
    `;
export const ValidatePromoCodeDocument = gql`
    mutation ValidatePromoCode($code: String!) {
  validatePromoCode(code: $code) {
    _id
    code
    discountValue
    promoCodeDiscountType
    startDate
    uptoAmount
    endDate
    discountItem {
      name
      price
      image
    }
  }
}
    `;
export const FetchVisiblePromoCodesDocument = gql`
    query fetchVisiblePromoCodes {
  fetchVisiblePromoCodes {
    _id
    code
    description
    isActive
    minCartValue
    promoCodeDiscountType
    discountValue
    couponUsageType
    uptoAmount
    discountItem {
      name
      desc
      price
      priceOptions {
        menuType
        price
      }
    }
  }
}
    `;
export const AllPlacesDocument = gql`
    query AllPlaces($input: String!) {
  getPlacesList(input: $input) {
    placeId
    displayName
  }
}
    `;
export const PlaceDetailsDocument = gql`
    query PlaceDetails($placeId: String!) {
  getPlaceDetails(placeId: $placeId) {
    latitude
    longitude
    city
    state
    address
    zipcode
  }
}
    `;
export const FetchLoyaltyCustomerRulesDocument = gql`
    query fetchLoyaltyCustomerRules {
  fetchLoyaltyCustomerRules {
    signUpRewardActive
    signUpRewardValue
    onOrderRewardActive
    onOrderRewardValue
    onBirthdayRewardActive
    onBirthdayRewardValue
    programName
    programDesc
  }
}
    `;
export const FetchRestaurantRedeemOffersDocument = gql`
    query fetchRestaurantRedeemOffers {
  fetchRestaurantRedeemOffers {
    pointsRedemptions {
      _id
      pointsThreshold
      discountType
      discountValue
      uptoAmount
    }
    itemRedemptions {
      _id
      item {
        image
        name
        _id
        price
      }
      pointsThreshold
    }
  }
}
    `;
export const FetchCustomerLoyaltyWalletDocument = gql`
    query fetchCustomerLoyaltyWallet {
  fetchCustomerLoyaltyWallet {
    _id
    balance
    lifeTimePointsEarned
  }
}
    `;
export const ValidateLoyaltyRedemptionOnCartDocument = gql`
    mutation validateLoyaltyRedemptionOnCart($input: LoyaltyInput!) {
  validateLoyaltyRedemptionOnCart(input: $input)
}
    `;
export const SendOtpGuestOrderDocument = gql`
    query sendOTPGuestOrder($verify: VerifyGuestOrderInput!) {
  sendOTPGuestOrder(input: $verify)
}
    `;
export const VerifyOtpGuestOrderDocument = gql`
    query verifyOTPGuestOrder($verify: CustomerDetailsInput!) {
  verifyOTPGuestOrder(input: $verify) {
    success
    customer {
      firstName
      lastName
      email
      phone
    }
  }
}
    `;
export const CreateOrderDocument = gql`
    mutation CreateOrder($createOrder: CreateOrderInput!) {
  createOrder(input: $createOrder) {
    success
    message
    orderId
  }
}
    `;
export const FetchCustomerOrdersDocument = gql`
    query fetchCustomerOrders($lastThreeOrders: Boolean) {
  fetchCustomerOrders(lastThreeOrders: $lastThreeOrders) {
    _id
    createdAt
    orderType
    orderId
    totalAmount
    items {
      qty
      itemPrice
      itemId {
        name
        desc
      }
      modifierGroups {
        selectedModifiers {
          modifierName
          modifierPrice
          qty
        }
      }
    }
  }
}
    `;
export const FetchOrderByIdDocument = gql`
    query fetchOrderById($id: ID!) {
  fetchCustomerOrderById(orderId: $id) {
    _id
    orderId
    orderType
    taxPercent
    specialRemark
    tipPercent
    tipAmount
    thirdPartyTip
    deliveryAmount
    refundAmount
    deliveryAddress {
      addressLine1
      state {
        stateId
        stateName
      }
      city
      zipcode
      coordinate {
        coordinates
      }
      place {
        placeId
        displayName
      }
    }
    paymentMethod
    appliedDiscount {
      discountType
      discountAmount
      loyaltyData {
        loyaltyPointsRedeemed
        redeemType
        redeemItem {
          itemName
          itemPrice
          itemId
        }
        redeemDiscount {
          discountType
          discountValue
        }
      }
      promoData {
        code
        discountType
        discountValue
        discountItemId
        discountItemName
        uptoAmount
      }
    }
    createdAt
    pickUpDateAndTime
    deliveryDateAndTime
    items {
      itemPrice
      itemRemarks
      qty
      itemName
      modifierGroups {
        mgName
        price
        selectedModifiers {
          modifierName
          modifierPrice
          qty
        }
      }
    }
    taxAmount
    grossAmount
    subTotalAmount
    finalAmount
    discountAmount
    platformFees
    createdAt
    paymentMethod
    status
    guestData {
      phone
    }
    orderType
    customerInfo {
      name
      email
      phone
    }
    restaurantInfo {
      name
      email
      phone
      address {
        addressLine1
        state {
          stateName
        }
        city
        zipcode
        place {
          displayName
        }
      }
    }
    loyaltyTransactions {
      transactionType
      points
    }
  }
}
    `;
export const CreateCheckoutPaymentIntentDocument = gql`
    query CreateCheckoutPaymentIntent {
  createCheckoutPaymentIntent {
    cs
    id
  }
}
    `;
export const ValidateDeliveryDocument = gql`
    query validateDelivery($input: ValidateDeliveryInput!) {
  validateDelivery(input: $input)
}
    `;
export const FetchDeliveryFeeDocument = gql`
    query fetchDeliveryFee {
  fetchDeliveryFee
}
    `;
export const GetStripeAccountIdDocument = gql`
    query getStripeAccountId {
  getStripeAccountId
}
    `;
export const FetchProcessingFeeDocument = gql`
    query fetchProcessingFee {
  fetchProcessingFee
}
    `;
export const UpdateCartTipDocument = gql`
    query updateCartTip($tipPercent: Float!) {
  updateCartTip(tipPercent: $tipPercent)
}
    `;
export const GetPaymentStatusDocument = gql`
    query GetPaymentStatus($paymentIntentId: String!, $paymentCs: String!) {
  getPaymentStatus(paymentIntentId: $paymentIntentId, paymentCs: $paymentCs)
}
    `;
export const CreateOrderWithoutPaymentDocument = gql`
    mutation createOrderWithoutPayment($createOrder: CreateOrderWihoutPaymentInput!) {
  createOrderWithoutPayment(input: $createOrder) {
    success
    message
    orderId
  }
}
    `;
export const CheckDeliveryAvailableDocument = gql`
    query checkDeliveryAvailable {
  checkDeliveryAvailable
}
    `;
export const ReorderItemsToCartDocument = gql`
    mutation reorderItemsToCart($orderId: String!) {
  reorderItemsToCart(orderId: $orderId) {
    success
    specialMessage
  }
}
    `;
export const GetCmsPromoRouteDetailsDocument = gql`
    query getCmsPromoRouteDetails($slug: String!) {
  getCmsPromoRouteDetails(slug: $slug) {
    name
    websiteSeo {
      pageTitle
      metaDescription
    }
    heroTitle
    PromoImageSection {
      desktop
      mobile
    }
    ctaSection {
      title
      description
      button {
        title
        isExternalLink
        link
        textColor
      }
    }
    termsAndConditionSection {
      title
      terms
    }
  }
}
    `;
export const GetCmsPromoNavItemsDocument = gql`
    query getCmsPromoNavItems {
  getCmsPromoNavItems {
    navTitle
    link
  }
}
    `;
export const GetCmsPromoPopUpDocument = gql`
    query getCmsPromoPopUp {
  getCmsPromoPopUp {
    _id
    status
    content {
      title
      description
      image {
        desktop
        mobile
      }
      button {
        title
        link
      }
      isVerticallyAligned
    }
    updatedBy {
      creatorUser
    }
  }
}
    `;
export const GetCustomerRestaurantDetailsDocument = gql`
    query GetCustomerRestaurantDetails {
  getCustomerRestaurantDetails {
    name
    _id
    restaurantConfigs {
      pickup
      allowTips
      onlineOrdering
      scheduleOrders
    }
    fulfillmentConfig {
      prepTime
      deliveryTime
      largeOrderTreshold
      largeOrderExtraTime
    }
    deliveryConfig {
      provideDelivery
      deliveryZone {
        minimumOrderValue
        _id
        provider
        costCovered
        radius
      }
    }
    timezone {
      timezoneName
    }
    onlineOrderTimingConfig {
      startAfterMinutes
      endBeforeMinutes
    }
    address {
      addressLine1
      addressLine2
      state {
        stateName
        stateId
      }
      city
      zipcode
      coordinate {
        coordinates
      }
      place {
        placeId
        displayName
      }
    }
    brandingLogo
    website
    socialInfo {
      facebook
      instagram
    }
    availability {
      day
      hours {
        start
        end
      }
      active
    }
    category
    beverageCategory
    foodType
    dineInCapacity
    type
    meatType
    taxRates {
      name
      _id
      salesTax
    }
  }
}
    `;
export const GetCustomerCategoriesAndItemsDocument = gql`
    query getCustomerCategoriesAndItems($ItemOptionSelected: [ItemOptionsEnum!], $searchText: String) {
  getCustomerCategoriesAndItems(
    ItemOptionSelected: $ItemOptionSelected
    searchText: $searchText
  ) {
    _id
    name
    desc
    availability {
      day
      hours {
        start
        end
      }
      active
    }
    items {
      desc
      name
      image
      price
      options {
        displayName
        type
        _id
        status
      }
      modifierGroup {
        name
      }
      orderLimitTracker
      priceOptions {
        menuType
        price
      }
      _id
      status
      visibility {
        menuType
        status
      }
      availability {
        day
        hours {
          start
          end
        }
        active
      }
    }
    createdAt
    updatedAt
  }
}
    `;
export const GetCustomerItemDocument = gql`
    query getCustomerItem($id: String!) {
  getCustomerItem(id: $id) {
    id
    name
    desc
    price
    image
    upSellItems {
      itemId
      name
      desc
      price
      image
    }
    options {
      displayName
      _id
      type
      desc
      status
    }
    availability {
      _id
      day
      hours {
        start
        end
      }
      active
    }
    modifierGroups {
      id
      name
      optional
      multiSelect
      desc
      price
      minSelections
      maxSelections
      pricingType
      allowMultiSelctSingleModsInGroup
      maxSelctSingleModsInGroup
      isMaxSelctSingleModsInGroupUnlimited
      modifiers {
        id
        name
        desc
        preSelect
        price
        isItem
      }
    }
  }
}
    `;
export const MeCustomerDocument = gql`
    query meCustomer {
  meCustomer {
    _id
    firstName
    lastName
    email
    phone
    dob
    accountPreferences {
      sms
      email
    }
    loyaltyWallet {
      balance
    }
  }
}
    `;
export const UpdateCustomerDetailsDocument = gql`
    mutation UpdateCustomerDetails($input: UpdateCustomerDetailsInput!) {
  updateCustomerDetails(input: $input) {
    _id
  }
}
    `;
export const CustomerSignUpDocument = gql`
    query customerSignUp($input: CustomerSignupInput!) {
  customerSignUp(input: $input)
}
    `;
export const CustomerSignUpVerificationDocument = gql`
    query customerSignUpVerification($input: CustomerSignupVerificationInput!) {
  customerSignUpVerification(input: $input)
}
    `;
export const CustomerLoginDocument = gql`
    query customerLogin($input: String!) {
  customerLogin(input: $input)
}
    `;
export const CustomerLoginVerificationDocument = gql`
    query customerLoginVerification($contact: String!, $otp: String!) {
  customerLoginVerification(input: {contact: $contact, otp: $otp})
}
    `;
export const CustomerLogoutDocument = gql`
    query customerLogout {
  customerLogout
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    AddToCart(variables: AddToCartMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddToCartMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddToCartMutation>(AddToCartDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddToCart', 'mutation', variables);
    },
    DeleteCartItem(variables: DeleteCartItemMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<DeleteCartItemMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteCartItemMutation>(DeleteCartItemDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'DeleteCartItem', 'mutation', variables);
    },
    IncreaseItemQty(variables: IncreaseItemQtyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<IncreaseItemQtyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<IncreaseItemQtyMutation>(IncreaseItemQtyDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'IncreaseItemQty', 'mutation', variables);
    },
    DecreaseItemQty(variables: DecreaseItemQtyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<DecreaseItemQtyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DecreaseItemQtyMutation>(DecreaseItemQtyDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'DecreaseItemQty', 'mutation', variables);
    },
    UpdateCartItem(variables: UpdateCartItemMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateCartItemMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateCartItemMutation>(UpdateCartItemDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateCartItem', 'mutation', variables);
    },
    ClearCart(variables?: ClearCartMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ClearCartMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ClearCartMutation>(ClearCartDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ClearCart', 'mutation', variables);
    },
    FetchCartItems(variables?: FetchCartItemsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FetchCartItemsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FetchCartItemsQuery>(FetchCartItemsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FetchCartItems', 'query', variables);
    },
    updateCartDetails(variables: UpdateCartDetailsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateCartDetailsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateCartDetailsMutation>(UpdateCartDetailsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateCartDetails', 'mutation', variables);
    },
    CalculateFinalAmount(variables?: CalculateFinalAmountQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CalculateFinalAmountQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<CalculateFinalAmountQuery>(CalculateFinalAmountDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'CalculateFinalAmount', 'query', variables);
    },
    fetchCartDetails(variables?: FetchCartDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FetchCartDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FetchCartDetailsQuery>(FetchCartDetailsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'fetchCartDetails', 'query', variables);
    },
    fetchCartCount(variables?: FetchCartCountQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FetchCartCountQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FetchCartCountQuery>(FetchCartCountDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'fetchCartCount', 'query', variables);
    },
    GetCmsDetails(variables?: GetCmsDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetCmsDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCmsDetailsQuery>(GetCmsDetailsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetCmsDetails', 'query', variables);
    },
    GetCmsRestaurantDetails(variables?: GetCmsRestaurantDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetCmsRestaurantDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCmsRestaurantDetailsQuery>(GetCmsRestaurantDetailsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetCmsRestaurantDetails', 'query', variables);
    },
    cmsContactUs(variables: CmsContactUsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CmsContactUsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CmsContactUsMutation>(CmsContactUsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'cmsContactUs', 'mutation', variables);
    },
    ValidatePromoCode(variables: ValidatePromoCodeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ValidatePromoCodeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ValidatePromoCodeMutation>(ValidatePromoCodeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ValidatePromoCode', 'mutation', variables);
    },
    fetchVisiblePromoCodes(variables?: FetchVisiblePromoCodesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FetchVisiblePromoCodesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FetchVisiblePromoCodesQuery>(FetchVisiblePromoCodesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'fetchVisiblePromoCodes', 'query', variables);
    },
    AllPlaces(variables: AllPlacesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AllPlacesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllPlacesQuery>(AllPlacesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AllPlaces', 'query', variables);
    },
    PlaceDetails(variables: PlaceDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<PlaceDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<PlaceDetailsQuery>(PlaceDetailsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'PlaceDetails', 'query', variables);
    },
    fetchLoyaltyCustomerRules(variables?: FetchLoyaltyCustomerRulesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FetchLoyaltyCustomerRulesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FetchLoyaltyCustomerRulesQuery>(FetchLoyaltyCustomerRulesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'fetchLoyaltyCustomerRules', 'query', variables);
    },
    fetchRestaurantRedeemOffers(variables?: FetchRestaurantRedeemOffersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FetchRestaurantRedeemOffersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FetchRestaurantRedeemOffersQuery>(FetchRestaurantRedeemOffersDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'fetchRestaurantRedeemOffers', 'query', variables);
    },
    fetchCustomerLoyaltyWallet(variables?: FetchCustomerLoyaltyWalletQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FetchCustomerLoyaltyWalletQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FetchCustomerLoyaltyWalletQuery>(FetchCustomerLoyaltyWalletDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'fetchCustomerLoyaltyWallet', 'query', variables);
    },
    validateLoyaltyRedemptionOnCart(variables: ValidateLoyaltyRedemptionOnCartMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ValidateLoyaltyRedemptionOnCartMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ValidateLoyaltyRedemptionOnCartMutation>(ValidateLoyaltyRedemptionOnCartDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'validateLoyaltyRedemptionOnCart', 'mutation', variables);
    },
    sendOTPGuestOrder(variables: SendOtpGuestOrderQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SendOtpGuestOrderQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<SendOtpGuestOrderQuery>(SendOtpGuestOrderDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'sendOTPGuestOrder', 'query', variables);
    },
    verifyOTPGuestOrder(variables: VerifyOtpGuestOrderQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<VerifyOtpGuestOrderQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<VerifyOtpGuestOrderQuery>(VerifyOtpGuestOrderDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'verifyOTPGuestOrder', 'query', variables);
    },
    CreateOrder(variables: CreateOrderMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CreateOrderMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateOrderMutation>(CreateOrderDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'CreateOrder', 'mutation', variables);
    },
    fetchCustomerOrders(variables?: FetchCustomerOrdersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FetchCustomerOrdersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FetchCustomerOrdersQuery>(FetchCustomerOrdersDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'fetchCustomerOrders', 'query', variables);
    },
    fetchOrderById(variables: FetchOrderByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FetchOrderByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FetchOrderByIdQuery>(FetchOrderByIdDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'fetchOrderById', 'query', variables);
    },
    CreateCheckoutPaymentIntent(variables?: CreateCheckoutPaymentIntentQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CreateCheckoutPaymentIntentQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateCheckoutPaymentIntentQuery>(CreateCheckoutPaymentIntentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'CreateCheckoutPaymentIntent', 'query', variables);
    },
    validateDelivery(variables: ValidateDeliveryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ValidateDeliveryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ValidateDeliveryQuery>(ValidateDeliveryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'validateDelivery', 'query', variables);
    },
    fetchDeliveryFee(variables?: FetchDeliveryFeeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FetchDeliveryFeeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FetchDeliveryFeeQuery>(FetchDeliveryFeeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'fetchDeliveryFee', 'query', variables);
    },
    getStripeAccountId(variables?: GetStripeAccountIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetStripeAccountIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetStripeAccountIdQuery>(GetStripeAccountIdDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getStripeAccountId', 'query', variables);
    },
    fetchProcessingFee(variables?: FetchProcessingFeeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FetchProcessingFeeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FetchProcessingFeeQuery>(FetchProcessingFeeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'fetchProcessingFee', 'query', variables);
    },
    updateCartTip(variables: UpdateCartTipQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateCartTipQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateCartTipQuery>(UpdateCartTipDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateCartTip', 'query', variables);
    },
    GetPaymentStatus(variables: GetPaymentStatusQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetPaymentStatusQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetPaymentStatusQuery>(GetPaymentStatusDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetPaymentStatus', 'query', variables);
    },
    createOrderWithoutPayment(variables: CreateOrderWithoutPaymentMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CreateOrderWithoutPaymentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateOrderWithoutPaymentMutation>(CreateOrderWithoutPaymentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createOrderWithoutPayment', 'mutation', variables);
    },
    checkDeliveryAvailable(variables?: CheckDeliveryAvailableQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CheckDeliveryAvailableQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<CheckDeliveryAvailableQuery>(CheckDeliveryAvailableDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'checkDeliveryAvailable', 'query', variables);
    },
    reorderItemsToCart(variables: ReorderItemsToCartMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ReorderItemsToCartMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ReorderItemsToCartMutation>(ReorderItemsToCartDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'reorderItemsToCart', 'mutation', variables);
    },
    getCmsPromoRouteDetails(variables: GetCmsPromoRouteDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetCmsPromoRouteDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCmsPromoRouteDetailsQuery>(GetCmsPromoRouteDetailsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getCmsPromoRouteDetails', 'query', variables);
    },
    getCmsPromoNavItems(variables?: GetCmsPromoNavItemsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetCmsPromoNavItemsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCmsPromoNavItemsQuery>(GetCmsPromoNavItemsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getCmsPromoNavItems', 'query', variables);
    },
    getCmsPromoPopUp(variables?: GetCmsPromoPopUpQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetCmsPromoPopUpQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCmsPromoPopUpQuery>(GetCmsPromoPopUpDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getCmsPromoPopUp', 'query', variables);
    },
    GetCustomerRestaurantDetails(variables?: GetCustomerRestaurantDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetCustomerRestaurantDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCustomerRestaurantDetailsQuery>(GetCustomerRestaurantDetailsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetCustomerRestaurantDetails', 'query', variables);
    },
    getCustomerCategoriesAndItems(variables?: GetCustomerCategoriesAndItemsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetCustomerCategoriesAndItemsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCustomerCategoriesAndItemsQuery>(GetCustomerCategoriesAndItemsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getCustomerCategoriesAndItems', 'query', variables);
    },
    getCustomerItem(variables: GetCustomerItemQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetCustomerItemQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCustomerItemQuery>(GetCustomerItemDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getCustomerItem', 'query', variables);
    },
    meCustomer(variables?: MeCustomerQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<MeCustomerQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MeCustomerQuery>(MeCustomerDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'meCustomer', 'query', variables);
    },
    UpdateCustomerDetails(variables: UpdateCustomerDetailsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateCustomerDetailsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateCustomerDetailsMutation>(UpdateCustomerDetailsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateCustomerDetails', 'mutation', variables);
    },
    customerSignUp(variables: CustomerSignUpQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CustomerSignUpQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<CustomerSignUpQuery>(CustomerSignUpDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'customerSignUp', 'query', variables);
    },
    customerSignUpVerification(variables: CustomerSignUpVerificationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CustomerSignUpVerificationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<CustomerSignUpVerificationQuery>(CustomerSignUpVerificationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'customerSignUpVerification', 'query', variables);
    },
    customerLogin(variables: CustomerLoginQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CustomerLoginQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<CustomerLoginQuery>(CustomerLoginDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'customerLogin', 'query', variables);
    },
    customerLoginVerification(variables: CustomerLoginVerificationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CustomerLoginVerificationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<CustomerLoginVerificationQuery>(CustomerLoginVerificationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'customerLoginVerification', 'query', variables);
    },
    customerLogout(variables?: CustomerLogoutQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CustomerLogoutQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<CustomerLogoutQuery>(CustomerLogoutDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'customerLogout', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;