export interface LocationRestriction {
  rectangle: {
    low: { latitude: number; longitude: number };
    high: { latitude: number; longitude: number };
  };
}