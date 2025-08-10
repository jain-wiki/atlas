<template>
  <QPage class="tw:p-2">
    <QBtn @click="$router.push({ name: 'GPlace' })" label="Google Maps Place" />
  </QPage>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const $router = useRouter()

</script>