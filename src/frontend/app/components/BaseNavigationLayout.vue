<template>
  <div class="w-full py-[18px] px-8" :class="componentName">
    <div class="flex h-[36px] flex-row items-center">
      <slot name="left" />
      <slot name="center" />
      <slot name="right" />
    </div>
    <slot name="bottom" />
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export const componentName = 'BaseNavigationLayout'

export default defineComponent({
  name: componentName,
  setup: () => ({ componentName }),
})
</script>

<style scoped></style>
