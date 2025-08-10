import { createAuthClient } from 'better-auth/vue'
import { } from 'better-auth/client/plugins'

import { VITE_APP_API_URL } from '@/helper/constants.ts'

const auth = createAuthClient({
  // The base URL of the server
  baseURL: `${VITE_APP_API_URL}/auth`,

  // By default, the users are automatically signed in after they successfully sign up.
  // We have to set this to false to avoid the automatic sign in after sign up.
  // Thus, user will have to be redirected to the sign in page after sign up.
  autoSignIn: true,

  plugins: [
  ]
})

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;


export const {
  // Account Management
  signIn, signUp,
  useSession, getSession, listSessions,
  // Verification
  verifyEmail, sendVerificationEmail,
  // Password Reset
  forgetPassword, resetPassword,
  // Signout
  signOut, revokeOtherSessions, changePassword,
} = auth