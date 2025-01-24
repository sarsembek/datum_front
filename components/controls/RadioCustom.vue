<template>
    <label
        v-for="option in options"
        :key="`option-${option.type}`"
        :class="['custom-radio', { 'custom-radio--checked': option.type === internalValue }]"
    >
        <input
            v-model="internalValue"
            type="radio"
            :value="option.type"
            :name="name"
        >
        <span class="custom-radio__circle" />
        <slot>
            {{ option.name }}
        </slot>
    </label>
</template>

<script setup lang="ts">

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  options: {
    type: Array as () => Array<{ type: string; name: string; [key: string]: any }>,
    required: true
  },
  name: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

// Внутренний метод для обновления значения
const internalValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})
</script>

  <style scoped lang="scss">
  .custom-radio {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    &--checked{
        .custom-radio__circle{
            border: 2px solid var(--link);
        }
    }
  }

  .custom-radio input {
    display: none;
  }

  .custom-radio__circle {
    width: 20px;
    height: 20px;
    border: 2px solid var(--gray-color);
    border-radius: 50%;
    display: inline-block;
    position: relative;
    margin-right: 8px;
  }

  .custom-radio--checked .custom-radio__circle::before {
    content: '';
    width: 10px;
    height: 10px;
    background-color: var(--link);
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  </style>
