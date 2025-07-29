import { db } from "../lib/db";

export async function logPlaceAction(
  placeId: string,
  action: "I" | "U" | "D",
  oldData: any,
  newData: any,
  userEmail: string
) {
  const query = db.query(`
    INSERT INTO places_log (place_id, action, old_data, new_data, user_email)
    VALUES ($place_id, $action, $old_data, $new_data, $user_email)
  `);

  query.run({
    $place_id: placeId,
    $action: action,
    $old_data: JSON.stringify(oldData),
    $new_data: JSON.stringify(newData),
    $user_email: userEmail,
  });
}
