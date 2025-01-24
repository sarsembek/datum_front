<template>
    <div class="checkbox checkbox_default">
        <input
            :id="id"
            :name="name"
            :checked="checked"
            type="checkbox"
            class="custom-checkbox"
            @click="handleClick($event)"
        >
        <label
            :for="id || name"
            class="checkbox__label"
        >
            <svg-icon
                v-if="checked"
                icon="checkmark"
                width="14"
                height="14"
                stroke="#0084ff"
                fill="#0084ff"
            />
            <slot>
                {{ text }}
            </slot>
        </label>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import '@css/controls/checkbox-custom.scss'

const props = defineProps({
  name: { type: String, default: null },
  id: { type: String, default: null },
  text: { type: String, default: null },
  checked: { type: Boolean, default: false },
  value: { type: Boolean, default: false },
  defaultType: { type: Boolean, default: false }
})

const emit = defineEmits(['input', 'click'])
const initialValue = ref<boolean>(props.checked)

watch(() => props.checked, (newVal) => {
  initialValue.value = newVal
})

watch(() => initialValue.value, (val, oldVal) => {
  if (val !== oldVal) {
    emit('input', val)
  }
})

onMounted(() => {
  initialValue.value = props.checked
})

const handleClick = (e: Event) => {
  initialValue.value = (e.target as HTMLInputElement).checked
  emit('click', e)
}
</script>
