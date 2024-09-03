<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useSlotStore, ImageTypes } from '@/stores/index'
import type { SlotImage } from '@/stores/index'
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

// Import button images
import makeRound from '@/assets/make_round.png'
import makeRoundPress from '@/assets/make_round_press.png'

const slotStore = useSlotStore()
const userPrompt = ref('')
const isFetching = ref(false) // Track API call state
const selectedMode = ref('Free form') // Track selected mode (default to "Free form")
const isPressed = ref(false)
let abortController: AbortController | null = null

const initialImages = [
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
] as SlotImage[]

onMounted(() => {
  slotStore.initializeImages(initialImages)
})

const generateNewImages = async () => {
  if (selectedMode.value === 'Free form' && userPrompt.value.trim() === '') {
    alert('You have selected "Free form", you must enter a prompt.')
    return
  }

  abortController = new AbortController()
  const { signal } = abortController
  isFetching.value = true // Set fetching state to true

  try {
    for (const image of slotStore.images) {
      const response = await fetchDummyApi(userPrompt.value, image.type, signal)
      slotStore.updateImage(image.type, response.newSrc, image.label)
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        console.log('API call was cancelled')
      } else {
        console.error('An error occurred:', err.message)
      }
    } else {
      console.error('An unexpected error occurred:', err)
    }
  } finally {
    isFetching.value = false // Reset fetching state when done
  }
}

const cancelRequest = () => {
  console.log('Cancel button clicked')
  if (abortController) {
    console.log('Aborting ongoing requests')
    abortController.abort() // Abort ongoing requests
    abortController = null // Reset the controller
  }
  console.log('Resetting images to initial state')
  slotStore.initializeImages(initialImages) // Reset to initial images
  isFetching.value = false // Reset fetching state
}

const handleButtonClick = () => {
  if (!isFetching.value) {
    generateNewImages()
  }
}

const fetchDummyApi = async (prompt: string, type: ImageTypes, signal: AbortSignal) => {
  return new Promise<{ newSrc: string }>((resolve, reject) => {
    setTimeout(() => {
      if (signal.aborted) {
        return reject(new DOMException('Aborted', 'AbortError'))
      }
      resolve({ newSrc: 'data:image/jpeg;base64,newImageSrc' })
    }, 1000)
  })
}

const selectMode = (mode: string) => {
  selectedMode.value = mode
}

// Watch the userPrompt to automatically select "Free form" mode
watch(userPrompt, (newValue) => {
  if (newValue.trim() !== '' && selectedMode.value !== 'Free form') {
    selectMode('Free form')
  }
})
</script>

<template>
  <div class="slot-machine">
    <img src="@/assets/osnove.jpg" alt="Background" class="background" />

    <!-- Loader Overlay -->
    <div v-if="isFetching" class="loader-overlay">
      <div class="loader"></div>
      <p>Please wait, generating images!</p>
    </div>

    <div class="additional-buttons">
      <button
        class="big-button"
        :disabled="isFetching"
        @mousedown="isPressed = true"
        @mouseup="isPressed = false"
        @click="handleButtonClick"
      ></button>
      <button
        @click="selectMode('Cyberpunk')"
        :class="['small-button', selectedMode === 'Cyberpunk' ? 'selected' : '']"
      >
        Cyberpunk
      </button>
      <button
        @click="selectMode('Free form')"
        :class="['small-button', selectedMode === 'Free form' ? 'selected' : '']"
      >
        Free form
      </button>
    </div>

    <div class="reel-container">
      <SlotReel
        v-for="(image, index) in slotStore.images"
        :key="index"
        :image="image"
        :id="`reel-${index + 1}`"
      />
    </div>
    <input v-model="userPrompt" class="prompt-input" type="text" placeholder="Enter prompt here" />
    <button :disabled="isFetching" @click="handleButtonClick" class="generate-btn"></button>
    <button v-if="isFetching" @click="cancelRequest" class="cancel-btn">Cancel</button>
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

.additional-buttons {
  position: absolute;
  top: 288px;
  left: 235px;
}

.big-button {
  width: 163px;
  height: 163px;
  background-size: contain;
  border: none;
  cursor: pointer;
  margin-bottom: 20px;
  background: url('@/assets/make_round.png') no-repeat center center;
}

.big-button:active {
  background: url('@/assets/make_round_press.png') no-repeat center center;
  background-size: contain;
}

.big-button:disabled,
.generate-btn:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

.prompt-input {
  position: absolute;
  top: 776px;
  left: 515px;
  width: 600px;
  height: 30px;
  background-color: #120604;
  color: rgb(253 253 253);
  padding-left: 10px;
  font-size: 17px;
  &::placeholder {
    color: rgba(0, 0, 0, 0.5); /* Placeholder color */
    opacity: 1; /* Ensures the placeholder is fully opaque */
  }
}

.cancel-btn {
  position: absolute;
  top: 766px;
  width: 180px;
  height: 54px;
  background-size: cover;
  border-radius: 10px;
  font-size: 20px;
  text-shadow:
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000;
  left: 1400px;
  background: #c33131;
  color: #ffffff;
  text-align: center;
  line-height: 54px;
  font-weight: bold;
  cursor: pointer;
  border: 1px solid #464545;
  z-index: 11;
}

.generate-btn {
  position: absolute;
  top: 766px;
  width: 222px;
  height: 54px;
  background-size: cover;
  left: 1157px;
  background: url('@/assets/make.png') no-repeat center center;
}

.generate-btn::before,
.cancel-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0); /* Start with no color */
  transition: background-color 0.3s ease;
}

.generate-btn:hover::before,
.cancel-btn:hover::before {
  background-color: rgba(0, 0, 0, 0.1);
}

.generate-btn:active::before,
.cancel-btn:active::before {
  background-color: rgba(0, 0, 0, 0.3);
}

.small-button {
  position: absolute; /* Allow positioning with top and left */
  width: 140px;
  height: 45px;
  background-color: #3d1603; /* Default button color */
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  text-align: center;
  line-height: 45px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2); /* 3D effect for unselected button */
  transition:
    background-color 0.3s ease,
    box-shadow 0.3s ease;
}

.small-button:nth-child(2) {
  top: 245px; /* Position relative to the big button */
  left: 10px; /* Adjust left position as needed */
}

.small-button:nth-child(3) {
  top: 300px; /* Position relative to the big button */
  left: 10px; /* Adjust left position as needed */
}

.small-button.selected {
  background-color: #4f2d1b; /* Lighter shade when selected */
  box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.4); /* Pressed 3D effect for selected button */
}

/* Loader Styles */
.loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent overlay */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10; /* Ensure the loader is on top */
}

.loader {
  border: 8px solid #f3f3f3; /* Light grey */
  border-top: 8px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loader-overlay p {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
}
</style>
