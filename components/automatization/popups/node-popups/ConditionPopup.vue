<template>
    <node-popup
        class="condition-popup"
        icon="condition"
        name="Условие"
    >
        <div class="popup-content__group">
            <div class="group-title">
                Настройка условия
            </div>
            <div class="group-description">
                Тут вы можете настроить условие чтобы создать
                дополнительные проверки перед следующим шагом
            </div>
            <trigger-item
                v-for="(teg, trueConditionIndex) in conditions[0].tags"
                :key="`teg-${teg}`"
                icon="subscription"
                :name="teg"
                @delete="removeCondition(conditions[0].tags, trueConditionIndex)"
            />
        </div>
        <div
            class="popup-content__group full-btns"
        >
            <button-custom
                class="f-btn"
                gray
                value="Добавить условие"
                @click="trueConditionOpen = true"
            />
        </div>
    </node-popup>
    <advanced-search
        v-if="trueConditionOpen"
        v-model="advancedSearchValue"
        :groups="searchGroups"
        @on-enter="addCondition(conditions[0].tags, $event.name)"
        @on-click="addCondition(conditions[0].tags, $event.name)"
        @on-close="trueConditionOpen = false"
    />
</template>

<script setup lang="ts">
import { useAutomatizationStore } from '~/store/automatization'
import CanvasNodeLine from '~/services/automatizationServices/CanvasNodeLine'
const { changeableObject } = storeToRefs(useAutomatizationStore())

interface conditionTagInterface {
  tags: Array<string>
  lineNode: CanvasNodeLine | null
}

const trueConditionOpen = ref<boolean>(false)

const advancedSearchValue = ref<string>('')
const searchGroups = reactive([{
  name: 'Instagram',
  groupElemets: [
    { name: 'Подписка', icon: 'subscription', type: 'subscription' }
  ]
}])

const conditions = reactive<Array<conditionTagInterface>>(
  changeableObject.value.trueConditions ? changeableObject.value.trueConditions : [{ tags: [], lineNode: null }]
)

const addCondition = (conditionType: any, teg: string) => {
  conditionType.push(teg)
  trueConditionOpen.value = false
  changeableObject.value.trueConditions = conditions
  changeableObject.value.saveNodeInfo(true)
  useAutomatizationStore().draw()
}

const removeCondition = (conditionType: any, conditionIndex: number) => {
  conditionType.splice(conditionIndex, 1)
  changeableObject.value.trueConditions = conditionType.length > 0 ? conditions : null
  changeableObject.value.saveNodeInfo(true)
  useAutomatizationStore().draw()
}

</script>

<style scoped lang="scss">
.condition-popup{

}
</style>
