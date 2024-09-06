import { defineStore } from 'pinia'

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

export enum ImageTypes {
  A = 'A',
  K = 'K',
  Q = 'Q',
  J = 'J',
  N9 = '9',
  N10 = '10',
  Gun = 'gun',
  Hat = 'hat',
  Dog = 'dog',
  Face = 'face'
}

export const starterImages = [
  { id: 1, type: ImageTypes.A, src: imgA },
  { id: 2, type: ImageTypes.N9, src: img9 },
  { id: 3, type: ImageTypes.N10, src: img10 },
  { id: 4, type: ImageTypes.J, src: imgJ },
  { id: 5, type: ImageTypes.Face, src: imgFace },
  { id: 6, type: ImageTypes.Gun, src: imgGun, label: 'bonus' },
  { id: 7, type: ImageTypes.Hat, src: imgHat, label: 'scatter' },
  { id: 8, type: ImageTypes.J, src: imgJ },
  { id: 9, type: ImageTypes.K, src: imgK },
  { id: 10, type: ImageTypes.Q, src: imgQ },
  { id: 11, type: ImageTypes.A, src: imgA },
  { id: 12, type: ImageTypes.K, src: imgK },
  { id: 13, type: ImageTypes.N9, src: img9 },
  { id: 14, type: ImageTypes.Dog, src: imgDog, label: 'wild' },
  { id: 15, type: ImageTypes.Q, src: imgQ }
] as SlotImage[]

export interface SlotImage {
  id: number
  type: ImageTypes
  src: string
  label?: 'bonus' | 'scatter' | 'wild'
}

export const useSlotStore = defineStore('slot', {
  state: () => ({
    images: [] as SlotImage[], // Store for images
    previousImages: [] as SlotImage[] // Store for previous images
  }),
  actions: {
    updateImage(id: number, newSrc: string, label?: 'bonus' | 'scatter' | 'wild') {
      const index = this.images.findIndex((img) => img.id === id)
      if (index !== -1) {
        this.images[index] = { ...this.images[index], src: newSrc, label }
      }
    },
    initializeImages(images: SlotImage[]) {
      this.images = [...images]
    },
    restorePreviousImages() {
      if (this.previousImages.length > 0) {
        this.images = [...this.previousImages] // Restore previous images
      }
    }
  }
})
