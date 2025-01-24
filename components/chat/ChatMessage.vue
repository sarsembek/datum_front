<template>
    <div
        class="chat-message"
        :class="isClientMessage ? 'chat-message_left' : 'chat-message_right'"
    >
        <img
            class="chat-message__user-image"
            alt="photo"
            loading="lazy"
            :src="getImageUrl()"
        >
        <div
            v-if="messageType === 'default'"
            class="default-message"
            :class="isClientMessage ? 'default-message_left' : 'default-message_right'"
        >
            {{ userMessage.message }}
        </div>
        <div
            v-if="messageType === 'voice'"
            class="voice-message"
        >
            dssdfsd
        </div>
        <div
            v-if="messageType === 'template'"
            class="template-message"
        >
            dsfsdf
        </div>
    </div>
</template>

<script setup lang="ts">
import { useLiveChatStore } from '~/store/chat'
const { activeClient } = storeToRefs(useLiveChatStore())

const props = defineProps({
  userMessage: { type: Object, required: true },
  messageType: { type: String, default: 'default' },
  isClientMessage: { type: Boolean, default: true }
})

const getImageUrl = () => {
  const picture = props.isClientMessage ? activeClient.value.profile_pic : null
  return picture || '/fb-profile.png'
}
</script>

<style scoped lang="scss">
.chat-message{
    display: flex;
    gap: 20px;
    &_right{
        flex-direction: row-reverse;
    }
    &__user-image{
        width: 50px;
        height: 50px;
        border-radius: 6px;
        object-fit: cover;
    }
    .default-message{
        max-width: 400px;
        background-color: #2f333e;
        border-radius: 10px 10px 10px 0;
        position: relative;
        padding: 10px;
        &_left{
            &::before {
                content: '';
                position: absolute;
                bottom: 0;
                left: -14px;
                width: 0;
                height: 0;
                border-top: 14px solid transparent;
                border-right: 14px solid #2f333e;
            }
        }
        &_right{
            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                right: -10px;
                width: 0;
                height: 0;
                border-top: 14px solid transparent;
                border-left: 14px solid #2f333e;
            }
        }
    }
}
</style>
