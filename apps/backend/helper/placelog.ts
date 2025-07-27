import db from "../lib/db";

export async function logPlaceAction(
  placeId: string,
  action: "I" | "U" | "D",
  oldData: any,
  newData: any,
  userEmail: string
) {
  await db("places_log").insert({
    place_id: placeId,
    action,
    old_data: JSON.stringify(oldData),
    new_data: JSON.stringify(newData),
    user_email: userEmail,
  });
}
