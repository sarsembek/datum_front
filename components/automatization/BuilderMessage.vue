<template>
    <div class="builder-message">
        <div class="builder-message__image">
            <img
                src="@img/instagram_bg.jpg"
                width="400"
                height="200"
                alt="instagram_bg"
            >
            <div class="messages">
                <div class="messages__message-item">
                    Спасибо вам!
                </div>
                <div class="messages__message-item answer">
                    Рад был помочь.
                </div>
            </div>
        </div>
        <div class="builder-message__help-text">
            Реагируйте автоматически на комментарии, включающие ключевые слова
            или определенные фразы, создавая впечатление живого общения.
        </div>
        <div class="builder-message__buttons">
            <div
                v-for="(automatizationMessage, automatizationMessageIndex) in automatizationMessages.slice(
                    automatizationMessagesPage === 1 ? 0 : (5 * automatizationMessagesPage) - 5,
                    5 * automatizationMessagesPage
                )"
                :key="`automatizationMessage-${automatizationMessage.id}`"
                ref="automatizationMessageRefs"
                class="builder-btn"
                @click="emit('editAutomatizationMessage', automatizationMessage)"
            >
                <p>
                    {{ automatizationMessage.name }}
                </p>
                <svg-icon
                    class="builder-btn__menu-icon"
                    icon="menu"
                    width="24"
                    height="24"
                    @click.stop="openMenu(automatizationMessageIndex, automatizationMessage.id)"
                />
                <Teleport to="body">
                    <div
                        v-if="btnMenuIsOpen"
                        v-click-outside="() => {
                            btnMenuIsOpen = false;
                            activeMenuElement = null;
                            activeMenuId = null;
                            activeMenuIndex = null
                        }"
                        class="builder-btn__menu"
                        :style="menuStyles"
                    >
                        <div
                            class="menu-item"
                            @click.stop="deleteAutomatization()"
                        >
                            <svg-icon
                                icon="delete"
                                width="24"
                                height="24"
                                fill="#eb5038"
                            />
                            Удалить
                        </div>
                    </div>
                </Teleport>
            </div>
            <div class="row-btns">
                <div
                    v-if="automatizationMessagesPage !== 1"
                    class="builder-btn show-all-button"
                    @click="automatizationMessagesPage -= 1"
                >
                    Назад
                </div>
                <div
                    v-if="
                        automatizationMessages.length > 3 &&
                            automatizationMessages.length / 5 > automatizationMessagesPage
                    "
                    class="builder-btn show-all-button"
                    @click="automatizationMessagesPage += 1"
                >
                    Дальше
                </div>
            </div>
            <div
                class="builder-btn new-button"
                @click="emit('createAnswer')"
            >
                Создать новый ответ на коментарии
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useFbStore } from '~/store/integrations'
const { getAutomatizationMessages } = useFbStore()
const { automatizationMessages } = storeToRefs(useFbStore())

const automatizationMessagesPage = ref<number>(1)
const btnMenuIsOpen = ref<boolean>(false)
const activeMenuElement = ref<HTMLElement | null>(null)
const activeMenuId = ref<number | null>(null)
const automatizationMessageRefs = ref<HTMLElement[]>([])
const menuStyles = ref({ top: '0px', left: '0px' })

if (automatizationMessages.value && automatizationMessages.value.length === 0) {
  await getAutomatizationMessages()
}

const emit = defineEmits(['createAnswer', 'editAutomatizationMessage'])

const openMenu = (btnIndex: number, btnId: number) => {
  if (automatizationMessageRefs.value[btnIndex] !== activeMenuElement.value) {
    btnMenuIsOpen.value = true
    activeMenuId.value = btnId
    activeMenuElement.value = automatizationMessageRefs.value[btnIndex]
    updateMenuPosition()
    window.addEventListener('scroll', updateMenuPosition, true)
  } else {
    btnMenuIsOpen.value = false
    activeMenuId.value = null
    activeMenuElement.value = null
    window.removeEventListener('scroll', updateMenuPosition, true)
  }
}

const updateMenuPosition = () => {
  const rect = activeMenuElement.value.getBoundingClientRect()
  if (rect) {
    menuStyles.value = {
      top: `${rect.bottom + window.scrollY - 40}px`,
      left: `${(rect.left + rect.width + 10) + window.scrollX}px`
    }
  }
}

const deleteAutomatization = async () => {
  await useAuthFetch('/api/v1/integrations/instagram-automatization-message/', {
    method: 'delete',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: { automatization_message_id: activeMenuId.value }
  })
  activeMenuElement.value.remove()
  btnMenuIsOpen.value = false
  activeMenuId.value = null
  activeMenuElement.value = null
}

</script>

<style scoped lang="scss">
.builder-message{
    position: relative;
    width: 500px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border: 1px solid #2d2d2d;
    border-radius: 10px;
    padding: 15px;
    background: #131718;
    &__image{
        position: relative;
        border-radius: 5px;
        overflow: hidden;
        img{
            object-fit: cover;
            width: 100%;
            height: 100%;
        }
        .messages{
            position: absolute;
            right: 10px;
            bottom: 10px;
            display: flex;
            align-items: flex-end;
            flex-direction: column;
            gap: 10px;
            border-radius: 5px;
            padding: 5px 10px;
            color: #FFFFFF;
            &__message-item{
                padding: 5px 10px;
                border-radius: 5px;
                text-align: center;
                width: fit-content;
                background: linear-gradient(135deg, rgba(0, 145, 226, 0.6) 0%, rgba(233, 100, 255, 0.6) 100%);
                &.answer{
                    background: linear-gradient(135deg, rgba(68, 91, 104, 0.8) 0%, rgba(123, 132, 211, 0.8) 100%);
                }
            }
        }
    }
    &__buttons{
        display: flex;
        flex-direction: column;
        gap: 10px;
        .row-btns{
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .builder-btn{
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            width: 100%;
            padding: 0 10px;
            background: #1a1e1f;
            border-radius: 5px;
            transition: all 0.3s ease;
            height: 34px;
            &:hover{
               background: var(--link);
            }
            p{
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            &__menu-icon{
                z-index: 2;
                &:hover{
                    transition: all 0.2s ease-in-out;
                    transform: scale(1.2);
                }
            }
            &__menu{
                position: absolute;
            }
        }
        .show-all-button{
            display: block;
            text-align: center;
            align-content: center;
        }
        .new-button{
            display: block;
            text-align: center;
            align-content: center;
            background: var(--additional-box-blue);
            &:hover{
               opacity: 0.8;
            }
        }
    }
}

.builder-btn__menu{
    z-index: 500;
    right: 0px;
    position: absolute;
    border-radius: 8px;
    background: var(--additional-box);
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 200px;
    overflow: hidden;
    .menu-item{
        width: 100%;
        cursor: pointer;
        padding: 7px 0;
        display: flex;
        align-items: center;
        gap: 5px;
        justify-content: center;
        &:hover{
            background-color: var(--link);
        }
    }
}
</style>
