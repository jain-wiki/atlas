export interface LocationRestriction {
  rectangle: {
    low: { latitude: number; longitude: number };
    high: { latitude: number; longitude: number };
  };
}




// Response from Google Maps API for a place search request
export interface Place {
  id: string; // Example: "ChIJyRPcwxi55zsRoejrqCgGJXo"
  // Example: "1, Near Bhakti Sindhu Co Op Housing Society, Meenatai Thakre Rd, Bhakti Mandir, Panch Pakhdi, Thane West, Thane, Maharashtra 400602, India"
  formattedAddress?: string;
  plusCode?: {
    compoundCode: string; // Example: "5XV9+28 Thane, Maharashtra, India"
    globalCode: string; // Example: "7JFJ5XV9+28"
  };
  types: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  // Example: "https://maps.google.com/?cid=8801447818467993761&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQABgEIAA"
  googleMapsUri?: string;
  displayName?: {
    languageCode: string;
    text: string;
  };
  postalAddress?: {
    administrativeArea: string; // Example: "Maharashtra"
    languageCode: string;
    locality: string; // Example: "Thane"
    postalCode: string; // Example: "400602"
    regionCode: string; // Example: "IN"
    // Example: ["1, Near Bhakti Sindhu Co Op Housing Society", "Meenatai Thakre Rd", "Bhakti Mandir, Panch Pakhdi, Thane West"]
    addressLines: string[];
  };
}