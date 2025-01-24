<template>
    <div class="slider-custom">
        <div class="slider-custom__icon">
            <svg-icon
                v-if="icon"
                :icon="icon"
                width="18"
                height="18"
            />
            <div
                v-if="iconName"
                class="icon-name"
            >
                {{ iconName }}
            </div>
        </div>
        <div class="slider-custom__content">
            <div class="slider-info">
                <div class="slider-info__name">
                    {{ name }}
                </div>
                <div class="slider-info__percent">
                    {{ proxyValue }}%
                </div>
            </div>
            <input-custom
                v-model="proxyValue"
                class="slider__range"
                type="range"
                :min="min"
                :max="max"
                @input="onInput($event)"
                @change="onChange()"
            />
        </div>
        <div
            v-if="canRemoved"
            class="slider-custom__remove"
            @click="$emit('delete')"
        >
            <svg-icon
                icon="trash"
                width="18"
                height="18"
                stroke="#FFF"
                fill="#FFF"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['input', 'change', 'update:modelValue', 'delete'])

const props = defineProps({
  modelValue: { type: Number, default: 50 },

  name: { type: String, default: null },
  icon: { type: String, default: null },
  iconName: { type: String, default: null },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  canRemoved: { type: Boolean, default: false }
})

const proxyValue = computed({
  get: () => Number(props.modelValue),
  set: (newValue: number) => {
    emit('update:modelValue', Number(newValue))
    emit('input', Number(newValue))
  }
})

const onChange = () => {
  emit('change', proxyValue.value)
}

const onInput = (value: string | number) => {
  const newValue = Number(value)
  proxyValue.value = newValue
  emit('input', newValue)
  emit('update:modelValue', newValue)
}

</script>

<style scoped lang="scss">
.slider-custom{
    position: relative;
    display: flex;
    align-items: center;
    gap: 15px;
    &__icon{
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 40px;
        min-width: 40px;
        width: 32px;
        height: 32px;
        border: 1px solid colorOpacity(--border-color-hover, 0.3);
        border-radius: 100%;
        background-color: colorOpacity(--border-color-hover, 0.2);
        box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.2);
        .icon-name{
            user-select: none;
            margin-bottom: 2px;
        }
    }
    &__content{
        width: 100%;
        .slider-info{
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: var(--font-size-xs);
            user-select: none;
        }
        ::v-deep .input-custom{
            width: 100%;
            .input-content{
                width: 100%;
            }
        }
    }
    &__remove{
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 32px;
        min-width: 32px;
        width: 32px;
        height: 32px;
        border: 1px solid colorOpacity(--error-color-light, 0.3);
        border-radius: 5px;
        background-color: colorOpacity(--error-color-light, 0.2);
        box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease-in;
        &:hover{
            scale: 1.05;
        }
    }
}
</style>
