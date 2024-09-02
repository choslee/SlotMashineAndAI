import { defineStore } from 'pinia'

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
    initializeImages(initialImages: SlotImage[]) {
      this.images = initialImages
    }
  }
})
