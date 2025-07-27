import { betterAuth } from 'better-auth';
import { oneTap } from 'better-auth/plugins';
import Database from 'better-sqlite3';

export const auth = betterAuth({
  appName: 'Jain Atlas',
  database: new Database('./db.sqlite'),
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google']
    }
  },
  advanced: {
    cookiePrefix: 'atlas',
  },
  session: {
    // Ref: https://www.better-auth.com/docs/concepts/session-management#cookie-cache
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // Cache duration in seconds. i.e 5 minutes
    }
  },
  rateLimit: {
    // NOTE: since we did not specify the database, it will use the default in-memory store.
    enabled: true,
    window: 10, // time window in seconds
    max: 20, // max requests in the window
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8, // Minimum password length
    maxPasswordLength: 24, // Maximum password length
    revokeSessionsOnPasswordReset: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    oneTap(), // Add the One Tap server plugin
  ]
});


export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;