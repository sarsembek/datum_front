<template>
    <div class="swiper-custom">
        <div
            class="swiper-custom__track"
            :style="trackStyle"
        />
        <div
            v-for="option in options"
            :key="option"
            class="swiper-custom__option"
            :class="{ active: isActive(option) }"
            @click="selectOption(option)"
        >
            {{ option }}
        </div>
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  options: {
    type: Array as () => string[],
    default: () => ['Option 1', 'Option 2', 'Option 3']
  },
  modelValue: { type: String, required: true }
})

const proxyValue = computed({
  get: () => String(props.modelValue),
  set: (newValue: string) => { emit('update:modelValue', String(newValue)) }
})

// Функция для выбора опции
const selectOption = (option: string) => {
  proxyValue.value = option
}

// // Проверка, является ли опция активной
const isActive = (option: string) => {
  return proxyValue.value === option
}

// Определение стиля для фона
const trackStyle = computed(() => {
  const index = props.options.indexOf(proxyValue.value)
  const width = 100 / props.options.length
  return {
    width: `${width}%`,
    transform: `translateX(${index * 100}%)`
  }
})
</script>

<style scoped lang="scss">
.swiper-custom {
    display: flex;
    align-items: center;
    position: relative;
    display: flex;
    width: 100%;
    height: 30px;
    background-color: colorOpacity(--bg-color-reverse, 1);
    box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    overflow: hidden;
    cursor: pointer;
    overflow: hidden;

    &__track {
        position: absolute;
        top: 0;
        left: 0;
        width: 50%;
        height: 100%;
        background-color: var(--additional-box-blue);
        border-radius: 4px;
        transition: transform 0.3s ease;
    }

    &__option {
        z-index: 1;
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: 500;
        color: var(--text-color-reverse);
        transition: color 0.3s ease;
        height: 100%;
        &.active {
            color: var(--text-color);
        }
  }
}
</style>
