import { betterAuth } from "better-auth";
import Database from "better-sqlite3";

export const auth = betterAuth({
  database: new Database("./db.sqlite"),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // Optionally, you can add prompt/accessType for refresh tokens:
      // prompt: "select_account+consent",
      // accessType: "offline",
    },
  },
  // Session management and other options can be added here if needed
});
