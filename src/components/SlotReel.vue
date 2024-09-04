<script setup lang="ts">
import { defineProps } from 'vue'
import type { SlotImage } from '@/stores/index' // Type-only import
import bonusLabel from '@/assets/bonus.png'
import scatterLabel from '@/assets/scatter.png'
import wildLabel from '@/assets/wild.png'

const props = defineProps<{
  id: string
  image: SlotImage
}>()

// Map label to corresponding image file and dimensions
const labelImageMap: Record<string, { src: string; width: string; height: string }> = {
  bonus: { src: bonusLabel, width: '163px', height: '46px' },
  scatter: { src: scatterLabel, width: '171px', height: '45px' },
  wild: { src: wildLabel, width: '174px', height: '64px' }
}
</script>

<template>
  <div class="slot-reel" :id="id">
    <img :src="image.src" :alt="image.type" class="reel-image" />
    <img
      v-if="image.label"
      :src="labelImageMap[image.label].src"
      :style="{
        width: labelImageMap[image.label].width,
        height: labelImageMap[image.label].height
      }"
      class="label"
    />
  </div>
</template>

<style scoped lang="scss">
.slot-reel {
  width: 200px;
  height: 200px;
  position: relative;
}

.reel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.label {
  position: absolute;
  top: 135px;
  right: 10px;
  object-fit: contain;
}
</style>
