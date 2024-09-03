<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal">
      <h2>WARNING!</h2>
      <p>{{ message }}</p>
      <button @click="closeModal">OK</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  isVisible: Boolean,
  message: String
})

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
h2 {
  color: #ff0000;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal {
  background-color: #000000;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  color: #fff;
  max-width: 400px;
  width: 100%;
}

.modal h2 {
  margin: 0 0 20px 0;
  font-size: 24px;
  font-weight: bold;
}

.modal p {
  font-size: 18px;
  margin: 0 0 20px 0;
}

.modal button {
  background-color: #ff0000;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.modal button:hover {
  background-color: #ff5555;
}
</style>
