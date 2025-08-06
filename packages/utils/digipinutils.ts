// Create a lookup map for O(1) character position finding
const DIGIPIN_CHAR_MAP = new Map([
  ['F', { row: 0, col: 0 }], ['C', { row: 0, col: 1 }], ['9', { row: 0, col: 2 }], ['8', { row: 0, col: 3 }],
  ['J', { row: 1, col: 0 }], ['3', { row: 1, col: 1 }], ['2', { row: 1, col: 2 }], ['7', { row: 1, col: 3 }],
  ['K', { row: 2, col: 0 }], ['4', { row: 2, col: 1 }], ['5', { row: 2, col: 2 }], ['6', { row: 2, col: 3 }],
  ['L', { row: 3, col: 0 }], ['M', { row: 3, col: 1 }], ['P', { row: 3, col: 2 }], ['T', { row: 3, col: 3 }]
]);

export function getBoundingBoxFromDigiPINPrefix(prefix: string): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  // Remove any whitespace, "-" and convert to uppercase
  const cleanPrefix = prefix.replace(/\s+|-/g, '').toUpperCase();

  if (cleanPrefix.length < 1 || cleanPrefix.length > 10) {
    throw new Error("Prefix length must be between 1 and 10 characters.");
  }

  let minLat = 2.5, maxLat = 38.5;
  let minLng = 63.5, maxLng = 99.5;

  for (const char of cleanPrefix) {
    const position = DIGIPIN_CHAR_MAP.get(char);

    if (!position) {
      throw new Error(`Invalid DIGIPIN character: ${char}`);
    }

    const latDiv = (maxLat - minLat) * 0.25; // Multiply by 0.25 instead of divide by 4
    const lonDiv = (maxLng - minLng) * 0.25;

    // Update bounds using the position directly
    maxLat = maxLat - (position.row * latDiv);
    minLat = maxLat - latDiv;
    minLng = minLng + (position.col * lonDiv);
    maxLng = minLng + lonDiv;
  }

  return {
    minLat,
    maxLat,
    minLng,
    maxLng
  };
}