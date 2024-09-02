<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSlotStore, ImageTypes } from '@/stores/index'
import SlotReel from '@/components/SlotReel.vue'

// Import the slot images
import imgA from '@/assets/A.jpg'
import img9 from '@/assets/9.jpg'
import img10 from '@/assets/10.jpg'
import imgJ from '@/assets/J.jpg'
import imgFace from '@/assets/face.jpg'
import imgGun from '@/assets/gun.jpg'
import imgHat from '@/assets/hat.jpg'
import imgK from '@/assets/K.jpg'
import imgQ from '@/assets/Q.jpg'
import imgDog from '@/assets/dog.jpg'

const slotStore = useSlotStore()
const userPrompt = ref('')

onMounted(() => {
  slotStore.initializeImages([
    { type: ImageTypes.A, src: imgA },
    { type: ImageTypes.N9, src: img9 },
    { type: ImageTypes.N10, src: img10 },
    { type: ImageTypes.J, src: imgJ },
    { type: ImageTypes.Face, src: imgFace },
    { type: ImageTypes.Gun, src: imgGun, label: 'bonus' },
    { type: ImageTypes.Hat, src: imgHat, label: 'scatter' },
    { type: ImageTypes.J, src: imgJ },
    { type: ImageTypes.K, src: imgK },
    { type: ImageTypes.Q, src: imgQ },
    { type: ImageTypes.A, src: imgA },
    { type: ImageTypes.K, src: imgK },
    { type: ImageTypes.N9, src: img9 },
    { type: ImageTypes.Dog, src: imgDog, label: 'wild' },
    { type: ImageTypes.Q, src: imgQ }
  ])
})

const generateNewImages = async () => {
  for (const image of slotStore.images) {
    // Dummy API call placeholder
    const response = await fetchDummyApi(userPrompt.value, image.type)
    slotStore.updateImage(image.type, response.newSrc, image.label)
  }
}

// Dummy API call function
const fetchDummyApi = async (prompt: string, type: ImageTypes) => {
  return new Promise<{ newSrc: string }>((resolve) => {
    setTimeout(() => {
      resolve({ newSrc: 'data:image/jpeg;base64,newImageSrc' })
    }, 1000)
  })
}
</script>

<template>
  <div class="slot-machine">
    <img src="@/assets/osnove.jpg" alt="Background" class="background" />
    <div class="reel-container">
      <SlotReel
        v-for="(image, index) in slotStore.images"
        :key="index"
        :image="image"
        :id="`reel-${index + 1}`"
      />
    </div>
    <input v-model="userPrompt" class="prompt-input" type="text" placeholder="Enter prompt here" />
    <button @click="generateNewImages" class="generate-btn"></button>
  </div>
</template>

<style scoped lang="scss">
.slot-machine {
  position: relative;
  width: 1600px;
  height: 913px;
}

.background {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reel-container {
  position: absolute;
  top: 156px;
  left: 435px;
  width: 1000px;
  height: 600px;
  display: flex;
  flex-wrap: wrap;
}

.prompt-input {
  position: absolute;
  top: 776px;
  left: 515px;
  width: 600px;
  height: 30px;
  background-color: transparent;
  color: rgb(0, 0, 0);
  padding-left: 10px;
  &::placeholder {
    color: rgba(0, 0, 0, 0.5); /* Placeholder color */
    opacity: 1; /* Ensures the placeholder is fully opaque */
  }
}

.generate-btn {
  position: absolute;
  top: 766px;
  left: 1157px;
  width: 222px;
  height: 54px;
  background: url('@/assets/make.png') no-repeat center center;
  background-size: cover;
}

.generate-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0); /* Start with no color */
  transition: background-color 0.3s ease;
}

.generate-btn:hover::before {
  background-color: rgba(0, 0, 0, 0.1);
}

.generate-btn:active::before {
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
