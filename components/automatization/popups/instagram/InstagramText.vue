<template>
    <div class="instagram-text">
        <div class="instagram-text__textarea-wrapper">
            <textarea
                ref="textareaElement"
                v-model="proxyText"
                :maxlength="maxTextSize"
                placeholder="Введите текст"
                @input="autoTextareaHeight()"
                @click="autoTextareaHeight()"
            />
            <div
                class="count-of"
                :class="{ 'count-of_is-over': isMaxTextSize }"
            >
                {{ proxyText.length }} / {{ maxTextSize }}
            </div>
        </div>
        <div
            v-for="(button, buttonIndex) in proxyButtons"
            :key="`button-${buttonIndex}`"
            class="instagram-text__button-item"
            :class="{'last-button': buttonIndex === 2}"
        >
            <button-custom
                :value="button.name"
                @click="popupOpenIndex = buttonIndex"
            />
            <instagram-button-popup
                v-if="popupOpenIndex === buttonIndex"
                v-model:button="proxyButtons[buttonIndex]"
                v-click-outside="() => popupOpenIndex = -1"
                :button-index="buttonIndex"
                :insta-index="instaIndex"
            />
            <div
                class="remove"
                @click.stop="emit('removeButton', buttonIndex)"
            >
                <svg-icon
                    icon="trash"
                    width="16"
                    height="16"
                    stroke="#FFF"
                    fill="#FFF"
                />
            </div>
        </div>
        <div
            v-if="proxyButtons.length < 3"
            class="instagram-text__add-button"
            @click="emit('addButton')"
        >
            + Добавить кнопку
        </div>
    </div>
</template>

<script setup lang="ts">
import type { textButtonInterface } from '@/types/automatization'

const emit = defineEmits(['update:text', 'update:buttons', 'delete', 'addButton', 'removeButton', 'changeText'])

const props = defineProps({
  text: { type: String, default: '' },
  buttons: { type: Array<textButtonInterface>, default: [] },
  instaIndex: { type: Number, required: true }
})

const proxyText = computed({
  get: () => props.text,
  set: (newValue: string) => {
    emit('update:text', newValue)
    emit('changeText', { index: props.instaIndex, buttons: proxyButtons.value, text: newValue })
  }
})

const popupOpenIndex = ref<number>(-1)

const proxyButtons = computed({
  get: () => props.buttons,
  set: (newValue: textButtonInterface[]) => {
    emit('update:buttons', newValue)
    emit('changeText', { index: props.instaIndex, buttons: newValue, text: proxyText.value })
  }
})

const textareaElement = ref<HTMLTextAreaElement | null>(null)
const isMaxTextSize = ref<boolean>(false)
const maxTextSize = ref<number>(640)

const autoTextareaHeight = () => {
  if (textareaElement.value) {
    isMaxTextSize.value = false
    textareaElement.value.style.height = 'auto'
    textareaElement.value.style.height = `${textareaElement.value.scrollHeight + 20}px`
    if (proxyText.value.length >= maxTextSize.value) {
      isMaxTextSize.value = true
    }
  }
}

onMounted(() => {
  autoTextareaHeight()
})

</script>

<style scoped lang="scss">
.instagram-text{
    &__textarea-wrapper{
        position: relative;
        display: flex;
        textarea{
            width: 100%;
            background-color: colorOpacity(--additional-box-border, 0.4);
            border-radius: 5px 5px 0 0;
            border: 1px solid var(--additional-box);
            height: fit-content;
            padding: 10px;
            color: var(--text-color);
            resize: none;
            &:hover{
                background-color: var(--additional-box);
            }
            &:focus{
                border: 1px solid var(--border-hover);
                background-color: var(--additional-box);
            }
        }
        .count-of{
            position: absolute;
            bottom: 10px;
            right: 10px;
            font-size: var(--font-size-xs);
            color: var(--gray-color);
            &_is-over{
                color: var(--error-color-light);
            }
        }
    }
    &__button-item{
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        width: 100%;
        border-radius: 0;
        background-color: transparent;
        border: 1px solid var(--additional-box-border);
        border-bottom: 2px solid transparent;
        font-size: var(--font-size-xs);
        color: #ffffff;
        padding: 5px 10px;
        &.last-button{
            border-bottom: 2px solid var(--additional-box-border);
            border-radius: 0px 0px 5px 5px;
        }
        &:hover{
            background-color: var(--additional-box);
        }
        button{
            width: 100%;
            height: 100%;
            border-radius: 0;
            background-color: transparent;
            font-size: var(--font-size-xs);
            color: #ffffff;
            justify-content: flex-start;
            padding: 0;
            &.last-button{
                border-bottom: 2px solid var(--additional-box-border);
                border-radius: 0px 0px 5px 5px;
            }
            &:hover{
                background-color: var(--additional-box);
            }
        }
        .remove{
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 26px;
            min-width: 26px;
            width: 26px;
            height: 26px;
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
    &__add-button{
        cursor: pointer;
        padding: 10px;
        text-align: center;
        border-radius: 0px 0px 5px 5px;
        border: 1px solid var(--additional-box);
        font-size: var(--font-size-xs);
        &:hover{
            background-color: var(--additional-box);
        }
    }
}
</style>
