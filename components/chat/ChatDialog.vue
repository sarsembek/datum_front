<template>
    <div
        v-if="activeClient"
        class="chat-dialog"
    >
        <chat-dialog-header />
        <chat-dialog-content>
            <chat-message
                v-for="testMessage in testMessages"
                :key="`testMessage-${testMessage.id}`"
                :user-message="testMessage.userMessage"
                :message-type="testMessage.messageType"
                :is-client-message="testMessage.isClientMessage"
            />
        </chat-dialog-content>
        <chat-message-textarea />
    </div>
    <div
        v-else
        class="chat-dialog chat-dialog__empty"
    >
        <img
            src="/chat-dialog-bg.png"
            alt="chat-dialog-bg"
        >
        <div class="empty-text">
            Выберите беседу, чтобы начать общение
        </div>
    </div>
</template>

<script setup lang="ts">
import { useLiveChatStore } from '~/store/chat'
const { activeClient } = storeToRefs(useLiveChatStore())

const testMessages = [
  { id: 1, userMessage: { message: 'Тестовое сообщениеas' }, messageType: 'default', isClientMessage: true },
  { id: 2, userMessage: { message: 'Тестовое сообщение 2' }, messageType: 'default', isClientMessage: false },
  { id: 3, userMessage: { message: 'Тестовое сообщение 3' }, messageType: 'default', isClientMessage: true },
  { id: 4, userMessage: { message: 'Тестовое сообщение 4' }, messageType: 'default', isClientMessage: false }
]
</script>

<style scoped lang="scss">
.chat-dialog{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    // box-shadow: inset 0 0px 5px 0px rgba(0, 0, 0, 0.25);
    &__empty{
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        img{
            margin-bottom: 40px;
        }
        .empty-text{
            font-weight: 600;
            font-size: var(--font-size-md);
        }
    }
}
</style>
