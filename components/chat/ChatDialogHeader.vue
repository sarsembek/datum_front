<template>
    <div class="chat-dialog-header">
        <div class="chat-dialog-header__username">
            {{ activeClient.username ? activeClient.username : 'Неизвестный контакт' }}
        </div>
        <div class="chat-dialog-header__buttons">
            <div
                class="chat-header-btn toggle-info"
                :class="{ 'toggle-info_active': showClientInfo }"
                @click="useLiveChatStore().toggleShowInfo()"
            >
                <svg-icon
                    icon="toggle"
                    width="24"
                    height="24"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useLiveChatStore } from '~/store/chat'
const { showClientInfo, activeClient } = storeToRefs(useLiveChatStore())
</script>

<style lang="scss">
.chat-dialog-header{
    display: flex;
    justify-content: space-between;
    padding: 15px 20px;
    border-bottom: 1px solid #2d3132;
    // box-shadow: 0 1px 3px 2px rgba(0, 0, 0, 0.25);
    .chat-header-btn{
        cursor: pointer;
        &.toggle-info{
            &_active{
                .svg-content path {
                    fill: #3DC8F4 !important;
                }
            }
        }
    }
}
</style>
