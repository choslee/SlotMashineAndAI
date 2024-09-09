<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useSlotStore, ImageTypes, starterImages } from '@/stores/index'
import type { SlotImage } from '@/stores/index'
import SlotReel from '@/components/SlotReel.vue'
import WarningModal from '@/components/WarningModal.vue'

import makeRound from '@/assets/make_round.png'
import makeRoundPress from '@/assets/make_round_press.png'

const slotStore = useSlotStore()
const userPrompt = ref('')
const isFetching = ref(false) // Track API call state
const selectedMode = ref('Free form')
const isPressed = ref(false)
const showModal = ref(false) // Track modal visibility
const modalMessage = ref('') // Message for the modal
let abortRequestController: AbortController | null = null

// Base URL for the API
const BASE_URL = 'http://fooocus-api.mixashin.com:60808'

// Mapping image types to filenames and special texts prompt
const imageTypeMap = {
  [ImageTypes.A]: { filename: 'A.jpg', specialText: 'letter A' },
  [ImageTypes.K]: { filename: 'K.jpg', specialText: 'letter K' },
  [ImageTypes.Q]: { filename: 'Q.jpg', specialText: 'letter Q' },
  [ImageTypes.J]: { filename: 'J.jpg', specialText: 'letter J' },
  [ImageTypes.N9]: { filename: '9.jpg', specialText: 'number 9' },
  [ImageTypes.N10]: { filename: '10.jpg', specialText: 'number 10' },
  [ImageTypes.Gun]: { filename: 'gun.jpg', specialText: 'water gun' },
  [ImageTypes.Hat]: { filename: 'hat.jpg', specialText: 'top hat' },
  [ImageTypes.Dog]: { filename: 'dog.jpg', specialText: 'small dog' },
  [ImageTypes.Face]: { filename: 'face.jpg', specialText: 'pretty face' }
}

onMounted(() => {
  slotStore.initializeImages(starterImages)
})

// Watch the userPrompt to automatically select "Free form" mode
watch(userPrompt, (newValue) => {
  if (newValue.trim() !== '' && selectedMode.value !== 'Free form') {
    setSelectMode('Free form')
  }
})

function setSelectMode(mode: string) {
  selectedMode.value = mode
}

