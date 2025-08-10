<template>
  <QLayout view="hhh lpR fff">
    <HeaderApp />
    <QPageContainer>
      <!-- <ReloadPwa /> -->
      <RouterView v-slot="{ Component }">
        <component :is="Component" />
      </RouterView>
    </QPageContainer>
    <Footer />
  </QLayout>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import HeaderApp from '@/components/app/Header.vue'
import Footer from '@/components/app/Footer.vue'

</script>