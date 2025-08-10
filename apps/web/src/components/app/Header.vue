<template>
  <QHeader>
    <QToolbar class="tw:bg-gradient-to-bl tw:from-slate-800 tw:to-slate-600">
      <QToolbarTitle class="row tw:items-center tw:ml-2">
        <QAvatar square class="tw:mr-2" @click="$router.push({ name: 'Home' })">
          <img src="/favicon.png" />
        </QAvatar>
        <span>Jain Atlas</span>
      </QToolbarTitle>
      <QBtnDropdown outline no-caps class="tw:max-w-40" v-if="userStore.user">
        <template v-slot:label>
          <span class="tw:truncate">
            {{ userStore.user?.name }}
          </span>
        </template>
        <QList>
          <QItem clickable v-close-popup :to="{ name: 'Login', query: { reason: 'Change Org' } }">
            <QItemSection>Change Org</QItemSection>
          </QItem>
        </QList>
      </QBtnDropdown>
    </QToolbar>
  </QHeader>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()



</script>
