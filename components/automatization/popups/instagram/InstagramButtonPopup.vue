<template>
    <div class="instagram-button-popup">
        <div class="instagram-button-popup__group">
            <div class="group-title">
                Название
            </div>
            <div class="group-description">
                Укажите текст кнопки. Этот текст увидит пользователь
            </div>
            <input-custom
                v-model="proxyButton.name"
                class="border-input"
            />
        </div>
        <div
            v-if="!proxyButton.type"
            class="instagram-button-popup__group"
        >
            <div class="group-title">
                Действие кнопки
            </div>
            <div class="group-description">
                Укажите что будет происходить при нажатии пользователем на кнопку
            </div>
            <div class="button-actions">
                <div
                    v-for="(action, actionIndex) in buttonActions"
                    :key="`button-action-${actionIndex}`"
                    class="action"
                    @click="selectButtonType(action)"
                >
                    <svg-icon
                        :icon="action.icon"
                        additional-folder="instaPopup"
                        width="20"
                        height="20"
                    />
                    <div class="name">
                        {{ action.name }}
                    </div>
                </div>
            </div>
        </div>
        <div
            v-if="proxyButton.type === 'instagram'"
            class="instagram-button-popup__group"
        >
            <div class="group-title">
                Instagram
            </div>
            <div class="group-description">
                Настройте новый instagram блок или проведите линию от кнопки к нужному instagram блоку
            </div>
            <div class="step-tipe">
                <svg-icon
                    :icon="getIconByType(proxyButton.type)"
                    additional-folder="instaPopup"
                    width="20"
                    height="20"
                />
                <div class="name">
                    {{ proxyButton.type }}
                </div>
            </div>
        </div>
        <div
            v-if="proxyButton.type === 'website'"
            class="instagram-button-popup__group"
        >
            <div class="group-title">
                Открыть сайт
            </div>
            <div class="group-description">
                Введите url сайта, который будет открываться при нажатии на кнопку
            </div>
            <div
                v-if="!validURL() && proxyButton.url"
                class="group-error"
            >
                <div class="group-error__dot" />
                Неверный url. Ссылка будет недоступна. Советуем проверить адрес
            </div>
            <div class="website-type">
                <input-custom
                    v-model="proxyButton.url"
                    class="border-input"
                    :i-error="(Boolean(proxyButton.url) && !validURL())"
                    @input="validURL()"
                />
            </div>
        </div>
        <div
            v-if="proxyButton.type"
            class="instagram-button-popup__group"
        >
            <button-custom
                class="f-btn"
                value="Сменить тип кнопки"
                @click="changeButtonType()"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { textButtonInterface } from '@/types/automatization'
import { useAutomatizationStore } from '~/store/automatization'
const { changeableObject } = storeToRefs(useAutomatizationStore())

const emit = defineEmits(['update:button', 'delete'])
const props = defineProps({
  button: { type: Object as PropType<textButtonInterface>, required: true },
  buttonIndex: { type: Number, required: true },
  instaIndex: { type: Number, required: true }
})

const proxyButton = computed({
  get: () => props.button,
  set: (newValue: textButtonInterface) => {
    emit('update:button', newValue)
  }
})

const buttonActions = reactive([
  { icon: 'instagram', name: 'Instagram', type: 'instagram' },
  { icon: 'website', name: 'Открыть сайт', type: 'website' }
])

const selectButtonType = (action: any) => {
  proxyButton.value.type = action.type
  proxyButton.value.action = action
  if (proxyButton.value.type === 'instagram') {
    addInstagramButton()
  }
}

const changeButtonType = () => {
  proxyButton.value.type = ''
}

const addInstagramButton = async () => {
  const newObj = await useAutomatizationStore().createNode(
    'instagram', changeableObject.value.x + 240, changeableObject.value.y)
  changeableObject.value.addButtonLine(newObj, props.instaIndex, props.buttonIndex)
}

const getIconByType = (type: string): string => {
  const icon = buttonActions.find(e => e.type === type)?.icon
  return icon || ''
}

const validURL = () => {
  const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i') // fragment locator
  return !!pattern.test(proxyButton.value.url.trim())
}
</script>

<style scoped lang="scss">
.instagram-button-popup{
    background-color: var(--bg-color-three);
    border-radius: 5px;
    box-shadow: 0px 0px 8px 0px rgba(43, 41, 41, 0.25);
    z-index: 10;
    position: absolute;
    padding: 10px;
    left: 0;
    width: 100%;
    &__title{
        margin-bottom: 15px;
    }
    &__group{
        &:not(:last-child){
            border-bottom: 1px dashed colorOpacity(--border-color-hover, 0.2);
            padding-bottom: 15px;
            margin-bottom: 15px;
        }
        .f-btn{
            font-size: var(--font-size);
        }
        .step-tipe{
            display: flex;
            align-items: center;
            gap: 10px;
            text-transform: capitalize;
            padding: 10px;
            background: colorOpacity(--additional-box-border, 0.7);
            border-radius: 5px;
        }
    }
    ::v-deep .input-custom{
        width: 100%;
        .input-content{
            width: 100%;
        }
    }
    .button-actions{
        display: flex;
        flex-direction: column;
        gap: 10px;
        .action{
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: colorOpacity(--additional-box-border, 0.4);
            border-radius: 5px;
            &:hover{
                background: var(--additional-box);
            }
        }
    }
}
</style>
