<template>
  <QFooter class="noprint tw:text-gray-600! tw:px-4 tw:py-2 tw:bg-transparent!">
    v{{ appVersion }}
    <span class="tw:ml-2">© jain.wiki</span>
  </QFooter>
</template>

<script setup lang="ts">
import pkg from '../../../package.json' with { type: 'json' }
const appVersion = pkg.version
</script>
