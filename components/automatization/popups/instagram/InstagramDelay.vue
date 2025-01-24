<template>
    <div class="instagram-delay">
        <trigger-item
            :key="`delay-${proxyValue}`"
            icon="delay"
            :name="`Ждать ${proxyValue} секунд`"
            @delete="$emit('delete')"
            @click="isEditDelay = !isEditDelay"
        />
        <div
            v-if="isEditDelay"
            v-click-outside="() => isEditDelay = false"
            class="instagram-delay__settings"
        >
            <div class="title">
                Укажите время задержки в секундах
            </div>
            <div class="subtitle">
                Минимальная задержка - 1 секунда <br>
                Максимальная задержка - 1800 секунд (30 минут)
            </div>
            <input-custom
                v-model.number="proxyValue"
                type="number"
                :min="1"
                :max="1800"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['input', 'change', 'update:modelValue', 'delete'])

const props = defineProps({
  modelValue: { type: Number, default: 30 }
})

const proxyValue = computed({
  get: () => Number(props.modelValue),
  set: (newValue: number) => {
    emit('update:modelValue', Number(newValue))
  }
})

const isEditDelay = ref<boolean>(false)
</script>

<style scoped lang="scss">
.instagram-delay{
    position: relative;
    &__settings{
        background-color: var(--bg-color-three);
        border-radius: 5px;
        box-shadow: 0px 0px 8px 0px rgba(43, 41, 41, 0.25);
        z-index: 10;
        position: absolute;
        padding: 10px;
        left: 0;
        width: 100%;
        .title{
            margin-bottom: 5px;
        }
        .subtitle{
            margin-bottom: 15px;
            font-size: var(--font-size-xs);
            color: colorOpacity(--gray-color-two, 0.7);
        }
        ::v-deep .input-custom{
            width: 100%;
            .input-content{
                width: 100%;
            }
        }
    }
}
</style>
