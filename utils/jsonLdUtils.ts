import { groupHoursByDays } from "./theme-utils";

interface StateData {
  stateName: string;
}

interface LocationCommon {
  coordinates: number[];
}

interface Places {
  displayName: string;
}

interface AddressInfo {
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  zipcode: number;
  state: StateData;
  coordinate?: LocationCommon | null;
  place?: Places | null;
}

interface Hours {
  start: string;
  end: string;
}

interface Availability {
  day: string;
  active: boolean;
  hours: Hours[];
}

interface SocialInfo {
  facebook?: string | null;
  instagram?: string | null;
}

interface Restaurant {
  _id: string;
  name: string;
  brandingLogo?: string | null;
  email: string;
  phone: string;
  address?: AddressInfo | null;
  availability?: Availability[] | null;
  socialInfo?: SocialInfo | null;
}

export const generateRestaurantJsonLd = (restaurantData: Restaurant) => {
  const { name, address, phone, socialInfo, brandingLogo, availability } =
    restaurantData;

  // Type guard for coordinate
  const isCoordinateValid = (
    coord: LocationCommon | null | undefined
  ): coord is LocationCommon => {
    return (
      !!coord &&
      Array.isArray(coord.coordinates) &&
      coord.coordinates.length === 2
    );
  };

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: name,
    image: brandingLogo ?? undefined,
    url: "https://lahoregrill.com",
    telephone: phone,
    address: address
      ? {
          "@type": "PostalAddress",
          streetAddress: address.addressLine1,
          addressLocality: address.city,
          addressRegion: address.state.stateName,
          postalCode: address.zipcode.toString(),
        }
      : undefined,
    geo:
      address?.coordinate && isCoordinateValid(address.coordinate)
        ? {
            "@type": "GeoCoordinates",
            latitude: address.coordinate.coordinates[1],
            longitude: address.coordinate.coordinates[0],
          }
        : undefined,
    openingHoursSpecification: availability
      ? groupHoursByDays(availability)
      : undefined,
    sameAs: [socialInfo?.facebook, socialInfo?.instagram].filter(
      (link): link is string => !!link
    ),
  };
};
