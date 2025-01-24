<template>
    <div class="chat-page">
        <chat-users />
        <chat-dialog />
        <Transition name="slide-fade">
            <instagram-card-popup
                v-if="activeClient && showClientInfo"
                :client="activeClient"
            />
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { useLiveChatStore } from '~/store/chat'
const { showClientInfo, activeClient } = storeToRefs(useLiveChatStore())

// const router = useRouter()
// router.push('/cms')

</script>

<style scoped lang="scss">
.chat-page{
    display: flex;
    justify-content: space-between;
    height: 100%;
    overflow: hidden;
    .instagram-card-popup{
        border-left: 1px solid #2d3132;
    }
}

.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.4s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  margin-right: -350px;
  opacity: 0;
}

</style>
