import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useSession } from '@/helper/auth.ts'
import type { Session, User } from '@/helper/auth.ts'

import type { Ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // Reactive session state from better-auth
  const session = useSession()

  // Derived user info (null if not logged in)
  const user: Ref<User | null> = computed(() => session.value?.data?.user || null)
  const sessionDetails: Ref<Session | null> = computed(() => session.value?.data?.session || null)

  return {
    session, // Pinia state: session (reactive)
    user,  // Pinia getter: user info
    sessionDetails, // Pinia getter: session details
  }
})