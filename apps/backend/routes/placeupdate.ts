import { Hono } from "hono";
import db from "../lib/db";

export const placeUpdateRoutes = new Hono();

// GET /api/place/:id - View One Place
placeUpdateRoutes.get(":id", async (c) => {
  const { id } = c.req.param();
  const place = await db("places").where({ id }).first();
  if (!place) {
    return c.json({ error: "Place not found" }, 404);
  }
  return c.json({ data: place });
});

// GET /api/place/list - List Places with filters and pagination
placeUpdateRoutes.get("/list", async (c) => {
  const { name, type, id, limit = 20, offset = 0 } = c.req.query();
  let query = db("places");

  if (name) {
    query = query.where(function () {
      this.where("name", "like", `%${name}%`).orWhere(
        "additional_names",
        "like",
        `%${name}%`
      );
    });
  }
  if (type) {
    query = query.where("type_of_place", type);
  }
  if (id) {
    query = query.where("id", "like", `${id}%`);
  }

  const results = await query.limit(Number(limit)).offset(Number(offset));
  return c.json({ data: results });
});

// GET /api/place/:id - View One Place
placeUpdateRoutes.get(":id", async (c) => {
  const { id } = c.req.param();
  const place = await db("places").where({ id }).first();
  if (!place) {
    return c.json({ error: "Place not found" }, 404);
  }
  return c.json({ data: place });
});
