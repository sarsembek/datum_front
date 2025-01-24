<template>
    <node-popup
        class="when-message"
        icon="message"
        name="Пользователь отправил сообщение"
    >
        <div
            v-for="(condition, conditionIndex) in conditions"
            :key="`condition-${conditionIndex}`"
            class="popup-content__group condition-item"
        >
            <div class="group-title">
                Если
                <span
                    class="condition-type"
                    @click="conditionIsOpen = true; conditionIsOpenIndex = conditionIndex"
                >
                    {{ condition.condition }}
                </span>
                <items-popup
                    v-if="conditionIsOpen && conditionIndex === conditionIsOpenIndex"
                    v-click-outside="() => { conditionIsOpen = false; conditionIsOpenIndex = null }"
                    class="condition-popup"
                    :items="conditionsTypes"
                    @get-item="condition.condition = $event; conditionIsOpen = false; conditionIsOpenIndex = null"
                />
            </div>
            <keyword-items v-model="condition.keywords" />
            <div
                class="condition-item__remove"
                @click.stop="removeCondition(conditionIndex)"
            >
                <svg-icon
                    icon="trash"
                    width="14"
                    height="14"
                    stroke="#FFF"
                    fill="#FFF"
                />
            </div>
            <div
                v-if="conditions.length > 1 && conditionIndex !== conditions.length - 1"
                class="condition-item__and"
            >
                А так же
            </div>
        </div>
        <div
            class="popup-content__group flex-btns"
        >
            <button-custom
                class="f-btn f-btn_fill"
                b-form="blue"
                value="Добавить условие"
                @click="addCondition()"
            />
            <button-custom
                class="f-btn"
                b-form="border"
                value="Вернуться"
                @click="emit('closeAdditionalPopup')"
            />
            <button-custom
                class="f-btn"
                gray
                value="Сохранить"
                @click="saveData()"
            />
        </div>
    </node-popup>
</template>

<script setup lang="ts">

type UserSendsMessageTrigger = {
  keywords: Array<string>;
  condition: string;
}

const props = defineProps({
  conditionsProps: {
    type: Array<UserSendsMessageTrigger>,
    default: () => [{ keywords: [''], condition: 'сообщение содержит' }]
  }
})

const conditionIsOpen = ref<boolean>(false)
const conditionIsOpenIndex = ref<number | null>(null)

const conditionsTypes = ref<String[]>([
  'сообщение содержит',
  'сообщение содержит целое слово',
  'сообщение начинается с',
  'сообщение не содержит'
])

const emit = defineEmits(['saveData', 'closeAdditionalPopup'])

const conditions = reactive<UserSendsMessageTrigger[]>(
  props.conditionsProps
    ? [...props.conditionsProps]
    : [{ keywords: [''], condition: 'сообщение содержит' }])

const addCondition = () => {
  conditions.push({
    keywords: [''],
    condition: 'сообщение содержит'
  })
}

const removeCondition = (conditionIndex: number) => {
  conditions.splice(conditionIndex, 1)
}

const saveData = () => {
  emit('saveData', conditions)
}

</script>

<style scoped lang="scss">
.when-message{
    .condition-item{
        position: relative;
        &:not(:last-child){
            padding-bottom: 25px;
            margin-bottom: 25px;
        }
        &__remove{
            position: absolute;
            top: 0;
            right: 0;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 24px;
            min-width: 24px;
            width: 24px;
            height: 24px;
            border: 1px solid colorOpacity(--error-color-light, 0.3);
            border-radius: 5px;
            background-color: colorOpacity(--error-color-light, 0.2);
            box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease-in;
            &:hover{
                scale: 1.05;
            }
        }
        &__and{
            position: absolute;
            bottom: -12px;
            left: 10px;
            border: 1px solid var(--bg-color);
            background: var(--bg-color-two);
            border-radius: 5px;
            padding: 3px 10px;
            font-size: var(--font-size-xs);
        }
        .group-title{
            position: relative;
            margin-bottom: 15px;
            .condition-type{
                cursor: pointer;
                color: var(--link);
            }
        }
    }
}
</style>
