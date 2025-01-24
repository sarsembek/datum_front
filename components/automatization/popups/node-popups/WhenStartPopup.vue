<template>
    <node-popup
        class="when-start-popup"
        icon="lightning"
        name="Начальное условие"
    >
        <div class="popup-content__group">
            <div class="group-title">
                Настройка условий
            </div>
            <div class="group-description">
                Добавьте необходимые условия для старта этой воронки
            </div>
            <div class="triggers">
                <trigger-item
                    v-for="(trigger, triggerIndex) in triggers"
                    :key="`trigger-${triggerIndex}`"
                    :icon="trigger.type === TriggerTypeEnums.UserSendsMessage ? 'message' : 'comment'"
                    :name="trigger.name"
                    @open="openTriggerEditor(trigger)"
                    @delete="removeTrigger(triggerIndex)"
                />
            </div>
        </div>
        <div
            class="popup-content__group full-btns"
        >
            <button-custom
                class="f-btn"
                value="Добавить условие"
                @click="addConditionOpen = true"
            />
        </div>
    </node-popup>
    <UserSendsMessage
        v-if="isUserSendsMessage"
        :conditions-props="additionalPopupData"
        @save-data="saveData(TriggerTypeEnums.UserSendsMessage, 'Пользователь отправил сообщение', $event)"
        @close-additional-popup="closeAdditionalPopups()"
    />
    <UserCommented
        v-if="isUserCommented"
        :automatization-message="additionalPopupData"
        @save-data="saveData(TriggerTypeEnums.UserCommented, 'Пользователь оставил комментарий', $event)"
        @close-additional-popup="closeAdditionalPopups()"
    />
    <advanced-search
        v-if="addConditionOpen"
        v-model="advancedSearchValue"
        :groups="searchGroups"
        @on-enter="addTrigger($event)"
        @on-click="addTrigger($event)"
        @on-close="addConditionOpen = false"
    />
</template>

<script setup lang="ts">
import type { TriggerInterface } from '@/types/automatization'
import { useAutomatizationStore } from '~/store/automatization'
const { changeableObject } = storeToRefs(useAutomatizationStore())

const advancedSearchValue = ref<string>('')

// eslint-disable-next-line no-unused-vars
enum TriggerTypeEnums {
  // eslint-disable-next-line no-unused-vars
  UserSendsMessage = 'Пользователь отправил сообщение',
  // eslint-disable-next-line no-unused-vars
  UserCommented = 'Пользователь оставил комментарий',
  // eslint-disable-next-line no-unused-vars
  RefUrl = 'Реферальная ссылка'
}

const addConditionOpen = ref<boolean>(false)
const isUserSendsMessage = ref<boolean>(false)
const isUserCommented = ref<boolean>(false)
const additionalPopupData = ref<any>(null)
const changeIndex = ref<any>(null)
const searchGroups = reactive([{
  name: 'Instagram',
  groupElemets: [
    { name: TriggerTypeEnums.UserSendsMessage, icon: 'message', type: TriggerTypeEnums.UserSendsMessage },
    { name: TriggerTypeEnums.UserCommented, icon: 'comment', type: TriggerTypeEnums.UserCommented }
  ]
}])

const triggers = reactive<Array<TriggerInterface>>(changeableObject.value.triggers || [])

const addTrigger = (trigger: TriggerInterface) => {
  addConditionOpen.value = false
  if (trigger.type === TriggerTypeEnums.UserSendsMessage) { isUserSendsMessage.value = true }
  if (trigger.type === TriggerTypeEnums.UserCommented) { isUserCommented.value = true }
}

const removeTrigger = (triggerIndex: number) => {
  triggers.splice(triggerIndex, 1)
  changeTriggers()
}

const openTriggerEditor = (trigger: TriggerInterface) => {
  additionalPopupData.value = trigger.data
  changeIndex.value = triggers.findIndex(e => e === trigger)
  if (trigger.type === TriggerTypeEnums.UserSendsMessage) {
    isUserSendsMessage.value = true
  }
  if (trigger.type === TriggerTypeEnums.UserCommented) {
    isUserCommented.value = true
  }
}

const closeAdditionalPopups = () => {
  isUserSendsMessage.value = false
  isUserCommented.value = false
  changeIndex.value = null
  additionalPopupData.value = null
}

const saveData = (type: string, name: string, e: any) => {
  isUserSendsMessage.value = false
  isUserCommented.value = false
  changeIndex.value !== null ? triggers[changeIndex.value].data = e : triggers.push({ type, name, data: e })
  changeTriggers()
  changeIndex.value = null
  additionalPopupData.value = null
}

const changeTriggers = () => {
  changeableObject.value.triggers = triggers
  changeableObject.value.saveNodeInfo(true)
  useAutomatizationStore().draw()
}

</script>

<style scoped lang="scss">
.when-start-popup{
}
</style>
