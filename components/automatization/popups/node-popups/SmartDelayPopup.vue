<template>
    <node-popup
        class="smart-delay-popup"
        icon="smart_delay"
        name="Умная задержка"
    >
        <div class="popup-content__group">
            <swiper-custom
                v-model="activeSwiperOption"
                :options="['Интервал', 'Дата']"
            />
        </div>
        <div
            v-if="activeSwiperOption === 'Интервал'"
            class="popup-content__group"
        >
            <div class="group-title">
                Интервальная задержка
            </div>
            <div class="group-description">
                Установите время через которое будет выполнен следующий шаг.
            </div>
            <checkbox-custom
                id="checkbox-delay-time"
                class="specific-days"
                text="Выбрать конкретные дни и время"
                :checked="delayTimeCheckbox"
                @click="activateDelayTime()"
            />
            <div class="interval-time">
                <input-custom
                    v-model="timeDelay"
                    placeholder="Установите задержку"
                    type="number"
                    @input="changeTimeValue($event)"
                />
                <selection-custom
                    :options="[
                        { name: 'Секунд' },
                        { name: 'Минут' },
                        { name: 'Часов' },
                        { name: 'Суток' }
                    ]"
                    placeholder="Интервал"
                    :active-options="timeDelayActiveDays"
                    @change="changeTime($event.new_item.name)"
                />
            </div>
        </div>
        <div
            v-if="delayTimeCheckbox && activeSwiperOption === 'Интервал'"
            class="popup-content__group specific-settings"
        >
            <div class="group-title">
                Дополнительные настройки
            </div>
            <div class="group-description">
                Установите в какой период времени и по каким дням выполнять следующий шаг.
            </div>
            <div class="specific-settings__time">
                <selection-custom
                    :options="generateTime()"
                    placeholder="Длительность"
                    :active-options="timePeriodStart"
                    @change="timePeriodChange($event.new_item.name, timePeriodEnd[0].name)"
                />
                <selection-custom
                    :options="generateTime()"
                    placeholder="Длительность"
                    :active-options="timePeriodEnd"
                    @change="timePeriodChange(timePeriodStart[0].name, $event.new_item.name)"
                />
            </div>
            <selection-custom
                class="specific-settings__days"
                :multiple-type="true"
                :options="activeDays"
                placeholder="Выберите активные дни"
                @change="activeDaysChange($event.items.value)"
            />
        </div>
        <div
            v-if="activeSwiperOption === 'Дата'"
            class="popup-content__group"
        >
            <div class="group-title">
                Календарная задержка
            </div>
            <div class="group-description">
                Следующий шаг будет выполняться при наступлении этого дня и времени
            </div>
            <ClientOnly>
                <vue-date-picker
                    v-model="datePicker"
                    :disabled-dates="disablePastDates"
                    text-input
                    auto-apply
                    dark
                    @update:model-value="changeDate(datePicker)"
                />
            </ClientOnly>
        </div>
    </node-popup>
</template>

<script setup lang="ts">
import { useAutomatizationStore } from '~/store/automatization'
const { changeableObject } = storeToRefs(useAutomatizationStore())

interface OptionsInterface {
    name: string,
    full_name?: string,
    is_active: boolean
}

interface SelectionOption {
    name: string,
}

const activeSwiperOption = ref<string>(changeableObject.value.isDate ? 'Дата' : 'Интервал')
const delayTimeCheckbox = ref<boolean>(changeableObject.value.isPeriod)
const timeDelay = ref<number>(changeableObject.value.timeValue)
const timeDelayActiveDays = ref<Array<SelectionOption>>([{ name: changeableObject.value.time || 'Часов' }])
const timePeriodStart = ref<Array<SelectionOption>>([{ name: changeableObject.value?.period?.start || '08:00' }])
const timePeriodEnd = ref<Array<SelectionOption>>([{ name: changeableObject.value?.period?.end || '22:00' }])
const datePicker = ref(changeableObject.value.dateDelay || Date.now())
const activeDays = reactive<Array<OptionsInterface>>(changeableObject.value.activeDays || [
  { name: 'ПН', full_name: 'Понедельник', is_active: true },
  { name: 'ВТ', full_name: 'Вторник', is_active: true },
  { name: 'СР', full_name: 'Среда', is_active: true },
  { name: 'ЧТ', full_name: 'Четверг', is_active: true },
  { name: 'ПТ', full_name: 'Пятница', is_active: true },
  { name: 'СБ', full_name: 'Суббота', is_active: true },
  { name: 'ВС', full_name: 'Воскресенье', is_active: true }
])

const generateTime = () => {
  const timeArr = []
  for (let i = 0; i <= 23; i++) {
    timeArr.push({ name: `${i >= 10 ? i : `0${i}`}:00` })
  }
  return timeArr
}

const activateDelayTime = () => {
  delayTimeCheckbox.value = !delayTimeCheckbox.value
  changeableObject.value.isPeriod = delayTimeCheckbox.value
  timePeriodChange(timePeriodStart.value[0].name, timePeriodEnd.value[0].name)
  activeDaysChange(activeDays)
}

// Отключает возможность выбора прошедших дней
const disablePastDates = (date: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

const changeTimeValue = (newTimeValue: number) => {
  changeableObject.value.timeValue = newTimeValue
  useAutomatizationStore().draw()
}

const changeTime = (newTimeValue: string) => {
  timeDelayActiveDays.value[0].name = newTimeValue
  changeableObject.value.time = newTimeValue
  useAutomatizationStore().draw()
}

const timePeriodChange = (start: string, end: string) => {
  timePeriodStart.value[0].name = start
  timePeriodEnd.value[0].name = end
  changeableObject.value.period = { start, end }
  useAutomatizationStore().draw()
}

const activeDaysChange = (newActiveDays: OptionsInterface[]) => {
  changeableObject.value.activeDays = newActiveDays
  useAutomatizationStore().draw()
}

const changeDate = (newDate: Date) => {
  changeableObject.value.dateDelay = newDate
  useAutomatizationStore().draw()
}

watch(() => activeSwiperOption.value, (newval) => {
  if (newval === 'Дата') {
    changeableObject.value.isDate = true
    changeableObject.value.dateDelay = datePicker.value
  } else {
    changeableObject.value.isDate = false
  }
  useAutomatizationStore().draw()
})

</script>

<style scoped lang="scss">
.smart-delay-popup{
    ::v-deep .selection-custom{
        width: 100%;
    }
    ::v-deep .selection-custom__content{
        box-shadow: none;
    }
    .specific-days{
        margin-bottom: 15px;
    }
    .interval-time{
        gap: 10px;
        display: flex;
        ::v-deep .input-custom{
            width: 100%;
            .input-content{
                width: 100%;
            }
        }
    }
    .specific-settings{
        margin-top: 20px;
        &__time{
            margin-bottom: 15px;
            display: flex;
            gap: 10px;
        }
    }
}
</style>
