export type CabinClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

export type FlightSearchParams = {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults: number;
  cabin?: CabinClass;
};

export type FlightSegment = {
  id: string;
  carrierCode: string;
  number: string;
  departure: {
    iataCode: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    at: string;
  };
  durationMinutes: number;
  stops: number;
};

export type FlightItinerary = {
  durationMinutes: number;
  segments: FlightSegment[];
};

export type FlightOffer = {
  id: string;
  price: {
    total: number;
    currency: string;
  };
  itineraries: FlightItinerary[];
  stopsCount: number;
  airlines: string[];
};

export type FlightOffersResponse = {
  offers: FlightOffer[];
  carriers: Record<string, string>;
};

export type LocationOption = {
  iata: string;
  name: string;
  city: string;
  country: string;
  countryCode?: string;
  subType: "AIRPORT" | "CITY";
};