async function generateImageForSlot(image: SlotImage, prompt: string, signal: AbortSignal) {
  const specialText = imageTypeMap[image.type]?.specialText || ''
  const finalPrompt = `${prompt}, ${specialText}, frame outer edge, background`
  const filenamePlaceholder = imageTypeMap[image.type]?.filename || `${image.type}.jpg`

  const body = JSON.stringify({
    prompt: finalPrompt,
    negative_prompt: '',
    style_selections: [],
    performance_selection: 'Speed',
    aspect_ratios_selection: '1024*1024',
    image_seed: -1,
    guidance_scale: 16.33,
    base_model_name: 'juggernautXL_juggernautX.safetensors',
    image_prompts: [
      {
        cn_img: `http://mixashin.com/aislot/${filenamePlaceholder}`,
        cn_stop: 0.5,
        cn_weight: 1,
        cn_type: 'PyraCanny'
      },
      {
        cn_img: 'http://mixashin.com/aislot/frame.jpg',
        cn_stop: 0.4,
        cn_weight: 1,
        cn_type: 'PyraCanny'
      }
    ]
  })

  const response = await fetch(`${BASE_URL}/v2/generation/image-prompt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body,
    signal
  })

  if (!response.ok) {
    modalMessage.value = 'Failed to generate image. Please try again.'
    showModal.value = true
    throw new Error('Failed to generate image')
  }

  const responseData = await response.json()

  // Parse the image URL from the response and replace the base URL
  let imageUrl = responseData[0].url
  if (imageUrl.startsWith('http://')) {
    imageUrl = imageUrl.replace('http://10.0.0.10:8888', BASE_URL)
  } else {
    imageUrl = `${BASE_URL}${imageUrl}`
  }
  return imageUrl
}

async function onGenerateNewImagesHandler() {
  abortRequestController = new AbortController()
  const { signal } = abortRequestController

  if (selectedMode.value === 'Free form' && userPrompt.value.trim() === '') {
    modalMessage.value =
      'You selected "Free form", but the input field is empty. Please provide a prompt.'
    showModal.value = true
    return
  }

  isFetching.value = true

  try {
    const uniqueImagesByType = Array.from(
      new Map(slotStore.images.map((img) => [img.type, img])).values()
    )

    for (const image of uniqueImagesByType) {
      let userPromptInput = userPrompt.value
      if (selectedMode.value === 'Cyberpunk') {
        userPromptInput = 'Cyberpunk'
      }

      // Generate a new image for the current slot type
      const newImageUrl = await generateImageForSlot(image, userPromptInput, signal)

      // Update all slots with the same type
      slotStore.updateImageByType(image.type, newImageUrl, image.label)
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.log('API call was cancelled')
    } else {
      console.error('An error occurred:', err)
      modalMessage.value = 'Something went wrong. Please try again.'
      showModal.value = true
    }
  } finally {
    isFetching.value = false
  }
}

async function onCancelRequestHandler() {
  console.log('Cancel button clicked')

  if (abortRequestController) {
    console.log('Aborting ongoing requests')
    abortRequestController.abort()
    abortRequestController = null
  }
  try {
    const stopResponse = await fetch(`${BASE_URL}/v1/generation/stop`, {
      method: 'POST'
    })
    console.log('Stop API response:', stopResponse)

    if (!stopResponse.ok) {
      modalMessage.value = 'Failed to stop the image generation process. Please try again.'
      showModal.value = true
      throw new Error('Failed to stop the image generation process')
    }

    console.log('Image generation successfully stopped')
  } catch (err) {
    modalMessage.value = 'Error while stopping the image generation process. Please try again.'
    showModal.value = true
    console.error('Error while stopping the image generation process:', err)
  }

  // Check if all images have a non-empty src value
  const allImagesHaveSrc = slotStore.images.every(
    (image) => image.src.trim() !== 'data:image/jpeg;base64,newImageSrc'
  )

  if (allImagesHaveSrc) {
    console.log('Restoring previous images from store')
    slotStore.restorePreviousImages() // Assuming you have a method to restore previous images
  } else {
    console.log('Resetting images to initial state')
    slotStore.initializeImages(starterImages)
  }

  isFetching.value = false
}
</script>

<template>
  <div class="slot-machine">
    <img src="@/assets/osnove.jpg" alt="Background" class="background" />

    <!-- Loader Overlay -->
    <div v-if="isFetching" class="loader-overlay">
      <div class="loader"></div>
      <p>Please wait, generating images!</p>
    </div>

    <WarningModal :isVisible="showModal" :message="modalMessage" @close="showModal = false" />

    <div class="additional-buttons">
      <button
        class="big-button"
        :disabled="isFetching"
        @mousedown="isPressed = true"
        @mouseup="isPressed = false"
        @click="onGenerateNewImagesHandler"
      ></button>
      <button
        @click="setSelectMode('Cyberpunk')"
        :class="['small-button', selectedMode === 'Cyberpunk' ? 'selected' : '']"
      >
        Cyberpunk
      </button>
      <button
        @click="setSelectMode('Free form')"
        :class="['small-button', selectedMode === 'Free form' ? 'selected' : '']"
      >
        Free form
      </button>
    </div>

    <div class="reel-container">
      <SlotReel
        v-for="(image, index) in slotStore.images"
        :key="index"
        :id="`reel-${index}`"
        :image="image"
      />
    </div>
    <input v-model="userPrompt" class="prompt-input" type="text" placeholder="Enter prompt here" />
    <button
      :disabled="isFetching"
      @click="onGenerateNewImagesHandler"
      class="generate-btn"
    ></button>
    <button v-if="isFetching" @click="onCancelRequestHandler" class="cancel-btn">Cancel</button>
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
    color: rgba(255, 255, 255, 0.5);
    opacity: 1;
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
  background-color: rgba(0, 0, 0, 0);
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
  position: absolute;
  width: 140px;
  height: 45px;
  background-color: #3d1603;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  text-align: center;
  line-height: 45px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  transition:
    background-color 0.3s ease,
    box-shadow 0.3s ease;
}

.small-button:nth-child(2) {
  top: 245px;
  left: 10px;
}

.small-button:nth-child(3) {
  top: 300px;
  left: 10px;
}

.small-button.selected {
  background-color: #4f2d1b;
  box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.4);
}

.loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loader {
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
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
