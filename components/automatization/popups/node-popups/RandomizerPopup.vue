<template>
    <node-popup
        class="randomizer-popup"
        icon="randomizer"
        name="Рандомайзер"
    >
        <div class="popup-content__group randomizer-popup__sliders">
            <div class="group-title">
                Настройка рандома
            </div>
            <div class="group-description">
                Тут вы можете настроить вероятность срабатывания.
                Общий процент должен быть равен 100.
            </div>
            <slider-custom
                v-for="(slider, slideIndex) in sliders"
                :key="`slider-${slideIndex}`"
                v-model="slider.percent"
                :can-removed="true"
                :icon-name="alphabet[slideIndex]"
                :name="`Слайдер ${slider.name}`"
                @delete="removeSlider(slideIndex)"
            />
        </div>
        <div
            class="popup-content__group flex-btns"
        >
            <button-custom
                class="f-btn"
                b-form="border"
                border
                value="Установить равные %"
                @click="autoSplitPercents()"
            />
            <button-custom
                class="f-btn"
                gray
                border
                value="Добавить слайдер"
                @click="addSlider()"
            />
        </div>
    </node-popup>
</template>

<script setup lang="ts">
import { useAutomatizationStore } from '~/store/automatization'
const { changeableObject } = storeToRefs(useAutomatizationStore())

interface SlideItemInterface {
  name: string,
  percent: number,
  lineNode?: any
}

const alphabet = ['A', 'B', 'C', 'D', 'E', 'F']
const slidersError = ref<boolean>(false)
const slidersErrorText = ref<string>('')
let sliders = reactive<Array<SlideItemInterface>>(changeableObject.value.randomElements)

watch(() => changeableObject.value.randomElements, (newval) => {
  sliders = newval
})

const addSlider = () => {
  let slidersVal = 0
  for (const slider of sliders) {
    slidersVal += Number(slider.percent)
  }
  const addValue = slidersVal < 100 ? 100 - slidersVal : 0
  const nodeName = alphabet[sliders.length]
  if (sliders.length < alphabet.length) {
    changeableObject.value.addRandom(nodeName, addValue)
    useAutomatizationStore().draw()
  }
  checkTotalValue()
}

const removeSlider = (index: number) => {
  changeableObject.value.removeRandom(index)
  useAutomatizationStore().draw()
  checkTotalValue()
}

const checkTotalValue = () => {
  let slidersVal = 0
  for (const slider of sliders) {
    slidersVal += Number(slider.percent)
  }
  if (slidersVal > 100 || slidersVal < 100) {
    slidersError.value = true
    slidersErrorText.value = `Общее значение должно раввняться 100 % \n Текущее значение: ${slidersVal}`
  } else {
    slidersError.value = false
  }
  changeableObject.value.changeRandomValues(sliders)
  useAutomatizationStore().draw()
}

const autoSplitPercents = () => {
  const splitVal = Math.floor(100 / sliders.length)
  let totalSplitVal = 0
  for (const slider of sliders) {
    slider.percent = splitVal
    totalSplitVal += splitVal
  }
  if (totalSplitVal < 100) {
    let remainingValue = 100 - totalSplitVal
    if (remainingValue > 1) {
      for (const slider of sliders) {
        slider.percent += Math.ceil(remainingValue / sliders.length)
        remainingValue -= Math.ceil(remainingValue / sliders.length)
        if (remainingValue === 0) { break }
      }
    } else {
      sliders[sliders.length - 1].percent += 100 - totalSplitVal
    }
  }
  checkTotalValue()
}
</script>

<style scoped lang="scss">
.randomizer-popup{
    &__sliders{
        .slider-custom{
            &:not(:last-child){
                margin-bottom: 10px;
            }
        }
    }
}
</style>
