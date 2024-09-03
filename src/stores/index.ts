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

export interface SlotImage {
  type: ImageTypes
  src: string
  label?: 'bonus' | 'scatter' | 'wild'
}

export const useSlotStore = defineStore('slot', {
  state: () => ({
    images: [] as SlotImage[]
  }),
  actions: {
    updateImage(type: ImageTypes, newSrc: string, label?: 'bonus' | 'scatter' | 'wild') {
      const index = this.images.findIndex((img) => img.type === type)
      if (index !== -1) {
        this.images[index] = { type, src: newSrc, label }
      }
    },
    initializeImages(images: SlotImage[]) {
      this.images = [...images]
    }
  }
})
