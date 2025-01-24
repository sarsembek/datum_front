<template>
    <node-popup
        class="instagram-popup"
        icon="instagram"
        name="Instagram"
    >
        <div class="popup-content__group">
            <div class="group-title">
                Настройка сообщения
            </div>
            <div class="group-description">
                Тут вы можете настроить порядок сообщений и выставить
                небольшую задержку между ними.
            </div>
            <div
                v-for="(instaActiveType, instaActiveIndex) in instagramActiveTypes"
                :key="`instaActiveType-${instaActiveIndex}`"
                class="instagram-item"
            >
                <instagram-text
                    v-if="instaActiveType.type === 'text'"
                    v-model:text="instaActiveType.text"
                    v-model:buttons="instaActiveType.buttons"
                    :insta-index="instaActiveIndex"
                    @add-button="addButton(instaActiveType, instaActiveIndex)"
                    @remove-button="removeButton(instaActiveType, instaActiveIndex, $event)"
                    @change-text="updateText($event)"
                />
                <instagram-image
                    v-if="instaActiveType.type === 'image'"
                    v-model="instaActiveType.file"
                    :thumbnil-id="instaActiveIndex"
                    @delete="removeItem(instaActiveIndex)"
                    @change-image="changeImage($event, instaActiveIndex)"
                />
                <instagram-delay
                    v-if="instaActiveType.type === 'delay'"
                    v-model="instaActiveType.delay"
                    @delete="removeItem(instaActiveIndex)"
                />
            </div>
        </div>
        <div
            class="popup-content__group flex-btns"
        >
            <button-custom
                v-for="(instaType, instaIndex) in instagramNodeElementsTypes"
                :key="`instaType-${instaIndex}`"
                class="f-btn"
                b-form="border"
                :value="instaType.name"
                @click="addActiveTypes(instaType.type)"
            >
                {{ instaType.name }}
            </button-custom>
        </div>
    </node-popup>
</template>

<script setup lang="ts">
import { useAutomatizationStore } from '~/store/automatization'
const { changeableObject } = storeToRefs(useAutomatizationStore())

const addButton = (el: any, index:number) => {
  el.buttons.push({ name: 'Новая кнопка', popupOpen: false, type: null, url: '', action: null })
  changeableObject.value.changeText(el.text, el.buttons, false, index)
  changeableObject.value.saveNodeInfo(true)
  useAutomatizationStore().draw()
}

const removeButton = (el: any, instaIndex: number, buttonIndex: number) => {
  el.buttons.splice(buttonIndex, 1)
  changeableObject.value.changeText(el.text, el.buttons, false, instaIndex)
  changeableObject.value.saveNodeInfo(true)
  useAutomatizationStore().draw()
}

const changeImage = (image: string, index: number) => {
  changeableObject.value.changeImage(image, index)
  changeableObject.value.saveNodeInfo(true)
  useAutomatizationStore().draw()
}

const instagramNodeElementsTypes = reactive([
  { name: 'Текст', type: 'text' },
  { name: 'Картинка', type: 'image' },
  { name: 'Задержка', type: 'delay' }
])

const instagramActiveTypes = reactive<any>([])

onMounted(() => {
  if (changeableObject.value.nodeElements) {
    for (const el of changeableObject.value.nodeElements) {
      if (el.textElement) {
        instagramActiveTypes.push({
          type: 'text',
          buttons: el.textElement.buttons ? el.textElement.buttons : [],
          text: el.textElement.isPlaceholder ? '' : el.textElement.text
        })
      }
      if (el.imageElement) {
        instagramActiveTypes.push({ type: 'image', file: el.imageElement.src })
      }
      if (el.delayElement) {
        instagramActiveTypes.push({
          type: 'delay',
          delay: el.delayElement.delayTime,
          popupOpen: false
        })
      }
    }
  }
})

const addActiveTypes = (type: any) => {
  if (type === 'text') {
    instagramActiveTypes.push({ type, buttons: [], text: '' })
    changeableObject.value.addText(null, [], true)
  }
  if (type === 'image') {
    instagramActiveTypes.push({ type, file: '' })
    changeableObject.value.addImage('')
  }
  if (type === 'delay') {
    instagramActiveTypes.push({ type, delay: 30, popupOpen: false })
    changeableObject.value.addDelay(30)
  }
  changeableObject.value.saveNodeInfo(true)
  useAutomatizationStore().draw()
}

const removeItem = (itemIndex: number) => {
  instagramActiveTypes.splice(itemIndex, 1)
  changeableObject.value.removeElement(itemIndex)
  changeableObject.value.saveNodeInfo(true)
  useAutomatizationStore().draw()
}

let debounceTimer: number | null = null

const updateText = (e: any) => {
  changeableObject.value.nodeElements[e.index].textElement.isPlaceholder = false
  changeableObject.value.nodeElements[e.index].textElement.text = e.text
  if (!changeableObject.value.nodeElements[e.index].textElement.text) {
    changeableObject.value.nodeElements[e.index].textElement.isPlaceholder = true
  }
  changeableObject.value.nodeElements[e.index].textElement.buttons = e.buttons

  // Проверка, что функция не вызывалась в течение последних 500 мс
  if (debounceTimer) {
    clearTimeout(debounceTimer) // Сбросить предыдущий таймер
  }

  // Установить новый таймер на 500 мс
  debounceTimer = window.setTimeout(() => {
    changeableObject.value.saveNodeInfo(true) // Выполнить сохранение
    useAutomatizationStore().draw() // Перерисовать интерфейс
  }, 500)
}

</script>

<style lang="scss">
.instagram-popup{
    .instagram-item{
        &:not(:last-child) {
            margin-bottom: 15px;
        }
    }
}
</style>
