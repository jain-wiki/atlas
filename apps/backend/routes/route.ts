import { Hono } from "hono";
import { authRoutes } from "./auth";
import { placeViewRoutes } from "./placeview";
import { placeUpdateRoutes } from "./placeupdate";

export const apiRoutes = new Hono();

apiRoutes.route("/auth", authRoutes);
apiRoutes.route("/place", placeUpdateRoutes);
apiRoutes.route("/p", placeViewRoutes);
