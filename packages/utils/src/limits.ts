// As a safeguard, define limits in a separate file and import them in the schema and routes.
// This way, we can easily update the limits in one place.

export const MAX_PLACES_IN_FILE = 10000;