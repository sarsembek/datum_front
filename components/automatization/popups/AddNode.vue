<template>
    <div class="add-node">
        <div
            class="add-node__button"
            @click="addNodeOpen = !addNodeOpen"
        >
            +
        </div>
        <div
            v-if="addNodeOpen"
            class="add-node__popup"
        >
            <div
                v-click-outside="() => addNodeOpen = false"
                class="action-popup"
            >
                <div
                    v-for="actionGroup in actionGroups"
                    :key="`actionGroup-${actionGroup.id}`"
                    class="action-popup__group"
                >
                    <div class="group-name">
                        {{ actionGroup.name }}
                    </div>
                    <div class="action-group-items">
                        <div
                            v-for="actionItem in actionGroup.actionItems"
                            :key="`actionItem-${actionItem.id}`"
                            class="action-item"
                            @click="emit('createNode', actionItem.type)"
                        >
                            <div class="action-item__icon">
                                <svg-icon
                                    :icon="actionItem.icon"
                                    width="24"
                                    height="24"
                                />
                            </div>
                            <div class="action-item__content">
                                <div class="name">
                                    {{ actionItem.name }}
                                </div>
                                <div class="description">
                                    {{ actionItem.description }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['createNode'])

const addNodeOpen = ref<boolean>(false)

const actionGroups = reactive([
  {
    id: 1,
    name: 'Контент',
    actionItems: [
      {
        id: 1,
        icon: 'instagram',
        name: 'Instagram',
        type: 'instagram',
        description: `
        Используется для отправки сообщений, фото, шаблонов, а
        так же есть возможность выставить небольшую задержку между сообщениями.`
      }
    ]
  },
  {
    id: 2,
    name: 'Логика',
    actionItems: [
      {
        id: 2,
        icon: 'randomizer',
        name: 'Рандомайзер',
        type: 'randomizer',
        description: `
        В основном используется, чтобы сделать ответы более уникальными.
        Можно добавить до 6 ответлений.`
      },
      {
        id: 3,
        icon: 'smart_delay',
        name: 'Умная задержка',
        type: 'smart_delay',
        description: `
        Используется задержки перед следующим шагом. Можно выставить как время так и определенную дату.`
      },
      {
        id: 4,
        icon: 'condition',
        type: 'condition',
        name: 'Условие',
        description: `
        Набор условий . Если выбранный набор соответствует
        пользователю, то ведем по 1 ветке, иначе по другой.`
      }
    ]
  }
])

</script>

<style scoped lang="scss">
.add-node{
    position: absolute;
    right: 0;
    top: 0;
    &__button{
        user-select: none;
        cursor: pointer;
        padding-top: 3px;
        padding-right: 15px;
        padding-left: 15px;
        padding-bottom: 7px;
        position: absolute;
        right: 15px;
        top: 15px;
        border-radius: 10px;
        font-size: 40px;
        font-weight: 300;
        background-color: black;
    }
    &__popup{
        .action-popup{
            display: flex;
            flex-direction: column;
            gap: 20px;
            position: absolute;
            right: 40px;
            top: 40px;
            width: 360px;
            height: 510px;
            overflow: auto;
            background-color: var(--bg-color-two);
            border-radius: 10px;
            padding: 20px 15px;
            z-index: 100;
            &__group{
                .group-name{
                    padding: 0 5px;
                    margin-bottom: 15px;
                }
                .action-group-items{
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    width: 100%;
                    height: fit-content;
                    border: var(--additional-bg);
                    .action-item{
                        border-radius: 10px;
                        padding: 10px;
                        display: flex;
                        gap: 10px;
                        transition: all 0.2s ease-in;
                        &__icon{
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-width: 40px;
                            min-height: 40px;
                            height: 40px;
                            width: 40px;
                            border: 1px solid colorOpacity(--border-color-hover, 0.3);
                            border-radius: 5px;
                            background-color: colorOpacity(--border-color-hover, 0.2);
                            box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.2);
                        }
                        &__content{
                            .name{
                                margin-bottom: 7px;
                            }
                            .description{
                                font-size: var(--font-size-xs);
                            }
                        }
                        &:hover{
                            cursor: pointer;
                            background: colorOpacity(--border-color-hover, 0.1);
                        }
                    }
                }
            }
        }
    }
}

</style>
